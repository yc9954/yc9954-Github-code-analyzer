import { DashboardLayout } from "@/app/components/DashboardLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table";
import { Trophy } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import defaultAvatar from "@/assets/38ba5abba51d546a081340d28143511ad0f46c8f.png";

const individualRanking = [
  { rank: 1, name: "Alice Johnson", username: "alicej", commits: 342, score: 92 },
  { rank: 2, name: "Bob Smith", username: "bobsmith", commits: 298, score: 89 },
  { rank: 3, name: "Carol White", username: "carolw", commits: 276, score: 87 },
  { rank: 4, name: "David Brown", username: "davidb", commits: 245, score: 83 },
  { rank: 5, name: "Emma Davis", username: "emmad", commits: 231, score: 81 },
  { rank: 6, name: "Frank Wilson", username: "frankw", commits: 212, score: 79 },
  { rank: 7, name: "Grace Lee", username: "gracee", commits: 198, score: 76 },
  { rank: 8, name: "Henry Chen", username: "henryc", commits: 187, score: 74 },
];

const teamRanking = [
  { rank: 1, name: "Team Alpha", members: 4, commits: 892, score: 95 },
  { rank: 2, name: "Code Warriors", members: 5, commits: 845, score: 92 },
  { rank: 3, name: "Dev Squad", members: 4, commits: 789, score: 89 },
  { rank: 4, name: "Tech Titans", members: 3, commits: 723, score: 85 },
  { rank: 5, name: "Byte Busters", members: 4, commits: 698, score: 83 },
];

export function RankingPage() {
  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white mb-1">Rankings</h1>
            <p className="text-sm text-[#7d8590]">Performance leaderboards</p>
          </div>
          <div className="flex gap-2">
            <Select defaultValue="all">
              <SelectTrigger className="w-32 bg-[#161b22] border-[#30363d] text-white h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#161b22] border-[#30363d]">
                <SelectItem value="all" className="text-white focus:bg-[#0d1117]">All Time</SelectItem>
                <SelectItem value="month" className="text-white focus:bg-[#0d1117]">This Month</SelectItem>
                <SelectItem value="week" className="text-white focus:bg-[#0d1117]">This Week</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="individual">
          <TabsList className="bg-[#161b22] border-b border-[#30363d] w-full justify-start rounded-none p-0 h-auto">
            <TabsTrigger value="individual" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-[#f78166] data-[state=active]:text-white text-[#7d8590] rounded-none px-4 py-2 text-sm">
              Individual
            </TabsTrigger>
            <TabsTrigger value="team" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-[#f78166] data-[state=active]:text-white text-[#7d8590] rounded-none px-4 py-2 text-sm">
              Team
            </TabsTrigger>
          </TabsList>

          {/* Individual Ranking */}
          <TabsContent value="individual" className="mt-6">
            <div className="bg-[#161b22] border border-[#30363d] rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#30363d] hover:bg-transparent">
                    <TableHead className="text-[#7d8590] font-medium w-16">Rank</TableHead>
                    <TableHead className="text-[#7d8590] font-medium">Developer</TableHead>
                    <TableHead className="text-[#7d8590] font-medium text-right">Score</TableHead>
                    <TableHead className="text-[#7d8590] font-medium text-right">Commits</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {individualRanking.map((person) => (
                    <TableRow 
                      key={person.rank} 
                      className="border-[#30363d] hover:bg-[#0d1117] cursor-pointer"
                    >
                      <TableCell className="font-medium text-white">
                        <div className="flex items-center gap-2">
                          {person.rank <= 3 && <Trophy className="w-4 h-4 text-[#f0883e]" />}
                          <span>#{person.rank}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="w-7 h-7 border border-[#30363d]">
                            <AvatarImage src={defaultAvatar} />
                            <AvatarFallback className="bg-[#21262d] text-white text-xs">
                              {person.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-sm font-medium text-white">{person.name}</div>
                            <div className="text-xs text-[#7d8590]">@{person.username}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-white text-right font-medium">{person.score}</TableCell>
                      <TableCell className="text-[#7d8590] text-right">{person.commits}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>

          {/* Team Ranking */}
          <TabsContent value="team" className="mt-6">
            <div className="bg-[#161b22] border border-[#30363d] rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#30363d] hover:bg-transparent">
                    <TableHead className="text-[#7d8590] font-medium w-16">Rank</TableHead>
                    <TableHead className="text-[#7d8590] font-medium">Team</TableHead>
                    <TableHead className="text-[#7d8590] font-medium text-right">Score</TableHead>
                    <TableHead className="text-[#7d8590] font-medium text-right">Commits</TableHead>
                    <TableHead className="text-[#7d8590] font-medium text-right">Members</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamRanking.map((team) => (
                    <TableRow 
                      key={team.rank} 
                      className="border-[#30363d] hover:bg-[#0d1117] cursor-pointer"
                    >
                      <TableCell className="font-medium text-white">
                        <div className="flex items-center gap-2">
                          {team.rank <= 3 && <Trophy className="w-4 h-4 text-[#f0883e]" />}
                          <span>#{team.rank}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-white">{team.name}</TableCell>
                      <TableCell className="text-white text-right font-medium">{team.score}</TableCell>
                      <TableCell className="text-[#7d8590] text-right">{team.commits}</TableCell>
                      <TableCell className="text-[#7d8590] text-right">{team.members}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
