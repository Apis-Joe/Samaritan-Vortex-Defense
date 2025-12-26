import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Simulated virus definitions database - in production this would be from a real threat intel feed
const virusDefinitions = {
  version: "2025.12.26.001",
  lastUpdated: new Date().toISOString(),
  totalSignatures: 847293,
  categories: {
    malware: 234521,
    ransomware: 45678,
    trojans: 123456,
    spyware: 89012,
    adware: 67890,
    rootkits: 23456,
    worms: 45678,
    phishing: 156789,
    exploits: 60813
  },
  recentThreats: [
    { id: "MAL-2025-8847", name: "Cryptolocker.Variant.ZX", type: "ransomware", severity: "critical", discovered: "2025-12-25" },
    { id: "TRJ-2025-4432", name: "BankBot.Cerberus.V4", type: "trojan", severity: "high", discovered: "2025-12-24" },
    { id: "SPY-2025-2211", name: "KeyLogger.Shadow.NET", type: "spyware", severity: "high", discovered: "2025-12-23" },
    { id: "PHI-2025-9981", name: "PhishKit.Amazon.2025", type: "phishing", severity: "medium", discovered: "2025-12-22" },
    { id: "EXP-2025-0012", name: "ZeroDay.Chrome.RCE", type: "exploit", severity: "critical", discovered: "2025-12-21" },
  ],
  maliciousIPs: [
    "185.220.101.1", "45.33.32.156", "192.42.116.16", "103.75.201.2", "91.92.109.87",
    "5.188.62.214", "185.156.73.54", "194.5.212.90", "45.148.10.92", "193.42.33.14"
  ],
  maliciousDomainsPatterns: [
    "*.malware.ru", "*.phishing-*.com", "*.cryptominer.*", "*.botnet.cc",
    "free-*.download.xyz", "*.ransomware.*", "login-*.verify-now.com"
  ],
  knownMaliciousApps: [
    { packageName: "com.battery.saver.pro", name: "Battery Saver Pro", threat: "Adware/Spyware", severity: "high" },
    { packageName: "com.flashlight.ultra", name: "Flashlight Ultra", threat: "Data Theft", severity: "critical" },
    { packageName: "com.cleaner.boost.free", name: "Phone Cleaner Boost", threat: "Banking Trojan", severity: "critical" },
    { packageName: "com.vpn.free.unlimited", name: "Free Unlimited VPN", threat: "Data Harvesting", severity: "high" },
    { packageName: "com.wifi.password.hacker", name: "WiFi Password Hacker", threat: "Malware Dropper", severity: "critical" },
    { packageName: "com.call.recorder.secret", name: "Secret Call Recorder", threat: "Spyware", severity: "high" },
    { packageName: "com.qr.scanner.free", name: "QR Scanner Free", threat: "Phishing", severity: "medium" },
    { packageName: "com.weather.live.pro", name: "Live Weather Pro", threat: "Adware", severity: "low" },
  ],
  updateChannel: "stable",
  nextScheduledUpdate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const action = url.searchParams.get('action') || 'check';

    console.log(`[virus-definitions] Action: ${action}`);

    if (action === 'check') {
      // Check if update is needed
      return new Response(JSON.stringify({
        currentVersion: virusDefinitions.version,
        lastUpdated: virusDefinitions.lastUpdated,
        totalSignatures: virusDefinitions.totalSignatures,
        updateAvailable: Math.random() > 0.8, // 20% chance update available
        nextScheduledUpdate: virusDefinitions.nextScheduledUpdate
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'update') {
      // Return full definitions update
      return new Response(JSON.stringify({
        success: true,
        definitions: virusDefinitions,
        downloadedAt: new Date().toISOString(),
        signatureCount: virusDefinitions.totalSignatures
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'malicious-apps') {
      // Return known malicious apps database
      return new Response(JSON.stringify({
        apps: virusDefinitions.knownMaliciousApps,
        lastUpdated: virusDefinitions.lastUpdated,
        totalKnown: virusDefinitions.knownMaliciousApps.length
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'recent-threats') {
      return new Response(JSON.stringify({
        threats: virusDefinitions.recentThreats,
        maliciousIPs: virusDefinitions.maliciousIPs,
        lastUpdated: virusDefinitions.lastUpdated
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('[virus-definitions] Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
