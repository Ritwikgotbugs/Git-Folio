const WEB_URL = process.env.REACT_APP_BACKEND_URL || "http://13.127.73.202:4000";

export async function fetchGitHubUser(username: string) {
  const response = await fetch(`${WEB_URL}/api/github/user/${username}`);
  if (!response.ok) throw new Error("User not found");
  return response.json();
}

export async function fetchGitHubRepos(username: string) {
  const response = await fetch(`${WEB_URL}/api/github/repos/${username}`);
  if (!response.ok) throw new Error("Repos not found");
  return response.json();
}

export async function fetchGitHubEvents(username: string) {
  const response = await fetch(`${WEB_URL}/api/github/events/${username}`);
  if (!response.ok) throw new Error("Events not found");
  return response.json();
}

export async function fetchGitHubFollowers(username: string) {
  const response = await fetch(`${WEB_URL}/api/github/followers/${username}`);
  if (!response.ok) throw new Error("Followers not found");
  return response.json();
}

export async function fetchGitHubFollowing(username: string) {
  const response = await fetch(`${WEB_URL}/api/github/following/${username}`);
  if (!response.ok) throw new Error("Following not found");
  return response.json();
}
