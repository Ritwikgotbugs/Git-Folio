module.exports = function registerApiRoutes(app, errorCounts, fetchGithub) {
  const tokens = process.env.GITHUB_TOKENS
    ? process.env.GITHUB_TOKENS.split(",").map(t => t.trim())
    : [];

  let currentTokenIndex = 0;

  const getGitHubHeaders = () => {
    if (tokens.length === 0) {
      throw new Error("No GitHub tokens configured");
    }
    return {
      'User-Agent': 'GitPort-App',
      Authorization: `Bearer ${tokens[currentTokenIndex]}`
    };
  };

  const rotateToken = () => {
    currentTokenIndex = (currentTokenIndex + 1) % tokens.length;
    console.log(`🔄 Rotated to token index ${currentTokenIndex}`);
  };

  const fetchWithRotation = async (url, res, errorKey, notFoundMsg) => {
    try {
      let response = await fetchGithub(url, { headers: getGitHubHeaders() });

      if (response.status === 403) {
        console.warn("⚠️ Rate limit hit. Rotating token...");
        rotateToken();
        response = await fetchGithub(url, { headers: getGitHubHeaders() });
      }

      if (!response.ok) {
        errorCounts[errorKey]++;
        const errorText = await response.text();
        return res.status(response.status).json({ error: notFoundMsg, details: errorText });
      }

      const data = await response.json();
      return res.status(200).json(data);

    } catch (err) {
      errorCounts[errorKey]++;
      console.error(`Internal server error in ${url}:`, err);
      return res.status(500).json({ error: 'Internal server error', details: err.message });
    }
  };

  // GitHub user
  app.get('/api/github/user/:username', (req, res) =>
    fetchWithRotation(`https://api.github.com/users/${req.params.username}`, res, "user_details", "User not found")
  );

  // GitHub repos
  app.get('/api/github/repos/:username', (req, res) =>
    fetchWithRotation(`https://api.github.com/users/${req.params.username}/repos?sort=updated&per_page=100`, res, "user_repos", "Repos not found")
  );

  // GitHub events
  app.get('/api/github/events/:username', (req, res) =>
    fetchWithRotation(`https://api.github.com/users/${req.params.username}/events?per_page=30`, res, "user_events", "Events not found")
  );

  // GitHub followers
  app.get('/api/github/followers/:username', (req, res) =>
    fetchWithRotation(`https://api.github.com/users/${req.params.username}/followers?per_page=30`, res, "user_followers", "Followers not found")
  );

  // GitHub following
  app.get('/api/github/following/:username', (req, res) =>
    fetchWithRotation(`https://api.github.com/users/${req.params.username}/following?per_page=30`, res, "user_following", "Following not found")
  );
};
