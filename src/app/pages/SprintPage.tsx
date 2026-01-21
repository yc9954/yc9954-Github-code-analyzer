import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/app/components/DashboardLayout";
import {
  getSprints,
  getMySprints,
  getSprintRankings,
  createSprint,
  registerSprint,
  getMyProfile,
  updateSprint,
  banTeam,
  approveTeam,
  getSprintRegistrations,
  getSprintInfo,
  registerTeamForSprint,
  getLeaderTeams,
  getTeamRepos,
  getTeamMembers,
  type Sprint,
  type SprintRanking,
  type UserResponse,
  type SprintRegistration,
  type TeamDetailResponse,
  type TeamMemberResponse,
  type TeamRepo,
  searchRepositories
} from "@/lib/api";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table";
import { Badge } from "@/app/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/app/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { GitBranch, Search, Filter, Calendar as CalendarIcon, User, Users, Trophy, ChevronRight, Clock, Plus, LayoutGrid, List, MoreHorizontal, CheckCircle2, XCircle, AlertCircle, Sparkles, Clipboard, MessageSquare, TrendingUp, TrendingDown, ChevronDown, X } from "lucide-react";
import { FaGithub, FaTrophy, FaMedal, FaRegCopy } from "react-icons/fa";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Progress } from "@/app/components/ui/progress";
import { Switch } from "@/app/components/ui/switch";
import { Calendar } from "@/app/components/ui/calendar";
import { Card, CardContent, CardFooter } from "@/app/components/ui/card";
import {
  endOfMonth,
  endOfYear,
  startOfMonth,
  startOfYear,
  subDays,
  subMonths,
  subYears,
  addDays,
  addMonths,
  format
} from 'date-fns';
import type { DateRange } from 'react-day-picker';
import { cn } from "@/app/components/ui/utils";
import defaultAvatar from "@/assets/38ba5abba51d546a081340d28143511ad0f46c8f.png";

// Mock data
const allSprints = [
  { id: 1, name: "Winter Hackathon 2026", teams: 12, startDate: "Jan 10", endDate: "Jan 16", status: "active", participants: 48 },
  { id: 2, name: "Q1 Bootcamp Sprint", teams: 8, startDate: "Jan 8", endDate: "Jan 20", status: "active", participants: 32 },
  { id: 3, name: "Code Challenge Week", teams: 15, startDate: "Jan 5", endDate: "Jan 19", status: "active", participants: 60 },
  { id: 4, name: "Summer Hackathon 2025", teams: 20, startDate: "Dec 1", endDate: "Dec 7", status: "completed", participants: 80 },
];



const myRepositories = [
  { id: 1, name: "web-dashboard", selected: false },
  { id: 2, name: "api-server", selected: false },
  { id: 3, name: "mobile-app", selected: false },
];

const teamMembers = [
  { name: "Alice Johnson", username: "alicej", role: "Lead", commits: 145, contribution: 28 },
  { name: "Bob Smith", username: "bobsmith", role: "Developer", commits: 123, contribution: 24 },
  { name: "Carol White", username: "carolw", role: "Developer", commits: 98, contribution: 19 },
  { name: "David Brown", username: "davidb", role: "Developer", commits: 87, contribution: 17 },
  { name: "Emma Davis", username: "emmad", role: "Designer", commits: 62, contribution: 12 },
];

const commitHistory = [
  { sha: "a1b2c3d", message: "feat: Add authentication module", time: "2 hours ago", additions: 234, deletions: 12 },
  { sha: "e4f5g6h", message: "fix: Resolve memory leak", time: "4 hours ago", additions: 45, deletions: 67 },
  { sha: "i7j8k9l", message: "docs: Update API docs", time: "6 hours ago", additions: 123, deletions: 8 },
];

// Calendar with Range Presets Component
interface CalendarWithRangePresetsProps {
  dateRange: DateRange | undefined;
  setDateRange: (range: DateRange | undefined) => void;
  month: Date;
  setMonth: (month: Date) => void;
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
}

const CalendarWithRangePresets = ({
  dateRange,
  setDateRange,
  month,
  setMonth,
  setStartDate,
  setEndDate
}: CalendarWithRangePresetsProps) => {
  const today = new Date();

  // Future Presets Only
  const tomorrow = {
    from: addDays(today, 1),
    to: addDays(today, 1)
  };

  const next7Days = {
    from: today,
    to: addDays(today, 6)
  };

  const next14Days = {
    from: today,
    to: addDays(today, 13)
  };

  const nextMonth = {
    from: startOfMonth(addMonths(today, 1)),
    to: endOfMonth(addMonths(today, 1))
  };

  const handleDateSelect = (newDate: DateRange | undefined) => {
    setDateRange(newDate);
    if (newDate?.from) {
      setStartDate(format(newDate.from, 'yyyy-MM-dd'));
    } else {
      setStartDate("");
    }
    if (newDate?.to) {
      setEndDate(format(newDate.to, 'yyyy-MM-dd'));
    } else {
      setEndDate("");
    }
  };

  const handlePresetClick = (preset: DateRange) => {
    setDateRange(preset);
    if (preset.from) {
      setMonth(preset.from); // Set month to start of preset
      setStartDate(format(preset.from, 'yyyy-MM-dd'));
    }
    if (preset.to) {
      setEndDate(format(preset.to, 'yyyy-MM-dd'));
    }
  };

  return (
    <div>
      <Card className='max-w-xs py-4 bg-neutral-900 border-neutral-800'>
        <CardContent className='px-4'>
          <Calendar
            mode='range'
            selected={dateRange}
            onSelect={handleDateSelect}
            month={month}
            onMonthChange={setMonth}
            numberOfMonths={1}
            disabled={{ before: today }} // Disable past dates
            className='w-full bg-transparent p-0 text-white'
            classNames={{
              months: "flex flex-col sm:flex-row gap-2",
              month: "flex flex-col gap-4",
              caption: "flex justify-center pt-1 relative items-center w-full",
              caption_label: "text-sm font-medium text-white",
              nav: "flex items-center gap-1",
              nav_button: "size-7 bg-transparent p-0 opacity-50 hover:opacity-100 text-white border border-neutral-800 hover:bg-neutral-800 rounded",
              nav_button_previous: "absolute left-1",
              nav_button_next: "absolute right-1",
              table: "w-full border-collapse space-x-1",
              head_row: "flex",
              head_cell: "text-neutral-400 rounded-md w-8 font-normal text-[0.8rem]",
              row: "flex w-full mt-2",
              cell: cn(
                "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
                "[&:has([aria-selected])]:bg-blue-500/20",
                "[&:has([aria-selected].day-range-end)]:rounded-r-md",
                "[&:has([aria-selected].day-range-start)]:rounded-l-md",
                "first:[&:has([aria-selected])]:rounded-l-md",
                "last:[&:has([aria-selected])]:rounded-r-md"
              ),
              day: "size-8 p-0 font-normal aria-selected:opacity-100 text-white hover:bg-neutral-800 hover:text-white rounded cursor-pointer transition-colors",
              day_selected: "bg-blue-500 text-white hover:bg-blue-600 hover:text-white font-semibold",
              day_range_start: "bg-blue-500 text-white rounded-l-md font-semibold",
              day_range_end: "bg-blue-500 text-white rounded-r-md font-semibold",
              day_range_middle: "bg-blue-500/30 text-white aria-selected:bg-blue-500/30",
              day_today: "bg-neutral-800 text-white font-semibold",
              day_outside: "text-neutral-600 opacity-50",
              day_disabled: "text-neutral-600 opacity-50 cursor-not-allowed",
              day_hidden: "invisible",
            }}
          />
        </CardContent>
        <CardFooter className='flex flex-wrap gap-2 border-t border-neutral-800 px-4 !pt-4'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => {
              const todayRange = { from: today, to: today };
              handlePresetClick(todayRange);
            }}
            className="border-neutral-800 bg-neutral-900 text-white hover:bg-neutral-800 text-xs"
          >
            Today
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => handlePresetClick(tomorrow)}
            className="border-neutral-800 bg-neutral-900 text-white hover:bg-neutral-800 text-xs"
          >
            Tomorrow
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => handlePresetClick(next7Days)}
            className="border-neutral-800 bg-neutral-900 text-white hover:bg-neutral-800 text-xs"
          >
            Next 7 days
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => handlePresetClick(next14Days)}
            className="border-neutral-800 bg-neutral-900 text-white hover:bg-neutral-800 text-xs"
          >
            Next 14 days
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => handlePresetClick(nextMonth)}
            className="border-neutral-800 bg-neutral-900 text-white hover:bg-neutral-800 text-xs"
          >
            Next month
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export function SprintPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const selectedSprint = searchParams.get("sprintId");
  const viewMode = (searchParams.get("mode") as "list" | "participate" | "ranking" | "create" | "manage") || "list";

  const navigateSprint = (mode: string, sprintId?: string | null) => {
    const params = new URLSearchParams(searchParams);
    params.set("mode", mode);
    if (sprintId) {
      params.set("sprintId", sprintId);
    } else {
      params.delete("sprintId");
    }
    setSearchParams(params);
  };

  const [selectedRepos, setSelectedRepos] = useState<number[]>([]);
  const [expandedCommits, setExpandedCommits] = useState<string[]>([]);
  const [aiOpen, setAiOpen] = useState(false);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [sprintRankings, setSprintRankings] = useState<SprintRanking[]>([]);
  const [loadingSprints, setLoadingSprints] = useState(false);
  const [loadingRankings, setLoadingRankings] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [teamIdInput, setTeamIdInput] = useState("");
  const [registrations, setRegistrations] = useState<SprintRegistration[]>([]);
  const [activeTab, setActiveTab] = useState("browse");
  const [mySprints, setMySprints] = useState<Sprint[]>([]);
  const [allPendingRegistrations, setAllPendingRegistrations] = useState<(SprintRegistration & { sprintId: string })[]>([]);
  const [loadingMySprints, setLoadingMySprints] = useState(false);

  // Team-based registration state
  const [leaderTeams, setLeaderTeams] = useState<(TeamDetailResponse & { repoCount?: number })[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [teamRepos, setTeamRepos] = useState<TeamRepo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [loadingRepos, setLoadingRepos] = useState(false);
  const [selectedTeamMembers, setSelectedTeamMembers] = useState<TeamMemberResponse[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);

  // Load user profile to get ID
  useEffect(() => {
    getMyProfile().then(profile => {
      setUserId(profile.id);
      setCurrentUser(profile);
    }).catch(err => console.error("Failed to load profile", err));
  }, []);

  // Removed duplicate handleCreateSprint to avoid confusion


  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
    isPublic: true,
  });

  const onCreateSprint = async () => {
    if (!createForm.name || !startDate || !endDate || !currentUser) {
      alert("Please fill in all required fields and ensure you are logged in.");
      return;
    }

    try {
      await createSprint({
        name: createForm.name,
        description: createForm.description,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        isPrivate: !createForm.isPublic,
        isOpen: true,
        managerId: currentUser.id,
      });
      alert("Sprint created successfully!");
      navigateSprint("list", null);
      setCreateForm({ name: "", description: "", isPublic: true });
      // Reload sprints
      loadSprints();
    } catch (e: any) {
      console.error(e);
      alert(e.message || "Failed to create sprint.");
    }
  };

  const onUpdateSprint = async () => {
    if (!selectedSprint || !currentUser) return;
    setIsUpdating(true);
    try {
      await updateSprint(selectedSprint, {
        name: createForm.name,
        description: createForm.description,
        startDate: new Date(startDate).toISOString(),
        endDate: new Date(endDate).toISOString(),
        isPrivate: !createForm.isPublic,
        isOpen: true, // Assuming it's open if being updated, or we could add a toggle
        managerId: currentUser.id,
      });
      alert("Sprint updated successfully!");
      loadSprints();
    } catch (error) {
      console.error(error);
      alert("Failed to update sprint.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleBanTeam = async (teamId: string) => {
    if (!selectedSprint || !confirm("Are you sure you want to ban this team?")) return;
    try {
      await banTeam(selectedSprint, teamId);
      alert("Team banned successfully.");
      // Refresh rankings
      const data = await getSprintRankings(selectedSprint, rankingViewType === 'team' ? 'TEAM' : 'INDIVIDUAL');
      setSprintRankings(data);
    } catch (e) {
      console.error(e);
      alert("Failed to ban team.");
    }
  };
  const handleApproveTeamResult = async (teamId: string, approve: boolean) => {
    if (!selectedSprint) return;
    try {
      await approveTeam(selectedSprint, teamId, approve);
      alert(approve ? "Team approved!" : "Team rejected.");
      // Refresh
      const regData = await getSprintRegistrations(selectedSprint);
      setRegistrations(regData);
      const rankingData = await getSprintRankings(selectedSprint, rankingViewType === 'team' ? 'TEAM' : 'INDIVIDUAL');
      setSprintRankings(rankingData);
    } catch (e) {
      console.error(e);
      alert("Action failed.");
    }
  };
  const onRegisterSprint = async () => {
    if (!selectedSprint || !selectedTeam || !selectedRepo) {
      alert("Please select a team and a repository.");
      return;
    }

    try {
      await registerTeamForSprint(selectedSprint.toString(), selectedTeam, selectedRepo);
      alert("Registration successful!");
      // Reset and go back to list
      setSelectedTeam(null);
      setSelectedRepo(null);
      navigateSprint("list", null);
    } catch (e: any) {
      console.error(e);
      alert(`Failed to register: ${e.message || 'Unknown error'}`);
    }
  };

  const toggleCommit = (sha: string) => {
    setExpandedCommits(prev =>
      prev.includes(sha) ? prev.filter(s => s !== sha) : [...prev, sha]
    );
  };

  const toggleRepo = (id: number) => {
    setSelectedRepos(prev =>
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const [rankingViewType, setRankingViewType] = useState<"individual" | "team">("team");
  const [currentUser, setCurrentUser] = useState<UserResponse | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Load leader teams when entering participate mode
  useEffect(() => {
    if (viewMode === 'participate') {
      setLoadingTeams(true);
      getLeaderTeams()
        .then(async (teams) => {
          // For each team, fetch members and repos to get accurate info
          const enrichedTeams = await Promise.all(
            teams.map(async (team) => {
              try {
                const [members, repos] = await Promise.all([
                  getTeamMembers(team.teamId),
                  getTeamRepos(team.teamId)
                ]);
                const activeCount = members.filter(m => m.status !== 'PENDING').length;
                return {
                  ...team,
                  memberCount: activeCount,
                  repoCount: repos.length
                };
              } catch (err) {
                console.error(`Failed to fetch details for team ${team.teamId}`, err);
                return { ...team, repoCount: 0 };
              }
            })
          );

          // Sort: Teams with repos first, then alphabetically
          const sortedTeams = enrichedTeams.sort((a, b) => {
            const aHasRepos = (a.repoCount || 0) > 0;
            const bHasRepos = (b.repoCount || 0) > 0;
            if (aHasRepos && !bHasRepos) return -1;
            if (!aHasRepos && bHasRepos) return 1;
            return a.name.localeCompare(b.name);
          });

          setLeaderTeams(sortedTeams);
          // Reset selections
          setSelectedTeam(null);
          setTeamRepos([]);
          setSelectedRepo(null);
        })
        .catch(err => console.error("Failed to load leader teams", err))
        .finally(() => setLoadingTeams(false));
    }
  }, [viewMode]);

  // Load team repos and members when a team is selected
  useEffect(() => {
    if (selectedTeam) {
      setLoadingRepos(true);
      setLoadingMembers(true);

      // Fetch repos
      getTeamRepos(selectedTeam)
        .then(repos => {
          setTeamRepos(repos);
          setSelectedRepo(null); // Reset repo selection
        })
        .catch(err => console.error("Failed to load team repos", err))
        .finally(() => setLoadingRepos(false));

      // Fetch members
      import("@/lib/api").then(({ getTeamMembers }) => {
        getTeamMembers(selectedTeam)
          .then(members => {
            setSelectedTeamMembers(members);
          })
          .catch(err => console.error("Failed to load team members", err))
          .finally(() => setLoadingMembers(false));
      });
    } else {
      setTeamRepos([]);
      setSelectedRepo(null);
      setSelectedTeamMembers([]);
    }
  }, [selectedTeam]);

  // Date range state for calendar
  const today = new Date();
  const last7Days = {
    from: subDays(today, 6),
    to: today
  };
  const [month, setMonth] = useState(today);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(last7Days);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const loadAllPendingRegistrations = async (managedSprints: Sprint[], mySprints: Sprint[]) => {
    try {
      const allRegs = await Promise.all(
        managedSprints.map(async s => {
          const regs = await getSprintRegistrations(s.id);
          return regs.map(r => ({ ...r, sprintId: s.id }));
        })
      );

      let flattened = allRegs.flat().filter(r => r.status === 'PENDING');

      // Also add my own pending sprints if any
      const myPending = mySprints.filter(s => s.status === 'PENDING').map(s => ({
        teamId: "My Team", // We don't have the team ID easily but we can label it
        teamName: "Your Team",
        repoId: "Pending",
        status: 'PENDING' as const,
        registeredAt: new Date().toISOString(),
        sprintId: s.id
      }));

      setAllPendingRegistrations([...flattened, ...myPending]);
    } catch (error) {
      console.error("Failed to load all pending registrations", error);
    }
  };

  const loadSprints = async () => {
    setLoadingSprints(true);
    setLoadingMySprints(true);
    try {
      const [all, mine] = await Promise.all([
        getSprints(),
        getMySprints()
      ]);
      setSprints(all || []);
      setMySprints(mine || []);

      const managed = mine.filter(s => s.managerName === currentUser?.username);
      loadAllPendingRegistrations(managed, mine || []);
    } catch (error) {
      console.error('Error loading sprints:', error);
      setSprints([]);
      setMySprints([]);
    } finally {
      setLoadingSprints(false);
      setLoadingMySprints(false);
    }
  };

  // Load sprints from API
  useEffect(() => {
    if (currentUser) {
      loadSprints();
    }
  }, [currentUser]);

  const handleSearchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      loadSprints();
      return;
    }

    setLoadingSprints(true);
    try {
      // Use the integrated search API
      const response = await searchRepositories(searchQuery, undefined, 'best-match', 'sprints');

      // Map current sprints to preserve full data if they exist in search results
      // or fetch missing data for new sprints found in search
      const searchResults = response.sprints || [];

      // Filter existing sprints or create partial ones
      const mappedResults: Sprint[] = searchResults.map(sr => {
        const existing = sprints.find(s => s.id === sr.id);
        if (existing) return existing;

        return {
          id: sr.id,
          name: sr.name,
          description: sr.description,
          startDate: new Date().toISOString(), // Fallback
          endDate: new Date().toISOString(),   // Fallback
          isPrivate: false,
          isOpen: true,
          status: 'Active'
        } as Sprint;
      });

      setSprints(mappedResults);
      setActiveTab("browse"); // Switch to browse to see search results
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoadingSprints(false);
    }
  };

  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // Filter, Sort, and Paginate
  const filteredSprints = useMemo(() => {
    let source = sprints;
    if (activeTab === "joined") {
      source = mySprints;
    } else if (activeTab === "managed") {
      source = mySprints.filter(s => s.managerName === currentUser?.username);
    }

    let result = [...source];

    // 1. Search Filter - Only filter client-side if we are NOT using the server-side search
    // Since we now have handleSearch for Browse tab, we only filter Joined/Managed here
    if (searchQuery && (activeTab === "joined" || activeTab === "managed")) {
      result = result.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // 2. Status Filter
    if (statusFilter !== "all" && activeTab !== "pending") {
      result = result.filter(s => {
        const isActive = s.status === 'active' || s.isOpen;
        return statusFilter === 'active' ? isActive : !isActive;
      });
    }

    // 3. Sort: Active First, then Newest
    result.sort((a, b) => {
      // Prioritize explicit 'active' status
      const aActive = a.status === 'active';
      const bActive = b.status === 'active';

      if (aActive && !bActive) return -1;
      if (!aActive && bActive) return 1;

      // If both active or both inactive, sort by date (newest first)
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    });

    return result;
  }, [sprints, mySprints, activeTab, searchQuery, statusFilter, currentUser]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredSprints.length / ITEMS_PER_PAGE);
  const paginatedSprints = filteredSprints.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  const selectedSprintData = sprints.find((s) => s.id === selectedSprint);
  const isManager = currentUser && selectedSprintData && (selectedSprintData.managerName === currentUser.username);

  // Load sprint rankings and registrations when a sprint is selected
  useEffect(() => {
    // Load rankings if in 'ranking' mode OR 'participate' (detail) mode OR 'manage' mode
    if (selectedSprint && (viewMode === 'ranking' || viewMode === 'manage' || viewMode === 'participate')) {
      const loadRankings = async () => {
        setLoadingRankings(true);
        setSprintRankings([]); // Clear stale rankings
        try {
          const sprintId = sprints.find(s => s.id === selectedSprint.toString())?.id || selectedSprint.toString();
          console.log(`[SprintPage] Loading rankings for sprint ${sprintId}`);

          // Use the selected rankingViewType, default to 'team' for detail view if not set
          const type = rankingViewType === 'individual' ? 'INDIVIDUAL' : 'TEAM';

          const data = await getSprintRankings(sprintId, type);
          console.log(`[SprintPage] Rankings loaded:`, data);
          setSprintRankings(data);
        } catch (error) {
          console.error('Error loading sprint rankings:', error);
        } finally {
          setLoadingRankings(false);
        }
      };

      const loadRegistrations = async () => {
        setLoadingRegistrations(true);
        try {
          const data = await getSprintRegistrations(selectedSprint);
          setRegistrations(data);
        } catch (error) {
          console.error('Error loading registrations:', error);
        } finally {
          setLoadingRegistrations(false);
        }
      };

      loadRankings();
      loadRegistrations(); // Fetch for both managers and participants to check already-registered status
    }
  }, [selectedSprint, viewMode, rankingViewType, sprints]);

  // Synchronize state with URL is now handled by derivations above

  // Update date inputs when date range changes
  useEffect(() => {
    if (dateRange?.from) {
      setStartDate(format(dateRange.from, 'yyyy-MM-dd'));
    }
    if (dateRange?.to) {
      setEndDate(format(dateRange.to, 'yyyy-MM-dd'));
    }
  }, [dateRange]);

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-4rem)] flex flex-col bg-black">
        {/* Compact Header */}
        <div className="px-4 py-2.5 border-b border-neutral-900 bg-black">
          <div className="flex items-center justify-between">
            <h1 className="text-base font-semibold text-white">Sprints</h1>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => navigateSprint("ranking", selectedSprint)}
                variant="outline"
                className="border-neutral-800 bg-neutral-900 text-white hover:bg-neutral-800 h-8 text-xs px-3"
              >
                <FaTrophy className="w-4 h-4 mr-1" />
                Ranking
              </Button>
              {isManager && (
                <Button
                  onClick={() => {
                    navigateSprint("manage", selectedSprint);
                    if (selectedSprintData) {
                      setCreateForm({
                        name: selectedSprintData.name,
                        description: selectedSprintData.description || "",
                        isPublic: !selectedSprintData.isPrivate,
                      });
                      setStartDate(selectedSprintData.startDate.split('T')[0]);
                      setEndDate(selectedSprintData.endDate.split('T')[0]);
                    }
                  }}
                  className="bg-red-500 hover:bg-red-600 text-white border-0 h-8 text-xs px-3"
                >
                  Manage
                </Button>
              )}
              <Button
                onClick={() => navigateSprint("create", null)}
                className="bg-blue-500 hover:bg-blue-600 text-white border-0 h-8 text-xs px-3"
              >
                <Plus className="w-4 h-4 mr-1" />
                Create Sprint
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          <div className="max-w-6xl mx-auto space-y-2">
            {/* Main Content */}
            {viewMode === "list" && (
              <div className="space-y-4">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                  <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:max-w-xl">
                    <div className="relative flex-1">
                      <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
                      <Input
                        className="pl-9 bg-neutral-900 border-neutral-800 text-white h-10"
                        placeholder="Search sprints..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger className="w-40 bg-neutral-900 border-neutral-800 text-white h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-neutral-900 border-neutral-800">
                        <SelectItem value="all" className="text-white">All Sprints</SelectItem>
                        <SelectItem value="active" className="text-white">Active Only</SelectItem>
                        <SelectItem value="completed" className="text-white">Completed Only</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button type="submit" variant="secondary" className="bg-neutral-900 text-white border border-neutral-800 hover:bg-neutral-800 h-10 px-4">
                      Search
                    </Button>
                  </form>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="bg-neutral-900 border border-neutral-800 p-1 h-11 w-full sm:w-auto overflow-x-auto justify-start">
                    <TabsTrigger value="browse" className="text-neutral-500 data-[state=active]:bg-neutral-800 data-[state=active]:text-white h-9 px-6 text-sm transition-colors whitespace-nowrap">
                      Browse Sprints
                    </TabsTrigger>
                    <TabsTrigger value="joined" className="text-neutral-500 data-[state=active]:bg-neutral-800 data-[state=active]:text-white h-9 px-6 text-sm transition-colors whitespace-nowrap">
                      Joined Sprints
                    </TabsTrigger>
                    <TabsTrigger value="managed" className="text-neutral-500 data-[state=active]:bg-neutral-800 data-[state=active]:text-white h-9 px-6 text-sm transition-colors whitespace-nowrap">
                      Sprints You Manage
                    </TabsTrigger>
                    <TabsTrigger value="pending" className="text-neutral-500 data-[state=active]:bg-neutral-800 data-[state=active]:text-white h-9 px-6 text-sm transition-colors whitespace-nowrap">
                      Pending Requests
                    </TabsTrigger>
                  </TabsList>

                  <div className="mt-4">
                    {activeTab === "pending" ? (
                      <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="border-neutral-800 bg-neutral-900 hover:bg-neutral-900">
                              <TableHead className="text-neutral-400 font-medium text-xs h-7 py-1">Team Name</TableHead>
                              <TableHead className="text-neutral-400 font-medium text-xs h-7 py-1">Sprint ID</TableHead>
                              <TableHead className="text-neutral-400 font-medium text-xs h-7 py-1">Repository</TableHead>
                              <TableHead className="text-neutral-400 font-medium text-right text-xs h-7 py-1">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {allPendingRegistrations.length === 0 ? (
                              <TableRow>
                                <TableCell colSpan={4} className="text-center text-neutral-500 py-12">No pending registration requests.</TableCell>
                              </TableRow>
                            ) : (
                              allPendingRegistrations.map((reg) => (
                                <TableRow key={`${reg.teamId}-${reg.repoId}`} className="border-neutral-800 bg-black hover:bg-neutral-900 h-10 transition-colors">
                                  <TableCell className="font-medium text-white text-sm whitespace-nowrap">{reg.teamName}</TableCell>
                                  <TableCell className="text-neutral-400 text-xs whitespace-nowrap">{reg.sprintId}</TableCell>
                                  <TableCell className="text-neutral-400 text-xs truncate max-w-[150px]">{reg.repoId}</TableCell>
                                  <TableCell className="text-right">
                                    <Button
                                      size="sm"
                                      className="bg-blue-600 hover:bg-blue-500 h-7 text-xs px-2"
                                      onClick={() => {
                                        navigateSprint("manage", reg.sprintId);
                                      }}
                                    >
                                      Go Manage
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden">
                        <Table>
                          <TableHeader>
                            <TableRow className="border-neutral-800 bg-neutral-900 hover:bg-neutral-900">
                              <TableHead className="text-neutral-400 font-medium text-xs h-7 py-1">Sprint Name</TableHead>
                              <TableHead className="text-neutral-400 font-medium text-xs h-7 py-1">Period</TableHead>
                              <TableHead className="text-neutral-400 font-medium text-right text-xs h-7 py-1">Teams</TableHead>
                              <TableHead className="text-neutral-400 font-medium text-right text-xs h-7 py-1">Participants</TableHead>
                              <TableHead className="text-neutral-400 font-medium text-xs h-7 py-1">Status</TableHead>
                              <TableHead className="text-neutral-400 font-medium text-right text-xs h-7 py-1">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {paginatedSprints.map((sprint) => (
                              <TableRow
                                key={sprint.id}
                                className="border-neutral-800 bg-black hover:bg-neutral-900 h-10 cursor-pointer transition-colors"
                                onClick={() => {
                                  navigateSprint("participate", sprint.id);
                                }}
                              >
                                <TableCell className="font-medium text-white text-sm py-1 whitespace-nowrap">{sprint.name}</TableCell>
                                <TableCell className="text-white/60 text-xs py-1 whitespace-nowrap">
                                  {format(new Date(sprint.startDate), 'MMM dd')} - {format(new Date(sprint.endDate), 'MMM dd')}
                                </TableCell>
                                <TableCell className="text-white text-right text-sm py-1">{sprint.teamsCount || 0}</TableCell>
                                <TableCell className="text-neutral-400 text-right text-sm py-1">{sprint.participantsCount || 0}</TableCell>
                                <TableCell className="py-1">
                                  <Badge className={sprint.status === 'active' || sprint.isOpen ? 'bg-blue-500/10 text-blue-400 border-neutral-800 text-[10px] h-4 px-1.5' : 'bg-neutral-900 text-neutral-400 border-neutral-800 text-[10px] h-4 px-1.5'}>
                                    {sprint.status || (sprint.isOpen ? 'active' : 'closed')}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-right py-1" onClick={(e) => e.stopPropagation()}>
                                  {currentUser && sprint.managerName === currentUser.username && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-7 text-xs px-2 text-red-400 hover:text-red-300"
                                      onClick={() => {
                                        navigateSprint("manage", sprint.id);
                                        setCreateForm({
                                          name: sprint.name,
                                          description: sprint.description || "",
                                          isPublic: !sprint.isPrivate,
                                        });
                                        setStartDate(sprint.startDate.split('T')[0]);
                                        setEndDate(sprint.endDate.split('T')[0]);
                                      }}
                                    >
                                      Manage
                                    </Button>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                            {paginatedSprints.length === 0 && (
                              <TableRow>
                                <TableCell colSpan={6} className="text-center text-neutral-500 py-12">
                                  {loadingSprints || loadingMySprints ? "Loading sprints..." : "No sprints found in this category."}
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </div>
                </Tabs>

                {activeTab !== "pending" && totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 py-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                      disabled={currentPage === 1}
                      className="h-7 text-xs px-2 bg-neutral-900 border-neutral-800 text-neutral-400 disabled:opacity-50"
                    >
                      Previous
                    </Button>
                    <span className="text-xs text-neutral-400">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                      disabled={currentPage === totalPages}
                      className="h-7 text-xs px-2 bg-neutral-900 border-neutral-800 text-neutral-400 disabled:opacity-50"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </div>
            )}

            {viewMode === "participate" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-white">Sprint Details</h2>
                  <Button
                    variant="ghost"
                    onClick={() => navigateSprint("list", null)}
                    className="text-neutral-400 hover:text-white h-7 text-xs px-2"
                  >
                    ← Back
                  </Button>
                </div>

                {selectedSprintData && (
                  <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-5">
                    <div className="flex flex-col md:flex-row gap-6 justify-between items-start">
                      <div className="space-y-3 flex-1">
                        <div>
                          <h1 className="text-2xl font-bold text-white mb-2">{selectedSprintData.name}</h1>
                          <div className="flex items-center gap-2 mb-2">
                            <code className="bg-black/50 border border-neutral-800 px-2 py-0.5 rounded text-[10px] text-neutral-400 font-mono">
                              ID: {selectedSprintData.id}
                            </code>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-5 w-5 p-0 text-neutral-500 hover:text-white"
                              onClick={() => {
                                navigator.clipboard.writeText(selectedSprintData.id);
                              }}
                            >
                              <FaRegCopy className="w-3 h-3" />
                            </Button>
                          </div>
                          <p className="text-neutral-400 text-sm leading-relaxed">
                            {selectedSprintData.description || "No description provided for this sprint."}
                          </p>
                        </div>
                        <div className="flex flex-wrap gap-4 pt-2">
                          <div className="flex items-center gap-2 text-sm text-neutral-300 bg-neutral-800/50 px-3 py-1.5 rounded-md border border-neutral-800">
                            <User className="w-4 h-4 text-blue-400" />
                            <span className="text-neutral-500">Manager:</span>
                            <span className="font-medium">{selectedSprintData.managerName || "Unknown"}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-neutral-300 bg-neutral-800/50 px-3 py-1.5 rounded-md border border-neutral-800">
                            <CalendarIcon className="w-4 h-4 text-green-400" />
                            <span className="text-neutral-500">Period:</span>
                            <span className="font-medium">
                              {format(new Date(selectedSprintData.startDate), 'yyyy.MM.dd')} - {format(new Date(selectedSprintData.endDate), 'yyyy.MM.dd')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-3 min-w-[150px]">
                        <Badge className={`${selectedSprintData.status === 'active' || selectedSprintData.isOpen
                          ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          : 'bg-neutral-800 text-neutral-400 border-neutral-700'
                          } px-3 py-1 text-sm capitalize`}>
                          {selectedSprintData.status || (selectedSprintData.isOpen ? 'Active' : 'Completed')}
                        </Badge>
                        <div className="text-xs text-neutral-500 text-right space-y-1">
                          <div><span className="text-white font-semibold">{selectedSprintData.teamsCount || 0}</span> Teams</div>
                          <div><span className="text-white font-semibold">{selectedSprintData.participantsCount || 0}</span> Participants</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                  {/* Left - Repository & Team Info (Select Sprint hidden) */}
                  <div className="lg:col-span-2 space-y-2">
                    {/* Hidden Sprint Select to clean up UI */}
                    <div className="hidden">
                      <h3 className="text-sm font-medium text-white mb-2">Select Sprint</h3>
                      <Select value={selectedSprint || ''} onValueChange={(value) => navigateSprint(viewMode, value)}>
                        <SelectTrigger className="bg-black border-neutral-800 text-white h-8 text-sm">
                          <SelectValue placeholder="Choose a sprint to participate" />
                        </SelectTrigger>
                        <SelectContent className="bg-neutral-900 border-neutral-800">
                          {sprints.filter(s => s.status === 'active' || s.isOpen).map((sprint) => (
                            <SelectItem key={sprint.id} value={String(sprint.id)} className="text-white text-sm">
                              {sprint.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>


                    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-white">Sprint Registration</h3>
                      </div>

                      {isManager ? (
                        <div className="p-6 border border-blue-500/20 rounded-md bg-blue-500/5 text-center space-y-2">
                          <Sparkles className="w-8 h-8 text-blue-400 mx-auto opacity-50" />
                          <h4 className="text-sm font-semibold text-white">Sprint Manager Mode</h4>
                          <p className="text-xs text-neutral-400 max-w-[250px] mx-auto">
                            As the manager of this sprint, you are responsible for approving teams and declaring winners.
                            Managers cannot register their own teams for participation.
                          </p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-2 border-neutral-800 bg-neutral-900 text-blue-400 hover:bg-neutral-800 h-8 px-4"
                            onClick={() => navigateSprint("manage", selectedSprint)}
                          >
                            Go to Management
                          </Button>
                        </div>
                      ) : selectedSprintData && (new Date() > new Date(selectedSprintData.endDate)) ? (
                        <div className="p-8 border border-amber-500/20 rounded-md bg-amber-500/5 text-center space-y-3">
                          <Clock className="w-10 h-10 text-amber-500 mx-auto opacity-50" />
                          <div>
                            <h4 className="text-base font-bold text-white mb-1">Sprint Completed</h4>
                            <p className="text-xs text-neutral-400 max-w-[300px] mx-auto">
                              This sprint has ended on {format(new Date(selectedSprintData.endDate), 'yyyy.MM.dd')}.
                              Registration is no longer available. Viewing results and rankings only.
                            </p>
                          </div>
                          <div className="pt-2">
                            <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20">
                              Completed
                            </Badge>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="space-y-4">
                            <div>
                              <h4 className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">Step 1: Select Your Team</h4>
                              {loadingTeams ? (
                                <div className="text-sm text-neutral-400 py-4 text-center">Loading teams...</div>
                              ) : leaderTeams.length === 0 ? (
                                <div className="text-sm text-neutral-400 py-4 text-center border border-neutral-800 rounded-md bg-neutral-900/50">
                                  <p className="mb-1 text-xs">You are not a team leader.</p>
                                  <p className="text-[10px]">Only team leaders can register teams for sprints.</p>
                                </div>
                              ) : (
                                <Select value={selectedTeam || ''} onValueChange={(value) => setSelectedTeam(value)}>
                                  <SelectTrigger className="bg-black border-neutral-800 text-white h-9 text-sm">
                                    <SelectValue placeholder="Choose a team" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-neutral-900 border-neutral-800">
                                    {leaderTeams.map((team) => {
                                      const isAlreadyRegistered = registrations.some(reg => reg.teamId === team.teamId);
                                      return (
                                        <SelectItem
                                          key={team.teamId}
                                          value={team.teamId}
                                          className="text-white text-sm"
                                          disabled={team.repoCount === 0 || isAlreadyRegistered}
                                        >
                                          <div className={`flex items-center justify-between w-full ${team.repoCount === 0 || isAlreadyRegistered ? 'opacity-50' : ''}`}>
                                            <span>{team.name}</span>
                                            <span className="text-xs text-neutral-400 ml-2">
                                              {isAlreadyRegistered ? (
                                                <span className="text-blue-400 font-medium">Already Registered</span>
                                              ) : (
                                                `${team.memberCount || 0} members, ${team.repoCount || 0} repos`
                                              )}
                                            </span>
                                          </div>
                                        </SelectItem>
                                      );
                                    })}
                                  </SelectContent>
                                </Select>
                              )}
                            </div>

                            {selectedTeam && (
                              <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                <h4 className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">Step 2: Select Repository</h4>
                                {loadingRepos ? (
                                  <div className="text-sm text-neutral-400 py-4 text-center">Loading repositories...</div>
                                ) : teamRepos.length === 0 ? (
                                  <div className="text-sm text-neutral-400 py-4 text-center border border-neutral-800 rounded-md bg-neutral-900/50">
                                    <p className="mb-1 text-xs">No repositories found.</p>
                                    <p className="text-[10px]">Add repositories to your team first.</p>
                                  </div>
                                ) : (
                                  <div className="space-y-2 mb-3">
                                    {teamRepos.map((repo) => (
                                      <div
                                        key={repo.id}
                                        onClick={() => setSelectedRepo(repo.id)}
                                        className={`flex items-center justify-between p-2 border rounded cursor-pointer transition-colors ${selectedRepo === repo.id
                                          ? 'border-blue-500 bg-blue-500/10'
                                          : 'border-neutral-800 hover:bg-neutral-800'
                                          }`}
                                      >
                                        <div className="flex items-center gap-2">
                                          <GitBranch className="w-4 h-4 text-neutral-400" />
                                          <div>
                                            <span className="text-sm text-white">{repo.reponame}</span>
                                          </div>
                                        </div>
                                        {selectedRepo === repo.id && (
                                          <Badge className="bg-blue-500/10 text-blue-400 border-neutral-800 text-xs h-4 px-2">
                                            Selected
                                          </Badge>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}

                            <Button
                              className="w-full bg-blue-500 hover:bg-blue-600 text-white border-0 h-9 text-sm font-medium transition-all"
                              onClick={onRegisterSprint}
                              disabled={!selectedTeam || !selectedRepo}
                            >
                              {selectedTeam && selectedRepo ? "Register for Sprint" : "Process Registration"}
                            </Button>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Right - Ranking & Team Matches */}
                    <div className="space-y-2">
                      <div className="bg-neutral-900 border border-neutral-800 rounded-lg overflow-hidden relative">
                        {/* Header */}
                        <div className="p-3 border-b border-neutral-800 bg-neutral-900 flex items-center justify-between">
                          <h3 className="text-sm font-medium text-white flex items-center gap-2">
                            <FaTrophy className="text-yellow-500" />
                            Top Sprint Teams
                          </h3>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-blue-400 hover:text-white h-6 px-2"
                            onClick={() => {
                              setRankingViewType('team');
                              const sprintId = sprints.find(s => s.id === selectedSprint?.toString())?.id || selectedSprint?.toString();
                              if (sprintId) {
                                getSprintRankings(sprintId, 'TEAM').then(setSprintRankings);
                              }
                            }}
                          >
                            <Sparkles className="w-3 h-3" />
                          </Button>
                        </div>

                        {/* Content with Blur Overlay support */}
                        <div className="relative">
                          {/* Blur Overlay Logic */}
                          {selectedSprintData && (
                            (new Date() < new Date(selectedSprintData.startDate)) ||
                            (!loadingRankings && sprintRankings.length === 0)
                          ) && (
                              <div className="absolute inset-0 z-10 backdrop-blur-sm bg-black/20 flex flex-col items-center justify-center text-center p-4">
                                <h4 className="text-white font-bold text-sm mb-1">
                                  {new Date() < new Date(selectedSprintData.startDate) ? "Coming Soon" : "No Teams Registered"}
                                </h4>
                                <p className="text-neutral-300 text-xs">
                                  {new Date() < new Date(selectedSprintData.startDate)
                                    ? "Rankings will be available when sprint starts."
                                    : "Be the first to join!"}
                                </p>
                              </div>
                            )}

                          <div className="p-3 max-h-[400px] overflow-y-auto">
                            {loadingRankings ? (
                              <div className="text-center text-neutral-500 text-sm py-8">Loading rankings...</div>
                            ) : (
                              <div className="space-y-2">
                                {sprintRankings.slice(0, 10).map((r, idx) => (
                                  <div key={idx} className="flex items-center gap-3 bg-black border border-neutral-800 p-2 rounded-md">
                                    <div className={`font-mono font-bold text-sm min-w-[20px] text-center ${idx === 0 ? 'text-yellow-400' : idx === 1 ? 'text-neutral-300' : idx === 2 ? 'text-amber-600' : 'text-neutral-500'}`}>
                                      {r.rank}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="text-sm text-white font-medium truncate">{r.team?.name || "Unknown Team"}</div>
                                      <div className="flex gap-2 text-[10px] text-neutral-400">
                                        <span>{r.team?.score?.toLocaleString() || 0} pts</span>
                                        <span>•</span>
                                        <span>{r.team?.members || 0} members</span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                                {/* Empty state is now handled by the Blur Overlay */}
                                {sprintRankings.length === 0 && (
                                  <div className="text-neutral-500 text-xs text-center py-8 opacity-0">
                                    Placeholder
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Team Members */}
                      {selectedTeam && (
                        <div className="bg-neutral-900 border border-neutral-800 rounded-lg animate-in fade-in duration-500">
                          <div className="px-3 py-2 border-b border-neutral-800 bg-neutral-900">
                            <h3 className="text-sm font-medium text-white">Team Members</h3>
                          </div>
                          <Table>
                            <TableHeader>
                              <TableRow className="border-neutral-800 bg-neutral-900 hover:bg-neutral-900">
                                <TableHead className="text-neutral-400 font-medium text-xs h-7 py-1">Member</TableHead>
                                <TableHead className="text-neutral-400 font-medium text-xs h-7 py-1">Role</TableHead>
                                <TableHead className="text-neutral-400 font-medium text-xs text-right h-7 py-1">Commits</TableHead>
                                <TableHead className="text-neutral-400 font-medium text-xs h-7 py-1">Contribution</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {loadingMembers ? (
                                <TableRow>
                                  <TableCell colSpan={4} className="text-center text-neutral-500 py-4 text-xs">Loading members...</TableCell>
                                </TableRow>
                              ) : selectedTeamMembers.length === 0 ? (
                                <TableRow>
                                  <TableCell colSpan={4} className="text-center text-neutral-500 py-4 text-xs">No members found in this team</TableCell>
                                </TableRow>
                              ) : (
                                selectedTeamMembers.map((member: TeamMemberResponse) => (
                                  <TableRow key={member.userId} className="border-neutral-800 bg-black hover:bg-neutral-900 h-8">
                                    <TableCell className="py-1">
                                      <div className="flex items-center gap-2">
                                        <Avatar className="w-6 h-6 border border-neutral-800">
                                          <AvatarImage src={member.profileUrl || defaultAvatar} />
                                          <AvatarFallback className="bg-neutral-900 text-white text-[10px]">
                                            {member.username.substring(0, 2).toUpperCase()}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div>
                                          <div className="text-sm font-medium text-white">{member.username}</div>
                                          <div className="text-[10px] text-neutral-400">@{member.username}</div>
                                        </div>
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-xs text-neutral-400 py-1">{member.role}</TableCell>
                                    <TableCell className="text-xs text-white text-right py-1">{member.commitCount}</TableCell>
                                    <TableCell className="py-1">
                                      <div className="flex items-center gap-1.5 min-w-[100px]">
                                        <Progress value={member.contributionScore} className="flex-1 h-1.5" />
                                        <span className="text-[10px] text-neutral-400 min-w-[30px]">{Math.round(member.contributionScore)}%</span>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                ))
                              )}
                            </TableBody>
                          </Table>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {viewMode === "ranking" && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold text-white">Sprint Rankings</h2>
                  <Button
                    variant="ghost"
                    onClick={() => navigateSprint("list", null)}
                    className="text-neutral-400 hover:text-white h-7 text-xs px-2"
                  >
                    ← Back
                  </Button>
                </div>
                <div className="flex items-center gap-2">
                  <Select defaultValue="1">
                    <SelectTrigger className="w-64 bg-neutral-900 border-neutral-800 text-white h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-900 border-neutral-800">
                      {sprints.map((sprint) => (
                        <SelectItem key={sprint.id} value={String(sprint.id)} className="text-white text-sm">
                          {sprint.name}
                        </SelectItem>
                      ))}
                      {sprints.length === 0 && !loadingSprints && (
                        <div className="p-2 text-xs text-neutral-500 text-center">No sprints available</div>
                      )}
                    </SelectContent>
                  </Select>
                  <Select value={rankingViewType} onValueChange={(value) => setRankingViewType(value as "individual" | "team")}>
                    <SelectTrigger className="w-32 bg-neutral-900 border-neutral-800 text-white h-8 text-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-neutral-900 border-neutral-800">
                      <SelectItem value="individual" className="text-white focus:bg-neutral-800 text-sm">Individual</SelectItem>
                      <SelectItem value="team" className="text-white focus:bg-neutral-800 text-sm">Team</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Team Ranking */}
                {rankingViewType === "team" && (
                  <div className="bg-neutral-900 border border-neutral-800 rounded-lg">
                    <div className="px-3 py-2 border-b border-neutral-800 bg-neutral-900">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-white">Team Leaderboard</h3>
                        <span className="text-xs text-neutral-400">Updated recently</span>
                      </div>
                    </div>
                    {loadingRankings ? (
                      <div className="p-8 text-center text-neutral-500">Loading rankings...</div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow className="border-neutral-800 bg-neutral-900 hover:bg-neutral-900">
                            <TableHead className="text-neutral-400 font-medium text-xs w-12 h-7 py-1">Rank</TableHead>
                            <TableHead className="text-neutral-400 font-medium text-xs h-7 py-1">Team</TableHead>
                            <TableHead className="text-neutral-400 font-medium text-right text-xs h-7 py-1">Score</TableHead>
                            <TableHead className="text-neutral-400 font-medium text-right text-xs h-7 py-1">Commits</TableHead>
                            <TableHead className="text-neutral-400 font-medium text-right text-xs h-7 py-1">Members</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sprintRankings.length === 0 ? (
                            <TableRow className="border-neutral-800 bg-black hover:bg-neutral-900 h-8">
                              <TableCell colSpan={5} className="text-center text-neutral-500 py-4">
                                No team rankings available yet.
                              </TableCell>
                            </TableRow>
                          ) : (
                            sprintRankings.map((item) => (
                              <TableRow key={item.rank} className="border-neutral-800 bg-black hover:bg-neutral-900 cursor-pointer h-8">
                                <TableCell className="font-medium text-white text-sm py-1">
                                  <div className="flex items-center gap-1">
                                    {item.rank <= 3 && (
                                      <div
                                        className="relative w-4 h-4 flex items-center justify-center"
                                        style={{
                                          background: item.rank === 1
                                            ? 'linear-gradient(135deg, rgba(255,215,0,0.25), rgba(255,223,0,0.15))'
                                            : item.rank === 2
                                              ? 'linear-gradient(135deg, rgba(192,192,192,0.25), rgba(169,169,169,0.15))'
                                              : 'linear-gradient(135deg, rgba(205,127,50,0.25), rgba(160,82,45,0.15))',
                                          backdropFilter: 'blur(8px)',
                                          borderRadius: '50%',
                                        }}
                                      >
                                        <FaTrophy
                                          className="w-3 h-3 relative z-10"
                                          style={{
                                            color: item.rank === 1 ? '#FFD700' : item.rank === 2 ? '#C0C0C0' : '#CD7F32',
                                          }}
                                        />
                                      </div>
                                    )}
                                    <span className={cn("inline-block w-4 text-center", item.rank <= 3 ? "text-yellow-500 font-bold" : "text-neutral-400")}>
                                      {item.rank}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell text-sm py-1>
                                  <div className="flex items-center gap-2">
                                    <div className="text-sm font-medium text-white">{item.team?.name || 'Unknown Team'}</div>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right font-semibold text-white text-sm py-1">{item.team?.score || 0}</TableCell>
                                <TableCell className="text-right text-neutral-400 text-sm py-1">{item.team?.commits || 0}</TableCell>
                                <TableCell className="text-right text-neutral-400 text-sm py-1 px-4">{item.team?.members || 0}</TableCell>
                              </TableRow>
                            )))}
                        </TableBody>
                      </Table>
                    )}
                  </div>
                )}

                {/* Individual Ranking */}
                {rankingViewType === "individual" && (
                  <div className="bg-neutral-900 border border-neutral-800 rounded-lg">
                    <div className="px-3 py-2 border-b border-neutral-800 bg-neutral-900">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-white">Individual Leaderboard</h3>
                        <span className="text-xs text-neutral-400">Updated recently</span>
                      </div>
                    </div>
                    {loadingRankings ? (
                      <div className="p-8 text-center text-neutral-500">Loading rankings...</div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow className="border-neutral-800 bg-neutral-900 hover:bg-neutral-900">
                            <TableHead className="text-neutral-400 font-medium text-xs w-12 h-7 py-1">Rank</TableHead>
                            <TableHead className="text-neutral-400 font-medium text-xs h-7 py-1">User</TableHead>
                            <TableHead className="text-neutral-400 font-medium text-right text-xs h-7 py-1">Score</TableHead>
                            <TableHead className="text-neutral-400 font-medium text-right text-xs h-7 py-1">Commits</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sprintRankings.length === 0 ? (
                            <TableRow className="border-neutral-800 bg-black hover:bg-neutral-900 h-8">
                              <TableCell colSpan={4} className="text-center text-neutral-500 py-4">
                                No individual rankings available yet.
                              </TableCell>
                            </TableRow>
                          ) : (
                            sprintRankings.map((item) => (
                              <TableRow key={item.rank} className="border-neutral-800 bg-black hover:bg-neutral-900 cursor-pointer h-8">
                                <TableCell className="font-medium text-white text-sm py-1">
                                  <span className={cn("inline-block w-4 text-center ml-5", item.rank <= 3 ? "text-yellow-500 font-bold" : "text-neutral-400")}>
                                    {item.rank}
                                  </span>
                                </TableCell>
                                <TableCell className="text-sm py-1">
                                  <div className="flex items-center gap-2">
                                    <Avatar className="w-5 h-5 border border-neutral-800">
                                      <AvatarImage src={item.user?.profileUrl || defaultAvatar} />
                                      <AvatarFallback className="bg-neutral-900 text-white text-[10px]">
                                        {item.user?.username?.substring(0, 2).toUpperCase() || "??"}
                                      </AvatarFallback>
                                    </Avatar>
                                    <div>
                                      <div className="text-sm font-medium text-white">{item.user?.username || 'Unknown'}</div>
                                    </div>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right font-semibold text-white text-sm py-1">{item.user?.score || 0}</TableCell>
                                <TableCell className="text-right text-neutral-400 text-sm py-1">{item.user?.commits || 0}</TableCell>
                              </TableRow>
                            )))}
                        </TableBody>
                      </Table>
                    )}
                  </div>
                )}
              </div>
            )}

            {
              viewMode === "create" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h2 className="text-base font-semibold text-white">Create New Sprint</h2>
                    <Button
                      variant="ghost"
                      onClick={() => navigateSprint("list", null)}
                      className="text-neutral-400 hover:text-white h-7 text-xs px-2"
                    >
                      ← Back
                    </Button>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1 max-w-2xl">
                      <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
                        <h3 className="text-sm font-medium text-white mb-3">Create New Sprint</h3>
                        <div className="space-y-3">
                          <div className="space-y-1.5">
                            <Label htmlFor="sprint-name" className="text-sm text-neutral-400">Sprint Name</Label>
                            <Input
                              id="sprint-name"
                              placeholder="e.g., Winter Hackathon 2026"
                              value={createForm.name}
                              onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                              className="bg-black border-neutral-800 text-white h-8 text-sm"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                              <Label htmlFor="start-date" className="text-sm text-neutral-400">Start Date</Label>
                              <Input
                                id="start-date"
                                type="date"
                                value={startDate}
                                onChange={(e) => {
                                  setStartDate(e.target.value);
                                  if (e.target.value && endDate) {
                                    setDateRange({
                                      from: new Date(e.target.value),
                                      to: new Date(endDate)
                                    });
                                  }
                                }}
                                className="bg-black border-neutral-800 text-white h-8 text-sm"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label htmlFor="end-date" className="text-sm text-neutral-400">End Date</Label>
                              <Input
                                id="end-date"
                                type="date"
                                value={endDate}
                                onChange={(e) => {
                                  setEndDate(e.target.value);
                                  if (e.target.value && startDate) {
                                    setDateRange({
                                      from: new Date(startDate),
                                      to: new Date(e.target.value)
                                    });
                                  }
                                }}
                                className="bg-black border-neutral-800 text-white h-8 text-sm"
                              />
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <Label htmlFor="description" className="text-sm text-neutral-400">Description</Label>
                            <textarea
                              id="description"
                              rows={3}
                              placeholder="Describe your sprint..."
                              value={createForm.description}
                              onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                              className="w-full bg-black border border-neutral-800 rounded px-3 py-2 text-sm text-white placeholder:text-neutral-500"
                            />

                          </div>
                          <div className="flex items-center justify-between py-2">
                            <div>
                              <Label className="text-sm text-white font-medium">Public Sprint</Label>
                              <p className="text-xs text-neutral-400">Make this sprint visible to everyone.</p>
                            </div>
                            <Switch
                              checked={createForm.isPublic}
                              onCheckedChange={(checked) => setCreateForm({ ...createForm, isPublic: checked })}
                              className="bg-neutral-800 data-[state=checked]:bg-blue-600"
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <Button variant="outline" className="border-neutral-800 bg-neutral-900 text-white hover:bg-neutral-800 h-8 text-sm px-3">
                              Cancel
                            </Button>
                            <Button
                              className="bg-blue-500 hover:bg-blue-600 text-white border-0 h-8 text-sm px-3"
                              onClick={onCreateSprint}
                            >
                              Create Sprint
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Calendar Component */}
                    <div className="w-80">
                      <CalendarWithRangePresets
                        dateRange={dateRange}
                        setDateRange={setDateRange}
                        month={month}
                        setMonth={setMonth}
                        setStartDate={setStartDate}
                        setEndDate={setEndDate}
                      />
                    </div>
                  </div>
                </div>
              )
            }

            {viewMode === "manage" && selectedSprintData && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-white">Manage Sprint</h2>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-neutral-400">{selectedSprintData.name}</p>
                      <span className="text-neutral-700">|</span>
                      <code className="text-[10px] text-neutral-500 font-mono">{selectedSprintData.id}</code>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0 text-neutral-600 hover:text-white"
                        onClick={() => {
                          navigator.clipboard.writeText(selectedSprintData.id);
                        }}
                      >
                        <FaRegCopy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => navigateSprint("list", null)}
                    className="text-neutral-400 hover:text-white h-8 px-3"
                  >
                    ← Back to List
                  </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left: Settings */}
                  <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 shadow-xl space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <Search className="w-5 h-5 text-blue-500" />
                        General Settings
                      </h3>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label className="text-sm text-neutral-400">Sprint Name</Label>
                          <Input
                            value={createForm.name}
                            onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                            className="bg-black border-neutral-800 text-white h-10"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm text-neutral-400">Description</Label>
                          <textarea
                            value={createForm.description}
                            onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                            className="w-full bg-black border border-neutral-800 rounded-md p-3 text-white text-sm min-h-[100px]"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-4">
                            <div className="space-y-1.5">
                              <Label className="text-xs text-neutral-400 uppercase tracking-wider">Start Date</Label>
                              <Input
                                type="date"
                                disabled={new Date(selectedSprintData.startDate) <= new Date()}
                                value={startDate}
                                onChange={(e) => {
                                  setStartDate(e.target.value);
                                  if (e.target.value && endDate) {
                                    setDateRange({ from: new Date(e.target.value), to: new Date(endDate) });
                                  }
                                }}
                                className="bg-black border-neutral-800 text-white h-9 text-sm disabled:opacity-50"
                              />
                              {new Date(selectedSprintData.startDate) <= new Date() && (
                                <p className="text-[10px] text-amber-500 mt-1">Sprints that have already started cannot change their start date.</p>
                              )}
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-xs text-neutral-400 uppercase tracking-wider">End Date</Label>
                              <Input
                                type="date"
                                min={startDate || new Date().toISOString().split('T')[0]}
                                value={endDate}
                                onChange={(e) => {
                                  setEndDate(e.target.value);
                                  if (e.target.value && startDate) {
                                    setDateRange({ from: new Date(startDate), to: new Date(e.target.value) });
                                  }
                                }}
                                className="bg-black border-neutral-800 text-white h-9 text-sm"
                              />
                              <p className="text-[10px] text-neutral-500 mt-1">Must be after the start date.</p>
                            </div>

                            <div className="flex items-center justify-between py-3 border-t border-neutral-800">
                              <div>
                                <Label className="text-sm text-white font-medium">Public Sprint</Label>
                                <p className="text-[10px] text-neutral-400">Make this sprint visible to everyone.</p>
                              </div>
                              <Switch
                                checked={createForm.isPublic}
                                onCheckedChange={(checked) => setCreateForm({ ...createForm, isPublic: checked })}
                                className="bg-neutral-800 data-[state=checked]:bg-blue-600"
                              />
                            </div>
                          </div>

                          <div className="flex justify-center">
                            <CalendarWithRangePresets
                              dateRange={dateRange}
                              setDateRange={setDateRange}
                              month={month}
                              setMonth={setMonth}
                              setStartDate={setStartDate}
                              setEndDate={setEndDate}
                            />
                          </div>
                        </div>
                      </div>

                      <Button
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-6 h-12 shadow-lg shadow-blue-900/20 transition-all hover:scale-[1.01]"
                        onClick={onUpdateSprint}
                        disabled={isUpdating}
                      >
                        {isUpdating ? (
                          <div className="flex items-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            Updating...
                          </div>
                        ) : (
                          "Update Sprint Details"
                        )}
                      </Button>
                    </div>
                  </div>
                  {/* Removed extra closing div that broke the grid */}

                  {/* Right: Team Management */}
                  <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-xl flex flex-col">
                    <div className="p-4 border-b border-neutral-800 bg-neutral-900/50 flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <FaTrophy className="w-5 h-5 text-yellow-500" />
                        Registered Teams
                      </h3>
                      <Badge variant="outline" className="text-neutral-400 border-neutral-800">
                        {sprintRankings.length} Teams
                      </Badge>
                    </div>
                    <div className="flex-1 overflow-y-auto max-h-[500px]">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-neutral-800 hover:bg-transparent">
                            <TableHead className="text-neutral-500 font-medium">Team Name</TableHead>
                            <TableHead className="text-neutral-500 font-medium text-right">Score</TableHead>
                            <TableHead className="text-neutral-500 font-medium text-center w-24">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sprintRankings.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={3} className="text-center py-12 text-neutral-500">
                                No teams registered in this sprint.
                              </TableCell>
                            </TableRow>
                          ) : (
                            sprintRankings.map((item) => item.team && (
                              <TableRow key={item.team.teamId} className="border-neutral-800 hover:bg-white/5 transition-colors">
                                <TableCell className="font-medium text-white p-4">
                                  {item.team.name}
                                </TableCell>
                                <TableCell className="text-right text-blue-400 font-mono p-4">
                                  {item.team.score.toLocaleString()}
                                </TableCell>
                                <TableCell className="p-4">
                                  <div className="flex justify-center">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleBanTeam(item.team!.teamId)}
                                      className="text-red-500 hover:text-red-400 hover:bg-red-500/10 h-8 px-3"
                                    >
                                      Ban
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>

                  {/* Pending Registrations */}
                  <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden shadow-xl flex flex-col lg:col-span-2">
                    <div className="p-4 border-b border-neutral-800 bg-neutral-900/50 flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-purple-500" />
                        Pending Registrations
                      </h3>
                      <Badge variant="outline" className="text-neutral-400 border-neutral-800">
                        {registrations.filter(r => r.status === 'PENDING').length} Pending
                      </Badge>
                    </div>
                    <div className="flex-1 overflow-y-auto max-h-[400px]">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-neutral-800 hover:bg-transparent">
                            <TableHead className="text-neutral-500 font-medium">Team Name</TableHead>
                            <TableHead className="text-neutral-500 font-medium">Repository</TableHead>
                            <TableHead className="text-neutral-500 font-medium">Status</TableHead>
                            <TableHead className="text-neutral-500 font-medium text-center">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {registrations.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={4} className="text-center py-12 text-neutral-500">
                                No registration records found.
                              </TableCell>
                            </TableRow>
                          ) : (
                            registrations.map((reg) => (
                              <TableRow key={`${reg.teamId}-${reg.repoId}`} className="border-neutral-800 hover:bg-white/5 transition-colors">
                                <TableCell className="font-medium text-white p-4">
                                  {reg.teamName}
                                </TableCell>
                                <TableCell className="text-neutral-400 p-4">
                                  {reg.repoId}
                                </TableCell>
                                <TableCell className="p-4">
                                  <Badge className={
                                    reg.status === 'APPROVED' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                      reg.status === 'PENDING' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                                        reg.status === 'REJECTED' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                          'bg-neutral-800 text-neutral-500'
                                  }>
                                    {reg.status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="p-4">
                                  <div className="flex justify-center gap-2">
                                    {reg.status === 'PENDING' && (
                                      <>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleApproveTeamResult(reg.teamId, true)}
                                          className="text-green-500 hover:text-green-400 hover:bg-green-500/10 h-8 px-3"
                                        >
                                          Approve
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => handleApproveTeamResult(reg.teamId, false)}
                                          className="text-red-500 hover:text-red-400 hover:bg-red-500/10 h-8 px-3"
                                        >
                                          Reject
                                        </Button>
                                      </>
                                    )}
                                    {reg.status === 'APPROVED' && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleBanTeam(reg.teamId)}
                                        className="text-red-500 hover:text-red-400 hover:bg-red-500/10 h-8 px-3"
                                      >
                                        Ban
                                      </Button>
                                    )}
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </div>
              </div>

            )}
          </div>
        </div>
      </div>

    </DashboardLayout>
  );
}