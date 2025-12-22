import { useState, useEffect, useCallback, memo } from 'react';
import { Wifi, ArrowUpRight, ArrowDownLeft, Lock, AlertTriangle, Shield, Eye } from 'lucide-react';

interface Connection {
  id: string;
  fromIP: string;
  fromPort: number;
  toIP: string;
  status: 'ALLOWED' | 'SUSPICIOUS' | 'BLOCKED';
  threatLevel: number;
  country: string;
  encrypted: boolean;
  timestamp: Date;
}

interface Props {
  isActive: boolean;
  onThreatDetected?: (connection: Connection) => void;
}

const countries = ['Russia', 'China', 'USA', 'Brazil', 'Germany', 'India', 'Ukraine', 'Romania', 'Netherlands', 'France'];

const generateIP = () => {
  return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
};

const ConnectionSecurityMonitor = memo(({ isActive, onThreatDetected }: Props) => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [stats, setStats] = useState({
    incoming: 0,
    outgoing: 0,
    blocked: 0,
    suspicious: 0,
    dataTransferred: 0,
  });
  const [isMonitoring, setIsMonitoring] = useState(false);

  // Auto-generate connections when monitoring
  useEffect(() => {
    if (!isActive || !isMonitoring) return;

    const interval = setInterval(() => {
      const threatLevel = Math.floor(Math.random() * 100);
      let status: Connection['status'] = 'ALLOWED';
      
      if (threatLevel > 70) {
        status = 'SUSPICIOUS';
      } else if (threatLevel > 90) {
        status = 'BLOCKED';
      }

      const newConnection: Connection = {
        id: Date.now().toString(),
        fromIP: generateIP(),
        fromPort: Math.floor(Math.random() * 65535),
        toIP: generateIP(),
        status,
        threatLevel,
        country: countries[Math.floor(Math.random() * countries.length)],
        encrypted: Math.random() > 0.3,
        timestamp: new Date(),
      };

      setConnections(prev => [newConnection, ...prev].slice(0, 20));
      
      setStats(prev => ({
        incoming: prev.incoming + 1,
        outgoing: prev.outgoing + (Math.random() > 0.5 ? 1 : 0),
        blocked: prev.blocked + (status === 'BLOCKED' ? 1 : 0),
        suspicious: prev.suspicious + (status === 'SUSPICIOUS' ? 1 : 0),
        dataTransferred: prev.dataTransferred + Math.random() * 0.5,
      }));

      if (status === 'SUSPICIOUS' || status === 'BLOCKED') {
        onThreatDetected?.(newConnection);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [isActive, isMonitoring, onThreatDetected]);

  const getStatusColor = useCallback((status: Connection['status']) => {
    switch (status) {
      case 'ALLOWED': return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/50';
      case 'SUSPICIOUS': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50';
      case 'BLOCKED': return 'text-red-400 bg-red-500/20 border-red-500/50';
    }
  }, []);

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <Wifi className="w-5 h-5 text-cyan-400" />
            <h3 className="font-display text-sm text-cyan-400 tracking-wider">CONNECTION SECURITY MONITOR</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Real-time incoming/outgoing traffic analysis</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMonitoring(prev => !prev)}
            disabled={!isActive}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono border transition-all ${
              isMonitoring 
                ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10' 
                : 'border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10'
            }`}
          >
            <Eye className="w-3 h-3" />
            {isMonitoring ? 'MONITORING' : 'MONITOR'}
          </button>
          <button
            onClick={() => {
              const types = ['DDoS', 'Intrusion', 'Phishing', 'Malware'];
              const connection: Connection = {
                id: Date.now().toString(),
                fromIP: generateIP(),
                fromPort: Math.floor(Math.random() * 65535),
                toIP: generateIP(),
                status: 'SUSPICIOUS',
                threatLevel: 75 + Math.floor(Math.random() * 25),
                country: countries[Math.floor(Math.random() * countries.length)],
                encrypted: Math.random() > 0.5,
                timestamp: new Date(),
              };
              setConnections(prev => [connection, ...prev].slice(0, 20));
              onThreatDetected?.(connection);
            }}
            disabled={!isActive}
            className="px-3 py-1.5 rounded text-xs font-mono border border-border text-foreground hover:bg-secondary/50 transition-all disabled:opacity-50"
          >
            SIMULATE
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-5 gap-2 mb-4">
        <div className="bg-secondary/50 rounded p-2 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <ArrowDownLeft className="w-3 h-3 text-cyan-400" />
            <span className="text-[10px] text-muted-foreground">INCOMING</span>
          </div>
          <span className="text-lg font-mono text-cyan-400">{stats.incoming}</span>
        </div>
        <div className="bg-secondary/50 rounded p-2 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <ArrowUpRight className="w-3 h-3 text-purple-400" />
            <span className="text-[10px] text-muted-foreground">OUTGOING</span>
          </div>
          <span className="text-lg font-mono text-purple-400">{stats.outgoing}</span>
        </div>
        <div className="bg-secondary/50 rounded p-2 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Lock className="w-3 h-3 text-red-400" />
            <span className="text-[10px] text-muted-foreground">BLOCKED</span>
          </div>
          <span className="text-lg font-mono text-red-400">{stats.blocked}</span>
        </div>
        <div className="bg-secondary/50 rounded p-2 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <AlertTriangle className="w-3 h-3 text-yellow-400" />
            <span className="text-[10px] text-muted-foreground">SUSPICIOUS</span>
          </div>
          <span className="text-lg font-mono text-yellow-400">{stats.suspicious}</span>
        </div>
        <div className="bg-secondary/50 rounded p-2 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Shield className="w-3 h-3 text-emerald-400" />
            <span className="text-[10px] text-muted-foreground">DATA</span>
          </div>
          <span className="text-lg font-mono text-emerald-400">{stats.dataTransferred.toFixed(1)}MB</span>
        </div>
      </div>

      {/* Connection List */}
      <div className="space-y-2 max-h-[200px] overflow-y-auto">
        {connections.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground text-xs">
            No connections detected. Start monitoring to capture traffic.
          </div>
        ) : (
          connections.map((conn) => (
            <div 
              key={conn.id}
              className="bg-secondary/30 border border-border/50 rounded p-2"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className={`px-1.5 py-0.5 text-[10px] font-mono rounded border ${getStatusColor(conn.status)}`}>
                    {conn.status}
                  </span>
                  <div className="w-4 h-4 rounded-full bg-secondary flex items-center justify-center">
                    {conn.status === 'BLOCKED' ? '🚫' : conn.status === 'SUSPICIOUS' ? '⚠️' : '✓'}
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">{formatTimestamp(conn.timestamp)}</span>
              </div>
              
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground">From:</span>
                <span className={`font-mono ${conn.status === 'SUSPICIOUS' ? 'text-yellow-400' : conn.status === 'BLOCKED' ? 'text-red-400' : 'text-cyan-400'}`}>
                  {conn.fromIP}:{conn.fromPort}
                </span>
                <span className="text-muted-foreground">→</span>
                <span className="text-muted-foreground">To:</span>
                <span className="text-foreground font-mono">{conn.toIP}</span>
              </div>
              
              <div className="flex items-center gap-3 mt-1 text-[10px]">
                <span className={`${conn.threatLevel > 50 ? 'text-yellow-400' : 'text-muted-foreground'}`}>
                  Threat: {conn.threatLevel}%
                </span>
                <span className="text-muted-foreground">{conn.country}</span>
                {conn.encrypted && (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <Lock className="w-2 h-2" /> Encrypted
                  </span>
                )}
              </div>

              {conn.status === 'SUSPICIOUS' && (
                <button className="mt-2 px-2 py-0.5 text-[10px] font-mono bg-red-500/20 text-red-400 border border-red-500/50 rounded hover:bg-red-500/30 transition-colors">
                  BLOCK
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
});

ConnectionSecurityMonitor.displayName = 'ConnectionSecurityMonitor';

export default ConnectionSecurityMonitor;
