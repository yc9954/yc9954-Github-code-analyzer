import { DashboardLayout } from "@/app/components/DashboardLayout";
import RotatingEarth from "@/app/components/ui/wireframe-dotted-globe";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// Major tech hubs coordinates for realistic simulation
const majorCities = [
  { lat: 37.5665, lng: 126.9780, location: "Seoul, South Korea" },
  { lat: 37.7749, lng: -122.4194, location: "San Francisco, USA" },
  { lat: 40.7128, lng: -74.0060, location: "New York, USA" },
  { lat: 51.5074, lng: -0.1278, location: "London, UK" },
  { lat: 35.6762, lng: 139.6503, location: "Tokyo, Japan" },
  { lat: 52.5200, lng: 13.4050, location: "Berlin, Germany" },
  { lat: 22.3193, lng: 114.1694, location: "Hong Kong" },
  { lat: 1.3521, lng: 103.8198, location: "Singapore" },
  { lat: 48.8566, lng: 2.3522, location: "Paris, France" },
  { lat: -33.8688, lng: 151.2093, location: "Sydney, Australia" },
  { lat: 19.0760, lng: 72.8777, location: "Mumbai, India" },
  { lat: 55.7558, lng: 37.6173, location: "Moscow, Russia" },
  { lat: -23.5505, lng: -46.6333, location: "São Paulo, Brazil" },
  { lat: 43.6532, lng: -79.3832, location: "Toronto, Canada" },
  { lat: -77.846, lng: 166.668, location: "McMurdo Station, Antarctica" }, // Added Antarctica
];

const activityTypes = [
  { type: "commit", title: "New Commit", description: "Pushed changes to main branch", color: "#7aa2f7" }, // Blue
  { type: "search", title: "Code Search", description: "Searched for 'authentication'", color: "#bb9af7" }, // Purple
  { type: "view", title: "Repo View", description: "Viewing repository details", color: "#7dcfff" }, // Cyan
  { type: "clone", title: "Git Clone", description: "Cloned repository locally", color: "#9ece6a" }, // Green
  { type: "issue", title: "Issue Created", description: "Opened new issue #42", color: "#f7768e" }, // Red
  { type: "pr", title: "Pull Request", description: "Opened PR: 'Fix login bug'", color: "#ff9e64" },
];
const _unused = "suppress lints";

export function DashboardPage() {
  const navigate = useNavigate();
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });
  const [loading, setLoading] = useState(true);
  const [liveDots, setLiveDots] = useState<any[]>([]);

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth - 100,
        height: window.innerHeight - 200, // Adjusted height
      });
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  // Load dashboard data (Cleaned up)
  useEffect(() => {
    // Determine loading state
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Live Activity Simulation
  useEffect(() => {
    // Add new dots every random interval
    const addDotInterval = setInterval(() => {
      // Spawn 3-5 dots at once
      const dotsToSpawn = Math.floor(Math.random() * 3) + 3;
      const newDots = [];

      for (let i = 0; i < dotsToSpawn; i++) {
        const randomCity = majorCities[Math.floor(Math.random() * majorCities.length)];
        const randomActivity = activityTypes[Math.floor(Math.random() * activityTypes.length)];

        newDots.push({
          lat: randomCity.lat + (Math.random() - 0.5) * 10, // Increased jitter for wider spread
          lng: randomCity.lng + (Math.random() - 0.5) * 10,
          color: randomActivity.color,
          size: 4 + Math.random() * 6, // Random size 4-10
          type: "activity",
          title: randomActivity.title,
          description: randomActivity.description,
          location: randomCity.location,
          date: new Date().toLocaleTimeString(),
          opacity: 1,
          id: Date.now() + Math.random() + i, // Unique ID
          createdAt: Date.now(),
          lifeTime: 8000 + Math.random() * 5000 // Increased lifetime: 8-13 seconds
        });
      }

      setLiveDots(prev => [...prev, ...newDots]);
    }, 1200); // Slightly slower interval since we spawn multiple dots

    // Fade out and remove dots loop (60fps)
    const fadeInterval = setInterval(() => {
      const now = Date.now();
      setLiveDots(prev => {
        return prev
          .map(dot => {
            const age = now - dot.createdAt;
            const remainingLife = dot.lifeTime - age;

            if (remainingLife <= 0) return null;

            // Start fading in last 1.5 seconds
            let newOpacity = 1;
            if (remainingLife < 1500) {
              newOpacity = remainingLife / 1500;
            }

            return { ...dot, opacity: newOpacity };
          })
          .filter(Boolean) as any[]; // Remove nulls
      });
    }, 50);

    return () => {
      clearInterval(addDotInterval);
      clearInterval(fadeInterval);
    };
  }, []);

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-4rem)] overflow-hidden flex flex-col bg-black">
        {/* Compact Header */}
        <div className="px-6 py-4 border-b border-neutral-800 bg-black flex justify-between items-center">
          <h1 className="text-xl font-semibold text-white">Live Activity Map</h1>
          <div className="text-xs text-neutral-500 animate-pulse flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            Real-time User Activity
          </div>
        </div>

        <div className="flex-1 overflow-hidden bg-black relative">
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <RotatingEarth
              width={dimensions.width}
              height={dimensions.height}
              customDots={liveDots}
              className="w-full h-full"
            />
          </div>

          {/* Overlay info */}
          <div className="absolute bottom-6 left-6 text-neutral-500 text-xs">
            * Visualizing live user actions (Commits, Searches, Views)
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
