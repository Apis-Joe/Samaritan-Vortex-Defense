import { useEffect, useState, useMemo, memo, useCallback } from "react";

interface VortexProps {
  isActive: boolean;
  threatLevel: number;
  processingThreat: boolean;
}

// Power mode configuration
interface PowerMode {
  name: string;
  particles: number;
  rings: number;
  spiralArms: number;
  glowIntensity: number;
  motionBlur: boolean;
  energyRings: boolean;
}

const POWER_MODES: Record<string, PowerMode> = {
  standby: {
    name: "STANDBY",
    particles: 30,
    rings: 3,
    spiralArms: 2,
    glowIntensity: 0.3,
    motionBlur: false,
    energyRings: false,
  },
  monitoring: {
    name: "MONITORING",
    particles: 50,
    rings: 4,
    spiralArms: 4,
    glowIntensity: 0.5,
    motionBlur: false,
    energyRings: false,
  },
  medium: {
    name: "ACTIVE",
    particles: 100,
    rings: 5,
    spiralArms: 5,
    glowIntensity: 0.7,
    motionBlur: false,
    energyRings: true,
  },
  critical: {
    name: "⚡ MAXIMUM POWER ⚡",
    particles: 200,
    rings: 7,
    spiralArms: 8,
    glowIntensity: 1,
    motionBlur: true,
    energyRings: true,
  },
};

// Memoized particle component for performance
const VortexParticle = memo(({ 
  particle, 
  processingThreat,
  glowIntensity,
}: { 
  particle: { id: number; angle: number; distance: number; size: number }; 
  processingThreat: boolean;
  glowIntensity: number;
}) => (
  <div
    className={`absolute rounded-full ${processingThreat ? "bg-primary" : "bg-samaritan-text"}`}
    style={{
      width: `${particle.size}px`,
      height: `${particle.size}px`,
      left: "50%",
      top: "50%",
      transform: `rotate(${particle.angle}deg) translateX(${particle.distance}px)`,
      opacity: Math.min(0.3 + glowIntensity * 0.5, 0.9),
      willChange: "transform",
      boxShadow: processingThreat && glowIntensity > 0.7 
        ? `0 0 ${particle.size * 2}px hsl(var(--primary))` 
        : "none",
    }}
  />
));

VortexParticle.displayName = "VortexParticle";

// Energy ring component for maximum power mode
const EnergyRing = memo(({ index, speedMultiplier }: { index: number; speedMultiplier: number }) => (
  <div
    className="absolute rounded-full border border-primary/30"
    style={{
      width: `${350 + index * 30}px`,
      height: `${350 + index * 30}px`,
      animation: `vortex-pulse ${2 + index * 0.5}s ease-in-out infinite`,
      animationDelay: `${index * 0.3}s`,
      willChange: "transform, opacity",
    }}
  />
));

EnergyRing.displayName = "EnergyRing";

const Vortex = ({ isActive, threatLevel, processingThreat }: VortexProps) => {
  const [isMobile, setIsMobile] = useState(false);
  const [powerMode, setPowerMode] = useState<PowerMode>(POWER_MODES.standby);
  const [fps, setFps] = useState(30);

  // Detect mobile for reduced particles
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // ADAPTIVE POWER SYSTEM - scales based on threat level
  const calculatePowerMode = useCallback(() => {
    if (!isActive) {
      return POWER_MODES.standby;
    }
    
    if (processingThreat || threatLevel >= 3) {
      // MAXIMUM POWER - serious threats require full resources
      return POWER_MODES.critical;
    }
    
    if (threatLevel >= 1) {
      // Medium power for moderate threats
      return POWER_MODES.medium;
    }
    
    // Normal monitoring - conserve resources
    return POWER_MODES.monitoring;
  }, [isActive, threatLevel, processingThreat]);

  useEffect(() => {
    const newMode = calculatePowerMode();
    setPowerMode(newMode);
    
    // Adaptive FPS based on power mode
    if (newMode === POWER_MODES.critical) {
      setFps(60); // Maximum smoothness for critical
    } else if (newMode === POWER_MODES.medium) {
      setFps(45);
    } else {
      setFps(30); // Energy saving
    }
  }, [calculatePowerMode]);

  // Generate particles based on power mode (reduced on mobile)
  const particles = useMemo(() => {
    const baseCount = powerMode.particles;
    const count = isMobile ? Math.floor(baseCount * 0.5) : baseCount;
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      angle: (i * (360 / count)) % 360,
      distance: 50 + (i % 6) * 22,
      size: 1 + (i % 3),
    }));
  }, [powerMode.particles, isMobile]);

  // Dynamic rings based on power mode
  const rings = useMemo(() => 
    Array.from({ length: powerMode.rings }, (_, i) => i + 1), 
    [powerMode.rings]
  );

  // Dynamic spiral arms based on power mode
  const spiralArms = useMemo(() => 
    Array.from({ length: powerMode.spiralArms }, (_, i) => (360 / powerMode.spiralArms) * i),
    [powerMode.spiralArms]
  );

  const speedMultiplier = processingThreat ? 3 : isActive ? 1 : 0.3;
  const coreSize = processingThreat ? "w-24 h-24" : isActive ? "w-20 h-20" : "w-16 h-16";

  // CSS for hardware acceleration
  const gpuAcceleratedStyle = useMemo(() => ({
    willChange: "transform",
    transform: "translateZ(0)",
    backfaceVisibility: "hidden" as const,
  }), []);

  return (
    <div 
      className="relative w-[300px] h-[300px] md:w-[400px] md:h-[400px] flex items-center justify-center"
      style={gpuAcceleratedStyle}
    >
      {/* Background grid - simplified */}
      <div className="absolute inset-0 grid-pattern opacity-20 rounded-full overflow-hidden" />

      {/* Energy rings - only in maximum power mode */}
      {powerMode.energyRings && (
        <>
          {[0, 1, 2].map((i) => (
            <EnergyRing key={`energy-${i}`} index={i} speedMultiplier={speedMultiplier} />
          ))}
        </>
      )}

      {/* Outer vortex rings - dynamic count based on power mode */}
      {rings.map((ring) => (
        <div
          key={ring}
          className={`absolute rounded-full border ${
            processingThreat ? "border-primary" : "border-samaritan-border"
          }`}
          style={{
            width: `${70 + ring * 50}px`,
            height: `${70 + ring * 50}px`,
            animation: `vortex-spin${ring % 2 === 0 ? "-reverse" : ""} ${
              (10 + ring * 2) / speedMultiplier
            }s linear infinite`,
            borderWidth: ring === 1 ? "2px" : "1px",
            opacity: powerMode.glowIntensity * (0.4 + (ring * 0.05)),
            willChange: "transform",
            ...(powerMode.motionBlur && {
              filter: `blur(${ring * 0.3}px)`,
            }),
          }}
        />
      ))}

      {/* Spiral arms - dynamic count */}
      {spiralArms.map((rotation, i) => (
        <div
          key={`arm-${i}`}
          className="absolute w-full h-full"
          style={{
            transform: `rotate(${rotation}deg)`,
            animation: `vortex-spin ${16 / speedMultiplier}s linear infinite`,
            willChange: "transform",
          }}
        >
          <div
            className={`absolute left-1/2 top-0 h-1/2 w-0.5 origin-bottom ${
              processingThreat 
                ? "bg-gradient-to-t from-primary via-primary/50 to-transparent" 
                : "bg-gradient-to-t from-samaritan-border via-samaritan-border/30 to-transparent"
            }`}
            style={{ 
              transform: `translateX(-50%) rotate(${12 + i * 6}deg)`,
              opacity: powerMode.glowIntensity,
            }}
          />
        </div>
      ))}

      {/* Vortex particles - optimized with memoization */}
      <div
        className="absolute w-full h-full"
        style={{ 
          animation: `vortex-spin ${20 / speedMultiplier}s linear infinite`,
          willChange: "transform",
        }}
      >
        {particles.map((particle) => (
          <VortexParticle 
            key={particle.id} 
            particle={particle} 
            processingThreat={processingThreat}
            glowIntensity={powerMode.glowIntensity}
          />
        ))}
      </div>

      {/* Motion blur trails - only in maximum power mode */}
      {powerMode.motionBlur && processingThreat && (
        <div 
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, transparent 30%, hsl(var(--primary) / 0.1) 70%, transparent 100%)`,
            animation: `vortex-spin ${8 / speedMultiplier}s linear infinite`,
            filter: "blur(8px)",
          }}
        />
      )}

      {/* Inner rotating rings - simplified */}
      <div
        className={`absolute w-32 h-32 md:w-36 md:h-36 rounded-full border-2 ${
          processingThreat ? "border-primary" : "border-samaritan-border"
        }`}
        style={{ 
          animation: `vortex-spin ${8 / speedMultiplier}s linear infinite`,
          willChange: "transform",
          opacity: powerMode.glowIntensity,
        }}
      >
        <div className="absolute -top-1 left-1/2 w-2 h-2 -translate-x-1/2 rounded-full bg-primary" />
        <div className="absolute -bottom-1 left-1/2 w-2 h-2 -translate-x-1/2 rounded-full bg-primary" />
      </div>

      <div
        className={`absolute w-20 h-20 md:w-24 md:h-24 rounded-full border ${
          processingThreat ? "border-primary/80" : "border-samaritan-border/60"
        }`}
        style={{ 
          animation: `vortex-spin-reverse ${6 / speedMultiplier}s linear infinite`,
          willChange: "transform",
        }}
      >
        <div className="absolute -left-1 top-1/2 w-2 h-2 -translate-y-1/2 rounded-full bg-primary/80" />
        <div className="absolute -right-1 top-1/2 w-2 h-2 -translate-y-1/2 rounded-full bg-primary/80" />
      </div>

      {/* Core - dynamic glow based on power mode */}
      <div
        className={`relative ${coreSize} rounded-full bg-gradient-to-br from-primary via-primary/60 to-transparent flex items-center justify-center transition-all duration-500 ${
          processingThreat ? "animate-vortex-core-pulse" : isActive ? "animate-vortex-pulse" : ""
        }`}
        style={{
          boxShadow: processingThreat
            ? `0 0 ${40 * powerMode.glowIntensity}px hsl(var(--primary)), 0 0 ${80 * powerMode.glowIntensity}px hsl(var(--primary)/0.4)`
            : isActive
            ? `0 0 ${20 * powerMode.glowIntensity}px hsl(var(--primary)/0.5), 0 0 ${40 * powerMode.glowIntensity}px hsl(var(--primary)/0.2)`
            : "0 0 10px hsl(var(--primary)/0.2)",
          willChange: "transform, box-shadow",
        }}
      >
        <div className={`${processingThreat ? "w-10 h-10 md:w-12 md:h-12" : "w-6 h-6 md:w-8 md:h-8"} rounded-full bg-background border-2 border-primary transition-all duration-500`} />
      </div>

      {/* Threat level indicator rings - limited based on actual threat */}
      {threatLevel > 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {Array.from({ length: Math.min(threatLevel, 4) }).map((_, i) => (
            <div
              key={`threat-${i}`}
              className="absolute rounded-full border border-primary/40 animate-vortex-pulse"
              style={{
                width: `${220 + i * 35}px`,
                height: `${220 + i * 35}px`,
                animationDelay: `${i * 0.25}s`,
                willChange: "transform, opacity",
              }}
            />
          ))}
        </div>
      )}

      {/* Status display */}
      <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 text-center whitespace-nowrap">
        <div className={`font-display text-[10px] md:text-xs tracking-[0.2em] ${
          powerMode === POWER_MODES.critical ? "text-primary text-glow-intense animate-pulse" : 
          processingThreat ? "text-primary text-glow" : 
          "text-samaritan-text"
        }`}>
          {powerMode.name}
        </div>
        
        {/* Performance stats */}
        <div className="flex items-center justify-center gap-2 mt-1">
          <span className="text-[8px] md:text-[9px] text-muted-foreground font-mono">
            {fps}fps
          </span>
          <span className="text-[8px] md:text-[9px] text-muted-foreground">•</span>
          <span className="text-[8px] md:text-[9px] text-muted-foreground font-mono">
            {particles.length}p
          </span>
          {powerMode === POWER_MODES.critical && (
            <>
              <span className="text-[8px] md:text-[9px] text-muted-foreground">•</span>
              <span className="text-[8px] md:text-[9px] text-primary font-mono">
                GPU
              </span>
            </>
          )}
        </div>
        
        {processingThreat && (
          <div className="text-[8px] md:text-[9px] text-samaritan-cyan mt-1 font-mono animate-pulse">
            QUANTUM SPEED: 0.003ns
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(Vortex);