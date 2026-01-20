import { useNavigate } from "react-router-dom";
import { SignInPage } from "@/app/components/ui/sign-in";

export function LoginPage() {
  const navigate = useNavigate();

  const handleSignIn = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());
    console.log("Sign In submitted:", data);
    // Redirect to GitHub OAuth
    handleGitHubSignIn();
  };

  const handleGitHubSignIn = () => {
    // GitHub 로그인 시작 - 백엔드 OAuth 엔드포인트로 리다이렉트
    // 백엔드가 처리 후 /auth/callback으로 리다이렉트함
    // 같은 창에서 리다이렉트되도록 window.location.replace 사용
    console.log('Redirecting to GitHub OAuth...');
    console.log('Current origin:', window.location.origin);
    // replace를 사용하여 히스토리에 남기지 않고 같은 창에서 리다이렉트
    window.location.replace('https://api.sprintgit.com/oauth2/authorization/github');
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
