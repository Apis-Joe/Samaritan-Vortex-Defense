import { useState, useEffect, useCallback, memo } from "react";
import { Brain, Eye, Search, Lightbulb, Globe, FlaskConical, TrendingUp, CheckCircle2 } from "lucide-react";

interface LearningPhase {
  id: string;
  name: string;
  icon: typeof Brain;
  description: string;
  progress: number;
  patternsLearned: number;
  confidence: number;
  status: "idle" | "learning" | "complete";
}

const initialPhases: Omit<LearningPhase, "progress" | "patternsLearned" | "confidence" | "status">[] = [
  { id: "behavioral", name: "Behavioral Analysis", icon: Eye, description: "Monitoring execution patterns & API calls" },
  { id: "anomaly", name: "Anomaly Detection", icon: Search, description: "Detecting statistical deviations from baseline" },
  { id: "heuristic", name: "Heuristic Learning", icon: Lightbulb, description: "Building rule-based threat signatures" },
  { id: "intelligence", name: "Threat Intelligence", icon: Globe, description: "Correlating with global threat feeds" },
  { id: "sandbox", name: "Sandbox Testing", icon: FlaskConical, description: "Safe execution in isolated environment" },
];

interface Props {
  isActive: boolean;
  onLearningComplete?: (totalPatterns: number, avgConfidence: number) => void;
}

const ZeroDayTrainingMode = memo(({ isActive, onLearningComplete }: Props) => {
  const [phases, setPhases] = useState<LearningPhase[]>([]);
  const [isTraining, setIsTraining] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);
  const [totalPatternsLearned, setTotalPatternsLearned] = useState(0);
  const [zeroDaysDetected, setZeroDaysDetected] = useState(0);

  // Initialize phases
  useEffect(() => {
    const init = initialPhases.map(p => ({
      ...p,
      progress: 0,
      patternsLearned: 0,
      confidence: 0,
      status: "idle" as const,
    }));
    setPhases(init);
  }, []);

  // Training simulation
  useEffect(() => {
    if (!isActive || !isTraining) return;

    const interval = setInterval(() => {
      setPhases(prev => {
        const updated = [...prev];
        const phase = updated[currentPhase];
        
        if (phase && phase.progress < 100) {
          const increment = Math.random() * 8 + 2;
          phase.progress = Math.min(100, phase.progress + increment);
          phase.patternsLearned = Math.floor(phase.progress * (Math.random() * 5 + 3));
          phase.confidence = Math.min(99.9, phase.progress * 0.95 + Math.random() * 5);
          phase.status = "learning";
          
          if (phase.progress >= 100) {
            phase.status = "complete";
            if (currentPhase < phases.length - 1) {
              setCurrentPhase(c => c + 1);
            } else {
              setIsTraining(false);
              const totalPatterns = updated.reduce((sum, p) => sum + p.patternsLearned, 0);
              const avgConfidence = updated.reduce((sum, p) => sum + p.confidence, 0) / updated.length;
              onLearningComplete?.(totalPatterns, avgConfidence);
            }
          }
        }
        
        return updated;
      });

      // Update overall progress
      setOverallProgress(prev => {
        const avg = phases.reduce((sum, p) => sum + p.progress, 0) / phases.length;
        return avg;
      });

      // Update total patterns
      setTotalPatternsLearned(phases.reduce((sum, p) => sum + p.patternsLearned, 0));

      // Random zero-day detection
      if (Math.random() > 0.95) {
        setZeroDaysDetected(prev => prev + 1);
      }
    }, 200);

    return () => clearInterval(interval);
  }, [isActive, isTraining, currentPhase, phases, onLearningComplete]);

  const startTraining = useCallback(() => {
    setPhases(prev => prev.map(p => ({ ...p, progress: 0, patternsLearned: 0, confidence: 0, status: "idle" as const })));
    setCurrentPhase(0);
    setOverallProgress(0);
    setTotalPatternsLearned(0);
    setIsTraining(true);
  }, []);

  const getPhaseColor = useCallback((status: LearningPhase["status"]) => {
    switch (status) {
      case "idle": return "text-muted-foreground";
      case "learning": return "text-samaritan-warning";
      case "complete": return "text-samaritan-success";
    }
  }, []);

  return (
    <div className="bg-card/90 backdrop-blur border border-border rounded-sm p-3">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-samaritan-warning" />
          <span className="font-display text-xs text-foreground uppercase tracking-wider">
            Zero-Day Training
          </span>
        </div>
        <button
          onClick={startTraining}
          disabled={!isActive || isTraining}
          className={`px-2 py-0.5 rounded text-[10px] font-mono transition-all ${
            isActive && !isTraining
              ? "bg-samaritan-warning/20 text-samaritan-warning hover:bg-samaritan-warning/30 cursor-pointer"
              : "bg-muted text-muted-foreground cursor-not-allowed"
          }`}
        >
          {isTraining ? "TRAINING..." : "START"}
        </button>
      </div>

      {/* Overall Progress */}
      <div className="mb-3 p-2 bg-background/50 rounded border border-border/50">
        <div className="flex justify-between text-[10px] mb-1">
          <span className="text-muted-foreground">OVERALL PROGRESS</span>
          <span className="text-samaritan-warning font-mono">{overallProgress.toFixed(1)}%</span>
        </div>
        <div className="h-2 bg-muted rounded overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-samaritan-warning to-samaritan-success transition-all duration-300"
            style={{ width: `${overallProgress}%` }}
          />
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="p-2 bg-background/50 rounded border border-border/50">
          <div className="text-[9px] text-muted-foreground">PATTERNS LEARNED</div>
          <div className="text-sm font-mono text-samaritan-warning flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            {totalPatternsLearned.toLocaleString()}
          </div>
        </div>
        <div className="p-2 bg-background/50 rounded border border-border/50">
          <div className="text-[9px] text-muted-foreground">ZERO-DAYS DETECTED</div>
          <div className="text-sm font-mono text-primary flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            {zeroDaysDetected}
          </div>
        </div>
      </div>

      {/* Learning Phases */}
      <div className="space-y-2">
        {phases.map((phase, index) => (
          <div 
            key={phase.id}
            className={`p-2 rounded border transition-all duration-300 ${
              phase.status === "learning" 
                ? "bg-samaritan-warning/10 border-samaritan-warning/30" 
                : phase.status === "complete"
                ? "bg-samaritan-success/10 border-samaritan-success/30"
                : "bg-background/50 border-border/50"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <phase.icon className={`w-3 h-3 ${getPhaseColor(phase.status)}`} />
              <span className={`text-[10px] font-medium ${getPhaseColor(phase.status)}`}>
                {phase.name}
              </span>
              {phase.status === "complete" && (
                <CheckCircle2 className="w-3 h-3 text-samaritan-success ml-auto" />
              )}
            </div>
            
            <div className="text-[8px] text-muted-foreground mb-1.5">{phase.description}</div>
            
            <div className="h-1 bg-muted rounded overflow-hidden mb-1">
              <div 
                className={`h-full transition-all duration-200 ${
                  phase.status === "learning" ? "bg-samaritan-warning" :
                  phase.status === "complete" ? "bg-samaritan-success" :
                  "bg-muted-foreground/30"
                }`}
                style={{ width: `${phase.progress}%` }}
              />
            </div>

            <div className="flex justify-between text-[8px] text-muted-foreground">
              <span>{phase.patternsLearned} patterns</span>
              <span>{phase.confidence.toFixed(1)}% confidence</span>
            </div>
          </div>
        ))}
      </div>

      {/* Status */}
      <div className="mt-2 pt-2 border-t border-border/50 flex justify-between text-[9px]">
        <span className="text-muted-foreground">AI ENGINE STATUS</span>
        <span className={`font-mono ${isTraining ? "text-samaritan-warning animate-pulse" : "text-samaritan-success"}`}>
          {isTraining ? "LEARNING..." : "READY"}
        </span>
      </div>
    </div>
  );
});

ZeroDayTrainingMode.displayName = "ZeroDayTrainingMode";

export default ZeroDayTrainingMode;
