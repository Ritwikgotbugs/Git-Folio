import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Clock, GitPullRequest, GitCommit, AlertCircle, CheckCircle } from "lucide-react";

interface Repository {
  name: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  updated_at: string;
  created_at: string;
  language: string;
  size: number;
  has_issues: boolean;
  has_wiki: boolean;
  has_pages: boolean;
  archived: boolean;
  disabled: boolean;
}

interface RepoHealthMetricsProps {
  repositories: Repository[];
}

export const RepoHealthMetrics = ({ repositories }: RepoHealthMetricsProps) => {
  if (!repositories.length) {
    return (
      <Card className="card-minimal">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3">
            <Heart className="w-5 h-5" />
            Repository Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Heart className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <p>No repository data available</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Calculate health metrics
  const calculateHealthMetrics = () => {
    const totalRepos = repositories.length;
    const activeRepos = repositories.filter(repo => !repo.archived && !repo.disabled).length;
    const reposWithIssues = repositories.filter(repo => repo.has_issues).length;
    const reposWithWiki = repositories.filter(repo => repo.has_wiki).length;
    const reposWithPages = repositories.filter(repo => repo.has_pages).length;
    
    // Calculate average time since last update
    const now = new Date();
    const avgDaysSinceUpdate = repositories.reduce((sum, repo) => {
      const lastUpdate = new Date(repo.updated_at);
      const daysDiff = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));
      return sum + daysDiff;
    }, 0) / totalRepos;

    // Calculate health score
    const healthScore = Math.round(
      (activeRepos / totalRepos) * 40 + // 40% for active repos
      (reposWithIssues / totalRepos) * 20 + // 20% for repos with issues enabled
      (reposWithWiki / totalRepos) * 20 + // 20% for repos with wiki
      (reposWithPages / totalRepos) * 20 // 20% for repos with pages
    );

    return {
      totalRepos,
      activeRepos,
      reposWithIssues,
      reposWithWiki,
      reposWithPages,
      avgDaysSinceUpdate: Math.round(avgDaysSinceUpdate),
      healthScore: Math.min(healthScore, 100)
    };
  };

  const metrics = calculateHealthMetrics();

  const getHealthLevel = (score: number) => {
    if (score >= 80) return { level: "Excellent", color: "bg-gradient-to-r from-green-500 to-emerald-500", icon: CheckCircle };
    if (score >= 60) return { level: "Good", color: "bg-gradient-to-r from-blue-500 to-cyan-500", icon: CheckCircle };
    if (score >= 40) return { level: "Fair", color: "bg-gradient-to-r from-yellow-500 to-orange-500", icon: AlertCircle };
    return { level: "Needs Attention", color: "bg-gradient-to-r from-red-500 to-pink-500", icon: AlertCircle };
  };

  const healthInfo = getHealthLevel(metrics.healthScore);
  const HealthIcon = healthInfo.icon;

  return (
    <Card className="card-minimal">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Heart className="w-4 h-4" />
          Repository Health
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Health Score */}
          <div className="text-center">
            <div className="relative inline-block">
              <div className="w-16 h-16 rounded-full border-3 border-muted flex items-center justify-center bg-gradient-to-br from-green-500 to-emerald-600">
                <span className="text-lg font-bold text-white">{metrics.healthScore}</span>
              </div>
              <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full ${healthInfo.color} flex items-center justify-center`}>
                <HealthIcon className="w-3 h-3 text-white" />
              </div>
            </div>
            <div className="mt-2">
              <Badge className={`${healthInfo.color} text-white text-xs`}>
                {healthInfo.level}
              </Badge>
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-2 rounded-lg bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20">
              <GitCommit className="w-4 h-4 mx-auto mb-1 text-green-500" />
              <div className="text-sm font-bold">{metrics.activeRepos}</div>
              <div className="text-xs text-muted-foreground">Active</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20">
              <GitPullRequest className="w-4 h-4 mx-auto mb-1 text-blue-500" />
              <div className="text-sm font-bold">{metrics.reposWithIssues}</div>
              <div className="text-xs text-muted-foreground">With Issues</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-gradient-to-br from-orange-500/10 to-orange-600/10 border border-orange-500/20">
              <Clock className="w-4 h-4 mx-auto mb-1 text-orange-500" />
              <div className="text-sm font-bold">{metrics.avgDaysSinceUpdate}</div>
              <div className="text-xs text-muted-foreground">Avg Days</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20">
              <Heart className="w-4 h-4 mx-auto mb-1 text-purple-500" />
              <div className="text-sm font-bold">{metrics.reposWithWiki}</div>
              <div className="text-xs text-muted-foreground">With Wiki</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 