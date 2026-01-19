import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/app/components/DashboardLayout";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Star, GitBranch, Calendar, BookOpen, MessageSquare, Users, ChevronDown, Loader2 } from "lucide-react";
import { Badge } from "@/app/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { searchRepositories, type Repository } from "@/lib/api";

const filterCounts = {
  repositories: 302,
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
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryFromUrl = searchParams.get("q") || "";
  const [searchQuery, setSearchQuery] = useState(queryFromUrl);
  const [activeFilter, setActiveFilter] = useState<"repositories" | "discussions" | "users">("repositories");
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState<"best-match" | "stars" | "updated">("best-match");
  const [totalResults, setTotalResults] = useState(0);
  const [queryTime, setQueryTime] = useState(0);

  // Update search query when URL changes
  useEffect(() => {
    const query = searchParams.get("q") || "";
    setSearchQuery(query);
  }, [searchParams]);

  // Search repositories when query changes
  useEffect(() => {
    if (queryFromUrl && activeFilter === "repositories") {
      performSearch();
    } else if (!queryFromUrl) {
      setRepositories([]);
      setTotalResults(0);
      setQueryTime(0);
    }
  }, [queryFromUrl, activeFilter, selectedLanguages, sortBy]);

  const performSearch = async () => {
    if (!queryFromUrl.trim()) return;

    setLoading(true);
    try {
      const language = selectedLanguages.length > 0 ? selectedLanguages[0] : undefined;
      const result = await searchRepositories(queryFromUrl, language, sortBy);
      setRepositories(result.repositories);
      setTotalResults(result.total);
      setQueryTime(result.queryTime);
    } catch (error) {
      console.error("Search error:", error);
      setRepositories([]);
      setTotalResults(0);
      setQueryTime(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery.trim() });
    }
  };

  const handleRepositoryClick = (repo: Repository) => {
    // Navigate to repository page with repo info
    navigate(`/repository?owner=${repo.owner}&repo=${repo.name}`);
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-4rem)] flex flex-col bg-black">
        {/* Compact Header */}
        <div className="px-4 py-2.5 border-b border-neutral-900 bg-black">
          <h1 className="text-sm font-semibold text-white">Search</h1>
        </div>
        <div className="flex-1 overflow-y-auto bg-black">
          <div className="w-full px-4 py-4 h-full">
            <div className="flex gap-6 h-full">
              {/* Left Sidebar - Filters */}
              <aside className="w-48 flex-shrink-0">
                <div className="sticky top-4 space-y-6">
                <div>
                  <h3 className="text-xs font-semibold text-white mb-3">Filter by</h3>
                  <div className="space-y-1">
                    <button
                      onClick={() => setActiveFilter("repositories")}
                      className={`w-full text-left px-3 py-2 text-xs rounded-md transition-colors ${
                        activeFilter === "repositories"
                          ? "bg-blue-500 text-white"
                          : "text-white hover:bg-neutral-900"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-white">Repositories</span>
                        <span className="text-[10px] text-neutral-400">{filterCounts.repositories}</span>
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveFilter("discussions")}
                      className={`w-full text-left px-3 py-2 text-xs rounded-md transition-colors ${
                        activeFilter === "discussions"
                          ? "bg-blue-500 text-white"
                          : "text-white hover:bg-neutral-900"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-white">Discussions</span>
                        <span className="text-[10px] text-neutral-400">{filterCounts.discussions}</span>
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveFilter("users")}
                      className={`w-full text-left px-3 py-2 text-xs rounded-md transition-colors ${
                        activeFilter === "users"
                          ? "bg-blue-500 text-white"
                          : "text-white hover:bg-neutral-900"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-white">Users</span>
                        <span className="text-[10px] text-neutral-400">{filterCounts.users}</span>
                      </div>
                    </button>
                  </div>
                </div>

                {activeFilter === "repositories" && (
                  <div className="pt-4 border-t border-neutral-900">
                    <h3 className="text-xs font-semibold text-white mb-3">Languages</h3>
                    <div className="space-y-1">
                      {languages.map((lang) => (
                        <button
                          key={lang}
                          onClick={() => {
                            setSelectedLanguages((prev) =>
                              prev.includes(lang)
                                ? prev.filter((l) => l !== lang)
                                : [...prev, lang]
                            );
                          }}
                          className="w-full text-left px-3 py-1.5 text-xs rounded-md transition-colors flex items-center gap-2 text-white hover:bg-neutral-900"
                        >
                          <Checkbox
                            checked={selectedLanguages.includes(lang)}
                            onCheckedChange={(checked) => {
                              setSelectedLanguages((prev) =>
                                checked
                                  ? [...prev, lang]
                                  : prev.filter((l) => l !== lang)
                              );
                            }}
                            className="border-neutral-700 data-[state=checked]:bg-blue-500 data-[state=checked]:border-blue-500"
                          />
                          <span className="text-white">{lang}</span>
                        </button>
                      ))}
                      <button className="w-full text-left px-3 py-1.5 text-xs text-blue-400 hover:bg-neutral-900 rounded-md">
                        More languages...
                      </button>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-neutral-900">
                  <h3 className="text-xs font-semibold text-white mb-3">Advanced</h3>
                  <div className="space-y-2">
                    <button className="w-full text-left px-3 py-1.5 text-xs text-white hover:bg-neutral-900 rounded-md flex items-center justify-between">
                      <span className="text-white">Owner</span>
                      <ChevronDown className="w-3 h-3 text-white" />
                    </button>
                    <button className="w-full text-left px-3 py-1.5 text-xs text-white hover:bg-neutral-900 rounded-md flex items-center justify-between">
                      <span className="text-white">Size</span>
                      <ChevronDown className="w-3 h-3 text-white" />
                    </button>
                  </div>
                </div>
              </div>
            </aside>

            {/* Main Content - Search Results */}
            <main className="flex-1 min-w-0 flex flex-col">
              {activeFilter === "repositories" && (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-xs text-neutral-400">
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-3 h-3 animate-spin" />
                          <span>Searching...</span>
                        </div>
                      ) : (
                        `${totalResults} results${queryTime > 0 ? ` (${queryTime} ms)` : ''}`
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Select value={sortBy} onValueChange={(value) => setSortBy(value as "best-match" | "stars" | "updated")}>
                        <SelectTrigger className="w-40 h-7 bg-neutral-900 border-neutral-800 text-white text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-neutral-900 border-neutral-800">
                          <SelectItem value="best-match" className="text-white text-xs">Best match</SelectItem>
                          <SelectItem value="stars" className="text-white text-xs">Most stars</SelectItem>
                          <SelectItem value="updated" className="text-white text-xs">Recently updated</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {loading && repositories.length === 0 ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 text-neutral-400 animate-spin" />
                    </div>
                  ) : repositories.length === 0 && queryFromUrl ? (
                    <div className="text-center py-12">
                      <p className="text-white/80 text-xs">No repositories found</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {repositories.map((repo) => (
                        <div
                          key={repo.id || `${repo.owner}/${repo.name}`}
                          onClick={() => handleRepositoryClick(repo)}
                          className="border border-neutral-800 rounded-lg p-3 hover:border-neutral-700 hover:bg-neutral-900 transition-colors bg-neutral-900 cursor-pointer"
                        >
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="text-sm font-semibold text-white hover:underline">
                                  {repo.owner}/{repo.name}
                                </h3>
                                {repo.isArchived && (
                                  <Badge variant="outline" className="text-[10px] border-neutral-800 text-neutral-400">
                                    Public archive
                                  </Badge>
                                )}
                              </div>
                              {repo.description && (
                                <p className="text-xs text-neutral-300 mb-2 line-clamp-2">{repo.description}</p>
                              )}
                              <div className="flex items-center gap-4 text-xs text-neutral-400">
                                {repo.language && (
                                  <div className="flex items-center gap-1.5">
                                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div>
                                    <span className="text-neutral-300">{repo.language}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-1">
                                  <Star className="w-3 h-3 text-neutral-400" />
                                  <span className="text-neutral-300">{repo.stars}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-3 h-3 text-neutral-400" />
                                  <span className="text-neutral-300">Updated {repo.updated}</span>
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="flex-shrink-0 border-neutral-800 text-white hover:bg-neutral-900 bg-neutral-900 h-7 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Handle star action
                              }}
                            >
                              <Star className="w-3 h-3 mr-1" />
                              Star
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
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
