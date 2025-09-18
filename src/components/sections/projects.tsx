import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Sparkles } from "lucide-react";

interface RepoLike {
  id: number;
  name: string;
  description: string;
  html_url: string;
  language: string;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  topics?: string[];
}

interface ProjectsSectionProps {
  repositories: RepoLike[];
  title?: string;
  slidesPerView?: { base: number; md?: number; xl?: number }; // responsive counts
}

export const ProjectsSection = ({ repositories, title = "Projects", slidesPerView = { base: 1, md: 2, xl: 3 } }: ProjectsSectionProps) => {
  if (!repositories || repositories.length === 0) return null;

  const sorted = [...repositories].sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const renderRepoCard = (repo: RepoLike, index?: number) => (
    <Card
      key={repo.id}
      className="group cursor-pointer transition-all duration-300 h-full min-h-[260px] flex flex-col bg-[#ffffff0d] border-2 backdrop-blur-sm"
      onClick={() => window.open(repo.html_url, "_blank")}
      style={index !== undefined ? { animationDelay: `${index * 80}ms` } : undefined}
    >
      <CardHeader className="pb-4">
        <CardTitle className="text-lg transition-colors duration-300 flex items-center gap-2">
          <span className="truncate max-w-[220px]">{repo.name}</span>
          <Sparkles className="w-4 h-4 text-primary/70 opacity-0 transition-opacity" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 flex flex-col flex-1">
        {repo.description && (
          <p className="text-muted-foreground text-sm line-clamp-2 leading-relaxed">{repo.description}</p>
        )}
        <div className="flex flex-wrap gap-2 min-h-[36px]">
          {repo.topics && repo.topics.length > 0 && (
            repo.topics.slice(0, 3).map((topic) => (
              <Badge key={topic} variant="secondary" className="text-xs rounded-full px-3 py-1 bg-primary/10 text-primary border-primary/20">
                {topic}
              </Badge>
            ))
          )}
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground mt-auto pt-2">
          <div className="flex items-center gap-4">
            {repo.language && (
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary shadow-sm" />
                <span className="font-medium">{repo.language}</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
              <span className="font-medium">{repo.forks_count}</span>
            </div>
          </div>
          <div className="text-[10px] bg-muted/60 px-2 py-1 rounded">Updated {formatDate(repo.updated_at)}</div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3">
        <Sparkles className="w-6 h-6 text-primary" />
        <h3 className="text-3xl font-bold gradient-text">{title}</h3>
      </div>
      <Carousel className="w-full" opts={{ align: "start", slidesToScroll: 1 }}>
        <CarouselContent>
          {sorted.map((repo) => (
            <CarouselItem
              key={repo.id}
              className="basis-full md:basis-1/2 xl:basis-1/3"
            >
              {renderRepoCard(repo)}
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="-left-4 md:-left-8" />
        <CarouselNext className="-right-4 md:-right-8" />
      </Carousel>
    </section>
  );
};
