import { useState, useEffect } from "react";
import { Search, Menu, User, Settings, LogOut, CreditCard, Keyboard, Users, UserPlus, Mail, MessageSquare, PlusCircle, Plus, Github, LifeBuoy, Cloud } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
  DropdownMenuShortcut,
} from "@/app/components/ui/dropdown-menu";
import { ActivityDropdown } from "@/app/components/ui/activity-dropdown";
import { type UserResponse } from "@/lib/api";
import { useUser } from "@/app/contexts/UserContext";
import githubAvatar from "@/assets/38ba5abba51d546a081340d28143511ad0f46c8f.png";

interface TopBarProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export function TopBar({ onToggleSidebar, isSidebarOpen }: TopBarProps) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const { user, loading: isLoading, logout } = useUser();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (err) {
      console.error("Logout failed", err);
      navigate('/');
    }
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
          <ActivityDropdown />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-2 px-2 py-1.5 hover:bg-white/5 rounded-lg transition-all border border-transparent hover:border-white/10 cursor-pointer">
                <Avatar className="w-7 h-7 border border-white/10 ring-1 ring-white/5 shadow-inner">
                  <AvatarImage src={user?.profileUrl || ''} />
                  <AvatarFallback className="bg-neutral-800 text-white text-[10px] font-bold">
                    {user?.username ? user.username.substring(0, 2).toUpperCase() : (isLoading ? "..." : "??")}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  {isLoading ? (
                    <div className="w-20 h-3 bg-white/10 rounded animate-pulse mb-1"></div>
                  ) : (
                    <p className="text-sm font-medium text-white leading-none mb-0.5">
                      {user?.username || "Guest"}
                    </p>
                  )}
                  <p className="text-[10px] text-[#7d8590] leading-none">
                    {isLoading ? "Loading profile..." : (user?.company || user?.location || user?.email || "")}
                  </p>
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-neutral-900 border-neutral-800">
              <DropdownMenuLabel className="text-white">My Account</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-neutral-800" />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => navigate('/settings')} className="text-white focus:bg-neutral-800 cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile & Setting</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator className="bg-neutral-800" />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => navigate('/teams')} className="text-white focus:bg-neutral-800 cursor-pointer">
                  <Users className="mr-2 h-4 w-4" />
                  <span>Team</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/teams')} className="text-white focus:bg-neutral-800 cursor-pointer">
                  <Plus className="mr-2 h-4 w-4" />
                  <span>New Team</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator className="bg-neutral-800" />
              <DropdownMenuItem onClick={() => navigate('/settings')} className="text-white focus:bg-neutral-800 cursor-pointer">
                <Github className="mr-2 h-4 w-4" />
                <span>GitHub</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-neutral-500 focus:bg-neutral-800 cursor-not-allowed opacity-50">
                <LifeBuoy className="mr-2 h-4 w-4" />
                <span>Support</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-neutral-500 focus:bg-neutral-800 cursor-not-allowed opacity-50">
                <Cloud className="mr-2 h-4 w-4" />
                <span>API</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-neutral-800" />
              <DropdownMenuItem onClick={handleLogout} className="text-white focus:bg-neutral-800">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}