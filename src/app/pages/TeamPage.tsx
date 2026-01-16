import { DashboardLayout } from "@/app/components/DashboardLayout";
import { Button } from "@/app/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table";
import { GitBranch } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Progress } from "@/app/components/ui/progress";
import defaultAvatar from "@/assets/38ba5abba51d546a081340d28143511ad0f46c8f.png";

const teamMembers = [
  { name: "Alice Johnson", username: "alicej", role: "Lead", commits: 145, contribution: 28 },
  { name: "Bob Smith", username: "bobsmith", role: "Developer", commits: 123, contribution: 24 },
  { name: "Carol White", username: "carolw", role: "Developer", commits: 98, contribution: 19 },
  { name: "David Brown", username: "davidb", role: "Developer", commits: 87, contribution: 17 },
  { name: "Emma Davis", username: "emmad", role: "Designer", commits: 62, contribution: 12 },
];

const repositories = [
  { name: "team-dashboard", commits: 234, language: "TypeScript", updated: "2 hours ago" },
  { name: "api-service", commits: 156, language: "Python", updated: "5 hours ago" },
  { name: "mobile-client", commits: 125, language: "JavaScript", updated: "1 day ago" },
];

export function TeamPage() {
  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white mb-1">Team</h1>
            <p className="text-sm text-[#7d8590]">Manage members and repositories</p>
          </div>
          <Button className="bg-[#238636] hover:bg-[#2ea043] text-white border-0 text-sm h-8">
            Invite member
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
            <div className="text-xs text-[#7d8590] mb-1">Team Members</div>
            <div className="text-2xl font-semibold text-white">5</div>
          </div>
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
            <div className="text-xs text-[#7d8590] mb-1">Total Commits</div>
            <div className="text-2xl font-semibold text-white">515</div>
          </div>
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-4">
            <div className="text-xs text-[#7d8590] mb-1">Repositories</div>
            <div className="text-2xl font-semibold text-white">3</div>
          </div>
        </div>

        {/* Team Members */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg">
          <div className="p-4 border-b border-[#30363d]">
            <h3 className="text-sm font-medium text-white">Members</h3>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="border-[#30363d] hover:bg-transparent">
                <TableHead className="text-[#7d8590] font-medium">Member</TableHead>
                <TableHead className="text-[#7d8590] font-medium">Role</TableHead>
                <TableHead className="text-[#7d8590] font-medium text-right">Commits</TableHead>
                <TableHead className="text-[#7d8590] font-medium">Contribution</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamMembers.map((member) => (
                <TableRow key={member.username} className="border-[#30363d] hover:bg-[#0d1117]">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-7 h-7 border border-[#30363d]">
                        <AvatarImage src={defaultAvatar} />
                        <AvatarFallback className="bg-[#21262d] text-white text-xs">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium text-white">{member.name}</div>
                        <div className="text-xs text-[#7d8590]">@{member.username}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-[#7d8590]">{member.role}</TableCell>
                  <TableCell className="text-sm text-white text-right">{member.commits}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress value={member.contribution} className="flex-1 h-1.5" />
                      <span className="text-xs text-[#7d8590] min-w-[40px]">{member.contribution}%</span>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Repositories */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-lg">
          <div className="p-4 border-b border-[#30363d]">
            <h3 className="text-sm font-medium text-white">Connected Repositories</h3>
          </div>
          <div className="divide-y divide-[#30363d]">
            {repositories.map((repo) => (
              <div key={repo.name} className="p-4 hover:bg-[#0d1117] transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <GitBranch className="w-4 h-4 text-[#7d8590]" />
                    <div>
                      <div className="text-sm font-medium text-white">{repo.name}</div>
                      <div className="text-xs text-[#7d8590]">
                        {repo.commits} commits · {repo.language} · Updated {repo.updated}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
