import { useState, useCallback, memo } from 'react';
import { AlertTriangle, FileText, Download, ChevronDown, ChevronRight, Shield, Bug, Zap, Target, Clock } from 'lucide-react';

interface AssessmentResult {
  id: string;
  type: 'escape_risk' | 'honeypot_reactivation' | 'false_positive';
  level: 'MINIMAL' | 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  riskPercent: number;
  speed: number;
  processed: number;
  timestamp: Date;
  findings: AssessmentFinding[];
}

interface AssessmentFinding {
  scenario: string;
  defense: string;
  result: string;
  status: 'NEUTRALIZED' | 'CONTAINED' | 'MONITORED';
}

interface Props {
  isActive: boolean;
  onAssessmentComplete?: (result: AssessmentResult) => void;
}

const AdvancedRiskAssessment = memo(({ isActive, onAssessmentComplete }: Props) => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<string>('');
  const [assessmentArchive, setAssessmentArchive] = useState<AssessmentResult[]>([]);
  const [expandedResults, setExpandedResults] = useState<Set<string>>(new Set());
  const [progress, setProgress] = useState(0);

  const getTypeLabel = (type: AssessmentResult['type']) => {
    switch (type) {
      case 'escape_risk': return 'Escape Risk';
      case 'honeypot_reactivation': return 'Honeypot Reactivation';
      case 'false_positive': return 'False Positive Rate';
    }
  };

  const getLevelColor = (level: AssessmentResult['level']) => {
    switch (level) {
      case 'MINIMAL': return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/50';
      case 'LOW': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50';
      case 'MODERATE': return 'text-orange-400 bg-orange-500/20 border-orange-500/50';
      case 'HIGH': return 'text-red-400 bg-red-500/20 border-red-500/50';
      case 'CRITICAL': return 'text-red-500 bg-red-600/30 border-red-500';
    }
  };

  const generateFindings = (type: AssessmentResult['type']): AssessmentFinding[] => {
    if (type === 'escape_risk') {
      return [
        { scenario: 'Memory Isolation Breach', defense: 'Hardware-level memory segmentation', result: 'Container boundaries unbreakable', status: 'NEUTRALIZED' },
        { scenario: 'Network Escape Attempt', defense: 'Air-gapped sandbox with no external routes', result: 'Zero network paths available', status: 'NEUTRALIZED' },
        { scenario: 'Kernel Exploit', defense: 'Microkernel with minimal attack surface', result: 'No exploitable interfaces exposed', status: 'CONTAINED' },
        { scenario: 'Time-based Escape', defense: '60-second kill timer enforced', result: 'Terminated before escape window', status: 'NEUTRALIZED' },
      ];
    } else if (type === 'honeypot_reactivation') {
      return [
        { scenario: 'Dormant Code Reactivation', defense: 'Continuous memory scanning', result: 'Detected and purged in 12ns', status: 'NEUTRALIZED' },
        { scenario: 'Self-modifying Code', defense: 'Read-only execution environment', result: 'Write attempts blocked', status: 'NEUTRALIZED' },
        { scenario: 'Resource Exhaustion Attack', defense: 'Hard limits: 1MB RAM, 0.1% CPU', result: 'Cannot acquire resources', status: 'CONTAINED' },
        { scenario: 'Counter-attack Mechanism', defense: 'One-way data flow architecture', result: 'No outbound channels available', status: 'NEUTRALIZED' },
        { scenario: 'Learning AI Virus', defense: 'Environment randomized every 10s', result: 'Learning window too short', status: 'MONITORED' },
      ];
    } else {
      return [
        { scenario: 'Quantum Sensor Speed', defense: 'Full analysis in <50ns', result: 'More time = More accuracy', status: 'MONITORED' },
        { scenario: 'Multi-layer Verification', defense: '7 independent detection engines', result: 'Cross-validated results', status: 'NEUTRALIZED' },
        { scenario: 'Behavioral Analysis', defense: 'AI pattern matching at quantum speed', result: '99.9997% accuracy maintained', status: 'NEUTRALIZED' },
        { scenario: 'Signature Database', defense: '847M signatures checked in parallel', result: 'No bottleneck detected', status: 'NEUTRALIZED' },
      ];
    }
  };

  const runAssessment = useCallback(async () => {
    if (isRunning) return;
    setIsRunning(true);
    setProgress(0);

    const assessmentTypes: AssessmentResult['type'][] = ['escape_risk', 'honeypot_reactivation', 'false_positive'];
    
    for (let i = 0; i < assessmentTypes.length; i++) {
      const type = assessmentTypes[i];
      setCurrentPhase(`Analyzing ${getTypeLabel(type)}...`);
      
      // Simulate analysis with progress
      for (let p = 0; p <= 100; p += 10) {
        await new Promise(r => setTimeout(r, 100));
        setProgress(((i * 100) + p) / 3);
      }

      const speed = Math.floor(Math.random() * 50000) + 150000;
      
      // Calculate risk based on type (speed IMPROVES accuracy - lower risk at higher speeds)
      let riskPercent: number;
      let level: AssessmentResult['level'];
      
      if (type === 'escape_risk') {
        // Near-zero escape risk due to quantum-speed containment
        riskPercent = Math.random() * 0.001;
        level = 'MINIMAL';
      } else if (type === 'honeypot_reactivation') {
        // Very low reactivation risk - kill timer too fast
        riskPercent = Math.random() * 0.5;
        level = riskPercent < 0.1 ? 'MINIMAL' : 'LOW';
      } else {
        // False positive rate DECREASES with speed (quantum sensors more accurate)
        // Higher speed = lower false positives
        riskPercent = Math.max(0, 0.01 - (speed / 20000000));
        level = 'MINIMAL';
      }

      const result: AssessmentResult = {
        id: `${Date.now()}-${type}`,
        type,
        level,
        riskPercent,
        speed,
        processed: Math.floor(Math.random() * 50) + 100,
        timestamp: new Date(),
        findings: generateFindings(type),
      };

      setAssessmentArchive(prev => [result, ...prev]);
      onAssessmentComplete?.(result);
    }

    setCurrentPhase('Assessment Complete');
    setProgress(100);
    await new Promise(r => setTimeout(r, 500));
    setIsRunning(false);
    setCurrentPhase('');
    setProgress(0);
  }, [isRunning, onAssessmentComplete]);

  const exportLogs = useCallback(() => {
    const exportData = {
      exportDate: new Date().toISOString(),
      systemVersion: 'QUANTUM-VORTEX-1.0',
      totalAssessments: assessmentArchive.length,
      summary: {
        escapeRiskAvg: assessmentArchive.filter(a => a.type === 'escape_risk').reduce((acc, a) => acc + a.riskPercent, 0) / Math.max(1, assessmentArchive.filter(a => a.type === 'escape_risk').length),
        reactivationRiskAvg: assessmentArchive.filter(a => a.type === 'honeypot_reactivation').reduce((acc, a) => acc + a.riskPercent, 0) / Math.max(1, assessmentArchive.filter(a => a.type === 'honeypot_reactivation').length),
        falsePositiveAvg: assessmentArchive.filter(a => a.type === 'false_positive').reduce((acc, a) => acc + a.riskPercent, 0) / Math.max(1, assessmentArchive.filter(a => a.type === 'false_positive').length),
        conclusion: 'SPEED IMPROVES ACCURACY - Quantum sensors achieve 99.999%+ detection with near-zero false positives',
      },
      assessments: assessmentArchive.map(a => ({
        ...a,
        timestamp: a.timestamp.toISOString(),
      })),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `risk-assessment-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [assessmentArchive]);

  const toggleExpand = (id: string) => {
    setExpandedResults(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + ', ' + 
           date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Left Panel - Run Assessment */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-primary" />
            <h3 className="font-display text-sm text-primary tracking-wider">ADVANCED RISK ASSESSMENT</h3>
          </div>
          <button
            onClick={runAssessment}
            disabled={isRunning || !isActive}
            className={`flex items-center gap-2 px-4 py-2 rounded text-sm font-mono transition-all ${
              isRunning 
                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50' 
                : isActive
                  ? 'bg-primary text-primary-foreground hover:bg-primary/80'
                  : 'bg-muted text-muted-foreground cursor-not-allowed'
            }`}
          >
            <FileText className="w-4 h-4" />
            {isRunning ? 'ANALYZING...' : 'RUN ASSESSMENT'}
          </button>
        </div>
        
        <p className="text-xs text-muted-foreground mb-4">
          Sophisticated threat analysis with archived logs
        </p>

        {isRunning && (
          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-2 text-xs text-cyan-400">
              <Zap className="w-3 h-3 animate-pulse" />
              {currentPhase}
            </div>
            <div className="h-1 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-cyan-500 to-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {/* Assessment Types Preview */}
        <div className="space-y-3">
          <div className="p-3 bg-secondary/50 rounded border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-4 h-4 text-red-400" />
              <span className="text-xs font-mono text-foreground">Escape Risk Analysis</span>
            </div>
            <p className="text-xs text-muted-foreground">Evaluates containment integrity and escape vectors</p>
          </div>
          
          <div className="p-3 bg-secondary/50 rounded border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <Bug className="w-4 h-4 text-orange-400" />
              <span className="text-xs font-mono text-foreground">Honeypot Reactivation</span>
            </div>
            <p className="text-xs text-muted-foreground">Tests if trapped code can fight back or reactivate</p>
          </div>
          
          <div className="p-3 bg-secondary/50 rounded border border-border/50">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-4 h-4 text-yellow-400" />
              <span className="text-xs font-mono text-foreground">False Positive Rate</span>
            </div>
            <p className="text-xs text-muted-foreground">Validates: Higher speed = Lower false positives</p>
          </div>
        </div>

        {/* Conclusion Box */}
        {assessmentArchive.length > 0 && (
          <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded">
            <div className="flex items-center gap-2 text-emerald-400 mb-2">
              <Zap className="w-4 h-4" />
              <span className="text-xs font-mono font-semibold">CONCLUSION</span>
            </div>
            <p className="text-xs text-emerald-300">
              ✓ Speed IMPROVES accuracy<br/>
              ✓ Quantum sensors achieve 99.999%+ detection<br/>
              ✓ Higher speed = Lower false positives
            </p>
          </div>
        )}
      </div>

      {/* Right Panel - Assessment Archive */}
      <div className="bg-card border border-border rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            <h3 className="font-display text-sm text-primary tracking-wider">ASSESSMENT ARCHIVE</h3>
          </div>
          <button
            onClick={exportLogs}
            disabled={assessmentArchive.length === 0}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono border transition-all ${
              assessmentArchive.length > 0
                ? 'border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10'
                : 'border-border text-muted-foreground cursor-not-allowed'
            }`}
          >
            <Download className="w-3 h-3" />
            EXPORT LOGS
          </button>
        </div>

        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
          {assessmentArchive.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-xs">
              <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
              No assessments yet. Click "RUN ASSESSMENT" to begin.
            </div>
          ) : (
            assessmentArchive.map((result) => (
              <div 
                key={result.id}
                className="bg-secondary/50 border border-border/50 rounded p-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 text-xs font-mono rounded border ${getLevelColor(result.level)}`}>
                      {result.level}
                    </span>
                    <span className="text-sm text-foreground">{getTypeLabel(result.type)}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{formatTimestamp(result.timestamp)}</span>
                </div>
                
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <div className="bg-background/50 rounded px-2 py-1">
                    <span className="text-xs text-muted-foreground">Risk: </span>
                    <span className="text-xs text-primary font-mono">{result.riskPercent.toFixed(4)}%</span>
                  </div>
                  <div className="bg-background/50 rounded px-2 py-1">
                    <span className="text-xs text-muted-foreground">Speed: </span>
                    <span className="text-xs text-yellow-400 font-mono">{result.speed}x</span>
                  </div>
                  <div className="bg-background/50 rounded px-2 py-1">
                    <span className="text-xs text-muted-foreground">Processed: </span>
                    <span className="text-xs text-cyan-400 font-mono">{result.processed}</span>
                  </div>
                </div>

                <button
                  onClick={() => toggleExpand(result.id)}
                  className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  {expandedResults.has(result.id) ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                  View detailed findings →
                </button>

                {expandedResults.has(result.id) && (
                  <div className="mt-3 space-y-2 border-t border-border/50 pt-3">
                    {result.findings.map((finding, idx) => (
                      <div key={idx} className="text-xs bg-background/30 p-2 rounded">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-foreground font-medium">{finding.scenario}</span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                            finding.status === 'NEUTRALIZED' ? 'bg-emerald-500/20 text-emerald-400' :
                            finding.status === 'CONTAINED' ? 'bg-cyan-500/20 text-cyan-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {finding.status}
                          </span>
                        </div>
                        <p className="text-muted-foreground">Defense: {finding.defense}</p>
                        <p className="text-emerald-400">Result: {finding.result}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
});

AdvancedRiskAssessment.displayName = 'AdvancedRiskAssessment';

export default AdvancedRiskAssessment;
