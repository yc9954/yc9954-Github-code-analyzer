import { DashboardLayout } from "@/app/components/DashboardLayout";
import RotatingEarth from "@/app/components/ui/wireframe-dotted-globe";
import { useState, useEffect } from "react";
import {
  getMyDashboard,
  getMySprints,
  getMyRecentCommits,
  searchRepositories,
  getRateLimit,
  type DashboardStatsResponse,
  type Sprint,
  type Commit
} from "@/lib/api";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Users, GitBranch, Zap, Activity, BarChart, Ghost, Gauge } from "lucide-react";

// Mock data for sprints and issues locations (latitude, longitude)
const sprintLocations = [
  { lat: 37.5665, lng: 126.9780, color: "#7aa2f7", size: 8, type: "sprint" as const, title: "Q1 Sprint Planning", location: "Seoul, South Korea", date: "2024-01-15" },
  { lat: 40.7128, lng: -74.0060, color: "#7aa2f7", size: 8, type: "sprint" as const, title: "Product Launch Sprint", location: "New York, USA", date: "2024-02-20" },
  { lat: 51.5074, lng: -0.1278, color: "#7aa2f7", size: 8, type: "sprint" as const, title: "Infrastructure Sprint", location: "London, UK", date: "2024-03-10" },
  { lat: 35.6762, lng: 139.6503, color: "#7aa2f7", size: 8, type: "sprint" as const, title: "Mobile App Sprint", location: "Tokyo, Japan", date: "2024-04-05" },
];

const issueLocations = [
  { lat: 37.7749, lng: -122.4194, color: "#f0883e", size: 6, type: "issue" as const, title: "Authentication Bug", location: "San Francisco, USA", date: "2024-01-22" },
  { lat: 52.5200, lng: 13.4050, color: "#f0883e", size: 6, type: "issue" as const, title: "Performance Issue", location: "Berlin, Germany", date: "2024-02-14" },
  { lat: -33.8688, lng: 151.2093, color: "#f0883e", size: 6, type: "issue" as const, title: "Database Connection Error", location: "Sydney, Australia", date: "2024-03-18" },
];

export function DashboardPage() {
  const navigate = useNavigate();
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });
  const [dashboardStats, setDashboardStats] = useState<DashboardStatsResponse | null>(null);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [loading, setLoading] = useState(true);

  // New Stats State
  const [teamsCount, setTeamsCount] = useState(0);
  const [ghostUserCount, setGhostUserCount] = useState(0);
  const [queueDepth, setQueueDepth] = useState(0);
  const [repoAnalysisPercent, setRepoAnalysisPercent] = useState(0);
  const [commitAnalysisRate, setCommitAnalysisRate] = useState(0);
  const [rateLimit, setRateLimit] = useState({ limit: 5000, remaining: 5000 });

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth - 100,
        height: window.innerHeight - 340, // Adjusted for stats cards height
      });
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [stats, mySprints, commits, teamsData] = await Promise.all([
          getMyDashboard(),
          getMySprints(),
          getMyRecentCommits(),
          searchRepositories('', undefined, 'updated', 'ALL', 1, 1) // Fetch basic stats via search if possible, or use specific team API if available
        ]);

        setDashboardStats(stats);
        setSprints(mySprints);

        // Calculate Stats
        // 1. Teams
        // Note: Ideally we use a getMyTeams() API. For now, using what's available or assuming 0 if not returned
        setTeamsCount(teamsData.teams?.length || 0);

        // 2. Queue Depth (Pending/Processing commits)
        const pendingCommits = commits.filter(c => c.analysisStatus === 'PENDING' || c.analysisStatus === 'PROCESSING');
        setQueueDepth(pendingCommits.length);

        // 3. Commit Analysis Rate
        const analyzedCommits = commits.filter(c => c.analysisStatus === 'COMPLETED');
        const rate = commits.length > 0 ? Math.round((analyzedCommits.length / commits.length) * 100) : 0;
        setCommitAnalysisRate(rate);

        // 4. Repo Analysis % (Placeholder logic or derived)
        // For now, let's use a meaningful placeholder or derived from score
        setRepoAnalysisPercent(stats.totalScore > 0 ? Math.min(Math.round(stats.totalScore / 10), 100) : 0);

        // 5. Ghost User (Placeholder for now as specific API is missing)
        setGhostUserCount(0);

        // 6. Rate Limit
        const limit = getRateLimit();
        if (limit) {
          setRateLimit({ limit: limit.limit, remaining: limit.remaining });
        }

      } catch (error: any) {
        console.error('Error loading dashboard data:', error);
        // Only redirect if it's an authentication error
        if (error.message?.includes('인증') || error.message?.includes('세션') || error.message?.includes('401')) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [navigate]);

  const allDots = loading ? [...sprintLocations, ...issueLocations] : [...sprintLocations, ...issueLocations]; // Fallback to mock for visual for now, ideally merge with real sprint locations

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-4rem)] overflow-hidden flex flex-col bg-black">
        {/* Compact Header */}
        <div className="px-6 py-4 border-b border-neutral-800 bg-black">
          <h1 className="text-xl font-semibold text-white mb-4">Dashboard</h1>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
            <StatsCard icon={Ghost} label="Ghost User" value={ghostUserCount} color="text-neutral-400" />
            <StatsCard icon={Users} label="Teams" value={teamsCount} color="text-blue-400" />
            <StatsCard icon={Zap} label="Sprints" value={sprints.length} color="text-yellow-400" />
            <StatsCard icon={Activity} label="Queue Depth" value={queueDepth} color="text-red-400" />
            <StatsCard icon={BarChart} label="Repo Analysis %" value={`${repoAnalysisPercent}%`} color="text-green-400" />
            <StatsCard icon={GitBranch} label="Commit Analysis" value={`${commitAnalysisRate}%`} color="text-purple-400" />
            <StatsCard icon={Gauge} label="API Limit" value={`${rateLimit.remaining}`} subValue={`/${rateLimit.limit}`} color="text-orange-400" />
          </div>
        </div>

        <div className="flex-1 overflow-hidden bg-black relative">
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <RotatingEarth
              width={dimensions.width}
              height={dimensions.height}
              customDots={allDots}
              className="w-full h-full"
            />
          </div>

          {/* Overlay info if needed */}
          <div className="absolute bottom-6 left-6 text-neutral-500 text-xs">
            * Globe visualization represents active sprints and detected issues
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function StatsCard({ icon: Icon, label, value, subValue, color }: { icon: any, label: string, value: string | number, subValue?: string, color: string }) {
  return (
    <Card className="bg-neutral-900 border-neutral-800 p-0 overflow-hidden relative">
      <CardContent className="p-4 flex flex-col justify-between h-full">
        <div className="flex items-center justify-between mb-2">
          <span className="text-neutral-500 text-[10px] font-medium uppercase tracking-wider truncate">{label}</span>
          <Icon className={`w-4 h-4 ${color}`} />
        </div>
        <div className="flex items-baseline">
          <div className="text-2xl font-bold text-white">{value}</div>
          {subValue && <div className="text-xs text-neutral-500 ml-1">{subValue}</div>}
        </div>
      </CardContent>
    </Card>
  );
}
