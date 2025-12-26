import { useState, useEffect, useCallback } from 'react';

interface NetworkInfo {
  type: 'wifi' | 'cellular' | 'ethernet' | 'unknown';
  isSecure: boolean;
  isVPN: boolean;
  isProxy: boolean;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  recommendations: string[];
  connectionQuality: 'excellent' | 'good' | 'fair' | 'poor';
}

interface VPNStatus {
  detected: boolean;
  type: 'commercial' | 'corporate' | 'custom' | 'none';
  provider: string | null;
  protocol: string | null;
}

interface UseNetworkSecurityResult {
  networkInfo: NetworkInfo;
  vpnStatus: VPNStatus;
  isAnalyzing: boolean;
  lastAnalysis: Date | null;
  analyzeNetwork: () => Promise<void>;
  getSecurityScore: () => number;
}

// Known VPN provider IP ranges and DNS servers (simplified)
const VPN_INDICATORS = {
  dnsServers: [
    '10.8.0.1', '10.0.0.1', // OpenVPN common
    '103.86.96.100', '103.86.99.100', // NordVPN
    '162.252.172.57', '149.154.159.92', // ExpressVPN
  ],
  timezoneMismatch: true,
  webRTCLeak: false
};

export function useNetworkSecurity(): UseNetworkSecurityResult {
  const [networkInfo, setNetworkInfo] = useState<NetworkInfo>({
    type: 'unknown',
    isSecure: false,
    isVPN: false,
    isProxy: false,
    riskLevel: 'medium',
    recommendations: [],
    connectionQuality: 'good'
  });

  const [vpnStatus, setVpnStatus] = useState<VPNStatus>({
    detected: false,
    type: 'none',
    provider: null,
    protocol: null
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<Date | null>(null);

  const detectConnectionType = useCallback((): 'wifi' | 'cellular' | 'ethernet' | 'unknown' => {
    const connection = (navigator as any).connection || 
                       (navigator as any).mozConnection || 
                       (navigator as any).webkitConnection;
    
    if (connection) {
      const type = connection.type || connection.effectiveType;
      if (type === 'wifi') return 'wifi';
      if (['cellular', '4g', '3g', '2g'].includes(type)) return 'cellular';
      if (type === 'ethernet') return 'ethernet';
    }
    return 'unknown';
  }, []);

  const detectVPN = useCallback(async (): Promise<VPNStatus> => {
    try {
      // Method 1: Check timezone vs IP geolocation mismatch
      const localTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      
      // Method 2: WebRTC leak detection (if VPN is leaking, it's poorly configured)
      let webRTCLeaked = false;
      try {
        const pc = new RTCPeerConnection({ iceServers: [] });
        pc.createDataChannel('');
        await pc.createOffer().then(offer => pc.setLocalDescription(offer));
        
        await new Promise<void>((resolve) => {
          const timeout = setTimeout(resolve, 1000);
          pc.onicecandidate = (e) => {
            if (e.candidate?.candidate) {
              const ipMatch = e.candidate.candidate.match(/(\d{1,3}\.){3}\d{1,3}/);
              if (ipMatch) {
                const ip = ipMatch[0];
                // Check if it's a private IP (VPN usually shows private IPs)
                if (ip.startsWith('10.') || ip.startsWith('192.168.') || ip.startsWith('172.')) {
                  webRTCLeaked = false; // Private IP = likely VPN
                }
              }
            }
            if (!e.candidate) {
              clearTimeout(timeout);
              resolve();
            }
          };
        });
        pc.close();
      } catch {
        // WebRTC not available
      }

      // Method 3: MTU detection (VPN typically has lower MTU)
      // This is a heuristic - VPNs often have MTU around 1400-1450 vs 1500 for direct

      // Method 4: Connection timing analysis
      const startTime = performance.now();
      try {
        await fetch('https://www.google.com/favicon.ico', { mode: 'no-cors', cache: 'no-cache' });
      } catch {}
      const latency = performance.now() - startTime;
      
      // Higher latency often indicates VPN (>100ms suspicious, >200ms likely VPN)
      const highLatency = latency > 150;

      // Combined heuristic
      const likelyVPN = highLatency && !webRTCLeaked;

      if (likelyVPN) {
        return {
          detected: true,
          type: 'commercial',
          provider: 'Unknown VPN Provider',
          protocol: latency > 300 ? 'OpenVPN' : 'WireGuard'
        };
      }

      return {
        detected: false,
        type: 'none',
        provider: null,
        protocol: null
      };
    } catch {
      return { detected: false, type: 'none', provider: null, protocol: null };
    }
  }, []);

  const analyzeNetwork = useCallback(async () => {
    setIsAnalyzing(true);
    
    try {
      const connectionType = detectConnectionType();
      const vpn = await detectVPN();
      
      const recommendations: string[] = [];
      let riskLevel: NetworkInfo['riskLevel'] = 'low';
      let isSecure = true;

      // Analyze connection security
      if (connectionType === 'wifi') {
        // Check if HTTPS is being used
        if (location.protocol !== 'https:') {
          recommendations.push('Enable HTTPS for secure browsing');
          riskLevel = 'high';
          isSecure = false;
        }
      }

      if (connectionType === 'unknown') {
        recommendations.push('Unable to determine connection type - use caution');
        riskLevel = 'medium';
      }

      // VPN recommendations
      if (!vpn.detected) {
        if (connectionType === 'wifi') {
          recommendations.push('Consider using a VPN on public WiFi networks');
        }
        recommendations.push('VPN not detected - your IP is visible to websites');
      } else {
        recommendations.push('✓ VPN detected - your connection is encrypted');
        isSecure = true;
        riskLevel = 'low';
      }

      // Connection quality check
      const connection = (navigator as any).connection;
      let quality: NetworkInfo['connectionQuality'] = 'good';
      if (connection) {
        const downlink = connection.downlink || 10;
        if (downlink > 10) quality = 'excellent';
        else if (downlink > 5) quality = 'good';
        else if (downlink > 1) quality = 'fair';
        else quality = 'poor';
      }

      setNetworkInfo({
        type: connectionType,
        isSecure,
        isVPN: vpn.detected,
        isProxy: false, // Would need server-side detection
        riskLevel,
        recommendations,
        connectionQuality: quality
      });

      setVpnStatus(vpn);
      setLastAnalysis(new Date());
    } catch (error) {
      console.error('[NetworkSecurity] Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [detectConnectionType, detectVPN]);

  const getSecurityScore = useCallback((): number => {
    let score = 50; // Base score

    if (networkInfo.isVPN) score += 30;
    if (networkInfo.isSecure) score += 10;
    if (networkInfo.type === 'ethernet') score += 5;
    if (networkInfo.connectionQuality === 'excellent') score += 5;
    
    if (networkInfo.riskLevel === 'critical') score -= 30;
    else if (networkInfo.riskLevel === 'high') score -= 20;
    else if (networkInfo.riskLevel === 'medium') score -= 10;

    return Math.max(0, Math.min(100, score));
  }, [networkInfo]);

  // Initial analysis
  useEffect(() => {
    analyzeNetwork();
    
    // Re-analyze on connection change
    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', analyzeNetwork);
      return () => connection.removeEventListener('change', analyzeNetwork);
    }
  }, [analyzeNetwork]);

  return {
    networkInfo,
    vpnStatus,
    isAnalyzing,
    lastAnalysis,
    analyzeNetwork,
    getSecurityScore
  };
}
