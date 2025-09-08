
'use client';

import * as React from 'react';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

const labelMap: { [key: string]: string } = {
  "Core Idea & Innovation": "CI & I",
  "Market & Commercial Opportunity": "M & CO",
  "Execution & Operations": "E & O",
  "Business Model & Strategy": "BM & S",
  "Team & Organizational Health": "T & OH",
  "External Environment & Compliance": "EE & C",
  "Risk & Future Outlook": "R & FO",
};

const clusterColors = [
  'hsl(var(--chart-1))',
  'hsl(var(--chart-2))',
  'hsl(var(--chart-3))',
  'hsl(var(--chart-4))',
  'hsl(var(--chart-5))',
  'hsl(var(--chart-1) / 0.7)',
  'hsl(var(--chart-2) / 0.7)',
];

export function SpiderChart({ data, maxScore = 100, size = 400 }: { data: Record<string, number>, maxScore?: number, size?: number }) {
  const padding = 80; // Increased padding to give labels more room
  const chartSize = size - padding * 2;
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = chartSize / 2;

  const validDataKeys = Object.keys(data).filter(key => typeof data[key] === 'number' && Object.keys(labelMap).includes(key));
  
  if (validDataKeys.length === 0) return null;

  const angles = validDataKeys.map((_, i) => (i * 2 * Math.PI) / validDataKeys.length - Math.PI / 2);

  const getPoint = (angle: number, value: number) => {
    const r = (value / maxScore) * radius;
    const x = centerX + r * Math.cos(angle);
    const y = centerY + r * Math.sin(angle);
    return { x, y };
  };

  const points = angles.map((angle, i) => {
    const value = data[validDataKeys[i]];
    const point = getPoint(angle, value);
    return `${point.x},${point.y}`;
  }).join(' ');

  const gridLevels = 4; // For 25, 50, 75, 100

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <TooltipProvider delayDuration={0}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="block mx-auto">
          <defs>
            <radialGradient id="spider-gradient">
              <stop offset="0%" stopColor="hsl(var(--primary) / 0.4)" />
              <stop offset="100%" stopColor="hsl(var(--primary) / 0.1)" />
            </radialGradient>
          </defs>

          {/* Grid Lines */}
          {Array.from({ length: gridLevels }).map((_, levelIndex) => {
            const gridRadius = radius * ((levelIndex + 1) / gridLevels);
            const gridPoints = angles.map(angle => {
              const x = centerX + gridRadius * Math.cos(angle);
              const y = centerY + gridRadius * Math.sin(angle);
              return `${x},${y}`;
            }).join(' ');
            return (
              <polygon
                key={`grid-${levelIndex}`}
                points={gridPoints}
                fill="none"
                stroke="hsl(var(--muted-foreground) / 0.3)"
                strokeWidth="1"
              />
            );
          })}

          {/* Spokes and Axis Labels */}
          {angles.map((angle, i) => {
            const point = getPoint(angle, maxScore);
            const isFirstSpoke = i === 0;
            return (
              <g key={`spoke-group-${i}`}>
                <line
                  key={`spoke-${i}`}
                  x1={centerX}
                  y1={centerY}
                  x2={point.x}
                  y2={point.y}
                  stroke={clusterColors[i % clusterColors.length]}
                  strokeWidth="1"
                  strokeDasharray="2 4"
                />
                {isFirstSpoke && Array.from({ length: gridLevels }).map((_, levelIndex) => {
                  if (levelIndex < gridLevels -1) return null; // Only show outermost label
                  const value = (maxScore / gridLevels) * (levelIndex + 1);
                  const labelPoint = getPoint(angle, value);
                  return (
                    <text
                      key={`axis-label-${levelIndex}`}
                      x={labelPoint.x + 5}
                      y={labelPoint.y}
                      textAnchor="start"
                      dominantBaseline="middle"
                      fontSize="12"
                      className="fill-muted-foreground"
                    >
                      {value}
                    </text>
                  );
                })}
              </g>
            );
          })}
          
          {/* Data Polygon */}
          <polygon
            points={points}
            fill="url(#spider-gradient)"
            stroke="hsl(var(--primary))"
            strokeWidth="2.5"
          />

          {/* Labels */}
          {angles.map((angle, i) => {
            const value = data[validDataKeys[i]];
            const fullLabel = validDataKeys[i];
            const shortLabel = labelMap[fullLabel] || fullLabel;
            
            const labelRadius = radius + 25;
            const textPointX = centerX + labelRadius * Math.cos(angle);
            const textPointY = centerY + labelRadius * Math.sin(angle);

            let textAnchor = "middle";
            let dominantBaseline = "middle";

            if (textPointX < centerX - 1) textAnchor = "end";
            if (textPointX > centerX + 1) textAnchor = "start";
            
            if (textPointY < centerY) dominantBaseline = "alphabetic";
            if (textPointY > centerY) dominantBaseline = "hanging";

            return (
              <g key={`label-group-${i}`}>
                <text
                  x={textPointX}
                  y={textPointY - 10}
                  textAnchor={textAnchor}
                  dominantBaseline={dominantBaseline}
                  className="font-bold text-lg"
                  fill={clusterColors[i % clusterColors.length]}
                >
                  {Math.round(value)}%
                </text>
                <text
                  x={textPointX}
                  y={textPointY + 10}
                  textAnchor={textAnchor}
                  dominantBaseline={dominantBaseline}
                  className="text-sm fill-muted-foreground"
                >
                  {shortLabel}
                </text>
              </g>
            );
          })}
        </svg>

        <div className="absolute top-0 left-0 w-full h-full">
            {angles.map((angle, i) => {
                const value = data[validDataKeys[i]];
                const fullLabel = validDataKeys[i];
                const point = getPoint(angle, value);
                const color = clusterColors[i % clusterColors.length];
                
                return (
                    <Tooltip key={`tooltip-${i}`}>
                        <TooltipTrigger asChild>
                            <div
                                className="absolute rounded-full transition-transform duration-200 ease-in-out hover:scale-150 cursor-pointer"
                                style={{
                                    left: `${point.x - 6}px`,
                                    top: `${point.y - 6}px`,
                                    width: '12px',
                                    height: '12px',
                                    backgroundColor: color,
                                    border: '2px solid hsl(var(--card))',
                                }}
                            />
                        </TooltipTrigger>
                        <TooltipContent>
                            <p className="font-bold" style={{color: color}}>{fullLabel}: {Math.round(value)}%</p>
                        </TooltipContent>
                    </Tooltip>
                )
            })}
        </div>
      </TooltipProvider>
    </div>
  );
};
