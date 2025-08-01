import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Calendar, Clock, GitFork, MapPin, Star, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

interface HistoryItem {
  username: string;
  name: string;
  avatar_url: string;
  bio: string;
  location: string;
  public_repos: number;
  followers: number;
  lastViewed: number;
}

const History = () => {
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Load history from localStorage
    const savedHistory = localStorage.getItem('github-portfolio-history');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const handleViewProfile = (username: string) => {
    navigate(`/dashboard/${username}`);
  };

  const handleRemoveFromHistory = (username: string) => {
    const updatedHistory = history.filter(item => item.username !== username);
    setHistory(updatedHistory);
    localStorage.setItem('github-portfolio-history', JSON.stringify(updatedHistory));
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('github-portfolio-history');
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} day${Math.floor(diffInHours / 24) > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => navigate("/")}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Search
            </Button>
            
            {history.length > 0 && (
              <Button
                onClick={handleClearHistory}
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive"
              >
                Clear History
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <Clock className="w-6 h-6" />
            <h1 className="text-3xl font-bold">Viewing History</h1>
          </div>

          {history.length === 0 ? (
            <Card className="card-minimal">
              <CardContent className="p-12 text-center">
                <Clock className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                <h3 className="text-xl font-semibold mb-2">No History Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Profiles you view will appear here for quick access
                </p>
                <Button onClick={() => navigate("/")}>
                  Start Exploring
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {history.map((item) => (
                <Card key={item.username} className="card-minimal">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <img
                          src={item.avatar_url}
                          alt={item.name}
                          className="w-16 h-16 rounded-lg border border-border"
                        />
                        
                        <div className="flex-1 space-y-2">
                          <div>
                            <h3 className="text-lg font-semibold">{item.name}</h3>
                            <p className="text-muted-foreground">@{item.username}</p>
                          </div>
                          
                          {item.bio && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {item.bio}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            {item.location && (
                              <div className="flex items-center gap-1">
                                <MapPin className="w-4 h-4" />
                                {item.location}
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <GitFork className="w-4 h-4" />
                              {item.public_repos} repos
                            </div>
                            <div className="flex items-center gap-1">
                              <Star className="w-4 h-4" />
                              {item.followers} followers
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {formatDate(item.lastViewed)}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          onClick={() => handleViewProfile(item.username)}
                          size="sm"
                        >
                          View Profile
                        </Button>
                        <Button
                          onClick={() => handleRemoveFromHistory(item.username)}
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default History; 