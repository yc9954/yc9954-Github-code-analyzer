import { Link } from "react-router-dom";
import { Github } from "lucide-react";
import { Button } from "@/app/components/ui/button";

export function LoginPage() {
  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#1a1b26] via-[#24283b] to-[#1f2937]">
        {/* Animated blobs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-[#7aa2f7]/30 to-[#bb9af7]/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-br from-[#9ece6a]/20 to-[#7dcfff]/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-[#bb9af7]/10 to-[#7aa2f7]/10 rounded-full blur-3xl"></div>
        
        {/* Stars/particles effect */}
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animation: `twinkle ${2 + Math.random() * 3}s infinite ${Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Glass morphism card */}
        <div className="relative bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl p-8">
          {/* Shine effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent rounded-2xl pointer-events-none"></div>
          
          <div className="relative">
            {/* Logo */}
            <div className="flex justify-center mb-8">
              <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                <Github className="w-10 h-10 text-white" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-3xl font-bold text-center text-white mb-2">
              Welcome Back
            </h1>
            <p className="text-center text-white/60 mb-8">
              Sign in to continue to DevAnalytics
            </p>

            {/* GitHub Sign In Button */}
            <Link to="/dashboard">
              <Button 
                className="w-full h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white border border-white/20 gap-2 transition-all duration-300 hover:scale-[1.02]"
              >
                <Github className="w-5 h-5" />
                Continue with GitHub
              </Button>
            </Link>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-4 bg-transparent text-white/40">OR</span>
              </div>
            </div>

            {/* Email Input */}
            <div className="space-y-4 mb-6">
              <div>
                <input
                  type="email"
                  placeholder="Email address"
                  className="w-full h-12 px-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-[#7aa2f7] focus:ring-2 focus:ring-[#7aa2f7]/20 transition-all"
                />
              </div>
              <div>
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full h-12 px-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-white placeholder:text-white/40 focus:outline-none focus:border-[#7aa2f7] focus:ring-2 focus:ring-[#7aa2f7]/20 transition-all"
                />
              </div>
            </div>

            {/* Remember me & Forgot password */}
            <div className="flex items-center justify-between mb-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-white/20 bg-white/5 text-[#7aa2f7] focus:ring-[#7aa2f7]/20"
                />
                <span className="text-sm text-white/60">Remember me</span>
              </label>
              <a href="#" className="text-sm text-[#7aa2f7] hover:text-[#7dcfff] transition-colors">
                Forgot password?
              </a>
            </div>

            {/* Login Button */}
            <Button 
              className="w-full h-12 bg-gradient-to-r from-[#7aa2f7] to-[#bb9af7] hover:from-[#7dcfff] hover:to-[#c0caf5] text-white border-0 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-[#7aa2f7]/50"
            >
              Sign In
            </Button>

            {/* Sign up link */}
            <p className="text-center text-sm text-white/60 mt-6">
              Don't have an account?{" "}
              <Link to="/login" className="text-[#7aa2f7] hover:text-[#7dcfff] font-medium transition-colors">
                Sign up
              </Link>
            </p>

            {/* Back to home */}
            <div className="text-center mt-6">
              <Link to="/" className="text-sm text-white/40 hover:text-white/60 transition-colors">
                ← Back to home
              </Link>
            </div>
          </div>
        </div>

        {/* Security note */}
        <div className="mt-6 text-center">
          <p className="text-xs text-white/30">
            Protected by enterprise-grade security
          </p>
        </div>
      </div>

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
