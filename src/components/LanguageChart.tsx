import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

interface LanguageData {
  name: string;
  value: number;
  percentage: number;
}

interface LanguageChartProps {
  languages: LanguageData[];
}

const COLORS = [
  "#3B82F6", // Blue
  "#10B981", // Green
  "#F59E0B", // Amber
  "#EF4444", // Red
  "#8B5CF6", // Purple
  "#06B6D4", // Cyan
  "#F97316", // Orange
  "#EC4899", // Pink
  "#84CC16", // Lime
  "#6366F1", // Indigo
];

export const LanguageChart = ({ languages }: LanguageChartProps) => {
  if (!languages.length) return null;

  const data = languages.slice(0, 10).map((lang, index) => ({
    ...lang,
    fill: COLORS[index % COLORS.length],
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-md">
          <p className="font-semibold text-foreground">{label}</p>
          <p className="text-muted-foreground">
            {payload[0].value.toLocaleString()} bytes ({payload[0].payload.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => (
    <div className="flex flex-wrap gap-3 justify-center mt-4">
      {payload?.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm font-medium text-foreground">
            {entry.value}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.fill}
                stroke="hsl(var(--card))"
                strokeWidth={1}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};