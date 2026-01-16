import { Bell, Search, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import githubAvatar from "@/assets/38ba5abba51d546a081340d28143511ad0f46c8f.png";

interface TopBarProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export function TopBar({ onToggleSidebar, isSidebarOpen }: TopBarProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="h-16 relative">
      {/* Refined glass background */}
      <div className="absolute inset-0 bg-[#0d1117]/95 backdrop-blur-xl border-b border-[#30363d]"></div>

      <div className="relative h-full flex items-center justify-between px-6">
        {/* Left side - Menu button and Search */}
        <div className="flex items-center gap-4 flex-1 max-w-2xl">
          {/* Menu button to open sidebar */}
          <button
            onClick={onToggleSidebar}
            className="p-2.5 text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d] rounded-lg transition-all duration-200 border border-[#30363d]"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6e7681]" />
            <input
              type="text"
              placeholder="Search repositories, sprints, teams..."
              className="w-full h-10 pl-11 pr-4 bg-[#161b22] border border-[#30363d] rounded-lg text-sm text-[#e6edf3] placeholder:text-[#6e7681] focus:outline-none focus:border-[#58a6ff] focus:ring-2 focus:ring-[#58a6ff]/20 transition-all duration-200"
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <button className="relative p-2.5 text-[#8b949e] hover:text-[#e6edf3] bg-[#161b22] hover:bg-[#21262d] rounded-lg transition-all duration-200 border border-[#30363d]">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#f85149] rounded-full ring-2 ring-[#0d1117]"></span>
          </button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger className="focus:outline-none">
              <div className="flex items-center gap-3 px-3 py-2 hover:bg-[#21262d] rounded-lg transition-all duration-200 border border-[#30363d]">
                <Avatar className="w-8 h-8 border-2 border-[#30363d]">
                  <AvatarImage src={githubAvatar} />
                  <AvatarFallback className="bg-gradient-to-br from-[#58a6ff]/20 to-[#388bfd]/20 text-[#58a6ff] text-sm font-medium">JD</AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-[#e6edf3]">John Doe</p>
                  <p className="text-xs text-[#8b949e]">@johndoe</p>
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-[#161b22]/95 backdrop-blur-xl border-[#30363d]">
              <DropdownMenuLabel className="text-[#e6edf3] font-semibold">My Account</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-[#30363d]" />
              <DropdownMenuItem onClick={() => navigate('/settings')} className="text-[#c9d1d9] focus:bg-[#21262d] focus:text-[#e6edf3] cursor-pointer">
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="text-[#c9d1d9] focus:bg-[#21262d] focus:text-[#e6edf3] cursor-pointer">
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/team')} className="text-[#c9d1d9] focus:bg-[#21262d] focus:text-[#e6edf3] cursor-pointer">
                Team
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#30363d]" />
              <DropdownMenuItem onClick={handleLogout} className="text-[#f85149] focus:bg-[#21262d] focus:text-[#f85149] cursor-pointer">
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}