import { useState } from "react";
import { DashboardLayout } from "@/app/components/DashboardLayout";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { GitBranch, MessageSquare, Send, Copy, CheckCircle2 } from "lucide-react";
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
        {/* Top Header - Compact */}
        <div className="px-4 py-2.5 border-b border-[#30363d] bg-[#0d1117]">
          <div className="flex items-center justify-between">
            <h1 className="text-base font-semibold text-white">Commits</h1>
            <div className="flex items-center gap-2">
              <Select value={selectedRepo} onValueChange={setSelectedRepo}>
                <SelectTrigger className="w-48 bg-[#161b22] border-[#30363d] text-white h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#161b22] border-[#30363d]">
                  {repositories.map((repo) => (
                    <SelectItem key={repo.id} value={repo.name} className="text-white focus:bg-[#0d1117] text-xs">
                      {repo.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select defaultValue="main">
                <SelectTrigger className="w-24 bg-[#161b22] border-[#30363d] text-white h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#161b22] border-[#30363d]">
                  <SelectItem value="main" className="text-white focus:bg-[#0d1117] text-xs">main</SelectItem>
                  <SelectItem value="develop" className="text-white focus:bg-[#0d1117] text-xs">develop</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel - Commit List */}
          <div className="w-[360px] border-r border-[#30363d] bg-[#0d1117] flex flex-col flex-shrink-0">
            {/* Commit List Header - Compact */}
            <div className="px-3 py-2 border-b border-[#30363d] bg-[#161b22] flex items-center justify-between">
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
            <div className="flex-1 overflow-y-auto">
              <div className="divide-y divide-[#30363d]">
                {commits.map((commit) => (
                  <div 
                    key={commit.sha} 
                    onClick={() => handleCommitSelect(commit.sha)}
                    className={`group px-3 py-2 hover:bg-[#161b22] transition-colors cursor-pointer ${
                      selectedCommit === commit.sha ? 'bg-[#161b22] border-l-2 border-l-[#7aa2f7]' : ''
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
            </div>
          </div>

          {/* Right Panel - AI Chat */}
          <div className="flex-1 flex flex-col bg-[#0d1117] min-w-0">
            {/* Chat Header - Compact */}
            <div className="px-4 py-2.5 border-b border-[#30363d] bg-[#161b22]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-white">AI Assistant</span>
                  {selectedCommit && (
                    <code className="text-[10px] text-[#7aa2f7] font-mono bg-[#0d1117] px-1.5 py-0.5 rounded border border-[#30363d]">
                      {selectedCommit.substring(0, 7)}
                    </code>
                  )}
                </div>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 min-h-0">
              {chatMessages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-center">
                  <div>
                    <MessageSquare className="w-10 h-10 text-[#7d8590] mx-auto mb-2 opacity-50" />
                    <p className="text-xs text-[#7d8590]">
                      {selectedCommit 
                        ? "Ask questions about this commit"
                        : "Select a commit to start"}
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
                          : 'bg-[#161b22] border border-[#30363d] text-white'
                      }`}>
                        {msg.content}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Chat Input - Compact */}
            <div className="px-4 py-2.5 border-t border-[#30363d] bg-[#161b22]">
              <div className="flex gap-2 max-w-3xl mx-auto">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder={selectedCommit ? `Ask about ${selectedCommit.substring(0, 7)}...` : "Ask about commits..."}
                  className="flex-1 bg-[#0d1117] border-[#30363d] text-white text-xs h-8 focus:border-[#7aa2f7]"
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
    </DashboardLayout>
  );
}