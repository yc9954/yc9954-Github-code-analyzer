import React, { useState } from "react";
import { DashboardLayout } from "@/app/components/DashboardLayout";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table";
import { Badge } from "@/app/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/app/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Trophy, TrendingUp, TrendingDown, Search, Plus, GitBranch, ChevronDown, ChevronRight, Sparkles, MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Progress } from "@/app/components/ui/progress";
import defaultAvatar from "@/assets/38ba5abba51d546a081340d28143511ad0f46c8f.png";

// Mock data
const allSprints = [
  { id: 1, name: "Winter Hackathon 2026", teams: 12, startDate: "Jan 10", endDate: "Jan 16", status: "active", participants: 48 },
  { id: 2, name: "Q1 Bootcamp Sprint", teams: 8, startDate: "Jan 8", endDate: "Jan 20", status: "active", participants: 32 },
  { id: 3, name: "Code Challenge Week", teams: 15, startDate: "Jan 5", endDate: "Jan 19", status: "active", participants: 60 },
  { id: 4, name: "Summer Hackathon 2025", teams: 20, startDate: "Dec 1", endDate: "Dec 7", status: "completed", participants: 80 },
];

const leaderboardData = [
  { rank: 1, team: "Team Alpha", score: 2456, commits: 234, members: 4, change: 2 },
  { rank: 2, team: "Code Warriors", score: 2301, commits: 215, members: 5, change: -1 },
  { rank: 3, team: "Dev Squad", score: 2189, commits: 198, members: 4, change: 1 },
  { rank: 4, team: "Tech Titans", score: 1987, commits: 176, members: 3, change: 0 },
  { rank: 5, team: "Byte Busters", score: 1856, commits: 165, members: 4, change: 3 },
];

const myRepositories = [
  { id: 1, name: "web-dashboard", selected: false },
  { id: 2, name: "api-server", selected: false },
  { id: 3, name: "mobile-app", selected: false },
];

const teamMembers = [
  { name: "Alice Johnson", username: "alicej", role: "Lead", commits: 145, contribution: 28 },
  { name: "Bob Smith", username: "bobsmith", role: "Developer", commits: 123, contribution: 24 },
  { name: "Carol White", username: "carolw", role: "Developer", commits: 98, contribution: 19 },
  { name: "David Brown", username: "davidb", role: "Developer", commits: 87, contribution: 17 },
  { name: "Emma Davis", username: "emmad", role: "Designer", commits: 62, contribution: 12 },
];

const commitHistory = [
  { sha: "a1b2c3d", message: "feat: Add authentication module", time: "2 hours ago", additions: 234, deletions: 12 },
  { sha: "e4f5g6h", message: "fix: Resolve memory leak", time: "4 hours ago", additions: 45, deletions: 67 },
  { sha: "i7j8k9l", message: "docs: Update API docs", time: "6 hours ago", additions: 123, deletions: 8 },
];

export function SprintPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSprint, setSelectedSprint] = useState<number | null>(null);
  const [selectedRepos, setSelectedRepos] = useState<number[]>([]);
  const [expandedCommits, setExpandedCommits] = useState<string[]>([]);
  const [aiOpen, setAiOpen] = useState(false);

  const toggleCommit = (sha: string) => {
    setExpandedCommits(prev => 
      prev.includes(sha) ? prev.filter(s => s !== sha) : [...prev, sha]
    );
  };

  const toggleRepo = (id: number) => {
    setSelectedRepos(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const [viewMode, setViewMode] = useState<"list" | "participate" | "ranking" | "create">("list");

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-4rem)] flex flex-col bg-[#0d1117]">
        {/* Compact Header */}
        <div className="px-4 py-2.5 border-b border-[#30363d] bg-[#0d1117]">
          <div className="flex items-center justify-between">
            <h1 className="text-base font-semibold text-white">Sprints</h1>
            <div className="flex items-center gap-2">
              <Button 
                onClick={() => setViewMode("ranking")}
                variant="outline"
                className="border-[#30363d] bg-transparent text-white hover:bg-[#0d1117] h-7 text-[10px] px-2"
              >
                <Trophy className="w-3 h-3 mr-1" />
                Ranking
              </Button>
              <Button 
                onClick={() => setViewMode("create")}
                className="bg-[#238636] hover:bg-[#2ea043] text-white border-0 h-7 text-[10px] px-2"
              >
                <Plus className="w-3 h-3 mr-1" />
                Create Sprint
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">

          {/* Main Content */}
          {viewMode === "list" && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-[#7d8590]" />
                  <Input
                    placeholder="Search sprints..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-7 bg-[#0d1117] border-[#30363d] text-white h-7 text-xs"
                  />
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-28 bg-[#161b22] border-[#30363d] text-white h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#161b22] border-[#30363d]">
                    <SelectItem value="all" className="text-white text-xs">All</SelectItem>
                    <SelectItem value="active" className="text-white text-xs">Active</SelectItem>
                    <SelectItem value="completed" className="text-white text-xs">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#30363d] hover:bg-transparent">
                      <TableHead className="text-[#7d8590] font-medium text-[10px] h-7 py-1">Sprint Name</TableHead>
                      <TableHead className="text-[#7d8590] font-medium text-[10px] h-7 py-1">Period</TableHead>
                      <TableHead className="text-[#7d8590] font-medium text-right text-[10px] h-7 py-1">Teams</TableHead>
                      <TableHead className="text-[#7d8590] font-medium text-right text-[10px] h-7 py-1">Participants</TableHead>
                      <TableHead className="text-[#7d8590] font-medium text-[10px] h-7 py-1">Status</TableHead>
                      <TableHead className="text-[#7d8590] font-medium text-right text-[10px] h-7 py-1">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allSprints.map((sprint) => (
                      <TableRow key={sprint.id} className="border-[#30363d] hover:bg-[#0d1117] h-8">
                        <TableCell className="font-medium text-white text-xs py-1">{sprint.name}</TableCell>
                        <TableCell className="text-[#7d8590] text-xs py-1">{sprint.startDate} - {sprint.endDate}</TableCell>
                        <TableCell className="text-white text-right text-xs py-1">{sprint.teams}</TableCell>
                        <TableCell className="text-[#7d8590] text-right text-xs py-1">{sprint.participants}</TableCell>
                        <TableCell className="py-1">
                          <Badge className={sprint.status === 'active' ? 'bg-[#238636]/10 text-[#3fb950] border-0 text-[10px] h-3.5 px-1' : 'bg-[#7d8590]/10 text-[#7d8590] border-0 text-[10px] h-3.5 px-1'}>
                            {sprint.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right py-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 text-[10px] px-1.5 text-[#7d8590] hover:text-white"
                            onClick={() => setViewMode("participate")}
                          >
                            Participate
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {viewMode === "participate" && (
            <div className="space-y-2">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                {/* Left - Sprint Selection & Repository */}
                <div className="lg:col-span-2 space-y-2">
                  <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-2">
                    <h3 className="text-[10px] font-medium text-white mb-1.5">Select Sprint</h3>
                    <Select onValueChange={(value) => setSelectedSprint(Number(value))}>
                      <SelectTrigger className="bg-[#0d1117] border-[#30363d] text-white h-6 text-[10px]">
                        <SelectValue placeholder="Choose a sprint to participate" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#161b22] border-[#30363d]">
                        {allSprints.filter(s => s.status === 'active').map((sprint) => (
                          <SelectItem key={sprint.id} value={String(sprint.id)} className="text-white text-[10px]">
                            {sprint.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-2">
                    <h3 className="text-[10px] font-medium text-white mb-1.5">Register Repositories</h3>
                    <div className="space-y-1 mb-2">
                      {myRepositories.map((repo) => (
                        <div
                          key={repo.id}
                          onClick={() => toggleRepo(repo.id)}
                          className={`flex items-center justify-between p-1.5 border rounded cursor-pointer transition-colors ${
                            selectedRepos.includes(repo.id)
                              ? 'border-[#7aa2f7] bg-[#7aa2f7]/5'
                              : 'border-[#30363d] hover:bg-[#0d1117]'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <GitBranch className="w-2.5 h-2.5 text-[#7d8590]" />
                            <span className="text-[10px] text-white">{repo.name}</span>
                          </div>
                          {selectedRepos.includes(repo.id) && (
                            <Badge className="bg-[#238636]/10 text-[#3fb950] border-0 text-[9px] h-3 px-1">
                              Selected
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                    <Button className="w-full bg-[#238636] hover:bg-[#2ea043] text-white border-0 h-6 text-[10px]">
                      Register for Sprint
                    </Button>
                  </div>

                  {/* Team Members */}
                  <div className="bg-[#161b22] border border-[#30363d] rounded-lg">
                    <div className="px-3 py-2 border-b border-[#30363d]">
                      <h3 className="text-[10px] font-medium text-white">Team Members</h3>
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
                </div>
              </div>
            </div>
          )}

          {viewMode === "ranking" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white">Sprint Rankings</h2>
                <Button 
                  variant="ghost"
                  onClick={() => setViewMode("list")}
                  className="text-[#7d8590] hover:text-white h-6 text-[10px] px-2"
                >
                  ← Back
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Select defaultValue="1">
                  <SelectTrigger className="w-64 bg-[#161b22] border-[#30363d] text-white h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#161b22] border-[#30363d]">
                    {allSprints.map((sprint) => (
                      <SelectItem key={sprint.id} value={String(sprint.id)} className="text-white text-xs">
                        {sprint.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="bg-[#161b22] border border-[#30363d] rounded-lg">
                <div className="px-3 py-2 border-b border-[#30363d]">
                  <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-medium text-white">Leaderboard</h3>
                    <span className="text-[10px] text-[#7d8590]">Updated 5 min ago</span>
                  </div>
                </div>
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#30363d] hover:bg-transparent">
                      <TableHead className="text-[#7d8590] font-medium text-[10px] h-7 py-1 w-12">Rank</TableHead>
                      <TableHead className="text-[#7d8590] font-medium text-[10px] h-7 py-1">Team</TableHead>
                      <TableHead className="text-[#7d8590] font-medium text-right text-[10px] h-7 py-1">Score</TableHead>
                      <TableHead className="text-[#7d8590] font-medium text-right text-[10px] h-7 py-1">Commits</TableHead>
                      <TableHead className="text-[#7d8590] font-medium text-right text-[10px] h-7 py-1">Members</TableHead>
                      <TableHead className="text-[#7d8590] font-medium text-right text-[10px] h-7 py-1">Change</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {leaderboardData.map((team) => (
                      <TableRow key={team.rank} className="border-[#30363d] hover:bg-[#0d1117] cursor-pointer h-8">
                        <TableCell className="font-medium text-white text-xs py-1">
                          <div className="flex items-center gap-1">
                            {team.rank <= 3 && <Trophy className="w-2.5 h-2.5 text-[#f0883e]" />}
                            <span>#{team.rank}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-white text-xs py-1">{team.team}</TableCell>
                        <TableCell className="text-white text-right text-xs py-1">{team.score.toLocaleString()}</TableCell>
                        <TableCell className="text-[#7d8590] text-right text-xs py-1">{team.commits}</TableCell>
                        <TableCell className="text-[#7d8590] text-right text-xs py-1">{team.members}</TableCell>
                        <TableCell className="text-right py-1">
                          {team.change > 0 ? (
                            <div className="flex items-center justify-end gap-0.5 text-[#3fb950]">
                              <TrendingUp className="w-2.5 h-2.5" />
                              <span className="text-[10px]">+{team.change}</span>
                            </div>
                          ) : team.change < 0 ? (
                            <div className="flex items-center justify-end gap-0.5 text-[#f85149]">
                              <TrendingDown className="w-2.5 h-2.5" />
                              <span className="text-[10px]">{team.change}</span>
                            </div>
                          ) : (
                            <span className="text-[10px] text-[#7d8590]">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {viewMode === "create" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white">Create New Sprint</h2>
                <Button 
                  variant="ghost"
                  onClick={() => setViewMode("list")}
                  className="text-[#7d8590] hover:text-white h-6 text-[10px] px-2"
                >
                  ← Back
                </Button>
              </div>
              <div className="max-w-2xl">
                <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-3">
                  <h3 className="text-[10px] font-medium text-white mb-2">Create New Sprint</h3>
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <Label htmlFor="sprint-name" className="text-[10px] text-[#7d8590]">Sprint Name</Label>
                      <Input
                        id="sprint-name"
                        placeholder="e.g., Winter Hackathon 2026"
                        className="bg-[#0d1117] border-[#30363d] text-white h-7 text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <Label htmlFor="start-date" className="text-[10px] text-[#7d8590]">Start Date</Label>
                        <Input
                          id="start-date"
                          type="date"
                          className="bg-[#0d1117] border-[#30363d] text-white h-7 text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="end-date" className="text-[10px] text-[#7d8590]">End Date</Label>
                        <Input
                          id="end-date"
                          type="date"
                          className="bg-[#0d1117] border-[#30363d] text-white h-7 text-xs"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="description" className="text-[10px] text-[#7d8590]">Description</Label>
                      <textarea
                        id="description"
                        rows={3}
                        placeholder="Describe your sprint..."
                        className="w-full bg-[#0d1117] border border-[#30363d] rounded px-2 py-1.5 text-xs text-white placeholder:text-[#7d8590]"
                      />
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" className="border-[#30363d] bg-transparent text-white hover:bg-[#0d1117] h-6 text-[10px] px-2">
                        Cancel
                      </Button>
                      <Button className="bg-[#238636] hover:bg-[#2ea043] text-white border-0 h-6 text-[10px] px-2">
                        Create Sprint
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}