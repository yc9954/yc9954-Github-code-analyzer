import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/app/components/DashboardLayout";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Button } from "@/app/components/ui/button";
import { GitBranch, CheckCircle, Star, Search, ArrowRight } from "lucide-react";

const repositories = [
  { id: "1", name: "web-dashboard", owner: "johndoe", stars: 234, forks: 45, description: "Web dashboard application" },
  { id: "2", name: "api-server", owner: "johndoe", stars: 156, forks: 32, description: "RESTful API server" },
  { id: "3", name: "mobile-app", owner: "johndoe", stars: 289, forks: 67, description: "Mobile application" },
  { id: "4", name: "data-pipeline", owner: "johndoe", stars: 89, forks: 12, description: "Data processing pipeline" },
  { id: "5", name: "auth-service", owner: "johndoe", stars: 145, forks: 23, description: "Authentication service" },
];

const availableBranches = [
  { name: "main", commits: 234, lastCommit: "2h ago" },
  { name: "develop", commits: 156, lastCommit: "5h ago" },
  { name: "feature/auth", commits: 45, lastCommit: "1d ago" },
  { name: "fix/performance", commits: 12, lastCommit: "2d ago" },
  { name: "feature/ui-redesign", commits: 28, lastCommit: "3d ago" },
  { name: "hotfix/login-bug", commits: 6, lastCommit: "4d ago" },
];

export function RepositoryPage() {
  const navigate = useNavigate();
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredRepos = repositories.filter(repo => 
    repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    repo.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleStartAnalysis = () => {
    if (selectedRepo && selectedBranch) {
      const repo = repositories.find(r => r.id === selectedRepo);
      navigate(`/commits?repo=${repo?.name}&branch=${selectedBranch}`);
    }
  };

  return (
      <DashboardLayout>
        <div className="h-[calc(100vh-4rem)] flex flex-col bg-[#0d1117]">
          {/* Compact Header */}
          <div className="px-4 py-2.5 border-b border-[#30363d] bg-[#0d1117]">
            <h1 className="text-base font-semibold text-white">Repository Analysis</h1>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="max-w-4xl mx-auto space-y-4">
              {/* Step 1: Select Repository */}
              {!selectedRepo && (
                <div className="space-y-2">
                  <h2 className="text-sm font-semibold text-white">1. Select Repository</h2>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
                    <input
                      type="text"
                      placeholder="Search repositories..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#7aa2f7]"
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {filteredRepos.map((repo) => (
                      <div
                        key={repo.id}
                        onClick={() => setSelectedRepo(repo.id)}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedRepo === repo.id
                            ? 'border-[#7aa2f7] bg-[#7aa2f7]/10'
                            : 'border-white/10 bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <GitBranch className="w-4 h-4 text-white/60" />
                              <span className="text-sm font-medium text-white">{repo.owner}/{repo.name}</span>
                            </div>
                            <p className="text-xs text-white/60 mt-1">{repo.description}</p>
                            <div className="flex items-center gap-3 mt-2">
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3 text-white/60" />
                                <span className="text-xs text-white/60">{repo.stars}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <GitBranch className="w-3 h-3 text-white/60" />
                                <span className="text-xs text-white/60">{repo.forks}</span>
                              </div>
                            </div>
                          </div>
                          {selectedRepo === repo.id && (
                            <CheckCircle className="w-5 h-5 text-[#7aa2f7]" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Select Branch */}
              {selectedRepo && (
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        setSelectedRepo(null);
                        setSelectedBranch(null);
                      }}
                      className="text-white/60 hover:text-white h-6 text-[10px] px-2"
                    >
                      ← Back
                    </Button>
                    <h2 className="text-sm font-semibold text-white">2. Select Branch</h2>
                  </div>
                  <div className="text-xs text-white/60 mb-2">
                    {repositories.find(r => r.id === selectedRepo)?.owner}/{repositories.find(r => r.id === selectedRepo)?.name}
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {availableBranches.map((branch) => (
                      <div
                        key={branch.name}
                        onClick={() => setSelectedBranch(branch.name)}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedBranch === branch.name
                            ? 'border-[#7aa2f7] bg-[#7aa2f7]/10'
                            : 'border-white/10 bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="flex items-center gap-2">
                              <GitBranch className="w-4 h-4 text-white/60" />
                              <span className="text-sm font-medium text-white">{branch.name}</span>
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-white/60">{branch.commits} commits</span>
                              <span className="text-xs text-white/40">·</span>
                              <span className="text-xs text-white/60">{branch.lastCommit}</span>
                            </div>
                          </div>
                          {selectedBranch === branch.name && (
                            <CheckCircle className="w-5 h-5 text-[#7aa2f7]" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Start Analysis Button */}
              {selectedRepo && selectedBranch && (
                <div className="flex justify-end pt-2">
                  <Button
                    onClick={handleStartAnalysis}
                    className="bg-[#238636] hover:bg-[#2ea043] text-white border-0 h-8 text-xs px-4"
                  >
                    Start Analysis
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
}