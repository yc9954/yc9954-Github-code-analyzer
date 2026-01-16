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
      <div className="h-[calc(100vh-4rem)] flex flex-col bg-[#0d1117]">
        {/* Compact Header */}
        <div className="px-4 py-2.5 border-b border-[#30363d] bg-[#0d1117]">
          <div className="flex items-center justify-between">
            <h1 className="text-base font-semibold text-white">Rankings</h1>
            <Select defaultValue="all">
              <SelectTrigger className="w-32 bg-[#161b22] border-[#30363d] text-white h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#161b22] border-[#30363d]">
                <SelectItem value="all" className="text-white focus:bg-[#0d1117] text-xs">All Time</SelectItem>
                <SelectItem value="month" className="text-white focus:bg-[#0d1117] text-xs">This Month</SelectItem>
                <SelectItem value="week" className="text-white focus:bg-[#0d1117] text-xs">This Week</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3">

          {/* Tabs */}
          <Tabs defaultValue="individual">
            <TabsList className="bg-[#161b22] border-b border-[#30363d] w-full justify-start rounded-none p-0 h-auto">
              <TabsTrigger value="individual" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-[#f78166] data-[state=active]:text-white text-[#7d8590] rounded-none px-3 py-1.5 text-xs">
                Individual
              </TabsTrigger>
              <TabsTrigger value="team" className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-[#f78166] data-[state=active]:text-white text-[#7d8590] rounded-none px-3 py-1.5 text-xs">
                Team
              </TabsTrigger>
            </TabsList>

            {/* Individual Ranking */}
            <TabsContent value="individual" className="mt-2">
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#30363d] hover:bg-transparent">
                      <TableHead className="text-[#7d8590] font-medium text-[10px] w-12 h-7 py-1">Rank</TableHead>
                      <TableHead className="text-[#7d8590] font-medium text-[10px] h-7 py-1">Developer</TableHead>
                      <TableHead className="text-[#7d8590] font-medium text-[10px] text-right h-7 py-1">Score</TableHead>
                      <TableHead className="text-[#7d8590] font-medium text-[10px] text-right h-7 py-1">Commits</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {individualRanking.map((person) => (
                      <TableRow 
                        key={person.rank} 
                        className="border-[#30363d] hover:bg-[#0d1117] cursor-pointer h-8"
                      >
                        <TableCell className="font-medium text-white py-1">
                          <div className="flex items-center gap-1.5">
                            {person.rank <= 3 && <Trophy className="w-3 h-3 text-[#f0883e]" />}
                            <span className="text-xs">#{person.rank}</span>
                          </div>
                        </TableCell>
                        <TableCell className="py-1">
                          <div className="flex items-center gap-2">
                            <Avatar className="w-5 h-5 border border-[#30363d]">
                              <AvatarImage src={defaultAvatar} />
                              <AvatarFallback className="bg-[#21262d] text-white text-[10px]">
                                {person.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="text-xs font-medium text-white">{person.name}</div>
                              <div className="text-[10px] text-[#7d8590]">@{person.username}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-white text-right font-medium text-xs py-1">{person.score}</TableCell>
                        <TableCell className="text-[#7d8590] text-right text-xs py-1">{person.commits}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            {/* Team Ranking */}
            <TabsContent value="team" className="mt-2">
              <div className="bg-[#161b22] border border-[#30363d] rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow className="border-[#30363d] hover:bg-transparent">
                      <TableHead className="text-[#7d8590] font-medium text-[10px] w-12 h-7 py-1">Rank</TableHead>
                      <TableHead className="text-[#7d8590] font-medium text-[10px] h-7 py-1">Team</TableHead>
                      <TableHead className="text-[#7d8590] font-medium text-[10px] text-right h-7 py-1">Score</TableHead>
                      <TableHead className="text-[#7d8590] font-medium text-[10px] text-right h-7 py-1">Commits</TableHead>
                      <TableHead className="text-[#7d8590] font-medium text-[10px] text-right h-7 py-1">Members</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {teamRanking.map((team) => (
                      <TableRow 
                        key={team.rank} 
                        className="border-[#30363d] hover:bg-[#0d1117] cursor-pointer h-8"
                      >
                        <TableCell className="font-medium text-white py-1">
                          <div className="flex items-center gap-1.5">
                            {team.rank <= 3 && <Trophy className="w-3 h-3 text-[#f0883e]" />}
                            <span className="text-xs">#{team.rank}</span>
                          </div>
                        </TableCell>
                        <TableCell className="font-medium text-white text-xs py-1">{team.name}</TableCell>
                        <TableCell className="text-white text-right font-medium text-xs py-1">{team.score}</TableCell>
                        <TableCell className="text-[#7d8590] text-right text-xs py-1">{team.commits}</TableCell>
                        <TableCell className="text-[#7d8590] text-right text-xs py-1">{team.members}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </DashboardLayout>
  );
}
