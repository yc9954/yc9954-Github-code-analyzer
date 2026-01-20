
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/app/components/DashboardLayout";
import { Button } from "@/app/components/ui/button";
import { Badge } from "@/app/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import {
    getTeam,
    getTeamMembers,
    joinTeam,
    approveMember,
    removeMember,
    getMyProfile,
    type TeamDetailResponse,
    type TeamMemberResponse
} from "@/lib/api";
import { Users, Shield, UserPlus, LogOut, Check, X, Lock, Globe } from "lucide-react";
import defaultAvatar from "@/assets/38ba5abba51d546a081340d28143511ad0f46c8f.png";

export function TeamDetailPage() {
    const { teamId } = useParams();
    const navigate = useNavigate();
    const [team, setTeam] = useState<TeamDetailResponse | null>(null);
    const [members, setMembers] = useState<TeamMemberResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentUserId, setCurrentUserId] = useState<number | null>(null);
    const [joinCode, setJoinCode] = useState("");

    useEffect(() => {
        if (teamId) {
            loadData();
            getMyProfile().then(p => setCurrentUserId(p.id)).catch(console.error);
        }
    }, [teamId]);

    const loadData = async () => {
        if (!teamId) return;
        setLoading(true);
        try {
            const [teamData, membersData] = await Promise.all([
                getTeam(teamId),
                getTeamMembers(teamId)
            ]);
            setTeam(teamData);
            setMembers(membersData);
        } catch (e) {
            console.error("Failed to load team data", e);
            // alert("Failed to load team data.");
        } finally {
            setLoading(false);
        }
    };

    const isLeader = team && currentUserId && members.find(m => m.userId === currentUserId && m.role === 'LEADER');
    const membership = members.find(m => m.userId === currentUserId);
    const isMember = !!membership && membership.status === 'ACTIVE';
    const isPending = !!membership && membership.status === 'PENDING';

    const handleJoin = async () => {
        if (!teamId) return;
        try {
            await joinTeam(teamId, joinCode);
            alert("Join request sent!");
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
                                {!isMember && !isPending && (
                                    <Button onClick={() => {
                                        if (!team.isPublic && !joinCode) {
                                            const code = prompt("Enter join code (optional if public):");
                                            if (code) setJoinCode(code);
                                            else if (!team.isPublic) return; // Must have code for private? Actually API handles logic.
                                            // Let's just call join.
                                        }
                                        handleJoin();
                                    }} className="bg-blue-500 hover:bg-blue-600 text-white">
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
                                    <Button variant="outline" className="border-neutral-800 text-neutral-400 hover:bg-neutral-900">
                                        Edit Settings
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-6 text-sm text-neutral-500">
                            <div className="flex items-center gap-2">
                                <Shield className="w-4 h-4 text-blue-400" />
                                <span>Leader: <span className="text-neutral-300">{team.leaderUsername}</span></span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                <span>{members.length} Members</span>
                            </div>
                            {isMember && (
                                <div className="flex items-center gap-2">
                                    <span className="text-neutral-400">Team ID: <code className="bg-neutral-900 px-1 py-0.5 rounded text-neutral-300">{team.teamId}</code></span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-4xl mx-auto space-y-6">

                        {/* Join Requests (Leader Only) */}
                        {isLeader && members.some(m => m.status === 'PENDING') && (
                            <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
                                <div className="px-4 py-3 border-b border-neutral-800 bg-neutral-900/50">
                                    <h3 className="text-sm font-medium text-white flex items-center gap-2">
                                        <UserPlus className="w-4 h-4 text-yellow-500" />
                                        Pending Requests
                                    </h3>
                                </div>
                                <div className="divide-y divide-neutral-800">
                                    {members.filter(m => m.status === 'PENDING').map(member => (
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
                                    {members.filter(m => m.status === 'ACTIVE' || (isLeader && m.status === 'PENDING')).map((member) => (
                                        <TableRow key={member.userId} className="border-neutral-800 hover:bg-neutral-800">
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar className="w-8 h-8 border border-neutral-800">
                                                        <AvatarImage src={defaultAvatar} />
                                                        <AvatarFallback className="bg-neutral-800 text-white text-xs">{member.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="text-white font-medium text-sm flex items-center gap-2">
                                                            {member.username}
                                                            {member.status === 'PENDING' && <Badge variant="secondary" className="text-[10px] h-4 px-1">Pending</Badge>}
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
