const fetch = require('node-fetch');

module.exports = function registerApiRoutes(app, errorCounts) {
  // GitHub user
  app.get('/api/github/user/:username', async (req, res) => {
    const { username } = req.params;
    try {
      const response = await fetch(`https://api.github.com/users/${username}`);
      if (!response.ok) {
        errorCounts.user_details++;
        return res.status(response.status).json({ error: 'User not found' });
      }
      const data = await response.json();
      res.json(data);
    } catch (err) {
      errorCounts.user_details++;
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GitHub repos
  app.get('/api/github/repos/:username', async (req, res) => {
    const { username } = req.params;
    try {
      const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=100`);
      if (!response.ok) {
        errorCounts.user_repos++;
        return res.status(response.status).json({ error: 'Repos not found' });
      }
      const data = await response.json();
      res.json(data);
    } catch (err) {
      errorCounts.user_repos++;
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GitHub events
  app.get('/api/github/events/:username', async (req, res) => {
    const { username } = req.params;
    try {
      const response = await fetch(`https://api.github.com/users/${username}/events?per_page=30`);
      if (!response.ok) {
        errorCounts.user_events++;
        return res.status(response.status).json({ error: 'Events not found' });
      }
      const data = await response.json();
      res.json(data);
    } catch (err) {
      errorCounts.user_events++;
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GitHub followers
  app.get('/api/github/followers/:username', async (req, res) => {
    const { username } = req.params;
    try {
      const response = await fetch(`https://api.github.com/users/${username}/followers?per_page=30`);
      if (!response.ok) {
        errorCounts.user_followers++;
        return res.status(response.status).json({ error: 'Followers not found' });
      }
      const data = await response.json();
      res.json(data);
    } catch (err) {
      errorCounts.user_followers++;
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // GitHub following
  app.get('/api/github/following/:username', async (req, res) => {
    const { username } = req.params;
    try {
      const response = await fetch(`https://api.github.com/users/${username}/following?per_page=30`);
      if (!response.ok) {
        errorCounts.user_following++;
        return res.status(response.status).json({ error: 'Following not found' });
      }
      const data = await response.json();
      res.json(data);
    } catch (err) {
      errorCounts.user_following++;
      res.status(500).json({ error: 'Internal server error' });
    }
  });
};