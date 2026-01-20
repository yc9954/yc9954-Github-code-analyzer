import { useState, useEffect } from "react";
import { DashboardLayout } from "@/app/components/DashboardLayout";
import { getUserRankings, getCommitRankings, type UserRank, type CommitRank } from "@/lib/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table";
import { FaTrophy } from "react-icons/fa";
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
  const [viewType, setViewType] = useState<"individual" | "team">("individual");
  const [userRankings, setUserRankings] = useState<UserRank[]>([]);
  const [loading, setLoading] = useState(false);

  // Load rankings from API
  useEffect(() => {
    const loadRankings = async () => {
      setLoading(true);
      try {
        if (viewType === 'individual') {
          const data = await getUserRankings('GLOBAL', undefined, 'ALL', 10);
          setUserRankings(data);
        }
        // Team rankings would need a different API call
      } catch (error) {
        console.error('Error loading rankings:', error);
        // Fallback to mock data if API fails
        if (viewType === 'individual') {
          setUserRankings(individualRanking.map((r, idx) => ({
            rank: r.rank,
            username: r.username,
            profileUrl: defaultAvatar,
            totalScore: r.score,
          })));
        }
      } finally {
        setLoading(false);
      }
    };
    loadRankings();
  }, [viewType]);

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-4rem)] flex flex-col bg-black">
        {/* Compact Header */}
        <div className="px-4 py-2.5 border-b border-neutral-900 bg-black">
          <div className="flex items-center justify-between">
            <h1 className="text-base font-semibold text-white">Rankings</h1>
            <div className="flex items-center gap-2">
              <Select value={viewType} onValueChange={(value) => setViewType(value as "individual" | "team")}>
                <SelectTrigger className="w-32 bg-neutral-900 border-neutral-800 text-white h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-neutral-900 border-neutral-800">
                  <SelectItem value="individual" className="text-white focus:bg-neutral-800 text-xs">Individual</SelectItem>
                  <SelectItem value="team" className="text-white focus:bg-neutral-800 text-xs">Team</SelectItem>
                </SelectContent>
              </Select>
              <Select defaultValue="all">
                <SelectTrigger className="w-32 bg-neutral-900 border-neutral-800 text-white h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-neutral-900 border-neutral-800">
                  <SelectItem value="all" className="text-white focus:bg-neutral-800 text-xs">All Time</SelectItem>
                  <SelectItem value="month" className="text-white focus:bg-neutral-800 text-xs">This Month</SelectItem>
                  <SelectItem value="week" className="text-white focus:bg-neutral-800 text-xs">This Week</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <div className="max-w-5xl mx-auto">
            {/* Individual Ranking */}
            {viewType === "individual" && (
              <div className="bg-neutral-900 border border-neutral-800 rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow className="border-neutral-800 bg-neutral-900 hover:bg-neutral-900">
                    <TableHead className="text-neutral-400 font-medium text-xs w-12 h-7 py-1">Rank</TableHead>
                    <TableHead className="text-neutral-400 font-medium text-xs h-7 py-1">Developer</TableHead>
                    <TableHead className="text-neutral-400 font-medium text-xs text-right h-7 py-1">Score</TableHead>
                    <TableHead className="text-neutral-400 font-medium text-xs text-right h-7 py-1">Commits</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {individualRanking.map((person) => (
                    <TableRow 
                      key={person.rank} 
                      className="border-neutral-800 bg-black hover:bg-neutral-900 cursor-pointer h-8"
                    >
                      <TableCell className="font-medium text-white py-1">
                        <div className="flex items-center gap-1.5">
                          {person.rank === 1 && (
                            <div 
                              className="relative w-3 h-3 flex items-center justify-center"
                              style={{
                                background: 'linear-gradient(135deg, rgba(255,215,0,0.25), rgba(255,223,0,0.15))',
                                backdropFilter: 'blur(8px)',
                                WebkitBackdropFilter: 'blur(8px)',
                                borderRadius: '50%',
                                boxShadow: '0 0 12px rgba(255,215,0,0.5), inset 0 0 8px rgba(255,215,0,0.3), 0 0 0 1px rgba(255,215,0,0.2)'
                              }}
                            >
                              <FaTrophy 
                                className="w-2.5 h-2.5 relative z-10" 
                                style={{
                                  color: '#FFD700',
                                  filter: 'drop-shadow(0 0 5px rgba(255,215,0,0.9)) drop-shadow(0 0 10px rgba(255,215,0,0.5))'
                                }}
                              />
                            </div>
                          )}
                          {person.rank === 2 && (
                            <div 
                              className="relative w-3 h-3 flex items-center justify-center"
                              style={{
                                background: 'linear-gradient(135deg, rgba(192,192,192,0.25), rgba(169,169,169,0.15))',
                                backdropFilter: 'blur(8px)',
                                WebkitBackdropFilter: 'blur(8px)',
                                borderRadius: '50%',
                                boxShadow: '0 0 12px rgba(192,192,192,0.5), inset 0 0 8px rgba(192,192,192,0.3), 0 0 0 1px rgba(192,192,192,0.2)'
                              }}
                            >
                              <FaTrophy 
                                className="w-2.5 h-2.5 relative z-10" 
                                style={{
                                  color: '#C0C0C0',
                                  filter: 'drop-shadow(0 0 5px rgba(192,192,192,0.9)) drop-shadow(0 0 10px rgba(192,192,192,0.5))'
                                }}
                              />
                            </div>
                          )}
                          {person.rank === 3 && (
                            <div 
                              className="relative w-3 h-3 flex items-center justify-center"
                              style={{
                                background: 'linear-gradient(135deg, rgba(205,127,50,0.25), rgba(184,115,51,0.15))',
                                backdropFilter: 'blur(8px)',
                                WebkitBackdropFilter: 'blur(8px)',
                                borderRadius: '50%',
                                boxShadow: '0 0 12px rgba(205,127,50,0.5), inset 0 0 8px rgba(205,127,50,0.3), 0 0 0 1px rgba(205,127,50,0.2)'
                              }}
                            >
                              <FaTrophy 
                                className="w-2.5 h-2.5 relative z-10" 
                                style={{
                                  color: '#CD7F32',
                                  filter: 'drop-shadow(0 0 5px rgba(205,127,50,0.9)) drop-shadow(0 0 10px rgba(205,127,50,0.5))'
                                }}
                              />
                            </div>
                          )}
                          <span className="text-xs">#{person.rank}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-1">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-5 h-5 border border-neutral-800">
                            <AvatarImage src={defaultAvatar} />
                            <AvatarFallback className="bg-neutral-900 text-white text-xs">
                              {person.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="text-xs font-medium text-white">{person.name}</div>
                            <div className="text-[10px] text-neutral-400">@{person.username}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-white text-right font-medium text-xs py-1">{person.score}</TableCell>
                      <TableCell className="text-neutral-400 text-right text-xs py-1">{person.commits}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Team Ranking */}
          {viewType === "team" && (
            <div className="bg-neutral-900 border border-neutral-800 rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow className="border-neutral-800 bg-neutral-900 hover:bg-neutral-900">
                    <TableHead className="text-neutral-400 font-medium text-xs w-12 h-7 py-1">Rank</TableHead>
                    <TableHead className="text-neutral-400 font-medium text-xs h-7 py-1">Team</TableHead>
                    <TableHead className="text-neutral-400 font-medium text-xs text-right h-7 py-1">Score</TableHead>
                    <TableHead className="text-neutral-400 font-medium text-xs text-right h-7 py-1">Commits</TableHead>
                    <TableHead className="text-neutral-400 font-medium text-xs text-right h-7 py-1">Members</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamRanking.map((team) => (
                    <TableRow 
                      key={team.rank} 
                      className="border-neutral-800 bg-black hover:bg-neutral-900 cursor-pointer h-8"
                    >
                      <TableCell className="font-medium text-white py-1">
                        <div className="flex items-center gap-1.5">
                          {team.rank === 1 && (
                            <div 
                              className="relative w-3 h-3 flex items-center justify-center"
                              style={{
                                background: 'linear-gradient(135deg, rgba(255,215,0,0.25), rgba(255,223,0,0.15))',
                                backdropFilter: 'blur(8px)',
                                WebkitBackdropFilter: 'blur(8px)',
                                borderRadius: '50%',
                                boxShadow: '0 0 12px rgba(255,215,0,0.5), inset 0 0 8px rgba(255,215,0,0.3), 0 0 0 1px rgba(255,215,0,0.2)'
                              }}
                            >
                              <FaTrophy 
                                className="w-2.5 h-2.5 relative z-10" 
                                style={{
                                  color: '#FFD700',
                                  filter: 'drop-shadow(0 0 5px rgba(255,215,0,0.9)) drop-shadow(0 0 10px rgba(255,215,0,0.5))'
                                }}
                              />
                            </div>
                          )}
                          {team.rank === 2 && (
                            <div 
                              className="relative w-3 h-3 flex items-center justify-center"
                              style={{
                                background: 'linear-gradient(135deg, rgba(192,192,192,0.25), rgba(169,169,169,0.15))',
                                backdropFilter: 'blur(8px)',
                                WebkitBackdropFilter: 'blur(8px)',
                                borderRadius: '50%',
                                boxShadow: '0 0 12px rgba(192,192,192,0.5), inset 0 0 8px rgba(192,192,192,0.3), 0 0 0 1px rgba(192,192,192,0.2)'
                              }}
                            >
                              <FaTrophy 
                                className="w-2.5 h-2.5 relative z-10" 
                                style={{
                                  color: '#C0C0C0',
                                  filter: 'drop-shadow(0 0 5px rgba(192,192,192,0.9)) drop-shadow(0 0 10px rgba(192,192,192,0.5))'
                                }}
                              />
                            </div>
                          )}
                          {team.rank === 3 && (
                            <div 
                              className="relative w-3 h-3 flex items-center justify-center"
                              style={{
                                background: 'linear-gradient(135deg, rgba(205,127,50,0.25), rgba(184,115,51,0.15))',
                                backdropFilter: 'blur(8px)',
                                WebkitBackdropFilter: 'blur(8px)',
                                borderRadius: '50%',
                                boxShadow: '0 0 12px rgba(205,127,50,0.5), inset 0 0 8px rgba(205,127,50,0.3), 0 0 0 1px rgba(205,127,50,0.2)'
                              }}
                            >
                              <FaTrophy 
                                className="w-2.5 h-2.5 relative z-10" 
                                style={{
                                  color: '#CD7F32',
                                  filter: 'drop-shadow(0 0 5px rgba(205,127,50,0.9)) drop-shadow(0 0 10px rgba(205,127,50,0.5))'
                                }}
                              />
                            </div>
                          )}
                          <span className="text-xs">#{team.rank}</span>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-white text-xs py-1">{team.name}</TableCell>
                      <TableCell className="text-white text-right font-medium text-xs py-1">{team.score}</TableCell>
                      <TableCell className="text-neutral-400 text-right text-xs py-1">{team.commits}</TableCell>
                      <TableCell className="text-neutral-400 text-right text-xs py-1">{team.members}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
