import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { LandingPage } from "@/app/pages/LandingPage";
import { LoginPage } from "@/app/pages/LoginPage";
import { DashboardPage } from "@/app/pages/DashboardPage";
import { RepositoryPage } from "@/app/pages/RepositoryPage";
import { SprintPage } from "@/app/pages/SprintPage";
import { RankingPage } from "@/app/pages/RankingPage";
import { TeamPage } from "@/app/pages/TeamPage";
import { CommitsPage } from "@/app/pages/CommitsPage";
import { SettingsPage } from "@/app/pages/SettingsPage";
import { SearchPage } from "@/app/pages/SearchPage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/repository" element={<RepositoryPage />} />
        <Route path="/sprint" element={<SprintPage />} />
        <Route path="/ranking" element={<RankingPage />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/commits" element={<CommitsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}
