import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, TrendingUp } from "lucide-react";
import { Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface Repository {
  name: string;
  stargazers_count: number;
  forks_count: number;
  created_at: string;
  updated_at: string;
}

interface StarsForksChartProps {
  repositories: Repository[];
}

export const StarsForksChart = ({ repositories }: StarsForksChartProps) => {
  if (!repositories.length) {
    return (
      <Card className="card-minimal">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5" />
            Stars vs Forks Evolution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Star className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
              <p>No repository data available</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Group repositories by year and sum stars/forks
  const evolutionData = repositories
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .reduce((acc, repo) => {
      const year = new Date(repo.created_at).getFullYear();
      if (!acc[year]) {
        acc[year] = { stars: 0, forks: 0, repos: 0 };
      }
      acc[year].stars += repo.stargazers_count;
      acc[year].forks += repo.forks_count;
      acc[year].repos += 1;
      return acc;
    }, {} as Record<number, { stars: number; forks: number; repos: number }>);

  // Convert to chart data format
  const chartData = Object.keys(evolutionData)
    .sort((a, b) => parseInt(a) - parseInt(b))
    .map(year => ({
      year: parseInt(year),
      stars: evolutionData[parseInt(year)].stars,
      forks: evolutionData[parseInt(year)].forks,
      repos: evolutionData[parseInt(year)].repos,
    }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-md">
          <p className="font-semibold text-foreground mb-2">Year {label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-muted-foreground flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              {entry.name === "stars" ? "Stars" : entry.name === "forks" ? "Forks" : "Repos"}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => (
    <div className="flex gap-4 justify-center mt-4">
      {payload?.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm font-medium text-foreground capitalize">
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <Card className="card-minimal">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3">
          <TrendingUp className="w-5 h-5" />
          Stars vs Forks Evolution
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <XAxis 
                dataKey="year" 
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                tickLine={{ stroke: "hsl(var(--border))" }}
              />
              <YAxis 
                tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                axisLine={{ stroke: "hsl(var(--border))" }}
                tickLine={{ stroke: "hsl(var(--border))" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend content={<CustomLegend />} />
              <Line
                type="monotone"
                dataKey="stars"
                stroke="#F59E0B"
                strokeWidth={3}
                dot={{ fill: "#F59E0B", strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7, stroke: "#F59E0B", strokeWidth: 2 }}
              />
              <Line
                type="monotone"
                dataKey="forks"
                stroke="#8B5CF6"
                strokeWidth={3}
                dot={{ fill: "#8B5CF6", strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7, stroke: "#8B5CF6", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}; 