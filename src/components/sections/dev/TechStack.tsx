import { Badge } from "@/components/ui/badge";
import { Code2 } from "lucide-react";

interface RepoLike {
  language?: string;
  topics?: string[];
}

interface TechStackSectionProps {
  repositories: RepoLike[];
  title?: string;
  maxTopics?: number; // limit topics aggregated per repo to avoid noise
  hideTitle?: boolean;
  className?: string;
}

/**
 * TechStackSection aggregates primary languages and topics across repositories
 * and displays them as a clean bullet-style badge list.
 */
export const TechStackSection = ({ repositories, title = "Tech Stack", maxTopics = 5, hideTitle = false, className = "" }: TechStackSectionProps) => {
  if (!repositories || repositories.length === 0) return null;

  const languageSet = new Set<string>();
  const topicSet = new Set<string>();

  repositories.forEach(repo => {
    if (repo.language) languageSet.add(repo.language);
    if (repo.topics && repo.topics.length) {
      repo.topics.slice(0, maxTopics).forEach(t => topicSet.add(t));
    }
  });

  // Merge languages first (prioritized) then topics
  const stack = [...languageSet, ...topicSet];
  if (stack.length === 0) return null;

  return (
    <div className="h-96 w-full flex flex-col items-center">
      <div className="flex items-center gap-2 mb-2 text-sm font-medium select-none bg-white/10 rounded-lg p-2 z-10">
        <Code2 className="w-6 h-6 text-white" />
        <span className="font-bold text-white">Tech Stack</span>
     </div>
    <section className={`space-y-4 py-4 ${className}`}>
      {!hideTitle && (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10">
            <Code2 className="w-5 h-5 text-primary" />
          </div>
            <h3 className="text-2xl md:text-3xl font-bold gradient-text">{title}</h3>
        </div>
      )}
      <div className="flex flex-wrap gap-2">
        {stack.map((tech) => (
          <Badge key={tech} variant="secondary" className="rounded-full px-4 py-1 bg-gray/10 text-primary border-primary/20 text-sm">
            {tech}
          </Badge>
        ))}
      </div>
    </section>
    </div>
  );
};
