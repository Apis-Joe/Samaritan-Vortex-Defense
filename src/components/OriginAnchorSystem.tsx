import { useState, useEffect, useCallback, memo } from "react";
import { Anchor, Shield, RefreshCw, CheckCircle2, AlertTriangle, Lock, FileCode, Database } from "lucide-react";

interface CoreModule {
  id: string;
  name: string;
  hash: string;
  verified: boolean;
  lastVerified: Date | null;
  size: string;
}

const generateHash = () => {
  const chars = "abcdef0123456789";
  return Array.from({ length: 64 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
};

const coreModules: Omit<CoreModule, "hash" | "verified" | "lastVerified">[] = [
  { id: "vortex-core", name: "Vortex Aspiration Core", size: "24.3 KB" },
  { id: "redirect-engine", name: "Redirect Engine", size: "18.7 KB" },
  { id: "quantum-defense", name: "Quantum Defense Module", size: "31.2 KB" },
  { id: "threat-analyzer", name: "Threat Analyzer", size: "22.1 KB" },
  { id: "crypto-layer", name: "Cryptographic Layer", size: "15.8 KB" },
  { id: "sandbox-env", name: "Sandbox Environment", size: "28.4 KB" },
];

interface Props {
  isActive: boolean;
  onRestoreTriggered?: () => void;
  onIntegrityBreach?: (module: CoreModule) => void;
}

const OriginAnchorSystem = memo(({ isActive, onRestoreTriggered, onIntegrityBreach }: Props) => {
  const [modules, setModules] = useState<CoreModule[]>([]);
  const [anchorStatus, setAnchorStatus] = useState<"locked" | "verifying" | "compromised">("locked");
  const [lastBackup, setLastBackup] = useState<Date>(new Date());
  const [integrityScore, setIntegrityScore] = useState(100);
  const [isRestoring, setIsRestoring] = useState(false);
  const [originHash, setOriginHash] = useState(generateHash());

  // Initialize modules with hashes
  useEffect(() => {
    const init = coreModules.map(m => ({
      ...m,
      hash: generateHash(),
      verified: true,
      lastVerified: new Date(),
    }));
    setModules(init);
  }, []);

  // Periodic integrity verification
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setAnchorStatus("verifying");
      
      setTimeout(() => {
        // Simulate occasional integrity breach (rare)
        if (Math.random() > 0.98) {
          const breachIndex = Math.floor(Math.random() * modules.length);
          setModules(prev => prev.map((m, i) => 
            i === breachIndex ? { ...m, verified: false, hash: generateHash() } : m
          ));
          setAnchorStatus("compromised");
          setIntegrityScore(prev => Math.max(0, prev - 15));
          const breachedModule = modules[breachIndex];
          if (breachedModule) onIntegrityBreach?.(breachedModule as CoreModule);
        } else {
          setModules(prev => prev.map(m => ({ ...m, verified: true, lastVerified: new Date() })));
          setAnchorStatus("locked");
          setIntegrityScore(100);
        }
      }, 1500);
    }, 15000);

    return () => clearInterval(interval);
  }, [isActive, modules, onIntegrityBreach]);

  // Restore to origin
  const restoreToOrigin = useCallback(() => {
    if (isRestoring || !isActive) return;

    setIsRestoring(true);
    setAnchorStatus("verifying");

    setTimeout(() => {
      setModules(prev => prev.map(m => ({
        ...m,
        hash: generateHash(),
        verified: true,
        lastVerified: new Date(),
      })));
      setOriginHash(generateHash());
      setLastBackup(new Date());
      setIntegrityScore(100);
      setAnchorStatus("locked");
      setIsRestoring(false);
      onRestoreTriggered?.();
    }, 3000);
  }, [isRestoring, isActive, onRestoreTriggered]);

  // Create backup
  const createBackup = useCallback(() => {
    setLastBackup(new Date());
    setOriginHash(generateHash());
  }, []);

  const getStatusColor = () => {
    switch (anchorStatus) {
      case "locked": return "text-samaritan-success";
      case "verifying": return "text-samaritan-warning animate-pulse";
      case "compromised": return "text-primary animate-pulse";
    }
  };

  const getStatusBg = () => {
    switch (anchorStatus) {
      case "locked": return "bg-samaritan-success/20";
      case "verifying": return "bg-samaritan-warning/20";
      case "compromised": return "bg-primary/20";
    }
  };

  return (
    <div className="bg-card/90 backdrop-blur border border-border rounded-sm p-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Anchor className="w-4 h-4 text-samaritan-cyan" />
          <span className="font-display text-xs text-foreground uppercase tracking-wider">
            Origin Anchor
          </span>
        </div>
        <div className={`px-2 py-0.5 rounded text-[10px] font-mono ${getStatusBg()} ${getStatusColor()}`}>
          {anchorStatus === "locked" ? "🔒 LOCKED" : anchorStatus === "verifying" ? "⏳ VERIFYING" : "⚠️ BREACH"}
        </div>
      </div>

      {/* Sauvegarde d'origine */}
      <div className="mb-3 p-2 bg-gradient-to-r from-samaritan-cyan/10 to-primary/10 rounded border border-samaritan-cyan/30">
        <div className="flex items-center gap-2 mb-1">
          <Lock className="w-3 h-3 text-samaritan-cyan" />
          <span className="text-[10px] text-samaritan-cyan font-medium">SAUVEGARDE D'ORIGINE</span>
        </div>
        <div className="text-[8px] text-muted-foreground font-mono break-all">
          SHA256: {originHash.slice(0, 32)}...
        </div>
        <div className="text-[8px] text-muted-foreground mt-1">
          Created: {lastBackup.toLocaleString()}
        </div>
      </div>

      {/* Integrity Score */}
      <div className="mb-3 p-2 bg-background/50 rounded border border-border/50">
        <div className="flex justify-between text-[10px] mb-1">
          <span className="text-muted-foreground">CODE INTEGRITY</span>
          <span className={`font-mono ${
            integrityScore === 100 ? "text-samaritan-success" : 
            integrityScore > 70 ? "text-samaritan-warning" : "text-primary"
          }`}>
            {integrityScore}%
          </span>
        </div>
        <div className="h-2 bg-muted rounded overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${
              integrityScore === 100 ? "bg-samaritan-success" : 
              integrityScore > 70 ? "bg-samaritan-warning" : "bg-primary"
            }`}
            style={{ width: `${integrityScore}%` }}
          />
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <button
          onClick={createBackup}
          disabled={!isActive || isRestoring}
          className={`flex items-center justify-center gap-1 p-1.5 rounded text-[10px] font-mono transition-all ${
            isActive && !isRestoring
              ? "bg-samaritan-cyan/20 text-samaritan-cyan hover:bg-samaritan-cyan/30"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          }`}
        >
          <Database className="w-3 h-3" />
          BACKUP
        </button>
        <button
          onClick={restoreToOrigin}
          disabled={!isActive || isRestoring}
          className={`flex items-center justify-center gap-1 p-1.5 rounded text-[10px] font-mono transition-all ${
            isActive && !isRestoring
              ? "bg-primary/20 text-primary hover:bg-primary/30"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          }`}
        >
          <RefreshCw className={`w-3 h-3 ${isRestoring ? "animate-spin" : ""}`} />
          {isRestoring ? "RESTORING..." : "RESTORE"}
        </button>
      </div>

      {/* Core Modules */}
      <div className="space-y-1 max-h-36 overflow-y-auto">
        {modules.map((module) => (
          <div 
            key={module.id}
            className={`flex items-center gap-2 p-1.5 rounded transition-all ${
              module.verified 
                ? "bg-samaritan-success/5 border border-samaritan-success/20" 
                : "bg-primary/10 border border-primary/30 animate-pulse"
            }`}
          >
            <FileCode className={`w-3 h-3 ${module.verified ? "text-samaritan-success" : "text-primary"}`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-foreground truncate">{module.name}</span>
                <span className="text-[8px] text-muted-foreground">{module.size}</span>
              </div>
              <div className="text-[7px] text-muted-foreground font-mono truncate">
                {module.hash.slice(0, 24)}...
              </div>
            </div>
            {module.verified ? (
              <CheckCircle2 className="w-3 h-3 text-samaritan-success flex-shrink-0" />
            ) : (
              <AlertTriangle className="w-3 h-3 text-primary flex-shrink-0" />
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-2 pt-2 border-t border-border/50 flex justify-between text-[9px]">
        <span className="text-muted-foreground">ANCHOR STATUS</span>
        <span className={`font-mono ${getStatusColor()}`}>
          {anchorStatus.toUpperCase()}
        </span>
      </div>
    </div>
  );
});

OriginAnchorSystem.displayName = "OriginAnchorSystem";

export default OriginAnchorSystem;
