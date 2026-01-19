"use client";

import * as React from "react";
import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { cn } from "@/app/components/ui/utils";

interface ActivityItem {
  id: string;
  title: string;
  description?: string;
  time: string;
  type?: "commit" | "pr" | "issue" | "mention";
  unread?: boolean;
}

const mockActivities: ActivityItem[] = [
  {
    id: "1",
    title: "New commit in repository",
    description: "web-dashboard",
    time: "2 hours ago",
    type: "commit",
    unread: true,
  },
  {
    id: "2",
    title: "Pull request reviewed",
    description: "api-server #42",
    time: "5 hours ago",
    type: "pr",
    unread: true,
  },
  {
    id: "3",
    title: "New issue assigned",
    description: "mobile-app #123",
    time: "1 day ago",
    type: "issue",
    unread: false,
  },
  {
    id: "4",
    title: "You were mentioned",
    description: "In comment on data-pipeline",
    time: "2 days ago",
    type: "mention",
    unread: false,
  },
];

export function ActivityDropdown() {
  const unreadCount = mockActivities.filter((item) => item.unread).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="relative p-2 text-[#7d8590] hover:text-white bg-white/5 backdrop-blur-sm hover:bg-white/10 rounded-lg transition-all border border-white/10">
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-[#f85149] rounded-full ring-2 ring-[#010409]"></span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 bg-neutral-900 border-neutral-800">
        <DropdownMenuLabel className="text-white">Activity</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-neutral-800" />
        <div className="max-h-[400px] overflow-y-auto">
          {mockActivities.map((activity) => (
            <DropdownMenuItem
              key={activity.id}
              className={cn(
                "text-white focus:bg-neutral-800 cursor-pointer",
                activity.unread && "bg-neutral-800/50"
              )}
            >
              <div className="flex flex-col gap-1 w-full py-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="text-sm font-medium">{activity.title}</div>
                    {activity.description && (
                      <div className="text-xs text-neutral-400 mt-0.5">{activity.description}</div>
                    )}
                  </div>
                  {activity.unread && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                  )}
                </div>
                <div className="text-xs text-neutral-500">{activity.time}</div>
              </div>
            </DropdownMenuItem>
          ))}
        </div>
        <DropdownMenuSeparator className="bg-neutral-800" />
        <DropdownMenuItem className="text-white focus:bg-neutral-800 justify-center">
          View all activity
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
