"use client";

import { useId, useState, useEffect } from "react";
import { DashboardLayout } from "@/app/components/DashboardLayout";
import { getMyProfile, updateMyProfile, logout, type UserResponse, type UserUpdateRequest } from "@/lib/api";
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
import { ImagePlus } from "lucide-react";
import { useCharacterLimit } from "@/app/hooks/use-character-limit";
import { useImageUpload } from "@/app/hooks/use-image-upload";
import defaultAvatar from "@/assets/38ba5abba51d546a081340d28143511ad0f46c8f.png";

export function SettingsPage() {
  const id = useId();
  const navigate = useNavigate();
  const maxLength = 180;
  const [user, setUser] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState<UserUpdateRequest>({
    company: '',
    location: '',
    notifyEmail: '',
    notifySprint: true,
    notifyWeekly: false,
  });
  
  const { value, characterCount, handleChange, maxLength: limit } = useCharacterLimit({
    maxLength,
    initialValue: "I'm passionate about building user-centric applications that solve problems.",
  });

  const {
    previewUrl,
    fileInputRef,
    handleThumbnailClick,
    handleFileChange,
  } = useImageUpload();

  // Load user profile
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const userData = await getMyProfile();
        setUser(userData);
        setFormData({
          company: userData.company || '',
          location: userData.location || '',
          notifyEmail: userData.notifyEmail || '',
          notifySprint: userData.notifySprint ?? true,
          notifyWeekly: userData.notifyWeekly ?? false,
        });
      } catch (error) {
        console.error('Error loading profile:', error);
        // If not authenticated, redirect to login
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [navigate]);

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setUpdating(true);
    try {
      const updatedUser = await updateMyProfile(formData);
      setUser(updatedUser);
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
      // Delete account API call would go here
      // For now, just logout
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

  const profileImage = previewUrl || user?.profileUrl || defaultAvatar;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="h-[calc(100vh-4rem)] flex items-center justify-center bg-black">
          <div className="text-white">로딩 중...</div>
        </div>
      </DashboardLayout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-4rem)] flex flex-col bg-black">
        {/* Compact Header */}
        <div className="px-4 py-2.5 border-b border-neutral-900 bg-black">
          <h1 className="text-base font-semibold text-white">Settings</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-3 bg-black">
          <div className="max-w-4xl mx-auto space-y-2">
            {/* Profile - Dialog Style */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg">
              <div className="px-3 py-2 border-b border-neutral-800">
                <h3 className="text-sm font-medium text-white">Profile</h3>
              </div>
              <div className="p-3 space-y-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12 border border-neutral-800">
                    <AvatarImage src={profileImage} />
                    <AvatarFallback className="bg-neutral-800 text-white text-sm">
                      {user.username?.substring(0, 2).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white mb-0.5">Profile Picture</div>
                    <div className="text-xs text-neutral-400">Synced from GitHub</div>
                  </div>
                </div>

                <Separator className="bg-neutral-800" />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-neutral-400 mb-1">Username</div>
                    <div className="text-sm text-white">{user.username || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-neutral-400 mb-1">Public Repos</div>
                    <div className="text-sm text-white">{user.publicRepos || 0}</div>
                  </div>
                  <div>
                    <div className="text-xs text-neutral-400 mb-1">Email</div>
                    <div className="text-sm text-white">{user.email || 'N/A'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-neutral-400 mb-1">Location</div>
                    <div className="text-sm text-white">{user.location || 'Not set'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-neutral-400 mb-1">Company</div>
                    <div className="text-sm text-white">{user.company || 'Not set'}</div>
                  </div>
                  <div>
                    <div className="text-xs text-neutral-400 mb-1">GitHub</div>
                    <div className="text-sm text-white">
                      <a href={user.profileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">
                        {user.profileUrl ? user.profileUrl.replace('https://github.com/', '') : 'N/A'}
                      </a>
                    </div>
                  </div>
                </div>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full border-neutral-800 text-white hover:bg-neutral-800 bg-neutral-900">
                      Edit Profile
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-xl p-0 overflow-hidden rounded-2xl border-2 border-neutral-700 bg-neutral-900 shadow-2xl">
                    <div
                      className="px-6 py-4 h-36"
                      style={{
                        background: "radial-gradient(circle, rgba(238, 174, 202, 1) 0%, rgba(148, 187, 233, 1) 100%)",
                      }}
                    />

                    <div className="-mt-14 flex justify-center">
                      <div className="relative">
                        <Avatar className="h-24 w-24 border-4 border-neutral-900 shadow-lg rounded-full">
                          <AvatarImage src={profileImage} alt="Profile" />
                          <AvatarFallback className="bg-neutral-800 text-white">JD</AvatarFallback>
                        </Avatar>
                        <button
                          onClick={handleThumbnailClick}
                          className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                          aria-label="Change profile picture"
                        >
                          <ImagePlus size={16} />
                        </button>
                        <input
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          className="hidden"
                          accept="image/*"
                        />
                      </div>
                    </div>

                    <div className="max-h-[50vh] overflow-y-auto px-6 py-6 space-y-4">
                      <form className="space-y-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                          <div className="flex-1 space-y-1.5">
                            <Label htmlFor={`${id}-username`} className="text-white">Username</Label>
                            <Input 
                              id={`${id}-username`} 
                              value={user.username || ''}
                              disabled
                              className="bg-neutral-800 border-neutral-700 text-neutral-400"
                            />
                            <p className="text-xs text-neutral-500">Username cannot be changed</p>
                          </div>
                          <div className="flex-1 space-y-1.5">
                            <Label htmlFor={`${id}-email`} className="text-white">Email</Label>
                            <Input 
                              id={`${id}-email`} 
                              type="email" 
                              value={user.email || ''}
                              disabled
                              className="bg-neutral-800 border-neutral-700 text-neutral-400"
                            />
                            <p className="text-xs text-neutral-500">Email is synced from GitHub</p>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                          <div className="flex-1 space-y-1.5">
                            <Label htmlFor={`${id}-location`} className="text-white">Location</Label>
                            <Input 
                              id={`${id}-location`} 
                              value={formData.location || ''}
                              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                              placeholder="e.g. San Francisco, USA"
                              className="bg-neutral-900 border-neutral-800 text-white"
                            />
                          </div>
                          <div className="flex-1 space-y-1.5">
                            <Label htmlFor={`${id}-company`} className="text-white">Company</Label>
                            <Input 
                              id={`${id}-company`} 
                              value={formData.company || ''}
                              onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                              placeholder="e.g. DevAnalytics"
                              className="bg-neutral-900 border-neutral-800 text-white"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                          <div className="flex-1 space-y-1.5">
                            <Label htmlFor={`${id}-notify-email`} className="text-white">Notification Email</Label>
                            <Input 
                              id={`${id}-notify-email`} 
                              type="email"
                              value={formData.notifyEmail || ''}
                              onChange={(e) => setFormData({ ...formData, notifyEmail: e.target.value })}
                              placeholder="email@example.com"
                              className="bg-neutral-900 border-neutral-800 text-white"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <Label htmlFor={`${id}-about`} className="text-white">About</Label>
                          <Textarea
                            id={`${id}-about`}
                            placeholder="Tell us a little about yourself..."
                            value={value}
                            onChange={handleChange}
                            maxLength={limit}
                            className="bg-neutral-900 border-neutral-800 text-white"
                          />
                          <p className="text-xs text-neutral-400 text-right">
                            {limit - characterCount} characters left
                          </p>
                        </div>
                      </form>
                    </div>

                    <DialogFooter className="border-t border-neutral-800 px-6 py-4 bg-neutral-900 rounded-b-2xl">
                      <DialogClose asChild>
                        <Button variant="outline" className="border-neutral-800 text-white hover:bg-neutral-800 bg-neutral-900">
                          Cancel
                        </Button>
                      </DialogClose>
                      <DialogClose asChild>
                        <Button 
                          type="button" 
                          onClick={handleSaveProfile}
                          disabled={updating}
                          className="bg-blue-500 hover:bg-blue-600 text-white"
                        >
                          {updating ? '저장 중...' : 'Save Changes'}
                        </Button>
                      </DialogClose>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg">
              <div className="px-3 py-2 border-b border-neutral-800">
                <h3 className="text-sm font-medium text-white">Notifications</h3>
              </div>
              <div className="divide-y divide-neutral-800">
                <div className="flex items-center justify-between px-3 py-2">
                  <div>
                    <div className="text-sm text-white mb-0.5">Sprint updates</div>
                    <div className="text-xs text-neutral-400">Get notified about sprint progress</div>
                  </div>
                  <Switch 
                    checked={formData.notifySprint ?? false}
                    onCheckedChange={(checked) => setFormData({ ...formData, notifySprint: checked })}
                  />
                </div>
                <div className="flex items-center justify-between px-3 py-2">
                  <div>
                    <div className="text-sm text-white mb-0.5">Weekly digest</div>
                    <div className="text-xs text-neutral-400">Receive weekly summary of activity</div>
                  </div>
                  <Switch 
                    checked={formData.notifyWeekly ?? false}
                    onCheckedChange={(checked) => setFormData({ ...formData, notifyWeekly: checked })}
                  />
                </div>
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
                  <Button 
                    variant="destructive" 
                    size="sm" 
                    className="h-7 text-xs px-3"
                    onClick={handleDeleteAccount}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
