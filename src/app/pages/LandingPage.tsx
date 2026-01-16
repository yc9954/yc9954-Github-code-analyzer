import { Link } from "react-router-dom";
import { Github, ArrowRight } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";

export function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0d1117]">
      {/* Navigation */}
      <nav className="border-b border-[#30363d]/50">
        <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <Github className="w-8 h-8 text-white" />
                <span className="text-xl font-semibold text-white">DevAnalytics</span>
              </div>
              <div className="hidden md:flex items-center gap-6">
                <a href="#" className="text-sm text-[#e6edf3] hover:text-white transition-colors">Product</a>
                <a href="#" className="text-sm text-[#e6edf3] hover:text-white transition-colors">Features</a>
                <a href="#" className="text-sm text-[#e6edf3] hover:text-white transition-colors">Enterprise</a>
                <a href="#" className="text-sm text-[#e6edf3] hover:text-white transition-colors">Pricing</a>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link to="/login">
                <Button variant="ghost" size="sm" className="text-[#e6edf3] hover:bg-[#161b22] hover:text-white">
                  Sign in
                </Button>
              </Link>
              <Link to="/login">
                <Button size="sm" className="bg-white text-[#0d1117] hover:bg-gray-200 border-0">
                  Sign up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[1000px] bg-gradient-to-br from-[#7ee787]/20 via-[#58a6ff]/20 to-[#a371f7]/20 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-[1280px] mx-auto px-6 lg:px-8 pt-16 pb-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-200px)]">
            {/* Left Content */}
            <div className="max-w-2xl">
              <h1 className="text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
                Where developers
                <span className="block bg-gradient-to-r from-[#7ee787] via-[#58a6ff] to-[#a371f7] bg-clip-text text-transparent">
                  build together
                </span>
              </h1>
              
              <p className="text-xl text-[#7d8590] mb-8 leading-relaxed max-w-xl">
                Analyze GitHub repositories, track commits, and visualize team collaboration. 
                The most advanced development analytics platform.
              </p>
              
              <div className="flex items-center gap-3 mb-4">
                <Input
                  type="email"
                  placeholder="Email address"
                  className="h-12 bg-white/10 border-[#30363d] text-white placeholder:text-[#7d8590] focus:border-[#58a6ff] focus:ring-[#58a6ff]/20 backdrop-blur-sm"
                />
                <Link to="/login">
                  <Button size="lg" className="h-12 bg-[#238636] hover:bg-[#2ea043] text-white border-0 whitespace-nowrap">
                    Sign up for free
                  </Button>
                </Link>
              </div>
              <p className="text-xs text-[#7d8590]">
                Free for open source teams. No credit card required.
              </p>
            </div>

            {/* Right Visual */}
            <div className="relative hidden lg:block">
              <div className="relative">
                {/* Code window mockup */}
                <div className="bg-[#161b22] rounded-lg border border-[#30363d] shadow-2xl overflow-hidden">
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-[#30363d]">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-[#f85149]"></div>
                      <div className="w-3 h-3 rounded-full bg-[#f0883e]"></div>
                      <div className="w-3 h-3 rounded-full bg-[#3fb950]"></div>
                    </div>
                    <div className="flex-1 text-center text-xs text-[#7d8590]">
                      repository-analytics.ts
                    </div>
                  </div>
                  <div className="p-6 font-mono text-sm">
                    <div className="space-y-2">
                      <div className="text-[#7d8590]">
                        <span className="text-[#ff7b72]">const</span>{" "}
                        <span className="text-[#79c0ff]">analytics</span>{" "}
                        <span className="text-[#ff7b72]">=</span>{" "}
                        <span className="text-[#a5d6ff]">await</span>{" "}
                        <span className="text-[#d2a8ff]">analyzeRepo</span>
                        <span className="text-[#7d8590]">()</span>
                      </div>
                      <div className="text-[#7d8590] pl-4">
                        commits: <span className="text-[#a5d6ff]">1,247</span>,
                      </div>
                      <div className="text-[#7d8590] pl-4">
                        contributors: <span className="text-[#a5d6ff]">42</span>,
                      </div>
                      <div className="text-[#7d8590] pl-4">
                        score: <span className="text-[#a5d6ff]">9.2</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating elements */}
                <div className="absolute -top-4 -right-4 bg-[#238636] text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg">
                  ✓ Analysis Complete
                </div>
                <div className="absolute -bottom-4 -left-4 bg-[#1f6feb] text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg">
                  +24 commits today
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-16 mt-16 border-t border-[#30363d]/50">
            <div>
              <div className="text-4xl font-bold text-white mb-2">73+ million</div>
              <div className="text-sm text-[#7d8590]">Developers</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">4+ million</div>
              <div className="text-sm text-[#7d8590]">Organizations</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">200+ million</div>
              <div className="text-sm text-[#7d8590]">Repositories</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-white mb-2">84%</div>
              <div className="text-sm text-[#7d8590]">Fortune 100</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#30363d]/50">
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
