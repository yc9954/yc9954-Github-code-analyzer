"use client";

import { useId } from "react";
import { DashboardLayout } from "@/app/components/DashboardLayout";
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
  const maxLength = 180;
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

  const profileImage = previewUrl || defaultAvatar;

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
                    <AvatarFallback className="bg-neutral-800 text-white text-sm">JD</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white mb-0.5">Profile Picture</div>
                    <div className="text-xs text-neutral-400">Synced from GitHub</div>
                  </div>
                </div>

                <Separator className="bg-neutral-800" />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-neutral-400 mb-1">Full Name</div>
                    <div className="text-sm text-white">John Doe</div>
                  </div>
                  <div>
                    <div className="text-xs text-neutral-400 mb-1">Role</div>
                    <div className="text-sm text-white">Web Developer</div>
                  </div>
                  <div>
                    <div className="text-xs text-neutral-400 mb-1">Email</div>
                    <div className="text-sm text-white">john.doe@example.com</div>
                  </div>
                  <div>
                    <div className="text-xs text-neutral-400 mb-1">Location</div>
                    <div className="text-sm text-white">San Francisco, USA</div>
                  </div>
                  <div>
                    <div className="text-xs text-neutral-400 mb-1">Company</div>
                    <div className="text-sm text-white">DevAnalytics</div>
                  </div>
                  <div>
                    <div className="text-xs text-neutral-400 mb-1">GitHub</div>
                    <div className="text-sm text-white">github.com/johndoe</div>
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
                            <Label htmlFor={`${id}-name`} className="text-white">Full Name</Label>
                            <Input 
                              id={`${id}-name`} 
                              placeholder="E.g. John Doe" 
                              defaultValue="John Doe"
                              className="bg-neutral-900 border-neutral-800 text-white"
                            />
                          </div>
                          <div className="flex-1 space-y-1.5">
                            <Label htmlFor={`${id}-role`} className="text-white">Role</Label>
                            <Input 
                              id={`${id}-role`} 
                              placeholder="Frontend Developer" 
                              defaultValue="Web Developer"
                              className="bg-neutral-900 border-neutral-800 text-white"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                          <div className="flex-1 space-y-1.5">
                            <Label htmlFor={`${id}-email`} className="text-white">Email</Label>
                            <Input 
                              id={`${id}-email`} 
                              type="email" 
                              defaultValue="john.doe@example.com"
                              className="bg-neutral-900 border-neutral-800 text-white"
                            />
                          </div>
                          <div className="flex-1 space-y-1.5">
                            <Label htmlFor={`${id}-portfolio`} className="text-white">Portfolio</Label>
                            <Input 
                              id={`${id}-portfolio`} 
                              defaultValue="https://johndoe.com"
                              className="bg-neutral-900 border-neutral-800 text-white"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                          <div className="flex-1 space-y-1.5">
                            <Label htmlFor={`${id}-location`} className="text-white">Location</Label>
                            <Input 
                              id={`${id}-location`} 
                              defaultValue="San Francisco, USA"
                              className="bg-neutral-900 border-neutral-800 text-white"
                            />
                          </div>
                          <div className="flex-1 space-y-1.5">
                            <Label htmlFor={`${id}-company`} className="text-white">Company</Label>
                            <Input 
                              id={`${id}-company`} 
                              defaultValue="DevAnalytics"
                              className="bg-neutral-900 border-neutral-800 text-white"
                            />
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4">
                          <div className="flex-1 space-y-1.5">
                            <Label htmlFor={`${id}-github`} className="text-white">GitHub</Label>
                            <Input 
                              id={`${id}-github`} 
                              placeholder="https://github.com/username"
                              defaultValue="https://github.com/johndoe"
                              className="bg-neutral-900 border-neutral-800 text-white"
                            />
                          </div>
                          <div className="flex-1 space-y-1.5">
                            <Label htmlFor={`${id}-linkedin`} className="text-white">LinkedIn</Label>
                            <Input 
                              id={`${id}-linkedin`} 
                              placeholder="https://linkedin.com/in/username"
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
                        <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white">
                          Save Changes
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
                    <div className="text-sm text-white mb-0.5">Email notifications</div>
                    <div className="text-xs text-neutral-400">Receive email updates about your activity</div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between px-3 py-2">
                  <div>
                    <div className="text-sm text-white mb-0.5">Sprint updates</div>
                    <div className="text-xs text-neutral-400">Get notified about sprint progress</div>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between px-3 py-2">
                  <div>
                    <div className="text-sm text-white mb-0.5">Weekly digest</div>
                    <div className="text-xs text-neutral-400">Receive weekly summary of activity</div>
                  </div>
                  <Switch />
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
                  <Button variant="destructive" size="sm" className="h-7 text-xs px-3">
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
