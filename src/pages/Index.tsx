import { useState, useCallback, useEffect } from "react";
import Header from "@/components/Header";
import Vortex from "@/components/Vortex";
import ThreatPanel from "@/components/ThreatPanel";
import SystemStatus from "@/components/SystemStatus";
import DataStream from "@/components/DataStream";
import TerminalLog from "@/components/TerminalLog";
import TestPanel from "@/components/TestPanel";
import VortexStatsPanel from "@/components/VortexStatsPanel";
import AttackFlowProcess from "@/components/AttackFlowProcess";
import NeutralizationLog from "@/components/NeutralizationLog";
import AttackDestinationsPanel from "@/components/AttackDestinationsPanel";
import ConnectionSecurityMonitor from "@/components/ConnectionSecurityMonitor";
import AdvancedRiskAssessment from "@/components/AdvancedRiskAssessment";
import QuantumDefensePanel from "@/components/QuantumDefensePanel";
import ZeroDayTrainingMode from "@/components/ZeroDayTrainingMode";
import SelfAuditSystem from "@/components/SelfAuditSystem";
import OriginAnchorSystem from "@/components/OriginAnchorSystem";
import { RedirectDestination } from "@/components/AttackDestinationsPanel";

interface Threat {
  id: string;
  type: string;
  source: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "detected" | "processing" | "redirected" | "neutralized";
  timestamp: Date;
}

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

interface LogEntry {
  id: string;
  timestamp: Date;
  type: "info" | "warning" | "error" | "success";
  message: string;
}

const generateIP = () => {
  return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
};

const destinations: RedirectDestination[] = [
  "attacker.origin.ip", "void.blackhole.sys", "honeypot.trap.net", "null.route.void", "reverse.tunnel.origin"
];

const Index = () => {
  const [isActive, setIsActive] = useState(false);
  const [threats, setThreats] = useState<Threat[]>([]);
  const [neutralizedThreats, setNeutralizedThreats] = useState<NeutralizedThreat[]>([]);
  const [activeThreat, setActiveThreat] = useState<Threat | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: "1", timestamp: new Date(), type: "info", message: "System initialized" },
    { id: "2", timestamp: new Date(), type: "info", message: "Vortex core loaded" },
    { id: "3", timestamp: new Date(), type: "success", message: "Defense protocols ready" },
  ]);
  const [flowPhase, setFlowPhase] = useState<'idle' | 'detecting' | 'aspirating' | 'redirecting'>('idle');
  const [destinationStats, setDestinationStats] = useState<Record<RedirectDestination, number>>({
    "attacker.origin.ip": 0, "void.blackhole.sys": 0, "honeypot.trap.net": 0, "null.route.void": 0, "reverse.tunnel.origin": 0
  });
  const [stats, setStats] = useState({ aspirated: 0, redirects: 0, executions: 0, damageMB: 0, codeCaptured: 0 });

  const addLog = useCallback((type: LogEntry["type"], message: string) => {
    setLogs((prev) => [...prev, { id: Date.now().toString(), timestamp: new Date(), type, message }]);
  }, []);

  const handleToggleSystem = () => {
    setIsActive((prev) => {
      addLog(!prev ? "success" : "warning", !prev ? "VORTEX ACTIVATED - Quantum aspiration online" : "VORTEX DEACTIVATED");
      return !prev;
    });
  };

  const handleSimulateThreat = useCallback(async (type: string) => {
    const severities: Threat["severity"][] = ["low", "medium", "high", "critical"];
    const sourceIP = generateIP();
    const destination = destinations[Math.floor(Math.random() * destinations.length)];

    const newThreat: Threat = {
      id: Date.now().toString(), type, source: sourceIP,
      severity: severities[Math.floor(Math.random() * severities.length)],
      status: "detected", timestamp: new Date(),
    };

    setActiveThreat(newThreat);
    setThreats((prev) => [newThreat, ...prev]);
    addLog("error", `⚡ THREAT DETECTED: ${type} from ${sourceIP}`);
    setFlowPhase("detecting");

    await new Promise((r) => setTimeout(r, 500));
    setFlowPhase("aspirating");
    addLog("warning", "⚡ INSTANT ASPIRATION - Attack captured");

    await new Promise((r) => setTimeout(r, 800));
    setFlowPhase("redirecting");
    setThreats((prev) => prev.map((t) => t.id === newThreat.id ? { ...t, status: "redirected" } : t));

    await new Promise((r) => setTimeout(r, 800));
    setThreats((prev) => prev.map((t) => t.id === newThreat.id ? { ...t, status: "neutralized" } : t));
    
    const neutralized: NeutralizedThreat = {
      id: newThreat.id, type, sourceIP, destination,
      destinationName: destination, speedMultiplier: Math.floor(Math.random() * 40000) + 5000,
      neutralizedPercent: 100, damagePrevented: Math.random() * 15 + 1, codeFragments: Math.floor(Math.random() * 50) + 10,
      timestamp: new Date(),
    };
    setNeutralizedThreats((prev) => [neutralized, ...prev].slice(0, 20));
    setDestinationStats((prev) => ({ ...prev, [destination]: (prev[destination] || 0) + 1 }));
    setStats((prev) => ({
      aspirated: prev.aspirated + 1, redirects: prev.redirects + 1, executions: 0,
      damageMB: prev.damageMB + neutralized.damagePrevented, codeCaptured: prev.codeCaptured + neutralized.codeFragments
    }));
    addLog("success", `✓ NEUTRALIZED via ${destination}`);
    setFlowPhase("idle");
    setActiveThreat(null);
  }, [addLog]);

  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      if (!activeThreat && Math.random() > 0.6) {
        const types = ["DDoS", "Phishing", "Malware", "Intrusion", "Buffer Overflow", "Privilege Escalation"];
        handleSimulateThreat(types[Math.floor(Math.random() * types.length)]);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [isActive, activeThreat, handleSimulateThreat]);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <DataStream />
      <div className="fixed inset-0 scanline pointer-events-none" />
      <Header />

      <main className="pt-20 pb-8 px-4 md:px-6">
        <div className="max-w-screen-2xl mx-auto space-y-4">
          {/* Stats Panel */}
          <VortexStatsPanel isActive={isActive} threatsAspirated={stats.aspirated} redirects={stats.redirects}
            executions={stats.executions} damagePreventedMB={stats.damageMB} codeCaptured={stats.codeCaptured} responseTimeMs={0.046} />

          {/* Main Grid: Vortex + Tests + Destinations */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-sm text-primary tracking-wider">VORTEX CORE</h3>
                  <button onClick={handleToggleSystem}
                    className={`px-3 py-1 text-xs font-mono rounded border ${isActive ? 'border-emerald-500 text-emerald-400' : 'border-border text-muted-foreground'}`}>
                    {isActive ? 'ACTIVE' : 'OFF'}
                  </button>
                </div>
                <div className="flex justify-center items-center min-h-[300px]">
                  <Vortex isActive={isActive} threatLevel={activeThreat ? 2 : 0} processingThreat={!!activeThreat} />
                </div>
              </div>
              <AttackFlowProcess phase={flowPhase} />
            </div>

            <div className="lg:col-span-5 space-y-4">
              <TestPanel onSimulateThreat={handleSimulateThreat} onToggleSystem={handleToggleSystem} isActive={isActive} isProcessing={!!activeThreat} />
              <AttackDestinationsPanel stats={destinationStats} totalRedirects={stats.redirects} />
            </div>
          </div>

          {/* Neutralization Log */}
          <NeutralizationLog threats={neutralizedThreats}
            latestRedirects={neutralizedThreats.slice(0, 3).map(t => ({ ip: t.sourceIP, destination: t.destination }))} />

          {/* Connection Monitor + Zero-Day Training */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ConnectionSecurityMonitor isActive={isActive} onThreatDetected={(conn) => addLog("warning", `Connection threat: ${conn.fromIP}`)} />
            <ZeroDayTrainingMode isActive={isActive} onLearningComplete={(p, c) => addLog("success", `AI: ${p} patterns, ${c.toFixed(1)}%`)} />
          </div>

          {/* Quantum + Risk Assessment */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <QuantumDefensePanel isActive={isActive} onQuantumThreat={(a) => addLog("error", `Quantum: ${a.name}`)} />
            <ThreatPanel threats={threats} activeThreat={activeThreat} />
          </div>

          {/* Advanced Risk Assessment */}
          <AdvancedRiskAssessment isActive={isActive} onAssessmentComplete={(r) => addLog("info", `Assessment: ${r.type} - ${r.level}`)} />

          {/* Origin Anchor + Self-Audit */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <OriginAnchorSystem isActive={isActive} onRestoreTriggered={() => addLog("success", "Origin restored")} onIntegrityBreach={(m) => addLog("error", `Breach: ${m.name}`)} />
            <SelfAuditSystem isActive={isActive} onVulnerabilityFound={(c) => addLog("warning", `Vuln: ${c.name}`)} />
          </div>

          {/* Terminal Log */}
          <TerminalLog logs={logs} />
        </div>
      </main>
    </div>
  );
};

export default Index;
