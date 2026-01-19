import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/app/components/DashboardLayout";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Star, GitBranch, Calendar, BookOpen, MessageSquare, Users, ChevronDown, Loader2 } from "lucide-react";
import { Badge } from "@/app/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { searchRepositories, type Repository, type User } from "@/lib/api";

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

// 언어별 색상 매핑 (GitHub 언어 색상 기준)
const getLanguageColor = (language: string | null | undefined): string => {
  if (!language) return "bg-gray-500";
  
  const colorMap: Record<string, string> = {
    "JavaScript": "bg-yellow-400",
    "TypeScript": "bg-blue-500",
    "Python": "bg-blue-400",
    "Java": "bg-orange-500",
    "C": "bg-gray-500",
    "C++": "bg-pink-500",
    "C#": "bg-purple-500",
    "HTML": "bg-orange-400",
    "CSS": "bg-blue-600",
    "PHP": "bg-indigo-500",
    "Ruby": "bg-red-500",
    "Go": "bg-cyan-500",
    "Rust": "bg-orange-600",
    "Swift": "bg-orange-400",
    "Kotlin": "bg-purple-600",
    "Dart": "bg-blue-500",
    "Scala": "bg-red-600",
    "Shell": "bg-gray-400",
    "PowerShell": "bg-blue-700",
    "Vue": "bg-green-500",
    "React": "bg-cyan-400",
    "Angular": "bg-red-600",
    "Svelte": "bg-orange-500",
    "Dockerfile": "bg-blue-500",
    "YAML": "bg-gray-400",
    "JSON": "bg-yellow-500",
    "Markdown": "bg-gray-500",
    "SQL": "bg-blue-600",
    "R": "bg-blue-400",
    "MATLAB": "bg-yellow-500",
    "Perl": "bg-blue-500",
    "Lua": "bg-blue-400",
    "Haskell": "bg-purple-500",
    "Clojure": "bg-green-500",
    "Erlang": "bg-red-500",
    "Elixir": "bg-purple-500",
    "OCaml": "bg-orange-500",
    "F#": "bg-blue-500",
    "Objective-C": "bg-blue-600",
    "Assembly": "bg-gray-600",
    "Vim script": "bg-green-600",
    "TeX": "bg-gray-500",
    "Makefile": "bg-yellow-600",
    "CMake": "bg-gray-500",
  };

  return colorMap[language] || "bg-gray-500";
};

export function SearchPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryFromUrl = searchParams.get("q") || "";
  const [searchQuery, setSearchQuery] = useState(queryFromUrl);
  const [activeFilter, setActiveFilter] = useState<"repositories" | "discussions" | "users">("repositories");
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState<"best-match" | "stars" | "updated">("best-match");
  const [totalResults, setTotalResults] = useState(0);
  const [queryTime, setQueryTime] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  // 필터별 검색 결과 카운트
  const [filterCounts, setFilterCounts] = useState({
    repositories: 0,
    discussions: 0,
    users: 0,
  });

  // Update search query when URL changes
  useEffect(() => {
    const query = searchParams.get("q") || "";
    setSearchQuery(query);
  }, [searchParams]);

  // Search when query or filter changes
  useEffect(() => {
    if (queryFromUrl && (activeFilter === "repositories" || activeFilter === "users")) {
      setCurrentPage(1); // Reset to first page when filter changes
      performSearch(1);
    } else if (!queryFromUrl) {
      setRepositories([]);
      setUsers([]);
      setTotalResults(0);
      setQueryTime(0);
      setCurrentPage(1);
      setTotalPages(1);
    }
  }, [queryFromUrl, activeFilter, selectedLanguages, sortBy]);

  // Search when page changes
  useEffect(() => {
    if (queryFromUrl && (activeFilter === "repositories" || activeFilter === "users") && currentPage > 1) {
      performSearch(currentPage);
    }
  }, [currentPage]);

  const performSearch = async (page: number = 1) => {
    if (!queryFromUrl.trim()) return;

    setLoading(true);
    try {
      const language = selectedLanguages.length > 0 ? selectedLanguages[0] : undefined;
      const type = activeFilter === "users" ? "users" : "repositories";
      const result = await searchRepositories(queryFromUrl, language, sortBy, type, page, 20);
      
      if (type === "users") {
        setUsers(result.users || []);
        setRepositories([]);
        // Users 검색 결과 업데이트
        setFilterCounts(prev => ({
          ...prev,
          users: result.total || 0,
        }));
      } else {
        setRepositories(result.repositories || []);
        setUsers([]);
        // Repositories 검색 결과 업데이트
        setFilterCounts(prev => ({
          ...prev,
          repositories: result.total || 0,
        }));
      }
      
      setTotalResults(result.total || 0);
      setQueryTime(result.queryTime || 0);
      setTotalPages(result.totalPages || 1);
    } catch (error) {
      console.error("Search error:", error);
      setRepositories([]);
      setUsers([]);
      setTotalResults(0);
      setQueryTime(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  // 검색어가 변경되면 각 필터 타입별로 카운트를 가져옴
  useEffect(() => {
    if (queryFromUrl.trim()) {
      // Repositories 카운트 가져오기
      const fetchRepositoriesCount = async () => {
        try {
          const language = selectedLanguages.length > 0 ? selectedLanguages[0] : undefined;
          const result = await searchRepositories(queryFromUrl, language, sortBy, "repositories", 1, 1);
          setFilterCounts(prev => ({
            ...prev,
            repositories: result.total || 0,
          }));
        } catch (error) {
          console.error("Error fetching repositories count:", error);
        }
      };

      // Users 카운트 가져오기
      const fetchUsersCount = async () => {
        try {
          const result = await searchRepositories(queryFromUrl, undefined, "best-match", "users", 1, 1);
          setFilterCounts(prev => ({
            ...prev,
            users: result.total || 0,
          }));
        } catch (error) {
          console.error("Error fetching users count:", error);
        }
      };

      fetchRepositoriesCount();
      fetchUsersCount();
    } else {
      // 검색어가 없으면 카운트 초기화
      setFilterCounts({
        repositories: 0,
        discussions: 0,
        users: 0,
      });
    }
  }, [queryFromUrl, selectedLanguages, sortBy]);

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
                        <span className={`text-[10px] ${
                          activeFilter === "repositories" 
                            ? "text-white/80" 
                            : "text-neutral-400"
                        }`}>
                          {loading && activeFilter === "repositories" ? (
                            <Loader2 className="w-3 h-3 animate-spin inline" />
                          ) : (
                            filterCounts.repositories > 0 ? filterCounts.repositories.toLocaleString() : "-"
                          )}
                        </span>
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
                        <span className={`text-[10px] ${
                          activeFilter === "discussions" 
                            ? "text-white/80" 
                            : "text-neutral-400"
                        }`}>
                          {filterCounts.discussions > 0 ? filterCounts.discussions.toLocaleString() : "-"}
                        </span>
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
                        <span className={`text-[10px] ${
                          activeFilter === "users" 
                            ? "text-white/80" 
                            : "text-neutral-400"
                        }`}>
                          {loading && activeFilter === "users" ? (
                            <Loader2 className="w-3 h-3 animate-spin inline" />
                          ) : (
                            filterCounts.users > 0 ? filterCounts.users.toLocaleString() : "-"
                          )}
                        </span>
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
            <main className="flex-1 min-w-0 flex flex-col pr-12">
              {activeFilter === "repositories" && (
                <>
                  <div className="flex items-center justify-between mb-4 max-w-6xl">
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
                    <div className="space-y-3 max-w-6xl">
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
                                    <div className={`w-2.5 h-2.5 rounded-full ${getLanguageColor(repo.language)}`}></div>
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

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-6 pb-4 max-w-6xl">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1 || loading}
                        className="border-neutral-800 text-white hover:bg-neutral-900 bg-neutral-900 h-7 text-xs"
                      >
                        Previous
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(pageNum)}
                              disabled={loading}
                              className={`h-7 w-7 text-xs ${
                                currentPage === pageNum
                                  ? "bg-blue-500 text-white border-blue-500"
                                  : "border-neutral-800 text-white hover:bg-neutral-900 bg-neutral-900"
                              }`}
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages || loading}
                        className="border-neutral-800 text-white hover:bg-neutral-900 bg-neutral-900 h-7 text-xs"
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </>
              )}

              {queryFromUrl && activeFilter === "discussions" && (
                <div className="text-center py-12">
                  <MessageSquare className="w-12 h-12 text-white/40 mx-auto mb-4" />
                  <p className="text-white/80 text-xs">Discussion search results will appear here</p>
                </div>
              )}

              {activeFilter === "users" && (
                <>
                  <div className="flex items-center justify-between mb-4 max-w-6xl">
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
                  </div>

                  {loading && users.length === 0 ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 text-neutral-400 animate-spin" />
                    </div>
                  ) : users.length === 0 && queryFromUrl ? (
                    <div className="text-center py-12">
                      <p className="text-white/80 text-xs">No users found</p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-w-6xl">
                      {users.map((user) => (
                        <div
                          key={user.id}
                          onClick={() => window.open(user.url, '_blank')}
                          className="border border-neutral-800 rounded-lg p-3 hover:border-neutral-700 hover:bg-neutral-900 transition-colors bg-neutral-900 cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={user.avatar}
                              alt={user.login}
                              className="w-10 h-10 rounded-full"
                            />
                            <div className="flex-1">
                              <h3 className="text-sm font-semibold text-white hover:underline">
                                {user.login}
                              </h3>
                              <p className="text-xs text-neutral-400">{user.type}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Pagination for Users */}
                  {totalPages > 1 && activeFilter === "users" && (
                    <div className="flex items-center justify-center gap-2 mt-6 pb-4 max-w-6xl">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1 || loading}
                        className="border-neutral-800 text-white hover:bg-neutral-900 bg-neutral-900 h-7 text-xs"
                      >
                        Previous
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          return (
                            <Button
                              key={pageNum}
                              variant={currentPage === pageNum ? "default" : "outline"}
                              size="sm"
                              onClick={() => setCurrentPage(pageNum)}
                              disabled={loading}
                              className={`h-7 w-7 text-xs ${
                                currentPage === pageNum
                                  ? "bg-blue-500 text-white border-blue-500"
                                  : "border-neutral-800 text-white hover:bg-neutral-900 bg-neutral-900"
                              }`}
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages || loading}
                        className="border-neutral-800 text-white hover:bg-neutral-900 bg-neutral-900 h-7 text-xs"
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </>
              )}
            </main>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
