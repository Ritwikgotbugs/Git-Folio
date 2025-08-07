import { fetchGitHubUser } from "@/api/github";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Clock, Github, Search } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Home = () => {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!username.trim()) {
      toast({
        title: "Username required",
        description: "Please enter a GitHub username",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Verify user exists
      await fetchGitHubUser(username);
      // Navigate to dashboard
      navigate(`/dashboard/${username}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to find GitHub user. Please check the username.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Github className="w-8 h-8" />
            <span className="text-xl font-semibold">GitHub Portfolio</span>
          </div>
          
          <h1 className="text-3xl font-bold">
            Explore GitHub Profiles
          </h1>
          
          <p className="text-muted-foreground">
            Enter a GitHub username to view their portfolio and analytics
          </p>
        </div>

        {/* Search Form */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Enter GitHub username..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pl-10"
            />
          </div>
          
          <Button 
            onClick={handleSearch} 
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
            ) : (
              <>
                <Search className="w-4 h-4 mr-2" />
                Explore Profile
              </>
            )}
          </Button>
        </div>

        {/* Navigation */}
        <div className="text-center">
          <Link 
            to="/history"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Clock className="w-4 h-4" />
            View History
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home; 