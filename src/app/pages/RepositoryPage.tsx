import { useState } from "react";
import { DashboardLayout } from "@/app/components/DashboardLayout";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { GitBranch, GitCommit, Clock, CheckCircle, AlertCircle, Star } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table";
import { Badge } from "@/app/components/ui/badge";
import { Progress } from "@/app/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import githubAvatar from "@/assets/38ba5abba51d546a081340d28143511ad0f46c8f.png";

const repositories = [
  { id: "1", name: "web-dashboard", stars: 234, forks: 45 },
  { id: "2", name: "api-server", stars: 156, forks: 32 },
  { id: "3", name: "mobile-app", stars: 289, forks: 67 },
];

const languageData = [
  { name: "TypeScript", percentage: 52, color: "#3178c6" },
  { name: "JavaScript", percentage: 23, color: "#f7df1e" },
  { name: "Python", percentage: 15, color: "#3776ab" },
  { name: "CSS", percentage: 7, color: "#1572b6" },
  { name: "Other", percentage: 3, color: "#7d8590" },
];

const qualityMetrics = [
  { name: "Maintainability", score: 88 },
  { name: "Complexity", score: 72 },
  { name: "Duplication", score: 85 },
  { name: "Coverage", score: 63 },
];

const branches = [
  { name: "main", commits: 234, lastCommit: "2h ago", author: "johndoe", status: "active", ahead: 0, behind: 0 },
  { name: "develop", commits: 156, lastCommit: "5h ago", author: "janedoe", status: "active", ahead: 12, behind: 0 },
  { name: "feature/auth", commits: 45, lastCommit: "1d ago", author: "bobsmith", status: "stale", ahead: 8, behind: 15 },
  { name: "fix/performance", commits: 12, lastCommit: "2d ago", author: "alice", status: "stale", ahead: 3, behind: 23 },
  { name: "feature/ui-redesign", commits: 28, lastCommit: "3d ago", author: "carol", status: "active", ahead: 5, behind: 8 },
  { name: "hotfix/login-bug", commits: 6, lastCommit: "4d ago", author: "dave", status: "merged", ahead: 0, behind: 0 },
];

const contributors = [
  { name: "johndoe", commits: 145, additions: 12453, deletions: 3421, avatar: "johndoe" },
  { name: "janedoe", commits: 123, additions: 9876, deletions: 2134, avatar: "janedoe" },
  { name: "bobsmith", commits: 98, additions: 7654, deletions: 1987, avatar: "bobsmith" },
  { name: "alice", commits: 87, additions: 6543, deletions: 1654, avatar: "alice" },
  { name: "carol", commits: 76, additions: 5432, deletions: 1543, avatar: "carol" },
  { name: "dave", commits: 64, additions: 4321, deletions: 1234, avatar: "dave" },
];

const recentActivity = [
  { type: "commit", message: "Fix authentication bug", author: "johndoe", time: "15m ago" },
  { type: "pr", message: "Add new dashboard features", author: "janedoe", time: "1h ago" },
  { type: "commit", message: "Update dependencies", author: "bobsmith", time: "2h ago" },
  { type: "issue", message: "Performance improvements needed", author: "alice", time: "3h ago" },
  { type: "commit", message: "Refactor API endpoints", author: "carol", time: "4h ago" },
];

export function RepositoryPage() {
  const [selectedRepo, setSelectedRepo] = useState("web-dashboard");

  return (
    <DashboardLayout>
      <div className="p-4 space-y-3">
        {/* Compact Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-white">Repository Analysis</h1>
          <Select value={selectedRepo} onValueChange={setSelectedRepo}>
            <SelectTrigger className="w-48 bg-[#161b22] border-[#30363d] text-white h-8 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-[#161b22] border-[#30363d]">
              {repositories.map((repo) => (
                <SelectItem key={repo.id} value={repo.name} className="text-white text-sm">
                  {repo.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Ultra Compact Stats Row */}
        <div className="grid grid-cols-6 gap-2">
          <div className="bg-[#161b22] border border-[#30363d] rounded p-2">
            <div className="text-xs text-[#7d8590] mb-0.5">Commits</div>
            <div className="text-lg font-semibold text-white">1,247</div>
          </div>
          <div className="bg-[#161b22] border border-[#30363d] rounded p-2">
            <div className="text-xs text-[#7d8590] mb-0.5">Contributors</div>
            <div className="text-lg font-semibold text-white">8</div>
          </div>
          <div className="bg-[#161b22] border border-[#30363d] rounded p-2">
            <div className="text-xs text-[#7d8590] mb-0.5">Branches</div>
            <div className="text-lg font-semibold text-white">12</div>
          </div>
          <div className="bg-[#161b22] border border-[#30363d] rounded p-2">
            <div className="text-xs text-[#7d8590] mb-0.5">Size</div>
            <div className="text-lg font-semibold text-white">12.4 MB</div>
          </div>
          <div className="bg-[#161b22] border border-[#30363d] rounded p-2">
            <div className="text-xs text-[#7d8590] mb-0.5">Stars</div>
            <div className="text-lg font-semibold text-white">234</div>
          </div>
          <div className="bg-[#161b22] border border-[#30363d] rounded p-2">
            <div className="text-xs text-[#7d8590] mb-0.5">Quality</div>
            <div className="text-lg font-semibold text-white">8.2/10</div>
          </div>
        </div>

        {/* Dense Two-Column Layout */}
        <div className="grid grid-cols-12 gap-3">
          {/* Left Column - Full Height Tables */}
          <div className="col-span-8 space-y-3">
            {/* Branches Table - More Rows */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-lg">
              <div className="px-3 py-2 border-b border-[#30363d] flex items-center justify-between">
                <h3 className="text-sm font-medium text-white">Branches</h3>
                <span className="text-xs text-[#7d8590]">{branches.length} total</span>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="border-[#30363d] hover:bg-transparent">
                    <TableHead className="text-[#7d8590] font-medium text-xs h-8 py-1">Branch</TableHead>
                    <TableHead className="text-[#7d8590] font-medium text-xs text-right h-8 py-1">Commits</TableHead>
                    <TableHead className="text-[#7d8590] font-medium text-xs text-center h-8 py-1">Status</TableHead>
                    <TableHead className="text-[#7d8590] font-medium text-xs h-8 py-1">Author</TableHead>
                    <TableHead className="text-[#7d8590] font-medium text-xs h-8 py-1">Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {branches.map((branch) => (
                    <TableRow key={branch.name} className="border-[#30363d] hover:bg-[#0d1117] h-9">
                      <TableCell className="py-1.5">
                        <div className="flex items-center gap-1.5">
                          <GitBranch className="w-3.5 h-3.5 text-[#7d8590]" />
                          <span className="text-sm text-white">{branch.name}</span>
                          {branch.ahead > 0 && (
                            <Badge className="bg-transparent border border-[#30363d] text-[#7d8590] h-4 text-xs px-1.5">
                              +{branch.ahead}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-[#7d8590] text-right py-1.5">{branch.commits}</TableCell>
                      <TableCell className="py-1.5 text-center">
                        {branch.status === 'active' ? (
                          <CheckCircle className="w-3.5 h-3.5 text-[#3fb950] mx-auto" />
                        ) : branch.status === 'merged' ? (
                          <GitCommit className="w-3.5 h-3.5 text-[#7d8590] mx-auto" />
                        ) : (
                          <AlertCircle className="w-3.5 h-3.5 text-[#f0883e] mx-auto" />
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-[#7d8590] py-1.5">{branch.author}</TableCell>
                      <TableCell className="text-xs text-[#7d8590] py-1.5">{branch.lastCommit}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Contributors Table - More Rows */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-lg">
              <div className="px-3 py-2 border-b border-[#30363d] flex items-center justify-between">
                <h3 className="text-sm font-medium text-white">Contributors</h3>
                <span className="text-xs text-[#7d8590]">{contributors.length} members</span>
              </div>
              <Table>
                <TableHeader>
                  <TableRow className="border-[#30363d] hover:bg-transparent">
                    <TableHead className="text-[#7d8590] font-medium text-xs h-8 py-1">User</TableHead>
                    <TableHead className="text-[#7d8590] font-medium text-xs text-right h-8 py-1">Commits</TableHead>
                    <TableHead className="text-[#7d8590] font-medium text-xs text-right h-8 py-1">Additions</TableHead>
                    <TableHead className="text-[#7d8590] font-medium text-xs text-right h-8 py-1">Deletions</TableHead>
                    <TableHead className="text-[#7d8590] font-medium text-xs text-right h-8 py-1">Net</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contributors.map((contributor, idx) => (
                    <TableRow key={contributor.name} className="border-[#30363d] hover:bg-[#0d1117] h-9">
                      <TableCell className="py-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-[#7d8590] w-4">#{idx + 1}</span>
                          <Avatar className="w-5 h-5 border border-[#30363d]">
                            <AvatarImage src={githubAvatar} />
                            <AvatarFallback className="bg-[#21262d] text-white text-[9px]">
                              {contributor.name.substring(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm text-white">{contributor.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-white text-right py-1.5 font-medium">{contributor.commits}</TableCell>
                      <TableCell className="text-sm text-[#3fb950] text-right py-1.5">+{contributor.additions.toLocaleString()}</TableCell>
                      <TableCell className="text-sm text-[#f85149] text-right py-1.5">-{contributor.deletions.toLocaleString()}</TableCell>
                      <TableCell className="text-sm text-[#7d8590] text-right py-1.5">
                        +{(contributor.additions - contributor.deletions).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Right Column - Compact Widgets */}
          <div className="col-span-4 space-y-3">
            {/* Languages - Compact */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-lg">
              <div className="px-3 py-2 border-b border-[#30363d]">
                <h3 className="text-sm font-medium text-white">Languages</h3>
              </div>
              <div className="p-2.5 space-y-2">
                {languageData.map((lang) => (
                  <div key={lang.name} className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: lang.color }}></div>
                    <span className="text-sm text-white flex-1 min-w-0 truncate">{lang.name}</span>
                    <span className="text-sm text-[#7d8590] tabular-nums">{lang.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quality Metrics - Horizontal Bars */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-lg">
              <div className="px-3 py-2 border-b border-[#30363d]">
                <h3 className="text-sm font-medium text-white">Code Quality</h3>
              </div>
              <div className="p-2.5 space-y-2">
                {qualityMetrics.map((metric) => (
                  <div key={metric.name} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-[#7d8590]">{metric.name}</span>
                      <span className="text-xs text-white font-medium">{metric.score}</span>
                    </div>
                    <div className="w-full bg-[#21262d] rounded-full h-1.5">
                      <div 
                        className="bg-[#7aa2f7] h-1.5 rounded-full" 
                        style={{ width: `${metric.score}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-lg">
              <div className="px-3 py-2 border-b border-[#30363d]">
                <h3 className="text-sm font-medium text-white">Recent Activity</h3>
              </div>
              <div className="divide-y divide-[#30363d]">
                {recentActivity.map((activity, idx) => (
                  <div key={idx} className="px-3 py-2 hover:bg-[#0d1117]">
                    <div className="flex items-start gap-2">
                      <GitCommit className="w-3.5 h-3.5 text-[#7d8590] mt-0.5 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-white truncate">{activity.message}</div>
                        <div className="text-xs text-[#7d8590] mt-0.5">
                          {activity.author} · {activity.time}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}