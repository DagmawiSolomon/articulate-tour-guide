"use client";

import * as React from "react";
import { MAP_ROUTES, MapRoute } from "@/lib/demo-tour-data";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface GalleryMapViewProps {
  activeRouteId?: "restrooms" | "gauguin" | "elevator";
}

export function GalleryMapView({ activeRouteId = "restrooms" }: GalleryMapViewProps) {
  const route: MapRoute = MAP_ROUTES[activeRouteId] || MAP_ROUTES.restrooms;

  return (
    <div className="w-full h-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-center overflow-y-auto pr-1">
      {/* Floorplan Vector Stage */}
      <div className="lg:col-span-7 h-full flex flex-col items-center justify-center">
        <div className="relative w-full h-[340px] sm:h-[380px] lg:h-full max-h-[480px] 2xl:max-h-[540px] rounded-xl overflow-hidden border border-border bg-card p-4 flex items-center justify-center shadow-xs">
          <svg
            viewBox="0 0 500 400"
            className="w-full h-full select-none"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Museum Wing Outer Boundaries */}
            <rect
              x="20"
              y="20"
              width="460"
              height="360"
              rx="8"
              className="fill-muted/30 stroke-border"
              strokeWidth="1.5"
            />

            {/* Gallery Rooms */}
            {/* Gallery 34 - Manet/Degas */}
            <rect
              x="40"
              y="120"
              width="60"
              height="100"
              rx="4"
              className="fill-card stroke-border"
              strokeWidth="1"
            />
            <text x="70" y="165" textAnchor="middle" className="fill-muted-foreground text-[9px] font-sans font-medium">
              Gallery 34
            </text>
            <text x="70" y="177" textAnchor="middle" className="fill-muted-foreground/70 text-[8px] font-sans">
              Manet / Degas
            </text>

            {/* Gallery 35 - Monet */}
            <rect
              x="110"
              y="120"
              width="70"
              height="100"
              rx="4"
              className="fill-card stroke-border"
              strokeWidth="1"
            />
            <text x="145" y="165" textAnchor="middle" className="fill-muted-foreground text-[9px] font-sans font-medium">
              Gallery 35
            </text>
            <text x="145" y="177" textAnchor="middle" className="fill-muted-foreground/70 text-[8px] font-sans">
              Monet
            </text>

            {/* Gallery 36 - Van Gogh (CURRENT ROOM) */}
            <rect
              x="190"
              y="120"
              width="90"
              height="100"
              rx="4"
              className="fill-muted/20 stroke-foreground"
              strokeWidth="1.5"
            />
            <text x="235" y="145" textAnchor="middle" className="fill-foreground text-[10px] font-sans font-semibold">
              Gallery 36
            </text>
            <text x="235" y="157" textAnchor="middle" className="fill-foreground/80 text-[8px] font-sans">
              Van Gogh (Starry Night)
            </text>

            {/* Visitor "You are here" marker */}
            <g transform="translate(220, 170)">
              <circle r="6" className="fill-foreground" />
              <circle r="12" className="stroke-foreground/40" strokeWidth="1" />
              <text x="0" y="24" textAnchor="middle" className="fill-foreground text-[8px] font-sans font-semibold">
                You are here
              </text>
            </g>

            {/* Gallery 37 - Gauguin */}
            <rect
              x="290"
              y="120"
              width="80"
              height="100"
              rx="4"
              className={`fill-card stroke-border ${activeRouteId === "gauguin" ? "stroke-foreground stroke-[1.5]" : ""}`}
              strokeWidth="1"
            />
            <text x="330" y="165" textAnchor="middle" className="fill-muted-foreground text-[9px] font-sans font-medium">
              Gallery 37
            </text>
            <text x="330" y="177" textAnchor="middle" className="fill-muted-foreground/70 text-[8px] font-sans">
              Gauguin
            </text>

            {/* Gallery 38 - Cezanne */}
            <rect
              x="380"
              y="120"
              width="80"
              height="100"
              rx="4"
              className="fill-card stroke-border"
              strokeWidth="1"
            />
            <text x="420" y="165" textAnchor="middle" className="fill-muted-foreground text-[9px] font-sans font-medium">
              Gallery 38
            </text>
            <text x="420" y="177" textAnchor="middle" className="fill-muted-foreground/70 text-[8px] font-sans">
              Cézanne
            </text>

            {/* North Concourse Corridor */}
            <rect
              x="40"
              y="40"
              width="420"
              height="60"
              rx="4"
              className="fill-card/50 stroke-border"
              strokeWidth="1"
            />
            <text x="250" y="75" textAnchor="middle" className="fill-muted-foreground/60 text-[9px] font-sans tracking-wide">
              Level 5 Grand Concourse
            </text>

            {/* West Elevators */}
            <g transform="translate(40, 50)">
              <rect
                x="0"
                y="0"
                width="40"
                height="40"
                rx="3"
                className={`fill-muted/40 stroke-border ${activeRouteId === "elevator" ? "stroke-foreground stroke-[1.5]" : ""}`}
              />
              <text x="20" y="24" textAnchor="middle" className="fill-foreground text-[8px] font-sans font-medium">
                Elevator
              </text>
            </g>

            {/* South Corridor & Restrooms */}
            <rect
              x="100"
              y="310"
              width="180"
              height="55"
              rx="4"
              className={`fill-card stroke-border ${activeRouteId === "restrooms" ? "stroke-foreground stroke-[1.5]" : ""}`}
              strokeWidth="1"
            />
            <text x="190" y="340" textAnchor="middle" className="fill-foreground text-[9px] font-sans font-medium">
              Restrooms & Cloakroom
            </text>

            {/* South East Cafe */}
            <rect
              x="300"
              y="310"
              width="160"
              height="55"
              rx="4"
              className="fill-card/40 stroke-border"
              strokeWidth="1"
            />
            <text x="380" y="340" textAnchor="middle" className="fill-muted-foreground text-[9px] font-sans">
              Café Campana
            </text>

            {/* Active Wayfinding Route Line */}
            <path
              d={route.pathD}
              fill="none"
              className="stroke-foreground"
              strokeWidth="2"
              strokeDasharray="5 4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Target Destination Marker */}
            <g transform={`translate(${route.targetCoords.x}, ${route.targetCoords.y})`}>
              <circle r="7" className="fill-foreground" />
              <circle r="13" className="stroke-foreground/30" strokeWidth="1" />
              <text x="0" y="3" textAnchor="middle" className="fill-background text-[8px] font-sans font-bold">
                ✓
              </text>
            </g>
          </svg>
        </div>
      </div>

      {/* Route & Guidance Details */}
      <div className="lg:col-span-5 flex flex-col justify-center">
        <Card className="border-border bg-card shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl font-semibold tracking-tight text-foreground">
              {route.targetRoom}
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              From Gallery 36 · {route.distance} ({route.walkingTime})
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3 text-sm">
            <ol className="space-y-2 text-xs text-muted-foreground">
              {route.steps.map((step, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="shrink-0 size-4 rounded-full bg-muted border border-border flex items-center justify-center font-mono text-[10px] text-foreground font-medium">
                    {idx + 1}
                  </span>
                  <span className="leading-tight pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
