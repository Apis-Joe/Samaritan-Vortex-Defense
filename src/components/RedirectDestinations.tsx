import { useState, useEffect, useCallback } from "react";
import { RefreshCw, Skull, Lock, Trash2, Zap, ArrowRight } from "lucide-react";

export type RedirectDestination = 
  | "attacker.origin.ip"
  | "void.blackhole.sys"
  | "honeypot.trap.net"
  | "null.route.void"
  | "reverse.tunnel.origin";

interface DestinationConfig {
  id: RedirectDestination;
  name: string;
  icon: React.ReactNode;
  emoji: string;
  description: string;
  effect: string;
  speed: string;
  color: string;
}

interface RedirectDestinationsProps {
  selectedDestination: RedirectDestination;
  onSelectDestination: (dest: RedirectDestination) => void;
  isProcessing: boolean;
  currentPhase: string | null;
}

const destinations: DestinationConfig[] = [
  {
    id: "attacker.origin.ip",
    name: "REVERSE TO ATTACKER",
    icon: <RefreshCw className="w-4 h-4" />,
    emoji: "🔄",
    description: "Attack sent back to perpetrator at amplified speed",
    effect: "Attacker's system gets hit by their own weapon",
    speed: "Amplified 10×",
    color: "text-primary",
  },
  {
    id: "void.blackhole.sys",
    name: "BLACK HOLE VOID",
    icon: <Skull className="w-4 h-4" />,
    emoji: "💀",
    description: "Attack consumed into infinite null space",
    effect: "Complete digital annihilation - code ceases to exist",
    speed: "Instant void",
    color: "text-muted-foreground",
  },
  {
    id: "honeypot.trap.net",
    name: "HONEYPOT TRAP",
    icon: <Lock className="w-4 h-4" />,
    emoji: "🔒",
    description: "Attack captured in isolated sandbox",
    effect: "Safe analysis in digital prison - no escape possible",
    speed: "Locked forever",
    color: "text-samaritan-warning",
  },
  {
    id: "null.route.void",
    name: "NULL ROUTE",
    icon: <Trash2 className="w-4 h-4" />,
    emoji: "🗑️",
    description: "Attack sent to non-existent endpoint",
    effect: "Packets dropped into digital abyss",
    speed: "Vanished",
    color: "text-samaritan-text",
  },
  {
    id: "reverse.tunnel.origin",
    name: "REVERSE TUNNEL",
    icon: <Zap className="w-4 h-4" />,
    emoji: "⚡",
    description: "Attack bounced back through origin tunnel",
    effect: "Returns to sender at light speed",
    speed: "Light speed",
    color: "text-samaritan-cyan",
  },
];

const RedirectDestinations = ({
  selectedDestination,
  onSelectDestination,
  isProcessing,
  currentPhase,
}: RedirectDestinationsProps) => {
  const [activeAnimation, setActiveAnimation] = useState<RedirectDestination | null>(null);
  const [redirectProgress, setRedirectProgress] = useState(0);

  // Animate when redirecting
  useEffect(() => {
    if (currentPhase === "redirecting" && isProcessing) {
      setActiveAnimation(selectedDestination);
      setRedirectProgress(0);
      
      const progressInterval = setInterval(() => {
        setRedirectProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return prev + 5;
        });
      }, 75);

      return () => clearInterval(progressInterval);
    } else {
      setActiveAnimation(null);
      setRedirectProgress(0);
    }
  }, [currentPhase, isProcessing, selectedDestination]);

  const getDestinationStatus = useCallback((dest: DestinationConfig) => {
    if (activeAnimation === dest.id) {
      return "REDIRECTING";
    }
    if (dest.id === selectedDestination) {
      return "SELECTED";
    }
    return "READY";
  }, [activeAnimation, selectedDestination]);

  return (
    <div className="bg-card border border-border rounded p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ArrowRight className="w-4 h-4 text-primary" />
          <span className="font-display text-sm tracking-wider text-foreground">
            REDIRECT DESTINATIONS
          </span>
        </div>
        {activeAnimation && (
          <div className="flex items-center gap-2">
            <div className="w-16 h-1 bg-background rounded overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-100"
                style={{ width: `${redirectProgress}%` }}
              />
            </div>
            <span className="text-[10px] text-primary font-mono">{redirectProgress}%</span>
          </div>
        )}
      </div>

      {/* Destinations Grid */}
      <div className="space-y-2">
        {destinations.map((dest) => {
          const status = getDestinationStatus(dest);
          const isActive = activeAnimation === dest.id;
          const isSelected = selectedDestination === dest.id;

          return (
            <button
              key={dest.id}
              onClick={() => !isProcessing && onSelectDestination(dest.id)}
              disabled={isProcessing}
              className={`
                w-full text-left p-3 rounded border transition-all duration-200
                ${isSelected 
                  ? "border-primary bg-primary/10" 
                  : "border-border bg-background/50 hover:border-primary/50"
                }
                ${isActive ? "animate-pulse border-primary" : ""}
                ${isProcessing && !isActive ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
              `}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={`
                    w-8 h-8 rounded flex items-center justify-center
                    ${isActive ? "bg-primary text-primary-foreground" : "bg-muted"}
                  `}>
                    <span className="text-lg">{dest.emoji}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-display text-xs ${dest.color} ${isActive ? "text-glow" : ""}`}>
                        {dest.name}
                      </span>
                      {isActive && (
                        <span className="text-[9px] px-1.5 py-0.5 bg-primary text-primary-foreground rounded font-mono">
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5 font-mono">
                      {dest.id}
                    </div>
                    <div className="text-[10px] text-samaritan-text mt-1">
                      {dest.description}
                    </div>
                  </div>
                </div>

                {/* Status & Speed */}
                <div className="text-right">
                  <div className={`text-[9px] font-mono ${
                    status === "REDIRECTING" ? "text-primary animate-pulse" :
                    status === "SELECTED" ? "text-samaritan-success" :
                    "text-muted-foreground"
                  }`}>
                    {status}
                  </div>
                  <div className="text-[9px] text-samaritan-cyan mt-1">
                    {dest.speed}
                  </div>
                </div>
              </div>

              {/* Effect on hover/select */}
              {(isSelected || isActive) && (
                <div className="mt-2 pt-2 border-t border-border/50">
                  <div className="text-[10px] text-samaritan-warning">
                    ⚡ {dest.effect}
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Active Redirect Display */}
      {activeAnimation && (
        <div className="mt-4 p-3 bg-primary/10 border border-primary rounded">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 bg-primary rounded-full animate-ping" />
            <span className="font-display text-xs text-primary tracking-wider">
              REDIRECTING ATTACK CODE
            </span>
          </div>
          <div className="font-mono text-[10px] text-samaritan-text">
            Destination: <span className="text-primary">{selectedDestination}</span>
          </div>
          <div className="font-mono text-[10px] text-samaritan-text">
            Transfer: <span className="text-samaritan-cyan">{redirectProgress}% complete</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default RedirectDestinations;
