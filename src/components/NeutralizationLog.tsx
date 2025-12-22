import { memo } from 'react';
import { Zap, CheckCircle, ArrowRight } from 'lucide-react';

interface NeutralizedThreat {
  id: string;
  type: string;
  sourceIP: string;
  destination: string;
  destinationName: string;
  speedMultiplier: number;
  neutralizedPercent: number;
  damagePrevented: number;
  codeFragments: number;
  timestamp: Date;
}

interface Props {
  threats: NeutralizedThreat[];
  latestRedirects: { ip: string; destination: string }[];
}

const NeutralizationLog = memo(({ threats, latestRedirects }: Props) => {
  const getTypeColor = (type: string) => {
    switch (type.toUpperCase()) {
      case 'INTRUSION': return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'BUFFER OVERFLOW': return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      case 'PRIVILEGE ESCALATION': return 'bg-purple-500/20 text-purple-400 border-purple-500/50';
      case 'DDOS': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'MALWARE': return 'bg-pink-500/20 text-pink-400 border-pink-500/50';
      case 'PHISHING': return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }) + '.' + date.getMilliseconds().toString().padStart(3, '0');
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      {/* Header Status */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-400" />
          <span className="text-emerald-400 font-display text-sm tracking-wider">NEUTRALIZED</span>
        </div>
        <span className="text-xs text-muted-foreground">Code never executes - zero damage to system - perpetrator receives consequences</span>
      </div>

      {/* Latest Redirects */}
      {latestRedirects.length > 0 && (
        <div className="mb-4">
          <span className="text-[10px] text-muted-foreground tracking-wider">LATEST REDIRECTS</span>
          <div className="mt-2 space-y-1">
            {latestRedirects.slice(0, 3).map((redirect, idx) => (
              <div key={idx} className="flex items-center justify-between bg-secondary/30 rounded px-3 py-2">
                <span className="text-sm font-mono text-foreground">{redirect.ip}</span>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-mono text-cyan-400">{redirect.destination}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Neutralization Log Header */}
      <div className="flex items-center gap-2 mb-3">
        <Zap className="w-4 h-4 text-yellow-400" />
        <h3 className="font-display text-sm text-yellow-400 tracking-wider">NEUTRALIZATION LOG</h3>
      </div>

      {/* Threat Entries */}
      <div className="space-y-3 max-h-[300px] overflow-y-auto">
        {threats.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground text-xs">
            No threats neutralized yet. Activate system to begin protection.
          </div>
        ) : (
          threats.map((threat) => (
            <div key={threat.id} className="bg-secondary/30 border border-border/50 rounded p-3">
              {/* Type & Status */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 text-[10px] font-mono rounded border ${getTypeColor(threat.type)}`}>
                    {threat.type.toUpperCase()}
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-mono rounded border bg-emerald-500/20 text-emerald-400 border-emerald-500/50">
                    NEUTRALIZED
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">{formatTimestamp(threat.timestamp)}</span>
              </div>

              {/* IP & Destination */}
              <div className="flex items-center gap-2 text-sm mb-3">
                <span className="text-red-400 font-mono">{threat.sourceIP}</span>
                <ArrowRight className="w-4 h-4 text-muted-foreground" />
                <span className="text-cyan-400 font-mono">{threat.destination}</span>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-background/50 rounded px-2 py-1">
                  <span className="text-[10px] text-muted-foreground">Speed: </span>
                  <span className="text-xs text-yellow-400 font-mono">{threat.speedMultiplier}x faster</span>
                </div>
                <div className="bg-background/50 rounded px-2 py-1">
                  <span className="text-[10px] text-muted-foreground">Neutralized: </span>
                  <span className="text-xs text-emerald-400 font-mono">{threat.neutralizedPercent}%</span>
                </div>
                <div className="bg-background/50 rounded px-2 py-1">
                  <span className="text-[10px] text-muted-foreground">Damage Prevented: </span>
                  <span className="text-xs text-purple-400 font-mono">{threat.damagePrevented}MB</span>
                </div>
                <div className="bg-background/50 rounded px-2 py-1">
                  <span className="text-[10px] text-muted-foreground">Code Captured: </span>
                  <span className="text-xs text-cyan-400 font-mono">{threat.codeFragments} fragments</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
});

NeutralizationLog.displayName = 'NeutralizationLog';

export default NeutralizationLog;
