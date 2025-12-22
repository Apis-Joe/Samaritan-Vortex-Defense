import { useState, useEffect, useCallback, memo } from "react";
import { Shield, Zap, Atom, Lock, AlertTriangle, Activity, Radio, Waves } from "lucide-react";

interface QuantumAttack {
  id: string;
  name: string;
  type: string;
  icon: typeof Shield;
  description: string;
  qubitPower: number;
  status: "monitoring" | "detected" | "neutralized";
  responseTime: string;
}

const quantumAttackTypes: Omit<QuantumAttack, "id" | "status" | "responseTime">[] = [
  { name: "Shor's Algorithm", type: "CRYPTO_BREAK", icon: Lock, description: "RSA/ECC factorization attack", qubitPower: 4096 },
  { name: "Grover's Search", type: "BRUTE_FORCE", icon: Zap, description: "Quadratic speedup key search", qubitPower: 2048 },
  { name: "Quantum Tunneling", type: "BARRIER_BYPASS", icon: Waves, description: "Firewall penetration via tunneling", qubitPower: 512 },
  { name: "Entanglement Hijack", type: "CHANNEL_INTERCEPT", icon: Radio, description: "Quantum channel interception", qubitPower: 1024 },
  { name: "Superposition Flood", type: "MULTI_STATE", icon: Atom, description: "Simultaneous multi-vector attack", qubitPower: 8192 },
  { name: "Decoherence Strike", type: "SYSTEM_DESTAB", icon: Activity, description: "Quantum state destabilization", qubitPower: 256 },
  { name: "Bell State Attack", type: "CORRELATION", icon: AlertTriangle, description: "Quantum correlation exploitation", qubitPower: 768 },
  { name: "QKD Interception", type: "KEY_INTERCEPT", icon: Shield, description: "Quantum key distribution attack", qubitPower: 3072 },
];

interface Props {
  isActive: boolean;
  onQuantumThreat?: (attack: QuantumAttack) => void;
}

const QuantumDefensePanel = memo(({ isActive, onQuantumThreat }: Props) => {
  const [attacks, setAttacks] = useState<QuantumAttack[]>([]);
  const [totalQubitPower, setTotalQubitPower] = useState(0);
  const [defenseStrength, setDefenseStrength] = useState(100);
  const [cryptoStatus, setCryptoStatus] = useState({
    lattice: true,
    hash: true,
    code: true,
    multivariate: true,
  });

  // Initialize quantum monitoring
  useEffect(() => {
    const initialAttacks = quantumAttackTypes.map((attack, i) => ({
      ...attack,
      id: `quantum-${i}`,
      status: "monitoring" as const,
      responseTime: `${(Math.random() * 0.5 + 0.1).toFixed(3)}ns`,
    }));
    setAttacks(initialAttacks);
  }, []);

  // Simulate quantum threat detection
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      if (Math.random() > 0.85) {
        const randomIndex = Math.floor(Math.random() * attacks.length);
        const attack = attacks[randomIndex];
        
        if (attack && attack.status === "monitoring") {
          const detectedAttack = { ...attack, status: "detected" as const };
          
          setAttacks(prev => prev.map((a, i) => 
            i === randomIndex ? detectedAttack : a
          ));
          
          setTotalQubitPower(prev => prev + attack.qubitPower);
          onQuantumThreat?.(detectedAttack);

          // Auto-neutralize after delay
          setTimeout(() => {
            setAttacks(prev => prev.map((a, i) => 
              i === randomIndex ? { ...a, status: "neutralized" as const } : a
            ));
            
            setTimeout(() => {
              setAttacks(prev => prev.map((a, i) => 
                i === randomIndex ? { ...a, status: "monitoring" as const } : a
              ));
            }, 3000);
          }, 1500);
        }
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isActive, attacks, onQuantumThreat]);

  // Update defense strength
  useEffect(() => {
    const activeThreats = attacks.filter(a => a.status === "detected").length;
    setDefenseStrength(Math.max(0, 100 - activeThreats * 15));
  }, [attacks]);

  const getStatusColor = useCallback((status: QuantumAttack["status"]) => {
    switch (status) {
      case "monitoring": return "text-samaritan-cyan";
      case "detected": return "text-primary animate-pulse";
      case "neutralized": return "text-samaritan-success";
    }
  }, []);

  const getStatusBg = useCallback((status: QuantumAttack["status"]) => {
    switch (status) {
      case "monitoring": return "bg-samaritan-cyan/10";
      case "detected": return "bg-primary/20";
      case "neutralized": return "bg-samaritan-success/10";
    }
  }, []);

  return (
    <div className="bg-card/90 backdrop-blur border border-border rounded-sm p-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Atom className="w-4 h-4 text-samaritan-cyan" />
          <span className="font-display text-xs text-foreground uppercase tracking-wider">
            Quantum Defense
          </span>
        </div>
        <div className={`px-2 py-0.5 rounded text-[10px] font-mono ${
          isActive ? "bg-samaritan-cyan/20 text-samaritan-cyan" : "bg-muted text-muted-foreground"
        }`}>
          {isActive ? "ACTIVE" : "STANDBY"}
        </div>
      </div>

      {/* Qubit Power Meter */}
      <div className="mb-3 p-2 bg-background/50 rounded border border-border/50">
        <div className="flex justify-between text-[10px] mb-1">
          <span className="text-muted-foreground">QUBIT POWER TRACKED</span>
          <span className="text-samaritan-cyan font-mono">{totalQubitPower.toLocaleString()} qubits</span>
        </div>
        <div className="h-1.5 bg-muted rounded overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-samaritan-cyan to-primary transition-all duration-500"
            style={{ width: `${Math.min(100, totalQubitPower / 200)}%` }}
          />
        </div>
      </div>

      {/* Defense Strength */}
      <div className="mb-3 p-2 bg-background/50 rounded border border-border/50">
        <div className="flex justify-between text-[10px] mb-1">
          <span className="text-muted-foreground">POST-QUANTUM CRYPTO STRENGTH</span>
          <span className={`font-mono ${defenseStrength > 70 ? "text-samaritan-success" : defenseStrength > 40 ? "text-samaritan-warning" : "text-primary"}`}>
            {defenseStrength}%
          </span>
        </div>
        <div className="h-1.5 bg-muted rounded overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${
              defenseStrength > 70 ? "bg-samaritan-success" : defenseStrength > 40 ? "bg-samaritan-warning" : "bg-primary"
            }`}
            style={{ width: `${defenseStrength}%` }}
          />
        </div>
      </div>

      {/* Crypto Algorithms Status */}
      <div className="mb-3 grid grid-cols-2 gap-1">
        {Object.entries(cryptoStatus).map(([algo, active]) => (
          <div key={algo} className={`flex items-center gap-1 p-1 rounded text-[9px] ${
            active ? "bg-samaritan-success/10 text-samaritan-success" : "bg-primary/10 text-primary"
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full ${active ? "bg-samaritan-success" : "bg-primary"}`} />
            <span className="uppercase">{algo}-BASED</span>
          </div>
        ))}
      </div>

      {/* Attack Types Grid */}
      <div className="space-y-1 max-h-48 overflow-y-auto">
        {attacks.map((attack) => (
          <div 
            key={attack.id}
            className={`flex items-center gap-2 p-1.5 rounded transition-all duration-300 ${getStatusBg(attack.status)}`}
          >
            <attack.icon className={`w-3 h-3 ${getStatusColor(attack.status)}`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-medium truncate ${getStatusColor(attack.status)}`}>
                  {attack.name}
                </span>
                <span className="text-[8px] text-muted-foreground font-mono ml-1">
                  {attack.responseTime}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[8px] text-muted-foreground truncate">{attack.type}</span>
                <span className="text-[8px] text-samaritan-cyan">{attack.qubitPower}q</span>
              </div>
            </div>
            <div className={`w-2 h-2 rounded-full ${
              attack.status === "monitoring" ? "bg-samaritan-cyan/50" :
              attack.status === "detected" ? "bg-primary animate-pulse" :
              "bg-samaritan-success"
            }`} />
          </div>
        ))}
      </div>

      {/* Response Time */}
      <div className="mt-2 pt-2 border-t border-border/50 flex justify-between text-[9px]">
        <span className="text-muted-foreground">AVG RESPONSE</span>
        <span className="text-samaritan-cyan font-mono">0.247ns (quantum speed)</span>
      </div>
    </div>
  );
});

QuantumDefensePanel.displayName = "QuantumDefensePanel";

export default QuantumDefensePanel;
