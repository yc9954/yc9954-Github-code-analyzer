import { DashboardLayout } from "@/app/components/DashboardLayout";
import RotatingEarth from "@/app/components/ui/wireframe-dotted-globe";
import { useState, useEffect } from "react";

// Mock data for sprints and issues locations (latitude, longitude)
// 실제로는 API에서 가져와야 할 데이터
const sprintLocations = [
  { 
    lat: 37.5665, 
    lng: 126.9780, 
    color: "#7aa2f7", 
    size: 8,
    type: "sprint" as const,
    title: "Q1 Sprint Planning",
    location: "Seoul, South Korea",
    date: "2024-01-15",
    description: "Quarterly sprint planning session for Q1 2024"
  },
  { 
    lat: 40.7128, 
    lng: -74.0060, 
    color: "#7aa2f7", 
    size: 8,
    type: "sprint" as const,
    title: "Product Launch Sprint",
    location: "New York, USA",
    date: "2024-02-20",
    description: "Sprint focused on launching the new product features"
  },
  { 
    lat: 51.5074, 
    lng: -0.1278, 
    color: "#7aa2f7", 
    size: 8,
    type: "sprint" as const,
    title: "Infrastructure Sprint",
    location: "London, UK",
    date: "2024-03-10",
    description: "Infrastructure improvements and optimization sprint"
  },
  { 
    lat: 35.6762, 
    lng: 139.6503, 
    color: "#7aa2f7", 
    size: 8,
    type: "sprint" as const,
    title: "Mobile App Sprint",
    location: "Tokyo, Japan",
    date: "2024-04-05",
    description: "Mobile application development and enhancement sprint"
  },
];

const issueLocations = [
  { 
    lat: 37.7749, 
    lng: -122.4194, 
    color: "#f0883e", 
    size: 6,
    type: "issue" as const,
    title: "Authentication Bug",
    location: "San Francisco, USA",
    date: "2024-01-22",
    description: "Critical authentication issue reported by users"
  },
  { 
    lat: 52.5200, 
    lng: 13.4050, 
    color: "#f0883e", 
    size: 6,
    type: "issue" as const,
    title: "Performance Issue",
    location: "Berlin, Germany",
    date: "2024-02-14",
    description: "Performance degradation in production environment"
  },
  { 
    lat: -33.8688, 
    lng: 151.2093, 
    color: "#f0883e", 
    size: 6,
    type: "issue" as const,
    title: "Database Connection Error",
    location: "Sydney, Australia",
    date: "2024-03-18",
    description: "Intermittent database connection failures"
  },
];

export function DashboardPage() {
  const [dimensions, setDimensions] = useState({ width: 1200, height: 800 });

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

  // Combine sprints and issues for the globe
  const allDots = [...sprintLocations, ...issueLocations];

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-4rem)] overflow-hidden flex flex-col bg-black">
        {/* Compact Header */}
        <div className="px-4 py-2.5 border-b border-neutral-800 bg-black">
          <h1 className="text-base font-semibold text-white">Home</h1>
        </div>

        <div className="flex-1 overflow-hidden bg-black">
          <div className="w-full h-full flex items-center justify-center p-4">
            <RotatingEarth 
              width={dimensions.width} 
              height={dimensions.height}
              customDots={allDots}
              className="w-full h-full"
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
