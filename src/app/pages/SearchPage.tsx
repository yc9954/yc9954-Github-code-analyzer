import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/app/components/DashboardLayout";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Star, GitBranch, Calendar, BookOpen, MessageSquare, Users, ChevronDown, Loader2, ArrowRight, MessageCircle } from "lucide-react";
import { Badge } from "@/app/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { searchRepositories, searchResources, type Repository, type User, type SearchResult, type Team } from "@/lib/api";

const languages = [
  "HTML",
  "Python",
  "JavaScript",
  "TypeScript",
  "Java",
  "C++",
  "C",
  "Go",
];

const getLanguageColor = (language: string | null | undefined): string => {
  if (!language) return "bg-gray-500";
  const colors: Record<string, string> = {
    "JavaScript": "bg-yellow-400",
    "TypeScript": "bg-blue-500",
    "Python": "bg-blue-400",
    "Java": "bg-orange-500",
    "C++": "bg-pink-500",
    "HTML": "bg-orange-400",
    "CSS": "bg-blue-600",
  };
  return colors[language] || "bg-gray-500";
};

export function SearchPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const queryFromUrl = searchParams.get("q") || "";
  const [searchQuery, setSearchQuery] = useState(queryFromUrl);

  // Results State
  const [internalResults, setInternalResults] = useState<SearchResult>({ repositories: [], users: [], teams: [] });
  const [externalResults, setExternalResults] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(false);

  // Pagination & Filter (Only for External GitHub Search)
  const [activeFilter, setActiveFilter] = useState<"repositories" | "users">("repositories");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalExternalResults, setTotalExternalResults] = useState(0);

  useEffect(() => {
    setSearchQuery(queryFromUrl);
    if (queryFromUrl) {
      performSearch();
    }
  }, [queryFromUrl, currentPage, activeFilter]);

  const performSearch = async () => {
    if (!queryFromUrl.trim()) return;

    setLoading(true);
    try {
      // Parallel Search: Internal (Unified) + External (GitHub)
      const internalPromise = searchResources(queryFromUrl, 'ALL');
      const externalPromise = searchRepositories(
        queryFromUrl,
        undefined,
        'best-match',
        activeFilter,
        currentPage,
        10
      );

      const [internal, external] = await Promise.all([internalPromise, externalPromise]);

      setInternalResults(internal || { repositories: [], users: [], teams: [] });

      if (activeFilter === "repositories") {
        setExternalResults(external.repositories || []);
        setTotalExternalResults(external.total || 0);
        setTotalPages(external.totalPages || 1);
      }
      // Note: We are currently only handling external repositories pagination in this view implementation

    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setSearchParams({ q: searchQuery.trim() });
      setCurrentPage(1);
    }
  };

  const handleChatWithRepo = (repo: Repository) => {
    navigate(`/repository?owner=${repo.owner}&repo=${repo.name}`);
  };

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-4rem)] flex flex-col bg-black">
        <div className="px-4 py-3 border-b border-neutral-900 bg-black flex items-center justify-between">
          <h1 className="text-sm font-semibold text-white">Integrated Search</h1>
        </div>

        <div className="flex-1 overflow-y-auto bg-black p-4 md:p-8">
          <div className="max-w-5xl mx-auto space-y-8">

            {/* Search Input */}
            <form onSubmit={handleSearch} className="flex gap-2">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search repositories, users, or teams..."
                className="bg-neutral-900 border-neutral-800 text-white"
              />
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                Search
              </Button>
            </form>

            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-neutral-400 animate-spin" />
              </div>
            ) : (
              <>
                {/* Internal Results Section (Top Half) */}
                {internalResults.repositories && internalResults.repositories.length > 0 && (
                  <section>
                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="outline" className="border-green-500/50 text-green-500 bg-green-500/10">
                        Internal System
                      </Badge>
                      <h2 className="text-lg font-semibold text-white">Local Repositories</h2>
                    </div>
                    <div className="grid gap-3">
                      {internalResults.repositories.map((repo) => (
                        <div key={repo.id} className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4 flex items-start justify-between group hover:border-neutral-700 transition-colors">
                          <div>
                            <h3 className="text-base font-medium text-white mb-1 flex items-center gap-2">
                              {repo.owner}/{repo.name}
                              {repo.isPrivate && <Badge variant="secondary" className="text-[10px] h-4">Private</Badge>}
                            </h3>
                            <p className="text-sm text-neutral-400 mb-2">{repo.description}</p>
                            <div className="flex items-center gap-4 text-xs text-neutral-500">
                              {repo.language && (
                                <span className="flex items-center gap-1">
                                  <span className={`w-2 h-2 rounded-full ${getLanguageColor(repo.language)}`} />
                                  {repo.language}
                                </span>
                              )}
                              <span>Updated {repo.updated}</span>
                            </div>
                          </div>
                          <Button
                            onClick={() => handleChatWithRepo(repo)}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 gap-2"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            Chat with Repo
                            <ArrowRight className="w-3.5 h-3.5 opacity-60" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* External Results Section (Bottom Half) */}
                <section className="pt-8 border-t border-neutral-800">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-neutral-700 text-neutral-400">
                        GitHub API
                      </Badge>
                      <h2 className="text-lg font-semibold text-white">External Repositories</h2>
                    </div>
                    <div className="text-xs text-neutral-500">
                      {totalExternalResults} results found
                    </div>
                  </div>

                  <div className="space-y-3">
                    {externalResults.map((repo) => (
                      <div key={repo.id} className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 hover:border-neutral-700 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="text-sm font-semibold text-white mb-1">
                              {repo.owner}/{repo.name}
                            </h3>
                            <p className="text-xs text-neutral-400 mb-2 line-clamp-2">{repo.description}</p>
                            <div className="flex items-center gap-4 text-xs text-neutral-500">
                              <div className="flex items-center gap-1">
                                <Star className="w-3 h-3" />
                                {repo.stars}
                              </div>
                              {repo.language && <span>{repo.language}</span>}
                              <span>Updated {repo.updated}</span>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleChatWithRepo(repo)}
                            className="border-neutral-800 text-neutral-300 hover:text-white hover:bg-neutral-800 h-8 text-xs"
                          >
                            Inspect
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Simple Pagination for External */}
                  {totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-6">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="border-neutral-800 text-white hover:bg-neutral-800"
                      >
                        Previous
                      </Button>
                      <span className="flex items-center text-xs text-neutral-400 px-2">
                        Page {currentPage} of {Math.min(totalPages, 100)}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="border-neutral-800 text-white hover:bg-neutral-800"
                      >
                        Next
                      </Button>
                    </div>
                  )}
                </section>
              </>
            )}

            {!loading && !internalResults.repositories?.length && !externalResults.length && queryFromUrl && (
              <div className="text-center py-20 text-neutral-500">
                No results found for "{queryFromUrl}"
              </div>
            )}

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

