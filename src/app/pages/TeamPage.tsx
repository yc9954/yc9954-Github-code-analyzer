
import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/app/components/DashboardLayout";
import { getTeams, getTeam, createTeam, joinTeam, getMyProfile, getMyTeams, getMyPendingTeams, getLeaderTeams, getPublicTeams, getTeamMembers, type Team, type TeamDetailResponse, type PageResponse } from "@/lib/api";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/app/components/ui/dialog";
import { Label } from "@/app/components/ui/label";
import { Search, Plus, Users, Shield, User, ChevronRight, LayoutGrid, List, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/app/components/ui/badge";
import { Switch } from "@/app/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";

export function TeamPage() {
    const navigate = useNavigate();
    const [teams, setTeams] = useState<TeamDetailResponse[]>([]);
    const [myTeams, setMyTeams] = useState<TeamDetailResponse[]>([]);
    const [pendingTeams, setPendingTeams] = useState<TeamDetailResponse[]>([]);
    const [leaderTeams, setLeaderTeams] = useState<TeamDetailResponse[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isJoinOpen, setIsJoinOpen] = useState(false);
    const [userId, setUserId] = useState<number | null>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [activeTab, setActiveTab] = useState("browse");
    const [joinTeamId, setJoinTeamId] = useState("");
    const [createForm, setCreateForm] = useState({
        name: "",
        description: "",
        isPublic: true,
    });

    useEffect(() => {
        getMyProfile().then(profile => setUserId(profile.id)).catch(console.error);
        loadTeams();
    }, []);

    const loadTeams = async (query = "", page = 0) => {
        setLoading(true);
        try {
            const [my, leader, pending] = await Promise.all([
                getMyTeams(),
                getLeaderTeams(),
                getMyPendingTeams()
            ]);

            // Fetch member counts for my teams and leader teams in parallel
            const myWithCounts = await Promise.all(my.map(async (t) => {
                try {
                    const members = await getTeamMembers(t.teamId);
                    return { ...t, memberCount: members.length };
                } catch {
                    return t;
                }
            }));

            const leaderWithCounts = await Promise.all(leader.map(async (t) => {
                try {
                    const members = await getTeamMembers(t.teamId);
                    return { ...t, memberCount: members.length };
                } catch {
                    return t;
                }
            }));

            const pendingWithCounts = await Promise.all(pending.map(async (t) => {
                try {
                    const members = await getTeamMembers(t.teamId);
                    return { ...t, memberCount: members.length };
                } catch {
                    return t;
                }
            }));

            setMyTeams(myWithCounts);
            setLeaderTeams(leaderWithCounts);
            setPendingTeams(pendingWithCounts);

            let publicTeams: TeamDetailResponse[] = [];
            if (query) {
                const allTeams = await getTeams(query);
                // Hydrate each searched team with full details to get leader info
                publicTeams = await Promise.all(allTeams.map(async (t) => {
                    try {
                        return await getTeam(t.id);
                    } catch (err) {
                        console.error(`Failed to hydrate team ${t.id}`, err);
                        return {
                            teamId: t.id,
                            name: t.name,
                            description: t.description,
                            leaderUsername: "Unknown",
                            leaderProfileUrl: "",
                            isPublic: true,
                        } as TeamDetailResponse;
                    }
                }));
                setTotalPages(1);
                setCurrentPage(0);
            } else {
                const publicResponse = await getPublicTeams(page, 10);
                publicTeams = publicResponse.content;
                setTotalPages(publicResponse.totalPages);
                setCurrentPage(publicResponse.number);
            }

            // Fetch member counts for public teams
            const publicWithCounts = await Promise.all(publicTeams.map(async (t) => {
                try {
                    const members = await getTeamMembers(t.teamId);
                    return { ...t, memberCount: members.length };
                } catch {
                    return t;
                }
            }));
            setTeams(publicWithCounts);

        } catch (e) {
            console.error("Failed to load teams", e);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        loadTeams(searchQuery);
    };

    const onCreateTeam = async () => {
        if (!createForm.name || !userId) {
            alert("Name is required.");
            return;
        }

        try {
            const normalizedName = createForm.name.trim().toLowerCase().replace(/\s+/g, '_');
            const result = await createTeam({
                name: normalizedName,
                description: createForm.description,
                leaderId: userId,
                isPublic: createForm.isPublic,
            });
            alert(`Team "${result.name}" created successfully!`);
            setIsCreateOpen(false);
            setCreateForm({ name: "", description: "", isPublic: true });
            // Redirect to the new team page
            navigate(`/teams/${result.teamId}`);
        } catch (e) {
            console.error(e);
            alert("Failed to create team.");
        }
    };

    const handleJoinPrivate = async () => {
        if (!joinTeamId) {
            alert("Please enter a Team ID.");
            return;
        }
        try {
            const result = await joinTeam(joinTeamId);
            if (result.status?.toUpperCase() === 'APPROVED') {
                alert("You have joined the team successfully!");
                navigate(`/teams/${joinTeamId}`);
            } else {
                alert("Join request sent! Waiting for approval.");
                setIsJoinOpen(false);
            }
        } catch (e) {
            console.error(e);
            alert("Failed to join team. Please check the Team ID.");
        }
    };

    return (
        <DashboardLayout>
            <div className="h-[calc(100vh-4rem)] flex flex-col bg-black">
                <div className="px-4 py-2.5 border-b border-neutral-900 bg-black">
                    <div className="flex items-center justify-between">
                        <h1 className="text-base font-semibold text-white">Teams</h1>
                        <div className="flex gap-2">
                            <Dialog open={isJoinOpen} onOpenChange={setIsJoinOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="border-neutral-800 text-neutral-400 hover:bg-neutral-900 h-8 text-xs px-3">
                                        <UserPlus className="w-4 h-4 mr-1" />
                                        Join Private Team
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-neutral-900 border-neutral-800 text-white">
                                    <DialogHeader>
                                        <DialogTitle>Join Private Team</DialogTitle>
                                        <DialogDescription className="text-neutral-400">
                                            Enter the Team ID to request to join a private team.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label>Team ID</Label>
                                            <Input
                                                placeholder="UUID of the team"
                                                className="bg-black border-neutral-800 text-white"
                                                value={joinTeamId}
                                                onChange={(e) => setJoinTeamId(e.target.value)}
                                            />
                                        </div>
                                        <Button
                                            className="w-full bg-green-600 hover:bg-green-700"
                                            onClick={handleJoinPrivate}
                                        >
                                            Join Team
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>

                            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                                <DialogTrigger asChild>
                                    <Button className="bg-blue-500 hover:bg-blue-600 text-white border-0 h-8 text-xs px-3">
                                        <Plus className="w-4 h-4 mr-1" />
                                        Create Team
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-neutral-900 border-neutral-800 text-white">
                                    <DialogHeader>
                                        <DialogTitle>Create New Team</DialogTitle>
                                        <DialogDescription className="text-neutral-400">
                                            Create a team to participate in sprints together.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <Label>Team Name</Label>
                                            <Input
                                                placeholder="e.g. Code Warriors"
                                                className="bg-black border-neutral-800 text-white"
                                                value={createForm.name}
                                                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Description</Label>
                                            <Input
                                                placeholder="Goal of the team..."
                                                className="bg-black border-neutral-800 text-white"
                                                value={createForm.description}
                                                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                                            />
                                        </div>
                                        <div className="flex items-center justify-between p-3 rounded-lg border border-neutral-800 bg-black/50">
                                            <div className="space-y-0.5">
                                                <Label className="text-sm font-medium">Public Team</Label>
                                                <p className="text-xs text-neutral-500">Public teams can be seen by everyone.</p>
                                            </div>
                                            <Switch
                                                checked={createForm.isPublic}
                                                onCheckedChange={(checked) => {
                                                    console.log("Setting isPublic to:", checked);
                                                    setCreateForm(prev => ({ ...prev, isPublic: !!checked }));
                                                }}
                                            />
                                        </div>
                                        <Button className="w-full bg-blue-500 hover:bg-blue-600" onClick={onCreateTeam}>
                                            Create
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    <div className="max-w-4xl mx-auto space-y-4">
                        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                            <form onSubmit={handleSearch} className="flex gap-2 w-full md:max-w-md">
                                <div className="relative flex-1">
                                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                                    <Input
                                        className="pl-9 bg-neutral-900 border-neutral-800 text-white"
                                        placeholder="Search teams..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                                <Button type="submit" variant="secondary" className="bg-neutral-900 text-white border border-neutral-800 hover:bg-neutral-800 h-10">
                                    Search
                                </Button>
                            </form>
                        </div>

                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <TabsList className="bg-neutral-900 border border-neutral-800 p-1 h-11 w-full sm:w-auto">
                                <TabsTrigger value="browse" className="text-neutral-500 data-[state=active]:bg-neutral-800 data-[state=active]:text-white h-9 px-6 text-sm transition-colors">
                                    Browse Teams
                                </TabsTrigger>
                                <TabsTrigger value="my" className="text-neutral-500 data-[state=active]:bg-neutral-800 data-[state=active]:text-white h-9 px-6 text-sm transition-colors">
                                    Joined Teams
                                </TabsTrigger>
                                <TabsTrigger value="lead" className="text-neutral-500 data-[state=active]:bg-neutral-800 data-[state=active]:text-white h-9 px-6 text-sm transition-colors">
                                    Teams You Lead
                                </TabsTrigger>
                                <TabsTrigger value="pending" className="text-neutral-500 data-[state=active]:bg-neutral-800 data-[state=active]:text-white h-9 px-6 text-sm transition-colors">
                                    Pending Requests
                                </TabsTrigger>
                            </TabsList>

                            <div className="mt-6 min-h-[400px]">
                                {loading ? (
                                    <div className="flex flex-col items-center justify-center py-20 text-neutral-500">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-4"></div>
                                        <p>Loading teams...</p>
                                    </div>
                                ) : (
                                    <>
                                        <TabsContent value="browse" className="mt-0 outline-none">
                                            <TeamList
                                                teams={teams}
                                                emptyMessage="No public teams found."
                                                showPagination={!searchQuery && totalPages > 1}
                                                currentPage={currentPage}
                                                totalPages={totalPages}
                                                onPageChange={(page) => loadTeams("", page)}
                                                loading={loading}
                                            />
                                        </TabsContent>

                                        <TabsContent value="my" className="mt-0 outline-none">
                                            <TeamList
                                                teams={myTeams.filter(t => !leaderTeams.some(lt => lt.teamId === t.teamId))}
                                                emptyMessage="You haven't joined any teams yet."
                                            />
                                        </TabsContent>

                                        <TabsContent value="lead" className="mt-0 outline-none">
                                            <TeamList
                                                teams={leaderTeams}
                                                emptyMessage="You aren't leading any teams yet."
                                                isLeader={true}
                                            />
                                        </TabsContent>
                                    </>
                                )}
                            </div>
                        </Tabs>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

interface TeamListProps {
    teams: TeamDetailResponse[];
    emptyMessage: string;
    isLeader?: boolean;
    showPagination?: boolean;
    currentPage?: number;
    totalPages?: number;
    onPageChange?: (page: number) => void;
    loading?: boolean;
}

function TeamList({ teams, emptyMessage, isLeader, showPagination, currentPage, totalPages, onPageChange, loading }: TeamListProps) {
    const navigate = useNavigate();

    if (teams.length === 0) {
        return (
            <div className="text-center text-neutral-500 py-20 border border-dashed border-neutral-800 rounded-xl bg-neutral-900/30">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
                <p>{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 overflow-hidden shadow-2xl">
                <Table>
                    <TableHeader className="bg-neutral-900/80">
                        <TableRow className="border-neutral-800 hover:bg-transparent">
                            <TableHead className="text-neutral-400 font-medium py-4 pl-6 text-xs uppercase tracking-wider w-[40%]">Team Info</TableHead>
                            <TableHead className="text-neutral-400 font-medium py-4 text-xs uppercase tracking-wider text-center w-[15%]">Participants</TableHead>
                            <TableHead className="text-neutral-400 font-medium py-4 text-xs uppercase tracking-wider w-[25%]">Leader</TableHead>
                            <TableHead className="text-neutral-400 font-medium py-4 text-xs uppercase tracking-wider w-[15%]">Visibility</TableHead>
                            <TableHead className="w-[5%]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {teams.map((team) => (
                            <TableRow
                                key={team.teamId}
                                className="border-neutral-800 hover:bg-neutral-800/40 cursor-pointer group transition-colors"
                                onClick={() => navigate(`/teams/${team.teamId}`)}
                            >
                                <TableCell className="py-5 pl-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 border border-blue-500/20 group-hover:scale-105 transition-transform">
                                            <Users className="w-5 h-5" />
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="font-semibold text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight">{team.name}</span>
                                                {isLeader && (
                                                    <Badge className="bg-blue-500 text-white border-0 text-[10px] h-4 font-bold">LEADER</Badge>
                                                )}
                                            </div>
                                            <div className="text-xs text-neutral-500 line-clamp-1 max-w-[200px] sm:max-w-[400px]">
                                                {team.description || "No description provided."}
                                            </div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="text-center">
                                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-800 border border-neutral-700">
                                        <User className="w-3 h-3 text-neutral-400" />
                                        <span className="text-sm font-medium text-white">{team.memberCount || 0}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        {team.leaderProfileUrl ? (
                                            <Avatar className="w-6 h-6 border border-neutral-800">
                                                <AvatarImage src={team.leaderProfileUrl} />
                                                <AvatarFallback className="bg-neutral-800 text-[10px] text-neutral-400">{team.leaderUsername?.slice(0, 2).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                        ) : (
                                            <div className="w-6 h-6 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center">
                                                <User className="w-3 h-3 text-neutral-400" />
                                            </div>
                                        )}
                                        <span className="text-sm text-neutral-300 font-medium">{team.leaderUsername || "Unknown"}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge className={
                                        team.isPublic ? "bg-green-500/10 text-green-400 border-green-500/20 text-[10px] font-bold uppercase" : "bg-neutral-800 text-neutral-400 border-neutral-700 text-[10px] font-bold uppercase"
                                    }>
                                        {team.isPublic ? "Public" : "Private"}
                                    </Badge>
                                </TableCell>
                                <TableCell className="pr-6">
                                    <ChevronRight className="w-4 h-4 text-neutral-600 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {showPagination && totalPages && currentPage !== undefined && onPageChange && (
                <div className="flex items-center justify-between pt-6 px-2">
                    <div className="text-xs font-medium text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                        <span className="w-1 h-3 bg-blue-500 rounded-full"></span>
                        Page {currentPage + 1} <span className="text-neutral-700 mx-1">/</span> {totalPages}
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-9 px-4 bg-neutral-900 border-neutral-800 text-white hover:bg-neutral-800 disabled:opacity-50 transition-all text-xs font-bold uppercase tracking-wider"
                            disabled={currentPage === 0 || loading}
                            onClick={() => onPageChange(currentPage - 1)}
                        >
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="h-9 px-4 bg-neutral-900 border-neutral-800 text-white hover:bg-neutral-800 disabled:opacity-50 transition-all text-xs font-bold uppercase tracking-wider"
                            disabled={currentPage >= totalPages - 1 || loading}
                            onClick={() => onPageChange(currentPage + 1)}
                        >
                            Next
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
