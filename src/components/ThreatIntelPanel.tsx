import { useState } from "react";
import { Shield, Zap, Search, Globe, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useThreatIntelligence, ThreatIntelligence } from "@/hooks/useThreatIntelligence";

interface ThreatIntelPanelProps {
  onThreatDetected?: (threat: ThreatIntelligence) => void;
}

const ThreatIntelPanel = ({ onThreatDetected }: ThreatIntelPanelProps) => {
  const [ipInput, setIpInput] = useState("");
  const { checkIP, checkVisitorThreat, isChecking, lastCheck, error } = useThreatIntelligence();

  const handleCheckIP = async () => {
    if (!ipInput.trim()) return;
    const result = await checkIP(ipInput.trim());
    if (result && onThreatDetected && result.threatLevel !== 'safe') {
      onThreatDetected(result);
    }
  };

  const handleCheckVisitor = async () => {
    const result = await checkVisitorThreat();
    if (result && onThreatDetected && result.threatLevel !== 'safe') {
      onThreatDetected(result);
    }
  };

  const getThreatColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-primary';
      case 'high': return 'text-samaritan-warning';
      case 'medium': return 'text-yellow-500';
      case 'low': return 'text-samaritan-cyan';
      default: return 'text-samaritan-success';
    }
  };

  const getThreatBg = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-primary/20 border-primary';
      case 'high': return 'bg-samaritan-warning/20 border-samaritan-warning';
      case 'medium': return 'bg-yellow-500/20 border-yellow-500';
      case 'low': return 'bg-samaritan-cyan/20 border-samaritan-cyan';
      default: return 'bg-samaritan-success/20 border-samaritan-success';
    }
  };

  return (
    <div className="bg-samaritan-panel border border-samaritan-border rounded-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-secondary border-b border-samaritan-border">
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-samaritan-cyan" />
          <span className="font-display text-xs tracking-widest text-samaritan-highlight">THREAT INTELLIGENCE</span>
        </div>
      </div>

      {/* IP Check Input */}
      <div className="p-4 space-y-3">
        <div className="flex gap-2">
          <Input
            placeholder="Enter IP address..."
            value={ipInput}
            onChange={(e) => setIpInput(e.target.value)}
            className="bg-background border-samaritan-border text-samaritan-text font-mono text-sm"
            onKeyDown={(e) => e.key === 'Enter' && handleCheckIP()}
          />
          <Button
            onClick={handleCheckIP}
            disabled={isChecking || !ipInput.trim()}
            size="sm"
            className="bg-samaritan-cyan hover:bg-samaritan-cyan/80"
          >
            {isChecking ? <Zap className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          </Button>
        </div>

        <Button
          onClick={handleCheckVisitor}
          disabled={isChecking}
          variant="outline"
          size="sm"
          className="w-full border-samaritan-border text-samaritan-text hover:bg-secondary"
        >
          <Globe className="w-4 h-4 mr-2" />
          {isChecking ? "Checking..." : "Check My IP"}
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <div className="px-4 pb-4">
          <div className="p-2 bg-primary/10 border border-primary/30 rounded text-xs text-primary">
            {error}
          </div>
        </div>
      )}

      {/* Results */}
      {lastCheck && (
        <div className="px-4 pb-4 space-y-3">
          {/* Threat Level Banner */}
          <div className={`p-3 rounded border ${getThreatBg(lastCheck.threatLevel)}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {lastCheck.threatLevel === 'safe' ? (
                  <CheckCircle className={`w-5 h-5 ${getThreatColor(lastCheck.threatLevel)}`} />
                ) : (
                  <AlertTriangle className={`w-5 h-5 ${getThreatColor(lastCheck.threatLevel)}`} />
                )}
                <span className={`font-display text-sm ${getThreatColor(lastCheck.threatLevel)}`}>
                  {lastCheck.threatLevel.toUpperCase()}
                </span>
              </div>
              <div className="text-right">
                <div className={`text-lg font-bold ${getThreatColor(lastCheck.threatLevel)}`}>
                  {lastCheck.riskScore}%
                </div>
                <div className="text-xs text-samaritan-text">Risk Score</div>
              </div>
            </div>
          </div>

          {/* IP Info */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-samaritan-text">IP Address</span>
              <span className="font-mono text-samaritan-highlight">{lastCheck.ip}</span>
            </div>
            
            {lastCheck.geolocation && (
              <>
                <div className="flex justify-between">
                  <span className="text-samaritan-text">Location</span>
                  <span className="text-samaritan-highlight">
                    {lastCheck.geolocation.city}, {lastCheck.geolocation.country}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-samaritan-text">ISP</span>
                  <span className="text-samaritan-highlight truncate max-w-[150px]">
                    {lastCheck.geolocation.isp}
                  </span>
                </div>
              </>
            )}

            {lastCheck.abuseData && (
              <>
                <div className="flex justify-between">
                  <span className="text-samaritan-text">Reports</span>
                  <span className={lastCheck.abuseData.totalReports > 0 ? 'text-samaritan-warning' : 'text-samaritan-success'}>
                    {lastCheck.abuseData.totalReports} abuse reports
                  </span>
                </div>
                {lastCheck.abuseData.isTor && (
                  <div className="flex justify-between">
                    <span className="text-samaritan-text">Tor Exit</span>
                    <span className="text-samaritan-warning">Yes</span>
                  </div>
                )}
                {lastCheck.abuseData.isWhitelisted && (
                  <div className="flex justify-between">
                    <span className="text-samaritan-text">Whitelisted</span>
                    <span className="text-samaritan-success">Yes</span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Timestamp */}
          <div className="text-xs text-muted-foreground text-center pt-2 border-t border-samaritan-border/50">
            Checked: {new Date(lastCheck.checkedAt).toLocaleString()}
          </div>
        </div>
      )}

      {/* Powered By */}
      <div className="px-4 py-2 bg-secondary border-t border-samaritan-border">
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Shield className="w-3 h-3" />
          <span>Powered by AbuseIPDB</span>
        </div>
      </div>
    </div>
  );
};

export default ThreatIntelPanel;
