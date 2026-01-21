import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/app/components/DashboardLayout";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { GitBranch, MessageSquare, Send, Copy, CheckCircle2, Github, GitCommit, AlertCircle, Loader2, FileText, BarChart2, RefreshCw } from "lucide-react";
import { Badge } from "@/app/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { getRepositoryCommits, getRepositoryBranches, getUserRepositories, sendChatMessage, getCommitAnalysis, getRepositoryDetails, type Commit, type Repository, type Branch, type ChatMessage, type CommitAnalysis, type RepositoryDetails } from "@/lib/api";

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


export function CommitsPage() {
  const [searchParams] = useSearchParams();
  const [owner, setOwner] = useState<string>("");
  const [repoName, setRepoName] = useState<string>("");
  const [selectedRepo, setSelectedRepo] = useState("github-code-analyzer");
  const [selectedBranch, setSelectedBranch] = useState("main");
  const [selectedCommit, setSelectedCommit] = useState<string | null>(null);

  // Chat State
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isLoadingChat, setIsLoadingChat] = useState(false);

  // Analysis State
  const [analysis, setAnalysis] = useState<CommitAnalysis | null>(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [activeTab, setActiveTab] = useState<"chat" | "analysis">("chat");
  const [repositoryDetails, setRepositoryDetails] = useState<RepositoryDetails | null>(null);
  const [loadingRepositoryDetails, setLoadingRepositoryDetails] = useState(false);

  // Data State
  const [commits, setCommits] = useState<Commit[]>([]);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loadingCommits, setLoadingCommits] = useState(false);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(false);

  const autoAnswerTriggered = useRef(false);
  const chatMessagesEndRef = useRef<HTMLDivElement>(null);

  // Read URL query parameters
  useEffect(() => {
    const ownerParam = searchParams.get("owner");
    const repoParam = searchParams.get("repo");
    const branchParam = searchParams.get("branch");
    const questionParam = searchParams.get("question");

    if (ownerParam && repoParam) {
      setOwner(ownerParam);
      setRepoName(repoParam);
      setSelectedRepo(repoParam);
    } else if (repoParam) {
      setSelectedRepo(repoParam);
    }

    if (branchParam) {
      setSelectedBranch(branchParam);
    }

    if (questionParam) {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const rawQuestion = urlParams.get("question");

        let finalQuestion: string;
        if (rawQuestion) {
          if (rawQuestion.includes('%')) {
            try { finalQuestion = decodeURIComponent(rawQuestion); } catch { finalQuestion = rawQuestion; }
          } else {
            finalQuestion = rawQuestion;
          }
        } else {
          finalQuestion = questionParam;
        }

        setChatMessages([{ role: "user", content: finalQuestion }]);
        autoAnswerTriggered.current = false;

        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete("question");
        window.history.replaceState({}, "", `${window.location.pathname}?${newSearchParams.toString()}`);
      } catch (error) {
        console.error('Error processing question:', error);
        setChatMessages([{ role: "user", content: questionParam }]);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    loadRepositories();
  }, []);

  useEffect(() => {
    if (owner && repoName) {
      loadBranches(owner, repoName);
    }
  }, [owner, repoName]);

  useEffect(() => {
    if (owner && repoName && selectedBranch) {
      loadCommits(owner, repoName, selectedBranch);
    }
  }, [owner, repoName, selectedBranch]);

  const handleAutoAnswer = useCallback(async () => {
    if (chatMessages.length === 0 || isLoadingChat || autoAnswerTriggered.current) return;

    autoAnswerTriggered.current = true;
    setIsLoadingChat(true);
    try {
      const response = await sendChatMessage(
        chatMessages,
        commits,
        selectedCommit || undefined,
        owner,
        repoName
      );

      setChatMessages(prev => [...prev, {
        role: "assistant",
        content: response.message
      }]);
    } catch (error: any) {
      console.error("Error sending chat message:", error);
      setChatMessages(prev => [...prev, {
        role: "assistant",
        content: `오류가 발생했습니다: ${error.message}`
      }]);
    } finally {
      setIsLoadingChat(false);
    }
  }, [chatMessages, commits, selectedCommit, isLoadingChat, owner, repoName]);

  useEffect(() => {
    if (commits.length > 0 && chatMessages.length === 1 && chatMessages[0].role === "user" && !isLoadingChat && !autoAnswerTriggered.current) {
      handleAutoAnswer();
    }
  }, [commits, chatMessages, isLoadingChat, handleAutoAnswer]);

  useEffect(() => {
    if (chatMessagesEndRef.current) {
      chatMessagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isLoadingChat]);

  const loadRepositories = async () => {
    setLoadingRepos(true);
    try {
      const repos = await getUserRepositories();
      setRepositories(repos);
    } catch (error) {
      console.error("Error loading repositories:", error);
    } finally {
      setLoadingRepos(false);
    }
  };

  const loadBranches = async (owner: string, repo: string) => {
    setLoadingBranches(true);
    try {
      // Find the repository to get its ID
      const repos = await getUserRepositories();
      const selectedRepo = repos.find(r => r.owner === owner && r.name === repo);

      if (selectedRepo) {
        const branchList = await getRepositoryBranches(selectedRepo.id);
        setBranches(branchList);
      } else {
        console.warn('Repository not found in user repositories');
        setBranches([]);
      }
    } catch (error) {
      console.error("Error loading branches:", error);
    } finally {
      setLoadingBranches(false);
    }
  };

  const loadCommits = async (owner: string, repo: string, branch: string) => {
    setLoadingCommits(true);
    try {
      // Find the repository to get its ID
      const repoObj = repositories.find(r => r.name === repo && r.owner === owner)
        || repositories.find(r => r.fullName === `${owner}/${repo}`);

      let commitList: Commit[] = [];

      if (repoObj && repoObj.id) {
        console.log('Fetching commit activities for repoId:', repoObj.id);
        // Use the new activities endpoint if we have an ID
        // We'll import getRepositoryCommitActivities dynamically or add it to imports
        // Assuming we added it to imports (Action required: update imports)
        const { getRepositoryCommitActivities } = await import("@/lib/api");
        const activities = await getRepositoryCommitActivities(repoObj.id);

        // Map activities to Commit interface
        commitList = activities.map(activity => ({
          sha: activity.sha,
          message: activity.message,
          committedAt: activity.committedAt,
          time: activity.committedAt, // formatted time usually done in component but map here
          author: activity.authorName, // map authorName to author
          authorName: activity.authorName,
          username: activity.authorName, // Add username
          authorProfileUrl: activity.authorProfileUrl,
          analysisStatus: activity.analysisStatus,
          totalScore: activity.totalScore,
          branch: branch, // assume current branch or gathered
          verified: false // default
        }));
      } else {
        // Fallback: If we can't find the repository, try to fetch it
        console.warn('Repository not found in repositories list, fetching repositories...');
        const repos = await getUserRepositories();
        const selectedRepo = repos.find(r => r.owner === owner && r.name === repo);

        if (selectedRepo) {
          commitList = await getRepositoryCommits(selectedRepo.id, branch, 1, 20);
        } else {
          console.error('Could not find repository');
        }
      }

      // Deduplicate commits by SHA (backend API returns duplicates)
      const uniqueCommits = commitList.reduce((acc: Commit[], commit) => {
        if (!acc.find(c => c.sha === commit.sha)) {
          acc.push(commit);
        }
        return acc;
      }, []);

      setCommits(uniqueCommits);

      // Load repository details if no commit is selected
      if (!selectedCommit && repoObj?.id) {
        loadRepositoryDetails(repoObj.id);
      }
    } catch (error) {
      console.error("Error loading commits:", error);
      setCommits([]);
    } finally {
      setLoadingCommits(false);
    }
  };

  const handleRepoChange = async (repoFullName: string) => {
    const [newOwner, newRepo] = repoFullName.split('/');
    setOwner(newOwner);
    setRepoName(newRepo);
    setSelectedRepo(newRepo);
    setSelectedBranch("main");
    setCommits([]);
    setSelectedCommit(null);
    setAnalysis(null);
  };

  const handleBranchChange = (branch: string) => {
    setSelectedBranch(branch);
  };

  const handleSend = async () => {
    if (message.trim() && !isLoadingChat) {
      const userMessage: ChatMessage = { role: "user", content: message };
      const updatedMessages = [...chatMessages, userMessage];
      setChatMessages(updatedMessages);
      setMessage("");
      setIsLoadingChat(true);

      try {
        const response = await sendChatMessage(
          updatedMessages,
          commits,
          selectedCommit || undefined,
          owner,
          repoName
        );

        setChatMessages(prev => [...prev, {
          role: "assistant",
          content: response.message
        }]);
      } catch (error: any) {
        console.error("Error sending chat message:", error);
        setChatMessages(prev => [...prev, {
          role: "assistant",
          content: `Error: ${error.message}`
        }]);
      } finally {
        setIsLoadingChat(false);
      }
    }
  };

  const loadCommitAnalysis = async (sha: string) => {
    if (!owner || !repoName) return;

    setLoadingAnalysis(true);
    // Find the repo ID if needed, but we used owner/repo in API function signature for now.
    // The API implementation assumes we pass owner as repoId if it's not mapped. 
    // Wait, I updated getCommitAnalysis to take owner, repo, sha. 
    // And in api.ts I used `/api/repos/${repo}/commits/${sha}/analysis`.
    // This looks correct if the backend accepts repo name or if I pass ID.
    // Let's pass repoName as 'repo' and owner.

    // Actually, looking at `getCommitAnalysis` implementation in `api.ts`:
    // It uses `/api/repos/${repo}/commits/${sha}/analysis`.
    // If the proxy expects `repoId`, passing `repoName` might fail if it's not a number.
    // But let's assume the backend or my proxy is smart enough or I need to fix it.
    // Ideally I should pass the REPO ID.
    // I have `repositories` state which has IDs.
    const repoObj = repositories.find(r => r.name === repoName && r.owner === owner)
      || repositories.find(r => r.fullName === `${owner}/${repoName}`);

    const repoIdToUse = repoObj?.id || repoName; // Fallback to name if ID not found

    try {
      console.log('Fetching analysis for:', repoIdToUse, sha);
      const data = await getCommitAnalysis(repoIdToUse, sha);
      setAnalysis(data);

      // If status is PENDING or IN_PROGRESS, we might want to poll.
      // For now, let's just display what we have.
    } catch (error) {
      console.error("Error loading analysis:", error);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  const loadRepositoryDetails = async (repoId: string) => {
    setLoadingRepositoryDetails(true);
    try {
      const details = await getRepositoryDetails(repoId);
      setRepositoryDetails(details);
    } catch (error) {
      console.error("Error loading repository details:", error);
      setRepositoryDetails(null);
    } finally {
      setLoadingRepositoryDetails(false);
    }
  };

  const handleCommitSelect = (sha: string) => {
    if (selectedCommit === sha) return;
    setSelectedCommit(sha);
    setActiveTab("analysis"); // Switch to analysis tab when commit selected
    loadCommitAnalysis(sha);
    setRepositoryDetails(null); // Clear repository details when commit is selected
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-4rem)] flex flex-col bg-[#0d1117]">
        {/* Top Header */}
        <div className="px-4 py-2.5 border-b border-white/10 bg-[#0d1117]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <h1 className="text-base font-semibold text-white">Commits</h1>
              <span className="text-xs text-white/40">·</span>
              <span className="text-xs text-white/60">
                {owner && repoName ? `${owner}/${repoName}` : selectedRepo}
              </span>
              <span className="text-xs text-white/40">·</span>
              <span className="text-xs text-white/60">{selectedBranch}</span>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={owner && repoName ? `${owner}/${repoName}` : selectedRepo}
                onValueChange={handleRepoChange}
              >
                <SelectTrigger className="w-48 bg-white/5 border-white/10 text-white h-7 text-xs">
                  <SelectValue placeholder="Select repository">
                    {owner && repoName ? `${owner}/${repoName}` : selectedRepo || 'Select repository'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-white/5 backdrop-blur-md border-white/10">
                  {repositories.map((repo) => {
                    const fullName = repo.fullName || `${repo.owner}/${repo.name}`;
                    return (
                      <SelectItem key={repo.id || fullName} value={fullName} className="text-white focus:bg-white/10 text-xs">
                        {fullName}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <Select value={selectedBranch} onValueChange={handleBranchChange}>
                <SelectTrigger className="w-24 bg-white/5 border-white/10 text-white h-7 text-xs">
                  <SelectValue placeholder="Branch">
                    {selectedBranch || 'Branch'}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent className="bg-white/5 backdrop-blur-md border-white/10">
                  {branches.map((branch) => (
                    <SelectItem key={branch.name} value={branch.name} className="text-white focus:bg-white/10 text-xs">
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Commit List */}
          <div className="w-[360px] border-r border-white/10 bg-[#0d1117] flex flex-col flex-shrink-0">
            <div className="px-3 border-b border-white/10 bg-white/5 flex items-center justify-between h-10">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-white">Commits</span>
                {commits.length > 0 && <span className="text-xs text-[#7d8590]">{commits.length} commits</span>}
              </div>
              <button
                onClick={async () => {
                  if (owner && repoName && repositories.length > 0) {
                    const repo = repositories.find(r => r.owner === owner && r.name === repoName);
                    if (repo) {
                      try {
                        const { syncRepository } = await import("@/lib/api");
                        await syncRepository(repo.id);
                        // Optionally reload commits after sync
                        await loadCommits(owner, repoName, selectedBranch);
                      } catch (error) {
                        console.error('Error syncing repository:', error);
                      }
                    }
                  }
                }}
                className="flex items-center gap-1 px-2 py-1 text-xs text-white/60 hover:text-white hover:bg-white/10 rounded transition-colors"
                title="Sync repository with GitHub"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Sync</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto bg-[#0d1117]">
              {loadingCommits ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 text-white/40 animate-spin" />
                </div>
              ) : commits.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <GitCommit className="w-12 h-12 text-white/40 mx-auto mb-4" />
                    <p className="text-xs text-white/60">No commits found</p>
                  </div>
                </div>
              ) : (
                <div className="divide-y divide-[#30363d]">
                  {commits.map((commit) => (
                    <div
                      key={commit.sha}
                      onClick={() => handleCommitSelect(commit.sha)}
                      className={`group px-3 py-2 bg-[#0d1117] hover:bg-white/10 transition-colors cursor-pointer ${selectedCommit === commit.sha ? 'bg-white/10 border-l-2 border-l-[#7aa2f7]' : ''
                        }`}
                    >
                      <div className="flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            {selectedCommit === commit.sha && (
                              <CheckCircle2 className="w-3 h-3 text-[#7aa2f7] flex-shrink-0" />
                            )}
                            <span className="text-xs text-white font-normal leading-tight line-clamp-2">{commit.message}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-[#7d8590]">
                            <span className="truncate max-w-[80px]" title={commit.author}>{commit.author}</span>
                            <span className="flex-shrink-0">·</span>
                            <span className="flex-shrink-0 whitespace-nowrap">{commit.time}</span>
                            {commit.totalScore !== undefined && commit.totalScore > 0 && (
                              <>
                                <span>·</span>
                                <span className={commit.totalScore >= 80 ? "text-green-400" : commit.totalScore >= 50 ? "text-yellow-400" : "text-red-400"}>
                                  Score: {commit.totalScore}
                                </span>
                              </>
                            )}
                            {commit.analysisStatus && (
                              <span className={`px-1 rounded text-[8px] border ${commit.analysisStatus === 'COMPLETED' ? 'border-green-500/30 text-green-400' :
                                commit.analysisStatus === 'PENDING' ? 'border-neutral-500/30 text-neutral-400' :
                                  'border-blue-500/30 text-blue-400'
                                }`}>
                                {commit.analysisStatus}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Repo Stats Widget */}
            <div className="border-t border-[#30363d] bg-[#0d1117] overflow-y-auto max-h-48">
              <div className="p-3">
                <div className="px-2 py-1.5 mb-2">
                  <h3 className="text-xs font-medium text-white">Repository Stats</h3>
                </div>
                <div className="space-y-1.5">
                  {languageData.map((lang) => (
                    <div key={lang.name} className="flex items-center gap-1.5">
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: lang.color }}></div>
                      <span className="text-xs text-white flex-1 min-w-0 truncate">{lang.name}</span>
                      <span className="text-xs text-white/60 tabular-nums">{lang.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Analysis & Chat */}
          <div className="flex-1 flex flex-col bg-[#0d1117] min-w-0 h-full overflow-hidden">
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="flex-1 flex flex-col">
              <div className="px-3 border-b border-white/10 bg-white/5 flex items-center justify-between h-10 flex-shrink-0">
                <TabsList className="bg-transparent h-8 p-0">
                  <TabsTrigger value="chat" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-xs text-white/60 h-7 px-3 rounded-md">
                    <MessageSquare className="w-3 h-3 mr-1.5" />
                    Chat
                  </TabsTrigger>
                  <TabsTrigger value="analysis" className="data-[state=active]:bg-white/10 data-[state=active]:text-white text-xs text-white/60 h-7 px-3 rounded-md">
                    <BarChart2 className="w-3 h-3 mr-1.5" />
                    Analysis
                  </TabsTrigger>
                </TabsList>

                {selectedCommit && (
                  <code className="text-[10px] text-[#7aa2f7] font-mono bg-[#0d1117] px-1.5 py-0.5 rounded border border-white/10">
                    {selectedCommit.substring(0, 7)}
                  </code>
                )}
              </div>

              <TabsContent value="chat" className="flex-1 flex flex-col min-h-0 data-[state=inactive]:hidden mt-0">
                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-4 min-h-0 bg-[#0d1117] relative">
                  {chatMessages.length === 0 && !isLoadingChat ? (
                    <div className="flex items-center justify-center h-full text-center">
                      <div className="max-w-md">
                        <Github className="w-16 h-16 text-white/40 mx-auto mb-4" />
                        <p className="text-sm text-white/80 mb-2 font-medium">
                          AI Assistant
                        </p>
                        <p className="text-xs text-white/50 leading-relaxed">
                          Ask questions about the repository or select a commit to analyze it.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4 max-w-3xl mx-auto pb-4">
                      {chatMessages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[85%] px-4 py-3 rounded-lg text-xs leading-relaxed ${msg.role === 'user'
                            ? 'bg-[#7aa2f7] text-white'
                            : 'bg-white/5 border border-white/10 text-white'
                            }`}>
                            <div className="whitespace-pre-wrap break-words">{msg.content}</div>
                          </div>
                        </div>
                      ))}
                      {isLoadingChat && (
                        <div className="flex justify-start">
                          <div className="max-w-[85%] px-4 py-3 rounded-lg text-xs bg-white/5 border border-white/10 text-white">
                            <div className="flex items-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin text-[#7aa2f7]" />
                              <span>Thinking...</span>
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={chatMessagesEndRef} />
                    </div>
                  )}
                </div>

                {/* Chat Input */}
                <div className="px-4 py-3 border-t border-white/10 bg-white/5">
                  <div className="flex gap-2 max-w-3xl mx-auto">
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                      placeholder="Ask a question..."
                      className="flex-1 bg-[#0d1117] border-white/10 text-white text-xs h-9"
                      disabled={isLoadingChat}
                    />
                    <Button
                      onClick={handleSend}
                      disabled={!message.trim() || isLoadingChat}
                      className="bg-[#7aa2f7] hover:bg-[#7dcfff] h-9 px-4"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="analysis" className="flex-1 overflow-y-auto p-6 data-[state=inactive]:hidden mt-0">
                {!selectedCommit ? (
                  <div className="flex items-center justify-center h-full text-center text-white/50">
                    <div>
                      <GitCommit className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className="text-sm">Select a commit to view analysis</p>
                    </div>
                  </div>
                ) : loadingAnalysis ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-8 h-8 text-[#7aa2f7] animate-spin" />
                    <span className="ml-3 text-white/60 text-sm">Analyzing commit...</span>
                  </div>
                ) : analysis ? (
                  <div className="max-w-4xl mx-auto space-y-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h2 className="text-xl font-semibold text-white mb-2">{analysis.message}</h2>
                        <div className="flex items-center gap-3 text-xs text-white/50">
                          <span className="flex items-center gap-1">
                            <Github className="w-3 h-3" />
                            {analysis.authorName}
                          </span>
                          <span>{analysis.committedAt}</span>
                          <span className="font-mono text-[#7aa2f7]">{analysis.sha.substring(0, 7)}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-[#7aa2f7]">{analysis.totalScore}</div>
                        <div className="text-xs text-white/40 uppercase tracking-wider mt-1">Total Score</div>
                      </div>
                    </div>

                    {/* Scores Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {[
                        { label: "Code Quality", score: analysis.codeQuality },
                        { label: "Message Quality", score: analysis.commitMessageQuality },
                        { label: "Necessity", score: analysis.necessity },
                        { label: "Correctness", score: analysis.correctnessAndRisk },
                      ].map((stat) => (
                        <div key={stat.label} className="bg-white/5 border border-white/10 rounded-lg p-3">
                          <div className="text-xs text-white/50 mb-1 whitespace-nowrap">{stat.label}</div>
                          <div className="text-lg font-semibold text-white">{stat.score ?? '-'}</div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-6">
                      {analysis.summary && (
                        <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                          <h3 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-[#7aa2f7]" />
                            Summary
                          </h3>
                          <p className="text-sm text-white/80 leading-relaxed">{analysis.summary}</p>
                        </div>
                      )}

                      <div className="grid md:grid-cols-2 gap-6">
                        {analysis.strengths && (
                          <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-4">
                            <h3 className="text-sm font-semibold text-green-400 mb-2">Strengths</h3>
                            {(() => {
                              try {
                                const items = JSON.parse(analysis.strengths);
                                if (Array.isArray(items)) {
                                  return (
                                    <ul className="text-sm text-white/80 leading-relaxed space-y-2">
                                      {items.map((item, idx) => (
                                        <li key={idx} className="flex gap-2">
                                          <span className="text-green-400 mt-1">•</span>
                                          <span>{item}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  );
                                }
                              } catch {
                                // If not JSON, display as is
                              }
                              return <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">{analysis.strengths}</p>;
                            })()}
                          </div>
                        )}

                        {analysis.issues && (
                          <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4">
                            <h3 className="text-sm font-semibold text-red-400 mb-2">Issues</h3>
                            {(() => {
                              try {
                                const items = JSON.parse(analysis.issues);
                                if (Array.isArray(items)) {
                                  return (
                                    <ul className="text-sm text-white/80 leading-relaxed space-y-2">
                                      {items.map((item, idx) => (
                                        <li key={idx} className="flex gap-2">
                                          <span className="text-red-400 mt-1">•</span>
                                          <span>{item}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  );
                                }
                              } catch {
                                // If not JSON, display as is
                              }
                              return <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">{analysis.issues}</p>;
                            })()}
                          </div>
                        )}
                      </div>

                      {analysis.suggestedNextCommit && (
                        <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-4">
                          <h3 className="text-sm font-semibold text-blue-400 mb-2">Suggested Next Steps</h3>
                          {(() => {
                            try {
                              const items = JSON.parse(analysis.suggestedNextCommit);
                              if (Array.isArray(items)) {
                                return (
                                  <ul className="text-sm text-white/80 leading-relaxed space-y-2">
                                    {items.map((item, idx) => (
                                      <li key={idx} className="flex gap-2">
                                        <span className="text-blue-400 mt-1">•</span>
                                        <span>{item}</span>
                                      </li>
                                    ))}
                                  </ul>
                                );
                              }
                            } catch {
                              // If not JSON, display as is
                            }
                            return <p className="text-sm text-white/80 leading-relaxed">{analysis.suggestedNextCommit}</p>;
                          })()}
                        </div>
                      )}
                    </div>
                  </div>
                ) : loadingRepositoryDetails ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader2 className="w-8 h-8 text-white/40 animate-spin" />
                  </div>
                ) : repositoryDetails ? (
                  <div className="p-6 space-y-6 overflow-y-auto">
                    {/* Repository Header */}
                    <div className="border-b border-white/10 pb-6">
                      <h2 className="text-2xl font-bold text-white mb-2">{repositoryDetails.reponame}</h2>
                      {repositoryDetails.description && (
                        <p className="text-sm text-white/60 mb-4">{repositoryDetails.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-white/50">
                        <span className="flex items-center gap-1">
                          <Github className="w-3 h-3" />
                          {repositoryDetails.language}
                        </span>
                        <span>⭐ {repositoryDetails.stars}</span>
                        <span>{(repositoryDetails.size / 1024).toFixed(1)} MB</span>
                      </div>
                    </div>

                    {/* Topics */}
                    {repositoryDetails.topics && repositoryDetails.topics.length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-white mb-2">Topics</h3>
                        <div className="flex flex-wrap gap-2">
                          {repositoryDetails.topics.map((topic, idx) => (
                            <span key={idx} className="px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded text-xs text-blue-400">
                              {topic}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Languages */}
                    {repositoryDetails.languages && Object.keys(repositoryDetails.languages).length > 0 && (
                      <div>
                        <h3 className="text-sm font-semibold text-white mb-3">Languages</h3>
                        <div className="space-y-2">
                          {Object.entries(repositoryDetails.languages)
                            .sort(([, a], [, b]) => b - a)
                            .slice(0, 5)
                            .map(([lang, bytes]) => {
                              const total = Object.values(repositoryDetails.languages).reduce((sum, val) => sum + val, 0);
                              const percentage = ((bytes / total) * 100).toFixed(1);
                              return (
                                <div key={lang}>
                                  <div className="flex items-center justify-between text-xs mb-1">
                                    <span className="text-white/80">{lang}</span>
                                    <span className="text-white/50">{percentage}%</span>
                                  </div>
                                  <div className="w-full bg-white/10 rounded-full h-1.5">
                                    <div
                                      className="bg-blue-500 h-1.5 rounded-full"
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    )}

                    {/* Repository Info */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                        <div className="text-xs text-white/50 mb-1">Created</div>
                        <div className="text-sm text-white">{new Date(repositoryDetails.createdAt).toLocaleDateString()}</div>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                        <div className="text-xs text-white/50 mb-1">Last Updated</div>
                        <div className="text-sm text-white">{new Date(repositoryDetails.updatedAt).toLocaleDateString()}</div>
                      </div>
                      <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                        <div className="text-xs text-white/50 mb-1">Last Push</div>
                        <div className="text-sm text-white">{new Date(repositoryDetails.pushedAt).toLocaleDateString()}</div>
                      </div>
                      {repositoryDetails.lastSyncAt && (
                        <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                          <div className="text-xs text-white/50 mb-1">Last Sync</div>
                          <div className="text-sm text-white">{new Date(repositoryDetails.lastSyncAt).toLocaleDateString()}</div>
                        </div>
                      )}
                    </div>

                    {/* Repository URL */}
                    <div>
                      <a
                        href={repositoryDetails.repoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        <Github className="w-4 h-4" />
                        View on GitHub
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full text-white/50">
                    Select a commit to view analysis or repository details will appear here
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}