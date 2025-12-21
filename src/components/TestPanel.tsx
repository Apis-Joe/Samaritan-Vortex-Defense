import { Button } from "@/components/ui/button";
import { Crosshair, Bomb, Mail, Bug, Play, Square } from "lucide-react";

interface TestPanelProps {
  onSimulateThreat: (type: string) => void;
  onToggleSystem: () => void;
  isActive: boolean;
  isProcessing: boolean;
}

const TestPanel = ({ onSimulateThreat, onToggleSystem, isActive, isProcessing }: TestPanelProps) => {
  const threatTypes = [
    { type: "DDoS", label: "DDoS ATTACK", icon: Bomb, description: "Distributed denial of service" },
    { type: "Phishing", label: "PHISHING", icon: Mail, description: "Credential theft attempt" },
    { type: "Malware", label: "MALWARE", icon: Bug, description: "Malicious code injection" },
    { type: "Intrusion", label: "INTRUSION", icon: Crosshair, description: "Unauthorized access attempt" },
  ];

  return (
    <div className="bg-samaritan-panel border border-samaritan-border rounded-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-secondary border-b border-samaritan-border">
        <div className="flex items-center gap-2">
          <Crosshair className="w-4 h-4 text-primary" />
          <span className="font-display text-xs tracking-widest text-samaritan-highlight">SIMULATION CONTROL</span>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Power Toggle */}
        <Button
          onClick={onToggleSystem}
          className={`w-full h-12 font-display tracking-wider ${
            isActive
              ? "bg-primary hover:bg-primary/80 text-primary-foreground"
              : "bg-secondary hover:bg-secondary/80 text-samaritan-text border border-samaritan-border"
          }`}
        >
          {isActive ? (
            <>
              <Square className="w-4 h-4 mr-2" />
              DEACTIVATE VORTEX
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              ACTIVATE VORTEX
            </>
          )}
        </Button>

        {/* Threat Simulation Buttons */}
        <div className="space-y-2">
          <div className="text-xs text-samaritan-text font-display tracking-wider mb-2">SIMULATE THREAT</div>
          <div className="grid grid-cols-2 gap-2">
            {threatTypes.map((threat) => (
              <button
                key={threat.type}
                onClick={() => onSimulateThreat(threat.type)}
                disabled={!isActive || isProcessing}
                className="p-3 bg-secondary border border-samaritan-border rounded hover:border-primary hover:bg-primary/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed group text-left"
              >
                <div className="flex items-center gap-2 mb-1">
                  <threat.icon className="w-4 h-4 text-primary group-hover:text-glow" />
                  <span className="text-xs font-display text-samaritan-highlight">{threat.label}</span>
                </div>
                <div className="text-xs text-samaritan-text truncate">{threat.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="text-xs text-samaritan-text/60 text-center mt-4">
          {isActive ? (
            isProcessing ? "Processing threat through vortex..." : "Click a threat type to simulate an attack"
          ) : (
            "Activate the vortex to begin simulation"
          )}
        </div>
      </div>
    </div>
  );
};

export default TestPanel;
