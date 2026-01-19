import { useNavigate } from "react-router-dom";
import { SignInPage } from "@/app/components/ui/sign-in";

export function LoginPage() {
  const navigate = useNavigate();

  const handleSignIn = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());
    console.log("Sign In submitted:", data);
    // Navigate to dashboard on successful sign in
    navigate("/dashboard");
  };

  const handleGitHubSignIn = () => {
    console.log("Continue with GitHub clicked");
    // Navigate to dashboard
    navigate("/dashboard");
  };
  
  const handleResetPassword = () => {
    console.log("Reset Password clicked");
    // Add reset password logic here
  }

  const handleCreateAccount = () => {
    console.log("Create Account clicked");
    // Navigate to sign up page or show sign up form
    navigate("/login");
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
