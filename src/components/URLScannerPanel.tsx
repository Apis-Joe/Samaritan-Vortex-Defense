import { useState } from "react";
import { Link, Zap, Shield, AlertTriangle, CheckCircle, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useURLScanner, URLScanResult } from "@/hooks/useURLScanner";

interface URLScannerPanelProps {
  onThreatDetected?: (result: URLScanResult) => void;
}

const URLScannerPanel = ({ onThreatDetected }: URLScannerPanelProps) => {
  const [urlInput, setUrlInput] = useState("");
  const { scanURL, isScanning, lastScan, error } = useURLScanner();

  const handleScan = async () => {
    if (!urlInput.trim()) return;
    const result = await scanURL(urlInput.trim());
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
          <Link className="w-4 h-4 text-samaritan-warning" />
          <span className="font-display text-xs tracking-widest text-samaritan-highlight">URL SCANNER</span>
        </div>
      </div>

      {/* URL Input */}
      <div className="p-4 space-y-3">
        <div className="flex gap-2">
          <Input
            placeholder="Enter URL to scan..."
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="bg-background border-samaritan-border text-samaritan-text font-mono text-sm"
            onKeyDown={(e) => e.key === 'Enter' && handleScan()}
          />
          <Button
            onClick={handleScan}
            disabled={isScanning || !urlInput.trim()}
            size="sm"
            className="bg-samaritan-warning hover:bg-samaritan-warning/80"
          >
            {isScanning ? <Zap className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground">
          Scans URLs against 70+ security engines via VirusTotal
        </p>
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
      {lastScan && (
        <div className="px-4 pb-4 space-y-3">
          {/* Threat Level Banner */}
          <div className={`p-3 rounded border ${getThreatBg(lastScan.threatLevel)}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {lastScan.threatLevel === 'safe' ? (
                  <CheckCircle className={`w-5 h-5 ${getThreatColor(lastScan.threatLevel)}`} />
                ) : (
                  <AlertTriangle className={`w-5 h-5 ${getThreatColor(lastScan.threatLevel)}`} />
                )}
                <span className={`font-display text-sm ${getThreatColor(lastScan.threatLevel)}`}>
                  {lastScan.threatLevel.toUpperCase()}
                </span>
              </div>
              <div className="text-right">
                <div className={`text-lg font-bold ${getThreatColor(lastScan.threatLevel)}`}>
                  {lastScan.stats.malicious}/{lastScan.stats.totalEngines}
                </div>
                <div className="text-xs text-samaritan-text">Flagged</div>
              </div>
            </div>
          </div>

          {/* URL Info */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-samaritan-text">URL</span>
              <span className="font-mono text-samaritan-highlight truncate max-w-[180px]" title={lastScan.url}>
                {lastScan.url}
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-samaritan-text">Malicious</span>
              <span className={lastScan.stats.malicious > 0 ? 'text-primary' : 'text-samaritan-success'}>
                {lastScan.stats.malicious} engines
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-samaritan-text">Suspicious</span>
              <span className={lastScan.stats.suspicious > 0 ? 'text-samaritan-warning' : 'text-samaritan-success'}>
                {lastScan.stats.suspicious} engines
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-samaritan-text">Clean</span>
              <span className="text-samaritan-success">
                {lastScan.stats.harmless} engines
              </span>
            </div>
          </div>

          {/* Flagged Engines */}
          {lastScan.flaggedEngines.length > 0 && (
            <div className="space-y-2">
              <div className="text-xs text-samaritan-text font-display">FLAGGED BY:</div>
              <div className="space-y-1 max-h-24 overflow-y-auto">
                {lastScan.flaggedEngines.map((engine, idx) => (
                  <div key={idx} className="flex justify-between text-xs">
                    <span className="text-samaritan-highlight">{engine.engine}</span>
                    <span className={engine.category === 'malicious' ? 'text-primary' : 'text-samaritan-warning'}>
                      {engine.result || engine.category}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timestamp */}
          <div className="text-xs text-muted-foreground text-center pt-2 border-t border-samaritan-border/50">
            Scanned: {new Date(lastScan.checkedAt).toLocaleString()}
          </div>
        </div>
      )}

      {/* Powered By */}
      <div className="px-4 py-2 bg-secondary border-t border-samaritan-border">
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Shield className="w-3 h-3" />
          <span>Powered by VirusTotal</span>
        </div>
      </div>
    </div>
  );
};

export default URLScannerPanel;
