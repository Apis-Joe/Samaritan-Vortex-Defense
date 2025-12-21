import { useEffect, useState } from "react";

interface ThreatVisualizationProps {
  threatActive: boolean;
  threatType: string;
  phase: "incoming" | "captured" | "processing" | "redirecting" | "complete" | null;
}

const ThreatVisualization = ({ threatActive, threatType, phase }: ThreatVisualizationProps) => {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; angle: number }>>([]);

  useEffect(() => {
    if (phase === "incoming") {
      // Generate incoming threat particles
      const newParticles = Array.from({ length: 20 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: -10 - Math.random() * 20,
        angle: 45 + Math.random() * 90,
      }));
      setParticles(newParticles);
    } else if (phase === "redirecting") {
      // Generate redirected particles
      const newParticles = Array.from({ length: 15 }, (_, i) => ({
        id: i,
        x: 50 + (Math.random() - 0.5) * 20,
        y: 50 + (Math.random() - 0.5) * 20,
        angle: Math.random() * 360,
      }));
      setParticles(newParticles);
    }
  }, [phase]);

  if (!threatActive || !phase) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {/* Incoming threat indicator */}
      {phase === "incoming" && (
        <>
          <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-primary/20 border border-primary rounded animate-pulse">
            <span className="font-display text-sm text-primary tracking-wider">
              ⚠ {threatType.toUpperCase()} DETECTED
            </span>
          </div>
          {particles.map((p) => (
            <div
              key={p.id}
              className="absolute w-2 h-2 bg-primary rounded-full animate-threat-incoming"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                animationDelay: `${p.id * 0.05}s`,
              }}
            />
          ))}
        </>
      )}

      {/* Captured phase */}
      {phase === "captured" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-32 h-32 border-2 border-primary rounded-full animate-ping opacity-50" />
          <div className="absolute font-display text-primary text-sm tracking-wider animate-pulse">
            THREAT CAPTURED
          </div>
        </div>
      )}

      {/* Processing phase */}
      {phase === "processing" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-48 h-48 border border-primary/50 rounded-full animate-vortex-spin-fast">
            {[0, 60, 120, 180, 240, 300].map((angle) => (
              <div
                key={angle}
                className="absolute w-3 h-3 bg-primary rounded-full left-1/2 -ml-1.5"
                style={{ transform: `rotate(${angle}deg) translateY(-80px)` }}
              />
            ))}
          </div>
          <div className="absolute font-display text-primary text-xs tracking-widest animate-pulse">
            ANALYZING
          </div>
        </div>
      )}

      {/* Redirecting phase */}
      {phase === "redirecting" && (
        <>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="font-display text-samaritan-cyan text-sm tracking-wider animate-pulse">
              REDIRECTING TO SOURCE
            </div>
          </div>
          {particles.map((p) => (
            <div
              key={p.id}
              className="absolute w-2 h-2 bg-samaritan-cyan rounded-full animate-threat-redirect"
              style={{
                left: `${p.x}%`,
                top: `${p.y}%`,
                animationDelay: `${p.id * 0.03}s`,
              }}
            />
          ))}
        </>
      )}

      {/* Complete phase */}
      {phase === "complete" && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="px-6 py-3 bg-samaritan-success/20 border border-samaritan-success rounded animate-fade-in">
            <span className="font-display text-samaritan-success text-sm tracking-wider">
              ✓ THREAT NEUTRALIZED
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThreatVisualization;
