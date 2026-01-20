
import React, { useState, useEffect } from "react";
import { DashboardLayout } from "@/app/components/DashboardLayout";
import { getTeams, createTeam, getMyProfile, type Team } from "@/lib/api";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/app/components/ui/dialog";
import { Label } from "@/app/components/ui/label";
import { Search, Plus, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function TeamPage() {
    const navigate = useNavigate();
    const [teams, setTeams] = useState<Team[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [userId, setUserId] = useState<number | null>(null);

    const [createForm, setCreateForm] = useState({
        name: "",
        description: "",
    });

    useEffect(() => {
        getMyProfile().then(profile => setUserId(profile.id)).catch(console.error);
        loadTeams();
    }, []);

    const loadTeams = async (query = "") => {
        setLoading(true);
        try {
            const data = await getTeams(query);
            setTeams(data);
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
            await createTeam({
                name: createForm.name,
                description: createForm.description,
                leaderId: userId,
            });
            alert("Team created successfully!");
            setIsCreateOpen(false);
            loadTeams();
            setCreateForm({ name: "", description: "" });
        } catch (e) {
            console.error(e);
            alert("Failed to create team.");
        }
    };

    return (
        <DashboardLayout>
            <div className="h-[calc(100vh-4rem)] flex flex-col bg-black">
                <div className="px-4 py-2.5 border-b border-neutral-900 bg-black">
                    <div className="flex items-center justify-between">
                        <h1 className="text-base font-semibold text-white">Teams</h1>
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
                                    <Button className="w-full bg-blue-500 hover:bg-blue-600" onClick={onCreateTeam}>
                                        Create
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    <div className="max-w-4xl mx-auto space-y-4">
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                                <Input
                                    className="pl-9 bg-neutral-900 border-neutral-800 text-white"
                                    placeholder="Search teams..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <Button type="submit" variant="secondary" className="bg-neutral-900 text-white border border-neutral-800 hover:bg-neutral-800">
                                Search
                            </Button>
                        </form>

                        {loading ? (
                            <div className="text-center text-neutral-500 py-8">Loading teams...</div>
                        ) : teams.length === 0 ? (
                            <div className="text-center text-neutral-500 py-8">No teams found.</div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {teams.map((team) => (
                                    <div
                                        key={team.id}
                                        onClick={() => navigate(`/teams/${team.id}`)}
                                        className="p-4 rounded-lg border border-neutral-800 bg-neutral-900 hover:bg-neutral-800 transition-colors cursor-pointer group"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1">
                                                <h3 className="text-white font-medium group-hover:text-blue-400 transition-colors">{team.name}</h3>
                                                <p className="text-sm text-neutral-400 line-clamp-2">{team.description || "No description provided."}</p>
                                            </div>
                                            <Users className="w-4 h-4 text-neutral-500" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
