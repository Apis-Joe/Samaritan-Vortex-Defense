import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface VirusDefinitions {
  version: string;
  lastUpdated: string;
  totalSignatures: number;
  categories: Record<string, number>;
  recentThreats: Array<{
    id: string;
    name: string;
    type: string;
    severity: string;
    discovered: string;
  }>;
  maliciousIPs: string[];
  knownMaliciousApps: Array<{
    packageName: string;
    name: string;
    threat: string;
    severity: string;
  }>;
}

interface UseVirusDefinitionsResult {
  definitions: VirusDefinitions | null;
  isUpdating: boolean;
  lastCheck: Date | null;
  lastUpdate: Date | null;
  updateAvailable: boolean;
  error: string | null;
  checkForUpdates: () => Promise<boolean>;
  downloadUpdate: () => Promise<void>;
  getMaliciousApps: () => Promise<void>;
}

const STORAGE_KEY = 'vortex_virus_definitions';
const LAST_UPDATE_KEY = 'vortex_last_definition_update';
const UPDATE_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

export function useVirusDefinitions(): UseVirusDefinitionsResult {
  const [definitions, setDefinitions] = useState<VirusDefinitions | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [isUpdating, setIsUpdating] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(() => {
    const stored = localStorage.getItem(LAST_UPDATE_KEY);
    return stored ? new Date(stored) : null;
  });
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkForUpdates = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);
      console.log('[VirusDefinitions] Checking for updates...');
      
      const { data, error: fnError } = await supabase.functions.invoke('virus-definitions', {
        body: {},
        headers: { 'Content-Type': 'application/json' }
      });

      // Handle the query parameter approach
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/virus-definitions?action=check`,
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const checkData = await response.json();
      
      setLastCheck(new Date());
      
      // Check if 24h has passed since last update
      const timeSinceUpdate = lastUpdate ? Date.now() - lastUpdate.getTime() : UPDATE_INTERVAL + 1;
      const needsUpdate = timeSinceUpdate >= UPDATE_INTERVAL || checkData.updateAvailable;
      
      setUpdateAvailable(needsUpdate);
      console.log('[VirusDefinitions] Update available:', needsUpdate);
      
      return needsUpdate;
    } catch (err) {
      console.error('[VirusDefinitions] Check error:', err);
      setError(err instanceof Error ? err.message : 'Failed to check for updates');
      return false;
    }
  }, [lastUpdate]);

  const downloadUpdate = useCallback(async () => {
    try {
      setIsUpdating(true);
      setError(null);
      console.log('[VirusDefinitions] Downloading update...');
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/virus-definitions?action=update`,
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const data = await response.json();
      
      if (data.success && data.definitions) {
        setDefinitions(data.definitions);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data.definitions));
        
        const now = new Date();
        setLastUpdate(now);
        localStorage.setItem(LAST_UPDATE_KEY, now.toISOString());
        
        setUpdateAvailable(false);
        console.log('[VirusDefinitions] Update complete:', data.definitions.totalSignatures, 'signatures');
      }
    } catch (err) {
      console.error('[VirusDefinitions] Download error:', err);
      setError(err instanceof Error ? err.message : 'Failed to download update');
    } finally {
      setIsUpdating(false);
    }
  }, []);

  const getMaliciousApps = useCallback(async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/virus-definitions?action=malicious-apps`,
        {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const data = await response.json();
      
      if (data.apps && definitions) {
        setDefinitions(prev => prev ? { ...prev, knownMaliciousApps: data.apps } : prev);
      }
    } catch (err) {
      console.error('[VirusDefinitions] Malicious apps error:', err);
    }
  }, [definitions]);

  // Auto-update check every 24 hours
  useEffect(() => {
    const checkAndUpdate = async () => {
      const needsUpdate = await checkForUpdates();
      if (needsUpdate) {
        await downloadUpdate();
      }
    };

    // Initial check
    checkAndUpdate();

    // Set up 24h interval
    const interval = setInterval(checkAndUpdate, UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  return {
    definitions,
    isUpdating,
    lastCheck,
    lastUpdate,
    updateAvailable,
    error,
    checkForUpdates,
    downloadUpdate,
    getMaliciousApps
  };
}
