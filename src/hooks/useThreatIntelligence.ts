import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface ThreatIntelligence {
  ip: string;
  threatLevel: 'safe' | 'low' | 'medium' | 'high' | 'critical';
  riskScore: number;
  abuseData: {
    confidenceScore: number;
    totalReports: number;
    isTor: boolean;
    isp: string;
    domain: string;
    usageType: string;
    lastReportedAt: string | null;
    countryCode: string;
    isWhitelisted: boolean;
  } | null;
  geolocation: {
    country: string;
    countryCode: string;
    region: string;
    city: string;
    lat: number;
    lon: number;
    isp: string;
    org: string;
    timezone: string;
  } | null;
  checkedAt: string;
}

export const useThreatIntelligence = () => {
  const [isChecking, setIsChecking] = useState(false);
  const [lastCheck, setLastCheck] = useState<ThreatIntelligence | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkIP = useCallback(async (ip: string): Promise<ThreatIntelligence | null> => {
    setIsChecking(true);
    setError(null);
    
    try {
      console.log(`Checking threat intelligence for IP: ${ip}`);
      
      const { data, error: fnError } = await supabase.functions.invoke('check-ip-threat', {
        body: { ip }
      });

      if (fnError) {
        console.error('Edge function error:', fnError);
        setError(fnError.message);
        return null;
      }

      const result = data as ThreatIntelligence;
      setLastCheck(result);
      console.log(`Threat check complete: ${result.threatLevel} (score: ${result.riskScore})`);
      
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to check IP';
      console.error('Threat intelligence error:', err);
      setError(message);
      return null;
    } finally {
      setIsChecking(false);
    }
  }, []);

  const getVisitorIP = useCallback(async (): Promise<string | null> => {
    try {
      const { data, error: fnError } = await supabase.functions.invoke('get-visitor-ip');
      
      if (fnError) {
        console.error('Failed to get visitor IP:', fnError);
        return null;
      }
      
      return data?.ip || null;
    } catch (err) {
      console.error('Error getting visitor IP:', err);
      return null;
    }
  }, []);

  const checkVisitorThreat = useCallback(async (): Promise<ThreatIntelligence | null> => {
    const ip = await getVisitorIP();
    if (!ip || ip === 'unknown') {
      setError('Could not determine visitor IP');
      return null;
    }
    return checkIP(ip);
  }, [checkIP, getVisitorIP]);

  return {
    checkIP,
    getVisitorIP,
    checkVisitorThreat,
    isChecking,
    lastCheck,
    error
  };
};
