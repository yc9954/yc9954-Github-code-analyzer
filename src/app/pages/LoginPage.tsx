import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { SignInPage } from "@/app/components/ui/sign-in";
import { useEffect, useState } from "react";
import { setAuthToken } from "@/lib/api";

export function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const [isProcessingCallback, setIsProcessingCallback] = useState(false);

  // Handle OAuth callback - when redirected back from GitHub OAuth
  useEffect(() => {
    // Check if we're on the callback route
    if (location.pathname === '/auth/callback') {
      setIsProcessingCallback(true);
      
      // Get tokens from URL parameters
      const accessToken = searchParams.get('accessToken');
      const refreshToken = searchParams.get('refreshToken');
      
      if (accessToken && refreshToken) {
        // Store tokens in localStorage
        setAuthToken(accessToken);
        if (typeof window !== 'undefined') {
          localStorage.setItem('refreshToken', refreshToken);
        }
        
        // Clear URL parameters for security
        window.history.replaceState({}, '', '/dashboard');
        
        // Navigate to dashboard
        navigate("/dashboard", { replace: true });
      } else {
        // If no tokens found, show error or redirect back to login
        console.error('No tokens found in callback URL');
        setIsProcessingCallback(false);
        // Optionally redirect to login after a delay
        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 2000);
      }
    }
  }, [location.pathname, searchParams, navigate]);

  const handleSignIn = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());
    console.log("Sign In submitted:", data);
    // Redirect to GitHub OAuth
    handleGitHubSignIn();
  };

  const handleGitHubSignIn = () => {
    // Redirect to GitHub OAuth endpoint on backend
    // Backend will handle GitHub OAuth and redirect back to /auth/callback with tokens
    window.location.href = 'https://api.sprintgit.com/oauth2/authorization/github';
  };
  
  const handleResetPassword = () => {
    console.log("Reset Password clicked");
    // Add reset password logic here
  }

  const handleCreateAccount = () => {
    console.log("Create Account clicked");
    // Redirect to GitHub OAuth (same as sign in)
    handleGitHubSignIn();
  }

  // Show loading state while processing callback
  if (isProcessingCallback) {
    return (
      <div className="bg-black text-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg mb-2">로그인 처리 중...</div>
          <div className="text-sm text-gray-400">잠시만 기다려주세요.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black text-white">
      <SignInPage
        heroImageSrc="https://images.unsplash.com/photo-1642615835477-d303d7dc9ee9?w=2160&q=80"
        onSignIn={handleSignIn}
        onGitHubSignIn={handleGitHubSignIn}
        onResetPassword={handleResetPassword}
        onCreateAccount={handleCreateAccount}
      />
    </div>
  );
}
