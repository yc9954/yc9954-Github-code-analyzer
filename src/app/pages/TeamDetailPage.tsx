
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/app/components/DashboardLayout";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Switch } from "@/app/components/ui/switch";
import {
    getTeam,
    getTeamMembers,
    joinTeam,
    approveMember,
    removeMember,
    updateTeam,
    getMyProfile,
    getTeamRepos,
    getAvailableTeamRepos,
    addRepoToTeam,
    getRepoMetrics,
    type TeamDetailResponse,
    type TeamMemberResponse,
    type TeamUpdateRequest,
    type TeamRepo,
    type RepoMetrics
} from "@/lib/api";
import { Users, Shield, UserPlus, LogOut, Check, X, Lock, Globe, Eye, EyeOff, Copy, Edit, Settings, User, GitBranch, Plus, Github, Star, FolderGit2, Trophy } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/app/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import defaultAvatar from "@/assets/38ba5abba51d546a081340d28143511ad0f46c8f.png";

export function TeamDetailPage() {
    const { teamId } = useParams();
    const navigate = useNavigate();
    const [team, setTeam] = useState<TeamDetailResponse | null>(null);
    const [members, setMembers] = useState<TeamMemberResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const [currentUserUsername, setCurrentUserUsername] = useState<string | null>(null);
    const [isIdVisible, setIsIdVisible] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [editForm, setEditForm] = useState({
        name: "",
        description: "",
        isPublic: true
    });
    const [repos, setRepos] = useState<TeamRepo[]>([]);
    const [availableRepos, setAvailableRepos] = useState<TeamRepo[]>([]);
    const [isAddRepoOpen, setIsAddRepoOpen] = useState(false);
    const [selectedRepoId, setSelectedRepoId] = useState("");
    const [repoMetrics, setRepoMetrics] = useState<Record<string, RepoMetrics>>({});

    useEffect(() => {
        if (teamId) {
            loadData();
            getMyProfile().then(p => {
                setCurrentUserId(p.id);
                setCurrentUserUsername(p.username);
            }).catch(console.error);
        }
    }, [teamId]);

    const loadData = async () => {
        if (!teamId) return;
        setLoading(true);
        try {
            const [teamData, membersData, reposData] = await Promise.all([
                getTeam(teamId),
                getTeamMembers(teamId),
                getTeamRepos(teamId)
            ]);
            setTeam(teamData);
            setMembers(membersData);
            setRepos(reposData || []);

            // Fetch metrics for all repos
            if (reposData && reposData.length > 0) {
                const metricsMap: Record<string, RepoMetrics> = {};
                await Promise.all(reposData.map(async (repo) => {
                    // Use repo.id (opaque ID like R_kgDOM...) instead of reponame (owner/repo)
                    const metrics = await getRepoMetrics(repo.id);
                    if (metrics) {
                        metricsMap[repo.id] = metrics;
                    }
                }));
                setRepoMetrics(metricsMap);
            }

            setEditForm({
                name: teamData.name,
                description: teamData.description,
                isPublic: teamData.isPublic
            });
        } catch (e) {
            console.error("Failed to load team data", e);
            // alert("Failed to load team data.");
        } finally {
            setLoading(false);
        }
    };

    const isLeader = team && (
        (currentUserId && members.find(m => m.userId === currentUserId && m.role === 'LEADER')) ||
        (currentUserUsername && team.leaderUsername === currentUserUsername)
    );
    const membership = members.find(m => m.userId === currentUserId);
    const isMember = !!membership && (membership.status?.toUpperCase() === 'ACTIVE' || membership.status?.toUpperCase() === 'APPROVED');
    const isPending = !!membership && membership.status?.toUpperCase() === 'PENDING';

    const handleJoin = async () => {
        if (!teamId) return;
        try {
            const memberInfo = await joinTeam(teamId);
            if (memberInfo.status?.toUpperCase() === 'APPROVED') {
                alert("You have joined the team successfully!");
            } else {
                alert("Join request sent! Waiting for approval.");
            }
            loadData();
        } catch (e) {
            console.error(e);
            alert("Failed to join team.");
        }
    };

    const handleApprove = async (userId: number) => {
        if (!teamId) return;
        try {
            await approveMember(teamId, userId);
            loadData();
        } catch (e) {
            console.error(e);
            alert("Failed to approve member.");
        }
    };

    const handleKick = async (userId: number) => {
        if (!teamId) return;
        if (!confirm("Are you sure you want to remove this member?")) return;
        try {
            await removeMember(teamId, userId);
            loadData();
        } catch (e) {
            console.error(e);
            alert("Failed to remove member.");
        }
    };

    const handleUpdateTeam = async () => {
        if (!teamId) return;
        try {
            await updateTeam(teamId, editForm);
            alert("Team updated successfully!");
            setIsEditOpen(false);
            loadData();
        } catch (e) {
            console.error(e);
            alert("Failed to update team.");
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        alert("Copied to clipboard!");
    };

    const handleAddRepo = async () => {
        if (!teamId || !selectedRepoId) return;
        try {
            await addRepoToTeam(teamId, selectedRepoId);
            alert("Repository added successfully!");
            setIsAddRepoOpen(false);
            setSelectedRepoId("");
            // Reload repos
            const updatedRepos = await getTeamRepos(teamId);
            setRepos(updatedRepos || []);
        } catch (e) {
            console.error(e);
            alert("Failed to add repository.");
        }
    };

    const loadAvailableRepos = async () => {
        if (!teamId) return;
        try {
            const data = await getAvailableTeamRepos(teamId);
            setAvailableRepos(data || []);
        } catch (e) {
            console.error("Failed to load available repos", e);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="h-[calc(100vh-4rem)] flex items-center justify-center bg-black text-neutral-500">
                    Loading team details...
                </div>
            </DashboardLayout>
        );
    }

    if (!team) {
        return (
            <DashboardLayout>
                <div className="h-[calc(100vh-4rem)] flex items-center justify-center bg-black text-neutral-500">
                    Team not found.
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="h-[calc(100vh-4rem)] flex flex-col bg-black">
                {/* Header */}
                <div className="px-6 py-6 border-b border-neutral-900 bg-black">
                    <div className="max-w-4xl mx-auto">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <h1 className="text-2xl font-bold text-white">{team.name}</h1>
                                    {team.isPublic ? (
                                        <Badge variant="outline" className="border-green-500/20 text-green-400 bg-green-500/10 gap-1">
                                            <Globe className="w-3 h-3" /> Public
                                        </Badge>
                                    ) : (
                                        <Badge variant="outline" className="border-yellow-500/20 text-yellow-400 bg-yellow-500/10 gap-1">
                                            <Lock className="w-3 h-3" /> Private
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-neutral-400 max-w-2xl">{team.description}</p>
                            </div>

                            <div className="flex gap-2">
                                {!isMember && !isPending && !isLeader && (
                                    <Button onClick={handleJoin} className="bg-blue-500 hover:bg-blue-600 text-white">
                                        <UserPlus className="w-4 h-4 mr-2" />
                                        Join Team
                                    </Button>
                                )}
                                {isPending && (
                                    <Button disabled variant="secondary" className="bg-neutral-800 text-neutral-400">
                                        Request Pending
                                    </Button>
                                )}
                                {isLeader && (
                                    <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                                        <DialogTrigger asChild>
                                            <Button variant="outline" className="border-neutral-800 text-neutral-400 hover:bg-neutral-900 gap-2">
                                                <Edit className="w-4 h-4" />
                                                Edit Team
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="bg-neutral-900 border-neutral-800 text-white">
                                            <DialogHeader>
                                                <DialogTitle>Edit Team Settings</DialogTitle>
                                                <DialogDescription className="text-neutral-400">
                                                    Update your team's information and visibility.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="space-y-4 py-4">
                                                <div className="space-y-2">
                                                    <Label>Team Name</Label>
                                                    <Input
                                                        value={editForm.name}
                                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                        className="bg-black border-neutral-800 text-white"
                                                    />
                                                </div>
                                                <div className="space-y-2">
                                                    <Label>Description</Label>
                                                    <Input
                                                        value={editForm.description}
                                                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                                        className="bg-black border-neutral-800 text-white"
                                                    />
                                                </div>
                                                <div className="flex items-center justify-between p-3 rounded-lg border border-neutral-800 bg-black/50">
                                                    <div className="space-y-0.5">
                                                        <Label className="text-sm font-medium">Public Team</Label>
                                                        <p className="text-xs text-neutral-500">Public teams can be seen by everyone.</p>
                                                    </div>
                                                    <Switch
                                                        checked={editForm.isPublic}
                                                        onCheckedChange={(checked) => setEditForm({ ...editForm, isPublic: !!checked })}
                                                    />
                                                </div>
                                                <Button className="w-full bg-blue-500 hover:bg-blue-600" onClick={handleUpdateTeam}>
                                                    Save Changes
                                                </Button>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-6 text-sm text-neutral-500">
                            <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4 text-blue-400" />
                                <div className="flex items-center gap-1.5">
                                    {team.leaderProfileUrl ? (
                                        <Avatar className="w-5 h-5 border border-neutral-800">
                                            <AvatarImage src={team.leaderProfileUrl} />
                                            <AvatarFallback className="bg-neutral-800 text-[8px] text-neutral-400">{team.leaderUsername?.slice(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                    ) : (
                                        <div className="w-5 h-5 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center">
                                            <User className="w-3 h-3 text-neutral-400" />
                                        </div>
                                    )}
                                    <span>Leader: <span className="text-neutral-300 font-medium">{team.leaderUsername}</span></span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                <span>{members.length} Members</span>
                            </div>
                            {isLeader && (
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2 text-neutral-400">
                                        <span>Team ID:</span>
                                        <code className="bg-neutral-900 px-2 py-1 rounded text-neutral-300 font-mono text-xs">
                                            {isIdVisible ? team.teamId : "••••••••-••••-••••-••••-••••••••••••"}
                                        </code>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8 text-neutral-500 hover:text-white"
                                            onClick={() => setIsIdVisible(!isIdVisible)}
                                        >
                                            {isIdVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8 text-neutral-500 hover:text-white"
                                            onClick={() => copyToClipboard(team.teamId)}
                                        >
                                            <Copy className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-4xl mx-auto space-y-6">

                        {/* Join Requests (Leader Only) */}
                        {isLeader && members.some(m => m.status?.toUpperCase() === 'PENDING') && (
                            <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
                                <div className="px-4 py-3 border-b border-neutral-800 bg-neutral-900/50">
                                    <h3 className="text-sm font-medium text-white flex items-center gap-2">
                                        <UserPlus className="w-4 h-4 text-yellow-500" />
                                        Pending Requests
                                    </h3>
                                </div>
                                <div className="divide-y divide-neutral-800">
                                    {members.filter(m => m.status?.toUpperCase() === 'PENDING').map(member => (
                                        <div key={member.userId} className="flex items-center justify-between p-4 hover:bg-neutral-800/50 transition-colors">
                                            <div className="flex items-center gap-3">
                                                <Avatar>
                                                    <AvatarFallback>{member.username[0]}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="text-white font-medium">{member.username}</div>
                                                    <div className="text-xs text-neutral-500">Requesting to join</div>
                                                </div>
                                            </div>
                                            <div className="flex gap-2">
                                                <Button size="sm" onClick={() => handleApprove(member.userId)} className="bg-green-500/20 text-green-400 hover:bg-green-500/30 border-0">
                                                    <Check className="w-4 h-4" />
                                                </Button>
                                                <Button size="sm" onClick={() => handleKick(member.userId)} className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border-0">
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Repositories List */}
                        <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
                            <div className="px-4 py-3 border-b border-neutral-800 bg-neutral-900/50 flex items-center justify-between">
                                <h3 className="text-sm font-medium text-white flex items-center gap-2">
                                    <GitBranch className="w-4 h-4 text-purple-400" />
                                    Team Repositories
                                </h3>
                                {isLeader && (
                                    <Dialog open={isAddRepoOpen} onOpenChange={(open) => {
                                        setIsAddRepoOpen(open);
                                        if (open) loadAvailableRepos();
                                    }}>
                                        <DialogTrigger asChild>
                                            <Button size="sm" variant="outline" className="h-7 text-xs border-neutral-800 text-neutral-400 hover:text-white hover:bg-neutral-800">
                                                <Plus className="w-3 h-3 mr-1" />
                                                Add Repository
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="bg-neutral-900 border-neutral-800 text-white">
                                            <DialogHeader>
                                                <DialogTitle>Add Repository to Team</DialogTitle>
                                                <DialogDescription className="text-neutral-400">
                                                    Select a repository to add to this team. Only repositories you own or contribute to are shown.
                                                </DialogDescription>
                                            </DialogHeader>
                                            <div className="py-4">
                                                <Label className="mb-2 block">Select Repository</Label>
                                                <Select value={selectedRepoId} onValueChange={setSelectedRepoId}>
                                                    <SelectTrigger className="bg-black border-neutral-800 text-white w-full">
                                                        <SelectValue placeholder="Select a repository..." />
                                                    </SelectTrigger>
                                                    <SelectContent className="bg-neutral-900 border-neutral-800 text-white max-h-[300px]">
                                                        {availableRepos.length === 0 ? (
                                                            <div className="p-2 text-sm text-neutral-500 text-center">No available repositories found.</div>
                                                        ) : (
                                                            availableRepos.map((repo) => (
                                                                <SelectItem key={repo.id} value={repo.id}>
                                                                    {repo.reponame} ({repo.language || 'Unknown'})
                                                                </SelectItem>
                                                            ))
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <DialogFooter>
                                                <Button variant="ghost" onClick={() => setIsAddRepoOpen(false)} className="text-neutral-400 hover:text-white">Cancel</Button>
                                                <Button onClick={handleAddRepo} className="bg-purple-600 hover:bg-purple-700 text-white" disabled={!selectedRepoId}>Add Repository</Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                )}
                            </div>
                            {repos.length === 0 ? (
                                <div className="p-8 text-center text-neutral-500">
                                    <Github className="w-10 h-10 mx-auto mb-3 opacity-20" />
                                    <p className="text-sm">No repositories added to this team yet.</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-neutral-800">
                                    {repos.map((repo) => (
                                        <div key={repo.id} className="p-4 hover:bg-neutral-800/30 transition-colors flex items-center justify-between group">
                                            <div className="flex items-start gap-3">
                                                <div className="mt-1 p-2 rounded-md bg-neutral-800 border border-neutral-700">
                                                    <GitBranch className="w-4 h-4 text-neutral-400" />
                                                </div>
                                                <div>
                                                    <h4 className="text-white font-medium text-sm group-hover:text-purple-400 transition-colors">
                                                        <a href={repo.repoUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                                            {repo.reponame}
                                                        </a>
                                                    </h4>
                                                    <p className="text-xs text-neutral-500 mt-1 line-clamp-1">{repo.description || "No description"}</p>
                                                    <div className="flex items-center gap-3 mt-2 text-xs text-neutral-600">
                                                        {repo.language && <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-purple-500"></span> {repo.language}</span>}
                                                        <span>Updated {new Date(repo.updatedAt).toLocaleDateString()}</span>

                                                        {repoMetrics[repo.id] && (
                                                            <>
                                                                <div className="w-px h-3 bg-neutral-700 mx-1"></div>
                                                                <span className="flex items-center gap-1 text-neutral-400" title="Total Commits">
                                                                    <FolderGit2 className="w-3 h-3" /> {repoMetrics[repo.id].commitCount}
                                                                </span>
                                                                <span className="flex items-center gap-1 text-neutral-400" title="Total Score">
                                                                    <Trophy className="w-3 h-3 text-yellow-500/70" /> {Math.round(repoMetrics[repo.id].totalScore)}
                                                                </span>
                                                                <span className="flex items-center gap-1 text-neutral-400" title="Avg Score">
                                                                    <Star className="w-3 h-3 text-blue-400/70" /> {Math.round(repoMetrics[repo.id].averageScore * 10) / 10}
                                                                </span>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity text-neutral-500 hover:text-white" asChild>
                                                <a href={repo.repoUrl} target="_blank" rel="noopener noreferrer">View</a>
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Members List */}
                        <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
                            <div className="px-4 py-3 border-b border-neutral-800 bg-neutral-900/50">
                                <h3 className="text-sm font-medium text-white">Team Members</h3>
                            </div>
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-neutral-800 bg-neutral-900/50 hover:bg-neutral-900/50">
                                        <TableHead className="text-neutral-400">Member</TableHead>
                                        <TableHead className="text-neutral-400">Role</TableHead>
                                        <TableHead className="text-neutral-400 text-right">Commits</TableHead>
                                        <TableHead className="text-neutral-400 text-right">Contribution</TableHead>
                                        {isLeader && <TableHead className="w-[50px]"></TableHead>}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {members.filter(m => m.status?.toUpperCase() !== 'PENDING' || isLeader).map((member) => (
                                        <TableRow key={member.userId} className="border-neutral-800 hover:bg-neutral-800">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="w-8 h-8 border border-neutral-800">
                                                        <AvatarImage src={member.profileUrl || defaultAvatar} />
                                                        <AvatarFallback className="bg-neutral-800 text-white text-xs">{member.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="text-white font-medium text-sm flex items-center gap-2">
                                                            {member.username}
                                                            {member.status?.toUpperCase() === 'PENDING' && <Badge variant="secondary" className="text-[10px] h-4 px-1">Pending</Badge>}
                                                        </div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={member.role === 'LEADER' ? 'default' : 'secondary'} className={member.role === 'LEADER' ? "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30" : "bg-neutral-800 text-neutral-400"}>
                                                    {member.role}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right text-neutral-300">{member.commitCount}</TableCell>
                                            <TableCell className="text-right text-neutral-300">{member.contributionScore}</TableCell>
                                            {isLeader && (
                                                <TableCell>
                                                    {member.userId !== currentUserId && (
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-neutral-500 hover:text-red-400" onClick={() => handleKick(member.userId)}>
                                                            <LogOut className="w-4 h-4" />
                                                        </Button>
                                                    )}
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
