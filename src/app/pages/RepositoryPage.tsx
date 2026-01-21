"use client";

import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/app/components/DashboardLayout";
import ClaudeChatInput from "@/app/components/ui/claude-chat-input";
import { Popover, PopoverContent, PopoverTrigger } from "@/app/components/ui/popover";
import { cn } from "@/app/components/ui/utils";
import { GitBranch, ChevronDown, Loader2 } from "lucide-react";
import { getUserRepositories, getRepositoryBranches, syncRepository, type Repository, type Branch } from "@/lib/api";

export function RepositoryPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [availableBranches, setAvailableBranches] = useState<Branch[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string>("");
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  const [repoPopoverOpen, setRepoPopoverOpen] = useState(false);
  const [branchPopoverOpen, setBranchPopoverOpen] = useState(false);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(false);

  // Load repositories from URL params or fetch user repos
  useEffect(() => {
    // Always load user repositories to allow switching
    loadRepositories();

    const ownerParam = searchParams.get("owner");
    const repoParam = searchParams.get("repo");

    if (ownerParam && repoParam) {
      // Repository was selected from search - set it directly
      const repoFullName = `${ownerParam}/${repoParam}`;
      setSelectedRepo(repoFullName);
      // Note: We'll load branches after repositories are loaded
    }
  }, [searchParams]);

  // Load user repositories
  const loadRepositories = async () => {
    setLoadingRepos(true);
    try {
      const repos = await getUserRepositories();
      setRepositories(repos);
    } catch (error: any) {
      console.error("Error loading repositories:", error);
      // 인증 에러인 경우 DashboardLayout이 처리하므로 여기서는 빈 배열로 설정
      if (error.message?.includes('인증이 필요합니다')) {
        // DashboardLayout의 인증 체크가 리다이렉트를 처리함
        setRepositories([]);
      } else {
        // 다른 에러의 경우에도 빈 배열로 설정
        setRepositories([]);
      }
    } finally {
      setLoadingRepos(false);
    }
  };

  // Load branches for selected repository
  const loadBranches = async (repo: Repository) => {
    setLoadingBranches(true);
    try {
      const branches = await getRepositoryBranches(repo.id);
      setAvailableBranches(branches);

      // Trigger background sync
      syncRepository(repo.id).catch(err => console.error("Background sync failed", err));

      // Auto-select main branch if available
      if (branches.length > 0 && !selectedBranch) {
        const mainBranch = branches.find(b => b.name === 'main') || branches[0];
        setSelectedBranch(mainBranch.name);
      }
    } catch (error) {
      console.error("Error loading branches:", error);
      setAvailableBranches([]);
    } finally {
      setLoadingBranches(false);
    }
  };

  const handleSendMessage = (data: {
    message: string;
    files: any[];
    pastedContent: any[];
    model: string;
    isThinkingEnabled: boolean;
  }) => {
    console.log('RepositoryPage - handleSendMessage:', {
      message: data.message,
      selectedRepo: selectedRepoData,
      selectedBranch
    });

    if (selectedRepoData && selectedBranch) {
      const owner = selectedRepoData.owner;
      const repo = selectedRepoData.name;

      // URLSearchParams를 사용하여 안전하게 URL 생성 (한글 인코딩 문제 해결)
      // 각 파라미터를 개별적으로 인코딩하여 안전하게 처리
      const params = new URLSearchParams();
      params.set('owner', owner);
      params.set('repo', repo);
      params.set('branch', selectedBranch);
      params.set('question', data.message); // URLSearchParams가 자동으로 인코딩

      const url = `/commits?${params.toString()}`;
      console.log('RepositoryPage - Navigating to:', url);
      console.log('RepositoryPage - Question (original):', data.message);
      console.log('RepositoryPage - Question (length):', data.message.length);
      console.log('RepositoryPage - Question (chars):', data.message.split('').map(c => `${c}(${c.charCodeAt(0)})`).join(', '));
      console.log('RepositoryPage - Question (encoded in URL):', params.get('question'));
      console.log('RepositoryPage - Full URL:', url);

      // navigate 대신 window.location을 사용하여 URL이 정확히 전달되도록 함
      navigate(url);
    } else {
      console.warn('Cannot navigate: missing repo or branch', { selectedRepoData, selectedBranch });
    }
  };

  const handleRepoSelect = (repo: Repository) => {
    const repoFullName = repo.fullName || `${repo.owner}/${repo.name}`;
    setSelectedRepo(repoFullName);
    setRepoPopoverOpen(false);
    setSelectedBranch(""); // Reset branch when repo changes
    loadBranches(repo);
  };

  const handleBranchSelect = (branch: string) => {
    setSelectedBranch(branch);
    setBranchPopoverOpen(false);
  };

  const selectedRepoData = repositories.find(r => {
    const fullName = r.fullName || `${r.owner}/${r.name}`;
    return fullName === selectedRepo;
  }) || (selectedRepo ? {
    owner: selectedRepo.split('/')[0],
    name: selectedRepo.split('/')[1],
    fullName: selectedRepo,
  } : null);

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
                    {loadingRepos ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-5 h-5 text-neutral-400 animate-spin" />
                      </div>
                    ) : repositories.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-xs text-neutral-400">No repositories found</p>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        {repositories.map((repo) => {
                          const repoFullName = repo.fullName || `${repo.owner}/${repo.name}`;
                          const isSelected = selectedRepo === repoFullName;
                          return (
                            <div
                              key={repo.id || repoFullName}
                              onClick={() => handleRepoSelect(repo)}
                              className={cn(
                                "p-3 rounded-lg cursor-pointer transition-colors",
                                isSelected
                                  ? "bg-blue-500/10 border border-blue-500"
                                  : "hover:bg-neutral-800"
                              )}
                            >
                              <div className="flex items-center gap-2">
                                <GitBranch className="w-4 h-4 text-neutral-400" />
                                <span className="text-sm text-white font-medium">{repoFullName}</span>
                              </div>
                              {repo.description && (
                                <p className="text-xs text-neutral-400 mt-1">{repo.description}</p>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
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
                    {loadingBranches ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-5 h-5 text-neutral-400 animate-spin" />
                      </div>
                    ) : availableBranches.length === 0 ? (
                      <div className="text-center py-8">
                        <p className="text-xs text-neutral-400">No branches found</p>
                      </div>
                    ) : (
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
                    )}
                  </PopoverContent>
                </Popover>

                {/* View Commits Button */}
                <button
                  onClick={() => handleSendMessage({
                    message: "",
                    files: [],
                    pastedContent: [],
                    model: "gpt-4o",
                    isThinkingEnabled: false
                  })}
                  disabled={!selectedRepo || !selectedBranch}
                  className={cn(
                    "px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-full text-white text-xs font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ml-2",
                  )}
                >
                  View Commits
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
