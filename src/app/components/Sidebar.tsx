import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  GitBranch, 
  Zap, 
  Trophy, 
  Users, 
  GitCommit, 
  Settings,
  Github,
  ChevronLeft
} from "lucide-react";
import { Button } from "@/app/components/ui/button";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/repository", label: "Repository", icon: GitBranch },
  { path: "/sprint", label: "Sprint", icon: Zap },
  { path: "/ranking", label: "Ranking", icon: Trophy },
  { path: "/team", label: "Team", icon: Users },
  { path: "/commits", label: "Commits", icon: GitCommit },
  { path: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const location = useLocation();

  return (
    <div
      className={`fixed left-0 top-0 h-screen z-50 transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="w-72 h-full relative">
        {/* Refined glass background with Apple-style blur */}
        <div className="absolute inset-0 bg-[#0d1117]/95 backdrop-blur-xl border-r border-[#30363d]"></div>

        {/* Toggle Button - Top Right - Only show when open */}
        {isOpen && (
          <Button
            onClick={onToggle}
            variant="ghost"
            size="sm"
            className="absolute top-5 right-4 z-20 w-9 h-9 p-0 flex items-center justify-center text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d] border border-[#30363d] rounded-lg transition-all duration-200"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        )}

        <div className="relative h-full flex flex-col">
          {/* Logo - More spacious */}
          <div className="px-6 py-6 border-b border-[#30363d]">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-gradient-to-br from-[#58a6ff]/20 to-[#388bfd]/20 rounded-xl flex-shrink-0 ring-1 ring-[#58a6ff]/30">
                <Github className="w-6 h-6 text-[#58a6ff]" />
              </div>
              <span className="text-lg font-semibold text-[#e6edf3] tracking-tight">DevAnalytics</span>
            </div>
          </div>

          {/* Navigation - Refined spacing */}
          <nav className="flex-1 py-4 px-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={onToggle}
                  className={`group relative flex items-center gap-3 w-full px-4 py-3 mb-1 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? "text-[#e6edf3] bg-[#21262d]"
                      : "text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#161b22]"
                  }`}
                >
                  {/* Active indicator - Apple-style accent */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-[#58a6ff] rounded-r-full"></div>
                  )}

                  {/* Icon with accent color when active */}
                  <Icon className={`w-5 h-5 relative z-10 flex-shrink-0 transition-colors duration-200 ${
                    isActive ? 'text-[#58a6ff]' : ''
                  }`} />
                  <span className="relative z-10">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer - Cleaner */}
          <div className="px-6 py-5 border-t border-[#30363d]">
            <p className="text-xs text-[#6e7681] font-medium">© 2026 DevAnalytics</p>
          </div>
        </div>
      </div>
    </div>
  );
}