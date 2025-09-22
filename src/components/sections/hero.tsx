import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowDown, Github, Link2 } from "lucide-react";
import { memo } from "react";
import { SocialLinks } from "./socials";

interface HeroIntroProps {
  user: {
    login: string;
    name: string | null;
    avatar_url: string;
    bio?: string | null;
    blog?: string | null;
    html_url?: string | null;
  };
  topLanguages: { name: string; percentage: number }[];
  onNavigate?: (anchor: string) => void;
}

export const HeroIntro = memo(({ user, topLanguages, onNavigate }: HeroIntroProps) => {
  const displayName = user.name || user.login;
  const top3 = topLanguages.slice(0,3);

  const handleNav = (id: string) => {
    if (onNavigate) {
      onNavigate(id);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="relative mx-auto max-w-7xl py-20 lg:py-28 px-4 flex flex-col lg:flex-row gap-14 items-center" id="hero">
      <div className="flex-1 max-w-xl space-y-8">
        {top3.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {top3.map(lang => (
              <Badge key={lang.name} variant="secondary" className="rounded-full px-4 py-1 bg-primary/10 text-primary border-primary/20 text-xs tracking-wide">
                {lang.name}
              </Badge>
            ))}
          </div>
        )}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            <span className="block text-muted-foreground/80 text-xl md:text-2xl mb-3">Hello, I'm</span>
            <span className="gradient-text">{displayName}.</span>
          </h1>
          {(user.bio) && (
            <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-prose">
              {user.bio}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-4">
          <Button
            onClick={() => handleNav('contact')}
            size="lg"
            className="gap-2 font-medium shadow-sm"
            aria-label="Get in touch"
          >
            Get in touch <span className="ml-0.5">→</span>
          </Button>
          <Button
            onClick={() => handleNav('projects')}
            size="lg"
            variant="outline"
            className="font-medium border-border/60 bg-transparent hover:bg-background/40"
            aria-label="Learn more"
          >
            Learn more
          </Button>
        </div>
        {/* <div className="flex gap-4 pt-2">
          {user.blog && (
            <Button asChild variant="ghost" size="sm" className="gap-2">
              <a href={user.blog} target="_blank" rel="noopener noreferrer"><Link2 className="w-4 h-4" /> Website</a>
            </Button>
          )}
          {user.html_url && (
            <Button asChild variant="ghost" size="sm" className="gap-2">
              <a href={user.html_url} target="_blank" rel="noopener noreferrer"><Github className="w-4 h-4" /> GitHub</a>
            </Button>
          )}
        </div> */}
        <SocialLinks user={user} />
      </div>
     <div className="relative w-72 h-72 md:w-96 md:h-96 flex items-center justify-center">
  {/* Blurred glow background */}
      <img
        src={user.avatar_url}
        alt=""
        aria-hidden
        className="absolute w-[140%] h-[140%] object-cover blur-[120px] scale-150 opacity-60 rounded-3xl pointer-events-none"
      />

      {/* Foreground avatar */}
      <div className="relative w-full h-full rounded-3xl overflow-hidden bg-background/30 shadow-[0_0_50px_rgba(0,0,0,0.25)] z-10">
        <img
          src={user.avatar_url}
          alt={displayName}
          className="w-full h-full object-cover rounded-3xl"
        />
        <div className="absolute inset-0 rounded-3xl ring-1 ring-white/10 pointer-events-none" />
      </div>
    </div>

      <div
        onClick={() => handleNav('projects')}
        className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[11px] font-medium tracking-widest text-muted-foreground/70 cursor-pointer hover:text-primary transition-colors select-none"
        aria-label="Scroll below"
      >
        <ArrowDown className="w-4 h-4 animate-bounce" />
        <span>Scroll below</span>
      </div>
    </section>
  );
});

HeroIntro.displayName = 'HeroIntro';
