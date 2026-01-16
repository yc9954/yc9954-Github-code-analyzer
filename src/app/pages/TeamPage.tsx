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
      <div className="h-[calc(100vh-4rem)] flex flex-col bg-[#0d1117]">
        {/* Compact Header */}
        <div className="px-4 py-2.5 border-b border-[#30363d] bg-[#0d1117]">
          <div className="flex items-center justify-between">
            <h1 className="text-base font-semibold text-white">Team</h1>
            <Button className="bg-[#238636] hover:bg-[#2ea043] text-white border-0 text-xs h-7 px-3">
              Invite member
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {/* Stats */}
          <div className="grid grid-cols-3 gap-2">
            <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-2">
              <div className="text-[10px] text-[#7d8590] mb-0.5">Team Members</div>
              <div className="text-base font-semibold text-white">5</div>
            </div>
            <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-2">
              <div className="text-[10px] text-[#7d8590] mb-0.5">Total Commits</div>
              <div className="text-base font-semibold text-white">515</div>
            </div>
            <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-2">
              <div className="text-[10px] text-[#7d8590] mb-0.5">Repositories</div>
              <div className="text-base font-semibold text-white">3</div>
            </div>
          </div>

          {/* Team Members */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg">
            <div className="px-3 py-2 border-b border-[#30363d]">
              <h3 className="text-xs font-medium text-white">Members</h3>
            </div>
            <Table>
              <TableHeader>
                <TableRow className="border-[#30363d] hover:bg-transparent">
                  <TableHead className="text-[#7d8590] font-medium text-[10px] h-7 py-1">Member</TableHead>
                  <TableHead className="text-[#7d8590] font-medium text-[10px] h-7 py-1">Role</TableHead>
                  <TableHead className="text-[#7d8590] font-medium text-[10px] text-right h-7 py-1">Commits</TableHead>
                  <TableHead className="text-[#7d8590] font-medium text-[10px] h-7 py-1">Contribution</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teamMembers.map((member) => (
                  <TableRow key={member.username} className="border-[#30363d] hover:bg-[#0d1117] h-8">
                    <TableCell className="py-1">
                      <div className="flex items-center gap-2">
                        <Avatar className="w-5 h-5 border border-[#30363d]">
                          <AvatarImage src={defaultAvatar} />
                          <AvatarFallback className="bg-[#21262d] text-white text-[10px]">
                            {member.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-xs font-medium text-white">{member.name}</div>
                          <div className="text-[10px] text-[#7d8590]">@{member.username}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-[#7d8590] py-1">{member.role}</TableCell>
                    <TableCell className="text-xs text-white text-right py-1">{member.commits}</TableCell>
                    <TableCell className="py-1">
                      <div className="flex items-center gap-1.5">
                        <Progress value={member.contribution} className="flex-1 h-1" />
                        <span className="text-[10px] text-[#7d8590] min-w-[35px]">{member.contribution}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Repositories */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg">
            <div className="px-3 py-2 border-b border-[#30363d]">
              <h3 className="text-xs font-medium text-white">Connected Repositories</h3>
            </div>
            <div className="divide-y divide-[#30363d]">
              {repositories.map((repo) => (
                <div key={repo.name} className="px-3 py-2 hover:bg-[#0d1117] transition-colors cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GitBranch className="w-3 h-3 text-[#7d8590]" />
                      <div>
                        <div className="text-xs font-medium text-white">{repo.name}</div>
                        <div className="text-[10px] text-[#7d8590]">
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
      </div>
    </DashboardLayout>
  );
}
