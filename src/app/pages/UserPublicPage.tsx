
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/app/components/DashboardLayout";
import { getUserProfile, getUserPublicRepos, type UserResponse, type PublicRepository, type Sprint } from "@/lib/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Badge } from "@/app/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Github, FolderGit2, Calendar, LayoutGrid, ChevronRight, Globe, Trophy, ExternalLink, Code, Star } from "lucide-react";
import defaultAvatar from "@/assets/38ba5abba51d546a081340d28143511ad0f46c8f.png";

export function UserPublicPage() {
    const { username } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState<UserResponse | null>(null);
    const [repositories, setRepositories] = useState<PublicRepository[]>([]); // Use PublicRepository Interface
    const [sprints, setSprints] = useState<Sprint[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (username) {
            loadUserData();
        }
    }, [username]);

    const loadUserData = async () => {
        setLoading(true);
        try {
            const profile = await getUserProfile(username!);
            const publicRepos = await getUserPublicRepos(username!);

            setUser(profile as unknown as UserResponse);
            setRepositories(publicRepos);
            setSprints((profile.participatingSprints || []) as unknown as Sprint[]);
        } catch (error) {
            console.error("Failed to load user public data:", error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="h-[calc(100vh-4rem)] flex items-center justify-center bg-black">
                    <div className="flex flex-col items-center gap-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                        <p className="text-neutral-500 text-sm">Loading profile...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (!user) {
        return (
            <DashboardLayout>
                <div className="h-[calc(100vh-4rem)] flex items-center justify-center bg-black text-neutral-500">
                    User not found.
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="h-[calc(100vh-4rem)] flex flex-col bg-black">
                {/* Profile Header */}
                <div className="px-6 py-12 border-b border-neutral-900 bg-gradient-to-b from-neutral-900/50 to-black">
                    <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-8">
                        <Avatar className="w-32 h-32 border-4 border-neutral-900 shadow-2xl">
                            <AvatarImage src={user.profileUrl || defaultAvatar} />
                            <AvatarFallback className="bg-neutral-800 text-3xl text-neutral-400">
                                {user.username.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="text-center md:text-left space-y-4">
                            <div>
                                <h1 className="text-3xl font-bold text-white mb-1">{user.name || user.username}</h1>
                                <p className="text-xl text-neutral-400">@{user.username}</p>
                            </div>
                            <div className="flex flex-wrap justify-center md:justify-start gap-4">
                                <div className="flex items-center gap-2 text-neutral-400 text-sm">
                                    <Github className="w-4 h-4" />
                                    <a href={`https://github.com/${user.username}`} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                                        GitHub Profile
                                    </a>
                                </div>
                                {user.joinedAt && (
                                    <div className="flex items-center gap-2 text-neutral-400 text-sm">
                                        <Calendar className="w-4 h-4" />
                                        Joined {new Date(user.joinedAt).toLocaleDateString()}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Main Content (Repos) */}
                        <div className="lg:col-span-2 space-y-8">
                            <section>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                                        <FolderGit2 className="w-5 h-5 text-blue-400" />
                                        Repositories
                                        <Badge variant="secondary" className="ml-2 bg-neutral-800 text-neutral-400 border-0">{repositories.length}</Badge>
                                    </h2>
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                    {repositories.length === 0 ? (
                                        <div className="p-12 text-center text-neutral-500 border border-dashed border-neutral-800 rounded-xl bg-neutral-900/20">
                                            No public repositories found.
                                        </div>
                                    ) : (
                                        repositories.map(repo => (
                                            <Card key={repo.id} className="bg-neutral-900/40 border-neutral-800 hover:border-neutral-700 transition-all group overflow-hidden">
                                                <CardHeader className="pb-2">
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <CardTitle className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                                                                {repo.reponame}
                                                            </CardTitle>
                                                            <CardDescription className="mt-1 text-sm text-neutral-400 line-clamp-2">
                                                                {repo.description || "No description provided."}
                                                            </CardDescription>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="text-neutral-500 hover:text-white"
                                                                onClick={() => window.open(repo.repoUrl, '_blank')}
                                                            >
                                                                <ExternalLink className="w-4 h-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="text-neutral-500 hover:text-white"
                                                                onClick={() => navigate(`/commits?owner=${username}&repo=${repo.reponame}&branch=total`)}
                                                            >
                                                                <Code className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="flex items-center gap-4 text-xs text-neutral-500">
                                                        {repo.language && (
                                                            <span className="flex items-center gap-1.5">
                                                                <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                                                {repo.language}
                                                            </span>
                                                        )}
                                                        <span className="flex items-center gap-1">
                                                            <Star className="w-3 h-3" />
                                                            {repo.stars}
                                                        </span>
                                                        <span>Updated {new Date(repo.updatedAt).toLocaleDateString()}</span>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))
                                    )}
                                </div>
                            </section>
                        </div>

                        {/* Sidebar (Sprints) */}
                        <div className="space-y-8">
                            <section>
                                <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                                    <Trophy className="w-5 h-5 text-yellow-500" />
                                    Public Sprints
                                </h2>
                                <div className="space-y-3">
                                    {sprints.length === 0 ? (
                                        <div className="p-8 text-center text-neutral-500 border border-dashed border-neutral-800 rounded-xl bg-neutral-900/20">
                                            Not participating in any public sprints.
                                        </div>
                                    ) : (
                                        sprints.map(sprint => (
                                            <div
                                                key={sprint.id}
                                                className="p-4 rounded-lg bg-neutral-900/60 border border-neutral-800 hover:border-neutral-700 cursor-pointer transition-all group"
                                                onClick={() => navigate(`/sprint?sprintId=${sprint.id}&mode=list`)}
                                            >
                                                <div className="flex items-center justify-between mb-2">
                                                    <h3 className="text-sm font-semibold text-white group-hover:text-yellow-500 transition-colors">{sprint.name}</h3>
                                                    <ChevronRight className="w-4 h-4 text-neutral-600 group-hover:text-yellow-500 group-hover:translate-x-1 transition-all" />
                                                </div>
                                                <div className="flex items-center gap-3 text-[10px] text-neutral-500 uppercase tracking-wider font-medium">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {new Date(sprint.startDate).toLocaleDateString()}
                                                    </span>
                                                    <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 text-[9px] h-4">
                                                        {sprint.status?.toUpperCase()}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
