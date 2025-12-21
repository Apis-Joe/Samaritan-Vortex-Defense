import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface URLScanResult {
  url: string;
  threatLevel: 'safe' | 'low' | 'medium' | 'high' | 'critical';
  threatScore: number;
  stats: {
    malicious: number;
    suspicious: number;
    harmless: number;
    undetected: number;
    totalEngines: number;
  };
  flaggedEngines: Array<{
    engine: string;
    category: string;
    result: string;
  }>;
  categories: Record<string, string>;
  lastAnalysisDate: string | null;
  checkedAt: string;
}

export const useURLScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [lastScan, setLastScan] = useState<URLScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const scanURL = useCallback(async (url: string): Promise<URLScanResult | null> => {
    setIsScanning(true);
    setError(null);
    
    try {
      // Validate URL format
      let validUrl = url.trim();
      if (!validUrl.startsWith('http://') && !validUrl.startsWith('https://')) {
        validUrl = 'https://' + validUrl;
      }
      
      new URL(validUrl); // Throws if invalid
      
      console.log(`Scanning URL: ${validUrl}`);
      
      const { data, error: fnError } = await supabase.functions.invoke('scan-url', {
        body: { url: validUrl }
      });

      if (fnError) {
        console.error('Edge function error:', fnError);
        setError(fnError.message);
        return null;
      }

      if (data.error) {
        setError(data.error);
        return null;
      }

      const result = data as URLScanResult;
      setLastScan(result);
      console.log(`URL scan complete: ${result.threatLevel} (score: ${result.threatScore}%)`);
      
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to scan URL';
      console.error('URL scanner error:', err);
      setError(message === 'Invalid URL' ? 'Please enter a valid URL' : message);
      return null;
    } finally {
      setIsScanning(false);
    }
  }, []);

  const clearScan = useCallback(() => {
    setLastScan(null);
    setError(null);
  }, []);

  return {
    scanURL,
    clearScan,
    isScanning,
    lastScan,
    error
  };
};
