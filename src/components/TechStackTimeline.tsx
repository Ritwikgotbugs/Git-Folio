import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Code2 } from "lucide-react";

interface Repository {
  name: string;
  language: string;
  created_at: string;
  updated_at: string;
  stargazers_count: number;
}

interface TechStackTimelineProps {
  repositories: Repository[];
}

export const TechStackTimeline = ({ repositories }: TechStackTimelineProps) => {
  if (!repositories.length) {
    return (
      <Card className="card-minimal">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3">
            <Code2 className="w-5 h-5" />
            Technology Evolution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Code2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <p>No repository data available</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Group repositories by year and language
  const timelineData = repositories
    .filter(repo => repo.language) // Only repos with language data
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .reduce((acc, repo) => {
      const year = new Date(repo.created_at).getFullYear();
      if (!acc[year]) {
        acc[year] = {};
      }
      if (!acc[year][repo.language]) {
        acc[year][repo.language] = 0;
      }
      acc[year][repo.language]++;
      return acc;
    }, {} as Record<number, Record<string, number>>);

  const years = Object.keys(timelineData).sort((a, b) => parseInt(a) - parseInt(b));
  const allLanguages = new Set<string>();
  
  // Collect all unique languages
  Object.values(timelineData).forEach(yearData => {
    Object.keys(yearData).forEach(lang => allLanguages.add(lang));
  });

  const languageColors = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
  ];

  return (
    <Card className="card-minimal">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3">
          <Code2 className="w-5 h-5" />
          Technology Evolution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Timeline */}
          <div className="space-y-4">
            {years.map((year, yearIndex) => (
              <div key={year} className="relative">
                {/* Year Label */}
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="font-semibold text-foreground">{year}</span>
                  </div>
                  <div className="flex-1 h-px bg-border"></div>
                </div>

                {/* Languages for this year */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {Object.entries(timelineData[parseInt(year)]).map(([language, count], langIndex) => (
                    <div
                      key={language}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                      style={{
                        borderLeft: `4px solid ${languageColors[langIndex % languageColors.length]}`
                      }}
                    >
                      <div>
                        <div className="font-medium text-foreground">{language}</div>
                        <div className="text-sm text-muted-foreground">
                          {count} repo{count > 1 ? 's' : ''}
                        </div>
                      </div>
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: languageColors[langIndex % languageColors.length] }}
                      ></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="border-t border-border pt-4">
            <h4 className="text-sm font-medium text-foreground mb-3">Technology Stack</h4>
            <div className="flex flex-wrap gap-3">
              {Array.from(allLanguages).map((language, index) => (
                <div key={language} className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: languageColors[index % languageColors.length] }}
                  ></div>
                  <span className="text-sm text-muted-foreground">{language}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 