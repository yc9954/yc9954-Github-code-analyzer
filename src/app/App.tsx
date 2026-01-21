import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { LandingPage } from "@/app/pages/LandingPage";
import { LoginPage } from "@/app/pages/LoginPage";
import { AuthCallback } from "@/app/pages/AuthCallback";
import { DashboardPage } from "@/app/pages/DashboardPage";
import { RepositoryPage } from "@/app/pages/RepositoryPage";
import { SprintPage } from "@/app/pages/SprintPage";
import { CommitsPage } from "@/app/pages/CommitsPage";
import { SettingsPage } from "@/app/pages/SettingsPage";
import { SearchPage } from "@/app/pages/SearchPage";
import { TeamPage } from "@/app/pages/TeamPage";
import { TeamDetailPage } from "@/app/pages/TeamDetailPage";
import { ServerDownPage } from "@/app/pages/ServerDownPage";
import { UserProvider } from "@/app/contexts/UserContext";

export default function App() {
  return (
    <Router>
      <UserProvider>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/repository" element={<RepositoryPage />} />
          <Route path="/sprint" element={<SprintPage />} />
          <Route path="/ranking" element={<Navigate to="/sprint?view=ranking" replace />} />
          <Route path="/commits" element={<CommitsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/teams" element={<TeamPage />} />
          <Route path="/teams/:teamId" element={<TeamDetailPage />} />
          <Route path="/server-error" element={<ServerDownPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </UserProvider>
    </Router>
  );
}
