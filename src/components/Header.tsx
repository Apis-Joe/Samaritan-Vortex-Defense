import { Eye, Shield } from "lucide-react";

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-samaritan-dark/80 backdrop-blur-sm border-b border-samaritan-border">
      <div className="flex items-center justify-between max-w-screen-2xl mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Eye className="w-8 h-8 text-primary" />
            <div className="absolute inset-0 w-8 h-8 text-primary animate-ping opacity-20">
              <Eye className="w-8 h-8" />
            </div>
          </div>
          <div>
            <h1 className="font-display text-xl tracking-[0.2em] text-samaritan-highlight">SAMARITAN</h1>
            <div className="text-xs text-samaritan-text tracking-widest">VORTEX DEFENSE SYSTEM</div>
          </div>
        </div>

        {/* Status */}
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-2 text-xs text-samaritan-text">
            <Shield className="w-4 h-4 text-samaritan-success" />
            <span className="font-display tracking-wider">PROTECTED</span>
          </div>
          <div className="text-xs text-samaritan-text font-mono">
            {new Date().toLocaleDateString("en-US", { 
              year: "numeric", 
              month: "short", 
              day: "numeric" 
            })}
          </div>
          <div className="text-xs text-primary font-mono animate-pulse">
            {new Date().toLocaleTimeString("en-US", { hour12: false })}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
