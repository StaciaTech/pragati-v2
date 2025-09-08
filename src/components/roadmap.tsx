
'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ROADMAP_PHASES, ROLES } from '@/lib/constants';
import { Check, Rocket, ChevronLeft, ChevronRight } from 'lucide-react';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from './ui/button';

interface RoadmapProps {
  currentTrl: string;
  role: string | null;
}

export function Roadmap({ currentTrl, role }: RoadmapProps) {
  const currentPhaseIndex = ROADMAP_PHASES.findIndex(phase => phase.trls.includes(currentTrl));
  const [viewedPhaseIndex, setViewedPhaseIndex] = React.useState(currentPhaseIndex);

  React.useEffect(() => {
    setViewedPhaseIndex(currentPhaseIndex);
  }, [currentTrl, currentPhaseIndex]);
  
  const isMentor = role === ROLES.MENTOR;

  if (currentPhaseIndex === -1) {
    return <p className="text-muted-foreground">TRL not defined or invalid.</p>;
  }

  const viewedPhase = ROADMAP_PHASES[viewedPhaseIndex];

  return (
    <TooltipProvider>
      <div className="w-full">
        <div className="relative h-2 w-full rounded-full bg-muted mb-4">
          <motion.div
            className="absolute top-0 left-0 h-2 rounded-full bg-gradient-to-r from-primary to-indigo-500"
            initial={{ width: '0%' }}
            animate={{ width: `${(currentPhaseIndex / (ROADMAP_PHASES.length - 1)) * 100}%` }}
            transition={{ duration: 1, ease: 'easeInOut' }}
          />
          <div className="absolute top-0 left-0 w-full h-full flex justify-between items-center">
            {ROADMAP_PHASES.map((phase, index) => (
              <Tooltip key={phase.name}>
                <TooltipTrigger asChild>
                  <div className="relative">
                    <motion.div
                      className={cn(
                        'h-4 w-4 rounded-full border-2 transition-colors cursor-pointer',
                        index <= currentPhaseIndex ? 'bg-primary border-primary-foreground' : 'bg-muted border-border',
                        index === viewedPhaseIndex && 'ring-2 ring-offset-2 ring-primary ring-offset-background'
                      )}
                      whileHover={{ scale: 1.5 }}
                      onClick={() => setViewedPhaseIndex(index)}
                    >
                      {index < currentPhaseIndex && <Check className="h-3 w-3 text-primary-foreground" />}
                    </motion.div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p className="font-bold">{phase.name} ({phase.trls.join(', ')})</p>
                    <p className="text-sm text-muted-foreground">Est. Timeline: {phase.timeline}</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-5 gap-2 mt-2">
          {ROADMAP_PHASES.map((phase, index) => (
            <div key={phase.name} className={cn('text-center text-xs font-medium', index === currentPhaseIndex ? 'text-primary' : 'text-muted-foreground')}>
              {phase.name}
            </div>
          ))}
        </div>

        <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
                <h4 className="font-semibold text-lg">
                    Key Activities for: <span className="text-primary">{viewedPhase.name}</span>
                </h4>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setViewedPhaseIndex(prev => Math.max(0, prev - 1))} disabled={viewedPhaseIndex === 0}>
                        <ChevronLeft className="h-4 w-4" />
                        <span className="sr-only">Previous Phase</span>
                    </Button>
                     <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setViewedPhaseIndex(prev => Math.min(ROADMAP_PHASES.length - 1, prev + 1))} disabled={viewedPhaseIndex === ROADMAP_PHASES.length - 1}>
                        <ChevronRight className="h-4 w-4" />
                        <span className="sr-only">Next Phase</span>
                    </Button>
                </div>
          </div>
          <ul className="space-y-3 text-sm">
            {viewedPhase.keyActivities.map((activity, i) => (
              <li key={i} className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
                <Checkbox id={`activity-${i}`} disabled={!isMentor} />
                <Label htmlFor={`activity-${i}`} className={cn("flex-1", isMentor ? "cursor-pointer" : "cursor-default")}>{activity.text}</Label>
                <span className="text-xs text-muted-foreground">{activity.timeline}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </TooltipProvider>
  );
}
