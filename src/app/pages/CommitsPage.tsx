import { useState } from "react";
import { DashboardLayout } from "@/app/components/DashboardLayout";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { GitBranch, MessageSquare, Send, Copy, CheckCircle2, Github } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Badge } from "@/app/components/ui/badge";

const repositories = [
  { id: "1", name: "web-dashboard", fullName: "yc9954/web-dashboard" },
  { id: "2", name: "api-server", fullName: "yc9954/api-server" },
  { id: "3", name: "mobile-app", fullName: "yc9954/mobile-app" },
  { id: "4", name: "github-code-analyzer", fullName: "yc9954/github-code-analyzer" },
];

const commits = [
  {
    sha: "a1b2c3d",
    message: "Merge pull request #47 from vc9564/siaodhu/fix-auth-db-sync-NZsqZ",
    author: "Alice Johnson",
    username: "alicej",
    time: "2 hours ago",
    verified: true,
    branch: "main",
  },
  {
    sha: "e4f5g6h",
    message: "Fix file and comment count synchronization",
    author: "Bob Smith",
    username: "bobsmith",
    time: "4 hours ago",
    verified: true,
    branch: "main",
  },
  {
    sha: "i7j8k9l",
    message: "Fix Google OAuth with WebBrowser API",
    author: "Carol White",
    username: "carolw",
    time: "6 hours ago",
    verified: false,
    branch: "main",
  },
  {
    sha: "m0n1o2p",
    message: "Complete overhaul of database schema with auto-profile creation",
    author: "David Brown",
    username: "davidb",
    time: "8 hours ago",
    verified: true,
    branch: "develop",
  },
  {
    sha: "q3r4s5t",
    message: "Improve get-profile error logging for debugging",
    author: "Emma Davis",
    username: "emmad",
    time: "10 hours ago",
    verified: true,
    branch: "main",
  },
  {
    sha: "u6v7w8x",
    message: "Merge pull request #45 from vc9564/siaodhu/fix-auth-db-sync-NZsqZ",
    author: "Alice Johnson",
    username: "alicej",
    time: "12 hours ago",
    verified: true,
    branch: "main",
  },
  {
    sha: "y9z0a1b",
    message: "Fix Google OAuth login with Linking API",
    author: "Bob Smith",
    username: "bobsmith",
    time: "1 day ago",
    verified: false,
    branch: "feature/oauth",
  },
  {
    sha: "c2d3e4f",
    message: "Merge pull request #44 from vc9564/siaodhu/fix-auth-db-sync-NZsqZ",
    author: "Carol White",
    username: "carolw",
    time: "1 day ago",
    verified: true,
    branch: "main",
  },
];

export function CommitsPage() {
  const [selectedRepo, setSelectedRepo] = useState("github-code-analyzer");
  const [selectedCommit, setSelectedCommit] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{ role: string; content: string }>>([]);

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
        {/* Top Header - Refined */}
        <div className="px-6 py-4 border-b border-[#30363d] bg-[#0d1117]">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-[#e6edf3]">Commits</h1>
            <div className="flex items-center gap-3">
              <Select value={selectedRepo} onValueChange={setSelectedRepo}>
                <SelectTrigger className="w-56 bg-[#161b22] border-[#30363d] text-[#e6edf3] h-10 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#161b22] border-[#30363d]">
                  {repositories.map((repo) => (
                    <SelectItem key={repo.id} value={repo.name} className="text-[#e6edf3] focus:bg-[#21262d] text-sm">
                      {repo.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select defaultValue="main">
                <SelectTrigger className="w-32 bg-[#161b22] border-[#30363d] text-[#e6edf3] h-10 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#161b22] border-[#30363d]">
                  <SelectItem value="main" className="text-[#e6edf3] focus:bg-[#21262d] text-sm">main</SelectItem>
                  <SelectItem value="develop" className="text-[#e6edf3] focus:bg-[#21262d] text-sm">develop</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Commit List */}
          <div className="w-[420px] border-r border-[#30363d] bg-[#0d1117] flex flex-col flex-shrink-0">
            {/* Commit List Header - Refined */}
            <div className="px-5 py-3 border-b border-[#30363d] bg-[#161b22] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-[#e6edf3]">Commits</span>
                <span className="text-sm text-[#8b949e]">Jan 14</span>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="border-[#30363d] bg-transparent text-[#c9d1d9] hover:bg-[#21262d] h-8 text-xs px-3">
                  All users
                </Button>
                <Button variant="outline" size="sm" className="border-[#30363d] bg-transparent text-[#c9d1d9] hover:bg-[#21262d] h-8 text-xs px-3">
                  All time
                </Button>
              </div>
            </div>

            {/* Commit List - Clean */}
            <div className="flex-1 overflow-y-auto">
              <div className="divide-y divide-[#30363d]">
                {commits.map((commit) => (
                  <div
                    key={commit.sha}
                    onClick={() => handleCommitSelect(commit.sha)}
                    className={`group px-5 py-4 hover:bg-[#161b22] transition-colors cursor-pointer ${
                      selectedCommit === commit.sha ? 'bg-[#161b22] border-l-2 border-l-[#58a6ff]' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          {selectedCommit === commit.sha && (
                            <CheckCircle2 className="w-4 h-4 text-[#58a6ff] flex-shrink-0" />
                          )}
                          <span className="text-sm text-[#e6edf3] font-medium leading-tight line-clamp-2">{commit.message}</span>
                          {commit.verified && (
                            <Badge className="bg-[#3fb950]/10 border border-[#3fb950]/30 text-[#3fb950] hover:bg-[#3fb950]/10 h-5 text-xs px-2 ml-auto flex-shrink-0">
                              Verified
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[#8b949e]">
                          <span className="truncate font-medium">{commit.author}</span>
                          <span>·</span>
                          <span>{commit.time}</span>
                          <span>·</span>
                          <div className="flex items-center gap-1">
                            <GitBranch className="w-3 h-3" />
                            <span className="truncate">{commit.branch}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d]"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigator.clipboard.writeText(commit.sha);
                          }}
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </Button>
                        <code className="text-xs text-[#8b949e] font-mono bg-[#0d1117] px-2 py-1 rounded border border-[#30363d]">
                          {commit.sha.substring(0, 7)}
                        </code>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel - AI Chat */}
          <div className="flex-1 flex flex-col bg-[#0d1117] min-w-0">
            {/* Chat Header - Refined */}
            <div className="px-5 py-3 border-b border-[#30363d] bg-[#161b22]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-[#e6edf3]">AI Assistant</span>
                  {selectedCommit && (
                    <code className="text-xs text-[#58a6ff] font-mono bg-[#0d1117] px-2 py-1 rounded border border-[#30363d]">
                      {selectedCommit.substring(0, 7)}
                    </code>
                  )}
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 min-h-0">
              {chatMessages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-center">
                  <div className="max-w-lg">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-[#58a6ff]/20 to-[#388bfd]/20 rounded-2xl flex items-center justify-center ring-1 ring-[#58a6ff]/30">
                      <Github className="w-10 h-10 text-[#58a6ff]" />
                    </div>
                    <p className="text-base text-[#e6edf3] mb-3 font-semibold">
                      {selectedCommit
                        ? "Ask questions about this commit"
                        : "Select a commit to start"}
                    </p>
                    <p className="text-sm text-[#8b949e] leading-relaxed">
                      {selectedCommit
                        ? "Get detailed insights about code changes, understand the impact of modifications, and receive suggestions for improvements. Ask about specific files, functions, or patterns in this commit."
                        : "Choose a commit from the list to begin analyzing code changes. Our AI assistant can help you understand modifications, review code quality, and provide insights about the selected commit."}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 max-w-4xl mx-auto">
                  {chatMessages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] px-4 py-3 rounded-xl text-sm leading-relaxed ${
                        msg.role === 'user'
                          ? 'bg-[#58a6ff] text-white'
                          : 'bg-[#161b22] border border-[#30363d] text-[#e6edf3]'
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Chat Input - Clean and spacious */}
            <div className="px-6 py-4 border-t border-[#30363d] bg-[#161b22]">
              <div className="flex gap-3 max-w-4xl mx-auto">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder={selectedCommit ? `Ask about ${selectedCommit.substring(0, 7)}...` : "Ask about commits..."}
                  className="flex-1 bg-[#0d1117] border-[#30363d] text-[#e6edf3] text-sm h-11 px-4 focus:border-[#58a6ff] focus:ring-2 focus:ring-[#58a6ff]/20"
                />
                <Button
                  onClick={handleSend}
                  size="sm"
                  className="bg-[#58a6ff] hover:bg-[#388bfd] text-white border-0 h-11 px-5"
                  disabled={!message.trim()}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}