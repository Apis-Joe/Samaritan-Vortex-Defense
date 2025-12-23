import { useState, useEffect, useCallback, memo, useRef } from 'react';
import { Wifi, ArrowUpRight, ArrowDownLeft, Lock, AlertTriangle, Shield, Eye, Globe } from 'lucide-react';
import { useThreatIntelligence, ThreatIntelligence } from '@/hooks/useThreatIntelligence';
import { useURLScanner, URLScanResult } from '@/hooks/useURLScanner';

interface Connection {
  id: string;
  fromIP: string;
  fromPort: number;
  toIP: string;
  status: 'ALLOWED' | 'SUSPICIOUS' | 'BLOCKED' | 'SCANNING';
  threatLevel: number;
  country: string;
  encrypted: boolean;
  timestamp: Date;
  realThreatData?: ThreatIntelligence | null;
  type: 'ip' | 'url';
  url?: string;
  urlScanResult?: URLScanResult | null;
}

interface Props {
  isActive: boolean;
  onThreatDetected?: (connection: Connection) => void;
}

const countries = ['Russia', 'China', 'USA', 'Brazil', 'Germany', 'India', 'Ukraine', 'Romania', 'Netherlands', 'France'];

const generateIP = () => {
  return `${Math.floor(Math.random() * 223) + 1}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
};

// Sample URLs to scan (simulating outgoing connections)
const sampleUrls = [
  'https://google.com',
  'https://github.com',
  'https://stackoverflow.com',
  'https://microsoft.com',
  'https://cloudflare.com',
];

const ConnectionSecurityMonitor = memo(({ isActive, onThreatDetected }: Props) => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [stats, setStats] = useState({
    incoming: 0,
    outgoing: 0,
    blocked: 0,
    suspicious: 0,
    dataTransferred: 0,
    realScans: 0,
  });
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [visitorIP, setVisitorIP] = useState<string | null>(null);
  const [autoScanEnabled, setAutoScanEnabled] = useState(true);
  
  const { checkIP, getVisitorIP, isChecking: isCheckingIP } = useThreatIntelligence();
  const { scanURL, isScanning: isScanningURL } = useURLScanner();
  const scanQueueRef = useRef<string[]>([]);
  const isProcessingRef = useRef(false);

  // Get visitor IP on mount
  useEffect(() => {
    if (isActive) {
      getVisitorIP().then(ip => {
        if (ip && ip !== 'unknown') {
          setVisitorIP(ip);
          console.log('Visitor IP detected:', ip);
        }
      });
    }
  }, [isActive, getVisitorIP]);

  // Process scan queue
  const processScanQueue = useCallback(async () => {
    if (isProcessingRef.current || scanQueueRef.current.length === 0) return;
    
    isProcessingRef.current = true;
    const target = scanQueueRef.current.shift();
    
    if (target) {
      const isUrl = target.startsWith('http');
      const connectionId = Date.now().toString();
      
      // Add connection in SCANNING state
      const newConnection: Connection = {
        id: connectionId,
        fromIP: isUrl ? (visitorIP || '127.0.0.1') : target,
        fromPort: Math.floor(Math.random() * 65535),
        toIP: isUrl ? 'external' : generateIP(),
        status: 'SCANNING',
        threatLevel: 0,
        country: 'Scanning...',
        encrypted: isUrl ? target.startsWith('https') : Math.random() > 0.3,
        timestamp: new Date(),
        type: isUrl ? 'url' : 'ip',
        url: isUrl ? target : undefined,
      };
      
      setConnections(prev => [newConnection, ...prev].slice(0, 30));

      try {
        if (isUrl) {
          // Scan URL with VirusTotal
          const result = await scanURL(target);
          
          setConnections(prev => prev.map(conn => {
            if (conn.id === connectionId) {
              const threatScore = result?.threatScore || 0;
              let status: Connection['status'] = 'ALLOWED';
              if (threatScore >= 10 || (result?.stats.malicious || 0) >= 1) {
                status = 'BLOCKED';
              } else if (threatScore >= 5 || (result?.stats.suspicious || 0) >= 1) {
                status = 'SUSPICIOUS';
              }
              
              return {
                ...conn,
                status,
                threatLevel: threatScore,
                urlScanResult: result,
                country: result ? 'Scanned' : 'Error',
              };
            }
            return conn;
          }));

          if (result && (result.stats.malicious > 0 || result.stats.suspicious > 0)) {
            const updatedConn = { ...newConnection, status: 'SUSPICIOUS' as const, urlScanResult: result };
            onThreatDetected?.(updatedConn);
          }
        } else {
          // Check IP with AbuseIPDB
          const result = await checkIP(target);
          
          setConnections(prev => prev.map(conn => {
            if (conn.id === connectionId) {
              let status: Connection['status'] = 'ALLOWED';
              const riskScore = result?.riskScore || 0;
              
              if (riskScore >= 60) {
                status = 'BLOCKED';
              } else if (riskScore >= 20) {
                status = 'SUSPICIOUS';
              }
              
              return {
                ...conn,
                status,
                threatLevel: riskScore,
                realThreatData: result,
                country: result?.geolocation?.country || result?.abuseData?.countryCode || 'Unknown',
              };
            }
            return conn;
          }));

          if (result && result.riskScore >= 20) {
            const updatedConn = { ...newConnection, status: 'SUSPICIOUS' as const, realThreatData: result };
            onThreatDetected?.(updatedConn);
          }
        }

        setStats(prev => ({
          ...prev,
          realScans: prev.realScans + 1,
          incoming: prev.incoming + (isUrl ? 0 : 1),
          outgoing: prev.outgoing + (isUrl ? 1 : 0),
        }));

      } catch (error) {
        console.error('Scan error:', error);
        setConnections(prev => prev.map(conn => 
          conn.id === connectionId ? { ...conn, status: 'ALLOWED', country: 'Scan Failed' } : conn
        ));
      }
    }
    
    isProcessingRef.current = false;
    
    // Process next item if any
    if (scanQueueRef.current.length > 0) {
      setTimeout(processScanQueue, 1500); // Rate limit between scans
    }
  }, [checkIP, scanURL, visitorIP, onThreatDetected]);

  // Auto-scan when monitoring is active
  useEffect(() => {
    if (!isActive || !isMonitoring || !autoScanEnabled) return;

    const interval = setInterval(() => {
      // Randomly choose between IP check or URL scan
      if (Math.random() > 0.5) {
        // Generate random IP to check
        const randomIP = generateIP();
        if (!scanQueueRef.current.includes(randomIP)) {
          scanQueueRef.current.push(randomIP);
          processScanQueue();
        }
      } else {
        // Pick a sample URL to scan
        const randomUrl = sampleUrls[Math.floor(Math.random() * sampleUrls.length)];
        if (!scanQueueRef.current.includes(randomUrl)) {
          scanQueueRef.current.push(randomUrl);
          processScanQueue();
        }
      }
    }, 8000); // Every 8 seconds to respect API rate limits

    return () => clearInterval(interval);
  }, [isActive, isMonitoring, autoScanEnabled, processScanQueue]);

  const manualScanIP = useCallback((ip: string) => {
    if (!scanQueueRef.current.includes(ip)) {
      scanQueueRef.current.push(ip);
      processScanQueue();
    }
  }, [processScanQueue]);

  const manualScanURL = useCallback((url: string) => {
    if (!scanQueueRef.current.includes(url)) {
      scanQueueRef.current.push(url);
      processScanQueue();
    }
  }, [processScanQueue]);

  const getStatusColor = useCallback((status: Connection['status']) => {
    switch (status) {
      case 'ALLOWED': return 'text-emerald-400 bg-emerald-500/20 border-emerald-500/50';
      case 'SUSPICIOUS': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50';
      case 'BLOCKED': return 'text-red-400 bg-red-500/20 border-red-500/50';
      case 'SCANNING': return 'text-cyan-400 bg-cyan-500/20 border-cyan-500/50 animate-pulse';
    }
  }, []);

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <div className="flex items-center gap-2">
            <Wifi className="w-5 h-5 text-cyan-400" />
            <h3 className="font-display text-sm text-cyan-400 tracking-wider">REAL-TIME SECURITY MONITOR</h3>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Live threat intelligence via AbuseIPDB & VirusTotal
            {visitorIP && <span className="text-cyan-400 ml-2">Your IP: {visitorIP}</span>}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setAutoScanEnabled(prev => !prev)}
            disabled={!isActive}
            className={`px-2 py-1 rounded text-xs font-mono border transition-all ${
              autoScanEnabled 
                ? 'border-purple-500/50 text-purple-400 bg-purple-500/10' 
                : 'border-border text-muted-foreground'
            }`}
          >
            AUTO
          </button>
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
            {isMonitoring ? 'ACTIVE' : 'START'}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-2 mb-4">
        <div className="bg-secondary/50 rounded p-2 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <ArrowDownLeft className="w-3 h-3 text-cyan-400" />
            <span className="text-[10px] text-muted-foreground">IN</span>
          </div>
          <span className="text-lg font-mono text-cyan-400">{stats.incoming}</span>
        </div>
        <div className="bg-secondary/50 rounded p-2 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <ArrowUpRight className="w-3 h-3 text-purple-400" />
            <span className="text-[10px] text-muted-foreground">OUT</span>
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
            <span className="text-[10px] text-muted-foreground">SUSPECT</span>
          </div>
          <span className="text-lg font-mono text-yellow-400">{stats.suspicious}</span>
        </div>
        <div className="bg-secondary/50 rounded p-2 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Globe className="w-3 h-3 text-blue-400" />
            <span className="text-[10px] text-muted-foreground">SCANS</span>
          </div>
          <span className="text-lg font-mono text-blue-400">{stats.realScans}</span>
        </div>
        <div className="bg-secondary/50 rounded p-2 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Shield className="w-3 h-3 text-emerald-400" />
            <span className="text-[10px] text-muted-foreground">STATUS</span>
          </div>
          <span className={`text-xs font-mono ${isCheckingIP || isScanningURL ? 'text-yellow-400' : 'text-emerald-400'}`}>
            {isCheckingIP || isScanningURL ? 'SCAN' : 'READY'}
          </span>
        </div>
      </div>

      {/* Quick Scan Buttons */}
      {visitorIP && (
        <div className="flex gap-2 mb-4 flex-wrap">
          <button
            onClick={() => manualScanIP(visitorIP)}
            disabled={!isActive || isCheckingIP}
            className="px-3 py-1.5 rounded text-xs font-mono border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10 transition-all disabled:opacity-50"
          >
            SCAN MY IP
          </button>
          <button
            onClick={() => manualScanIP(generateIP())}
            disabled={!isActive || isCheckingIP}
            className="px-3 py-1.5 rounded text-xs font-mono border border-border text-foreground hover:bg-secondary/50 transition-all disabled:opacity-50"
          >
            SCAN RANDOM IP
          </button>
          <button
            onClick={() => manualScanURL('https://google.com')}
            disabled={!isActive || isScanningURL}
            className="px-3 py-1.5 rounded text-xs font-mono border border-purple-500/50 text-purple-400 hover:bg-purple-500/10 transition-all disabled:opacity-50"
          >
            SCAN URL
          </button>
        </div>
      )}

      {/* Connection List */}
      <div className="space-y-2 max-h-[250px] overflow-y-auto">
        {connections.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground text-xs">
            {isActive ? 'Click START to begin real-time threat monitoring' : 'Activate system to begin monitoring'}
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
                  <span className="text-[10px] text-muted-foreground px-1 bg-secondary rounded">
                    {conn.type.toUpperCase()}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">{formatTimestamp(conn.timestamp)}</span>
              </div>
              
              <div className="flex items-center gap-2 text-xs flex-wrap">
                {conn.type === 'url' ? (
                  <>
                    <span className="text-muted-foreground">URL:</span>
                    <span className="font-mono text-purple-400 truncate max-w-[200px]">{conn.url}</span>
                  </>
                ) : (
                  <>
                    <span className="text-muted-foreground">IP:</span>
                    <span className={`font-mono ${conn.status === 'SUSPICIOUS' ? 'text-yellow-400' : conn.status === 'BLOCKED' ? 'text-red-400' : 'text-cyan-400'}`}>
                      {conn.fromIP}
                    </span>
                  </>
                )}
              </div>
              
              <div className="flex items-center gap-3 mt-1 text-[10px] flex-wrap">
                <span className={`${conn.threatLevel > 20 ? 'text-yellow-400' : conn.threatLevel > 50 ? 'text-red-400' : 'text-muted-foreground'}`}>
                  Risk: {conn.threatLevel}%
                </span>
                <span className="text-muted-foreground">{conn.country}</span>
                {conn.encrypted && (
                  <span className="text-emerald-400 flex items-center gap-1">
                    <Lock className="w-2 h-2" /> TLS
                  </span>
                )}
                {conn.realThreatData?.abuseData?.isTor && (
                  <span className="text-orange-400">TOR</span>
                )}
                {conn.urlScanResult && (
                  <span className="text-blue-400">
                    {conn.urlScanResult.stats.totalEngines} engines
                  </span>
                )}
              </div>

              {(conn.status === 'SUSPICIOUS' || conn.status === 'BLOCKED') && (
                <div className="mt-2 flex gap-2">
                  <button 
                    onClick={() => {
                      setConnections(prev => prev.map(c => 
                        c.id === conn.id ? { ...c, status: 'BLOCKED' } : c
                      ));
                      setStats(prev => ({ ...prev, blocked: prev.blocked + 1 }));
                    }}
                    className="px-2 py-0.5 text-[10px] font-mono bg-red-500/20 text-red-400 border border-red-500/50 rounded hover:bg-red-500/30 transition-colors"
                  >
                    BLOCK
                  </button>
                  <button 
                    onClick={() => {
                      setConnections(prev => prev.map(c => 
                        c.id === conn.id ? { ...c, status: 'ALLOWED' } : c
                      ));
                    }}
                    className="px-2 py-0.5 text-[10px] font-mono bg-emerald-500/20 text-emerald-400 border border-emerald-500/50 rounded hover:bg-emerald-500/30 transition-colors"
                  >
                    ALLOW
                  </button>
                </div>
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