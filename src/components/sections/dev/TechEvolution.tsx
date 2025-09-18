import { Code2, TrendingUp, TrendingUpDown } from "lucide-react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface Repository {
  name: string;
  language: string;
  created_at: string;
  stargazers_count: number;
}

interface TechEvolutionChartProps {
  repositories: Repository[];
  hideTitle?: boolean;
  className?: string;
}

export const TechEvolutionChart = ({ repositories, hideTitle = false, className = "" }: TechEvolutionChartProps) => {
  if (!repositories.length) {
    return (
      <div className={`flex flex-col h-full w-full ${className}`}>
        {!hideTitle && (
          <div className="pb-4 flex items-center gap-3">
            <TrendingUp className="w-5 h-5" />
            <h4 className="font-semibold">Technology Evolution</h4>
          </div>
        )}
        <div className="flex-1 flex items-center justify-center text-muted-foreground h-80">
          <div className="text-center">
            <Code2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <p>No repository data available</p>
          </div>
        </div>
      </div>
    );
  }

  // Get all repositories with languages, sorted by creation date
  const reposWithLanguages = repositories
    .filter(repo => repo.language)
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

  if (reposWithLanguages.length === 0) {
    return (
      <div className={`flex flex-col h-full w-full ${className}`}>
        {!hideTitle && (
          <div className="pb-4 flex items-center gap-3">
            <TrendingUp className="w-5 h-5" />
            <h4 className="font-semibold">Technology Evolution</h4>
          </div>
        )}
        <div className="flex-1 flex items-center justify-center text-muted-foreground h-80">
          <div className="text-center">
            <Code2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <p>No language data available</p>
          </div>
        </div>
      </div>
    );
  }

  // Calculate cumulative unique technologies
  const seenTechnologies = new Set<string>();
  const chartData: Array<{
    time: string;
    cumulativeTechnologies: number;
  }> = [];

  // Group by year-month for better visualization
  const groupedByTime = reposWithLanguages.reduce((acc, repo) => {
    const date = new Date(repo.created_at);
    const year = date.getFullYear();
    const month = date.getMonth();
    const timeKey = `${year}-${(month + 1).toString().padStart(2, '0')}`;
    
    if (!acc[timeKey]) {
      acc[timeKey] = [];
    }
    acc[timeKey].push(repo);
    return acc;
  }, {} as Record<string, Repository[]>);

  // Process each time period
  Object.keys(groupedByTime)
    .sort()
    .forEach(timeKey => {
      const reposInPeriod = groupedByTime[timeKey];
      
      reposInPeriod.forEach(repo => {
        if (!seenTechnologies.has(repo.language)) {
          seenTechnologies.add(repo.language);
        }
      });
      
      chartData.push({
        time: timeKey,
        cumulativeTechnologies: seenTechnologies.size
      });
    });

  // If we only have one data point, fallback to year-based chart
  if (chartData.length <= 1) {
    const yearData = reposWithLanguages.reduce((acc, repo) => {
      const year = new Date(repo.created_at).getFullYear();
      if (!acc[year]) {
        acc[year] = new Set();
      }
      acc[year].add(repo.language);
      return acc;
    }, {} as Record<number, Set<string>>);

    let cumulative = 0;
    chartData.length = 0; // Clear existing data
    
    Object.keys(yearData)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .forEach(year => {
        const yearInt = parseInt(year);
        const uniqueTechsInYear = yearData[yearInt].size;
        cumulative += uniqueTechsInYear;
        
        chartData.push({
          time: year,
          cumulativeTechnologies: cumulative
        });
      });
  }

  // Get all unique technologies for display
  const allTechnologies = Array.from(seenTechnologies).sort();

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card rounded-lg p-3 shadow-md">
          <p className="font-semibold text-foreground mb-2">{label}</p>
          <p className="text-muted-foreground">
            Total Technologies: {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-96 w-full flex flex-col items-center">
      <div className="flex items-center gap-2 mb-2 text-sm font-medium select-none bg-white/10 rounded-lg p-2 z-10">
        <TrendingUpDown className="w-6 h-6 text-white" />
        <span className="font-bold text-white">Tech Stack Evolution</span>
     </div>
    <div className={`flex flex-col h-full w-full ${className}`}>
      {!hideTitle && (
        <div className="pb-4 flex items-center gap-3">
          <TrendingUp className="w-5 h-5" />
          <h4 className="font-semibold">Technology Evolution</h4>
        </div>
      )}
      <div className="space-y-4 py-8 flex-1 w-full">
        {/* Chart */}
        <div className="flex-1 w-full">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <XAxis 
                dataKey="time" 
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
              <Line
                type="monotone"
                dataKey="cumulativeTechnologies"
                stroke="#3B82F6"
                strokeWidth={3}
                dot={{ fill: "#3B82F6", strokeWidth: 2, r: 5 }}
                activeDot={{ r: 7, stroke: "#3B82F6", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Technologies List (optional) */}
        {/* <div className="pt-2">
          <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
            Technologies Used ({allTechnologies.length})
          </h4>
          <div className="flex flex-wrap gap-2">
            {allTechnologies.map((tech) => (
              <div
                key={tech}
                className="px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-400"
              >
                {tech}
              </div>
            ))}
          </div>
        </div> */}
      </div>
    </div>
    </div>
  );
};
