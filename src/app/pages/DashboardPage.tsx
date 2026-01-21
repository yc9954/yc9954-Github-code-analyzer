import { DashboardLayout } from "@/app/components/DashboardLayout";
import RotatingEarth, { type CustomDot } from "@/app/components/ui/wireframe-dotted-globe";
import { useState, useEffect, useRef } from "react";
import {
  getMyDashboard,
  getMySprints,
  getMyRecentCommits,
  type DashboardStatsResponse,
  type Sprint,
  type Commit
} from "@/lib/api";
import { useNavigate } from "react-router-dom";

// Major cities coordinates for realistic event locations
const majorCities = [
  { lat: 37.5665, lng: 126.9780, name: "Seoul, South Korea" },
  { lat: 40.7128, lng: -74.0060, name: "New York, USA" },
  { lat: 51.5074, lng: -0.1278, name: "London, UK" },
  { lat: 35.6762, lng: 139.6503, name: "Tokyo, Japan" },
  { lat: 37.7749, lng: -122.4194, name: "San Francisco, USA" },
  { lat: 52.5200, lng: 13.4050, name: "Berlin, Germany" },
  { lat: -33.8688, lng: 151.2093, name: "Sydney, Australia" },
  { lat: 55.7558, lng: 37.6173, name: "Moscow, Russia" },
  { lat: 39.9042, lng: 116.4074, name: "Beijing, China" },
  { lat: 19.4326, lng: -99.1332, name: "Mexico City, Mexico" },
  { lat: -23.5505, lng: -46.6333, name: "São Paulo, Brazil" },
  { lat: 28.6139, lng: 77.2090, name: "New Delhi, India" },
  { lat: 25.2048, lng: 55.2708, name: "Dubai, UAE" },
  { lat: -34.6037, lng: -58.3816, name: "Buenos Aires, Argentina" },
  { lat: 48.8566, lng: 2.3522, name: "Paris, France" },
  { lat: 41.9028, lng: 12.4964, name: "Rome, Italy" },
  { lat: 52.2297, lng: 21.0122, name: "Warsaw, Poland" },
  { lat: 59.9343, lng: 30.3351, name: "Saint Petersburg, Russia" },
  { lat: 31.2304, lng: 121.4737, name: "Shanghai, China" },
  { lat: 1.3521, lng: 103.8198, name: "Singapore" },
];

const sprintTitles = [
  "Q1 Sprint Planning",
  "Product Launch Sprint",
  "Infrastructure Sprint",
  "Mobile App Sprint",
  "Backend Optimization",
  "Frontend Redesign",
  "API Integration",
  "Security Audit",
  "Performance Sprint",
  "Feature Development",
];

const issueTitles = [
  "Authentication Bug",
  "Performance Issue",
  "Database Connection Error",
  "Memory Leak Detected",
  "API Rate Limit",
  "Cache Invalidation",
  "Network Timeout",
  "Data Sync Error",
  "UI Rendering Issue",
  "Security Vulnerability",
];

// Generate random event
const generateRandomEvent = (id: string): CustomDot => {
  const isSprint = Math.random() > 0.5;
  const city = majorCities[Math.floor(Math.random() * majorCities.length)];
  const randomOffset = () => (Math.random() - 0.5) * 10; // ±5 degrees random offset
  
  return {
    lat: city.lat + randomOffset(),
    lng: city.lng + randomOffset(),
    color: isSprint ? "#7aa2f7" : "#f0883e",
    size: isSprint ? 8 : 6,
    type: isSprint ? "sprint" : "issue",
    title: isSprint 
      ? sprintTitles[Math.floor(Math.random() * sprintTitles.length)]
      : issueTitles[Math.floor(Math.random() * issueTitles.length)],
    location: city.name,
    date: new Date().toISOString().split('T')[0],
    id, // Unique identifier for removal
  };
};

export function DashboardPage() {
  const navigate = useNavigate();
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });
  const [dashboardStats, setDashboardStats] = useState<DashboardStatsResponse | null>(null);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [loading, setLoading] = useState(true);
  const [dynamicEvents, setDynamicEvents] = useState<CustomDot[]>([]);
  const eventIdCounter = useRef(0);

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth - 100,
        height: window.innerHeight - 200,
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
        const [stats, mySprints] = await Promise.all([
          getMyDashboard(),
          getMySprints(),
        ]);

        setDashboardStats(stats);
        setSprints(mySprints);

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

  // Dynamic event generation and removal
  useEffect(() => {
    if (loading) return;

    const addRandomEvents = () => {
      // Random number of events to add (1-3)
      const numToAdd = Math.floor(Math.random() * 3) + 1;
      const newEvents: CustomDot[] = [];
      
      for (let i = 0; i < numToAdd; i++) {
        eventIdCounter.current += 1;
        newEvents.push(generateRandomEvent(`event-${eventIdCounter.current}`));
      }
      
      setDynamicEvents(prev => [...prev, ...newEvents]);
    };


    // Initial events
    const initialEvents: CustomDot[] = [];
    for (let i = 0; i < 5; i++) {
      eventIdCounter.current += 1;
      initialEvents.push(generateRandomEvent(`event-${eventIdCounter.current}`));
    }
    setDynamicEvents(initialEvents);

    // Recursive function to add events at random intervals (3-8 seconds)
    let addTimeoutId: NodeJS.Timeout;
    const scheduleAddEvent = () => {
      const delay = Math.random() * 5000 + 3000; // 3-8 seconds
      addTimeoutId = setTimeout(() => {
        if (Math.random() > 0.3) { // 70% chance to add
          addRandomEvents();
        }
        scheduleAddEvent(); // Schedule next addition
      }, delay);
    };

    // Recursive function to remove events at random intervals (4-10 seconds)
    let removeTimeoutId: NodeJS.Timeout;
    const scheduleRemoveEvent = () => {
      const delay = Math.random() * 6000 + 4000; // 4-10 seconds
      removeTimeoutId = setTimeout(() => {
        setDynamicEvents(prev => {
          if (prev.length === 0) {
            scheduleRemoveEvent(); // Schedule next removal attempt
            return prev;
          }
          if (Math.random() > 0.4) { // 60% chance to remove if events exist
            // Random number of events to remove (1-2, but not more than available)
            const numToRemove = Math.min(
              Math.floor(Math.random() * 2) + 1,
              prev.length
            );
            
            // Randomly select events to remove
            const indicesToRemove = new Set<number>();
            while (indicesToRemove.size < numToRemove && indicesToRemove.size < prev.length) {
              indicesToRemove.add(Math.floor(Math.random() * prev.length));
            }
            
            const newEvents = prev.filter((_, index) => !indicesToRemove.has(index));
            scheduleRemoveEvent(); // Schedule next removal
            return newEvents;
          }
          scheduleRemoveEvent(); // Schedule next removal attempt even if we didn't remove
          return prev;
        });
      }, delay);
    };

    // Start the scheduling
    scheduleAddEvent();
    scheduleRemoveEvent();

    return () => {
      clearTimeout(addTimeoutId);
      clearTimeout(removeTimeoutId);
    };
  }, [loading]);

  const allDots = dynamicEvents;

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-4rem)] overflow-hidden flex flex-col bg-black">
        {/* Compact Header */}
        <div className="px-6 py-4 border-b border-neutral-800 bg-black">
          <h1 className="text-xl font-semibold text-white">Dashboard</h1>
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

