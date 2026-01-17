import { DashboardLayout } from "@/app/components/DashboardLayout";
import { GitCommit, Star, Search, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import defaultAvatar from "@/assets/38ba5abba51d546a081340d28143511ad0f46c8f.png";

// Mock data
const myRepositories = [
  { name: "web-dashboard", owner: "johndoe", commits: 156, language: "TypeScript", stars: 12, lastUpdate: "2 hours ago" },
  { name: "api-server", owner: "johndoe", commits: 89, language: "Python", stars: 8, lastUpdate: "5 hours ago" },
  { name: "mobile-app", owner: "johndoe", commits: 234, language: "JavaScript", stars: 23, lastUpdate: "1 day ago" },
  { name: "data-pipeline", owner: "johndoe", commits: 67, language: "Go", stars: 5, lastUpdate: "2 days ago" },
  { name: "auth-service", owner: "johndoe", commits: 45, language: "TypeScript", stars: 3, lastUpdate: "3 days ago" },
  { name: "ui-components", owner: "johndoe", commits: 123, language: "TypeScript", stars: 15, lastUpdate: "4 days ago" },
];

const trendingRepos = [
  { name: "agent-skills", owner: "vercel-labs", language: "JavaScript", stars: "7.9k", description: "AI agent skills framework" },
  { name: "huobao-drama", owner: "chatfire-AI", language: "Vue", stars: "1.6k", description: "AI-Powered End-to-End Short Drama Generator" },
  { name: "DeepCompletionRelease", owner: "yindaz", language: "C", stars: "590", description: "Deep Depth Completion of a Single RGB-D Image" },
];

const recentActivity = [
  { type: "commit", repo: "web-dashboard", message: "Fix authentication bug", time: "15m ago" },
  { type: "pr", repo: "api-server", message: "Add new dashboard features", time: "1h ago" },
  { type: "commit", repo: "mobile-app", message: "Update dependencies", time: "2h ago" },
];

const todayRanking = [
  { rank: 1, name: "Alice Johnson", username: "alicej", commits: 12, score: 95 },
  { rank: 2, name: "Bob Smith", username: "bobsmith", commits: 9, score: 88 },
  { rank: 3, name: "Carol White", username: "carolw", commits: 8, score: 85 },
  { rank: 4, name: "David Brown", username: "davidb", commits: 7, score: 82 },
  { rank: 5, name: "Emma Davis", username: "emmad", commits: 6, score: 79 },
];

export function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-4rem)] overflow-hidden flex flex-col bg-[#0d1117]">
        {/* Compact Header */}
        <div className="px-4 py-2.5 border-b border-[#30363d] bg-[#0d1117]">
          <h1 className="text-base font-semibold text-white">Home</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-[1400px] mx-auto">
            <div className="flex gap-4">
              {/* Left Sidebar - Top Repositories */}
              <div className="w-64 flex-shrink-0 bg-white/5 backdrop-blur-md border border-white/10 rounded-lg flex flex-col max-h-[400px]">
                <div className="px-3 py-2 border-b border-white/10 bg-white/5">
                  <h2 className="text-sm font-semibold text-white">Top repositories</h2>
                </div>
                <div className="p-2 border-b border-white/10 bg-[#0d1117]">
                  <div className="relative">
                    <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
                    <input
                      type="text"
                      placeholder="Find..."
                      className="w-full pl-8 pr-2 py-2 bg-white/5 border border-white/10 rounded text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#7aa2f7] focus:bg-white/10"
                    />
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto bg-[#0d1117]">
                  <div>
                    {myRepositories.slice(0, 3).map((repo) => (
                      <Link
                        key={repo.name}
                        to={`/repository`}
                        className="block w-full px-3 py-2 text-sm text-white/90 hover:bg-white/10 transition-colors duration-150"
                      >
                        <div className="font-medium truncate">{repo.name}</div>
                      </Link>
                    ))}
                    <button className="w-full text-left px-3 py-2 text-sm text-[#7aa2f7] hover:text-[#7dcfff] hover:bg-white/10 transition-colors duration-150">
                      More
                    </button>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 flex flex-col gap-4 min-w-0">
                {/* Feed Section */}
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg overflow-hidden flex flex-col max-h-[600px]">
                  <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between bg-white/5">
                    <h3 className="text-sm font-semibold text-white">Feed</h3>
                    <button className="text-sm text-white/70 hover:text-white hover:opacity-80">Filter</button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#0d1117]">
                    {/* Trending Repositories */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-white">Trending repositories</h4>
                        <button className="text-sm text-[#7aa2f7] hover:text-[#7dcfff]">See more</button>
                      </div>
                      <div className="space-y-2">
                        {trendingRepos.map((repo, idx) => (
                          <div key={idx} className="p-3 border border-white/10 rounded hover:bg-white/10 transition-colors">
                            <div className="flex items-start justify-between mb-1">
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium text-white truncate">{repo.owner}/{repo.name}</div>
                                <div className="text-sm text-white/60 mt-1 line-clamp-1">{repo.description}</div>
                              </div>
                              <button className="ml-3 flex items-center gap-1.5 px-2 py-1 border border-white/10 rounded text-sm text-white/80 hover:bg-white/10 flex-shrink-0">
                                <Star className="w-4 h-4" />
                                {repo.stars}
                              </button>
                            </div>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="text-sm text-white/60">{repo.language}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recommended */}
                    <div>
                      <h4 className="text-sm font-medium text-white mb-2">Recommended for you</h4>
                      <div className="space-y-2">
                        {recentActivity.map((activity, idx) => (
                          <div key={idx} className="p-3 border border-white/10 rounded hover:bg-white/10 transition-colors">
                            <div className="flex items-center gap-2">
                              <GitCommit className="w-4 h-4 text-white/60 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <div className="text-sm text-white truncate">{activity.message}</div>
                                <div className="text-sm text-white/60 mt-1">
                                  {activity.repo} · {activity.time}
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

              {/* Right Sidebar - Latest Activity + Today's Ranking */}
              <div className="w-64 flex-shrink-0 flex flex-col gap-4">
                {/* Latest Activity */}
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg flex flex-col max-h-[250px]">
                  <div className="px-3 py-2 border-b border-white/10 bg-white/5">
                    <h2 className="text-sm font-semibold text-white">Latest activity</h2>
                  </div>
                  <div className="flex-1 overflow-y-auto bg-[#0d1117]">
                    <div>
                      {recentActivity.map((activity, idx) => (
                        <div key={idx} className="w-full px-3 py-2 bg-[#0d1117] hover:bg-white/10 transition-colors duration-150 cursor-pointer">
                          <div className="text-sm text-white/60 mb-1">{activity.time}</div>
                          <div className="text-sm text-white truncate">{activity.message}</div>
                          <div className="text-sm text-white/60 mt-1 truncate">{activity.repo}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Today's Ranking */}
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg flex flex-col">
                  <div className="px-3 py-2 border-b border-white/10 bg-white/5">
                    <div className="flex items-center gap-1.5">
                      <Trophy className="w-4 h-4 text-[#f0883e]" />
                      <h2 className="text-sm font-semibold text-white">Today's Ranking</h2>
                    </div>
                  </div>
                  <div className="bg-[#0d1117]">
                    {todayRanking.slice(0, 3).map((person) => (
                      <div
                        key={person.rank}
                        className="flex items-center gap-2 w-full px-3 py-2 bg-[#0d1117] hover:bg-white/10 transition-colors duration-150 cursor-pointer"
                      >
                        <div className="flex items-center gap-1">
                          {person.rank <= 3 && (
                            <Trophy className={`w-4 h-4 ${
                              person.rank === 1 ? 'text-[#f0883e]' : 
                              person.rank === 2 ? 'text-gray-400' : 
                              'text-[#cd7f32]'
                            }`} />
                          )}
                          <span className="text-sm font-medium text-white">#{person.rank}</span>
                        </div>
                        <Avatar className="w-6 h-6 border border-white/20">
                          <AvatarImage src={defaultAvatar} />
                          <AvatarFallback className="bg-white/10 text-white/80 text-xs">
                            {person.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-white truncate">{person.name}</div>
                          <div className="text-xs text-white/60">{person.commits} commits</div>
                        </div>
                        <div className="text-sm font-semibold text-[#7aa2f7]">{person.score}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
