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
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-white mb-1">Settings</h1>
          <p className="text-sm text-[#7d8590]">Manage your account and preferences</p>
        </div>

        {/* GitHub Integration */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg">
          <div className="p-4 border-b border-[#30363d]">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-white">GitHub Integration</h3>
              <Badge className="bg-[#238636]/10 text-[#3fb950] hover:bg-[#238636]/10 border-0">
                Connected
              </Badge>
            </div>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-3 p-3 bg-[#0d1117] rounded-md border border-[#30363d]">
              <Github className="w-10 h-10 text-white" />
              <div className="flex-1">
                <div className="text-sm font-medium text-white">johndoe</div>
                <div className="text-xs text-[#7d8590]">Connected since Jan 10, 2026</div>
              </div>
              <Button variant="outline" size="sm" className="border-[#30363d] bg-transparent text-white hover:bg-[#0d1117] h-7 text-xs">
                Disconnect
              </Button>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-medium text-[#7d8590]">Permissions</div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-[#3fb950]" />
                  <span className="text-[#7d8590]">Read repository data</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-[#3fb950]" />
                  <span className="text-[#7d8590]">Read commit history</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle className="w-4 h-4 text-[#3fb950]" />
                  <span className="text-[#7d8590]">Read branch information</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security Warning */}
        <div className="bg-[#f851491a] border border-[#f85149]/30 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-[#f85149] flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-medium text-white mb-1">Security Notice</div>
              <div className="text-xs text-[#7d8590]">
                Never commit .env files or API keys to your repositories. Use environment variables and secure secret management.
              </div>
            </div>
          </div>
        </div>

        {/* Profile */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg">
          <div className="p-4 border-b border-[#30363d]">
            <h3 className="text-sm font-medium text-white">Profile</h3>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-4">
              <Avatar className="w-16 h-16 border border-[#30363d]">
                <AvatarImage src={defaultAvatar} />
                <AvatarFallback className="bg-[#21262d] text-white">JD</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="text-sm font-medium text-white mb-1">Profile Picture</div>
                <div className="text-xs text-[#7d8590]">Synced from GitHub</div>
              </div>
            </div>

            <Separator className="bg-[#30363d]" />

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="name" className="text-xs text-[#7d8590]">Name</Label>
                <Input 
                  id="name" 
                  defaultValue="John Doe" 
                  className="bg-[#0d1117] border-[#30363d] text-white h-8 text-sm"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="username" className="text-xs text-[#7d8590]">Username</Label>
                <Input 
                  id="username" 
                  defaultValue="johndoe" 
                  className="bg-[#0d1117] border-[#30363d] text-white h-8 text-sm"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs text-[#7d8590]">Email</Label>
              <Input 
                id="email" 
                type="email" 
                defaultValue="john.doe@example.com" 
                className="bg-[#0d1117] border-[#30363d] text-white h-8 text-sm"
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" className="border-[#30363d] bg-transparent text-white hover:bg-[#0d1117] h-7 text-xs">
                Cancel
              </Button>
              <Button size="sm" className="bg-[#238636] hover:bg-[#2ea043] text-white border-0 h-7 text-xs">
                Save changes
              </Button>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg">
          <div className="p-4 border-b border-[#30363d]">
            <h3 className="text-sm font-medium text-white">Notifications</h3>
          </div>
          <div className="divide-y divide-[#30363d]">
            <div className="flex items-center justify-between p-4">
              <div>
                <div className="text-sm text-white mb-0.5">Email notifications</div>
                <div className="text-xs text-[#7d8590]">Receive email updates about your activity</div>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between p-4">
              <div>
                <div className="text-sm text-white mb-0.5">Sprint updates</div>
                <div className="text-xs text-[#7d8590]">Get notified about sprint progress</div>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between p-4">
              <div>
                <div className="text-sm text-white mb-0.5">Weekly digest</div>
                <div className="text-xs text-[#7d8590]">Receive weekly summary of activity</div>
              </div>
              <Switch />
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-[#161b22] border border-[#f85149]/30 rounded-lg">
          <div className="p-4 border-b border-[#f85149]/30">
            <h3 className="text-sm font-medium text-[#f85149]">Danger Zone</h3>
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between p-3 border border-[#f85149]/30 rounded-md">
              <div>
                <div className="text-sm font-medium text-white mb-0.5">Delete account</div>
                <div className="text-xs text-[#7d8590]">Permanently delete your account and all data</div>
              </div>
              <Button variant="destructive" size="sm" className="h-7 text-xs">
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
