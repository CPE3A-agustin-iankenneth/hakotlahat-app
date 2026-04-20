"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Chart } from "@/components/ui/chart";
import { CompositionChart } from "@/components/ui/composition-chart";
import { Progress } from "@/components/ui/progress";
import { Leaf, CheckCircle } from "lucide-react";

const monthlyData = [
  { label: "Jan", recyclables: 56, general: 32 },
  { label: "Feb", recyclables: 68, general: 29 },
  { label: "Mar", recyclables: 54, general: 41 },
  { label: "Apr", recyclables: 73, general: 27 },
  { label: "May", recyclables: 82, general: 21 },
];

const compositionData = [
  { name: "Plastic & Paper", value: 65, color: "#059669" },
  { name: "Organic", value: 20, color: "#10b981" },
  { name: "Other", value: 15, color: "#d1d5db" },
];

export default function ReportsPage() {
  return (

    <div className="p-6 bg-gray-100 min-h-screen space-y-6">
      <div className="flex items-start gap-3">
        <div className="w-1 rounded-full bg-emerald-600 self-stretch" />
        <div>
          <h1 className="text-3xl font-bold mb-2">Impact Analytics</h1>
          <p className="text-gray-500">
            Your contribution to a sustainable community.
          </p>
        </div>
      </div>
         
      <div className="grid gap-6 lg:grid-cols-2 lg:items-stretch">
        <Card className="relative overflow-hidden bg-white shadow-sm h-full">
          <div className="pointer-events-none absolute top-6 right-6 h-40 w-40 rounded-full bg-emerald-100/80 blur-3xl" />
          <CardContent className="relative grid gap-8 h-full">
            <div className="space-y-3">
              <p className="text-2xl font-bold uppercase tracking-[0.10em] text-emerald-600">
                Impact overview
              </p>
              <div className="space-y-4">
                <p className="text-sm text-slate-500">Total Waste Diverted</p>
                <div className="flex flex-wrap items-end gap-6">
                  <div className="flex items-end gap-3">
                    <p className="text-7xl font-bold tracking-tight text-slate-950">420</p>
                    <span className="text-3xl font-semibold text-slate-500">kg</span>
                  </div>
                  <div className="rounded-full bg-emerald-100 px-4 py-2 text-sm font-semibold text-emerald-800 shadow-sm">
                    <p className="text-xs text-emerald-600">Community Rank</p>
                    <div className="mt-2 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1">
                      <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-600" />
                      Top 5%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm h-full">
          <CardContent className="space-y-6 h-full">
            <div className="space-y-4">
              <p className="text-2xl font-bold uppercase tracking-[0.10em] text-slate-500">
                Streaks & milestones
              </p>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-m text-slate-500">Clean Streak</p>
                  <p className="text-3xl font-bold text-slate-950">12 Weeks</p>
                </div>
              </div>
            </div>

            <div className="flex-1">
              <Progress value={69} className="h-3 rounded-full bg-slate-200" />
            </div>

            <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-500 text-white shadow-sm">
                  <Leaf className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.10em] text-slate-500">
                    Latest badge
                  </p>
                  <p className="text-2xl font-semibold text-slate-950">Zero waste</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm h-full">
          <CardContent className="space-y-6 h-full">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-2xl font-bold text-slate-950">Monthly Collection</p>
              </div>
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <div className="inline-flex items-center gap-2">
                  <span className="inline-flex h-2.5 w-2.5 rounded-full bg-emerald-900" />
                  Recyclables
                </div>
                <div className="inline-flex items-center gap-2">
                  <span className="inline-flex h-2.5 w-2.5 rounded-full bg-slate-300" />
                  General
                </div>
              </div>
            </div>
            <div className="flex-1">
              <Chart data={monthlyData} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm h-full">
          <CardContent className="space-y-6 h-full">
            <div>
              <p className="text-2xl font-bold text-slate-950">Composition</p>
            </div>
            <div className="flex-1">
              <CompositionChart data={compositionData} />
            </div>
            <div className="space-y-3">
              {compositionData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-flex h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: item.color }}
                    />
                    {item.name}
                  </div>
                  <span className="font-semibold text-slate-950">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gray-200 shadow-sm">
        <CardContent className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white shadow-sm">
              <CheckCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="font-bold text-slate-950 text-2xl">Civic Impact</p>
              <p className="mt-2 text-sm text-slate-600">
                Your consistent recycling efforts this quarter have saved approximately 15 trees and reduced landfill mass by 0.8 cubic meters. You are actively helping our city reach its 2030 zero-waste sustainability goals.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

