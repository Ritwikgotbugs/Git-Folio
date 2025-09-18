import { fetchGitHubEvents, fetchGitHubFollowers, fetchGitHubFollowing, fetchGitHubRepos, fetchGitHubUser } from "@/api/github";
import { TechEvolutionChart } from "@/components/sections/dev/TechEvolution";
import { LanguageChart } from "@/components/sections/dev/TechPie";
import { TechStackSection } from "@/components/sections/dev/TechStack";
import { ProjectsSection } from "@/components/sections/projects";
import { CollaborationNetwork } from "@/components/sections/user/CollaborationNetwork";
import { CommunityImpactScore } from "@/components/sections/user/CommunityImpactScore";
import { RepoHealthMetrics } from "@/components/sections/user/RepoHealthMetrics";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Github, Instagram, Link2, Linkedin, MapPin, Share2, TrendingUp, Twitter, User2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import NotFound from "./NotFound";
import { SocialLinks } from "@/components/sections/socials";

interface GitHubUser {
  login: string;
  name: string;
  avatar_url: string;
  bio: string;
  location: string;
  blog: string;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  html_url: string | null;
  twitter_username: string | null;
}

interface GitHubRepo {
  id: number;
  name: string;
  description: string;
  html_url: string;
  language: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  updated_at: string;
  created_at: string;
  topics: string[];
  size: number;
  has_issues: boolean;
  has_wiki: boolean;
  has_pages: boolean;
  archived: boolean;
  disabled: boolean;
}

interface GitHubEvent {
  id: string;
  type: string;
  actor: {
    login: string;
    avatar_url: string;
  };
  repo: {
    name: string;
  };
  payload: any;
  created_at: string;
}

interface LanguageStats {
  [key: string]: number;
}

// Loading Skeleton Component
const LoadingSkeleton = () => (
  <div className="space-y-8">
    {/* Profile Skeleton */}
    <Card className="card-minimal">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
          <div className="w-32 h-32 rounded-2xl bg-muted"></div>
          <div className="flex-1 space-y-4">
            <div className="h-8 bg-muted rounded w-48"></div>
            <div className="h-6 bg-muted rounded w-32"></div>
            <div className="h-4 bg-muted rounded w-96"></div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 pt-6 border-t border-border">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-muted rounded-lg"></div>
          ))}
        </div>
      </CardContent>
    </Card>

    {/* Charts Skeleton */}
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} className="card-minimal">
          <CardHeader className="pb-4">
            <div className="h-6 bg-muted rounded w-48"></div>
          </CardHeader>
          <CardContent>
            <div className="h-80 bg-muted rounded-lg"></div>
          </CardContent>
        </Card>
      ))}
    </div>

    {/* Repos Skeleton */}
    <div>
      <div className="h-8 bg-muted rounded w-64 mb-6"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="card-minimal">
            <CardHeader className="pb-4">
              <div className="h-6 bg-muted rounded w-32"></div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-4 bg-muted rounded w-full"></div>
              <div className="flex gap-2">
                <div className="h-6 bg-muted rounded-full w-16"></div>
                <div className="h-6 bg-muted rounded-full w-20"></div>
              </div>
              <div className="h-4 bg-muted rounded w-24"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </div>
);

const Dashboard = () => {
  const { username } = useParams<{ username: string }>();
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [events, setEvents] = useState<GitHubEvent[]>([]);
  const [followers, setFollowers] = useState<{ login: string; avatar_url: string; type: string }[]>([]);
  const [following, setFollowing] = useState<{ login: string; avatar_url: string; type: string }[]>([]);
  const [languages, setLanguages] = useState<{ name: string; value: number; percentage: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (username) {
      fetchGitHubData();
    }
  }, [username]);

  const saveToHistory = (userData: GitHubUser) => {
    const historyItem = {
      username: userData.login,
      name: userData.name || userData.login,
      avatar_url: userData.avatar_url,
      bio: userData.bio || "",
      location: userData.location || "",
      public_repos: userData.public_repos,
      followers: userData.followers,
      lastViewed: Date.now(),
    };

    const savedHistory = localStorage.getItem('github-portfolio-history');
    let history = savedHistory ? JSON.parse(savedHistory) : [];
    
    // Remove existing entry if it exists
    history = history.filter((item: any) => item.username !== userData.login);
    
    // Add to beginning of array
    history.unshift(historyItem);
    
    // Keep only last 20 items
    history = history.slice(0, 20);
    
    localStorage.setItem('github-portfolio-history', JSON.stringify(history));
  };

  const fetchGitHubData = async () => {
    if (!username) return;

    setLoading(true);
    setNotFound(false);
    try {
      // Fetch user data
      const userData = await fetchGitHubUser(username);

      // Save to history
      saveToHistory(userData);

      // Fetch repositories
      const reposData = await fetchGitHubRepos(username);

      // Fetch user events (activity)
      const eventsData = await fetchGitHubEvents(username);

      // Fetch followers and following
      const followersData = await fetchGitHubFollowers(username);
      const followingData = await fetchGitHubFollowing(username);

      // Calculate language statistics
      const languageStats: LanguageStats = {};
      let totalSize = 0;

      reposData.forEach((repo: GitHubRepo) => {
        if (repo.language && repo.size > 0) {
          languageStats[repo.language] = (languageStats[repo.language] || 0) + repo.size;
          totalSize += repo.size;
        }
      });

      const languageArray = Object.entries(languageStats)
        .map(([name, value]) => ({
          name,
          value,
          percentage: Math.round((value / totalSize) * 100),
        }))
        .sort((a, b) => b.value - a.value);

      setUser(userData);
      setRepos(reposData);
      setEvents(eventsData);
      setFollowers(followersData);
      setFollowing(followingData);
      setLanguages(languageArray);
      
      toast({
        title: "Portfolio loaded!",
        description: `Successfully loaded ${userData.name || userData.login}'s portfolio`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch GitHub data. Please check the username.",
        variant: "destructive",
      });
      setUser(null);
      setRepos([]);
      setEvents([]);
      setFollowers([]);
      setFollowing([]);
      setLanguages([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/dashboard/${user?.login}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${user?.name || user?.login}'s GitHub Portfolio`,
          text: `Check out ${user?.name || user?.login}'s amazing GitHub portfolio!`,
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      // Fallback to copying to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link copied!",
          description: "Portfolio URL has been copied to clipboard",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to copy link to clipboard",
          variant: "destructive",
        });
      }
    }
  };

  // Calculate total stars and forks
  const totalStars = repos.reduce((sum, repo) => sum + repo.stargazers_count, 0);
  const totalForks = repos.reduce((sum, repo) => sum + repo.forks_count, 0);

  return (
    <div className="min-h-screen bg-background">
      {notFound ? (
        <NotFound message={`GitHub user '${username}' not found.`} />
      ) : (
        <>
         {/* Header */}
          <div className="w-full border-b border-border bg-background/80 backdrop-blur-sm supports-[backdrop-filter]:bg-background/60 px-6 py-4">
            <div className="flex items-center justify-between gap-6 max-w-7xl mx-auto">
              <div className="flex items-center">
                <button
                  onClick={() => navigate('/')}
                  className="text-xl font-bold tracking-tight gradient-text focus:outline-none"
                >
                  GitFolio
                </button>
              </div>
              <SocialLinks user={user} />
              {user && (
                <Button
                  onClick={handleShare}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="container mx-auto px-4 py-8">
            {loading && <LoadingSkeleton />}

            {user && !loading && (
              <div className="space-y-8">
                {/* User Profile */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="lg:col-span-1">
                    <Card className="bg-[#ffffff0d] border-2">
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-6">
                          <img
                            src={user.avatar_url}
                            alt={user.name || user.login}
                            className="w-32 h-32 rounded-2xl border border-border"
                          />
                          
                          <div className="flex-1 text-center lg:text-left space-y-4">
                            <div>
                              <h2 className="text-3xl font-bold mb-2">
                                {user.name || user.login}
                              </h2>
                              <p className="text-lg text-muted-foreground">@{user.login}</p>
                            </div>
                            
                            {user.bio && (
                              <p className="text-muted-foreground leading-relaxed max-w-2xl">
                                {user.bio}
                              </p>
                            )}
                            
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground justify-center lg:justify-start">
                              {user.location && (
                                <div className="flex items-center gap-2">
                                  <MapPin className="w-4 h-4" />
                                  {user.location}
                                </div>
                              )}
                              {user.blog && (
                                <div className="flex items-center gap-2">
                                  <Link2 className="w-4 h-4" />
                                  <a href={user.blog} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                                    {user.blog}
                                  </a>
                                </div>
                              )}
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                Joined {formatDate(user.created_at)}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Stats Grid */}
                        <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t border-border">
                          <div className="text-center p-4 rounded-lg bg-muted h-24 flex flex-col justify-center">
                            <div className="text-2xl font-bold mb-1">{user.public_repos}</div>
                            <div className="text-sm text-muted-foreground">Repositories</div>
                          </div>
                          <div className="text-center p-4 rounded-lg bg-muted h-24 flex flex-col justify-center">
                            <div className="text-2xl font-bold mb-1">{user.followers}</div>
                            <div className="text-sm text-muted-foreground">Followers</div>
                          </div>
                          <div className="text-center p-4 rounded-lg bg-muted h-24 flex flex-col justify-center">
                            <div className="text-2xl font-bold mb-1">{user.following}</div>
                            <div className="text-sm text-muted-foreground">Following</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                </div>

                <ProjectsSection repositories={repos} title="Projects" />

                 <div className="flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-primary" />
                  <h3 className="text-3xl font-bold gradient-text">Developer Analytics</h3>
                </div>

                <Card className="bg-[#ffffff0d] border-2">
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                      <div className="rounded-lg p-4 flex flex-col">
                        <LanguageChart languages={languages} />
                      </div>
                      <div className="rounded-lg p-4 flex flex-col">
                        <TechEvolutionChart repositories={repos} hideTitle />
                      </div>
                      <div className="rounded-lg p-4 flex flex-col">
                        <TechStackSection repositories={repos} hideTitle />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                 <div className="flex items-center gap-3">
                  <User2 className="w-6 h-6 text-primary" />
                  <h3 className="text-3xl font-bold gradient-text">Community and Repos</h3>
                </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <CommunityImpactScore
                    followers={user.followers}
                    following={user.following}
                    totalStars={totalStars}
                    totalForks={totalForks}
                    publicRepos={user.public_repos}
                  />
                  <RepoHealthMetrics repositories={repos} />
                  <CollaborationNetwork 
                    followers={followers}
                    following={following}
                    username={username || ""}
                  />
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard; 