"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/app/components/DashboardLayout";
import ClaudeChatInput from "@/app/components/ui/claude-chat-input";
import { Popover, PopoverContent, PopoverTrigger } from "@/app/components/ui/popover";
import { cn } from "@/app/components/ui/utils";
import { GitBranch, ChevronDown } from "lucide-react";

const repositories = [
  { id: "1", name: "web-dashboard", owner: "johndoe", fullName: "johndoe/web-dashboard", stars: 234, forks: 45, description: "Web dashboard application" },
  { id: "2", name: "api-server", owner: "johndoe", fullName: "johndoe/api-server", stars: 156, forks: 32, description: "RESTful API server" },
  { id: "3", name: "mobile-app", owner: "johndoe", fullName: "johndoe/mobile-app", stars: 289, forks: 67, description: "Mobile application" },
  { id: "4", name: "data-pipeline", owner: "johndoe", fullName: "johndoe/data-pipeline", stars: 89, forks: 12, description: "Data processing pipeline" },
  { id: "5", name: "auth-service", owner: "johndoe", fullName: "johndoe/auth-service", stars: 145, forks: 23, description: "Authentication service" },
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
  const [selectedRepo, setSelectedRepo] = useState<string>("");
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [repoPopoverOpen, setRepoPopoverOpen] = useState(false);
  const [branchPopoverOpen, setBranchPopoverOpen] = useState(false);

  const handleSendMessage = (data: {
    message: string;
    files: any[];
    pastedContent: any[];
    model: string;
    isThinkingEnabled: boolean;
  }) => {
    if (selectedRepo && selectedBranch) {
      const repo = repositories.find(r => r.id === selectedRepo);
      navigate(`/commits?repo=${repo?.name}&branch=${selectedBranch}`);
    }
  };

  const handleRepoSelect = (repoId: string) => {
    setSelectedRepo(repoId);
    setRepoPopoverOpen(false);
    if (selectedRepo !== repoId) {
      setSelectedBranch("");
    }
  };

  const handleBranchSelect = (branch: string) => {
    setSelectedBranch(branch);
    setBranchPopoverOpen(false);
  };

  const selectedRepoData = repositories.find(r => r.id === selectedRepo);

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-4rem)] flex flex-col bg-black">
        <div className="flex-1 overflow-y-auto p-4 bg-black">
          <div className="flex flex-col items-center w-full max-w-4xl mx-auto p-4 pt-72 space-y-40">
            <h1 className="text-3xl sm:text-4xl font-serif font-light text-white mb-3 tracking-tight">
              What can I help you ship?
            </h1>

            <div className="w-full">
              <ClaudeChatInput onSendMessage={handleSendMessage} />

              {/* Repository and Branch Selection Buttons - Below Chat */}
              <div className="flex items-center justify-center gap-3 mt-6">
                {/* Repository Selection Button */}
                <Popover open={repoPopoverOpen} onOpenChange={setRepoPopoverOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 rounded-full border border-neutral-800 text-neutral-400 hover:text-white transition-colors",
                        selectedRepo && "text-white border-neutral-700"
                      )}
                    >
                      <GitBranch className="w-4 h-4" />
                      <span className="text-xs">
                        {selectedRepoData ? selectedRepoData.fullName : "Repository"}
                      </span>
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent 
                    className="w-80 bg-neutral-900 border-neutral-800 p-2"
                    align="start"
                    side="bottom"
                  >
                    <div className="space-y-1">
                      {repositories.map((repo) => (
                        <div
                          key={repo.id}
                          onClick={() => handleRepoSelect(repo.id)}
                          className={cn(
                            "p-3 rounded-lg cursor-pointer transition-colors",
                            selectedRepo === repo.id
                              ? "bg-blue-500/10 border border-blue-500"
                              : "hover:bg-neutral-800"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <GitBranch className="w-4 h-4 text-neutral-400" />
                            <span className="text-sm text-white font-medium">{repo.fullName}</span>
                          </div>
                          <p className="text-xs text-neutral-400 mt-1">{repo.description}</p>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>

                {/* Branch Selection Button */}
                <Popover 
                  open={branchPopoverOpen} 
                  onOpenChange={setBranchPopoverOpen}
                >
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      disabled={!selectedRepo}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 rounded-full border border-neutral-800 text-neutral-400 hover:text-white transition-colors",
                        selectedBranch && "text-white border-neutral-700",
                        !selectedRepo && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <GitBranch className="w-4 h-4" />
                      <span className="text-xs">
                        {selectedBranch || "Branch"}
                      </span>
                      <ChevronDown className="w-3 h-3" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent 
                    className="w-72 bg-neutral-900 border-neutral-800 p-2"
                    align="start"
                    side="bottom"
                  >
                    <div className="space-y-1">
                      {availableBranches.map((branch) => (
                        <div
                          key={branch.name}
                          onClick={() => handleBranchSelect(branch.name)}
                          className={cn(
                            "p-3 rounded-lg cursor-pointer transition-colors",
                            selectedBranch === branch.name
                              ? "bg-blue-500/10 border border-blue-500"
                              : "hover:bg-neutral-800"
                          )}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="flex items-center gap-2">
                                <GitBranch className="w-4 h-4 text-neutral-400" />
                                <span className="text-sm text-white font-medium">{branch.name}</span>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-neutral-400">{branch.commits} commits</span>
                                <span className="text-xs text-neutral-500">·</span>
                                <span className="text-xs text-neutral-400">{branch.lastCommit}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
