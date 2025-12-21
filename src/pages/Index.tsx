import { useState, useCallback, useEffect } from "react";
import Header from "@/components/Header";
import Vortex from "@/components/Vortex";
import ThreatPanel from "@/components/ThreatPanel";
import SystemStatus from "@/components/SystemStatus";
import DataStream from "@/components/DataStream";
import TerminalLog from "@/components/TerminalLog";
import TestPanel from "@/components/TestPanel";
import ThreatVisualization from "@/components/ThreatVisualization";
import ThreatIntelPanel from "@/components/ThreatIntelPanel";
import URLScannerPanel from "@/components/URLScannerPanel";
import VortexSpeedMetrics from "@/components/VortexSpeedMetrics";
import RedirectDestinations, { RedirectDestination } from "@/components/RedirectDestinations";
import RiskAssessment from "@/components/RiskAssessment";
import { ThreatIntelligence } from "@/hooks/useThreatIntelligence";
import { URLScanResult } from "@/hooks/useURLScanner";

interface Threat {
  id: string;
  type: string;
  source: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "detected" | "processing" | "redirected" | "neutralized";
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

const destinationNames: Record<RedirectDestination, string> = {
  "attacker.origin.ip": "REVERSE TO ATTACKER",
  "void.blackhole.sys": "BLACK HOLE VOID",
  "honeypot.trap.net": "HONEYPOT TRAP",
  "null.route.void": "NULL ROUTE",
  "reverse.tunnel.origin": "REVERSE TUNNEL",
};

const Index = () => {
  const [isActive, setIsActive] = useState(false);
  const [threats, setThreats] = useState<Threat[]>([]);
  const [activeThreat, setActiveThreat] = useState<Threat | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: "1", timestamp: new Date(), type: "info", message: "System initialized" },
    { id: "2", timestamp: new Date(), type: "info", message: "Vortex core loaded" },
    { id: "3", timestamp: new Date(), type: "success", message: "Defense protocols ready" },
  ]);
  const [threatPhase, setThreatPhase] = useState<"incoming" | "captured" | "processing" | "redirecting" | "complete" | null>(null);
  const [currentThreatType, setCurrentThreatType] = useState("");
  const [redirectDestination, setRedirectDestination] = useState<RedirectDestination>("attacker.origin.ip");

  const addLog = useCallback((type: LogEntry["type"], message: string) => {
    setLogs((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        timestamp: new Date(),
        type,
        message,
      },
    ]);
  }, []);

  const handleRealThreatDetected = useCallback((intel: ThreatIntelligence) => {
    const severityMap: Record<string, Threat["severity"]> = {
      'critical': 'critical',
      'high': 'high', 
      'medium': 'medium',
      'low': 'low',
      'safe': 'low'
    };

    const newThreat: Threat = {
      id: Date.now().toString(),
      type: `Real Threat (${intel.riskScore}% risk)`,
      source: intel.ip,
      severity: severityMap[intel.threatLevel] || 'medium',
      status: "detected",
      timestamp: new Date(),
    };

    setActiveThreat(newThreat);
    setThreats((prev) => [newThreat, ...prev]);
    addLog("error", `REAL THREAT DETECTED: ${intel.ip} - ${intel.threatLevel.toUpperCase()} risk (${intel.riskScore}%)`);
    
    if (intel.geolocation) {
      addLog("warning", `Origin: ${intel.geolocation.city}, ${intel.geolocation.country} (${intel.geolocation.isp})`);
    }
    if (intel.abuseData && intel.abuseData.totalReports > 0) {
      addLog("warning", `${intel.abuseData.totalReports} abuse reports on record`);
    }
  }, [addLog]);

  const handleURLThreatDetected = useCallback((result: URLScanResult) => {
    const severityMap: Record<string, Threat["severity"]> = {
      'critical': 'critical',
      'high': 'high',
      'medium': 'medium',
      'low': 'low',
      'safe': 'low'
    };

    const newThreat: Threat = {
      id: Date.now().toString(),
      type: `Malicious URL (${result.stats.malicious} flags)`,
      source: result.url,
      severity: severityMap[result.threatLevel] || 'medium',
      status: "detected",
      timestamp: new Date(),
    };

    setActiveThreat(newThreat);
    setThreats((prev) => [newThreat, ...prev]);
    addLog("error", `MALICIOUS URL DETECTED: ${result.url}`);
    addLog("warning", `Flagged by ${result.stats.malicious} malicious + ${result.stats.suspicious} suspicious engines`);
    
    if (result.flaggedEngines.length > 0) {
      const engines = result.flaggedEngines.slice(0, 3).map(e => e.engine).join(', ');
      addLog("warning", `Detection engines: ${engines}`);
    }
  }, [addLog]);

  const handleToggleSystem = () => {
    setIsActive((prev) => {
      const newState = !prev;
      addLog(newState ? "success" : "warning", newState ? "VORTEX ACTIVATED - Quantum aspiration online" : "VORTEX DEACTIVATED - System in standby");
      return newState;
    });
  };

  const handleSimulateThreat = useCallback(
    async (type: string) => {
      const severities: Threat["severity"][] = ["low", "medium", "high", "critical"];
      const severity = severities[Math.floor(Math.random() * severities.length)];
      const sourceIP = generateIP();

      const newThreat: Threat = {
        id: Date.now().toString(),
        type,
        source: sourceIP,
        severity,
        status: "detected",
        timestamp: new Date(),
      };

      setCurrentThreatType(type);
      setActiveThreat(newThreat);
      setThreats((prev) => [newThreat, ...prev]);
      addLog("error", `⚡ THREAT DETECTED: ${type} attack from ${sourceIP}`);
      addLog("info", `Vortex response time: 0.003ns (quantum speed)`);
      setThreatPhase("incoming");

      // Phase 1: Instant Aspiration (0.5s for visual)
      await new Promise((resolve) => setTimeout(resolve, 500));
      setThreatPhase("captured");
      addLog("warning", "⚡ INSTANT ASPIRATION - Attack captured before execution");

      // Phase 2: Captured (0.3s)
      await new Promise((resolve) => setTimeout(resolve, 300));
      setThreatPhase("processing");
      setThreats((prev) =>
        prev.map((t) => (t.id === newThreat.id ? { ...t, status: "processing" } : t))
      );
      addLog("info", "Analyzing threat signature (zero execution window)...");

      // Phase 3: Processing (1s)
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setThreatPhase("redirecting");
      setThreats((prev) =>
        prev.map((t) => (t.id === newThreat.id ? { ...t, status: "redirected" } : t))
      );
      addLog("info", `Redirecting to: ${redirectDestination}`);
      addLog("warning", `Destination: ${destinationNames[redirectDestination]}`);

      // Phase 4: Redirecting (1s)
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setThreatPhase("complete");
      setThreats((prev) =>
        prev.map((t) => (t.id === newThreat.id ? { ...t, status: "neutralized" } : t))
      );
      addLog("success", `✓ THREAT NEUTRALIZED via ${destinationNames[redirectDestination]}`);

      // Phase 5: Complete (0.5s)
      await new Promise((resolve) => setTimeout(resolve, 500));
      setThreatPhase(null);
      setActiveThreat(null);
      setCurrentThreatType("");
    },
    [addLog, redirectDestination]
  );

  // Auto-generate random threats when active
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      if (!activeThreat && Math.random() > 0.7) {
        const types = ["DDoS", "Phishing", "Malware", "Intrusion"];
        handleSimulateThreat(types[Math.floor(Math.random() * types.length)]);
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [isActive, activeThreat, handleSimulateThreat]);

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Background effects */}
      <DataStream />
      <div className="fixed inset-0 scanline pointer-events-none" />

      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="pt-24 pb-8 px-4 md:px-8 min-h-screen">
        <div className="max-w-screen-2xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
            {/* Left Panel - System Status & Controls */}
            <div className="lg:col-span-3 space-y-4">
              <SystemStatus
                isActive={isActive}
                threatsBlocked={threats.filter((t) => t.status === "neutralized").length}
              />
              <TestPanel
                onSimulateThreat={handleSimulateThreat}
                onToggleSystem={handleToggleSystem}
                isActive={isActive}
                isProcessing={!!activeThreat}
              />
              <RedirectDestinations
                selectedDestination={redirectDestination}
                onSelectDestination={setRedirectDestination}
                isProcessing={!!activeThreat}
                currentPhase={threatPhase}
              />
            </div>

            {/* Center - Vortex Display */}
            <div className="lg:col-span-6 flex flex-col items-center justify-center relative min-h-[500px] md:min-h-[600px]">
              {/* Speed Metrics */}
              <VortexSpeedMetrics
                isActive={isActive}
                isProcessing={!!activeThreat}
                threatLevel={activeThreat ? (activeThreat.severity === "critical" ? 3 : activeThreat.severity === "high" ? 2 : 1) : 0}
              />
              
              <ThreatVisualization
                threatActive={!!activeThreat}
                threatType={currentThreatType}
                phase={threatPhase}
              />
              <Vortex
                isActive={isActive}
                threatLevel={activeThreat ? (activeThreat.severity === "critical" ? 3 : activeThreat.severity === "high" ? 2 : 1) : 0}
                processingThreat={!!activeThreat}
              />
            </div>

            {/* Right Panel - Threat Monitor & Intelligence */}
            <div className="lg:col-span-3 space-y-4">
              <ThreatIntelPanel onThreatDetected={handleRealThreatDetected} />
              <URLScannerPanel onThreatDetected={handleURLThreatDetected} />
              <RiskAssessment isActive={isActive} isProcessing={!!activeThreat} />
              <ThreatPanel threats={threats} activeThreat={activeThreat} />
            </div>
          </div>

          {/* Bottom - Terminal Log */}
          <div className="mt-6">
            <TerminalLog logs={logs} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
