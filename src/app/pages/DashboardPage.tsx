import { DashboardLayout } from "@/app/components/DashboardLayout";
import { GitCommit, GitBranch, Code, TrendingUp, Star, Search } from "lucide-react";
import { Link } from "react-router-dom";

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

export function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-4rem)] overflow-hidden flex gap-3 p-3">
        {/* Left Sidebar - Top Repositories */}
        <div className="w-64 flex-shrink-0 bg-[#161b22] border border-[#30363d] rounded-lg p-3 flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-white">Top repositories</h2>
          </div>
          <div className="mb-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#7d8590]" />
              <input
                type="text"
                placeholder="Find a repository..."
                className="w-full pl-8 pr-2 py-1.5 bg-[#0d1117] border border-[#30363d] rounded text-xs text-white placeholder:text-[#7d8590] focus:outline-none focus:border-[#7aa2f7]"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto space-y-1">
            {myRepositories.map((repo) => (
              <Link
                key={repo.name}
                to={`/repository`}
                className="block px-2 py-1.5 rounded text-xs text-[#7d8590] hover:bg-[#0d1117] hover:text-white transition-colors"
              >
                <div className="font-medium">{repo.owner}/{repo.name}</div>
              </Link>
            ))}
            <button className="w-full text-left px-2 py-1.5 text-xs text-[#7aa2f7] hover:text-[#7dcfff]">
              Show more
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col gap-3 min-w-0 overflow-hidden">
          {/* Header */}
          <div className="flex-shrink-0">
            <h1 className="text-xl font-semibold text-white mb-1">Home</h1>
          </div>

          {/* Stats Row - Compact */}
          <div className="grid grid-cols-4 gap-2 flex-shrink-0">
            <div className="bg-[#161b22] border border-[#30363d] rounded p-2">
              <div className="flex items-center justify-between mb-1">
                <GitCommit className="w-3.5 h-3.5 text-[#7aa2f7]" />
                <span className="text-[10px] text-[#3fb950]">+12%</span>
              </div>
              <div className="text-lg font-semibold text-white">1,245</div>
              <div className="text-[10px] text-[#7d8590]">Commits</div>
            </div>
            <div className="bg-[#161b22] border border-[#30363d] rounded p-2">
              <div className="flex items-center justify-between mb-1">
                <GitBranch className="w-3.5 h-3.5 text-[#bb9af7]" />
                <span className="text-[10px] text-[#7aa2f7]">3 new</span>
              </div>
              <div className="text-lg font-semibold text-white">24</div>
              <div className="text-[10px] text-[#7d8590]">Repos</div>
            </div>
            <div className="bg-[#161b22] border border-[#30363d] rounded p-2">
              <div className="flex items-center justify-between mb-1">
                <Code className="w-3.5 h-3.5 text-[#9ece6a]" />
                <span className="text-[10px] text-[#7d8590]">5 total</span>
              </div>
              <div className="text-lg font-semibold text-white">3</div>
              <div className="text-[10px] text-[#7d8590]">Languages</div>
            </div>
            <div className="bg-[#161b22] border border-[#30363d] rounded p-2">
              <div className="flex items-center justify-between mb-1">
                <TrendingUp className="w-3.5 h-3.5 text-[#e0af68]" />
                <span className="text-[10px] text-[#3fb950]">Top 5%</span>
              </div>
              <div className="text-lg font-semibold text-white">8.9</div>
              <div className="text-[10px] text-[#7d8590]">Score</div>
            </div>
          </div>

          {/* Feed Section */}
          <div className="flex-1 bg-[#161b22] border border-[#30363d] rounded-lg p-3 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-white">Feed</h3>
              <button className="text-xs text-[#7d8590] hover:text-white">Filter</button>
            </div>

            {/* Trending Repositories */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-medium text-white">Trending repositories</h4>
                <button className="text-xs text-[#7aa2f7] hover:text-[#7dcfff]">See more</button>
              </div>
              <div className="space-y-2">
                {trendingRepos.map((repo, idx) => (
                  <div key={idx} className="p-2 border border-[#30363d] rounded hover:bg-[#0d1117] transition-colors">
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-white truncate">{repo.owner}/{repo.name}</div>
                        <div className="text-[10px] text-[#7d8590] mt-0.5 line-clamp-1">{repo.description}</div>
                      </div>
                      <button className="ml-2 flex items-center gap-1 px-2 py-0.5 border border-[#30363d] rounded text-[10px] text-[#7d8590] hover:bg-[#21262d]">
                        <Star className="w-3 h-3" />
                        {repo.stars}
                      </button>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px] text-[#7d8590]">{repo.language}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recommended */}
            <div>
              <h4 className="text-xs font-medium text-white mb-2">Recommended for you</h4>
              <div className="space-y-2">
                {recentActivity.map((activity, idx) => (
                  <div key={idx} className="p-2 border border-[#30363d] rounded hover:bg-[#0d1117] transition-colors">
                    <div className="flex items-center gap-2">
                      <GitCommit className="w-3 h-3 text-[#7d8590]" />
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-white truncate">{activity.message}</div>
                        <div className="text-[10px] text-[#7d8590] mt-0.5">
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

        {/* Right Sidebar - Latest Activity */}
        <div className="w-64 flex-shrink-0 bg-[#161b22] border border-[#30363d] rounded-lg p-3 flex flex-col">
          <h2 className="text-sm font-semibold text-white mb-3">Latest activity</h2>
          <div className="flex-1 overflow-y-auto space-y-2">
            {recentActivity.map((activity, idx) => (
              <div key={idx} className="pb-2 border-b border-[#30363d] last:border-0">
                <div className="text-[10px] text-[#7d8590] mb-1">{activity.time}</div>
                <div className="text-xs text-white">{activity.message}</div>
                <div className="text-[10px] text-[#7d8590] mt-0.5">{activity.repo}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
