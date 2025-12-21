import { useState, useEffect } from "react";
import { Shield, AlertTriangle, Brain, Clock, Layers, Cpu, Eye, CheckCircle } from "lucide-react";

interface ThreatScenario {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  defense: string;
  result: string;
  status: "DEFENDED" | "ANALYZING" | "NEUTRALIZED";
  riskLevel: number;
}

interface RiskAssessmentProps {
  isActive: boolean;
  isProcessing: boolean;
}

const scenarios: ThreatScenario[] = [
  {
    id: "learning-virus",
    name: "LEARNING VIRUSES",
    icon: <Brain className="w-4 h-4" />,
    description: "AI-powered code that studies the sandbox",
    defense: "Environment randomized every 10 seconds",
    result: "Learning window TOO SHORT (60s max lifetime)",
    status: "DEFENDED",
    riskLevel: 15,
  },
  {
    id: "time-bomb",
    name: "TIME-BOMB ATTACKS",
    icon: <Clock className="w-4 h-4" />,
    description: "Waits days/weeks before activation",
    defense: "60-second kill timer - NO long-term storage",
    result: "Terminated before waking up",
    status: "DEFENDED",
    riskLevel: 5,
  },
  {
    id: "multi-stage",
    name: "MULTI-STAGE ATTACKS",
    icon: <Layers className="w-4 h-4" />,
    description: "Coordinates between containers",
    defense: "Complete container isolation - NO communication",
    result: "Cannot coordinate - blind and isolated",
    status: "DEFENDED",
    riskLevel: 10,
  },
  {
    id: "resource-exhaustion",
    name: "RESOURCE EXHAUSTION",
    icon: <Cpu className="w-4 h-4" />,
    description: "Tries to crash honeypot",
    defense: "Hard limits (1MB RAM, 0.1% CPU)",
    result: "Cannot consume resources",
    status: "DEFENDED",
    riskLevel: 8,
  },
  {
    id: "trojan-horse",
    name: "TROJAN HORSE",
    icon: <Eye className="w-4 h-4" />,
    description: "Researcher intentionally studies system",
    defense: "Zero-knowledge architecture",
    result: "Learns NOTHING - blind environment",
    status: "DEFENDED",
    riskLevel: 3,
  },
];

const RiskAssessment = ({ isActive, isProcessing }: RiskAssessmentProps) => {
  const [activeScenarios, setActiveScenarios] = useState<ThreatScenario[]>(scenarios);
  const [overallRisk, setOverallRisk] = useState(0);
  const [scanProgress, setScanProgress] = useState(0);

  // Simulate continuous risk assessment
  useEffect(() => {
    if (!isActive) {
      setOverallRisk(0);
      setScanProgress(0);
      return;
    }

    const scanInterval = setInterval(() => {
      setScanProgress(prev => (prev + 2) % 100);
    }, 100);

    const riskInterval = setInterval(() => {
      // Calculate dynamic risk based on scenarios
      const baseRisk = scenarios.reduce((sum, s) => sum + s.riskLevel, 0) / scenarios.length;
      const variation = isProcessing ? Math.random() * 10 : Math.random() * 5;
      setOverallRisk(Math.min(baseRisk + variation, 100));

      // Randomly update scenario statuses when processing
      if (isProcessing) {
        setActiveScenarios(prev => prev.map(s => ({
          ...s,
          status: Math.random() > 0.7 ? "ANALYZING" : "DEFENDED",
        })));
      } else {
        setActiveScenarios(scenarios.map(s => ({ ...s, status: "DEFENDED" })));
      }
    }, 500);

    return () => {
      clearInterval(scanInterval);
      clearInterval(riskInterval);
    };
  }, [isActive, isProcessing]);

  const getRiskColor = (risk: number) => {
    if (risk < 10) return "text-samaritan-success";
    if (risk < 30) return "text-samaritan-cyan";
    if (risk < 60) return "text-samaritan-warning";
    return "text-primary";
  };

  const getStatusColor = (status: ThreatScenario["status"]) => {
    switch (status) {
      case "DEFENDED": return "text-samaritan-success";
      case "ANALYZING": return "text-samaritan-warning animate-pulse";
      case "NEUTRALIZED": return "text-samaritan-cyan";
    }
  };

  if (!isActive) return null;

  return (
    <div className="bg-card border border-border rounded p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" />
          <span className="font-display text-sm tracking-wider text-foreground">
            RISK ASSESSMENT
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-[10px] text-muted-foreground font-mono">SCAN</div>
          <div className="w-12 h-1 bg-background rounded overflow-hidden">
            <div 
              className="h-full bg-samaritan-cyan transition-all duration-100"
              style={{ width: `${scanProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Overall Risk Gauge */}
      <div className="bg-background/50 rounded p-3 mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-muted-foreground">OVERALL THREAT RISK</span>
          <span className={`font-mono text-sm ${getRiskColor(overallRisk)} ${overallRisk < 20 ? "text-glow" : ""}`}>
            {overallRisk.toFixed(1)}%
          </span>
        </div>
        <div className="h-2 bg-muted rounded overflow-hidden">
          <div 
            className={`h-full transition-all duration-300 ${
              overallRisk < 20 ? "bg-samaritan-success" :
              overallRisk < 50 ? "bg-samaritan-warning" :
              "bg-primary"
            }`}
            style={{ width: `${overallRisk}%` }}
          />
        </div>
        <div className="flex justify-between mt-1 text-[9px] text-muted-foreground">
          <span>SAFE</span>
          <span>MODERATE</span>
          <span>CRITICAL</span>
        </div>
      </div>

      {/* Warning Banner */}
      <div className="bg-samaritan-warning/10 border border-samaritan-warning/30 rounded p-2 mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-samaritan-warning" />
          <span className="text-[10px] text-samaritan-warning font-display tracking-wider">
            "THE WOUNDED CAN FIGHT BACK" - ALL SCENARIOS EVALUATED
          </span>
        </div>
      </div>

      {/* Threat Scenarios */}
      <div className="space-y-2">
        {activeScenarios.map((scenario) => (
          <div 
            key={scenario.id}
            className={`
              bg-background/30 rounded p-2 border transition-all duration-200
              ${scenario.status === "ANALYZING" ? "border-samaritan-warning" : "border-transparent"}
            `}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded bg-muted flex items-center justify-center text-muted-foreground">
                  {scenario.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-display text-foreground">{scenario.name}</span>
                    {scenario.status === "DEFENDED" && (
                      <CheckCircle className="w-3 h-3 text-samaritan-success" />
                    )}
                  </div>
                  <div className="text-[9px] text-muted-foreground">{scenario.description}</div>
                </div>
              </div>
              <span className={`text-[9px] font-mono ${getStatusColor(scenario.status)}`}>
                {scenario.status}
              </span>
            </div>

            {/* Defense Details */}
            <div className="mt-2 pl-8 space-y-1">
              <div className="flex items-start gap-1">
                <span className="text-[9px] text-samaritan-cyan">DEFENSE:</span>
                <span className="text-[9px] text-samaritan-text">{scenario.defense}</span>
              </div>
              <div className="flex items-start gap-1">
                <span className="text-[9px] text-samaritan-success">RESULT:</span>
                <span className="text-[9px] text-samaritan-text">{scenario.result}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-4 pt-3 border-t border-border">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground">DEFENSE COVERAGE</span>
          <span className="text-[10px] text-samaritan-success font-mono">5/5 SCENARIOS PROTECTED</span>
        </div>
        <div className="text-[9px] text-samaritan-cyan mt-1">
          Zero-knowledge architecture • 60s kill timer • Complete isolation
        </div>
      </div>
    </div>
  );
};

export default RiskAssessment;
