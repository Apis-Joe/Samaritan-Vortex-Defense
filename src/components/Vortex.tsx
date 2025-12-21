import { useEffect, useState } from "react";

interface VortexProps {
  isActive: boolean;
  threatLevel: number;
  processingThreat: boolean;
}

const Vortex = ({ isActive, threatLevel, processingThreat }: VortexProps) => {
  const [particles, setParticles] = useState<Array<{ id: number; angle: number; distance: number; speed: number; size: number }>>([]);

  useEffect(() => {
    // Generate vortex particles
    const newParticles = Array.from({ length: 60 }, (_, i) => ({
      id: i,
      angle: (i * 6) % 360,
      distance: 50 + (i % 5) * 30,
      speed: 0.5 + Math.random() * 1.5,
      size: 1 + Math.random() * 3,
    }));
    setParticles(newParticles);
  }, []);

  const speedMultiplier = processingThreat ? 3 : isActive ? 1 : 0.3;
  const coreSize = processingThreat ? "w-24 h-24" : isActive ? "w-20 h-20" : "w-16 h-16";

  return (
    <div className="relative w-[500px] h-[500px] flex items-center justify-center">
      {/* Background grid */}
      <div className="absolute inset-0 grid-pattern opacity-30 rounded-full overflow-hidden" />

      {/* Outer vortex rings */}
      {[1, 2, 3, 4, 5].map((ring) => (
        <div
          key={ring}
          className={`absolute rounded-full border ${
            processingThreat ? "border-primary" : "border-samaritan-border"
          } opacity-${processingThreat ? 60 : 30}`}
          style={{
            width: `${100 + ring * 70}px`,
            height: `${100 + ring * 70}px`,
            animation: `vortex-spin${ring % 2 === 0 ? "-reverse" : ""} ${
              (10 + ring * 2) / speedMultiplier
            }s linear infinite`,
            borderWidth: ring === 1 ? "2px" : "1px",
          }}
        />
      ))}

      {/* Spiral arms */}
      {[0, 60, 120, 180, 240, 300].map((rotation, i) => (
        <div
          key={`arm-${i}`}
          className="absolute w-full h-full"
          style={{
            transform: `rotate(${rotation}deg)`,
            animation: `vortex-spin ${15 / speedMultiplier}s linear infinite`,
          }}
        >
          <div
            className={`absolute left-1/2 top-0 h-1/2 w-0.5 origin-bottom ${
              processingThreat ? "bg-gradient-to-t from-primary via-primary/50 to-transparent" : "bg-gradient-to-t from-samaritan-border via-samaritan-border/30 to-transparent"
            }`}
            style={{ transform: `translateX(-50%) rotate(${15 + i * 5}deg)` }}
          />
        </div>
      ))}

      {/* Vortex particles */}
      <div
        className="absolute w-full h-full"
        style={{ animation: `vortex-spin ${20 / speedMultiplier}s linear infinite` }}
      >
        {particles.map((particle) => (
          <div
            key={particle.id}
            className={`absolute rounded-full ${processingThreat ? "bg-primary" : "bg-samaritan-text"}`}
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              left: "50%",
              top: "50%",
              transform: `rotate(${particle.angle}deg) translateX(${particle.distance}px)`,
              opacity: processingThreat ? 0.8 : 0.4,
              boxShadow: processingThreat ? "0 0 6px hsl(var(--primary))" : "none",
            }}
          />
        ))}
      </div>

      {/* Inner rotating rings */}
      <div
        className={`absolute w-48 h-48 rounded-full border-2 ${
          processingThreat ? "border-primary" : "border-samaritan-border"
        }`}
        style={{ animation: `vortex-spin ${8 / speedMultiplier}s linear infinite` }}
      >
        <div className="absolute -top-1 left-1/2 w-2 h-2 -translate-x-1/2 rounded-full bg-primary" />
        <div className="absolute -bottom-1 left-1/2 w-2 h-2 -translate-x-1/2 rounded-full bg-primary" />
      </div>

      <div
        className={`absolute w-36 h-36 rounded-full border ${
          processingThreat ? "border-primary/80" : "border-samaritan-border/60"
        }`}
        style={{ animation: `vortex-spin-reverse ${6 / speedMultiplier}s linear infinite` }}
      >
        <div className="absolute -left-1 top-1/2 w-2 h-2 -translate-y-1/2 rounded-full bg-primary/80" />
        <div className="absolute -right-1 top-1/2 w-2 h-2 -translate-y-1/2 rounded-full bg-primary/80" />
      </div>

      {/* Core */}
      <div
        className={`relative ${coreSize} rounded-full bg-gradient-radial from-primary via-primary/60 to-transparent flex items-center justify-center transition-all duration-500 ${
          processingThreat ? "animate-vortex-core-pulse" : isActive ? "animate-vortex-pulse" : ""
        }`}
        style={{
          boxShadow: processingThreat
            ? "0 0 40px hsl(var(--primary)), 0 0 80px hsl(var(--primary)/0.5), 0 0 120px hsl(var(--primary)/0.3)"
            : isActive
            ? "0 0 20px hsl(var(--primary)/0.6), 0 0 40px hsl(var(--primary)/0.3)"
            : "0 0 10px hsl(var(--primary)/0.3)",
        }}
      >
        <div className={`${processingThreat ? "w-12 h-12" : "w-8 h-8"} rounded-full bg-background border-2 border-primary transition-all duration-500`} />
      </div>

      {/* Threat level indicator rings */}
      {threatLevel > 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          {Array.from({ length: threatLevel }).map((_, i) => (
            <div
              key={`threat-${i}`}
              className="absolute rounded-full border border-primary/50 animate-vortex-pulse"
              style={{
                width: `${300 + i * 40}px`,
                height: `${300 + i * 40}px`,
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      )}

      {/* Status text */}
      <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 text-center">
        <div className={`font-display text-sm tracking-[0.3em] ${processingThreat ? "text-primary text-glow" : "text-samaritan-text"}`}>
          {processingThreat ? "PROCESSING THREAT" : isActive ? "MONITORING" : "STANDBY"}
        </div>
      </div>
    </div>
  );
};

export default Vortex;
