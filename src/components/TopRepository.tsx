import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, ExternalLink, GitFork, Star } from "lucide-react";

interface Repository {
  name: string;
  description: string;
  stargazers_count: number;
  forks_count: number;
  language: string;
  html_url: string;
  created_at: string;
  updated_at: string;
  topics: string[];
}

interface TopRepositoryProps {
  repository: Repository;
}

export const TopRepository = ({ repository }: TopRepositoryProps) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card className="card-minimal">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Star className="w-4 h-4 text-yellow-500" />
          Most Starred Repository
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Repository Name and Link */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground truncate">
              {repository.name}
            </h3>
            <a
              href={repository.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* Description */}
          {repository.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {repository.description}
            </p>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="font-medium">{repository.stargazers_count.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1">
              <GitFork className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">{repository.forks_count.toLocaleString()}</span>
            </div>
            {repository.language && (
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <span className="font-medium">{repository.language}</span>
              </div>
            )}
          </div>

          {/* Topics */}
          {repository.topics && repository.topics.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {repository.topics.slice(0, 3).map((topic) => (
                <Badge key={topic} variant="secondary" className="text-xs">
                  {topic}
                </Badge>
              ))}
              {repository.topics.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{repository.topics.length - 3} more
                </Badge>
              )}
            </div>
          )}

          {/* Dates */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>Created {formatDate(repository.created_at)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>Updated {formatDate(repository.updated_at)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 