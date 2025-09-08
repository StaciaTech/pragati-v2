
'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';

export function TypingPlaceholder({ placeholders, isTextInputPlaceholder, isHeroTitle, interval = 4000 }: { placeholders: string[], isTextInputPlaceholder?: boolean, isHeroTitle?: boolean, interval?: number }) {
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    const animationInterval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % placeholders.length);
    }, interval);

    return () => clearInterval(animationInterval);
  }, [placeholders.length, interval]);

  const containerClasses = isTextInputPlaceholder 
    ? "absolute inset-0 p-4 pointer-events-none flex items-start justify-start"
    : isHeroTitle ? "flex items-center text-4xl font-semibold bg-gradient-to-r from-primary to-teal-400 bg-clip-text text-transparent h-12" : "flex items-center";

  return (
    <div className={containerClasses}>
        <AnimatePresence mode="wait">
            <motion.div
                key={index}
                initial={{ opacity: 0, y: isHeroTitle ? 20 : 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: isHeroTitle ? -20 : -10 }}
                transition={{ duration: 0.5 }}
                className="flex items-center"
            >
                 <span className={isTextInputPlaceholder ? "text-muted-foreground whitespace-nowrap" : "whitespace-nowrap"}>{placeholders[index]}</span>
            </motion.div>
        </AnimatePresence>
    </div>
  );
}
