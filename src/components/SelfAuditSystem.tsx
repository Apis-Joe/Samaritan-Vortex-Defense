import { useState, useEffect, useCallback, memo } from "react";
import { ScanSearch, Shield, Code, Lock, Database, Cpu, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

interface AuditCheck {
  id: string;
  name: string;
  category: string;
  icon: typeof Shield;
  status: "pending" | "scanning" | "passed" | "warning" | "failed";
  details: string;
  lastChecked: Date | null;
}

const auditChecks: Omit<AuditCheck, "status" | "lastChecked">[] = [
  { id: "core-integrity", name: "Core Algorithm Integrity", category: "CORE", icon: Code, details: "Verifying vortex aspiration logic" },
  { id: "crypto-validation", name: "Cryptographic Functions", category: "CRYPTO", icon: Lock, details: "Testing encryption/decryption cycles" },
  { id: "memory-safety", name: "Memory Safety Analysis", category: "MEMORY", icon: Database, details: "Checking for buffer overflows" },
  { id: "injection-test", name: "Injection Prevention", category: "INPUT", icon: Shield, details: "Testing SQL/XSS/Command injection" },
  { id: "auth-bypass", name: "Auth Bypass Detection", category: "AUTH", icon: Lock, details: "Testing authentication boundaries" },
  { id: "race-condition", name: "Race Condition Check", category: "CONCURRENCY", icon: Cpu, details: "Analyzing thread safety" },
  { id: "privilege-escalation", name: "Privilege Escalation", category: "ACCESS", icon: Shield, details: "Testing permission boundaries" },
  { id: "data-leak", name: "Data Leakage Scan", category: "DATA", icon: Database, details: "Scanning for exposed sensitive data" },
];

interface Props {
  isActive: boolean;
  onVulnerabilityFound?: (check: AuditCheck) => void;
}

const SelfAuditSystem = memo(({ isActive, onVulnerabilityFound }: Props) => {
  const [checks, setChecks] = useState<AuditCheck[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [currentCheckIndex, setCurrentCheckIndex] = useState(-1);
  const [stats, setStats] = useState({ passed: 0, warnings: 0, failed: 0 });
  const [lastFullScan, setLastFullScan] = useState<Date | null>(null);

  // Initialize checks
  useEffect(() => {
    const init = auditChecks.map(c => ({
      ...c,
      status: "pending" as const,
      lastChecked: null,
    }));
    setChecks(init);
  }, []);

  // Run audit scan
  const runAudit = useCallback(() => {
    if (isScanning || !isActive) return;

    setChecks(prev => prev.map(c => ({ ...c, status: "pending", lastChecked: null })));
    setCurrentCheckIndex(0);
    setIsScanning(true);
    setStats({ passed: 0, warnings: 0, failed: 0 });
  }, [isScanning, isActive]);

  // Scanning logic
  useEffect(() => {
    if (!isScanning || currentCheckIndex < 0 || currentCheckIndex >= checks.length) {
      if (currentCheckIndex >= checks.length) {
        setIsScanning(false);
        setLastFullScan(new Date());
      }
      return;
    }

    // Set current check to scanning
    setChecks(prev => prev.map((c, i) => 
      i === currentCheckIndex ? { ...c, status: "scanning" } : c
    ));

    // Simulate scan with timeout
    const timeout = setTimeout(() => {
      const result = Math.random();
      let newStatus: AuditCheck["status"];
      
      if (result > 0.15) {
        newStatus = "passed";
        setStats(prev => ({ ...prev, passed: prev.passed + 1 }));
      } else if (result > 0.05) {
        newStatus = "warning";
        setStats(prev => ({ ...prev, warnings: prev.warnings + 1 }));
      } else {
        newStatus = "failed";
        setStats(prev => ({ ...prev, failed: prev.failed + 1 }));
        const failedCheck = checks[currentCheckIndex];
        if (failedCheck) onVulnerabilityFound?.(failedCheck as AuditCheck);
      }

      setChecks(prev => prev.map((c, i) => 
        i === currentCheckIndex ? { ...c, status: newStatus, lastChecked: new Date() } : c
      ));

      setCurrentCheckIndex(prev => prev + 1);
    }, 600 + Math.random() * 400);

    return () => clearTimeout(timeout);
  }, [isScanning, currentCheckIndex, checks, onVulnerabilityFound]);

  const getStatusIcon = useCallback((status: AuditCheck["status"]) => {
    switch (status) {
      case "passed": return <CheckCircle2 className="w-3 h-3 text-samaritan-success" />;
      case "warning": return <AlertTriangle className="w-3 h-3 text-samaritan-warning" />;
      case "failed": return <XCircle className="w-3 h-3 text-primary" />;
      case "scanning": return <div className="w-3 h-3 border-2 border-samaritan-cyan border-t-transparent rounded-full animate-spin" />;
      default: return <div className="w-3 h-3 rounded-full bg-muted" />;
    }
  }, []);

  const getStatusBg = useCallback((status: AuditCheck["status"]) => {
    switch (status) {
      case "passed": return "bg-samaritan-success/10 border-samaritan-success/30";
      case "warning": return "bg-samaritan-warning/10 border-samaritan-warning/30";
      case "failed": return "bg-primary/10 border-primary/30";
      case "scanning": return "bg-samaritan-cyan/10 border-samaritan-cyan/30";
      default: return "bg-background/50 border-border/50";
    }
  }, []);

  const overallHealth = stats.failed === 0 && stats.warnings === 0 ? 100 : 
    stats.failed > 0 ? Math.max(0, 100 - stats.failed * 30 - stats.warnings * 10) :
    Math.max(60, 100 - stats.warnings * 10);

  return (
    <div className="bg-card/90 backdrop-blur border border-border rounded-sm p-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <ScanSearch className="w-4 h-4 text-samaritan-success" />
          <span className="font-display text-xs text-foreground uppercase tracking-wider">
            Self-Audit System
          </span>
        </div>
        <button
          onClick={runAudit}
          disabled={!isActive || isScanning}
          className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all ${
            isActive && !isScanning
              ? "bg-samaritan-success/20 text-samaritan-success hover:bg-samaritan-success/30 cursor-pointer"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          }`}
        >
          {isScanning ? "SCANNING..." : "RUN AUDIT"}
        </button>
      </div>

      {/* Health Meter */}
      <div className="mb-3 p-2 bg-background/50 rounded border border-border/50">
        <div className="flex justify-between text-[10px] mb-1">
          <span className="text-muted-foreground">SYSTEM HEALTH</span>
          <span className={`font-mono ${
            overallHealth > 80 ? "text-samaritan-success" : 
            overallHealth > 50 ? "text-samaritan-warning" : "text-primary"
          }`}>
            {overallHealth}%
          </span>
        </div>
        <div className="h-2 bg-muted rounded overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${
              overallHealth > 80 ? "bg-samaritan-success" : 
              overallHealth > 50 ? "bg-samaritan-warning" : "bg-primary"
            }`}
            style={{ width: `${overallHealth}%` }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-1 mb-3">
        <div className="p-1.5 bg-samaritan-success/10 rounded text-center">
          <div className="text-xs font-mono text-samaritan-success">{stats.passed}</div>
          <div className="text-[8px] text-muted-foreground">PASSED</div>
        </div>
        <div className="p-1.5 bg-samaritan-warning/10 rounded text-center">
          <div className="text-xs font-mono text-samaritan-warning">{stats.warnings}</div>
          <div className="text-[8px] text-muted-foreground">WARNINGS</div>
        </div>
        <div className="p-1.5 bg-primary/10 rounded text-center">
          <div className="text-xs font-mono text-primary">{stats.failed}</div>
          <div className="text-[8px] text-muted-foreground">FAILED</div>
        </div>
      </div>

      {/* Checks List */}
      <div className="space-y-1 max-h-40 overflow-y-auto">
        {checks.map((check) => (
          <div 
            key={check.id}
            className={`flex items-center gap-2 p-1.5 rounded border transition-all duration-300 ${getStatusBg(check.status)}`}
          >
            <check.icon className="w-3 h-3 text-muted-foreground flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] font-medium text-foreground truncate">{check.name}</span>
                <span className="text-[8px] text-muted-foreground">{check.category}</span>
              </div>
              <div className="text-[8px] text-muted-foreground truncate">{check.details}</div>
            </div>
            {getStatusIcon(check.status)}
          </div>
        ))}
      </div>

      {/* Last Scan */}
      <div className="mt-2 pt-2 border-t border-border/50 flex justify-between text-[9px]">
        <span className="text-muted-foreground">LAST FULL SCAN</span>
        <span className="text-samaritan-success font-mono">
          {lastFullScan ? lastFullScan.toLocaleTimeString() : "NEVER"}
        </span>
      </div>
    </div>
  );
});

SelfAuditSystem.displayName = "SelfAuditSystem";

export default SelfAuditSystem;
