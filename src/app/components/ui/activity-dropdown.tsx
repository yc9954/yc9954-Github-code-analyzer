"use client";

import * as React from "react";
import { Bell, CheckCircle, XCircle, Users, Flag } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { cn } from "@/app/components/ui/utils";
import { getNotifications, markNotificationAsRead, type Notification } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";

export function ActivityDropdown() {
  const [activities, setActivities] = React.useState<Notification[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    loadNotifications();
    // Poll every 60 seconds
    const interval = setInterval(loadNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await getNotifications();
      setActivities(data);
    } catch (error) {
      console.error("Failed to load notifications", error);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await markNotificationAsRead(id);
      // Optimistic update
      setActivities(prev => prev.map(item =>
        item.id === id ? { ...item, read: true } : item
      ));
    } catch (error) {
      console.error("Failed to mark as read", error);
    }
  };

  const unreadCount = activities.filter((item) => !item.read).length;

  const getIcon = (type: string) => {
    switch (type) {
      case 'ANALYSIS_COMPLETED':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'ANALYSIS_FAILED':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'TEAM_INVITE':
        return <Users className="w-4 h-4 text-blue-500" />;
      case 'SPRINT_ALERT':
        return <Flag className="w-4 h-4 text-yellow-500" />;
      default:
        return <Bell className="w-4 h-4 text-neutral-400" />;
    }
  };

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
        <DropdownMenuLabel className="text-white flex justify-between items-center">
          <span>Activity</span>
          {unreadCount > 0 && <span className="text-xs text-neutral-400 font-normal">{unreadCount} unread</span>}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-neutral-800" />
        <div className="max-h-[400px] overflow-y-auto">
          {activities.length === 0 ? (
            <div className="py-8 text-center text-xs text-neutral-500">
              No recent activity
            </div>
          ) : (
            activities.map((activity) => (
              <DropdownMenuItem
                key={activity.id}
                className={cn(
                  "text-white focus:bg-neutral-800 cursor-pointer",
                  !activity.read && "bg-neutral-800/50"
                )}
                onClick={() => !activity.read && handleMarkAsRead(activity.id)}
              >
                <div className="flex flex-col gap-1 w-full py-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 flex-1">
                      {getIcon(activity.type)}
                      <div className="flex-1">
                        <div className="text-sm font-medium">{activity.type.replace('_', ' ')}</div>
                        <div className="text-xs text-neutral-400 mt-0.5">{activity.message}</div>
                      </div>
                    </div>
                    {!activity.read && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                    )}
                  </div>
                  <div className="text-xs text-neutral-500 ml-6">
                    {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                  </div>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
        <DropdownMenuSeparator className="bg-neutral-800" />
        <DropdownMenuItem className="text-white focus:bg-neutral-800 justify-center">
          View all activity
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
