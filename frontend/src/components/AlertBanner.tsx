import React from 'react';
import { AlertTriangle, ShieldCheck, ShieldAlert, AlertCircle } from 'lucide-react';

interface AlertBannerProps {
  level: string;
}

export default function AlertBanner({ level }: AlertBannerProps) {
  let bgClass, borderClass, textClass, Icon, text;

  switch (level) {
    case 'SAFE':
      bgClass = 'bg-success/10';
      borderClass = 'border-success/20';
      textClass = 'text-success';
      Icon = ShieldCheck;
      text = 'No threats detected. Audio is considered safe.';
      break;
    case 'LOW':
      bgClass = 'bg-primary/10';
      borderClass = 'border-primary/20';
      textClass = 'text-primary';
      Icon = AlertCircle;
      text = 'Low risk detected. Monitoring advised.';
      break;
    case 'MEDIUM':
      bgClass = 'bg-warning/10';
      borderClass = 'border-warning/20';
      textClass = 'text-warning';
      Icon = AlertTriangle;
      text = 'Medium risk detected. Review transcript for context.';
      break;
    case 'HIGH':
      bgClass = 'bg-destructive/10';
      borderClass = 'border-destructive/20';
      textClass = 'text-destructive';
      Icon = ShieldAlert;
      text = 'High risk detected. Immediate attention required.';
      break;
    case 'CRITICAL':
      bgClass = 'bg-destructive/20';
      borderClass = 'border-destructive/40';
      textClass = 'text-destructive font-bold';
      Icon = ShieldAlert;
      text = 'CRITICAL THREAT DETECTED. ESCALATE IMMEDIATELY.';
      break;
    default:
      return null;
  }

  return (
    <div className={`flex items-center p-4 rounded-xl border backdrop-blur-md shadow-sm ${bgClass} ${borderClass} ${textClass}`}>
      <Icon className="w-6 h-6 mr-3 flex-shrink-0" />
      <span className="text-sm">{text}</span>
    </div>
  );
}
