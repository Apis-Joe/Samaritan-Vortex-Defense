import React, { memo } from 'react';
import { Shield, Download, RefreshCw, Database, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useVirusDefinitions } from '@/hooks/useVirusDefinitions';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface Props {
  isActive: boolean;
  onUpdateComplete?: () => void;
}

const VirusDefinitionsPanel = memo(({ isActive, onUpdateComplete }: Props) => {
  const {
    definitions,
    isUpdating,
    lastCheck,
    lastUpdate,
    updateAvailable,
    error,
    checkForUpdates,
    downloadUpdate
  } = useVirusDefinitions();

  const handleUpdate = async () => {
    await downloadUpdate();
    onUpdateComplete?.();
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(0)}K`;
    return num.toString();
  };

  const formatTime = (date: Date | null) => {
    if (!date) return 'Never';
    const diff = Date.now() - date.getTime();
    if (diff < 60000) return 'Just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-primary" />
          <h3 className="font-display text-sm text-primary tracking-wider">VIRUS DEFINITIONS</h3>
        </div>
        <div className="flex items-center gap-2">
          {updateAvailable && (
            <span className="px-2 py-0.5 text-[10px] bg-yellow-500/20 text-yellow-400 rounded animate-pulse">
              UPDATE AVAILABLE
            </span>
          )}
          <span className={`px-2 py-0.5 text-[10px] rounded ${isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-muted text-muted-foreground'}`}>
            {isActive ? 'ACTIVE' : 'STANDBY'}
          </span>
        </div>
      </div>

      {/* Version & Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="bg-background/50 rounded p-2 text-center">
          <div className="text-[10px] text-muted-foreground mb-1">VERSION</div>
          <div className="font-mono text-xs text-foreground">{definitions?.version || '---'}</div>
        </div>
        <div className="bg-background/50 rounded p-2 text-center">
          <div className="text-[10px] text-muted-foreground mb-1">SIGNATURES</div>
          <div className="font-mono text-xs text-emerald-400">
            {definitions ? formatNumber(definitions.totalSignatures) : '---'}
          </div>
        </div>
        <div className="bg-background/50 rounded p-2 text-center">
          <div className="text-[10px] text-muted-foreground mb-1">LAST CHECK</div>
          <div className="font-mono text-xs text-foreground">{formatTime(lastCheck)}</div>
        </div>
        <div className="bg-background/50 rounded p-2 text-center">
          <div className="text-[10px] text-muted-foreground mb-1">LAST UPDATE</div>
          <div className="font-mono text-xs text-foreground">{formatTime(lastUpdate)}</div>
        </div>
      </div>

      {/* Categories Breakdown */}
      {definitions?.categories && (
        <div className="mb-4">
          <div className="text-[10px] text-muted-foreground mb-2">SIGNATURE CATEGORIES</div>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(definitions.categories).slice(0, 6).map(([category, count]) => (
              <div key={category} className="flex items-center justify-between bg-background/30 rounded px-2 py-1">
                <span className="text-[10px] text-muted-foreground capitalize">{category}</span>
                <span className="text-[10px] font-mono text-foreground">{formatNumber(count)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Threats */}
      {definitions?.recentThreats && (
        <div className="mb-4">
          <div className="text-[10px] text-muted-foreground mb-2">RECENT THREAT DEFINITIONS</div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {definitions.recentThreats.map((threat) => (
              <div key={threat.id} className="flex items-center justify-between bg-background/30 rounded px-2 py-1">
                <div className="flex items-center gap-2">
                  <AlertTriangle className={`w-3 h-3 ${
                    threat.severity === 'critical' ? 'text-red-500' :
                    threat.severity === 'high' ? 'text-orange-500' :
                    'text-yellow-500'
                  }`} />
                  <span className="text-[10px] font-mono text-foreground truncate max-w-[150px]">
                    {threat.name}
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground">{threat.discovered}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Auto-Update Status */}
      <div className="flex items-center gap-2 mb-4 p-2 bg-background/30 rounded">
        <Clock className="w-3 h-3 text-primary" />
        <span className="text-[10px] text-muted-foreground">Auto-update: Every 24 hours + after each threat alert</span>
        <CheckCircle className="w-3 h-3 text-emerald-500 ml-auto" />
      </div>

      {/* Update Progress */}
      {isUpdating && (
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-2">
            <RefreshCw className="w-3 h-3 text-primary animate-spin" />
            <span className="text-[10px] text-foreground">Downloading definitions...</span>
          </div>
          <Progress value={66} className="h-1" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-4 p-2 bg-red-500/10 border border-red-500/20 rounded">
          <span className="text-[10px] text-red-400">{error}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => checkForUpdates()}
          disabled={isUpdating}
          className="flex-1 text-[10px] h-8"
        >
          <RefreshCw className={`w-3 h-3 mr-1 ${isUpdating ? 'animate-spin' : ''}`} />
          CHECK NOW
        </Button>
        <Button
          variant={updateAvailable ? 'default' : 'outline'}
          size="sm"
          onClick={handleUpdate}
          disabled={isUpdating}
          className={`flex-1 text-[10px] h-8 ${updateAvailable ? 'bg-primary text-primary-foreground' : ''}`}
        >
          <Download className="w-3 h-3 mr-1" />
          {isUpdating ? 'UPDATING...' : 'UPDATE'}
        </Button>
      </div>
    </div>
  );
});

VirusDefinitionsPanel.displayName = 'VirusDefinitionsPanel';

export default VirusDefinitionsPanel;
