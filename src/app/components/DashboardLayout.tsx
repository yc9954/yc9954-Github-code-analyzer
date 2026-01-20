import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "@/app/components/Sidebar";
import { TopBar } from "@/app/components/TopBar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();

  // 인증 체크: 토큰이 없으면 로그인 페이지로 리다이렉트
  useEffect(() => {
    const checkAuth = async () => {
      // 1. 초기 체크
      let accessToken = localStorage.getItem('accessToken');

      if (!accessToken) {
        console.log('No access token found, waiting for 1.5 seconds...');
        // 토큰이 없으면 좀 더 충분히 대기 (OAuth 콜백 처리 중일 수 있음)
        await new Promise(resolve => setTimeout(resolve, 1500));
        accessToken = localStorage.getItem('accessToken');
      }

      if (!accessToken) {
        console.log('Still no access token found, checking once more after 1.5 seconds...');
        await new Promise(resolve => setTimeout(resolve, 1500));
        accessToken = localStorage.getItem('accessToken');
      }

      if (!accessToken) {
        console.log('No access token found after retries, redirecting to login');
        navigate('/login', { replace: true });
      }
    };
    checkAuth();
  }, [navigate]);

  return (
    <div className="relative h-screen bg-black">
      {/* Background overlay when sidebar is open */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Fixed position, overlays content */}
      <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />

      {/* Main content - Full width with margin for mini sidebar */}
      <div className={`h-full flex flex-col overflow-hidden transition-all duration-300 ${isSidebarOpen ? 'ml-0' : 'ml-16'
        }`}>
        <TopBar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} isSidebarOpen={isSidebarOpen} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
