import React, { memo } from 'react';
import { Wifi, Shield, ShieldCheck, ShieldAlert, ShieldOff, Globe, Lock, Unlock, RefreshCw, Signal } from 'lucide-react';
import { useNetworkSecurity } from '@/hooks/useNetworkSecurity';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface Props {
  isActive: boolean;
}

const NetworkSecurityAdvisor = memo(({ isActive }: Props) => {
  const {
    networkInfo,
    vpnStatus,
    isAnalyzing,
    lastAnalysis,
    analyzeNetwork,
    getSecurityScore
  } = useNetworkSecurity();

  const securityScore = getSecurityScore();

  const getConnectionIcon = () => {
    switch (networkInfo.type) {
      case 'wifi': return <Wifi className="w-4 h-4" />;
      case 'cellular': return <Signal className="w-4 h-4" />;
      case 'ethernet': return <Globe className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  const getRiskColor = () => {
    switch (networkInfo.riskLevel) {
      case 'low': return 'text-emerald-400';
      case 'medium': return 'text-yellow-400';
      case 'high': return 'text-orange-400';
      case 'critical': return 'text-red-400';
    }
  };

  const getScoreColor = () => {
    if (securityScore >= 80) return 'text-emerald-400';
    if (securityScore >= 60) return 'text-yellow-400';
    if (securityScore >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreProgressColor = () => {
    if (securityScore >= 80) return 'bg-emerald-500';
    if (securityScore >= 60) return 'bg-yellow-500';
    if (securityScore >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" />
          <h3 className="font-display text-sm text-primary tracking-wider">NETWORK SECURITY</h3>
        </div>
        <div className="flex items-center gap-2">
          {vpnStatus.detected && (
            <span className="px-2 py-0.5 text-[10px] bg-emerald-500/20 text-emerald-400 rounded">
              VPN ACTIVE
            </span>
          )}
          <span className={`px-2 py-0.5 text-[10px] rounded ${isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-muted text-muted-foreground'}`}>
            {isActive ? 'MONITORING' : 'STANDBY'}
          </span>
        </div>
      </div>

      {/* Security Score */}
      <div className="mb-4 p-3 bg-background/50 rounded-lg">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] text-muted-foreground">NETWORK SECURITY SCORE</span>
          <span className={`text-lg font-mono font-bold ${getScoreColor()}`}>{securityScore}</span>
        </div>
        <Progress value={securityScore} className={`h-2 ${getScoreProgressColor()}`} />
        <div className="flex justify-between mt-1">
          <span className="text-[8px] text-muted-foreground">VULNERABLE</span>
          <span className="text-[8px] text-muted-foreground">SECURE</span>
        </div>
      </div>

      {/* Connection Status Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-background/50 rounded p-3">
          <div className="flex items-center gap-2 mb-2">
            {getConnectionIcon()}
            <span className="text-[10px] text-muted-foreground">CONNECTION</span>
          </div>
          <div className="text-xs font-mono text-foreground capitalize">{networkInfo.type}</div>
          <div className={`text-[10px] ${networkInfo.connectionQuality === 'excellent' ? 'text-emerald-400' : 'text-muted-foreground'}`}>
            Quality: {networkInfo.connectionQuality}
          </div>
        </div>

        <div className="bg-background/50 rounded p-3">
          <div className="flex items-center gap-2 mb-2">
            {vpnStatus.detected ? (
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            ) : (
              <ShieldOff className="w-4 h-4 text-yellow-400" />
            )}
            <span className="text-[10px] text-muted-foreground">VPN STATUS</span>
          </div>
          <div className={`text-xs font-mono ${vpnStatus.detected ? 'text-emerald-400' : 'text-yellow-400'}`}>
            {vpnStatus.detected ? 'Protected' : 'Not Detected'}
          </div>
          {vpnStatus.detected && vpnStatus.protocol && (
            <div className="text-[10px] text-muted-foreground">{vpnStatus.protocol}</div>
          )}
        </div>

        <div className="bg-background/50 rounded p-3">
          <div className="flex items-center gap-2 mb-2">
            {networkInfo.isSecure ? (
              <Lock className="w-4 h-4 text-emerald-400" />
            ) : (
              <Unlock className="w-4 h-4 text-red-400" />
            )}
            <span className="text-[10px] text-muted-foreground">ENCRYPTION</span>
          </div>
          <div className={`text-xs font-mono ${networkInfo.isSecure ? 'text-emerald-400' : 'text-red-400'}`}>
            {networkInfo.isSecure ? 'HTTPS Active' : 'Unsecured'}
          </div>
        </div>

        <div className="bg-background/50 rounded p-3">
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert className={`w-4 h-4 ${getRiskColor()}`} />
            <span className="text-[10px] text-muted-foreground">RISK LEVEL</span>
          </div>
          <div className={`text-xs font-mono uppercase ${getRiskColor()}`}>
            {networkInfo.riskLevel}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      {networkInfo.recommendations.length > 0 && (
        <div className="mb-4">
          <div className="text-[10px] text-muted-foreground mb-2">SECURITY RECOMMENDATIONS</div>
          <div className="space-y-1">
            {networkInfo.recommendations.map((rec, i) => (
              <div
                key={i}
                className={`text-[10px] p-2 rounded ${
                  rec.startsWith('✓') 
                    ? 'bg-emerald-500/10 text-emerald-400' 
                    : 'bg-yellow-500/10 text-yellow-400'
                }`}
              >
                {rec}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VPN Recommendation Banner */}
      {!vpnStatus.detected && networkInfo.type === 'wifi' && (
        <div className="mb-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded">
          <div className="flex items-center gap-2 mb-1">
            <ShieldAlert className="w-4 h-4 text-yellow-400" />
            <span className="text-xs text-yellow-400 font-semibold">VPN Recommended</span>
          </div>
          <p className="text-[10px] text-yellow-400/80">
            You're on WiFi without VPN protection. Your IP address and traffic may be visible to others on this network.
          </p>
        </div>
      )}

      {/* Actions */}
      <Button
        variant="outline"
        size="sm"
        onClick={analyzeNetwork}
        disabled={isAnalyzing}
        className="w-full text-[10px] h-8"
      >
        <RefreshCw className={`w-3 h-3 mr-1 ${isAnalyzing ? 'animate-spin' : ''}`} />
        {isAnalyzing ? 'ANALYZING...' : 'RE-ANALYZE NETWORK'}
      </Button>

      {lastAnalysis && (
        <div className="text-center mt-2">
          <span className="text-[9px] text-muted-foreground">
            Last analysis: {lastAnalysis.toLocaleTimeString()}
          </span>
        </div>
      )}
    </div>
  );
});

NetworkSecurityAdvisor.displayName = 'NetworkSecurityAdvisor';

export default NetworkSecurityAdvisor;
