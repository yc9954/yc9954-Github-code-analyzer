import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/app/components/DashboardLayout";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { GitBranch, MessageSquare, Send, Copy, CheckCircle2, Github, GitCommit, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Badge } from "@/app/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table";
import { getRepositoryCommits, getRepositoryBranches, getUserRepositories, type Commit, type Repository, type Branch } from "@/lib/api";
import githubAvatar from "@/assets/38ba5abba51d546a081340d28143511ad0f46c8f.png";

// Repository Analysis Data

const contributors = [
  { name: "johndoe", commits: 145, additions: 12453, deletions: 3421, avatar: "johndoe" },
  { name: "janedoe", commits: 123, additions: 9876, deletions: 2134, avatar: "janedoe" },
  { name: "bobsmith", commits: 98, additions: 7654, deletions: 1987, avatar: "bobsmith" },
  { name: "alice", commits: 87, additions: 6543, deletions: 1654, avatar: "alice" },
  { name: "carol", commits: 76, additions: 5432, deletions: 1543, avatar: "carol" },
  { name: "dave", commits: 64, additions: 4321, deletions: 1234, avatar: "dave" },
];

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
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{ role: string; content: string }>>([]);
  const [commits, setCommits] = useState<Commit[]>([]);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loadingCommits, setLoadingCommits] = useState(false);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [loadingBranches, setLoadingBranches] = useState(false);

  // Read URL query parameters
  useEffect(() => {
    const ownerParam = searchParams.get("owner");
    const repoParam = searchParams.get("repo");
    const branchParam = searchParams.get("branch");
    
    if (ownerParam && repoParam) {
      setOwner(ownerParam);
      setRepoName(repoParam);
      setSelectedRepo(repoParam);
    } else if (repoParam) {
      // owner가 없으면 repo 이름만 사용 (기존 방식 호환)
      setSelectedRepo(repoParam);
    }
    
    if (branchParam) {
      setSelectedBranch(branchParam);
    }
  }, [searchParams]);

  // Load repositories
  useEffect(() => {
    loadRepositories();
  }, []);

  // Load branches when repo changes
  useEffect(() => {
    if (owner && repoName) {
      loadBranches(owner, repoName);
    }
  }, [owner, repoName]);

  // Load commits when repo or branch changes
  useEffect(() => {
    if (owner && repoName && selectedBranch) {
      loadCommits(owner, repoName, selectedBranch);
    }
  }, [owner, repoName, selectedBranch]);

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
      const branchList = await getRepositoryBranches(owner, repo);
      setBranches(branchList);
    } catch (error) {
      console.error("Error loading branches:", error);
    } finally {
      setLoadingBranches(false);
    }
  };

  const loadCommits = async (owner: string, repo: string, branch: string) => {
    setLoadingCommits(true);
    try {
      const commitList = await getRepositoryCommits(owner, repo, branch);
      setCommits(commitList);
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
    setSelectedBranch("main"); // Reset branch
    setCommits([]); // Clear commits
  };

  const handleBranchChange = (branch: string) => {
    setSelectedBranch(branch);
  };

  const handleSend = () => {
    if (message.trim()) {
      setChatMessages([...chatMessages, { role: "user", content: message }]);
      setMessage("");
      // Simulate AI response
      setTimeout(() => {
        setChatMessages(prev => [...prev, { 
          role: "assistant", 
          content: selectedCommit 
            ? `I've analyzed commit ${selectedCommit}. The main changes include authentication fixes, OAuth improvements, and database schema updates. Would you like me to review any specific part in detail?`
            : "I've analyzed the recent commits. The main changes include authentication fixes, OAuth improvements, and database schema updates. Would you like me to review any specific commit in detail?"
        }]);
      }, 1000);
    }
  };

  const handleCommitSelect = (sha: string) => {
    setSelectedCommit(sha);
    setChatMessages([]);
    setMessage("");
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-4rem)] flex flex-col bg-[#0d1117]">
        {/* Top Header - Compact */}
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
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white/5 backdrop-blur-md border-white/10">
                  {loadingRepos ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-4 h-4 text-white animate-spin" />
                    </div>
                  ) : repositories.length === 0 ? (
                    <div className="px-2 py-4 text-xs text-white/60">No repositories found</div>
                  ) : (
                    repositories.map((repo) => {
                      const fullName = repo.fullName || `${repo.owner}/${repo.name}`;
                      return (
                        <SelectItem key={repo.id || fullName} value={fullName} className="text-white focus:bg-white/10 text-xs">
                          {fullName}
                        </SelectItem>
                      );
                    })
                  )}
                </SelectContent>
              </Select>
              <Select value={selectedBranch} onValueChange={handleBranchChange}>
                <SelectTrigger className="w-24 bg-white/5 border-white/10 text-white h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-white/5 backdrop-blur-md border-white/10">
                  {loadingBranches ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="w-4 h-4 text-white animate-spin" />
                    </div>
                  ) : branches.length === 0 ? (
                    <div className="px-2 py-4 text-xs text-white/60">No branches found</div>
                  ) : (
                    branches.map((branch) => (
                      <SelectItem key={branch.name} value={branch.name} className="text-white focus:bg-white/10 text-xs">
                        {branch.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Commit List */}
          <div className="w-[360px] border-r border-white/10 bg-[#0d1117] flex flex-col flex-shrink-0">
            {/* Commit List Header - Compact */}
            <div className="px-3 py-2 border-b border-[#30363d] bg-white/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-white">Commits</span>
                <span className="text-xs text-[#7d8590]">Jan 14</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Button variant="outline" size="sm" className="border-[#30363d] bg-transparent text-white hover:bg-[#0d1117] h-6 text-[10px] px-1.5">
                  All users
                </Button>
                <Button variant="outline" size="sm" className="border-[#30363d] bg-transparent text-white hover:bg-[#0d1117] h-6 text-[10px] px-1.5">
                  All time
                </Button>
              </div>
            </div>

            {/* Commit List - Dense */}
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
                      className={`group px-3 py-2 bg-[#0d1117] hover:bg-white/10 transition-colors cursor-pointer ${
                        selectedCommit === commit.sha ? 'bg-white/10 border-l-2 border-l-[#7aa2f7]' : ''
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-1">
                            {selectedCommit === commit.sha && (
                              <CheckCircle2 className="w-3 h-3 text-[#7aa2f7] flex-shrink-0" />
                            )}
                            <span className="text-xs text-white font-normal leading-tight line-clamp-2">{commit.message}</span>
                            {commit.verified && (
                              <Badge className="bg-transparent border border-[#30363d] text-[#3fb950] hover:bg-transparent h-4 text-[10px] px-1 ml-auto flex-shrink-0">
                                Verified
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-[#7d8590]">
                            <span className="truncate">{commit.author}</span>
                            <span>·</span>
                            <span>{commit.time}</span>
                            <span>·</span>
                            <div className="flex items-center gap-0.5">
                              <GitBranch className="w-2.5 h-2.5" />
                              <span className="truncate">{commit.branch}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-5 px-1 text-[#7d8590] hover:text-white"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText(commit.sha);
                            }}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                          <code className="text-[10px] text-[#7d8590] font-mono bg-[#0d1117] px-1.5 py-0.5 rounded border border-[#30363d]">
                            {commit.sha.substring(0, 7)}
                          </code>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Analysis Widgets - Bottom of Left Panel */}
            <div className="border-t border-[#30363d] bg-[#0d1117] overflow-y-auto">
              <div className="p-3 space-y-4">
                {/* Languages */}
                <div>
                  <div className="px-2 py-1.5 mb-2">
                    <h3 className="text-xs font-medium text-white">Languages</h3>
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

                {/* Code Quality */}
                <div>
                  <div className="px-2 py-1.5 mb-2">
                    <h3 className="text-xs font-medium text-white">Code Quality</h3>
                  </div>
                  <div className="space-y-1.5">
                    {qualityMetrics.map((metric) => (
                      <div key={metric.name} className="space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-white/60">{metric.name}</span>
                          <span className="text-[10px] text-white font-medium">{metric.score}</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-1">
                          <div 
                            className="bg-[#7aa2f7] h-1 rounded-full" 
                            style={{ width: `${metric.score}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>


          {/* Right Panel - AI Chat */}
          <div className="flex-1 flex flex-col bg-[#0d1117] min-w-0">
            {/* AI Chat Section */}
            <div className="flex-1 flex flex-col">
                {/* Chat Header - Compact */}
                <div className="px-3 py-2 border-b border-white/10 bg-white/5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-white">AI Assistant</span>
                      {selectedCommit && (
                        <code className="text-[10px] text-[#7aa2f7] font-mono bg-[#0d1117] px-1.5 py-0.5 rounded border border-white/10">
                          {selectedCommit.substring(0, 7)}
                        </code>
                      )}
                    </div>
                  </div>
                </div>

                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-4 min-h-0 bg-[#0d1117]">
                  {chatMessages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-center">
                      <div className="max-w-md">
                        <Github className="w-16 h-16 text-white/40 mx-auto mb-4" />
                        <p className="text-sm text-white/80 mb-2 font-medium">
                          {selectedCommit 
                            ? "Ask questions about this commit"
                            : "Select a commit to start"}
                        </p>
                        <p className="text-xs text-white/50 leading-relaxed">
                          {selectedCommit 
                            ? "Get detailed insights about code changes, understand the impact of modifications, and receive suggestions for improvements. Ask about specific files, functions, or patterns in this commit."
                            : "Choose a commit from the list to begin analyzing code changes. Our AI assistant can help you understand modifications, review code quality, and provide insights about the selected commit."}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3 max-w-3xl mx-auto">
                      {chatMessages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[75%] px-3 py-2 rounded-lg text-xs leading-relaxed ${
                            msg.role === 'user' 
                              ? 'bg-[#7aa2f7] text-white' 
                              : 'bg-white/5 border border-white/10 text-white'
                          }`}>
                            {msg.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Chat Input - Compact */}
                <div className="px-4 py-2.5 border-t border-white/10 bg-white/5">
                  <div className="flex gap-2 max-w-3xl mx-auto">
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                      placeholder={selectedCommit ? `Ask about ${selectedCommit.substring(0, 7)}...` : "Ask about commits..."}
                      className="flex-1 bg-[#0d1117] border-white/10 text-white text-xs h-8 focus:border-[#7aa2f7]"
                    />
                    <Button 
                      onClick={handleSend}
                      size="sm" 
                      className="bg-[#7aa2f7] hover:bg-[#7dcfff] text-white border-0 h-8 px-3"
                      disabled={!message.trim()}
                    >
                      <Send className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}