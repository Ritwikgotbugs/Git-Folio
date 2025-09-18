import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, GitFork, Star, TrendingUp, Users } from "lucide-react";

interface CommunityImpactScoreProps {
  followers: number;
  following: number;
  totalStars: number;
  totalForks: number;
  publicRepos: number;
}

export const CommunityImpactScore = ({ 
  followers, 
  following, 
  totalStars, 
  totalForks, 
  publicRepos 
}: CommunityImpactScoreProps) => {
  // Calculate impact score based on various metrics
  const calculateImpactScore = () => {
    const followerScore = Math.min(followers * 2, 100); // Max 100 points
    const starScore = Math.min(totalStars * 0.5, 50); // Max 50 points
    const forkScore = Math.min(totalForks * 1, 30); // Max 30 points
    const repoScore = Math.min(publicRepos * 2, 20); // Max 20 points
    
    const totalScore = followerScore + starScore + forkScore + repoScore;
    return Math.min(Math.round(totalScore), 100);
  };

  const impactScore = calculateImpactScore();

  const getScoreLevel = (score: number) => {
    if (score >= 80) return { level: "Elite", color: "bg-gradient-to-r from-green-500 to-emerald-500", description: "Top-tier developer with significant community impact" };
    if (score >= 60) return { level: "Influential", color: "bg-gradient-to-r from-blue-500 to-cyan-500", description: "Well-respected developer with strong community presence" };
    if (score >= 40) return { level: "Active", color: "bg-gradient-to-r from-yellow-500 to-orange-500", description: "Active contributor with growing community influence" };
    if (score >= 20) return { level: "Emerging", color: "bg-gradient-to-r from-orange-500 to-red-500", description: "Up-and-coming developer building their presence" };
    return { level: "Newcomer", color: "bg-gradient-to-r from-gray-500 to-slate-500", description: "New to the community, starting their journey" };
  };

  const scoreInfo = getScoreLevel(impactScore);

  return (
    <Card className="bg-[#ffffff0d] border-2">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Award className="w-4 h-4" />
          Community Impact
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Score Display */}
          <div className="text-center">
            <div className="relative inline-block">
              <div className="w-16 h-16 rounded-full border-3 border-muted flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                <span className="text-lg font-bold text-white">{impactScore}</span>
              </div>
              <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full ${scoreInfo.color} flex items-center justify-center`}>
                <TrendingUp className="w-3 h-3 text-white" />
              </div>
            </div>
            <div className="mt-2">
              <Badge className={`${scoreInfo.color} text-white text-xs`}>
                {scoreInfo.level}
              </Badge>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-2 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20">
              <Users className="w-4 h-4 mx-auto mb-1 text-blue-500" />
              <div className="text-sm font-bold">{followers}</div>
              <div className="text-xs text-muted-foreground">Followers</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-gradient-to-br from-yellow-500/10 to-yellow-600/10 border border-yellow-500/20">
              <Star className="w-4 h-4 mx-auto mb-1 text-yellow-500" />
              <div className="text-sm font-bold">{totalStars}</div>
              <div className="text-xs text-muted-foreground">Stars</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20">
              <GitFork className="w-4 h-4 mx-auto mb-1 text-purple-500" />
              <div className="text-sm font-bold">{totalForks}</div>
              <div className="text-xs text-muted-foreground">Forks</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20">
              <TrendingUp className="w-4 h-4 mx-auto mb-1 text-green-500" />
              <div className="text-sm font-bold">{publicRepos}</div>
              <div className="text-xs text-muted-foreground">Repos</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 