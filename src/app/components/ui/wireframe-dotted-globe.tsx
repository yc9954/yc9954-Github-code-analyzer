"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

export interface CustomDot {
  lat: number;
  lng: number;
  color?: string;
  size?: number;
  type?: "sprint" | "issue";
  title?: string;
  description?: string;
  location?: string;
  date?: string;
  [key: string]: any; // Allow additional custom properties
}

interface RotatingEarthProps {
  width?: number;
  height?: number;
  className?: string;
  customDots?: CustomDot[];
}

export default function RotatingEarth({ 
  width = 800, 
  height = 600, 
  className = "",
  customDots = []
}: RotatingEarthProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDot, setSelectedDot] = useState<CustomDot | null>(null);
  const [popupPosition, setPopupPosition] = useState<{ x: number; y: number } | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const projectionRef = useRef<d3.GeoProjection | null>(null);
  const containerDimensionsRef = useRef<{ width: number; height: number; radius: number } | null>(null);
  const renderCallbackRef = useRef<(() => void) | null>(null);
  const selectedDotRef = useRef<CustomDot | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    if (!context) return;

    // Set up responsive dimensions
    const containerWidth = Math.min(width, window.innerWidth - 40);
    const containerHeight = Math.min(height, window.innerHeight - 100);
    const radius = Math.min(containerWidth, containerHeight) / 2.5;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = containerWidth * dpr;
    canvas.height = containerHeight * dpr;
    canvas.style.width = `${containerWidth}px`;
    canvas.style.height = `${containerHeight}px`;
    context.scale(dpr, dpr);

    // Create projection and path generator for Canvas
    // Initial rotation: [longitude, latitude] - slightly rotated for better view (reversed)
    // Initial scale: 1.4x for more zoomed in view
    const projection = d3
      .geoOrthographic()
      .scale(radius * 1.4) // Increased from 1.6 to 1.8 for larger globe
      .translate([containerWidth / 2, containerHeight / 2])
      .rotate([-30, -35]) // Initial rotation: -30 degrees longitude, -20 degrees latitude (reversed)
      .clipAngle(90);

    // Store projection and dimensions for click detection
    projectionRef.current = projection;
    containerDimensionsRef.current = { width: containerWidth, height: containerHeight, radius };

    const path = d3.geoPath().projection(projection).context(context);

    const pointInPolygon = (point: [number, number], polygon: number[][]): boolean => {
      const [x, y] = point;
      let inside = false;

      for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const [xi, yi] = polygon[i];
        const [xj, yj] = polygon[j];

        if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
          inside = !inside;
        }
      }

      return inside;
    };

    const pointInFeature = (point: [number, number], feature: any): boolean => {
      const geometry = feature.geometry;

      if (geometry.type === "Polygon") {
        const coordinates = geometry.coordinates;
        // Check if point is in outer ring
        if (!pointInPolygon(point, coordinates[0])) {
          return false;
        }
        // Check if point is in any hole (inner rings)
        for (let i = 1; i < coordinates.length; i++) {
          if (pointInPolygon(point, coordinates[i])) {
            return false; // Point is in a hole
          }
        }
        return true;
      } else if (geometry.type === "MultiPolygon") {
        // Check each polygon in the MultiPolygon
        for (const polygon of geometry.coordinates) {
          // Check if point is in outer ring
          if (pointInPolygon(point, polygon[0])) {
            // Check if point is in any hole
            let inHole = false;
            for (let i = 1; i < polygon.length; i++) {
              if (pointInPolygon(point, polygon[i])) {
                inHole = true;
                break;
              }
            }
            if (!inHole) {
              return true;
            }
          }
        }
        return false;
      }

      return false;
    };

    const generateDotsInPolygon = (feature: any, dotSpacing = 16) => {
      const dots: [number, number][] = [];
      const bounds = d3.geoBounds(feature);
      const [[minLng, minLat], [maxLng, maxLat]] = bounds;

      const stepSize = dotSpacing * 0.08;
      let pointsGenerated = 0;

      for (let lng = minLng; lng <= maxLng; lng += stepSize) {
        for (let lat = minLat; lat <= maxLat; lat += stepSize) {
          const point: [number, number] = [lng, lat];
          if (pointInFeature(point, feature)) {
            dots.push(point);
            pointsGenerated++;
          }
        }
      }

      return dots;
    };

    interface DotData {
      lng: number;
      lat: number;
      visible: boolean;
    }

    const allDots: DotData[] = [];
    let landFeatures: any;

    const render = () => {
      // Clear canvas
      context.clearRect(0, 0, containerWidth, containerHeight);

      const currentScale = projection.scale();
      const scaleFactor = currentScale / radius;

      // Draw ocean (globe background)
      context.beginPath();
      context.arc(containerWidth / 2, containerHeight / 2, currentScale, 0, 2 * Math.PI);
      context.fillStyle = "#000000";
      context.fill();
      context.strokeStyle = "#ffffff";
      context.lineWidth = 2 * scaleFactor;
      context.stroke();

      if (landFeatures) {
        // Draw graticule
        const graticule = d3.geoGraticule();
        context.beginPath();
        path(graticule() as any);
        context.strokeStyle = "#ffffff";
        context.lineWidth = 1 * scaleFactor;
        context.globalAlpha = 0.25;
        context.stroke();
        context.globalAlpha = 1;

        // Draw land outlines
        context.beginPath();
        landFeatures.features.forEach((feature: any) => {
          path(feature);
        });
        context.strokeStyle = "#ffffff";
        context.lineWidth = 1 * scaleFactor;
        context.stroke();

        // Draw halftone dots (land dots)
        allDots.forEach((dot) => {
          const projected = projection([dot.lng, dot.lat] as [number, number]);
          if (
            projected &&
            projected[0] >= 0 &&
            projected[0] <= containerWidth &&
            projected[1] >= 0 &&
            projected[1] <= containerHeight
          ) {
            context.beginPath();
            context.arc(projected[0], projected[1], 1.2 * scaleFactor, 0, 2 * Math.PI);
            context.fillStyle = "#999999";
            context.fill();
          }
        });
      }

      // Draw custom dots for issues/sprints
      customDots.forEach((dot) => {
        const projected = projection([dot.lng, dot.lat] as [number, number]);
        if (
          projected &&
          projected[0] >= 0 &&
          projected[0] <= containerWidth &&
          projected[1] >= 0 &&
          projected[1] <= containerHeight
        ) {
          const dotSize = (dot.size || 6) * scaleFactor;
          const dotColor = dot.color || "#7aa2f7";

          // Glow effect
          context.shadowBlur = 15 * scaleFactor;
          context.shadowColor = dotColor;
          context.fillStyle = dotColor;
          context.beginPath();
          context.arc(projected[0], projected[1], dotSize, 0, 2 * Math.PI);
          context.fill();
          context.shadowBlur = 0;
        }
      });

      // Update popup position if a dot is selected
      // Use ref to get the latest selectedDot value
      const currentSelectedDot = selectedDotRef.current;
      if (currentSelectedDot && projectionRef.current) {
        const projected = projectionRef.current([currentSelectedDot.lng, currentSelectedDot.lat] as [number, number]);
        if (projected && containerRef.current) {
          const rect = canvas.getBoundingClientRect();
          const containerRect = containerRef.current.getBoundingClientRect();
          setPopupPosition({
            x: rect.left - containerRect.left + projected[0],
            y: rect.top - containerRect.top + projected[1]
          });
        } else {
          // Dot is on the back side of the globe or not visible
          setPopupPosition(null);
        }
      } else if (!currentSelectedDot) {
        setPopupPosition(null);
      }
    };

    // Store render function reference for position updates
    renderCallbackRef.current = render;

    const loadWorldData = async () => {
      try {
        setIsLoading(true);

        const response = await fetch(
          "https://raw.githubusercontent.com/martynafford/natural-earth-geojson/refs/heads/master/110m/physical/ne_110m_land.json",
        );
        if (!response.ok) throw new Error("Failed to load land data");

        landFeatures = await response.json();

        // Generate dots for all land features
        let totalDots = 0;
        landFeatures.features.forEach((feature: any) => {
          const dots = generateDotsInPolygon(feature, 16);
          dots.forEach(([lng, lat]) => {
            allDots.push({ lng, lat, visible: true });
            totalDots++;
          });
        });

        render();
        setIsLoading(false);
        // Trigger fade-in effect after loading completes
        setTimeout(() => {
          setIsVisible(true);
        }, 50);
      } catch (err) {
        setError("Failed to load land map data");
        setIsLoading(false);
      }
    };

    // Set up rotation and interaction
    // Start with initial rotation from projection
    const initialRotation = projection.rotate();
    const rotation: [number, number, number] = [
      initialRotation[0] || 0,
      initialRotation[1] || 0,
      initialRotation[2] || 0
    ];
    let autoRotate = true;
    let rotationSpeed = 0.3; // Initial speed (reduced from 0.5)
    const slowRotationSpeed = 0.1; // Slower speed after interaction

    const rotate = () => {
      if (autoRotate) {
        rotation[0] += rotationSpeed; // Original rotation direction
        projection.rotate(rotation);
        render();
      }
    };

    // Auto-rotation timer
    const rotationTimer = d3.timer(rotate);

    const handleMouseDown = (event: MouseEvent) => {
      // Slow down rotation speed when user interacts
      if (rotationSpeed > slowRotationSpeed) {
        rotationSpeed = slowRotationSpeed;
      }

      const startX = event.clientX;
      const startY = event.clientY;
      const startRotation: [number, number, number] = [rotation[0], rotation[1], rotation[2]];

      const handleMouseMove = (moveEvent: MouseEvent) => {
        const sensitivity = 0.5;
        const dx = moveEvent.clientX - startX;
        const dy = moveEvent.clientY - startY;

        rotation[0] = startRotation[0] + dx * sensitivity;
        rotation[1] = startRotation[1] - dy * sensitivity;
        rotation[1] = Math.max(-90, Math.min(90, rotation[1]));

        projection.rotate(rotation);
        render();
      };

      const handleMouseUp = () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    };

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      const scaleFactor = event.deltaY > 0 ? 0.9 : 1.1;
      const newRadius = Math.max(radius * 0.5, Math.min(radius * 3, projection.scale() * scaleFactor));
      projection.scale(newRadius);
      render();
    };

    const handleClick = (event: MouseEvent) => {
      if (!projectionRef.current || !containerDimensionsRef.current) return;

      // Slow down rotation speed after interaction
      if (rotationSpeed > slowRotationSpeed) {
        rotationSpeed = slowRotationSpeed;
      }

      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      // Find the closest custom dot to the click position
      let closestDot: CustomDot | null = null;
      let minDistance = Infinity;
      const clickThreshold = 30; // pixels

      customDots.forEach((dot) => {
        const projected = projectionRef.current!([dot.lng, dot.lat] as [number, number]);
        if (projected) {
          const distance = Math.sqrt(
            Math.pow(projected[0] - x, 2) + Math.pow(projected[1] - y, 2)
          );
          if (distance < clickThreshold && distance < minDistance) {
            minDistance = distance;
            closestDot = dot;
          }
        }
      });

      if (closestDot) {
        setSelectedDot(closestDot);
        selectedDotRef.current = closestDot;
        // Update position immediately
        if (renderCallbackRef.current) {
          renderCallbackRef.current();
        }
      } else {
        // Clicked on empty space, close popup
        setSelectedDot(null);
        selectedDotRef.current = null;
        setPopupPosition(null);
      }
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("wheel", handleWheel);
    canvas.addEventListener("click", handleClick);

    // Load the world data
    loadWorldData();

    // Cleanup
    return () => {
      rotationTimer.stop();
      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("wheel", handleWheel);
      canvas.removeEventListener("click", handleClick);
    };
  }, [width, height, customDots]);

  // Update popup position when selectedDot changes or on render
  useEffect(() => {
    selectedDotRef.current = selectedDot;
    if (selectedDot && renderCallbackRef.current) {
      renderCallbackRef.current();
    } else if (!selectedDot) {
      setPopupPosition(null);
    }
  }, [selectedDot]);

  if (error) {
    return (
      <div className={`dark flex items-center justify-center bg-card rounded-2xl p-8 ${className}`}>
        <div className="text-center">
          <p className="dark text-destructive font-semibold mb-2">Error loading Earth visualization</p>
          <p className="dark text-muted-foreground text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-auto rounded-2xl bg-background dark cursor-pointer"
        style={{ 
          maxWidth: "100%", 
          height: "auto",
          opacity: isVisible ? 1 : 0,
          transition: "opacity 2s cubic-bezier(0.98, 0.02, 0.9, 0.1)"
        }}
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white/60 text-sm">Loading Earth...</div>
        </div>
      )}
      <div className="absolute bottom-4 left-4 text-xs text-muted-foreground px-2 py-1 rounded-md dark bg-neutral-900">
        Drag to rotate • Scroll to zoom • Click dots for details
      </div>

      {/* Liquid Glass UI Popup */}
      {selectedDot && popupPosition && (
        <div
          className="absolute pointer-events-none z-50"
          style={{
            left: `${popupPosition.x}px`,
            top: `${popupPosition.y}px`,
            transform: "translate(-50%, -100%)",
            marginTop: "-10px",
          }}
        >
          <div
            className="backdrop-blur-xl bg-white/10 dark:bg-black/20 border border-white/20 dark:border-white/10 rounded-2xl p-4 shadow-2xl min-w-[280px] max-w-[320px]"
            style={{
              backdropFilter: "blur(20px) saturate(180%)",
              WebkitBackdropFilter: "blur(20px) saturate(180%)",
              boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
            }}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-3 h-3 rounded-full flex-shrink-0 mt-1 ${
                  selectedDot.type === "sprint" ? "bg-blue-500" : "bg-orange-500"
                }`}
                style={{
                  boxShadow: `0 0 10px ${
                    selectedDot.type === "sprint" ? "rgba(59, 130, 246, 0.5)" : "rgba(251, 146, 60, 0.5)"
                  }`,
                }}
              />
              <div className="flex-1 space-y-2">
                <div>
                  <h3 className="text-white font-semibold text-base leading-tight">
                    {selectedDot.title || (selectedDot.type === "sprint" ? "Sprint" : "Issue")}
                  </h3>
                  <p className="text-white/60 text-xs mt-0.5">
                    {selectedDot.type === "sprint" ? "Sprint Event" : "Issue Event"}
                  </p>
                </div>
                
                {selectedDot.location && (
                  <div className="pt-1 border-t border-white/10">
                    <p className="text-white/80 text-xs font-medium mb-0.5">Location</p>
                    <p className="text-white/60 text-xs">{selectedDot.location}</p>
                  </div>
                )}
                
                {selectedDot.date && (
                  <div>
                    <p className="text-white/80 text-xs font-medium mb-0.5">Date</p>
                    <p className="text-white/60 text-xs">{selectedDot.date}</p>
                  </div>
                )}
                
                {selectedDot.description && (
                  <div>
                    <p className="text-white/80 text-xs font-medium mb-0.5">Description</p>
                    <p className="text-white/60 text-xs leading-relaxed">{selectedDot.description}</p>
                  </div>
                )}
              </div>
              
              <button
                onClick={() => {
                  setSelectedDot(null);
                  setPopupPosition(null);
                }}
                className="absolute top-2 right-2 text-white/60 hover:text-white transition-colors pointer-events-auto"
                aria-label="Close"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
