import { DashboardLayout } from "@/app/components/DashboardLayout";
import { GitCommit, Star, Search, Trophy, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Badge } from "@/app/components/ui/badge";
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

const languageColors: { [key: string]: string } = {
  TypeScript: "#58a6ff",
  JavaScript: "#d29922",
  Python: "#3fb950",
  Go: "#00add8",
  Vue: "#3fb950",
  C: "#555555",
};

export function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-4rem)] overflow-hidden flex flex-col bg-[#0d1117]">
        {/* Header - More spacious */}
        <div className="px-6 py-4 border-b border-[#30363d] bg-[#0d1117]">
          <h1 className="text-xl font-semibold text-[#e6edf3]">Home</h1>
        </div>

        <div className="flex-1 flex gap-4 p-4 overflow-hidden">
          {/* Left Sidebar - Top Repositories */}
          <div className="w-64 flex-shrink-0 bg-[#161b22] border border-[#30363d] rounded-xl flex flex-col overflow-hidden">
            <div className="px-4 py-3 border-b border-[#30363d]">
              <h2 className="text-sm font-semibold text-[#e6edf3]">Top repositories</h2>
            </div>
            <div className="px-3 py-2 border-b border-[#30363d]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8b949e]" />
                <input
                  type="text"
                  placeholder="Find a repository..."
                  className="w-full pl-9 pr-3 py-2 bg-[#0d1117] border border-[#30363d] rounded-lg text-sm text-[#e6edf3] placeholder:text-[#6e7681] focus:outline-none focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff]/30 transition-all"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="py-2">
                {myRepositories.slice(0, 4).map((repo) => (
                  <Link
                    key={repo.name}
                    to={`/repository`}
                    className="block w-full px-4 py-2.5 text-sm text-[#c9d1d9] hover:bg-[#21262d] transition-colors duration-150"
                  >
                    <div className="font-medium truncate text-[#e6edf3]">{repo.name}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="flex items-center gap-1 text-xs text-[#8b949e]">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: languageColors[repo.language] || "#8b949e" }}></span>
                        {repo.language}
                      </span>
                      <span className="text-xs text-[#8b949e]">{repo.commits} commits</span>
                    </div>
                  </Link>
                ))}
                <Link to="/repository" className="block w-full text-left px-4 py-2.5 text-sm text-[#58a6ff] hover:text-[#79c0ff] hover:bg-[#21262d] transition-colors duration-150">
                  View all repositories →
                </Link>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col gap-4 min-w-0 overflow-hidden">
            {/* Feed Section */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden flex flex-col flex-1">
              <div className="px-5 py-3.5 border-b border-[#30363d] flex items-center justify-between">
                <h3 className="text-sm font-semibold text-[#e6edf3]">Feed</h3>
                <button className="text-sm text-[#8b949e] hover:text-[#58a6ff] transition-colors">Filter</button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Trending Repositories */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-[#58a6ff]" />
                      <h4 className="text-sm font-semibold text-[#e6edf3]">Trending repositories</h4>
                    </div>
                    <button className="text-sm text-[#58a6ff] hover:text-[#79c0ff]">See more</button>
                  </div>
                  <div className="space-y-3">
                    {trendingRepos.map((repo, idx) => (
                      <div key={idx} className="p-4 border border-[#30363d] rounded-lg hover:bg-[#21262d] transition-all cursor-pointer">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-[#58a6ff] hover:underline truncate">{repo.owner}/{repo.name}</div>
                            <div className="text-sm text-[#8b949e] mt-1 line-clamp-2">{repo.description}</div>
                          </div>
                          <button className="ml-3 flex items-center gap-1.5 px-3 py-1.5 border border-[#30363d] rounded-lg text-sm text-[#c9d1d9] hover:bg-[#30363d] transition-all flex-shrink-0">
                            <Star className="w-4 h-4" />
                            <span className="font-medium">{repo.stars}</span>
                          </button>
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="flex items-center gap-1.5 text-xs text-[#8b949e]">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: languageColors[repo.language] || "#8b949e" }}></span>
                            {repo.language}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommended */}
                <div>
                  <h4 className="text-sm font-semibold text-[#e6edf3] mb-3">Recommended for you</h4>
                  <div className="space-y-2">
                    {recentActivity.map((activity, idx) => (
                      <div key={idx} className="p-3 border border-[#30363d] rounded-lg hover:bg-[#21262d] transition-colors cursor-pointer">
                        <div className="flex items-center gap-3">
                          <GitCommit className="w-4 h-4 text-[#8b949e] flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm text-[#e6edf3] font-medium truncate">{activity.message}</div>
                            <div className="text-xs text-[#8b949e] mt-1">
                              <span className="text-[#58a6ff]">{activity.repo}</span> · {activity.time}
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
          <div className="w-72 flex-shrink-0 flex flex-col gap-4">
            {/* Latest Activity */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-xl flex flex-col overflow-hidden">
              <div className="px-4 py-3 border-b border-[#30363d]">
                <h2 className="text-sm font-semibold text-[#e6edf3]">Latest activity</h2>
              </div>
              <div className="py-2">
                {recentActivity.map((activity, idx) => (
                  <div key={idx} className="w-full px-4 py-3 hover:bg-[#21262d] transition-colors duration-150 cursor-pointer">
                    <div className="text-xs text-[#8b949e] mb-1">{activity.time}</div>
                    <div className="text-sm text-[#e6edf3] font-medium truncate">{activity.message}</div>
                    <div className="text-xs text-[#58a6ff] mt-1 truncate">{activity.repo}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Today's Ranking */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-xl flex flex-col overflow-hidden">
              <div className="px-4 py-3 border-b border-[#30363d]">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-[#d29922]" />
                  <h2 className="text-sm font-semibold text-[#e6edf3]">Today's Ranking</h2>
                </div>
              </div>
              <div className="py-2">
                {todayRanking.slice(0, 5).map((person) => (
                  <div
                    key={person.rank}
                    className="flex items-center gap-3 w-full px-4 py-3 hover:bg-[#21262d] transition-colors duration-150 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      {person.rank <= 3 ? (
                        <Trophy className={`w-4 h-4 ${
                          person.rank === 1 ? 'text-[#d29922]' :
                          person.rank === 2 ? 'text-[#8b949e]' :
                          'text-[#cd7f32]'
                        }`} />
                      ) : (
                        <span className="text-sm font-medium text-[#8b949e] w-4 text-center">{person.rank}</span>
                      )}
                    </div>
                    <Avatar className="w-8 h-8 border-2 border-[#30363d]">
                      <AvatarImage src={defaultAvatar} />
                      <AvatarFallback className="bg-[#21262d] text-[#8b949e] text-xs">
                        {person.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-[#e6edf3] truncate">{person.name}</div>
                      <div className="text-xs text-[#8b949e]">{person.commits} commits</div>
                    </div>
                    <Badge className="bg-[#58a6ff]/10 text-[#58a6ff] border-[#58a6ff]/30 font-semibold">
                      {person.score}
                    </Badge>
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
