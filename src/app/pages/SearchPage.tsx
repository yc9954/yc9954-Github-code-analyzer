import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/app/components/DashboardLayout";
import { Input } from "@/app/components/ui/input";
import { Button } from "@/app/components/ui/button";
import { Checkbox } from "@/app/components/ui/checkbox";
import { Star, GitBranch, Calendar, BookOpen, MessageSquare, Users, ChevronDown } from "lucide-react";
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
  const [searchParams, setSearchParams] = useSearchParams();
  const queryFromUrl = searchParams.get("q") || "";
  const [searchQuery, setSearchQuery] = useState(queryFromUrl);
  const [activeFilter, setActiveFilter] = useState<"repositories" | "discussions" | "users">("repositories");
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);

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
      <div className="h-[calc(100vh-4rem)] flex flex-col bg-black">
        {/* Compact Header */}
        <div className="px-4 py-2.5 border-b border-neutral-900 bg-black">
          <h1 className="text-base font-semibold text-white">Search</h1>
        </div>
        <div className="flex-1 overflow-y-auto bg-black">
          <div className="w-full px-4 py-4 h-full">
            <div className="flex gap-6 h-full">
              {/* Left Sidebar - Filters */}
              <aside className="w-48 flex-shrink-0">
                <div className="sticky top-4 space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-white mb-3">Filter by</h3>
                  <div className="space-y-1">
                    <button
                      onClick={() => setActiveFilter("repositories")}
                      className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                        activeFilter === "repositories"
                          ? "bg-blue-500 text-white"
                          : "text-white hover:bg-neutral-900"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-white">Repositories</span>
                        <span className="text-xs text-neutral-400">{filterCounts.repositories}</span>
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveFilter("discussions")}
                      className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                        activeFilter === "discussions"
                          ? "bg-blue-500 text-white"
                          : "text-white hover:bg-neutral-900"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-white">Discussions</span>
                        <span className="text-xs text-neutral-400">{filterCounts.discussions}</span>
                      </div>
                    </button>
                    <button
                      onClick={() => setActiveFilter("users")}
                      className={`w-full text-left px-3 py-2 text-sm rounded-md transition-colors ${
                        activeFilter === "users"
                          ? "bg-blue-500 text-white"
                          : "text-white hover:bg-neutral-900"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-white">Users</span>
                        <span className="text-xs text-neutral-400">{filterCounts.users}</span>
                      </div>
                    </button>
                  </div>
                </div>

                {activeFilter === "repositories" && (
                  <div className="pt-4 border-t border-neutral-900">
                    <h3 className="text-sm font-semibold text-white mb-3">Languages</h3>
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
                          className="w-full text-left px-3 py-1.5 text-sm rounded-md transition-colors flex items-center gap-2 text-white hover:bg-neutral-900"
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
                      <button className="w-full text-left px-3 py-1.5 text-sm text-blue-400 hover:bg-neutral-900 rounded-md">
                        More languages...
                      </button>
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-neutral-900">
                  <h3 className="text-sm font-semibold text-white mb-3">Advanced</h3>
                  <div className="space-y-2">
                    <button className="w-full text-left px-3 py-1.5 text-sm text-white hover:bg-neutral-900 rounded-md flex items-center justify-between">
                      <span className="text-white">Owner</span>
                      <ChevronDown className="w-4 h-4 text-white" />
                    </button>
                    <button className="w-full text-left px-3 py-1.5 text-sm text-white hover:bg-neutral-900 rounded-md flex items-center justify-between">
                      <span className="text-white">Size</span>
                      <ChevronDown className="w-4 h-4 text-white" />
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
                    <div className="text-sm text-neutral-400">
                      {mockRepositories.length} results (148 ms)
                    </div>
                    <div className="flex items-center gap-2">
                      <Select defaultValue="best-match">
                        <SelectTrigger className="w-40 h-8 bg-neutral-900 border-neutral-800 text-white text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-neutral-900 border-neutral-800">
                          <SelectItem value="best-match" className="text-white">Best match</SelectItem>
                          <SelectItem value="stars" className="text-white">Most stars</SelectItem>
                          <SelectItem value="updated" className="text-white">Recently updated</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="sm" className="h-8 border-neutral-800 text-white hover:bg-neutral-900 bg-neutral-900">
                        Save
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {mockRepositories.map((repo) => (
                      <div
                        key={repo.id}
                        className="border border-neutral-800 rounded-lg p-4 hover:border-neutral-700 hover:bg-neutral-900 transition-colors bg-neutral-900"
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-base font-semibold text-white hover:underline cursor-pointer">
                                {repo.owner}/{repo.name}
                              </h3>
                              {repo.isArchived && (
                                <Badge variant="outline" className="text-xs border-neutral-800 text-neutral-400">
                                  Public archive
                                </Badge>
                              )}
                            </div>
                            {repo.description && (
                              <p className="text-sm text-neutral-300 mb-3 line-clamp-2">{repo.description}</p>
                            )}
                            <div className="flex items-center gap-4 text-sm text-neutral-400">
                              {repo.language && (
                                <div className="flex items-center gap-1.5">
                                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                  <span className="text-neutral-300">{repo.language}</span>
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-neutral-400" />
                                <span className="text-neutral-300">{repo.stars}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="w-4 h-4 text-neutral-400" />
                                <span className="text-neutral-300">Updated {repo.updated}</span>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-shrink-0 border-neutral-800 text-white hover:bg-neutral-900 bg-neutral-900 h-8"
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
