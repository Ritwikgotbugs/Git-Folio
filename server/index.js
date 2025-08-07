const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const client = require('prom-client');
const registerApiRoutes = require('./routes');

const app = express();
const PORT = 4000;

app.use(cors());

// Prometheus metrics setup
const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status']
});

const responseTimeHistogram = new client.Histogram({
  name: 'http_response_time_ms',
  help: 'Response time in ms',
  labelNames: ['method', 'route', 'status']
});

const errorCounter = new client.Counter({
  name: 'http_errors_total',
  help: 'Total number of HTTP errors',
  labelNames: ['method', 'route', 'status']
});

client.collectDefaultMetrics();

// Middleware to track metrics for all requests
app.use((req, res, next) => {
  const startHrTime = process.hrtime();

  res.on('finish', () => {
    const [sec, nano] = process.hrtime(startHrTime);
    const durationMs = (sec * 1000 + nano / 1e6).toFixed(2);

    const labels = {
      method: req.method,
      route: req.route?.path || req.path,
      status: res.statusCode
    };

    httpRequestCounter.inc(labels);
    responseTimeHistogram.observe(labels, parseFloat(durationMs));

    if (res.statusCode >= 400) {
      errorCounter.inc(labels);
    }
  });

  next();
});

// In-memory counters for each API route
const apiRequestCounts = {
  user_details: 0,
  user_repos: 0,
  user_events: 0,
  user_followers: 0,
  user_following: 0,
};
const methodCounts = {};
const statusCounts = {};
const perUserCounts = {};
const responseTimes = {
  user_details: [],
  user_repos: [],
  user_events: [],
  user_followers: [],
  user_following: [],
};
const errorCounts = {
  user_details: 0,
  user_repos: 0,
  user_events: 0,
  user_followers: 0,
  user_following: 0,
};
const serverStart = Date.now();

function getRouteType(path) {
  if (path.startsWith('/api/github/user/')) return 'user_details';
  if (path.startsWith('/api/github/repos/')) return 'user_repos';
  if (path.startsWith('/api/github/events/')) return 'user_events';
  if (path.startsWith('/api/github/followers/')) return 'user_followers';
  if (path.startsWith('/api/github/following/')) return 'user_following';
  return null;
}

// Additional middleware for custom metrics
app.use((req, res, next) => {
  const routeType = getRouteType(req.path);
  if (routeType) {
    apiRequestCounts[routeType]++;
    methodCounts[req.method] = (methodCounts[req.method] || 0) + 1;
    const user = req.params.username || (req.path.split('/').pop() || 'unknown');
    perUserCounts[user] = (perUserCounts[user] || 0) + 1;
    const start = Date.now();
    res.on('finish', () => {
      const duration = Date.now() - start;
      responseTimes[routeType].push(duration);
      statusCounts[res.statusCode] = (statusCounts[res.statusCode] || 0) + 1;
    });
  }
  next();
});

app.get('/', async (req, res) => {
  res.send('Welcome to Git Port.');
});

// Prometheus metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

app.get('/metrics/clean', (req, res) => {
  const total = Object.values(apiRequestCounts).reduce((sum, v) => sum + v, 0);
  const averageResponseTimeMs = {};
  for (const key in responseTimes) {
    const arr = responseTimes[key];
    averageResponseTimeMs[key] = arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;
  }
  res.json({
    total,
    details: { ...apiRequestCounts },
    methods: { ...methodCounts },
    statusCodes: { ...statusCounts },
    perUser: { ...perUserCounts },
    averageResponseTimeMs,
    errors: { ...errorCounts },
    server: {
      version: '1.0.0',
      env: process.env.NODE_ENV || 'development',
      uptimeSeconds: Math.floor((Date.now() - serverStart) / 1000),
    },
    lastUpdated: new Date().toISOString(),
  });
});


registerApiRoutes(app, errorCounts);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});