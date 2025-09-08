
'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface ScoreDisplayProps {
    score: number | null;
    status: string;
}

const getScoreColor = (score: number | null) => {
    if (score === null) return 'text-muted-foreground';
    if (score >= 85) return 'text-green-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
};

export function ScoreDisplay({ score, status }: ScoreDisplayProps) {
    const scoreColor = getScoreColor(score);
    const circumference = 2 * Math.PI * 20;
    const strokeDashoffset = score !== null ? circumference - (score / 100) * circumference : circumference;

    return (
        <div className="flex flex-col items-center gap-2 text-center w-32">
            <div className="relative h-24 w-24">
                <svg className="h-full w-full" viewBox="0 0 50 50">
                    <circle cx="25" cy="25" r="20" className="stroke-muted" strokeWidth="4" fill="transparent" />
                    <circle
                    cx="25"
                    cy="25"
                    r="20"
                    className={cn("stroke-current transition-all duration-500 ease-in-out", scoreColor)}
                    strokeWidth="4"
                    fill="transparent"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    transform="rotate(-90 25 25)"
                    />
                </svg>
                <span className={cn("absolute inset-0 flex items-center justify-center text-xl font-bold", scoreColor)}>
                    {score !== null ? score.toFixed(0) : 'N/A'}
                </span>
            </div>
            <span className={cn("font-semibold", scoreColor)}>{status}</span>
        </div>
    );
}
