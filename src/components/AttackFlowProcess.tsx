import { memo } from 'react';
import { Zap, RefreshCw, ArrowRight } from 'lucide-react';

interface Props {
  phase: 'idle' | 'detecting' | 'aspirating' | 'redirecting';
  responseTime?: string;
}

const AttackFlowProcess = memo(({ phase, responseTime = '<0.1ms' }: Props) => {
  const steps = [
    { 
      id: 'attack', 
      label: 'ATTACK', 
      description: 'Incoming threat detected',
      icon: <Zap className="w-8 h-8" />,
      color: 'text-red-400 bg-red-500/20 border-red-500/50',
      activeColor: 'text-red-400 bg-red-500/30 border-red-500 shadow-lg shadow-red-500/30'
    },
    { 
      id: 'vortex', 
      label: 'VORTEX', 
      description: 'Instant aspiration',
      subtext: responseTime + ' response',
      icon: <RefreshCw className="w-8 h-8" />,
      color: 'text-cyan-400 bg-cyan-500/20 border-cyan-500/50',
      activeColor: 'text-cyan-400 bg-cyan-500/30 border-cyan-500 shadow-lg shadow-cyan-500/30 animate-spin-slow'
    },
    { 
      id: 'redirect', 
      label: 'REDIRECT', 
      description: 'Sent to destination',
      icon: <ArrowRight className="w-8 h-8" />,
      color: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/50',
      activeColor: 'text-emerald-400 bg-emerald-500/30 border-emerald-500 shadow-lg shadow-emerald-500/30'
    },
  ];

  const getStepState = (stepId: string) => {
    if (phase === 'idle') return 'idle';
    if (phase === 'detecting' && stepId === 'attack') return 'active';
    if (phase === 'aspirating' && (stepId === 'attack' || stepId === 'vortex')) return stepId === 'vortex' ? 'active' : 'complete';
    if (phase === 'redirecting') {
      if (stepId === 'redirect') return 'active';
      return 'complete';
    }
    return 'idle';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h3 className="font-display text-sm text-primary tracking-wider mb-6">ATTACK FLOW PROCESS</h3>
      
      {/* Flow Diagram */}
      <div className="flex items-center justify-center gap-4 mb-8">
        {steps.map((step, idx) => {
          const state = getStepState(step.id);
          return (
            <div key={step.id} className="flex items-center gap-4">
              <div className="flex flex-col items-center">
                <div className={`w-16 h-16 rounded-full border-2 flex items-center justify-center transition-all duration-300 ${
                  state === 'active' ? step.activeColor : 
                  state === 'complete' ? 'border-emerald-500 text-emerald-400 bg-emerald-500/20' :
                  step.color
                }`}>
                  {step.icon}
                </div>
                <span className={`mt-2 text-sm font-display tracking-wider ${
                  state === 'active' ? step.color.split(' ')[0] : 'text-foreground'
                }`}>{step.label}</span>
                <span className="text-[10px] text-muted-foreground text-center max-w-[100px]">{step.description}</span>
                {step.subtext && (
                  <span className="text-[10px] text-cyan-400 font-mono">{step.subtext}</span>
                )}
              </div>
              {idx < steps.length - 1 && (
                <ArrowRight className={`w-6 h-6 transition-colors ${
                  state === 'complete' || state === 'active' ? 'text-cyan-400' : 'text-muted-foreground'
                }`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Steps Description */}
      <div className="space-y-2 border-t border-border pt-4">
        <div className="flex items-start gap-3">
          <span className="w-6 h-6 rounded-full bg-cyan-500/20 border border-cyan-500/50 text-cyan-400 flex items-center justify-center text-xs">1</span>
          <div>
            <span className="text-sm text-foreground font-medium">DETECTION</span>
            <p className="text-xs text-muted-foreground">Threat enters system perimeter and triggers quantum sensors</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <span className="w-6 h-6 rounded-full bg-yellow-500/20 border border-yellow-500/50 text-yellow-400 flex items-center justify-center text-xs">2</span>
          <div>
            <span className="text-sm text-foreground font-medium">ASPIRATION</span>
            <p className="text-xs text-muted-foreground">Vortex pulls attack code at 100,000x speed - faster than execution</p>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <span className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-400 flex items-center justify-center text-xs">3</span>
          <div>
            <span className="text-sm text-foreground font-medium">REDIRECTION</span>
            <p className="text-xs text-muted-foreground">Attack code routed to secure destinations - attacker origin, black holes, honeypots</p>
          </div>
        </div>
      </div>
    </div>
  );
});

AttackFlowProcess.displayName = 'AttackFlowProcess';

export default AttackFlowProcess;
