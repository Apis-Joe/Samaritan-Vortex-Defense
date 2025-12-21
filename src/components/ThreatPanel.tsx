import { Shield, AlertTriangle, Zap, Globe, Server, Lock } from "lucide-react";

interface Threat {
  id: string;
  type: string;
  source: string;
  severity: "low" | "medium" | "high" | "critical";
  status: "detected" | "processing" | "redirected" | "neutralized";
  timestamp: Date;
}

interface ThreatPanelProps {
  threats: Threat[];
  activeThreat: Threat | null;
}

const ThreatPanel = ({ threats, activeThreat }: ThreatPanelProps) => {
  const getSeverityColor = (severity: Threat["severity"]) => {
    switch (severity) {
      case "critical":
        return "text-primary";
      case "high":
        return "text-samaritan-warning";
      case "medium":
        return "text-yellow-500";
      case "low":
        return "text-samaritan-text";
    }
  };

  const getStatusIcon = (status: Threat["status"]) => {
    switch (status) {
      case "detected":
        return <AlertTriangle className="w-4 h-4" />;
      case "processing":
        return <Zap className="w-4 h-4 animate-pulse" />;
      case "redirected":
        return <Globe className="w-4 h-4" />;
      case "neutralized":
        return <Shield className="w-4 h-4" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "DDoS":
        return <Server className="w-4 h-4" />;
      case "Phishing":
        return <Lock className="w-4 h-4" />;
      case "Malware":
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Shield className="w-4 h-4" />;
    }
  };

  return (
    <div className="w-80 bg-samaritan-panel border border-samaritan-border rounded-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-secondary border-b border-samaritan-border">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" />
          <span className="font-display text-xs tracking-widest text-samaritan-highlight">THREAT MONITOR</span>
        </div>
      </div>

      {/* Active Threat */}
      {activeThreat && (
        <div className="p-4 border-b border-samaritan-border bg-primary/5">
          <div className="text-xs text-primary font-display tracking-wider mb-2">ACTIVE THREAT</div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-primary/20 flex items-center justify-center text-primary animate-pulse">
              {getTypeIcon(activeThreat.type)}
            </div>
            <div className="flex-1">
              <div className="text-sm text-samaritan-highlight font-medium">{activeThreat.type}</div>
              <div className="text-xs text-samaritan-text font-mono">{activeThreat.source}</div>
            </div>
            <div className={`text-xs font-display ${getSeverityColor(activeThreat.severity)}`}>
              {activeThreat.severity.toUpperCase()}
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-primary">
            <Zap className="w-3 h-3 animate-spin" />
            <span className="animate-pulse">VORTEX PROCESSING...</span>
          </div>
        </div>
      )}

      {/* Threat List */}
      <div className="max-h-[400px] overflow-y-auto">
        {threats.length === 0 ? (
          <div className="p-4 text-center text-samaritan-text text-xs">
            No threats detected
          </div>
        ) : (
          threats.map((threat) => (
            <div
              key={threat.id}
              className={`px-4 py-3 border-b border-samaritan-border/50 hover:bg-secondary/50 transition-colors ${
                threat.status === "processing" ? "animate-slide-in-right" : ""
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className={getSeverityColor(threat.severity)}>
                    {getTypeIcon(threat.type)}
                  </span>
                  <span className="text-xs text-samaritan-highlight">{threat.type}</span>
                </div>
                <div className={`flex items-center gap-1 text-xs ${
                  threat.status === "neutralized" ? "text-samaritan-success" :
                  threat.status === "redirected" ? "text-samaritan-cyan" :
                  "text-samaritan-text"
                }`}>
                  {getStatusIcon(threat.status)}
                  <span className="uppercase">{threat.status}</span>
                </div>
              </div>
              <div className="text-xs text-samaritan-text font-mono truncate">{threat.source}</div>
              <div className="text-xs text-muted-foreground mt-1">
                {threat.timestamp.toLocaleTimeString()}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Stats */}
      <div className="p-4 bg-secondary border-t border-samaritan-border">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-xl font-display text-samaritan-success">{threats.filter(t => t.status === "neutralized").length}</div>
            <div className="text-xs text-samaritan-text">NEUTRALIZED</div>
          </div>
          <div>
            <div className="text-xl font-display text-samaritan-cyan">{threats.filter(t => t.status === "redirected").length}</div>
            <div className="text-xs text-samaritan-text">REDIRECTED</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThreatPanel;
