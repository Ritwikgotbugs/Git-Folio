import { fetchGitHubRepos, fetchGitHubUser } from "@/api/github";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Code2, GitFork, Github, Link2, MapPin, Monitor, Moon, PieChart, Search, Sparkles, Star, Sun, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ContributionGraph } from "./ContributionGraph";
import { LanguageChart } from "./LanguageChart";
import { useTheme } from "./ThemeProvider";

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
  html_url: string;
}

interface GitHubRepo {
  id: number;
  name: string;
  description: string;
  html_url: string;
  language: string;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  topics: string[];
  size: number;
}

interface LanguageStats {
  [key: string]: number;
}

interface GitHubPortfolioProps {
  initialUsername?: string;
}

// Loading Skeleton Component
const LoadingSkeleton = () => (
  <div className="space-y-12 animate-fade-in">
    {/* Profile Skeleton */}
    <Card className="card-modern">
      <CardContent className="p-8">
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
          <div className="w-40 h-40 rounded-3xl bg-muted animate-pulse"></div>
          <div className="flex-1 space-y-4">
            <div className="h-8 bg-muted rounded-lg animate-pulse w-64"></div>
            <div className="h-6 bg-muted rounded-lg animate-pulse w-32"></div>
            <div className="h-4 bg-muted rounded-lg animate-pulse w-96"></div>
            <div className="flex gap-4">
              <div className="h-8 bg-muted rounded-full animate-pulse w-24"></div>
              <div className="h-8 bg-muted rounded-full animate-pulse w-32"></div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 pt-8 border-t border-border/50">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-muted rounded-2xl animate-pulse"></div>
          ))}
        </div>
      </CardContent>
    </Card>

    {/* Charts Skeleton */}
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
      {[1, 2].map((i) => (
        <Card key={i} className="card-modern">
          <CardHeader className="pb-4">
            <div className="h-6 bg-muted rounded-lg animate-pulse w-48"></div>
          </CardHeader>
          <CardContent>
            <div className="h-80 bg-muted rounded-lg animate-pulse"></div>
          </CardContent>
        </Card>
      ))}
    </div>

    {/* Repos Skeleton */}
    <div>
      <div className="h-8 bg-muted rounded-lg animate-pulse w-64 mb-8"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="card-modern">
            <CardHeader className="pb-4">
              <div className="h-6 bg-muted rounded-lg animate-pulse w-32"></div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-4 bg-muted rounded-lg animate-pulse w-full"></div>
              <div className="flex gap-2">
                <div className="h-6 bg-muted rounded-full animate-pulse w-16"></div>
                <div className="h-6 bg-muted rounded-full animate-pulse w-20"></div>
              </div>
              <div className="h-4 bg-muted rounded-lg animate-pulse w-24"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  </div>
);

// Theme Toggle Component
const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      setTheme("light");
    }
  };

  const getThemeIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className="w-4 h-4" />;
      case "dark":
        return <Moon className="w-4 h-4" />;
      default:
        return <Monitor className="w-4 h-4" />;
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="fixed top-4 right-4 z-50 bg-card/80 backdrop-blur-sm border border-border/50 rounded-xl shadow-card hover:shadow-hover transition-all duration-300"
    >
      {getThemeIcon()}
    </Button>
  );
};

export const GitHubPortfolio = ({ initialUsername }: GitHubPortfolioProps) => {
  const [username, setUsername] = useState(initialUsername || "");
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [languages, setLanguages] = useState<{ name: string; value: number; percentage: number }[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Auto-load user data if initialUsername is provided
  useEffect(() => {
    if (initialUsername && initialUsername.trim()) {
      setUsername(initialUsername);
      fetchGitHubData(initialUsername);
    }
  }, [initialUsername]);

  const fetchGitHubData = async (searchUsername?: string) => {
    const targetUsername = searchUsername || username;
    
    if (!targetUsername.trim()) {
      toast({
        title: "Username required",
        description: "Please enter a GitHub username",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Fetch user data
      const userData = await fetchGitHubUser(targetUsername);

      // Fetch repositories
      const reposData = await fetchGitHubRepos(targetUsername);

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
      setRepos(reposData.slice(0, 12));
      setLanguages(languageArray);
      
      // Update URL if not already set
      if (!initialUsername) {
        navigate(`/${targetUsername}`, { replace: true });
      }
      
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
      setLanguages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      fetchGitHubData();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Generate mock contribution data for the last 12 months
  const generateContributionData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.map(month => ({
      month,
      contributions: Math.floor(Math.random() * 100) + 10,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <ThemeToggle />
      
      {/* Hero Section with Animated Background */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-50"></div>
        <div className="absolute inset-0 bg-grid-white/[0.02] bg-[size:50px_50px]"></div>
        
        <div className="relative container mx-auto px-4 py-16">
        {/* Header */}
          <div className="text-center mb-16 animate-fade-in">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <Github className="w-5 h-5" />
              <span className="text-sm font-medium">GitHub Portfolio Explorer</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 gradient-text">
              Discover Amazing
              <br />
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Developers
              </span>
          </h1>
            
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Explore GitHub portfolios with beautiful analytics, insights, and visualizations
          </p>
        </div>

        {/* Search Section */}
          <div className="max-w-2xl mx-auto mb-16 animate-slide-in">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
              <div className="relative flex gap-3 p-2 bg-card/80 backdrop-blur-sm border border-border/50 rounded-2xl shadow-card">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Enter GitHub username..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={handleKeyPress}
                    className="pl-12 pr-4 py-6 text-lg border-0 bg-transparent focus:ring-0 focus:outline-none placeholder:text-muted-foreground/60"
            />
                </div>
            <Button 
                  onClick={() => fetchGitHubData()} 
              disabled={loading}
                  className="px-8 py-6 rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-105"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <Search className="w-5 h-5 mr-2" />
                      Explore
                    </>
                  )}
            </Button>
              </div>
            </div>
          </div>
        </div>
          </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 pb-16">
        {loading && <LoadingSkeleton />}

        {user && !loading && (
          <div className="space-y-12 animate-fade-in">
            {/* User Profile Card */}
            <Card className="card-modern overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <CardContent className="relative p-8">
                <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/10 rounded-3xl blur-xl"></div>
                  <img
                    src={user.avatar_url}
                    alt={user.name || user.login}
                      className="relative w-40 h-40 rounded-3xl border-4 border-card shadow-2xl hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  
                  <div className="flex-1 text-center lg:text-left space-y-4">
                    <div>
                      <h2 className="text-4xl font-bold mb-2 gradient-text">
                        {user.name || user.login}
                      </h2>
                      <p className="text-xl text-muted-foreground">@{user.login}</p>
                    </div>
                    
                    {user.bio && (
                      <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl">
                        {user.bio}
                      </p>
                    )}
                    
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground justify-center lg:justify-start">
                      {user.location && (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-muted/50">
                          <MapPin className="w-4 h-4" />
                          {user.location}
                        </div>
                      )}
                      {user.blog && (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-muted/50">
                          <Link2 className="w-4 h-4" />
                          <a href={user.blog} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                            {user.blog}
                          </a>
                        </div>
                      )}
                      <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-muted/50">
                        <Calendar className="w-4 h-4" />
                        Joined {formatDate(user.created_at)}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 pt-8 border-t border-border/50">
                  <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 hover:scale-105 transition-transform duration-300">
                    <div className="text-4xl font-bold mb-2 text-primary">{user.public_repos}</div>
                    <div className="text-sm text-muted-foreground font-medium">Repositories</div>
                  </div>
                  <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 hover:scale-105 transition-transform duration-300">
                    <div className="text-4xl font-bold mb-2 text-primary">{user.followers}</div>
                    <div className="text-sm text-muted-foreground font-medium">Followers</div>
                  </div>
                  <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 hover:scale-105 transition-transform duration-300">
                    <div className="text-4xl font-bold mb-2 text-primary">{user.following}</div>
                    <div className="text-sm text-muted-foreground font-medium">Following</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Analytics Section */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
              {/* Language Distribution */}
              <Card className="card-modern group">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10">
                      <PieChart className="w-6 h-6 text-primary" />
                    </div>
                    Language Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {languages.length > 0 ? (
                    <LanguageChart languages={languages} />
                  ) : (
                    <div className="h-80 flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <Code2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                        <p>No language data available</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Contribution Activity */}
              <Card className="card-modern group">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-xl">
                    <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10">
                      <TrendingUp className="w-6 h-6 text-primary" />
                    </div>
                    Contribution Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ContributionGraph username={username} />
                </CardContent>
              </Card>
            </div>

            {/* Repository Performance */}
            {/* <Card className="card-modern group">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10">
                    <BarChart3 className="w-6 h-6 text-primary" />
                  </div>
                  Repository Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <RepoStatsChart 
                  repos={repos.map(repo => ({
                    name: repo.name,
                    stars: repo.stargazers_count,
                    forks: repo.forks_count,
                  }))}
                />
              </CardContent>
            </Card> */}

            {/* Repositories Grid */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <Sparkles className="w-6 h-6 text-primary" />
                <h3 className="text-3xl font-bold gradient-text">Recent Repositories</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {repos.map((repo, index) => (
                  <Card
                    key={repo.id}
                    className="card-modern group cursor-pointer hover:scale-105 transition-all duration-300"
                    onClick={() => window.open(repo.html_url, "_blank")}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg group-hover:text-primary transition-colors duration-300">
                        {repo.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {repo.description && (
                        <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">
                          {repo.description}
                        </p>
                      )}
                      
                      {repo.topics && repo.topics.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {repo.topics.slice(0, 3).map((topic) => (
                            <Badge key={topic} variant="secondary" className="text-xs rounded-full px-3 py-1 bg-primary/10 text-primary border-primary/20">
                              {topic}
                            </Badge>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-4">
                          {repo.language && (
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 rounded-full bg-primary shadow-sm"></div>
                              <span className="font-medium">{repo.language}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4" />
                            <span className="font-medium">{repo.stargazers_count}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <GitFork className="w-4 h-4" />
                            <span className="font-medium">{repo.forks_count}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-xs text-muted-foreground bg-muted/50 px-3 py-2 rounded-lg">
                        Updated {formatDate(repo.updated_at)}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};