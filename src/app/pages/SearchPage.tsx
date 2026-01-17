import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/app/components/DashboardLayout";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { Star, GitBranch, Calendar, BookOpen, Code, AlertCircle, GitPullRequest, MessageSquare, Users, ChevronDown } from "lucide-react";
import { Badge } from "@/app/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";

// Mock data for search results
const mockRepositories = [
  {
    id: "1",
    owner: "benlk",
    name: "sadface",
    description: "An IRC Markov chain bot",
    language: "Python",
    stars: 15,
    updated: "Aug 9, 2020",
    isArchived: true,
  },
  {
    id: "2",
    owner: "kachak1993",
    name: "itukraine",
    description: "sadfa",
    stars: 22,
    updated: "Feb 5, 2025",
  },
  {
    id: "3",
    owner: "siwells",
    name: "SADFace",
    description: "The Simple Argument Description Format",
    language: "Python",
    stars: 0,
    updated: "Dec 13, 2025",
  },
  {
    id: "4",
    owner: "priyapandey2020",
    name: "sadfaf-51-4questionsolution",
    language: "HTML",
    stars: 0,
    updated: "Sep 16, 2020",
  },
  {
    id: "5",
    owner: "andelf",
    name: "sadfarmer",
    description: "伤心农民一个开心农场辅助程序,已经不更新,欢迎围观原理.",
    language: "Python",
    stars: 3,
    updated: "Sep 22, 2009",
  },
  {
    id: "6",
    owner: "FlushingBaseball",
    name: "sdafsadf",
    description: "sadfas",
    stars: 0,
    updated: "Aug 26, 2025",
  },
];

const filterCounts = {
  code: 51700,
  repositories: 302,
  issues: 77,
  pullRequests: 88,
  discussions: 3,
  users: 471,
};

const languages = [
  "HTML",
  "Python",
  "JavaScript",
  "CSS",
  "Java",
  "TypeScript",
  "C",
  "C++",
  "PHP",
  "C#",
];

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const queryFromUrl = searchParams.get("q") || "";
  const [searchQuery, setSearchQuery] = useState(queryFromUrl);
  const [activeFilter, setActiveFilter] = useState<"code" | "repositories" | "issues" | "pullRequests" | "discussions" | "users">("repositories");
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);

  // Update search query when URL changes
  useEffect(() => {
    const query = searchParams.get("q") || "";
    setSearchQuery(query);
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery.trim() });
      // In a real app, this would trigger an API call
      console.log("Searching for:", searchQuery);
    }
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-4rem)] flex flex-col bg-[#0d1117]">
        {/* Compact Header */}
        <div className="px-4 py-2.5 border-b border-white/10 bg-[#0d1117]">
          <h1 className="text-base font-semibold text-white">Search</h1>
        </div>
        <div className="flex-1 overflow-y-auto">
          <div className="w-full px-4 py-4 h-full">
            <div className="flex gap-6 h-full">
              {/* Left Sidebar - Filters */}
              <aside className="w-64 flex-shrink-0">
                <div className="sticky top-4 space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-white mb-3">Filter by</h3>
                  <div className="space-y-1">
                    <button
                      onClick={() => setActiveFilter("code")}
                      className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                        activeFilter === "code"
                          ? "bg-[#7aa2f7] text-white"
                          : "text-white/90 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>Code</span>
                        <span className="text-xs text-white/60">{filterCounts.code.toLocaleString()}</span>
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveFilter("repositories")}
                      className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                        activeFilter === "repositories"
                          ? "bg-[#7aa2f7] text-white"
                          : "text-white/90 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>Repositories</span>
                        <span className="text-xs text-white/60">{filterCounts.repositories}</span>
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveFilter("issues")}
                      className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                        activeFilter === "issues"
                          ? "bg-[#7aa2f7] text-white"
                          : "text-white/90 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>Issues</span>
                        <span className="text-xs text-white/60">{filterCounts.issues}</span>
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveFilter("pullRequests")}
                      className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                        activeFilter === "pullRequests"
                          ? "bg-[#7aa2f7] text-white"
                          : "text-white/90 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>Pull requests</span>
                        <span className="text-xs text-white/60">{filterCounts.pullRequests}</span>
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveFilter("discussions")}
                      className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                        activeFilter === "discussions"
                          ? "bg-[#7aa2f7] text-white"
                          : "text-white/90 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>Discussions</span>
                        <span className="text-xs text-white/60">{filterCounts.discussions}</span>
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveFilter("users")}
                      className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                        activeFilter === "users"
                          ? "bg-[#7aa2f7] text-white"
                          : "text-white/90 hover:bg-white/10"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>Users</span>
                        <span className="text-xs text-white/60">{filterCounts.users}</span>
                      </div>
                    </button>
                  </div>
                </div>

                {activeFilter === "repositories" && (
                  <div className="pt-4 border-t border-white/10">
                    <h3 className="text-sm font-semibold text-white mb-3">Languages</h3>
                    <div className="space-y-1">
                      {languages.map((lang) => (
                        <button
                          key={lang}
                          onClick={() => setSelectedLanguage(selectedLanguage === lang ? null : lang)}
                          className={`w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors flex items-center gap-2 ${
                            selectedLanguage === lang
                              ? "bg-[#7aa2f7]/20 text-[#7aa2f7]"
                              : "text-white/90 hover:bg-white/10"
                          }`}
                        >
                          <div className="w-3 h-3 rounded-full bg-[#7aa2f7]"></div>
                          <span>{lang}</span>
                        </button>
                      ))}
                      <button className="w-full text-left px-3 py-1.5 text-sm text-[#7aa2f7] hover:bg-white/10 rounded-md">
                        More languages...
                      </button>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-white/10">
                  <h3 className="text-sm font-semibold text-white mb-3">Advanced</h3>
                  <div className="space-y-2">
                    <button className="w-full text-left px-3 py-1.5 text-sm text-white/90 hover:bg-white/10 rounded-md flex items-center justify-between">
                      <span>Owner</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button className="w-full text-left px-3 py-1.5 text-sm text-white/90 hover:bg-white/10 rounded-md flex items-center justify-between">
                      <span>Size</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Content - Search Results */}
            <main className="flex-1 min-w-0 flex flex-col">
              {!queryFromUrl && (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <Code className="w-12 h-12 text-white/40 mx-auto mb-4" />
                    <p className="text-white/80 mb-2">Enter a search term</p>
                    <p className="text-sm text-white/60">Enter a search term in the search bar above and click the search button</p>
                  </div>
                </div>
              )}
              
              {queryFromUrl && activeFilter === "repositories" && (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-sm text-white/60">
                      {mockRepositories.length} results (148 ms)
                    </div>
                    <div className="flex items-center gap-2">
                      <Select defaultValue="best-match">
                        <SelectTrigger className="w-40 h-8 bg-white/5 border-white/10 text-white text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white/5 backdrop-blur-md border-white/10">
                          <SelectItem value="best-match" className="text-white">Best match</SelectItem>
                          <SelectItem value="stars" className="text-white">Most stars</SelectItem>
                          <SelectItem value="updated" className="text-white">Recently updated</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="sm" className="h-8 border-white/10 text-white hover:bg-white/10">
                        Save
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {mockRepositories.map((repo) => (
                      <div
                        key={repo.id}
                        className="border border-white/10 rounded-lg p-4 hover:border-white/20 hover:bg-white/5 transition-colors bg-white/5"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-base font-semibold text-[#7aa2f7] hover:underline cursor-pointer">
                                {repo.owner}/{repo.name}
                              </h3>
                              {repo.isArchived && (
                                <Badge variant="outline" className="text-xs border-white/10 text-white/60">
                                  Public archive
                                </Badge>
                              )}
                            </div>
                            {repo.description && (
                              <p className="text-sm text-white/80 mb-3 line-clamp-2">{repo.description}</p>
                            )}
                            <div className="flex items-center gap-4 text-sm text-white/60">
                              {repo.language && (
                                <div className="flex items-center gap-1.5">
                                  <div className="w-3 h-3 rounded-full bg-[#7aa2f7]"></div>
                                  <span>{repo.language}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4" />
                                <span>{repo.stars}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                <span>Updated {repo.updated}</span>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-shrink-0 border-white/10 text-white hover:bg-white/10 h-8"
                          >
                            <Star className="w-4 h-4 mr-1" />
                            Star
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}

              {queryFromUrl && activeFilter === "code" && (
                <div className="text-center py-12">
                  <Code className="w-12 h-12 text-white/40 mx-auto mb-4" />
                  <p className="text-white/80">Code search results will appear here</p>
                </div>
              )}

              {queryFromUrl && activeFilter === "issues" && (
                <div className="text-center py-12">
                  <AlertCircle className="w-12 h-12 text-white/40 mx-auto mb-4" />
                  <p className="text-white/80">Issue search results will appear here</p>
                </div>
              )}

              {queryFromUrl && activeFilter === "pullRequests" && (
                <div className="text-center py-12">
                  <GitPullRequest className="w-12 h-12 text-white/40 mx-auto mb-4" />
                  <p className="text-white/80">Pull request search results will appear here</p>
                </div>
              )}

              {queryFromUrl && activeFilter === "discussions" && (
                <div className="text-center py-12">
                  <MessageSquare className="w-12 h-12 text-white/40 mx-auto mb-4" />
                  <p className="text-white/80">Discussion search results will appear here</p>
                </div>
              )}

              {queryFromUrl && activeFilter === "users" && (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 text-white/40 mx-auto mb-4" />
                  <p className="text-white/80">User search results will appear here</p>
                </div>
              )}
            </main>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
