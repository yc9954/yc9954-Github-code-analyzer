import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  GitBranch, 
  Zap, 
  GitCommit, 
  Settings,
  Github,
  ChevronLeft,
  Search
} from "lucide-react";
import { Button } from "@/app/components/ui/button";

const navItems = [
  { path: "/repository", label: "Repository", icon: GitBranch },
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/search", label: "Search", icon: Search },
  { path: "/sprint", label: "Sprint", icon: Zap },
  { path: "/settings", label: "Settings", icon: Settings },
];

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const location = useLocation();

  return (
    <>
      {/* Mini Sidebar - Always visible when closed */}
      {!isOpen && (
        <div className="fixed left-0 top-0 h-screen z-50 w-16">
          <div className="w-16 h-full relative">
            {/* Glass background */}
            <div className="absolute inset-0 bg-[#010409]/80 backdrop-blur-2xl border-r border-white/5"></div>
            
            <div className="relative h-full flex flex-col">
              {/* Logo - Icon only */}
              <div className="p-4 border-b border-white/5 flex justify-center">
                <div className="p-2 bg-gradient-to-br from-[#7aa2f7]/20 to-[#bb9af7]/20 rounded-xl flex-shrink-0">
                  <Github className="w-5 h-5 text-white" />
                </div>
              </div>

              {/* Navigation - Icons only */}
              <nav className="flex-1 py-3">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`group relative flex items-center justify-center w-full py-2.5 transition-all ${
                        isActive
                          ? "text-white"
                          : "text-[#7d8590] hover:text-white"
                      }`}
                      title={item.label}
                    >
                      {/* Active background */}
                      {isActive && (
                        <>
                          <div className="absolute left-0 right-0 top-0 bottom-0 bg-gradient-to-br from-[#7aa2f7]/20 to-[#bb9af7]/20"></div>
                          <div className="absolute left-0 right-0 top-0 bottom-0 bg-white/5 backdrop-blur-sm"></div>
                        </>
                      )}
                      
                      {/* Hover effect */}
                      <div className={`absolute left-0 right-0 top-0 bottom-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? 'hidden' : ''}`}></div>
                      
                      <Icon className="w-5 h-5 relative z-10 flex-shrink-0" />
                    </Link>
                  );
                })}
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Full Sidebar - Visible when open */}
      <div 
        className={`fixed left-0 top-0 h-screen z-50 transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="w-64 h-full relative">
          {/* Glass background */}
          <div className="absolute inset-0 bg-[#010409]/80 backdrop-blur-2xl border-r border-white/5"></div>
          
          {/* Toggle Button - Top Right - Only show when open */}
          {isOpen && (
            <Button
              onClick={onToggle}
              variant="ghost"
              size="sm"
              className="absolute top-4 right-3 z-20 w-8 h-8 p-0 flex items-center justify-center text-[#7d8590] hover:text-white hover:bg-white/5 border border-white/10 rounded-lg"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
          )}
        
          <div className="relative h-full flex flex-col">
            {/* Logo */}
            <div className="p-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-[#7aa2f7]/20 to-[#bb9af7]/20 rounded-xl flex-shrink-0">
                  <Github className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-semibold text-white">DevAnalytics</span>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={onToggle}
                    className={`group relative flex items-center gap-3 w-full px-4 py-2.5 text-sm font-medium transition-all ${
                      isActive
                        ? "text-white"
                        : "text-[#7d8590] hover:text-white"
                    }`}
                  >
                    {/* Active background */}
                    {isActive && (
                      <>
                        <div className="absolute left-0 right-0 top-0 bottom-0 bg-gradient-to-br from-[#7aa2f7]/20 to-[#bb9af7]/20"></div>
                        <div className="absolute left-0 right-0 top-0 bottom-0 bg-white/5 backdrop-blur-sm"></div>
                      </>
                    )}
                    
                    {/* Hover effect */}
                    <div className={`absolute left-0 right-0 top-0 bottom-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity ${isActive ? 'hidden' : ''}`}></div>
                    
                    <Icon className="w-4 h-4 relative z-10 flex-shrink-0" />
                    <span className="relative z-10">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-white/5">
              <p className="text-xs text-[#6e7681]">© 2026 DevAnalytics</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}