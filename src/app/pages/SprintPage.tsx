import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { DashboardLayout } from "@/app/components/DashboardLayout";
import { getSprints, getMySprints, getSprintRankings, type Sprint, type SprintRanking } from "@/lib/api";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { Label } from "@/app/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/app/components/ui/table";
import { Badge } from "@/app/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/app/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/app/components/ui/select";
import { TrendingUp, TrendingDown, Search, Plus, GitBranch, ChevronDown, ChevronRight, Sparkles, MessageSquare } from "lucide-react";
import { FaTrophy } from "react-icons/fa";
import { Avatar, AvatarFallback, AvatarImage } from "@/app/components/ui/avatar";
import { Progress } from "@/app/components/ui/progress";
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

const leaderboardData = [
  { rank: 1, team: "Team Alpha", score: 2456, commits: 234, members: 4, change: 2 },
  { rank: 2, team: "Code Warriors", score: 2301, commits: 215, members: 5, change: -1 },
  { rank: 3, team: "Dev Squad", score: 2189, commits: 198, members: 4, change: 1 },
  { rank: 4, team: "Tech Titans", score: 1987, commits: 176, members: 3, change: 0 },
  { rank: 5, team: "Byte Busters", score: 1856, commits: 165, members: 4, change: 3 },
];

const sprintIndividualRanking = [
  { rank: 1, name: "Alice Johnson", username: "alicej", commits: 145, score: 95 },
  { rank: 2, name: "Bob Smith", username: "bobsmith", commits: 123, score: 92 },
  { rank: 3, name: "Carol White", username: "carolw", commits: 98, score: 89 },
  { rank: 4, name: "David Brown", username: "davidb", commits: 87, score: 85 },
  { rank: 5, name: "Emma Davis", username: "emmad", commits: 76, score: 82 },
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

  const yesterday = {
    from: subDays(today, 1),
    to: subDays(today, 1)
  };

  const tomorrow = {
    from: today,
    to: addDays(today, 1)
  };

  const last7Days = {
    from: subDays(today, 6),
    to: today
  };

  const next7Days = {
    from: addDays(today, 1),
    to: addDays(today, 7)
  };

  const last30Days = {
    from: subDays(today, 29),
    to: today
  };

  const monthToDate = {
    from: startOfMonth(today),
    to: today
  };

  const lastMonth = {
    from: startOfMonth(subMonths(today, 1)),
    to: endOfMonth(subMonths(today, 1))
  };

  const nextMonth = {
    from: startOfMonth(addMonths(today, 1)),
    to: endOfMonth(addMonths(today, 1))
  };

  const yearToDate = {
    from: startOfYear(today),
    to: today
  };

  const lastYear = {
    from: startOfYear(subYears(today, 1)),
    to: endOfYear(subYears(today, 1))
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
    setMonth(preset.to);
    setStartDate(format(preset.from, 'yyyy-MM-dd'));
    setEndDate(format(preset.to, 'yyyy-MM-dd'));
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
            onClick={() => handlePresetClick(yesterday)}
            className="border-neutral-800 bg-neutral-900 text-white hover:bg-neutral-800 text-xs"
          >
            Yesterday
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
            onClick={() => handlePresetClick(last7Days)}
            className="border-neutral-800 bg-neutral-900 text-white hover:bg-neutral-800 text-xs"
          >
            Last 7 days
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
            onClick={() => handlePresetClick(last30Days)}
            className="border-neutral-800 bg-neutral-900 text-white hover:bg-neutral-800 text-xs"
          >
            Last 30 days
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => handlePresetClick(monthToDate)}
            className="border-neutral-800 bg-neutral-900 text-white hover:bg-neutral-800 text-xs"
          >
            Month to date
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => handlePresetClick(lastMonth)}
            className="border-neutral-800 bg-neutral-900 text-white hover:bg-neutral-800 text-xs"
          >
            Last month
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => handlePresetClick(nextMonth)}
            className="border-neutral-800 bg-neutral-900 text-white hover:bg-neutral-800 text-xs"
          >
            Next month
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => handlePresetClick(yearToDate)}
            className="border-neutral-800 bg-neutral-900 text-white hover:bg-neutral-800 text-xs"
          >
            Year to date
          </Button>
          <Button
            variant='outline'
            size='sm'
            onClick={() => handlePresetClick(lastYear)}
            className="border-neutral-800 bg-neutral-900 text-white hover:bg-neutral-800 text-xs"
          >
            Last year
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export function SprintPage() {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSprint, setSelectedSprint] = useState<number | null>(null);
  const [selectedRepos, setSelectedRepos] = useState<number[]>([]);
  const [expandedCommits, setExpandedCommits] = useState<string[]>([]);
  const [aiOpen, setAiOpen] = useState(false);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [sprintRankings, setSprintRankings] = useState<SprintRanking[]>([]);
  const [loadingSprints, setLoadingSprints] = useState(false);
  const [loadingRankings, setLoadingRankings] = useState(false);

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

  const [viewMode, setViewMode] = useState<"list" | "participate" | "ranking" | "create">("list");
  const [rankingViewType, setRankingViewType] = useState<"individual" | "team">("team");
  
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

  // Load sprints from API
  useEffect(() => {
    const loadSprints = async () => {
      setLoadingSprints(true);
      try {
        const data = await getSprints();
        setSprints(data);
      } catch (error) {
        console.error('Error loading sprints:', error);
        // Fallback to mock data if API fails
        setSprints(allSprints.map((s, idx) => ({
          id: s.id.toString(),
          name: s.name,
          startDate: new Date().toISOString(),
          endDate: new Date().toISOString(),
          isPrivate: false,
          isOpen: true,
          teamsCount: s.teams,
          participantsCount: s.participants,
          status: s.status,
        })));
      } finally {
        setLoadingSprints(false);
      }
    };
    loadSprints();
  }, []);

  // Load sprint rankings when a sprint is selected
  useEffect(() => {
    if (selectedSprint && viewMode === 'ranking') {
      const loadRankings = async () => {
        setLoadingRankings(true);
        try {
          const sprintId = sprints.find(s => s.id === selectedSprint.toString())?.id || selectedSprint.toString();
          const data = await getSprintRankings(sprintId, rankingViewType === 'team' ? 'TEAM' : 'INDIVIDUAL');
          setSprintRankings(data);
        } catch (error) {
          console.error('Error loading sprint rankings:', error);
        } finally {
          setLoadingRankings(false);
        }
      };
      loadRankings();
    }
  }, [selectedSprint, viewMode, rankingViewType, sprints]);

  // Check URL query parameter for ranking view
  useEffect(() => {
    const view = searchParams.get("view");
    if (view === "ranking") {
      setViewMode("ranking");
    }
  }, [searchParams]);

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
                onClick={() => setViewMode("ranking")}
                variant="outline"
                className="border-neutral-800 bg-neutral-900 text-white hover:bg-neutral-800 h-8 text-xs px-3"
              >
                <FaTrophy className="w-4 h-4 mr-1" />
                Ranking
              </Button>
              <Button 
                onClick={() => setViewMode("create")}
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
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-white/60" />
                  <Input
                    placeholder="Search sprints..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-8 bg-neutral-900 border-neutral-800 text-white h-8 text-sm"
                  />
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-28 bg-neutral-900 border-neutral-800 text-white h-8 text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-neutral-900 border-neutral-800">
                    <SelectItem value="all" className="text-white text-sm">All</SelectItem>
                    <SelectItem value="active" className="text-white text-sm">Active</SelectItem>
                    <SelectItem value="completed" className="text-white text-sm">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

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
                    {allSprints.map((sprint) => (
                      <TableRow key={sprint.id} className="border-neutral-800 bg-black hover:bg-neutral-900 h-8">
                        <TableCell className="font-medium text-white text-sm py-1">{sprint.name}</TableCell>
                        <TableCell className="text-white/60 text-sm py-1">{sprint.startDate} - {sprint.endDate}</TableCell>
                        <TableCell className="text-white text-right text-sm py-1">{sprint.teams}</TableCell>
                        <TableCell className="text-neutral-400 text-right text-sm py-1">{sprint.participants}</TableCell>
                        <TableCell className="py-1">
                          <Badge className={sprint.status === 'active' ? 'bg-blue-500/10 text-blue-400 border-neutral-800 text-xs h-4 px-1.5' : 'bg-neutral-900 text-neutral-400 border-neutral-800 text-xs h-4 px-1.5'}>
                            {sprint.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right py-1">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 text-xs px-2 text-neutral-400 hover:text-white"
                            onClick={() => setViewMode("participate")}
                          >
                            Participate
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {viewMode === "participate" && (
            <div className="space-y-2">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                {/* Left - Sprint Selection & Repository */}
                <div className="lg:col-span-2 space-y-2">
                  <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-3">
                    <h3 className="text-sm font-medium text-white mb-2">Select Sprint</h3>
                    <Select onValueChange={(value) => setSelectedSprint(Number(value))}>
                      <SelectTrigger className="bg-black border-neutral-800 text-white h-8 text-sm">
                        <SelectValue placeholder="Choose a sprint to participate" />
                      </SelectTrigger>
                      <SelectContent className="bg-neutral-900 border-neutral-800">
                        {allSprints.filter(s => s.status === 'active').map((sprint) => (
                          <SelectItem key={sprint.id} value={String(sprint.id)} className="text-white text-sm">
                            {sprint.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-3">
                    <h3 className="text-sm font-medium text-white mb-2">Register Repositories</h3>
                    <div className="space-y-2 mb-3">
                      {myRepositories.map((repo) => (
                        <div
                          key={repo.id}
                          onClick={() => toggleRepo(repo.id)}
                          className={`flex items-center justify-between p-2 border rounded cursor-pointer transition-colors ${
                            selectedRepos.includes(repo.id)
                              ? 'border-blue-500 bg-blue-500/10'
                              : 'border-neutral-800 hover:bg-neutral-800'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <GitBranch className="w-4 h-4 text-neutral-400" />
                            <span className="text-sm text-white">{repo.name}</span>
                          </div>
                          {selectedRepos.includes(repo.id) && (
                            <Badge className="bg-blue-500/10 text-blue-400 border-neutral-800 text-xs h-4 px-2">
                              Selected
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                    <Button className="w-full bg-blue-500 hover:bg-blue-600 text-white border-0 h-8 text-sm">
                      Register for Sprint
                    </Button>
                  </div>

                  {/* Team Members */}
                  <div className="bg-neutral-900 border border-neutral-800 rounded-lg">
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
                        {teamMembers.map((member) => (
                          <TableRow key={member.username} className="border-neutral-800 bg-black hover:bg-neutral-900 h-8">
                            <TableCell className="py-1">
                              <div className="flex items-center gap-2">
                                <Avatar className="w-6 h-6 border border-neutral-800">
                                  <AvatarImage src={defaultAvatar} />
                                  <AvatarFallback className="bg-neutral-900 text-white text-xs">
                                    {member.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="text-sm font-medium text-white">{member.name}</div>
                                  <div className="text-xs text-neutral-400">@{member.username}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-neutral-400 py-1">{member.role}</TableCell>
                            <TableCell className="text-sm text-white text-right py-1">{member.commits}</TableCell>
                            <TableCell className="py-1">
                              <div className="flex items-center gap-1.5">
                                <Progress value={member.contribution} className="flex-1 h-1.5" />
                                <span className="text-xs text-neutral-400 min-w-[35px]">{member.contribution}%</span>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
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
                  onClick={() => setViewMode("list")}
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
                    {allSprints.map((sprint) => (
                      <SelectItem key={sprint.id} value={String(sprint.id)} className="text-white text-sm">
                        {sprint.name}
                      </SelectItem>
                    ))}
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
                      <span className="text-xs text-neutral-400">Updated 5 min ago</span>
                    </div>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-neutral-800 bg-neutral-900 hover:bg-neutral-900">
                        <TableHead className="text-neutral-400 font-medium text-xs w-12 h-7 py-1">Rank</TableHead>
                        <TableHead className="text-neutral-400 font-medium text-xs h-7 py-1">Team</TableHead>
                        <TableHead className="text-neutral-400 font-medium text-right text-xs h-7 py-1">Score</TableHead>
                        <TableHead className="text-neutral-400 font-medium text-right text-xs h-7 py-1">Commits</TableHead>
                        <TableHead className="text-neutral-400 font-medium text-right text-xs h-7 py-1">Members</TableHead>
                        <TableHead className="text-neutral-400 font-medium text-right text-xs h-7 py-1">Change</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {leaderboardData.map((team) => (
                        <TableRow key={team.rank} className="border-neutral-800 bg-black hover:bg-neutral-900 cursor-pointer h-8">
                          <TableCell className="font-medium text-white text-sm py-1">
                            <div className="flex items-center gap-1">
                              {team.rank === 1 && (
                                <div 
                                  className="relative w-4 h-4 flex items-center justify-center"
                                  style={{
                                    background: 'linear-gradient(135deg, rgba(255,215,0,0.25), rgba(255,223,0,0.15))',
                                    backdropFilter: 'blur(8px)',
                                    WebkitBackdropFilter: 'blur(8px)',
                                    borderRadius: '50%',
                                    boxShadow: '0 0 16px rgba(255,215,0,0.5), inset 0 0 10px rgba(255,215,0,0.3), 0 0 0 1px rgba(255,215,0,0.2)'
                                  }}
                                >
                                  <FaTrophy 
                                    className="w-3 h-3 relative z-10" 
                                    style={{
                                      color: '#FFD700',
                                      filter: 'drop-shadow(0 0 6px rgba(255,215,0,0.9)) drop-shadow(0 0 12px rgba(255,215,0,0.5))'
                                    }}
                                  />
                                </div>
                              )}
                              {team.rank === 2 && (
                                <div 
                                  className="relative w-4 h-4 flex items-center justify-center"
                                  style={{
                                    background: 'linear-gradient(135deg, rgba(192,192,192,0.25), rgba(169,169,169,0.15))',
                                    backdropFilter: 'blur(8px)',
                                    WebkitBackdropFilter: 'blur(8px)',
                                    borderRadius: '50%',
                                    boxShadow: '0 0 16px rgba(192,192,192,0.5), inset 0 0 10px rgba(192,192,192,0.3), 0 0 0 1px rgba(192,192,192,0.2)'
                                  }}
                                >
                                  <FaTrophy 
                                    className="w-3 h-3 relative z-10" 
                                    style={{
                                      color: '#C0C0C0',
                                      filter: 'drop-shadow(0 0 6px rgba(192,192,192,0.9)) drop-shadow(0 0 12px rgba(192,192,192,0.5))'
                                    }}
                                  />
                                </div>
                              )}
                              {team.rank === 3 && (
                                <div 
                                  className="relative w-4 h-4 flex items-center justify-center"
                                  style={{
                                    background: 'linear-gradient(135deg, rgba(205,127,50,0.25), rgba(184,115,51,0.15))',
                                    backdropFilter: 'blur(8px)',
                                    WebkitBackdropFilter: 'blur(8px)',
                                    borderRadius: '50%',
                                    boxShadow: '0 0 16px rgba(205,127,50,0.5), inset 0 0 10px rgba(205,127,50,0.3), 0 0 0 1px rgba(205,127,50,0.2)'
                                  }}
                                >
                                  <FaTrophy 
                                    className="w-3 h-3 relative z-10" 
                                    style={{
                                      color: '#CD7F32',
                                      filter: 'drop-shadow(0 0 6px rgba(205,127,50,0.9)) drop-shadow(0 0 12px rgba(205,127,50,0.5))'
                                    }}
                                  />
                                </div>
                              )}
                              <span>#{team.rank}</span>
                            </div>
                          </TableCell>
                          <TableCell className="font-medium text-white text-sm py-1">{team.team}</TableCell>
                          <TableCell className="text-white text-right text-sm py-1">{team.score.toLocaleString()}</TableCell>
                          <TableCell className="text-neutral-400 text-right text-sm py-1">{team.commits}</TableCell>
                          <TableCell className="text-neutral-400 text-right text-sm py-1">{team.members}</TableCell>
                          <TableCell className="text-right py-1">
                            {team.change > 0 ? (
                              <div className="flex items-center justify-end gap-1 text-blue-400">
                                <TrendingUp className="w-4 h-4" />
                                <span className="text-xs">+{team.change}</span>
                              </div>
                            ) : team.change < 0 ? (
                              <div className="flex items-center justify-end gap-1 text-red-400">
                                <TrendingDown className="w-4 h-4" />
                                <span className="text-xs">{team.change}</span>
                              </div>
                            ) : (
                              <span className="text-xs text-neutral-400">-</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Individual Ranking */}
              {rankingViewType === "individual" && (
                <div className="bg-neutral-900 border border-neutral-800 rounded-lg">
                  <div className="px-3 py-2 border-b border-neutral-800 bg-neutral-900">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-white">Individual Leaderboard</h3>
                      <span className="text-xs text-neutral-400">Updated 5 min ago</span>
                    </div>
                  </div>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-neutral-800 bg-neutral-900 hover:bg-neutral-900">
                        <TableHead className="text-neutral-400 font-medium text-xs w-12 h-7 py-1">Rank</TableHead>
                        <TableHead className="text-neutral-400 font-medium text-xs h-7 py-1">Developer</TableHead>
                        <TableHead className="text-neutral-400 font-medium text-xs text-right h-7 py-1">Score</TableHead>
                        <TableHead className="text-neutral-400 font-medium text-xs text-right h-7 py-1">Commits</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sprintIndividualRanking.map((person) => (
                        <TableRow 
                          key={person.rank} 
                          className="border-neutral-800 bg-black hover:bg-neutral-900 cursor-pointer h-8"
                        >
                          <TableCell className="font-medium text-white py-1">
                            <div className="flex items-center gap-1.5">
                              {person.rank === 1 && (
                                <div 
                                  className="relative w-4 h-4 flex items-center justify-center"
                                  style={{
                                    background: 'linear-gradient(135deg, rgba(255,215,0,0.25), rgba(255,223,0,0.15))',
                                    backdropFilter: 'blur(8px)',
                                    WebkitBackdropFilter: 'blur(8px)',
                                    borderRadius: '50%',
                                    boxShadow: '0 0 16px rgba(255,215,0,0.5), inset 0 0 10px rgba(255,215,0,0.3), 0 0 0 1px rgba(255,215,0,0.2)'
                                  }}
                                >
                                  <FaTrophy 
                                    className="w-3 h-3 relative z-10" 
                                    style={{
                                      color: '#FFD700',
                                      filter: 'drop-shadow(0 0 6px rgba(255,215,0,0.9)) drop-shadow(0 0 12px rgba(255,215,0,0.5))'
                                    }}
                                  />
                                </div>
                              )}
                              {person.rank === 2 && (
                                <div 
                                  className="relative w-4 h-4 flex items-center justify-center"
                                  style={{
                                    background: 'linear-gradient(135deg, rgba(192,192,192,0.25), rgba(169,169,169,0.15))',
                                    backdropFilter: 'blur(8px)',
                                    WebkitBackdropFilter: 'blur(8px)',
                                    borderRadius: '50%',
                                    boxShadow: '0 0 16px rgba(192,192,192,0.5), inset 0 0 10px rgba(192,192,192,0.3), 0 0 0 1px rgba(192,192,192,0.2)'
                                  }}
                                >
                                  <FaTrophy 
                                    className="w-3 h-3 relative z-10" 
                                    style={{
                                      color: '#C0C0C0',
                                      filter: 'drop-shadow(0 0 6px rgba(192,192,192,0.9)) drop-shadow(0 0 12px rgba(192,192,192,0.5))'
                                    }}
                                  />
                                </div>
                              )}
                              {person.rank === 3 && (
                                <div 
                                  className="relative w-4 h-4 flex items-center justify-center"
                                  style={{
                                    background: 'linear-gradient(135deg, rgba(205,127,50,0.25), rgba(184,115,51,0.15))',
                                    backdropFilter: 'blur(8px)',
                                    WebkitBackdropFilter: 'blur(8px)',
                                    borderRadius: '50%',
                                    boxShadow: '0 0 16px rgba(205,127,50,0.5), inset 0 0 10px rgba(205,127,50,0.3), 0 0 0 1px rgba(205,127,50,0.2)'
                                  }}
                                >
                                  <FaTrophy 
                                    className="w-3 h-3 relative z-10" 
                                    style={{
                                      color: '#CD7F32',
                                      filter: 'drop-shadow(0 0 6px rgba(205,127,50,0.9)) drop-shadow(0 0 12px rgba(205,127,50,0.5))'
                                    }}
                                  />
                                </div>
                              )}
                              <span className="text-sm">#{person.rank}</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-1">
                            <div className="flex items-center gap-2">
                              <Avatar className="w-6 h-6 border border-neutral-800">
                                <AvatarImage src={defaultAvatar} />
                                <AvatarFallback className="bg-neutral-900 text-white text-xs">
                                  {person.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="text-sm font-medium text-white">{person.name}</div>
                                <div className="text-xs text-neutral-400">@{person.username}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-white text-right font-medium text-sm py-1">{person.score}</TableCell>
                          <TableCell className="text-neutral-400 text-right text-sm py-1">{person.commits}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}

          {viewMode === "create" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-white">Create New Sprint</h2>
                <Button 
                  variant="ghost"
                  onClick={() => setViewMode("list")}
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
                          className="w-full bg-black border border-neutral-800 rounded px-3 py-2 text-sm text-white placeholder:text-neutral-500"
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" className="border-neutral-800 bg-neutral-900 text-white hover:bg-neutral-800 h-8 text-sm px-3">
                          Cancel
                        </Button>
                        <Button className="bg-blue-500 hover:bg-blue-600 text-white border-0 h-8 text-sm px-3">
                          Create Sprint
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0">
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
          )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}