import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertCircle, Calendar, ChevronDown, ChevronUp, GitBranch, GitCommit, GitPullRequest, Star } from "lucide-react";
import { useState } from "react";

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

interface ActivityTimelineProps {
  events: GitHubEvent[];
}

const getEventIcon = (type: string) => {
  switch (type) {
    case 'PushEvent':
      return <GitCommit className="w-4 h-4" />;
    case 'PullRequestEvent':
      return <GitPullRequest className="w-4 h-4" />;
    case 'CreateEvent':
      return <GitBranch className="w-4 h-4" />;
    case 'WatchEvent':
      return <Star className="w-4 h-4" />;
    case 'IssuesEvent':
      return <AlertCircle className="w-4 h-4" />;
    default:
      return <Calendar className="w-4 h-4" />;
  }
};

const getEventDescription = (event: GitHubEvent) => {
  const repoName = event.repo.name.split('/')[1];
  
  switch (event.type) {
    case 'PushEvent':
      return `Pushed ${event.payload.commits?.length || 0} commits to ${repoName}`;
    case 'PullRequestEvent':
      const action = event.payload.action;
      return `${action.charAt(0).toUpperCase() + action.slice(1)} pull request in ${repoName}`;
    case 'CreateEvent':
      return `Created ${event.payload.ref_type} in ${repoName}`;
    case 'WatchEvent':
      return `Starred ${repoName}`;
    case 'IssuesEvent':
      return `${event.payload.action.charAt(0).toUpperCase() + event.payload.action.slice(1)} issue in ${repoName}`;
    default:
      return `Activity in ${repoName}`;
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
  
  if (diffInHours < 1) return 'Just now';
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  if (diffInHours < 168) return `${Math.floor(diffInHours / 24)} day${Math.floor(diffInHours / 24) > 1 ? 's' : ''} ago`;
  return date.toLocaleDateString();
};

export const ActivityTimeline = ({ events }: ActivityTimelineProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!events.length) {
    return (
      <Card className="card-minimal">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3">
            <Calendar className="w-5 h-5" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <p>No recent activity available</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Get last 10 events
  const recentEvents = events.slice(0, 10);
  const displayedEvents = isExpanded ? recentEvents : recentEvents.slice(0, 3);

  return (
    <Card className="card-minimal">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3">
          <Calendar className="w-5 h-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {displayedEvents.map((event) => (
            <div key={event.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
              <div className="flex-shrink-0 mt-1">
                {getEventIcon(event.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {getEventDescription(event)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatDate(event.created_at)}
                </p>
              </div>
            </div>
          ))}
          
          {recentEvents.length > 3 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-full flex items-center justify-center gap-2 p-2 text-sm text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted/30"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  Show Less
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  Show More ({recentEvents.length - 3} more)
                </>
              )}
            </button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}; 