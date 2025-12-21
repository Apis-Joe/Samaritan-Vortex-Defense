import { useEffect, useState } from "react";

const DataStream = () => {
  const [streams, setStreams] = useState<Array<{ id: number; left: number; delay: number; speed: number; chars: string[] }>>([]);

  useEffect(() => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    const newStreams = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      left: 5 + i * 6.5,
      delay: Math.random() * 5,
      speed: 3 + Math.random() * 4,
      chars: Array.from({ length: 15 }, () => chars[Math.floor(Math.random() * chars.length)]),
    }));
    setStreams(newStreams);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none opacity-20">
      {streams.map((stream) => (
        <div
          key={stream.id}
          className="absolute top-0 flex flex-col text-primary font-mono text-xs"
          style={{
            left: `${stream.left}%`,
            animation: `data-stream ${stream.speed}s linear infinite`,
            animationDelay: `${stream.delay}s`,
          }}
        >
          {stream.chars.map((char, i) => (
            <span
              key={i}
              style={{
                opacity: 1 - i * 0.06,
              }}
            >
              {char}
            </span>
          ))}
        </div>
      ))}
    </div>
  );
};

export default DataStream;
