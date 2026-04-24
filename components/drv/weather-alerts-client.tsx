"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CloudHail,
  Wind,
  Eye,
  Zap,
  Droplets,
  Thermometer,
  RefreshCw,
  CloudOff,
  CheckCircle2,
  CloudRain,
} from "lucide-react";
import type { WeatherWarning, WeatherSnapshot } from "@/app/drv/alerts/page";

// ── Weather code → icon ──────────────────────────────────────────────────────
function getWeatherIcon(code: number, className?: string) {
  if ([95, 96, 99].includes(code)) return <Zap className={className} />;
  if ([45, 48].includes(code)) return <Eye className={className} />;
  if ([61, 63, 65, 80, 81, 82].includes(code))
    return <CloudRain className={className} />;
  if ([51, 53, 55].includes(code)) return <Droplets className={className} />;
  return <CloudHail className={className} />;
}

// ── Severity config ──────────────────────────────────────────────────────────
const severityConfig = {
  critical: {
    bar: "bg-destructive",
    icon: "bg-destructive/10",
    iconColor: "text-destructive",
    badge: "destructive" as const,
    label: "CRITICAL",
    IconComponent: CloudHail,
  },
  warning: {
    bar: "bg-amber-500",
    icon: "bg-amber-500/10",
    iconColor: "text-amber-500",
    badge: "outline" as const,
    label: "WARNING",
    IconComponent: Wind,
  },
  info: {
    bar: "bg-primary",
    icon: "bg-primary/10",
    iconColor: "text-primary",
    badge: "default" as const,
    label: "INFO",
    IconComponent: Droplets,
  },
};

// ── Category → icon ──────────────────────────────────────────────────────────
function warningIcon(warning: WeatherWarning, className: string) {
  if (warning.id.includes("thunderstorm")) return <Zap className={className} />;
  if (warning.id.includes("wind")) return <Wind className={className} />;
  if (warning.id.includes("visibility")) return <Eye className={className} />;
  return <CloudRain className={className} />;
}

// ── Format fetch time ─────────────────────────────────────────────────────────
function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-PH", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface Props {
  weather: WeatherSnapshot | null;
  warnings: WeatherWarning[];
  fetchError: string | null;
}

export function WeatherAlertsClient({ weather, warnings, fetchError }: Props) {
  const criticalCount = warnings.filter((w) => w.severity === "critical").length;
  const warningCount = warnings.filter((w) => w.severity === "warning").length;
  const infoCount = warnings.filter((w) => w.severity === "info").length;

  return (
    <main className="p-4 md:p-6 max-w-4xl mx-auto space-y-5 md:space-y-6 overflow-x-hidden">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Weather Alerts</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Live conditions for{" "}
          <span className="text-foreground font-medium">
            {weather?.municipalityName ?? "your area"}
          </span>
          {weather?.fetchedAt && (
            <> · Updated {formatTime(weather.fetchedAt)}</>
          )}
        </p>
      </div>

      {/* ── Fetch error ─────────────────────────────────────────────────── */}
      {fetchError && (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="flex items-center gap-3 py-4">
            <CloudOff className="h-5 w-5 text-destructive shrink-0" />
            <div>
              <p className="text-sm font-semibold text-destructive">
                Weather data unavailable
              </p>
              <p className="text-xs text-muted-foreground">
                Could not reach Open-Meteo. Check your connection and refresh.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Current conditions strip ─────────────────────────────────────── */}
      {weather && (
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 md:gap-x-6 md:gap-y-3">
              {/* Condition icon + label */}
              <div className="flex items-center gap-2">
                {getWeatherIcon(
                  weather.weather_code,
                  "h-5 w-5 text-primary"
                )}
                <span className="text-sm font-medium">{weather.condition}</span>
              </div>

              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Thermometer className="h-4 w-4" />
                <span>
                  {weather.temperature.toFixed(0)}°C
                  <span className="text-xs ml-1">
                    (feels {weather.feels_like.toFixed(0)}°C)
                  </span>
                </span>
              </div>

              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Droplets className="h-4 w-4" />
                <span>{weather.precipitation.toFixed(1)} mm/h</span>
              </div>

              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Wind className="h-4 w-4" />
                <span>{weather.wind_speed.toFixed(0)} km/h</span>
              </div>

              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <Droplets className="h-4 w-4 opacity-60" />
                <span>{weather.humidity}% humidity</span>
              </div>

              {weather.max_precip_6h > 0 && (
                <div className="flex items-center gap-1.5 text-sm text-amber-500">
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>
                    Up to {weather.max_precip_6h.toFixed(1)} mm/h in next 6 h
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Summary badges ──────────────────────────────────────────────── */}
      {weather && (
        <div className="flex flex-wrap gap-2">
          {criticalCount > 0 && (
            <Badge variant="destructive" className="gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
              {criticalCount} Critical
            </Badge>
          )}
          {warningCount > 0 && (
            <Badge
              variant="outline"
              className="gap-1.5 border-amber-500/50 text-amber-500"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              {warningCount} Warning
            </Badge>
          )}
          {infoCount > 0 && (
            <Badge variant="secondary" className="gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              {infoCount} Info
            </Badge>
          )}
        </div>
      )}

      {/* ── Warning cards ────────────────────────────────────────────────── */}
      {warnings.length > 0 ? (
        <div className="flex flex-col gap-4">
          {warnings.map((warning) => {
            const cfg = severityConfig[warning.severity];
            return (
              <div key={warning.id} className="flex gap-3 items-stretch">
                {/* Left severity bar */}
                <div className={`w-1 rounded-full shrink-0 ${cfg.bar}`} />

                <Card className="flex-1">
                  <CardHeader className="pb-2 pt-4 px-4">
                    <div className="flex items-start gap-3">
                      {/* Icon bubble */}
                      <div
                        className={`h-10 w-10 rounded-lg shrink-0 flex items-center justify-center ${cfg.icon}`}
                      >
                        {warningIcon(warning, `h-5 w-5 ${cfg.iconColor}`)}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge
                            variant={cfg.badge}
                            className={
                              warning.severity === "warning"
                                ? "border-amber-500/50 text-amber-500 bg-amber-500/10"
                                : ""
                            }
                          >
                            {warning.category}
                          </Badge>
                        </div>
                        <CardTitle className="text-sm font-semibold leading-snug">
                          {warning.title}
                        </CardTitle>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="px-4 pb-4">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {warning.detail}
                    </p>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      ) : (
        !fetchError && (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-sm">No active weather warnings</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Conditions are safe for your route. Data refreshes every 5
                  minutes.
                </p>
              </div>
            </CardContent>
          </Card>
        )
      )}

      {/* ── Source footnote ─────────────────────────────────────────────── */}
      <p className="text-[11px] text-muted-foreground/60 text-center pb-2">
        Weather data powered by Open-Meteo · Free & open-source ·{" "}
        <a
          href="https://open-meteo.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2 hover:text-muted-foreground transition-colors"
        >
          open-meteo.com
        </a>
      </p>
    </main>
  );
}
