import { useEffect, useState, useMemo, memo } from "react";

interface VortexProps {
  isActive: boolean;
  threatLevel: number;
  processingThreat: boolean;
}

// Memoized particle component for performance
const VortexParticle = memo(({ 
  particle, 
  processingThreat 
}: { 
  particle: { id: number; angle: number; distance: number; size: number }; 
  processingThreat: boolean;
}) => (
  <div
    className={`absolute rounded-full ${processingThreat ? "bg-primary" : "bg-samaritan-text"}`}
    style={{
      width: `${particle.size}px`,
      height: `${particle.size}px`,
      left: "50%",
      top: "50%",
      transform: `rotate(${particle.angle}deg) translateX(${particle.distance}px)`,
      opacity: processingThreat ? 0.8 : 0.4,
      willChange: "transform",
    }}
  />
));

VortexParticle.displayName = "VortexParticle";

const Vortex = ({ isActive, threatLevel, processingThreat }: VortexProps) => {
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile for reduced particles
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Generate optimized particles - 50 on mobile, 100 on desktop
  const particles = useMemo(() => {
    const count = isMobile ? 50 : 100;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      angle: (i * (360 / count)) % 360,
      distance: 50 + (i % 5) * 25,
      size: 1 + (i % 3),
    }));
  }, [isMobile]);

  const speedMultiplier = processingThreat ? 3 : isActive ? 1 : 0.3;
  const coreSize = processingThreat ? "w-24 h-24" : isActive ? "w-20 h-20" : "w-16 h-16";

  // Simplified ring count for performance
  const rings = useMemo(() => [1, 2, 3, 4], []);
  const spiralArms = useMemo(() => [0, 90, 180, 270], []);

  return (
    <div 
      className="relative w-[400px] h-[400px] md:w-[500px] md:h-[500px] flex items-center justify-center"
      style={{ 
        willChange: "transform",
        transform: "translateZ(0)", // Hardware acceleration
      }}
    >
      {/* Background grid - simplified */}
      <div className="absolute inset-0 grid-pattern opacity-20 rounded-full overflow-hidden" />

      {/* Outer vortex rings - reduced count */}
      {rings.map((ring) => (
        <div
          key={ring}
          className={`absolute rounded-full border ${
            processingThreat ? "border-primary" : "border-samaritan-border"
          }`}
          style={{
            width: `${80 + ring * 70}px`,
            height: `${80 + ring * 70}px`,
            animation: `vortex-spin${ring % 2 === 0 ? "-reverse" : ""} ${
              (12 + ring * 2) / speedMultiplier
            }s linear infinite`,
            borderWidth: ring === 1 ? "2px" : "1px",
            opacity: processingThreat ? 0.6 : 0.3,
            willChange: "transform",
          }}
        />
      ))}

      {/* Spiral arms - reduced to 4 */}
      {spiralArms.map((rotation, i) => (
        <div
          key={`arm-${i}`}
          className="absolute w-full h-full"
          style={{
            transform: `rotate(${rotation}deg)`,
            animation: `vortex-spin ${18 / speedMultiplier}s linear infinite`,
            willChange: "transform",
          }}
        >
          <div
            className={`absolute left-1/2 top-0 h-1/2 w-0.5 origin-bottom ${
              processingThreat 
                ? "bg-gradient-to-t from-primary via-primary/50 to-transparent" 
                : "bg-gradient-to-t from-samaritan-border via-samaritan-border/30 to-transparent"
            }`}
            style={{ transform: `translateX(-50%) rotate(${15 + i * 8}deg)` }}
          />
        </div>
      ))}

      {/* Vortex particles - optimized with memoization */}
      <div
        className="absolute w-full h-full"
        style={{ 
          animation: `vortex-spin ${24 / speedMultiplier}s linear infinite`,
          willChange: "transform",
        }}
      >
        {particles.map((particle) => (
          <VortexParticle 
            key={particle.id} 
            particle={particle} 
            processingThreat={processingThreat} 
          />
        ))}
      </div>

      {/* Inner rotating rings - simplified */}
      <div
        className={`absolute w-40 h-40 rounded-full border-2 ${
          processingThreat ? "border-primary" : "border-samaritan-border"
        }`}
        style={{ 
          animation: `vortex-spin ${10 / speedMultiplier}s linear infinite`,
          willChange: "transform",
        }}
      >
        <div className="absolute -top-1 left-1/2 w-2 h-2 -translate-x-1/2 rounded-full bg-primary" />
        <div className="absolute -bottom-1 left-1/2 w-2 h-2 -translate-x-1/2 rounded-full bg-primary" />
      </div>

      <div
        className={`absolute w-28 h-28 rounded-full border ${
          processingThreat ? "border-primary/80" : "border-samaritan-border/60"
        }`}
        style={{ 
          animation: `vortex-spin-reverse ${8 / speedMultiplier}s linear infinite`,
          willChange: "transform",
        }}
      >
        <div className="absolute -left-1 top-1/2 w-2 h-2 -translate-y-1/2 rounded-full bg-primary/80" />
        <div className="absolute -right-1 top-1/2 w-2 h-2 -translate-y-1/2 rounded-full bg-primary/80" />
      </div>

      {/* Core - simplified glow */}
      <div
        className={`relative ${coreSize} rounded-full bg-gradient-to-br from-primary via-primary/60 to-transparent flex items-center justify-center transition-all duration-500 ${
          processingThreat ? "animate-vortex-core-pulse" : isActive ? "animate-vortex-pulse" : ""
        }`}
        style={{
          boxShadow: processingThreat
            ? "0 0 40px hsl(var(--primary)), 0 0 80px hsl(var(--primary)/0.4)"
            : isActive
            ? "0 0 20px hsl(var(--primary)/0.5), 0 0 40px hsl(var(--primary)/0.2)"
            : "0 0 10px hsl(var(--primary)/0.2)",
          willChange: "transform, box-shadow",
        }}
      >
        <div className={`${processingThreat ? "w-12 h-12" : "w-8 h-8"} rounded-full bg-background border-2 border-primary transition-all duration-500`} />
      </div>

      {/* Threat level indicator rings - limited to max 3 */}
      {threatLevel > 0 && (
        <div className="absolute inset-0 flex items-center justify-center">
          {Array.from({ length: Math.min(threatLevel, 3) }).map((_, i) => (
            <div
              key={`threat-${i}`}
              className="absolute rounded-full border border-primary/40 animate-vortex-pulse"
              style={{
                width: `${260 + i * 40}px`,
                height: `${260 + i * 40}px`,
                animationDelay: `${i * 0.3}s`,
                willChange: "transform, opacity",
              }}
            />
          ))}
        </div>
      )}

      {/* Status text */}
      <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 text-center">
        <div className={`font-display text-xs md:text-sm tracking-[0.3em] ${processingThreat ? "text-primary text-glow" : "text-samaritan-text"}`}>
          {processingThreat ? "INSTANT ASPIRATION" : isActive ? "MONITORING" : "STANDBY"}
        </div>
        {processingThreat && (
          <div className="text-[9px] text-samaritan-cyan mt-1 font-mono">
            QUANTUM SPEED: 0.003ns RESPONSE
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(Vortex);
