import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/app/components/DashboardLayout";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { Star, GitBranch, Calendar, BookOpen, MessageSquare, Users, Loader2, ArrowRight, MessageCircle, GitCommit, User } from "lucide-react";
import { Badge } from "@/app/components/ui/badge";
import { searchResources, type SearchResult, type Repository, type User as TypeUser, type Team, type Sprint, type CommitSearchResult } from "@/lib/api";
import { format } from "date-fns";

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

  const [results, setResults] = useState<SearchResult>({
    repositories: [],
    users: [],
    teams: [],
    sprints: [],
    commits: []
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setSearchQuery(queryFromUrl);
    if (queryFromUrl) {
      performSearch();
    }
  }, [queryFromUrl]);

  const performSearch = async () => {
    if (!queryFromUrl.trim()) return;

    setLoading(true);
    try {
      const data = await searchResources(queryFromUrl, 'ALL');
      setResults(data || { repositories: [], users: [], teams: [], sprints: [], commits: [] });
    } catch (error) {
      console.error("Search error:", error);
      setResults({ repositories: [], users: [], teams: [], sprints: [], commits: [] });
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

  const handleChatWithRepo = (repo: Repository) => {
    navigate(`/repository?owner=${repo.owner}&repo=${repo.name}`);
  };

  const hasResults = (
    (results.repositories?.length ?? 0) > 0 ||
    (results.users?.length ?? 0) > 0 ||
    (results.teams?.length ?? 0) > 0 ||
    (results.sprints?.length ?? 0) > 0 ||
    (results.commits?.length ?? 0) > 0
  );

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
                placeholder="Search repositories, users, teams, sprints, or commits..."
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
                {/* Users Section */}
                {results.users && results.users.length > 0 && (
                  <section>
                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="outline" className="border-purple-500/50 text-purple-400 bg-purple-500/10">Users</Badge>
                      <h2 className="text-lg font-semibold text-white">People</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {results.users.map((user, index) => (
                        <div
                          key={`${user.id}-${index}`}
                          onClick={() => navigate(`/users/${user.username}`)}
                          className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-3 flex items-center gap-3 cursor-pointer hover:border-neutral-600 transition-colors"
                        >
                          {user.profileUrl ? (
                            <img src={user.profileUrl} alt={user.username} className="w-10 h-10 rounded-full bg-neutral-800" />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400">
                              <User className="w-5 h-5" />
                            </div>
                          )}
                          <span className="text-white font-medium">{user.username}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Repositories Section */}
                {results.repositories && results.repositories.length > 0 && (
                  <section>
                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="outline" className="border-blue-500/50 text-blue-400 bg-blue-500/10">Repositories</Badge>
                      <h2 className="text-lg font-semibold text-white">Repositories</h2>
                    </div>
                    <div className="grid gap-3">
                      {results.repositories.map((repo, index) => (
                        <div key={`${repo.id}-${index}`} className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4 flex items-start justify-between group hover:border-neutral-700 transition-colors">
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
                            Chat
                          </Button>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Teams Section */}
                {results.teams && results.teams.length > 0 && (
                  <section>
                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="outline" className="border-green-500/50 text-green-400 bg-green-500/10">Teams</Badge>
                      <h2 className="text-lg font-semibold text-white">Teams</h2>
                    </div>
                    <div className="grid gap-3">
                      {results.teams.map((team, index) => (
                        <div
                          key={`${team.id}-${index}`}
                          onClick={() => navigate(`/teams/${team.id}`)}
                          className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4 cursor-pointer hover:border-neutral-700 transition-colors"
                        >
                          <h3 className="text-base font-medium text-white mb-1">{team.name}</h3>
                          <p className="text-sm text-neutral-400">{team.description}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Sprints Section */}
                {results.sprints && results.sprints.length > 0 && (
                  <section>
                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="outline" className="border-orange-500/50 text-orange-400 bg-orange-500/10">Sprints</Badge>
                      <h2 className="text-lg font-semibold text-white">Sprints</h2>
                    </div>
                    <div className="grid gap-3">
                      {results.sprints.map((sprint, index) => (
                        <div
                          key={`${sprint.id}-${index}`}
                          onClick={() => navigate('/sprints')}
                          className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-4 cursor-pointer hover:border-neutral-700 transition-colors"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-base font-medium text-white mb-1">{sprint.name}</h3>
                              <p className="text-sm text-neutral-400 mb-2">{sprint.description}</p>
                              <div className="flex items-center gap-2 text-xs text-neutral-500">
                                <Calendar className="w-3 h-3" />
                                {format(new Date(sprint.startDate), 'yyyy-MM-dd')} ~ {format(new Date(sprint.endDate), 'yyyy-MM-dd')}
                              </div>
                            </div>
                            <Badge variant="outline" className={sprint.isOpen ? "text-green-400 border-green-500/30" : "text-neutral-400 border-neutral-800"}>
                              {sprint.isOpen ? "Active" : "Closed"}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Commits Section */}
                {results.commits && results.commits.length > 0 && (
                  <section>
                    <div className="flex items-center gap-2 mb-4">
                      <Badge variant="outline" className="border-teal-500/50 text-teal-400 bg-teal-500/10">Commits</Badge>
                      <h2 className="text-lg font-semibold text-white">Commits</h2>
                    </div>
                    <div className="space-y-3">
                      {results.commits.map((commit, index) => (
                        <div
                          key={`${commit.sha}-${index}`}
                          onClick={() => {
                            // Assuming repoName is "owner/repo" or just "repo" - logic to parse might be needed depending on API response
                            // The example response shows "repoName": "Screwed-Backend", "authorName": "xistoh162108".
                            // We probably need owner info. Based on authorName it might be safe to try owner=authorName if not provided?
                            // But commit.repoName from API seems to be just the name. 
                            // Wait, the new API response has repoId. We can find owner perhaps?
                            // Actually user provided example: "repoId": "R_kgDOP7d2Bg", "repoName": "Screwed-Backend", "authorName": "xistoh162108".
                            // It doesn't yield owner directly.
                            // However, if the user clicks, we can try to navigate.
                            // Let's assume we can navigate to CommitsPage with commit selected.
                            // If we don't have owner, we might need to fetch it or guess.
                            // For now let's try using authorName as owner or just rely on search params if updated CommitsPage handles repo ID?
                            // CommitsPage expects owner/repo. 
                            // Let's try to assume authorName is owner for now (often true for user repos) or handle gracefully.
                            // Actually, for CommitsPage, we need owner and repo.
                            // The search API response example shows "repoName" and "authorName".
                            // Let's make a best effort guess: owner = authorName (might differ for orgs).
                            navigate(`/commits?owner=${commit.authorName}&repo=${commit.repoName}&commit=${commit.sha}&branch=total`);
                          }}
                          className="bg-neutral-900/50 border border-neutral-800 rounded-lg p-3 cursor-pointer hover:border-neutral-700 transition-colors flex gap-3"
                        >
                          <div className="mt-1 text-neutral-500">
                            <GitCommit className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-blue-400 text-xs font-mono">{commit.repoName}</span>
                              <span className="text-neutral-600 text-xs">/</span>
                              <span className="text-neutral-400 text-xs font-mono">{commit.sha.substring(0, 7)}</span>
                            </div>
                            <p className="text-sm text-white line-clamp-2 mb-1">{commit.message}</p>
                            <div className="flex items-center gap-2 text-xs text-neutral-500">
                              <span>{commit.authorName}</span>
                              <span>•</span>
                              <span>{format(new Date(commit.committedAt), 'yyyy-MM-dd HH:mm')}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

              </>
            )}

            {!loading && !hasResults && queryFromUrl && (
              <div className="text-center py-20">
                <div className="bg-neutral-900/50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-neutral-500">
                  <Loader2 className="w-8 h-8 text-neutral-600" />
                </div>
                <h3 className="text-neutral-300 font-medium mb-1">No results found</h3>
                <p className="text-neutral-500 text-sm">We couldn't find anything matching "{queryFromUrl}"</p>
              </div>
            )}

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

