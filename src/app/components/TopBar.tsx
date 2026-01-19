import { useState } from "react";
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
          <ActivityDropdown />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-2 px-2 py-1.5 hover:bg-white/5 rounded-lg transition-all border border-transparent hover:border-white/10 cursor-pointer">
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
            <DropdownMenuContent align="end" className="w-56 bg-neutral-900 border-neutral-800">
              <DropdownMenuLabel className="text-white">My Account</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-neutral-800" />
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => navigate('/settings')} className="text-white focus:bg-neutral-800">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-white focus:bg-neutral-800">
                  <CreditCard className="mr-2 h-4 w-4" />
                  <span>Billing</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')} className="text-white focus:bg-neutral-800">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-white focus:bg-neutral-800">
                  <Keyboard className="mr-2 h-4 w-4" />
                  <span>Keyboard shortcuts</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator className="bg-neutral-800" />
              <DropdownMenuGroup>
                <DropdownMenuItem className="text-white focus:bg-neutral-800">
                  <Users className="mr-2 h-4 w-4" />
                  <span>Team</span>
                </DropdownMenuItem>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger className="text-white focus:bg-neutral-800">
                    <UserPlus className="mr-2 h-4 w-4" />
                    <span>Invite users</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent className="bg-neutral-900 border-neutral-800">
                      <DropdownMenuItem className="text-white focus:bg-neutral-800">
                        <Mail className="mr-2 h-4 w-4" />
                        <span>Email</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-white focus:bg-neutral-800">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        <span>Message</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-neutral-800" />
                      <DropdownMenuItem className="text-white focus:bg-neutral-800">
                        <PlusCircle className="mr-2 h-4 w-4" />
                        <span>More...</span>
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
                <DropdownMenuItem className="text-white focus:bg-neutral-800">
                  <Plus className="mr-2 h-4 w-4" />
                  <span>New Team</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator className="bg-neutral-800" />
              <DropdownMenuItem className="text-white focus:bg-neutral-800">
                <Github className="mr-2 h-4 w-4" />
                <span>GitHub</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-white focus:bg-neutral-800">
                <LifeBuoy className="mr-2 h-4 w-4" />
                <span>Support</span>
              </DropdownMenuItem>
              <DropdownMenuItem disabled className="text-neutral-500 focus:bg-neutral-800">
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