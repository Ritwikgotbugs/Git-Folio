import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Network, UserCheck, UserPlus, Users } from "lucide-react";

interface GitHubUser {
  login: string;
  avatar_url: string;
  type: string;
}

interface CollaborationNetworkProps {
  followers: GitHubUser[];
  following: GitHubUser[];
  username: string;
}

export const CollaborationNetwork = ({ followers, following, username }: CollaborationNetworkProps) => {
  if (!followers.length && !following.length) {
    return (
      <Card className="card-minimal">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3">
            <Network className="w-5 h-5" />
            Collaboration Network
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Network className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <p>No collaboration data available</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Find mutual connections
  const followerLogins = new Set(followers.map(f => f.login));
  const followingLogins = new Set(following.map(f => f.login));
  const mutualConnections = followers.filter(f => followingLogins.has(f.login));

  // Calculate network metrics
  const totalConnections = followers.length + following.length;
  const mutualCount = mutualConnections.length;
  const networkDensity = totalConnections > 0 ? Math.round((mutualCount / totalConnections) * 100) : 0;

  const getNetworkLevel = (density: number) => {
    if (density >= 30) return { level: "Highly Connected", color: "bg-gradient-to-r from-green-500 to-emerald-500", description: "Strong collaborative network" };
    if (density >= 15) return { level: "Well Connected", color: "bg-gradient-to-r from-blue-500 to-cyan-500", description: "Good collaborative presence" };
    if (density >= 5) return { level: "Growing Network", color: "bg-gradient-to-r from-yellow-500 to-orange-500", description: "Building connections" };
    return { level: "Emerging Network", color: "bg-gradient-to-r from-gray-500 to-slate-500", description: "Starting to build connections" };
  };

  const networkInfo = getNetworkLevel(networkDensity);

  return (
    <Card className="card-minimal">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Network className="w-4 h-4" />
          Collaboration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Network Overview */}
          <div className="text-center">
            <div className="relative inline-block">
              <div className="w-16 h-16 rounded-full border-3 border-muted flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-600">
                <span className="text-lg font-bold text-white">{networkDensity}%</span>
              </div>
              <div className={`absolute -top-1 -right-1 w-6 h-6 rounded-full ${networkInfo.color} flex items-center justify-center`}>
                <Network className="w-3 h-3 text-white" />
              </div>
            </div>
            <div className="mt-2">
              <Badge className={`${networkInfo.color} text-white text-xs`}>
                {networkInfo.level}
              </Badge>
            </div>
          </div>

          {/* Network Stats */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-2 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-600/10 border border-blue-500/20">
              <UserPlus className="w-4 h-4 mx-auto mb-1 text-blue-500" />
              <div className="text-sm font-bold">{followers.length}</div>
              <div className="text-xs text-muted-foreground">Followers</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-gradient-to-br from-green-500/10 to-green-600/10 border border-green-500/20">
              <UserCheck className="w-4 h-4 mx-auto mb-1 text-green-500" />
              <div className="text-sm font-bold">{following.length}</div>
              <div className="text-xs text-muted-foreground">Following</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-gradient-to-br from-purple-500/10 to-purple-600/10 border border-purple-500/20">
              <Users className="w-4 h-4 mx-auto mb-1 text-purple-500" />
              <div className="text-sm font-bold">{mutualCount}</div>
              <div className="text-xs text-muted-foreground">Mutual</div>
            </div>
          </div>

          {/* Network Insights */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Connection Ratio</span>
              <span className="font-medium">{followers.length > 0 ? Math.round((following.length / followers.length) * 100) : 0}%</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Mutual Rate</span>
              <span className="font-medium">{networkDensity}%</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 