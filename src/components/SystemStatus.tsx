import { Activity, Cpu, HardDrive, Wifi, Shield, Zap } from "lucide-react";
import { useEffect, useState } from "react";

interface SystemStatusProps {
  isActive: boolean;
  threatsBlocked: number;
}

const SystemStatus = ({ isActive, threatsBlocked }: SystemStatusProps) => {
  const [stats, setStats] = useState({
    cpu: 23,
    memory: 45,
    network: 12,
    vortexPower: 100,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setStats({
        cpu: 20 + Math.random() * 30,
        memory: 40 + Math.random() * 20,
        network: 5 + Math.random() * 25,
        vortexPower: 95 + Math.random() * 5,
      });
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const StatusBar = ({ value, color }: { value: number; color: string }) => (
    <div className="h-1 bg-samaritan-border rounded-full overflow-hidden">
      <div
        className={`h-full ${color} transition-all duration-500`}
        style={{ width: `${value}%` }}
      />
    </div>
  );

  return (
    <div className="w-72 bg-samaritan-panel border border-samaritan-border rounded-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-secondary border-b border-samaritan-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            <span className="font-display text-xs tracking-widest text-samaritan-highlight">SYSTEM STATUS</span>
          </div>
          <div className={`w-2 h-2 rounded-full ${isActive ? "bg-samaritan-success animate-pulse" : "bg-samaritan-text"}`} />
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Main Status */}
        <div className="text-center py-4 border border-samaritan-border rounded bg-secondary/30">
          <div className={`font-display text-2xl tracking-widest ${isActive ? "text-samaritan-success text-glow" : "text-samaritan-text"}`}>
            {isActive ? "ONLINE" : "STANDBY"}
          </div>
          <div className="text-xs text-samaritan-text mt-1">VORTEX FIREWALL</div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-secondary/30 border border-samaritan-border rounded">
            <div className="flex items-center gap-2 mb-2">
              <Cpu className="w-3 h-3 text-samaritan-cyan" />
              <span className="text-xs text-samaritan-text">CPU</span>
            </div>
            <div className="text-lg font-display text-samaritan-highlight">{stats.cpu.toFixed(1)}%</div>
            <StatusBar value={stats.cpu} color="bg-samaritan-cyan" />
          </div>

          <div className="p-3 bg-secondary/30 border border-samaritan-border rounded">
            <div className="flex items-center gap-2 mb-2">
              <HardDrive className="w-3 h-3 text-samaritan-warning" />
              <span className="text-xs text-samaritan-text">MEM</span>
            </div>
            <div className="text-lg font-display text-samaritan-highlight">{stats.memory.toFixed(1)}%</div>
            <StatusBar value={stats.memory} color="bg-samaritan-warning" />
          </div>

          <div className="p-3 bg-secondary/30 border border-samaritan-border rounded">
            <div className="flex items-center gap-2 mb-2">
              <Wifi className="w-3 h-3 text-samaritan-success" />
              <span className="text-xs text-samaritan-text">NET</span>
            </div>
            <div className="text-lg font-display text-samaritan-highlight">{stats.network.toFixed(1)} Gb/s</div>
            <StatusBar value={stats.network * 3} color="bg-samaritan-success" />
          </div>

          <div className="p-3 bg-secondary/30 border border-samaritan-border rounded">
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-3 h-3 text-primary" />
              <span className="text-xs text-samaritan-text">VORTEX</span>
            </div>
            <div className="text-lg font-display text-primary">{stats.vortexPower.toFixed(1)}%</div>
            <StatusBar value={stats.vortexPower} color="bg-primary" />
          </div>
        </div>

        {/* Threats Counter */}
        <div className="p-4 bg-primary/10 border border-primary/30 rounded text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="w-5 h-5 text-primary" />
            <span className="text-xs text-samaritan-text font-display tracking-wider">THREATS NEUTRALIZED</span>
          </div>
          <div className="text-4xl font-display text-primary text-glow">{threatsBlocked}</div>
        </div>
      </div>
    </div>
  );
};

export default SystemStatus;
