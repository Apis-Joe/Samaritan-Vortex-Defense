import { useState, useEffect, useCallback } from "react";
import { Zap, Clock, Activity, Gauge } from "lucide-react";

interface SpeedMetrics {
  aspirationTime: number; // nanoseconds
  attackExecutionTime: number; // milliseconds
  speedRatio: number;
  performanceGrade: "QUANTUM" | "ULTRA" | "OPTIMAL" | "STANDARD";
}

interface VortexSpeedMetricsProps {
  isActive: boolean;
  isProcessing: boolean;
  threatLevel: number;
}

const VortexSpeedMetrics = ({ isActive, isProcessing, threatLevel }: VortexSpeedMetricsProps) => {
  const [metrics, setMetrics] = useState<SpeedMetrics>({
    aspirationTime: 0.003, // 3 nanoseconds
    attackExecutionTime: 150, // 150ms typical attack
    speedRatio: 50000000, // 50 million times faster
    performanceGrade: "QUANTUM",
  });

  const [realtimeLatency, setRealtimeLatency] = useState(0.001);

  // Simulate real-time speed monitoring
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      // Simulate nanosecond-level response times
      const baseLatency = isProcessing ? 0.005 : 0.002;
      const variation = Math.random() * 0.002;
      setRealtimeLatency(baseLatency + variation);

      // Update metrics based on threat level
      const attackTime = 100 + threatLevel * 50 + Math.random() * 100;
      const aspirationNs = 0.002 + Math.random() * 0.003;
      const ratio = (attackTime * 1000000) / aspirationNs;

      let grade: SpeedMetrics["performanceGrade"] = "QUANTUM";
      if (ratio < 10000000) grade = "ULTRA";
      if (ratio < 1000000) grade = "OPTIMAL";
      if (ratio < 100000) grade = "STANDARD";

      setMetrics({
        aspirationTime: aspirationNs,
        attackExecutionTime: attackTime,
        speedRatio: ratio,
        performanceGrade: grade,
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isActive, isProcessing, threatLevel]);

  const getGradeColor = useCallback((grade: SpeedMetrics["performanceGrade"]) => {
    switch (grade) {
      case "QUANTUM": return "text-samaritan-cyan";
      case "ULTRA": return "text-primary";
      case "OPTIMAL": return "text-samaritan-success";
      default: return "text-samaritan-warning";
    }
  }, []);

  const formatNanoseconds = (ns: number) => {
    if (ns < 0.001) return `${(ns * 1000).toFixed(2)}ps`;
    if (ns < 1) return `${(ns * 1000).toFixed(2)}ps`;
    return `${ns.toFixed(3)}ns`;
  };

  const formatRatio = (ratio: number) => {
    if (ratio >= 1000000000) return `${(ratio / 1000000000).toFixed(1)}B×`;
    if (ratio >= 1000000) return `${(ratio / 1000000).toFixed(1)}M×`;
    if (ratio >= 1000) return `${(ratio / 1000).toFixed(1)}K×`;
    return `${ratio.toFixed(0)}×`;
  };

  if (!isActive) return null;

  return (
    <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-[400px]">
      <div className="bg-card/90 backdrop-blur border border-border rounded p-3">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap className={`w-4 h-4 ${isProcessing ? "text-primary animate-pulse" : "text-samaritan-cyan"}`} />
            <span className="font-display text-xs tracking-wider text-foreground">ASPIRATION SPEED</span>
          </div>
          <div className={`font-display text-xs tracking-wider ${getGradeColor(metrics.performanceGrade)} ${metrics.performanceGrade === "QUANTUM" ? "text-glow" : ""}`}>
            {metrics.performanceGrade}
          </div>
        </div>

        {/* Speed Comparison */}
        <div className="grid grid-cols-3 gap-2 text-center mb-3">
          <div className="bg-background/50 rounded p-2">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Clock className="w-3 h-3 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">VORTEX</span>
            </div>
            <div className="font-mono text-xs text-samaritan-cyan text-glow">
              {formatNanoseconds(metrics.aspirationTime)}
            </div>
          </div>

          <div className="bg-background/50 rounded p-2">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Activity className="w-3 h-3 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">ATTACK</span>
            </div>
            <div className="font-mono text-xs text-primary">
              {metrics.attackExecutionTime.toFixed(0)}ms
            </div>
          </div>

          <div className="bg-background/50 rounded p-2">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Gauge className="w-3 h-3 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground">FASTER</span>
            </div>
            <div className="font-mono text-xs text-samaritan-success text-glow">
              {formatRatio(metrics.speedRatio)}
            </div>
          </div>
        </div>

        {/* Real-time Latency Bar */}
        <div className="relative">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
            <span>REAL-TIME LATENCY</span>
            <span className="font-mono text-samaritan-cyan">{formatNanoseconds(realtimeLatency)}</span>
          </div>
          <div className="h-1 bg-background rounded overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-samaritan-cyan via-primary to-samaritan-success transition-all duration-100"
              style={{ width: `${Math.min((realtimeLatency / 0.01) * 100, 100)}%` }}
            />
          </div>
        </div>

        {/* Status Message */}
        {isProcessing && (
          <div className="mt-2 text-center">
            <span className="text-[10px] text-primary animate-pulse font-display tracking-wider">
              ⚡ INSTANT ASPIRATION ACTIVE - ZERO EXECUTION WINDOW ⚡
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default VortexSpeedMetrics;
