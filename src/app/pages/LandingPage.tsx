import { Link } from "react-router-dom";
import ResponsiveHeroBanner from "@/app/components/ResponsiveHeroBanner";
import { Github } from "lucide-react";

export function LandingPage() {
  return (
    <div className="min-h-screen">
      <ResponsiveHeroBanner
        logoUrl="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/febf2421-4a9a-42d6-871d-ff4f9518021c_1600w.png"
        backgroundImageUrl="https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/0e2dbea0-c0a9-413f-a57b-af279633c0df_3840w.jpg"
        navLinks={[
          { label: "Home", href: "/", isActive: true },
          { label: "Features", href: "#features" },
          { label: "Repository", href: "/repository" },
          { label: "Dashboard", href: "/dashboard" },
          { label: "Search", href: "/search" }
        ]}
        ctaButtonText="Sign up"
        ctaButtonHref="/login"
        badgeLabel="New"
        badgeText="Advanced GitHub Code Analytics Platform"
        title="Where developers"
        titleLine2="build together"
        description="Analyze GitHub repositories, track commits, and visualize team collaboration. The most advanced development analytics platform."
        primaryButtonText="Get Started"
        primaryButtonHref="/login"
        secondaryButtonText="Watch Demo"
        secondaryButtonHref="#"
        partnersTitle="Trusted by leading development teams worldwide"
        partners={[
          { logoUrl: "https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/f7466370-2832-4fdd-84c2-0932bb0dd850_800w.png", href: "#" },
          { logoUrl: "https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/0a9a71ec-268b-4689-a510-56f57e9d4f13_1600w.png", href: "#" },
          { logoUrl: "https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/a9ed4369-748a-49f8-9995-55d6c876bbff_1600w.png", href: "#" },
          { logoUrl: "https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/0d8966a4-8525-4e11-9d5d-2d7390b2c798_1600w.png", href: "#" },
          { logoUrl: "https://hoirqrkdgbmvpwutwuwj.supabase.co/storage/v1/object/public/assets/assets/2ed33c8b-b8b2-4176-967f-3d785fed07d8_1600w.png", href: "#" }
        ]}
      />
      
      {/* Footer */}
      <footer className="border-t border-[#30363d]/50 bg-[#0d1117]">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#7d8590]">
              <Github className="w-5 h-5" />
              <span className="text-sm">© 2026 DevAnalytics, Inc.</span>
            </div>
            <div className="flex items-center gap-6">
              <a href="#" className="text-sm text-[#7d8590] hover:text-[#58a6ff] transition-colors">Terms</a>
              <a href="#" className="text-sm text-[#7d8590] hover:text-[#58a6ff] transition-colors">Privacy</a>
              <a href="#" className="text-sm text-[#7d8590] hover:text-[#58a6ff] transition-colors">Security</a>
              <a href="#" className="text-sm text-[#7d8590] hover:text-[#58a6ff] transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
