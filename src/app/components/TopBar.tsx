import { useState } from "react";
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
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogout = () => {
    navigate('/');
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="h-16 relative">
      {/* Glass background */}
      <div className="absolute inset-0 bg-[#010409]/80 backdrop-blur-2xl border-b border-white/5"></div>
      
      <div className="relative h-full flex items-center justify-between px-6">
        {/* Left side - Menu button and Search */}
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          {/* Menu button to open sidebar */}
          <button
            onClick={onToggleSidebar}
            className="p-2 text-[#7d8590] hover:text-white hover:bg-white/5 rounded-lg transition-all border border-transparent hover:border-white/10"
          >
            <Menu className="w-5 h-5" />
          </button>
          <form onSubmit={handleSearch} className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6e7681]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search repositories, sprints, teams..."
              className="w-full h-8 pl-9 pr-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-sm text-white placeholder:text-[#6e7681] focus:outline-none focus:border-[#7aa2f7]/50 focus:ring-2 focus:ring-[#7aa2f7]/20 transition-all"
            />
          </form>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <button className="relative p-2 text-[#7d8590] hover:text-white bg-white/5 backdrop-blur-sm hover:bg-white/10 rounded-lg transition-all border border-white/10">
            <Bell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#f85149] rounded-full ring-2 ring-[#010409]"></span>
          </button>

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger className="focus:outline-none">
              <div className="flex items-center gap-2 px-2 py-1.5 hover:bg-white/5 rounded-lg transition-all border border-transparent hover:border-white/10">
                <Avatar className="w-7 h-7 border border-white/10">
                  <AvatarImage src={githubAvatar} />
                  <AvatarFallback className="bg-gradient-to-br from-[#7aa2f7]/20 to-[#bb9af7]/20 text-white text-xs">JD</AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-white">John Doe</p>
                  <p className="text-xs text-[#7d8590]">@johndoe</p>
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-[#161b22]/95 backdrop-blur-xl border-white/10">
              <DropdownMenuLabel className="text-[#c9d1d9]">My Account</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem onClick={() => navigate('/settings')} className="text-[#c9d1d9] focus:bg-white/5 focus:text-white">
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="text-[#c9d1d9] focus:bg-white/5 focus:text-white">
                Billing
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate('/team')} className="text-[#c9d1d9] focus:bg-white/5 focus:text-white">
                Team
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-white/10" />
              <DropdownMenuItem onClick={handleLogout} className="text-[#c9d1d9] focus:bg-white/5 focus:text-white">
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}