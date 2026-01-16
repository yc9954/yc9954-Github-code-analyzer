import { DashboardLayout } from "@/app/components/DashboardLayout";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Switch } from "@/app/components/ui/switch";
import { Separator } from "@/app/components/ui/separator";
import { Github, AlertTriangle, CheckCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Badge } from "@/app/components/ui/badge";
import defaultAvatar from "@/assets/38ba5abba51d546a081340d28143511ad0f46c8f.png";

export function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-4rem)] flex flex-col bg-[#0d1117]">
        {/* Compact Header */}
        <div className="px-4 py-2.5 border-b border-[#30363d] bg-[#0d1117]">
          <h1 className="text-base font-semibold text-white">Settings</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">

          {/* GitHub Integration */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg">
            <div className="px-3 py-2 border-b border-[#30363d]">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-medium text-white">GitHub Integration</h3>
                <Badge className="bg-[#238636]/10 text-[#3fb950] hover:bg-[#238636]/10 border-0 text-[10px] h-4 px-1.5">
                  Connected
                </Badge>
              </div>
            </div>
            <div className="p-3 space-y-2">
              <div className="flex items-center gap-2 p-2 bg-[#0d1117] rounded-md border border-[#30363d]">
                <Github className="w-6 h-6 text-white" />
                <div className="flex-1">
                  <div className="text-xs font-medium text-white">johndoe</div>
                  <div className="text-[10px] text-[#7d8590]">Connected since Jan 10, 2026</div>
                </div>
                <Button variant="outline" size="sm" className="border-[#30363d] bg-transparent text-white hover:bg-[#0d1117] h-6 text-[10px] px-2">
                  Disconnect
                </Button>
              </div>

              <div className="space-y-1.5">
                <div className="text-[10px] font-medium text-[#7d8590]">Permissions</div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs">
                    <CheckCircle className="w-3 h-3 text-[#3fb950]" />
                    <span className="text-[#7d8590]">Read repository data</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <CheckCircle className="w-3 h-3 text-[#3fb950]" />
                    <span className="text-[#7d8590]">Read commit history</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs">
                    <CheckCircle className="w-3 h-3 text-[#3fb950]" />
                    <span className="text-[#7d8590]">Read branch information</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Security Warning */}
          <div className="bg-[#f851491a] border border-[#f85149]/30 rounded-lg p-2.5">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-[#f85149] flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-medium text-white mb-0.5">Security Notice</div>
                <div className="text-[10px] text-[#7d8590]">
                  Never commit .env files or API keys to your repositories. Use environment variables and secure secret management.
                </div>
              </div>
            </div>
          </div>

          {/* Profile */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg">
            <div className="px-3 py-2 border-b border-[#30363d]">
              <h3 className="text-xs font-medium text-white">Profile</h3>
            </div>
            <div className="p-3 space-y-2">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10 border border-[#30363d]">
                  <AvatarImage src={defaultAvatar} />
                  <AvatarFallback className="bg-[#21262d] text-white text-xs">JD</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="text-xs font-medium text-white mb-0.5">Profile Picture</div>
                  <div className="text-[10px] text-[#7d8590]">Synced from GitHub</div>
                </div>
              </div>

              <Separator className="bg-[#30363d]" />

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <Label htmlFor="name" className="text-[10px] text-[#7d8590]">Name</Label>
                  <Input 
                    id="name" 
                    defaultValue="John Doe" 
                    className="bg-[#0d1117] border-[#30363d] text-white h-7 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="username" className="text-[10px] text-[#7d8590]">Username</Label>
                  <Input 
                    id="username" 
                    defaultValue="johndoe" 
                    className="bg-[#0d1117] border-[#30363d] text-white h-7 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="email" className="text-[10px] text-[#7d8590]">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  defaultValue="john.doe@example.com" 
                  className="bg-[#0d1117] border-[#30363d] text-white h-7 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" size="sm" className="border-[#30363d] bg-transparent text-white hover:bg-[#0d1117] h-6 text-[10px] px-2">
                  Cancel
                </Button>
                <Button size="sm" className="bg-[#238636] hover:bg-[#2ea043] text-white border-0 h-6 text-[10px] px-2">
                  Save changes
                </Button>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg">
            <div className="px-3 py-2 border-b border-[#30363d]">
              <h3 className="text-xs font-medium text-white">Notifications</h3>
            </div>
            <div className="divide-y divide-[#30363d]">
              <div className="flex items-center justify-between px-3 py-2">
                <div>
                  <div className="text-xs text-white mb-0.5">Email notifications</div>
                  <div className="text-[10px] text-[#7d8590]">Receive email updates about your activity</div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between px-3 py-2">
                <div>
                  <div className="text-xs text-white mb-0.5">Sprint updates</div>
                  <div className="text-[10px] text-[#7d8590]">Get notified about sprint progress</div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between px-3 py-2">
                <div>
                  <div className="text-xs text-white mb-0.5">Weekly digest</div>
                  <div className="text-[10px] text-[#7d8590]">Receive weekly summary of activity</div>
                </div>
                <Switch />
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-[#161b22] border border-[#f85149]/30 rounded-lg">
            <div className="px-3 py-2 border-b border-[#f85149]/30">
              <h3 className="text-xs font-medium text-[#f85149]">Danger Zone</h3>
            </div>
            <div className="p-3">
              <div className="flex items-center justify-between p-2 border border-[#f85149]/30 rounded-md">
                <div>
                  <div className="text-xs font-medium text-white mb-0.5">Delete account</div>
                  <div className="text-[10px] text-[#7d8590]">Permanently delete your account and all data</div>
                </div>
                <Button variant="destructive" size="sm" className="h-6 text-[10px] px-2">
                  Delete
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
