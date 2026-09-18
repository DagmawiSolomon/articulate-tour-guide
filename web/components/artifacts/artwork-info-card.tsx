"use client";

import * as React from "react";
import Image from "next/image";
import { ARTWORK_DATA } from "@/lib/demo-tour-data";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function ArtworkInfoCard() {
  return (
    <div className="w-full h-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-center overflow-y-auto pr-1">
      {/* Visual Canvas Area */}
      <div className="lg:col-span-7 h-full flex flex-col items-center justify-center">
        <div className="relative w-full h-[340px] sm:h-[380px] lg:h-full max-h-[480px] 2xl:max-h-[540px] rounded-xl overflow-hidden border border-border bg-muted/20 shadow-xs">
          <Image
            src={ARTWORK_DATA.imageSrc}
            alt={ARTWORK_DATA.title}
            fill
            sizes="(max-width: 1024px) 100vw, 55vw"
            priority
            className="object-cover"
          />
        </div>
      </div>

      {/* Curatorial Details */}
      <div className="lg:col-span-5 flex flex-col justify-center">
        <Card className="border-border bg-card shadow-xs">
          <CardHeader className="pb-3">
            <CardTitle className="text-xl font-semibold tracking-tight text-foreground">
              {ARTWORK_DATA.title}
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              {ARTWORK_DATA.artist} · {ARTWORK_DATA.year}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4 text-sm">
            <div className="space-y-1.5">
              <div className="flex justify-between py-1 border-b border-border/50 text-xs">
                <span className="text-muted-foreground">Medium</span>
                <span className="font-medium text-foreground">{ARTWORK_DATA.medium}</span>
              </div>
              <div className="flex justify-between py-1 text-xs">
                <span className="text-muted-foreground">Dimensions</span>
                <span className="font-medium text-foreground">{ARTWORK_DATA.dimensions}</span>
              </div>
            </div>

            <Separator />

            <p className="text-xs leading-relaxed text-muted-foreground">
              {ARTWORK_DATA.summary}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
