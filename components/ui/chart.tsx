import * as React from "react";
import { cn } from "@/lib/utils";

export interface ChartDataPoint {
  label: string;
  recyclables: number;
  general: number;
}

interface ChartProps extends React.HTMLAttributes<HTMLDivElement> {
  data: ChartDataPoint[];
}

export function Chart({ className, data, ...props }: ChartProps) {
  const maxValue = Math.max(
    1,
    ...data.flatMap((item) => [item.recyclables, item.general])
  );

  return (
    <div className={cn("grid grid-cols-2 gap-4 sm:grid-cols-5", className)} {...props}>
      {data.map((item) => (
        <div key={item.label} className="flex flex-col items-center gap-3">
          <div className="relative flex h-48 w-full items-end gap-2">
            <div className="relative flex h-full w-1/2 items-end justify-center rounded-2xl bg-slate-100">
              <div
                className="absolute bottom-0 h-full w-full rounded-2xl bg-slate-400"
                style={{ height: `${(item.general / maxValue) * 100}%` }}
              />
            </div>
            <div className="relative flex h-full w-1/2 items-end justify-center rounded-2xl bg-slate-100">
              <div
                className="absolute bottom-0 h-full w-full rounded-2xl bg-emerald-900"
                style={{ height: `${(item.recyclables / maxValue) * 100}%` }}
              />
            </div>
          </div>
          <span className="text-xs uppercase tracking-[0.24em] text-slate-500">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}
