import * as React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

export interface CompositionDataPoint {
  name: string;
  value: number;
  color: string;
}

interface PieChartProps extends React.HTMLAttributes<HTMLDivElement> {
  data: CompositionDataPoint[];
}

export function CompositionChart({ className, data, ...props }: PieChartProps) {
  const isEmpty = data.every((d) => d.value === 0);
  const displayData = isEmpty
    ? [{ name: "No data", value: 1, color: "#e5e7eb" }]
    : data;

  return (
    <div className={cn("flex items-center justify-center", className)} {...props}>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={displayData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
          >
            {displayData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}