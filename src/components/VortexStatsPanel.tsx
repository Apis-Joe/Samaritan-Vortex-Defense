import { memo, useState, useEffect } from 'react';
import { Zap, Shield, Activity, Database, Target, ArrowRight, Repeat } from 'lucide-react';

interface Stat {
  label: string;
  value: string | number;
  unit?: string;
  color: string;
  icon: React.ReactNode;
  badge?: string;
  badgeColor?: string;
}

interface Props {
  isActive: boolean;
  threatsAspirated: number;
  redirects: number;
  executions: number;
  damagePreventedMB: number;
  codeCaptured: number;
  responseTimeMs: number;
}

const VortexStatsPanel = memo(({ 
  isActive, 
  threatsAspirated, 
  redirects, 
  executions,
  damagePreventedMB,
  codeCaptured,
  responseTimeMs 
}: Props) => {
  const [animatedResponse, setAnimatedResponse] = useState(responseTimeMs);
  
  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      setAnimatedResponse(0.001 + Math.random() * 0.05);
    }, 500);
    return () => clearInterval(interval);
  }, [isActive]);

  const topStats: Stat[] = [
    { 
      label: 'VORTEX RESPONSE', 
      value: animatedResponse.toFixed(3), 
      unit: 'ms', 
      color: 'text-cyan-400', 
      icon: <Zap className="w-5 h-5" />,
      badge: 'SPEED',
      badgeColor: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50'
    },
    { 
      label: 'NEUTRALIZATION RATE', 
      value: '100.0', 
      unit: '%', 
      color: 'text-emerald-400', 
      icon: <Shield className="w-5 h-5" />,
      badge: 'EFFICIENCY',
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
    },
    { 
      label: 'DAMAGE PREVENTED', 
      value: damagePreventedMB.toFixed(1), 
      unit: 'MB', 
      color: 'text-purple-400', 
      icon: <Activity className="w-5 h-5" />,
      badge: 'EFFECTIVENESS',
      badgeColor: 'bg-purple-500/20 text-purple-400 border-purple-500/50'
    },
    { 
      label: 'CODE CAPTURED', 
      value: codeCaptured, 
      color: 'text-yellow-400', 
      icon: <Database className="w-5 h-5" />,
      badge: 'INTELLIGENCE',
      badgeColor: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
    },
  ];

  const bottomStats: Stat[] = [
    { 
      label: 'THREATS ASPIRATED', 
      value: threatsAspirated, 
      color: 'text-cyan-400', 
      icon: <Target className="w-5 h-5" />
    },
    { 
      label: 'INSTANT REDIRECTS', 
      value: redirects, 
      color: 'text-emerald-400', 
      icon: <ArrowRight className="w-5 h-5" />
    },
    { 
      label: 'ZERO EXECUTIONS', 
      value: executions, 
      color: 'text-muted-foreground', 
      icon: <Repeat className="w-5 h-5" />
    },
    { 
      label: 'ACTIVE VORTEX', 
      value: isActive ? 1 : 0, 
      color: isActive ? 'text-primary' : 'text-muted-foreground', 
      icon: <Activity className="w-5 h-5" />
    },
  ];

  return (
    <div className="space-y-4">
      {/* Top Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {topStats.map((stat, idx) => (
          <div key={idx} className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div className={stat.color}>{stat.icon}</div>
              {stat.badge && (
                <span className={`px-2 py-0.5 text-[10px] font-mono rounded border ${stat.badgeColor}`}>
                  {stat.badge}
                </span>
              )}
            </div>
            <div className="text-[10px] text-muted-foreground tracking-wider mb-1">{stat.label}</div>
            <div className={`text-2xl font-mono ${stat.color}`}>
              {stat.value}{stat.unit && <span className="text-lg">{stat.unit}</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {bottomStats.map((stat, idx) => (
          <div key={idx} className="bg-card border border-border rounded-lg p-4">
            <div className={`mb-3 ${stat.color}`}>{stat.icon}</div>
            <div className="text-[10px] text-muted-foreground tracking-wider mb-1">{stat.label}</div>
            <div className={`text-2xl font-mono ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
});

VortexStatsPanel.displayName = 'VortexStatsPanel';

export default VortexStatsPanel;
