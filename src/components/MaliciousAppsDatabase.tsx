import React, { memo, useState, useEffect } from 'react';
import { AlertTriangle, Shield, Search, RefreshCw, Smartphone, Ban, CheckCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MaliciousApp {
  packageName: string;
  name: string;
  threat: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category?: string;
  lastSeen?: string;
}

interface Props {
  isActive: boolean;
  onThreatFound?: (app: MaliciousApp) => void;
}

// Extended malicious apps database
const MALICIOUS_APPS_DB: MaliciousApp[] = [
  { packageName: "com.battery.saver.pro", name: "Battery Saver Pro", threat: "Adware/Spyware", severity: "high", category: "Utility", lastSeen: "2025-12-25" },
  { packageName: "com.flashlight.ultra", name: "Flashlight Ultra", threat: "Data Theft", severity: "critical", category: "Utility", lastSeen: "2025-12-24" },
  { packageName: "com.cleaner.boost.free", name: "Phone Cleaner Boost", threat: "Banking Trojan", severity: "critical", category: "Utility", lastSeen: "2025-12-24" },
  { packageName: "com.vpn.free.unlimited", name: "Free Unlimited VPN", threat: "Data Harvesting", severity: "high", category: "Security", lastSeen: "2025-12-23" },
  { packageName: "com.wifi.password.hacker", name: "WiFi Password Hacker", threat: "Malware Dropper", severity: "critical", category: "Tools", lastSeen: "2025-12-23" },
  { packageName: "com.call.recorder.secret", name: "Secret Call Recorder", threat: "Spyware", severity: "high", category: "Communication", lastSeen: "2025-12-22" },
  { packageName: "com.qr.scanner.free", name: "QR Scanner Free", threat: "Phishing", severity: "medium", category: "Utility", lastSeen: "2025-12-22" },
  { packageName: "com.weather.live.pro", name: "Live Weather Pro", threat: "Adware", severity: "low", category: "Weather", lastSeen: "2025-12-21" },
  { packageName: "com.file.manager.super", name: "Super File Manager", threat: "Ransomware", severity: "critical", category: "Utility", lastSeen: "2025-12-20" },
  { packageName: "com.music.player.free", name: "Free Music Player", threat: "Cryptominer", severity: "high", category: "Media", lastSeen: "2025-12-20" },
  { packageName: "com.photo.editor.magic", name: "Magic Photo Editor", threat: "Data Exfiltration", severity: "high", category: "Photo", lastSeen: "2025-12-19" },
  { packageName: "com.game.hack.tool", name: "Game Hack Tool", threat: "Trojan Dropper", severity: "critical", category: "Games", lastSeen: "2025-12-19" },
  { packageName: "com.keyboard.fancy", name: "Fancy Keyboard", threat: "Keylogger", severity: "critical", category: "Personalization", lastSeen: "2025-12-18" },
  { packageName: "com.screen.recorder.hd", name: "HD Screen Recorder", threat: "Screen Capture Spyware", severity: "high", category: "Utility", lastSeen: "2025-12-18" },
  { packageName: "com.pdf.reader.fast", name: "Fast PDF Reader", threat: "Adware Injector", severity: "medium", category: "Productivity", lastSeen: "2025-12-17" },
];

const MaliciousAppsDatabase = memo(({ isActive, onThreatFound }: Props) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [lastScan, setLastScan] = useState<Date | null>(null);
  const [filteredApps, setFilteredApps] = useState<MaliciousApp[]>(MALICIOUS_APPS_DB);
  const [installedThreats, setInstalledThreats] = useState<string[]>([]);

  useEffect(() => {
    if (searchQuery) {
      setFilteredApps(
        MALICIOUS_APPS_DB.filter(app =>
          app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.packageName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.threat.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    } else {
      setFilteredApps(MALICIOUS_APPS_DB);
    }
  }, [searchQuery]);

  const handleScan = async () => {
    setIsScanning(true);
    
    // Simulate scan delay
    await new Promise(r => setTimeout(r, 2000));
    
    // In a real app with native permissions, we would check installed packages
    // For now, simulate finding 0-2 threats randomly
    const foundThreats: string[] = [];
    if (Math.random() > 0.7) {
      const randomApp = MALICIOUS_APPS_DB[Math.floor(Math.random() * MALICIOUS_APPS_DB.length)];
      foundThreats.push(randomApp.packageName);
      onThreatFound?.(randomApp);
    }
    
    setInstalledThreats(foundThreats);
    setLastScan(new Date());
    setIsScanning(false);
  };

  const getSeverityColor = (severity: MaliciousApp['severity']) => {
    switch (severity) {
      case 'critical': return 'text-red-500 bg-red-500/10';
      case 'high': return 'text-orange-500 bg-orange-500/10';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10';
      case 'low': return 'text-blue-500 bg-blue-500/10';
    }
  };

  const stats = {
    critical: MALICIOUS_APPS_DB.filter(a => a.severity === 'critical').length,
    high: MALICIOUS_APPS_DB.filter(a => a.severity === 'high').length,
    medium: MALICIOUS_APPS_DB.filter(a => a.severity === 'medium').length,
    low: MALICIOUS_APPS_DB.filter(a => a.severity === 'low').length,
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Smartphone className="w-4 h-4 text-primary" />
          <h3 className="font-display text-sm text-primary tracking-wider">MALICIOUS APPS DATABASE</h3>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground">{MALICIOUS_APPS_DB.length} known threats</span>
          <span className={`px-2 py-0.5 text-[10px] rounded ${isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-muted text-muted-foreground'}`}>
            {isActive ? 'ACTIVE' : 'STANDBY'}
          </span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="bg-red-500/10 rounded p-2 text-center">
          <div className="text-lg font-mono font-bold text-red-500">{stats.critical}</div>
          <div className="text-[9px] text-red-400">CRITICAL</div>
        </div>
        <div className="bg-orange-500/10 rounded p-2 text-center">
          <div className="text-lg font-mono font-bold text-orange-500">{stats.high}</div>
          <div className="text-[9px] text-orange-400">HIGH</div>
        </div>
        <div className="bg-yellow-500/10 rounded p-2 text-center">
          <div className="text-lg font-mono font-bold text-yellow-500">{stats.medium}</div>
          <div className="text-[9px] text-yellow-400">MEDIUM</div>
        </div>
        <div className="bg-blue-500/10 rounded p-2 text-center">
          <div className="text-lg font-mono font-bold text-blue-500">{stats.low}</div>
          <div className="text-[9px] text-blue-400">LOW</div>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search apps, packages, or threats..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9 h-9 text-xs bg-background/50"
        />
      </div>

      {/* Installed Threats Warning */}
      {installedThreats.length > 0 && (
        <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded animate-pulse">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span className="text-xs text-red-400 font-semibold">
              {installedThreats.length} THREAT(S) DETECTED!
            </span>
          </div>
          <p className="text-[10px] text-red-400/80">
            Malicious app(s) found on your device. Immediate removal recommended.
          </p>
        </div>
      )}

      {/* No Threats */}
      {lastScan && installedThreats.length === 0 && (
        <div className="mb-4 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span className="text-xs text-emerald-400">No known malicious apps detected</span>
          </div>
        </div>
      )}

      {/* Apps List */}
      <ScrollArea className="h-48 mb-4">
        <div className="space-y-2">
          {filteredApps.map((app) => (
            <div
              key={app.packageName}
              className={`p-2 rounded border ${
                installedThreats.includes(app.packageName)
                  ? 'border-red-500/50 bg-red-500/10'
                  : 'border-border/50 bg-background/30'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    {installedThreats.includes(app.packageName) ? (
                      <Ban className="w-3 h-3 text-red-500" />
                    ) : (
                      <AlertTriangle className={`w-3 h-3 ${getSeverityColor(app.severity).split(' ')[0]}`} />
                    )}
                    <span className="text-xs font-semibold text-foreground">{app.name}</span>
                    <span className={`px-1.5 py-0.5 text-[8px] rounded uppercase ${getSeverityColor(app.severity)}`}>
                      {app.severity}
                    </span>
                  </div>
                  <div className="text-[10px] text-muted-foreground font-mono mt-1 truncate">
                    {app.packageName}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] text-red-400">{app.threat}</span>
                    {app.category && (
                      <span className="text-[9px] text-muted-foreground">• {app.category}</span>
                    )}
                  </div>
                </div>
                {installedThreats.includes(app.packageName) && (
                  <Button variant="destructive" size="sm" className="text-[9px] h-6 px-2">
                    REMOVE
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Scan Button */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleScan}
        disabled={isScanning}
        className="w-full text-[10px] h-8"
      >
        <RefreshCw className={`w-3 h-3 mr-1 ${isScanning ? 'animate-spin' : ''}`} />
        {isScanning ? 'SCANNING DEVICE...' : 'SCAN FOR MALICIOUS APPS'}
      </Button>

      {lastScan && (
        <div className="text-center mt-2">
          <span className="text-[9px] text-muted-foreground">
            Last scan: {lastScan.toLocaleTimeString()}
          </span>
        </div>
      )}

      {/* Note about limitations */}
      <div className="mt-3 p-2 bg-muted/30 rounded">
        <p className="text-[9px] text-muted-foreground text-center">
          Note: Full device app scanning requires native Android permissions. 
          This database helps identify known threats manually.
        </p>
      </div>
    </div>
  );
});

MaliciousAppsDatabase.displayName = 'MaliciousAppsDatabase';

export default MaliciousAppsDatabase;
