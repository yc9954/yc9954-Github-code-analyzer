import { useState } from "react";
import { DashboardLayout } from "@/app/components/DashboardLayout";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { GitCommit, GitBranch, MessageSquare, Send, Sparkles, Copy, Code } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Badge } from "@/app/components/ui/badge";

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

const aiSuggestions = [
  {
    title: "Review recent changes",
    description: "Look at the most recent commits and summarize the key changes, highlighting anything that needs attention.",
    time: "5 minutes",
  },
  {
    title: "Add error handling",
    description: "Look for functions that could use better error handling and add appropriate error and exception handling.",
    time: "8 minutes",
  },
  {
    title: "Implement a small feature",
    description: "Look for feature requests in comments, emails, and conversations and implement missing functionality as requested.",
    time: "15 minutes",
  },
];

export function CommitsPage() {
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
          content: "I've analyzed the recent commits. The main changes include authentication fixes, OAuth improvements, and database schema updates. Would you like me to review any specific commit in detail?"
        }]);
      }, 1000);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-4 h-[calc(100vh-4rem)] flex gap-3">
        {/* Left Side - Commit History */}
        <div className="flex-1 flex flex-col min-w-0 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-white">Commits</h1>
              <p className="text-xs text-[#7d8590]">Commit history and analysis</p>
            </div>
            <div className="flex gap-2">
              <Select defaultValue="main">
                <SelectTrigger className="w-28 bg-[#161b22] border-[#30363d] text-white h-7 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#161b22] border-[#30363d]">
                  <SelectItem value="main" className="text-white focus:bg-[#0d1117] text-xs">main</SelectItem>
                  <SelectItem value="develop" className="text-white focus:bg-[#0d1117] text-xs">develop</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-2">
            <div className="bg-[#161b22] border border-[#30363d] rounded p-2">
              <div className="text-xs text-[#7d8590] mb-0.5">Total</div>
              <div className="text-lg font-semibold text-white">1,247</div>
            </div>
            <div className="bg-[#161b22] border border-[#30363d] rounded p-2">
              <div className="text-xs text-[#7d8590] mb-0.5">This Week</div>
              <div className="text-lg font-semibold text-white">163</div>
            </div>
            <div className="bg-[#161b22] border border-[#30363d] rounded p-2">
              <div className="text-xs text-[#7d8590] mb-0.5">Contributors</div>
              <div className="text-lg font-semibold text-white">8</div>
            </div>
            <div className="bg-[#161b22] border border-[#30363d] rounded p-2">
              <div className="text-xs text-[#7d8590] mb-0.5">Avg/Day</div>
              <div className="text-lg font-semibold text-white">12</div>
            </div>
          </div>

          {/* Commit List */}
          <div className="flex-1 bg-[#161b22] border border-[#30363d] rounded-lg overflow-hidden flex flex-col">
            <div className="px-3 py-2 border-b border-[#30363d] flex items-center justify-between">
              <h3 className="text-sm font-medium text-white">Commits on Jan 14, 2026</h3>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="border-[#30363d] bg-transparent text-white hover:bg-[#0d1117] h-7 text-xs px-2">
                  All users
                </Button>
                <Button variant="outline" size="sm" className="border-[#30363d] bg-transparent text-white hover:bg-[#0d1117] h-7 text-xs px-2">
                  All time
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto">
              <div className="divide-y divide-[#30363d]">
                {commits.map((commit) => (
                  <div key={commit.sha} className="p-2.5 hover:bg-[#0d1117] transition-colors group">
                    <div className="flex items-start gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-sm text-white font-normal truncate">{commit.message}</span>
                          {commit.verified && (
                            <Badge className="bg-transparent border border-[#30363d] text-[#3fb950] hover:bg-transparent h-4 text-xs px-1.5">
                              Verified
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-[#7d8590]">
                          <span>{commit.author} committed {commit.time}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="ghost" size="sm" className="h-6 px-1.5 text-xs text-[#7d8590] hover:text-white">
                          <Copy className="w-3 h-3" />
                        </Button>
                        <code className="text-xs text-[#7d8590] font-mono bg-[#0d1117] px-1.5 py-0.5 rounded">
                          {commit.sha}
                        </code>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - AI Agent */}
        <div className="w-80 flex flex-col space-y-3">
          {/* AI Header */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 bg-gradient-to-br from-[#7aa2f7]/20 to-[#bb9af7]/20 rounded flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-[#7aa2f7]" />
              </div>
              <div>
                <h3 className="text-xs font-medium text-white">AI Code Assistant</h3>
                <p className="text-[10px] text-[#7d8590]">Ask about your commits</p>
              </div>
            </div>
          </div>

          {/* Suggestions */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-3 space-y-2">
            <div className="text-[10px] font-medium text-[#7d8590] mb-2">Quick Actions</div>
            {aiSuggestions.map((suggestion, index) => (
              <button
                key={index}
                className="w-full text-left p-2 bg-[#0d1117] hover:bg-[#21262d] border border-[#30363d] rounded transition-colors group"
                onClick={() => setMessage(suggestion.title)}
              >
                <div className="flex items-start gap-1.5 mb-1">
                  <Code className="w-3 h-3 text-[#7d8590] mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-white font-medium mb-0.5">{suggestion.title}</div>
                    <div className="text-[10px] text-[#7d8590] leading-relaxed">{suggestion.description}</div>
                  </div>
                </div>
                <div className="text-[10px] text-[#7d8590] mt-1">{suggestion.time}</div>
              </button>
            ))}
          </div>

          {/* Chat Interface */}
          <div className="flex-1 bg-[#161b22] border border-[#30363d] rounded-lg flex flex-col overflow-hidden">
            <div className="px-3 py-2 border-b border-[#30363d]">
              <h3 className="text-xs font-medium text-white">Chat</h3>
            </div>
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {chatMessages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-center">
                  <div>
                    <MessageSquare className="w-7 h-7 text-[#7d8590] mx-auto mb-2" />
                    <p className="text-xs text-[#7d8590]">Start a conversation</p>
                  </div>
                </div>
              ) : (
                chatMessages.map((msg, index) => (
                  <div key={index} className={`${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                    <div className={`inline-block max-w-[85%] p-2 rounded text-xs ${
                      msg.role === 'user' 
                        ? 'bg-[#7aa2f7] text-white' 
                        : 'bg-[#0d1117] border border-[#30363d] text-white'
                    }`}>
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Input */}
            <div className="p-2 border-t border-[#30363d]">
              <div className="flex gap-1.5">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask about commits..."
                  className="flex-1 bg-[#0d1117] border-[#30363d] text-white text-xs h-7"
                />
                <Button 
                  onClick={handleSend}
                  size="sm" 
                  className="bg-[#7aa2f7] hover:bg-[#7dcfff] text-white border-0 h-7 px-2"
                >
                  <Send className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}