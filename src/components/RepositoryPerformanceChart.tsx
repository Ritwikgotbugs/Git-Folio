import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend, LineChart, Line } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, Calendar, Clock } from "lucide-react";

interface Repository {
  name: string;
  stargazers_count: number;
  forks_count: number;
  size: number;
  updated_at: string;
  created_at: string;
  language: string;
  topics: string[];
}

interface RepositoryPerformanceChartProps {
  repositories: Repository[];
}

export const RepositoryPerformanceChart = ({ repositories }: RepositoryPerformanceChartProps) => {
  if (!repositories.length) return null;

  // Contribution Frequency Analysis (based on creation dates)
  const contributionFrequency = repositories.reduce((acc, repo) => {
    const date = new Date(repo.created_at);
    const dayOfWeek = date.getDay(); // 0 = Sunday, 1 = Monday, etc.
    const hour = date.getHours();
    
    // Day of week analysis
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    acc.days[dayNames[dayOfWeek]]++;
    
    // Time of day analysis (simplified to morning/afternoon/evening/night)
    if (hour >= 6 && hour < 12) acc.timeSlots.morning++;
    else if (hour >= 12 && hour < 18) acc.timeSlots.afternoon++;
    else if (hour >= 18 && hour < 24) acc.timeSlots.evening++;
    else acc.timeSlots.night++;
    
    return acc;
  }, {
    days: { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 },
    timeSlots: { morning: 0, afternoon: 0, evening: 0, night: 0 }
  });

  const dayData = Object.entries(contributionFrequency.days).map(([day, count]) => ({
    day,
    count,
    color: '#3B82F6'
  }));

  const timeData = Object.entries(contributionFrequency.timeSlots).map(([time, count]) => ({
    time: time.charAt(0).toUpperCase() + time.slice(1),
    count,
    color: '#10B981'
  }));

  // Repository Activity Timeline
  const activityTimeline = repositories
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .reduce((acc, repo) => {
      const createdYear = new Date(repo.created_at).getFullYear();
      const updatedYear = new Date(repo.updated_at).getFullYear();
      
      if (!acc[createdYear]) acc[createdYear] = { created: 0, updated: 0 };
      if (!acc[updatedYear]) acc[updatedYear] = { created: 0, updated: 0 };
      
      acc[createdYear].created++;
      acc[updatedYear].updated++;
      
      return acc;
    }, {} as Record<number, { created: number; updated: number }>);

  const timelineData = Object.keys(activityTimeline)
    .sort((a, b) => parseInt(a) - parseInt(b))
    .map(year => ({
      year: parseInt(year),
      created: activityTimeline[parseInt(year)].created,
      updated: activityTimeline[parseInt(year)].updated,
    }));

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
              {entry.name === "stars" ? "Stars" : entry.name === "forks" ? "Forks" : entry.name}: {entry.value}
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
          Developer Analytics
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contribution Frequency */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Contribution Frequency
            </h4>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dayData} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                  <XAxis 
                    dataKey="day" 
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
                  <Bar 
                    dataKey="count" 
                    fill="#3B82F6"
                    radius={[3, 3, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Repository Activity Timeline */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Repository Activity Timeline
            </h4>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
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
                    dataKey="created"
                    stroke="#3B82F6"
                    strokeWidth={3}
                    dot={{ fill: "#3B82F6", strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 7, stroke: "#3B82F6", strokeWidth: 2 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="updated"
                    stroke="#10B981"
                    strokeWidth={3}
                    dot={{ fill: "#10B981", strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 7, stroke: "#10B981", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 