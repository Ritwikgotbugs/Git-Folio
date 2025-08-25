const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const client = require('prom-client');
const registerApiRoutes = require('./routes');
require('dotenv').config();

const app = express();
const PORT = 4000;

app.use(cors());

// =================== Prometheus Metrics Setup ===================
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

const githubApiCallsSuccessGauge = new client.Gauge({
  name: 'github_api_calls_success_total',
  help: 'Total successful GitHub API calls (status 304 and 200)'
});

const githubApiCallsFailedGauge = new client.Gauge({
  name: 'github_api_calls_failed_total',
  help: 'Total failed GitHub API calls (status >= 400)'
});

const githubRateLimitRemainingGauge = new client.Gauge({
  name: 'github_rate_limit_remaining',
  help: 'Remaining GitHub API calls for the current token'
});
const githubRateLimitGauge = new client.Gauge({
  name: 'github_rate_limit',
  help: 'Total GitHub API calls for the current token'
});


client.collectDefaultMetrics();

// =================== Middleware to Track All Requests ===================
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

// =================== In-memory tracking ===================
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

// =================== GitHub Fetch Wrapper ===================
async function fetchGithub(url) {
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      'User-Agent': 'GitPort-App'
    }
  });

  const total = parseInt(response.headers.get('x-ratelimit-limit'));
  if (!isNaN(total)) {
    githubRateLimitGauge.set(total);
  }
  const remaining = parseInt(response.headers.get('x-ratelimit-remaining'));
  if (!isNaN(remaining)) {
    githubRateLimitRemainingGauge.set(remaining);
  }


  return response;
}

// =================== Additional Tracking Middleware ===================
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

// =================== Routes ===================
app.get('/', async (req, res) => {
  res.send('Welcome to Git Port.');
});

// Prometheus metrics endpoint
app.get('/metrics', async (req, res) => {
  const totalSuccess = (statusCounts[200] || 0) + (statusCounts[304] || 0);
  githubApiCallsSuccessGauge.set(totalSuccess);

  const totalFailures = Object.entries(statusCounts)
    .filter(([code]) => parseInt(code) >= 500)
    .reduce((sum, [, count]) => sum + count, 0);
  githubApiCallsFailedGauge.set(totalFailures);

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
    statusCodes: { ...statusCounts },
    averageResponseTimeMs,
    server: {
      version: '1.0.0',
      env: process.env.NODE_ENV || 'development',
      uptimeSeconds: Math.floor((Date.now() - serverStart) / 1000),
    },
    lastUpdated: new Date().toISOString(),
  });
});

// Register API routes with our fetch wrapper
registerApiRoutes(app, errorCounts,fetchGithub);

// =================== Start Server ===================
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
