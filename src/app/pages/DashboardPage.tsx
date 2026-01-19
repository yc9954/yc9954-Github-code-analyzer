import { DashboardLayout } from "@/app/components/DashboardLayout";
import RotatingEarth from "@/app/components/ui/wireframe-dotted-globe";
import { useState, useEffect } from "react";

// Mock data for sprints and issues locations (latitude, longitude)
// 실제로는 API에서 가져와야 할 데이터
const sprintLocations = [
  { lat: 37.5665, lng: 126.9780, color: "#7aa2f7", size: 8 }, // Seoul
  { lat: 40.7128, lng: -74.0060, color: "#7aa2f7", size: 8 }, // New York
  { lat: 51.5074, lng: -0.1278, color: "#7aa2f7", size: 8 }, // London
  { lat: 35.6762, lng: 139.6503, color: "#7aa2f7", size: 8 }, // Tokyo
];

const issueLocations = [
  { lat: 37.7749, lng: -122.4194, color: "#f0883e", size: 6 }, // San Francisco
  { lat: 52.5200, lng: 13.4050, color: "#f0883e", size: 6 }, // Berlin
  { lat: -33.8688, lng: 151.2093, color: "#f0883e", size: 6 }, // Sydney
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
