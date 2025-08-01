import { Bar, BarChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface RepoStats {
  name: string;
  stars: number;
  forks: number;
}

interface RepoStatsChartProps {
  repos: RepoStats[];
}

export const RepoStatsChart = ({ repos }: RepoStatsChartProps) => {
  if (!repos.length) return null;

  const data = repos
    .filter(repo => repo.stars > 0 || repo.forks > 0)
    .slice(0, 8)
    .map(repo => ({
      name: repo.name.length > 12 ? repo.name.substring(0, 12) + '...' : repo.name,
      stars: repo.stars,
      forks: repo.forks,
    }));

  if (!data.length) return null;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-md">
          <p className="font-semibold text-foreground mb-2">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-muted-foreground flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              {entry.name === "stars" ? "Stars" : "Forks"}: {entry.value}
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
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <XAxis 
            dataKey="name" 
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 11 }}
            axisLine={{ stroke: "hsl(var(--border))" }}
            tickLine={{ stroke: "hsl(var(--border))" }}
            angle={-45}
            textAnchor="end"
            height={80}
          />
          <YAxis 
            tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
            axisLine={{ stroke: "hsl(var(--border))" }}
            tickLine={{ stroke: "hsl(var(--border))" }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
          <Bar 
            dataKey="stars" 
            fill="hsl(var(--chart-1))" 
            radius={[3, 3, 0, 0]}
          />
          <Bar 
            dataKey="forks" 
            fill="hsl(var(--chart-2))" 
            radius={[3, 3, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};