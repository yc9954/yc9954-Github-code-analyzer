import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { githubService } from '@/services/github';

interface GitHubContextType {
  token: string | null;
  setToken: (token: string | null) => void;
  username: string | null;
  setUsername: (username: string | null) => void;
  isAuthenticated: boolean;
}

const GitHubContext = createContext<GitHubContextType | undefined>(undefined);

export function GitHubProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() => {
    // Load token from localStorage on mount
    return localStorage.getItem('github_token');
  });

  const [username, setUsernameState] = useState<string | null>(() => {
    // Load username from localStorage on mount
    return localStorage.getItem('github_username');
  });

  const setToken = (newToken: string | null) => {
    setTokenState(newToken);
    if (newToken) {
      localStorage.setItem('github_token', newToken);
      githubService.setToken(newToken);
    } else {
      localStorage.removeItem('github_token');
    }
  };

  const setUsername = (newUsername: string | null) => {
    setUsernameState(newUsername);
    if (newUsername) {
      localStorage.setItem('github_username', newUsername);
    } else {
      localStorage.removeItem('github_username');
    }
  };

  useEffect(() => {
    // Set token on service if exists
    if (token) {
      githubService.setToken(token);
    }
  }, [token]);

  const value: GitHubContextType = {
    token,
    setToken,
    username,
    setUsername,
    isAuthenticated: !!token,
  };

  return <GitHubContext.Provider value={value}>{children}</GitHubContext.Provider>;
}

export function useGitHubContext() {
  const context = useContext(GitHubContext);
  if (context === undefined) {
    throw new Error('useGitHubContext must be used within a GitHubProvider');
  }
  return context;
}
