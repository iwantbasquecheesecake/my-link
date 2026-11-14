"use client";

import React from "react";
import { Zap, Code2, Globe2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function SkillsCard() {
  const techSkills = ["Next.js 15", "React 19", "TypeScript", "Tailwind CSS"];
  const gisSkills = ["Leaflet", "Mapbox GL", "Turf.js", "GeoJSON", "WebGIS"];

  return (
    <Card className="rounded-[20px] overflow-hidden bg-card text-card-foreground">
      <CardHeader className="p-4 pb-2 sm:p-5 sm:pb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#D6E1D8]/70 dark:bg-[#1E3024] flex items-center justify-center text-[#4D6E56]">
            <Zap className="w-4 h-4 fill-current" />
          </div>
          <CardTitle className="text-sm font-bold text-foreground">
            Focus & Skills (역량 요약)
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-1 sm:p-5 sm:pt-1 space-y-2.5 text-xs">
        {/* 프론트엔드 테크 스택 */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1 font-semibold text-foreground min-w-16">
            <Code2 className="w-3.5 h-3.5 text-[#4D6E56]" />
            <span>Tech:</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            {techSkills.map((tech) => (
              <Badge
                key={tech}
                variant="forest"
                size="sm"
              >
                {tech}
              </Badge>
            ))}
          </div>
        </div>

        {/* GIS 공간정보 스택 */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="flex items-center gap-1 font-semibold text-foreground min-w-16">
            <Globe2 className="w-3.5 h-3.5 text-[#4D6E56]" />
            <span>GIS:</span>
          </span>
          <div className="flex flex-wrap gap-1.5">
            {gisSkills.map((gis) => (
              <Badge
                key={gis}
                variant="soft"
                size="sm"
              >
                {gis}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
