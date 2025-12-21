import { useEffect, useRef, useState } from "react";
import { Terminal } from "lucide-react";

interface LogEntry {
  id: string;
  timestamp: Date;
  type: "info" | "warning" | "error" | "success";
  message: string;
}

interface TerminalLogProps {
  logs: LogEntry[];
}

const TerminalLog = ({ logs }: TerminalLogProps) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [cursorVisible, setCursorVisible] = useState(true);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCursorVisible((v) => !v);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const getTypeColor = (type: LogEntry["type"]) => {
    switch (type) {
      case "error":
        return "text-primary";
      case "warning":
        return "text-samaritan-warning";
      case "success":
        return "text-samaritan-success";
      default:
        return "text-samaritan-text";
    }
  };

  const getTypePrefix = (type: LogEntry["type"]) => {
    switch (type) {
      case "error":
        return "[ERROR]";
      case "warning":
        return "[WARN]";
      case "success":
        return "[OK]";
      default:
        return "[INFO]";
    }
  };

  return (
    <div className="w-full bg-samaritan-dark border border-samaritan-border rounded-sm overflow-hidden">
      {/* Header */}
      <div className="px-4 py-2 bg-secondary border-b border-samaritan-border flex items-center gap-2">
        <Terminal className="w-4 h-4 text-primary" />
        <span className="font-display text-xs tracking-widest text-samaritan-highlight">SYSTEM LOG</span>
        <div className="flex-1" />
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-primary/60" />
          <div className="w-2 h-2 rounded-full bg-samaritan-warning/60" />
          <div className="w-2 h-2 rounded-full bg-samaritan-success/60" />
        </div>
      </div>

      {/* Log Content */}
      <div
        ref={scrollRef}
        className="h-48 overflow-y-auto p-3 font-mono text-xs space-y-1"
      >
        {logs.map((log) => (
          <div key={log.id} className="flex gap-2 animate-fade-in">
            <span className="text-samaritan-border">
              {log.timestamp.toLocaleTimeString("en-US", { hour12: false })}
            </span>
            <span className={getTypeColor(log.type)}>{getTypePrefix(log.type)}</span>
            <span className="text-samaritan-text">{log.message}</span>
          </div>
        ))}
        <div className="flex gap-2">
          <span className="text-samaritan-border">
            {new Date().toLocaleTimeString("en-US", { hour12: false })}
          </span>
          <span className="text-samaritan-success">[VORTEX]</span>
          <span className="text-samaritan-text">
            Awaiting command
            <span className={cursorVisible ? "opacity-100" : "opacity-0"}>_</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default TerminalLog;
