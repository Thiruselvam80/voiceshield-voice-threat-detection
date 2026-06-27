import React from 'react';
import { motion } from 'framer-motion';

const LEVELS = ['SAFE', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
const COLORS: Record<string, string> = {
  SAFE: 'bg-success',
  LOW: 'bg-primary',
  MEDIUM: 'bg-warning',
  HIGH: 'bg-destructive',
  CRITICAL: 'bg-destructive shadow-[0_0_15px_rgba(220,38,38,0.5)]',
};

interface RiskMeterProps {
  level: string;
}

export default function RiskMeter({ level }: RiskMeterProps) {
  const activeIndex = LEVELS.indexOf(level);
  
  return (
    <div className="w-full flex flex-col items-center gap-4">
      <div className="flex gap-2 w-full justify-between px-2">
        {LEVELS.map((lbl, i) => (
          <div key={lbl} className="flex-1 flex flex-col items-center">
            <div className={`h-1.5 w-full rounded-full transition-all duration-700 ease-out ${i <= activeIndex ? COLORS[level] : 'bg-secondary/50'}`} />
            <span className={`text-[10px] mt-2 font-semibold tracking-wider ${i === activeIndex ? 'text-foreground' : 'text-muted-foreground/50'}`}>
              {lbl}
            </span>
          </div>
        ))}
      </div>
      
      <motion.div 
        key={level}
        initial={{ scale: 0.9, opacity: 0, y: 5 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className={`mt-4 px-6 py-2 rounded-full font-bold tracking-widest text-sm uppercase shadow-sm border ${
          level === 'SAFE' ? 'bg-success/10 text-success border-success/20' :
          level === 'LOW' ? 'bg-primary/10 text-primary border-primary/20' :
          level === 'MEDIUM' ? 'bg-warning/10 text-warning border-warning/20' :
          'bg-destructive/10 text-destructive border-destructive/20 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
        }`}
      >
        {level}
      </motion.div>
    </div>
  );
}
