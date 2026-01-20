"use client";

import { useId, useState, useEffect } from "react";
import { DashboardLayout } from "@/app/components/DashboardLayout";
import { updateMyProfile, withdrawUser, getSprints, getUserProfile, type UserResponse, type UserUpdateRequest, type Sprint, type UserProfileResponse } from "@/lib/api";
import { useUser } from "@/app/contexts/UserContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Textarea } from "@/app/components/ui/textarea";
import { Switch } from "@/app/components/ui/switch";
import { Separator } from "@/app/components/ui/separator";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/app/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import defaultAvatar from "@/assets/38ba5abba51d546a081340d28143511ad0f46c8f.png";

export function SettingsPage() {
  const id = useId();
  const navigate = useNavigate();
  const maxLength = 180;

  const { user: contextUser, loading: contextLoading, refreshProfile, logout: contextLogout } = useUser();
  const [user, setUser] = useState<UserResponse | null>(contextUser || null);
  const [richProfile, setRichProfile] = useState<UserProfileResponse | null>(null);
  const [updating, setUpdating] = useState(false);
  const [sprints, setSprints] = useState<any[]>([]); // Using any[] to accommodate both Sprint types if needed, or stick to UserProfileResponse['participatingSprints']

  // Load rich profile and sprints
  useEffect(() => {
    const loadData = async () => {
      if (!contextUser?.username) return;
      try {
        const profileData = await getUserProfile(contextUser.username);
        setRichProfile(profileData);
        // Use participatingSprints from profile data
        setSprints(profileData.participatingSprints || []);
      } catch (error) {
        console.error("Failed to load profile stats:", error);
      }
    };
    loadData();
  }, [contextUser?.username]);

  // Form state
  const [formData, setFormData] = useState<UserUpdateRequest>({
    company: '',
    location: '',
    notifyEmail: '',
    notifySprint: true,
    notifyWeekly: false,
  });

  // Sync context user to local state and form data
  useEffect(() => {
    if (contextUser) {
      setUser(contextUser);
      setFormData({
        company: contextUser.company || '',
        location: contextUser.location || '',
        notifyEmail: contextUser.notifyEmail || '',
        notifySprint: contextUser.notifySprint ?? true,
        notifyWeekly: contextUser.notifyWeekly ?? false,
      });
    }
  }, [contextUser]);

  const isLoading = contextLoading && !user;

  const handleSaveProfile = async () => {
    if (!user) return;
    setUpdating(true);
    try {
      const updatedUser = await updateMyProfile(formData);
      setUser(updatedUser);
      await refreshProfile();
      alert('프로필이 업데이트되었습니다.');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      alert(`프로필 업데이트 실패: ${error.message}`);
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return;
    }
    try {
      await withdrawUser();
      await contextLogout();
      navigate('/login');
    } catch (error: any) {
      console.error('Error deleting account:', error);
      alert(`계정 삭제 실패: ${error.message}`);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="h-[calc(100vh-4rem)] flex items-center justify-center bg-black">
          <div className="text-white">로딩 중...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!contextLoading && !contextUser) {
    useEffect(() => { navigate('/login'); }, [navigate]);
    return null;
  }

  if (!user) return null;

  // Derive stats
  const totalCommits = richProfile?.totalCommits || 0;
  const participatedSprintsCount = sprints.length;
  // Calculate unique managerNames or derive team count if available. 
  // User asked for "Participating Teams". The API response has `teamsCount` per sprint, but not total unique teams user is in.
  // We will SUM the teamsCount from participating sprints as a proxy, or just show sprints count.
  // Actually, let's just show "Participating Sprints" and "Commits" and "Public Repos" as requested.
  // "참여한 팀" -> Maybe Sum of participantsCount? No. 
  // Let's assume unique sprints implies unique teams for now, or just omit if no data.
  // We'll show "Active Sprints" count maybe?

  // Sort Sprints: Active first
  const sortedSprints = [...sprints].sort((a, b) => {
    if (a.status === 'active' && b.status !== 'active') return -1;
    if (a.status !== 'active' && b.status === 'active') return 1;
    return new Date(b.startDate).getTime() - new Date(a.startDate).getTime(); // Newest first
  });

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-4rem)] flex flex-col bg-black">
        <div className="px-4 py-2.5 border-b border-neutral-900 bg-black">
          <h1 className="text-base font-semibold text-white">Profile & Setting</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-3 bg-black">
          <div className="max-w-4xl mx-auto space-y-2">

            {/* Profile Section */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg">
              <div className="px-3 py-2 border-b border-neutral-800 flex justify-between items-center">
                <h3 className="text-sm font-medium text-white">Profile</h3>
                <div className="flex gap-2">
                  {/* Notifications Dialog */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" className="h-7 text-xs px-3 border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:text-white">
                        Edit Notifications
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-neutral-900 border-neutral-800 text-white sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Notification Settings</DialogTitle>
                      </DialogHeader>
                      <div className="py-4 space-y-4">
                        <div className="space-y-4">
                          <div className="flex flex-col space-y-1.5">
                            <Label>Notification Email</Label>
                            <Input
                              value={formData.notifyEmail || ''}
                              onChange={(e) => setFormData({ ...formData, notifyEmail: e.target.value })}
                              placeholder="email@example.com"
                              className="bg-neutral-950/50 border-neutral-800"
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <div className="text-sm font-medium">Sprint updates</div>
                              <div className="text-xs text-neutral-400">Get notified about sprint progress</div>
                            </div>
                            <Switch
                              checked={formData.notifySprint ?? false}
                              onCheckedChange={(checked) => setFormData({ ...formData, notifySprint: checked })}
                            />
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <div className="text-sm font-medium">Weekly digest</div>
                              <div className="text-xs text-neutral-400">Receive weekly summary</div>
                            </div>
                            <Switch
                              checked={formData.notifyWeekly ?? false}
                              onCheckedChange={(checked) => setFormData({ ...formData, notifyWeekly: checked })}
                            />
                          </div>
                        </div>
                      </div>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button onClick={handleSaveProfile} disabled={updating}>Save Changes</Button>
                        </DialogClose>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>

                  <Button
                    onClick={handleSaveProfile}
                    disabled={updating}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white h-7 text-xs px-3"
                  >
                    {updating ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
              <div className="p-4 space-y-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Avatar Column */}
                  <div className="flex flex-col items-center space-y-3 w-full md:w-48 text-center shrink-0">
                    <Avatar className="w-24 h-24 border-4 border-neutral-800 shadow-lg">
                      <AvatarImage src={user.profileUrl || defaultAvatar} />
                      <AvatarFallback className="bg-neutral-800 text-white text-xl">
                        {user.username?.substring(0, 2).toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-lg font-bold text-white leading-tight">{user.username}</div>
                      <div className="text-xs text-neutral-400 mt-1">Synced from GitHub</div>
                    </div>
                    <div className="w-full pt-2">
                      <a href={user.profileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline flex items-center justify-center gap-1">
                        View on GitHub
                      </a>
                    </div>
                  </div>

                  {/* Info Column */}
                  <div className="flex-1 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Read-only fields */}
                      <div className="space-y-1.5">
                        <Label className="text-xs text-neutral-400">Username</Label>
                        <Input value={user.username || ''} disabled className="bg-neutral-950/50 border-neutral-800 text-neutral-500 h-9" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-neutral-400">Email</Label>
                        <Input value={user.email || ''} disabled className="bg-neutral-950/50 border-neutral-800 text-neutral-500 h-9" />
                      </div>
                      {/* Editable fields */}
                      <div className="space-y-1.5">
                        <Label htmlFor={`${id}-company`} className="text-xs text-neutral-400">Company</Label>
                        <Input id={`${id}-company`} value={formData.company || ''} onChange={(e) => setFormData({ ...formData, company: e.target.value })} className="bg-neutral-900 border-neutral-800 text-white h-9" />
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor={`${id}-location`} className="text-xs text-neutral-400">Location</Label>
                        <Input id={`${id}-location`} value={formData.location || ''} onChange={(e) => setFormData({ ...formData, location: e.target.value })} className="bg-neutral-900 border-neutral-800 text-white h-9" />
                      </div>
                    </div>

                    <Separator className="bg-neutral-800" />

                    {/* Statistics */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <div>
                        <div className="text-sm text-neutral-400 font-medium mb-1">Public Repos</div>
                        <div className="text-2xl text-white font-light">{user.publicRepos || 0}</div>
                      </div>
                      <div>
                        <div className="text-sm text-neutral-400 font-medium mb-1">Total Commits</div>
                        <div className="text-2xl text-white font-light">{richProfile ? totalCommits : '-'}</div>
                      </div>
                      <div>
                        <div className="text-sm text-neutral-400 font-medium mb-1">Sprints</div>
                        <div className="text-2xl text-white font-light">{richProfile ? participatedSprintsCount : '-'}</div>
                      </div>
                      {/* Placeholder for Team Count if we had it, using Sprints as proxy logic? */}
                      <div>
                        <div className="text-sm text-neutral-400 font-medium mb-1">Score</div>
                        <div className="text-2xl text-white font-light">{richProfile ? richProfile.totalScore : '-'}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sprints Section */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg">
              <div className="px-3 py-2 border-b border-neutral-800">
                <h3 className="text-sm font-medium text-white">Participating Sprints</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-neutral-400 uppercase bg-neutral-900 border-b border-neutral-800">
                    <tr>
                      <th className="px-4 py-3">Sprint Name</th>
                      <th className="px-4 py-3">Period</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Teams/Participants</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-800">
                    {sortedSprints.map((sprint) => (
                      <tr key={sprint.id} className="hover:bg-neutral-800/50">
                        <td className="px-4 py-3 font-medium text-white">{sprint.name}</td>
                        <td className="px-4 py-3 text-neutral-400">
                          {new Date(sprint.startDate).toLocaleDateString()} - {new Date(sprint.endDate).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-medium uppercase ${sprint.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-neutral-800 text-neutral-400'
                            }`}>
                            {sprint.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-neutral-400">
                          {sprint.teamsCount || 0} teams / {sprint.participantsCount || 0} members
                        </td>
                      </tr>
                    ))}
                    {sortedSprints.length === 0 && (
                      <tr><td colSpan={4} className="px-4 py-8 text-center text-neutral-500">No participating sprints found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="bg-neutral-900 border border-red-500/30 rounded-lg">
              <div className="px-3 py-2 border-b border-red-500/30">
                <h3 className="text-sm font-medium text-red-400">Danger Zone</h3>
              </div>
              <div className="p-3">
                <div className="flex items-center justify-between p-2 border border-red-500/30 rounded-md">
                  <div>
                    <div className="text-sm font-medium text-white mb-0.5">Delete account</div>
                    <div className="text-xs text-neutral-400">Permanently delete your account and all data</div>
                  </div>
                  <Button variant="destructive" size="sm" onClick={handleDeleteAccount} className="h-7 text-xs px-3">Delete</Button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
