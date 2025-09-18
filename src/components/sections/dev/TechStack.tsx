import { Badge } from "@/components/ui/badge";
import { Code2 } from "lucide-react";
import { useEffect, useState } from "react";
import * as simpleIcons from "simple-icons";

interface RepoLike {
  id: number;
  name: string;
  html_url: string;
  language?: string;
  topics?: string[];
}

interface TechStackSectionProps {
  repositories: RepoLike[];
  title?: string;
  maxTopics?: number; 
  hideTitle?: boolean;
  className?: string;
}

// Category dictionary
const CATEGORY_MAP: Record<string, keyof typeof CATEGORY_LABELS> = {
  // Programming Languages
  javascript: "languages",
  typescript: "languages",
  python: "languages",
  java: "languages",
  rust: "languages",
  go: "languages",
  c: "languages",
  "c++": "languages",
  "c#": "languages",
  ruby: "languages",
  php: "languages",
  kotlin: "languages",
  swift: "languages",
  dart: "languages",
  scala: "languages",
  elixir: "languages",
  r: "languages",
  objectivec: "languages",
  perl: "languages",
  lua: "languages",
  groovy: "languages",
  bash: "languages",
  shell: "languages",

  // Development & Frameworks (Web, Mobile, Backend, UI)
  react: "frameworks",
  node: "frameworks",
  "node.js": "frameworks",
  nodejs: "frameworks",
  "expo": "frameworks",
  "tailwindcss": "frameworks",
  "tailwind-css": "frameworks",
  "react.js": "frameworks",
  "reactjs": "frameworks",
  "vue.js": "frameworks",
  "react-native": "frameworks",
  "nextjs": "frameworks",
  "next.js": "frameworks",
  vitejs: "tools",
  vue: "frameworks",
  angular: "frameworks",
  svelte: "frameworks",
  expressjs: "frameworks",
  express: "frameworks",
  nestjs: "frameworks",
  spring: "frameworks",
  django: "frameworks",
  flask: "frameworks",
  laravel: "frameworks",
  ruby_on_rails: "frameworks",
  bootstrap: "frameworks",
  materialui: "frameworks",
  antdesign: "frameworks",
  chakraui: "frameworks",
  ionic: "frameworks",
  flutter: "frameworks",
  "redux": "frameworks",
  "zustand": "frameworks",
  "mobx": "frameworks",
  rxjs: "frameworks",
  jquery: "frameworks",

  // DevOps / CI/CD / Containers / Cloud
  docker: "tools",
  kubernetes: "tools",
  "github-actions": "tools",
  terraform: "tools",
  jenkins: "tools",
  ansible: "tools",
  circleci: "tools",
  gitlabci: "tools",
  travisci: "tools",
  aws: "tools",
  azure: "tools",
  gcp: "tools",
  vercel: "tools",
  netlify: "tools",
  firebase: "tools",
  supabase: "tools",
  appwrite: "tools",
  heroku: "tools",
  digitalocean: "tools",
  "openstack": "tools",
  "getx": "tools",


  // Databases / Storage
  postgresql: "tools",
  mysql: "tools",
  mariadb: "tools",
  mongodb: "tools",
  redis: "tools",
  sqlite: "tools",
  cassandra: "tools",
  dynamodb: "tools",
  cockroachdb: "tools",
  neo4j: "tools",
  elasticsearch: "tools",
  influxdb: "tools",


  // Misc / Tools & Technologies
  git: "tools",
  github: "tools",
  gitlab: "tools",
  bitbucket: "tools",
  jira: "tools",
  slack: "tools",
  "postman": "tools",
  figma: "tools",
  webpack: "tools",
  vite: "frameworks",
  esbuild: "tools",
  babel: "tools",
  npm: "tools",
  yarn: "tools",
  pnpm: "tools",
  storybook: "tools",
  "eslint": "tools",
  "prettier": "tools",
  "docker-compose": "tools",
};


const CATEGORY_LABELS = {
  languages: "Programming Languages",
  frameworks: "Development & Frameworks",
  devops: "DevOps",
  databases: "Databases",
  tools: "Tools & Technologies",
  others: "Others",
};

function getIconForTech(name: string) {
  if (!name) return null;

  const formatted = `si${name.replace(/[^a-z0-9]/gi, "").toLowerCase()}`;
  const key = Object.keys(simpleIcons).find((k) => k.toLowerCase() === formatted);

  if (key && simpleIcons[key as keyof typeof simpleIcons]) {
    const icon = simpleIcons[key as keyof typeof simpleIcons] as simpleIcons.SimpleIcon;
    const coloredSvg = icon.svg.replace("<svg", `<svg fill="#${icon.hex}"`);
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

export const TechStackSection = ({
  repositories,
  title = "Tech Stack",
  maxTopics = 5,
  hideTitle = false,
  className = "",
}: TechStackSectionProps) => {
  const [repoLanguages, setRepoLanguages] = useState<Record<number, string[]>>({});
  const [loadingLanguages, setLoadingLanguages] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchLanguages = async () => {
      setLoadingLanguages(true);
      try {
        const entries = await Promise.all(
          repositories.slice(0, 15).map(async (repo) => {
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
  }, [repositories.map(r=>r.id).join(",")]);


function normalizeTechName(name: string) {
  if (!name) return "";
  return name.replace(/(\.js|js)$/i, "").toLowerCase();
}

// Categorize tech
const categorized: Record<keyof typeof CATEGORY_LABELS, Set<string>> = {
  languages: new Set(),
  frameworks: new Set(),
  devops: new Set(),
  databases: new Set(),
  tools: new Set(),
  others: new Set(),
};

repositories.forEach(repo => {
  const langs = repoLanguages[repo.id] || (repo.language ? [repo.language] : []);
  langs.forEach(l => {
    const normalized = normalizeTechName(l);
    const key = CATEGORY_MAP[normalized];
    if (key) categorized[key].add(normalized);
  });

  if (repo.topics && repo.topics.length) {
    repo.topics.slice(0, maxTopics).forEach(t => {
      const normalized = normalizeTechName(t);
      const key = CATEGORY_MAP[normalized];
      if (key) categorized[key].add(normalized);
    });
  }
});

const sections = Object.entries(CATEGORY_LABELS)
  .map(([key, label]) => {
    const items = [...categorized[key as keyof typeof CATEGORY_LABELS]];
    const uniqueItems = Array.from(new Map(items.map(i => [i.toLowerCase(), i])).values());
    return { key: key as keyof typeof CATEGORY_LABELS, label, items: uniqueItems };
  })
  .filter(sec => sec.items.length > 0);



  if (sections.length === 0) return null;

  return (
    <div className={`w-full flex flex-col ${className}`}>
      {!hideTitle && (
        <div className="flex items-center gap-3 m-4">
          <div className="p-2 rounded-lg bg-gradient-to-br from-primary/20 to-primary/10">
            <Code2 className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-2xl md:text-3xl font-bold gradient-text">{title}</h3>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 my-5 gap-6 overflow-y-auto overscroll-contain px-1">
        {sections.map(sec => (
          <div key={sec.key} className="flex flex-col gap-2">
            <h4 className="text-sm font-semibold text-white/80">{sec.label}</h4>
            <div className="flex flex-wrap gap-2">
              {sec.items.map((tech) => (
                <Badge 
                  key={tech} 
                  variant="secondary" 
                  className="rounded-full px-3 py-1 bg-white/10 text-white/90 border border-white/20 text-sm flex items-center gap-1"
                >
                  {getIconForTech(tech)}
                  {tech}
                </Badge>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
