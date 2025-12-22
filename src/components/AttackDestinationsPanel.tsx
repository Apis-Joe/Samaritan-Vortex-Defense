import { memo, useState, useEffect, useCallback } from 'react';
import { ArrowRight, RotateCw, Skull, Lock, Trash2, Zap } from 'lucide-react';

export type RedirectDestination = 
  | "attacker.origin.ip"
  | "void.blackhole.sys"
  | "honeypot.trap.net"
  | "null.route.void"
  | "reverse.tunnel.origin";

interface DestinationStats {
  id: RedirectDestination;
  name: string;
  icon: React.ReactNode;
  description: string;
  effect: string;
  count: number;
  percentage: number;
  color: string;
}

interface Props {
  stats: Record<RedirectDestination, number>;
  totalRedirects: number;
}

const AttackDestinationsPanel = memo(({ stats, totalRedirects }: Props) => {
  const destinations: DestinationStats[] = [
    {
      id: 'attacker.origin.ip',
      name: 'REVERSE TO ATTACKER',
      icon: <RotateCw className="w-4 h-4" />,
      description: 'Attack code sent back to perpetrator at amplified speed',
      effect: "Effect: Attacker receives their own payload - system compromised",
      count: stats['attacker.origin.ip'] || 0,
      percentage: totalRedirects > 0 ? Math.round((stats['attacker.origin.ip'] || 0) / totalRedirects * 100) : 0,
      color: 'text-orange-400 border-orange-500/50 bg-orange-500/10',
    },
    {
      id: 'void.blackhole.sys',
      name: 'BLACK HOLE VOID',
      icon: <Skull className="w-4 h-4" />,
      description: 'Attack consumed into infinite null space',
      effect: "Effect: Code ceases to exist - complete annihilation",
      count: stats['void.blackhole.sys'] || 0,
      percentage: totalRedirects > 0 ? Math.round((stats['void.blackhole.sys'] || 0) / totalRedirects * 100) : 0,
      color: 'text-red-400 border-red-500/50 bg-red-500/10',
    },
    {
      id: 'honeypot.trap.net',
      name: 'HONEYPOT TRAP',
      icon: <Lock className="w-4 h-4" />,
      description: 'Attack captured in isolated sandbox environment',
      effect: "Effect: Attack analyzed in secure container - no escape",
      count: stats['honeypot.trap.net'] || 0,
      percentage: totalRedirects > 0 ? Math.round((stats['honeypot.trap.net'] || 0) / totalRedirects * 100) : 0,
      color: 'text-emerald-400 border-emerald-500/50 bg-emerald-500/10',
    },
    {
      id: 'null.route.void',
      name: 'NULL ROUTE',
      icon: <Trash2 className="w-4 h-4" />,
      description: 'Attack sent to non-existent network endpoint',
      effect: "Effect: Packets dropped into digital abyss",
      count: stats['null.route.void'] || 0,
      percentage: totalRedirects > 0 ? Math.round((stats['null.route.void'] || 0) / totalRedirects * 100) : 0,
      color: 'text-gray-400 border-gray-500/50 bg-gray-500/10',
    },
    {
      id: 'reverse.tunnel.origin',
      name: 'REVERSE TUNNEL',
      icon: <Zap className="w-4 h-4" />,
      description: 'Attack redirected through encrypted reverse channel',
      effect: "Effect: Code bounced back through origin tunnel at light speed",
      count: stats['reverse.tunnel.origin'] || 0,
      percentage: totalRedirects > 0 ? Math.round((stats['reverse.tunnel.origin'] || 0) / totalRedirects * 100) : 0,
      color: 'text-purple-400 border-purple-500/50 bg-purple-500/10',
    },
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        <ArrowRight className="w-5 h-5 text-primary" />
        <h3 className="font-display text-sm text-primary tracking-wider">ATTACK DESTINATIONS</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-4">
        Where aspirated attack codes are redirected and neutralized
      </p>

      <div className="space-y-3">
        {destinations.map((dest) => (
          <div 
            key={dest.id}
            className={`border rounded-lg p-3 ${dest.color}`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {dest.icon}
                <span className="px-2 py-0.5 text-[10px] font-mono rounded bg-background/50">{dest.name}</span>
              </div>
              <div className="text-right">
                <span className="text-lg font-mono">{dest.count}</span>
                <span className="text-xs text-muted-foreground ml-1">{dest.percentage}%</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mb-1">{dest.description}</p>
            <div className="bg-background/30 rounded px-2 py-1">
              <span className="text-[10px] text-foreground">{dest.effect}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});

AttackDestinationsPanel.displayName = 'AttackDestinationsPanel';

export default AttackDestinationsPanel;
