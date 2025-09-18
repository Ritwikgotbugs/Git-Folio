import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { EyeIcon, GitForkIcon, Globe, ShieldCheck, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import * as simpleIcons from "simple-icons";

interface RepoLike {
  id: number;
  name: string;
  description: string;
  html_url: string;
  language: string;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  topics?: string[]; // retained for backwards compatibility (unused now)
  homepage?: string | null;
  license?: { key?: string; name?: string; spdx_id?: string | null } | null;
}

interface ProjectsSectionProps {
  repositories: RepoLike[];
  title?: string;
  slidesPerView?: { base: number; md?: number; xl?: number };
}

function getIconForTech(name: string) {
  if (!name) return null;

  const formatted = `si${name.replace(/[^a-z0-9]/gi, "").toLowerCase()}`;
  const key = Object.keys(simpleIcons).find((k) => k.toLowerCase() === formatted);

  if (key && simpleIcons[key as keyof typeof simpleIcons]) {
    const icon = simpleIcons[key as keyof typeof simpleIcons] as simpleIcons.SimpleIcon;

    const coloredSvg = icon.svg.replace(
      "<svg",
      `<svg fill="#${icon.hex}"`
    );

    return (
      <img
        src={`data:image/svg+xml;utf8,${encodeURIComponent(coloredSvg)}`}
        alt={name}
        className="w-4 h-4"
      />
    );
  }

  return null;
}


export const ProjectsSection = ({
  repositories,
  title = "Projects",
  slidesPerView = { base: 1, md: 2, xl: 3 },
}: ProjectsSectionProps) => {
  if (!repositories || repositories.length === 0) return null;

  const sorted = [...repositories].sort(
    (a, b) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );

  // Map of repoId -> array of language names (sorted by bytes desc)
  const [repoLanguages, setRepoLanguages] = useState<Record<number, string[]>>({});
  const [loadingLanguages, setLoadingLanguages] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchLanguages = async () => {
      setLoadingLanguages(true);
      try {
        const entries = await Promise.all(
          sorted.slice(0, 15).map(async (repo) => {
            if (repoLanguages[repo.id]) return [repo.id, repoLanguages[repo.id]] as const;
            try {
              const owner = repo.html_url.split("/")[3];
              const res = await fetch(`https://api.github.com/repos/${owner}/${repo.name}/languages`);
              if (!res.ok) throw new Error("Failed languages fetch");
              const data = await res.json();
              const langs = Object.entries<number>(data)
                .sort((a,b) => b[1]-a[1])
                .map(([lang]) => lang);
              return [repo.id, langs] as const;
            } catch {
              return [repo.id, repo.language ? [repo.language] : []] as const;
            }
          })
        );
        if (!cancelled) {
          const map: Record<number, string[]> = { ...repoLanguages };
            entries.forEach(([id, langs]) => { map[id] = langs; });
          setRepoLanguages(map);
        }
      } finally {
        if (!cancelled) setLoadingLanguages(false);
      }
    };
    fetchLanguages();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sorted.map(r=>r.id).join(',')]);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

  const renderRepoCard = (repo: RepoLike) => {
    const langs = repoLanguages[repo.id] || (repo.language ? [repo.language] : []);
    const topLangs = langs.slice(0,4);
    const licenseTag = repo.license?.spdx_id && repo.license.spdx_id !== 'NOASSERTION' ? repo.license.spdx_id : null;
    return (
   <Card
  key={repo.id}
  className="group cursor-pointer transition-all duration-300 h-full min-h-[300px] flex flex-col 
             bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl 
             hover:border-primary/40 hover:shadow-[0_0_20px_-5px] hover:shadow-primary/30"
  onClick={() => window.open(repo.html_url, "_blank")}
>
  {/* Header row */}
  <CardHeader className="flex flex-row items-center justify-between pb-2 relative">
    <div className="flex items-center gap-2 flex-wrap min-w-0">
      <CardTitle className="text-lg md:text-xl font-bold gradient-text flex items-center gap-2 truncate">
        <span className="truncate max-w-[160px] md:max-w-[220px]">{repo.name}</span>
        <Sparkles className="w-4 h-4 text-primary/80 opacity-0 group-hover:opacity-100 transition" />
      </CardTitle>
    </div>
    <div className="flex items-center gap-2">
      {licenseTag && (
        <span
          title={repo.license?.name || licenseTag}
          aria-label={`Project license: ${licenseTag}`}
          className="relative inline-flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 shadow-[0_0_0_2px_rgba(16,185,129,0.15)] ring-1 ring-emerald-400/30"
        >
          <ShieldCheck className="w-4 h-4 drop-shadow-[0_0_6px_rgba(16,185,129,0.9)]" />
          <span className="sr-only">{licenseTag}</span>
        </span>
      )}
      {repo.homepage && (
        <button
          onClick={(e) => { e.stopPropagation(); window.open(repo.homepage!.startsWith('http')? repo.homepage : `https://${repo.homepage}`, '_blank'); }}
          className="w-8 h-8 inline-flex items-center justify-center rounded-full bg-purple-600/30 hover:bg-purple-600/45 border border-purple-400/40 transition shadow-[0_0_12px_-2px_rgba(168,85,247,0.6)]"
          aria-label="Project website"
        >
          <Globe className="w-4 h-4 text-purple-200 drop-shadow-[0_0_6px_rgba(168,85,247,0.85)]" />
        </button>
      )}
    </div>
  </CardHeader>

  <CardContent className="flex flex-col flex-1">
    {/* Centered description */}
    {repo.description && (
      <p className="text-center text-muted-foreground text-sm leading-relaxed line-clamp-3 mb-4">
        {repo.description}
      </p>
    )}

    {/* Languages row */}
    <div className="flex flex-wrap gap-2 justify-center mt-auto mb-3 min-h-[34px]">
      {topLangs.map(lang => (
        <span
          key={lang}
          className="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white/80 border border-white/20 hover:bg-white/20 transition"
        >
          {getIconForTech(lang)}
          {lang}
        </span>
      ))}
      {loadingLanguages && topLangs.length === 0 && (
        <span className="text-[11px] text-muted-foreground">Loading...</span>
      )}
    </div>

    {/* Footer with stats + date */}
    <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-white/10">
      {/* Left side */}
      <div className="flex items-center gap-4 flex-wrap">
        {topLangs[0] && (
          <div className="flex items-center gap-2">
            {getIconForTech(topLangs[0])}
            <span className="font-medium">{topLangs[0]}</span>
          </div>
        )}
        <div className="flex items-center gap-1">
          <EyeIcon className="w-4 h-4" />
          {repo.stargazers_count}
        </div>
        <div className="flex items-center gap-1">
          <GitForkIcon className="w-4 h-4" />
          {repo.forks_count}
        </div>
      </div>

      {/* Right side */}
      <span className="text-[11px] bg-white/10 px-2 py-1 rounded">
        {formatDate(repo.updated_at)}
      </span>
    </div>
  </CardContent>
</Card>


  );
  };

  return (
    <section className="space-y-6 pt-10" id="projects">
      <div className="flex items-center gap-3">
        <Sparkles className="w-6 h-6 text-primary" />
        <h3 className="text-3xl font-bold gradient-text">{title}</h3>
      </div>

      <Carousel
        className="w-full"
        opts={{ align: "start", slidesToScroll: 1 }}
      >
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
