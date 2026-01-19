"use client";

import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";

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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDot, setSelectedDot] = useState<CustomDot | null>(null);
  const projectionRef = useRef<d3.GeoProjection | null>(null);
  const containerDimensionsRef = useRef<{ width: number; height: number; radius: number } | null>(null);

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
    const projection = d3
      .geoOrthographic()
      .scale(radius)
      .translate([containerWidth / 2, containerHeight / 2])
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
    };

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
      } catch (err) {
        setError("Failed to load land map data");
        setIsLoading(false);
      }
    };

    // Set up rotation and interaction
    const rotation = [0, 0];
    let autoRotate = true;
    let rotationSpeed = 0.5; // Initial speed
    const slowRotationSpeed = 0.1; // Slower speed after interaction

    const rotate = () => {
      if (autoRotate) {
        rotation[0] += rotationSpeed;
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
      const startRotation = [...rotation];

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
    <>
      <div className={`relative ${className}`}>
        <canvas
          ref={canvasRef}
          className="w-full h-auto rounded-2xl bg-background dark cursor-pointer"
          style={{ maxWidth: "100%", height: "auto" }}
        />
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white/60 text-sm">Loading Earth...</div>
          </div>
        )}
        <div className="absolute bottom-4 left-4 text-xs text-muted-foreground px-2 py-1 rounded-md dark bg-neutral-900">
          Drag to rotate • Scroll to zoom • Click dots for details
        </div>
      </div>

      <Dialog open={!!selectedDot} onOpenChange={(open) => !open && setSelectedDot(null)}>
        <DialogContent className="bg-neutral-900 border-neutral-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-white flex items-center gap-2">
              {selectedDot?.type === "sprint" ? (
                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
              ) : (
                <span className="w-3 h-3 rounded-full bg-orange-500"></span>
              )}
              {selectedDot?.title || (selectedDot?.type === "sprint" ? "Sprint" : "Issue")}
            </DialogTitle>
            <DialogDescription className="text-neutral-400">
              {selectedDot?.type === "sprint" ? "Sprint Event" : "Issue Event"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            {selectedDot?.location && (
              <div>
                <p className="text-sm font-medium text-neutral-300">Location</p>
                <p className="text-sm text-neutral-400">{selectedDot.location}</p>
              </div>
            )}
            {selectedDot?.date && (
              <div>
                <p className="text-sm font-medium text-neutral-300">Date</p>
                <p className="text-sm text-neutral-400">{selectedDot.date}</p>
              </div>
            )}
            {selectedDot?.description && (
              <div>
                <p className="text-sm font-medium text-neutral-300">Description</p>
                <p className="text-sm text-neutral-400">{selectedDot.description}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-medium text-neutral-300">Coordinates</p>
              <p className="text-sm text-neutral-400">
                {selectedDot?.lat?.toFixed(4)}, {selectedDot?.lng?.toFixed(4)}
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
