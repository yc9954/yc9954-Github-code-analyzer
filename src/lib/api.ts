// API configuration for backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://api.sprintgit.com';

// Token management
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
};

const setAuthToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('accessToken', token);
};

// Helper function to make authenticated API calls
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      // 리다이렉트는 컴포넌트에서 처리하도록 함 (api.ts는 순수 함수이므로)
      throw new Error('인증이 필요합니다. 다시 로그인해주세요.');
    }
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
  }

  const data = await response.json();
  
  // Handle ApiResponse wrapper
  if (data.status && data.data !== undefined) {
    return data.data as T;
  }
  
  return data as T;
}

// ==================== Interfaces ====================

export interface Repository {
  id: string;
  owner: string;
  name: string;
  fullName: string;
  description?: string;
  language?: string;
  stars: number;
  forks?: number;
  updated: string;
  isArchived?: boolean;
  reponame?: string;
  repoUrl?: string;
  size?: number;
  topics?: string[];
  createdAt?: string;
  updatedAt?: string;
  pushedAt?: string;
  lastSyncAt?: string;
  languages?: Record<string, number>;
}

export interface Branch {
  name: string;
  commits: number;
  lastCommit: string;
}

export interface User {
  id: string;
  login: string;
  username?: string;
  avatar: string;
  profileUrl?: string;
  type: string;
  url: string;
}

export interface SearchResponse {
  repositories?: Repository[];
  users?: User[];
  teams?: any[];
  sprints?: any[];
  commits?: any[];
  total: number;
  queryTime: number;
  page?: number;
  perPage?: number;
  totalPages?: number;
}

export interface Commit {
  sha: string;
  message: string;
  author: string;
  username: string;
  authorName?: string;
  authorProfileUrl?: string;
  time: string;
  committedAt?: string;
  verified: boolean;
  branch: string;
  avatar?: string;
  additions?: number;
  deletions?: number;
  files?: number;
  analysisStatus?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  totalScore?: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  commits?: Commit[];
  selectedCommit?: string;
}

export interface ChatResponse {
  message: string;
}

export interface CommitAnalysisResponse {
  sha: string;
  message: string;
  committedAt: string;
  authorName: string;
  analysisStatus: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  totalScore: number;
  commitMessageQuality?: number;
  codeQuality?: number;
  changeAppropriateness?: number;
  necessity?: number;
  correctnessAndRisk?: number;
  testingAndVerification?: number;
  messageNotes?: string;
  codeQualityNotes?: string;
  necessityNotes?: string;
  correctnessRiskNotes?: string;
  testingNotes?: string;
  summary?: string;
  strengths?: string;
  issues?: string;
  suggestedNextCommit?: string;
  riskLevel?: 'LOW' | 'MED' | 'HIGH';
  analysisReason?: string;
}

// ==================== API Functions ====================

/**
 * Search repositories, users, teams, sprints, or commits
 */
export async function searchRepositories(
  query: string,
  language?: string,
  sort: 'best-match' | 'stars' | 'updated' = 'best-match',
  type: 'repositories' | 'users' | 'ALL' = 'ALL',
  page: number = 1,
  perPage: number = 20
): Promise<SearchResponse> {
  try {
    const params = new URLSearchParams({
      q: query,
    });

    // Map type to backend type
    let backendType = 'ALL';
    if (type === 'repositories') backendType = 'REPOSITORY';
    else if (type === 'users') backendType = 'USER';
    
    if (backendType !== 'ALL') {
      params.set('type', backendType);
    }

    const data = await apiCall<{
      users?: Array<{ id: number; username: string; profileUrl: string }>;
      repositories?: Array<{ id: string; reponame: string; description?: string }>;
      teams?: any[];
      sprints?: any[];
      commits?: any[];
    }>(`/api/search?${params.toString()}`);

    // Transform backend response to frontend format
    const repositories = data.repositories?.map((repo) => {
      const [owner, name] = repo.reponame.split('/');
      return {
        id: repo.id,
        owner: owner || '',
        name: name || repo.reponame,
        fullName: repo.reponame,
        description: repo.description,
        stars: 0,
        updated: new Date().toISOString(),
      } as Repository;
    }) || [];

    const users = data.users?.map((user) => ({
      id: user.id.toString(),
      login: user.username,
      username: user.username,
      avatar: user.profileUrl,
      profileUrl: user.profileUrl,
      type: 'User',
      url: `https://github.com/${user.username}`,
    })) || [];

    return {
      repositories: type === 'repositories' || type === 'ALL' ? repositories : undefined,
      users: type === 'users' || type === 'ALL' ? users : undefined,
      total: repositories.length + users.length,
      queryTime: 0,
      page,
      perPage,
      totalPages: Math.ceil((repositories.length + users.length) / perPage),
    };
  } catch (error) {
    console.error('Error searching:', error);
    return {
      repositories: type === 'repositories' || type === 'ALL' ? [] : undefined,
      users: type === 'users' || type === 'ALL' ? [] : undefined,
      total: 0,
      queryTime: 0,
      page: 1,
      perPage: 20,
      totalPages: 0,
    };
  }
}

/**
 * Get user repositories
 */
export async function getUserRepositories(): Promise<Repository[]> {
  try {
    const data = await apiCall<Array<{
      id: string;
      reponame: string;
      description?: string;
      language?: string;
      stars: number;
      size?: number;
      topics?: string[];
      createdAt?: string;
      updatedAt?: string;
      pushedAt?: string;
      lastSyncAt?: string;
      languages?: Record<string, number>;
      repoUrl?: string;
    }>>('/api/users/me/repositories');

    return data.map((repo) => {
      const [owner, name] = repo.reponame.split('/');
      return {
        id: repo.id,
        owner: owner || '',
        name: name || repo.reponame,
        fullName: repo.reponame,
        description: repo.description,
        language: repo.language,
        stars: repo.stars || 0,
        updated: repo.updatedAt || repo.pushedAt || new Date().toISOString(),
        reponame: repo.reponame,
        repoUrl: repo.repoUrl,
        size: repo.size,
        topics: repo.topics,
        createdAt: repo.createdAt,
        updatedAt: repo.updatedAt,
        pushedAt: repo.pushedAt,
        lastSyncAt: repo.lastSyncAt,
        languages: repo.languages,
      } as Repository;
    });
  } catch (error) {
    console.error('Error fetching user repositories:', error);
    return [];
  }
}

/**
 * Get repository branches (using GitHub API directly for now)
 * Note: Backend doesn't have a branches endpoint, so we'll need to use GitHub API
 * or add this endpoint to the backend
 */
export async function getRepositoryBranches(
  owner: string,
  repo: string
): Promise<Branch[]> {
  try {
    // For now, we'll try to get branches from GitHub API
    // In the future, this should be added to the backend API
    const githubToken = import.meta.env.VITE_GITHUB_TOKEN;
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
    };
    
    if (githubToken) {
      headers['Authorization'] = `token ${githubToken}`;
    }

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/branches`,
      { headers }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch branches');
    }

    const branches = await response.json();
    
    // Get commit count for each branch (simplified - just return branch names)
    return branches.map((branch: any) => ({
      name: branch.name,
      commits: 0, // Will be populated if needed
      lastCommit: branch.commit?.commit?.committer?.date || 'Unknown',
    }));
  } catch (error) {
    console.error('Error fetching branches:', error);
    return [
      { name: 'main', commits: 0, lastCommit: 'Unknown' },
    ];
  }
}

/**
 * Get repository commits
 */
export async function getRepositoryCommits(
  owner: string,
  repo: string,
  branch: string = 'main',
  page: number = 1,
  perPage: number = 20
): Promise<Commit[]> {
  try {
    // repoId format: owner/repo
    const repoId = `${owner}/${repo}`;
    
    const data = await apiCall<Array<{
      sha: string;
      message: string;
      committedAt: string;
      authorName: string;
      authorProfileUrl?: string;
      analysisStatus?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
      totalScore?: number;
    }>>(`/api/repos/${encodeURIComponent(repoId)}/commits`);

    return data.map((commit) => ({
      sha: commit.sha,
      message: commit.message,
      author: commit.authorName,
      username: commit.authorName,
      authorName: commit.authorName,
      authorProfileUrl: commit.authorProfileUrl,
      time: commit.committedAt,
      committedAt: commit.committedAt,
      verified: false,
      branch: branch,
      analysisStatus: commit.analysisStatus,
      totalScore: commit.totalScore,
    }));
  } catch (error) {
    console.error('Error fetching commits:', error);
    return [];
  }
}

/**
 * Get commit analysis result
 */
export async function getCommitAnalysis(
  owner: string,
  repo: string,
  sha: string
): Promise<CommitAnalysisResponse | null> {
  try {
    const repoId = `${owner}/${repo}`;
    const data = await apiCall<CommitAnalysisResponse>(
      `/api/repos/${encodeURIComponent(repoId)}/commits/${sha}/analysis`
    );
    return data;
  } catch (error) {
    console.error('Error fetching commit analysis:', error);
    return null;
  }
}

/**
 * Send chat message
 * Note: Since the backend doesn't have a direct chat endpoint,
 * we'll use commit analysis results to generate responses.
 * For specific commits, we fetch the analysis directly.
 * For general questions, we'll need to implement a chat endpoint in the backend.
 */
export async function sendChatMessage(
  messages: ChatMessage[],
  commits?: Commit[],
  selectedCommit?: string,
  owner?: string,
  repo?: string
): Promise<ChatResponse> {
  try {
    const lastUserMessage = messages.filter(m => m.role === 'user').pop()?.content || '';
    
    // If a specific commit is selected, get its analysis
    if (selectedCommit && owner && repo) {
      const analysis = await getCommitAnalysis(owner, repo, selectedCommit);
      
      if (analysis) {
        // Format the analysis as a response
        let response = `## 커밋 분석 결과 (${selectedCommit.substring(0, 7)})\n\n`;
        response += `**총점: ${analysis.totalScore}/100**\n\n`;
        
        if (analysis.summary) {
          response += `### 요약\n${analysis.summary}\n\n`;
        }
        
        if (analysis.strengths) {
          response += `### 좋은 점\n${analysis.strengths}\n\n`;
        }
        
        if (analysis.issues) {
          response += `### 개선이 필요한 부분\n${analysis.issues}\n\n`;
        }
        
        if (analysis.suggestedNextCommit) {
          response += `### 다음 커밋 제안\n${analysis.suggestedNextCommit}\n\n`;
        }
        
        if (analysis.riskLevel) {
          response += `**위험도: ${analysis.riskLevel}**\n\n`;
        }
        
        return { message: response };
      } else {
        return {
          message: `커밋 ${selectedCommit.substring(0, 7)}의 분석 결과를 불러올 수 없습니다. 분석이 진행 중이거나 아직 완료되지 않았을 수 있습니다.`,
        };
      }
    }

    // For general questions about commits, we'll need a backend chat endpoint
    // For now, return a helpful message
    if (commits && commits.length > 0) {
      return {
        message: `현재 ${commits.length}개의 커밋이 있습니다. 특정 커밋을 선택하면 해당 커밋의 상세 분석을 볼 수 있습니다.\n\n백엔드에 채팅 엔드포인트가 추가되면 더 자세한 답변을 제공할 수 있습니다.`,
      };
    }
    
    return {
      message: `커밋을 선택하거나 레포지토리를 먼저 선택해주세요.`,
    };
  } catch (error: any) {
    console.error('Error sending chat message:', error);
    throw error;
  }
}

// ==================== Sprint API ====================

export interface Sprint {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  description?: string;
  managerName?: string;
  isPrivate: boolean;
  isOpen: boolean;
  teamsCount?: number;
  participantsCount?: number;
  status?: string;
}

export interface SprintRanking {
  rank: number;
  team?: {
    teamId: string;
    name: string;
    score: number;
    commits: number;
    members: number;
  };
  user?: {
    userId: number;
    username: string;
    profileUrl: string;
    score: number;
    commits: number;
  };
}

/**
 * Get public sprints
 */
export async function getSprints(): Promise<Sprint[]> {
  try {
    const data = await apiCall<Array<{
      id: string;
      name: string;
      startDate: string;
      endDate: string;
      description?: string;
      managerName?: string;
      isPrivate: boolean;
      isOpen: boolean;
      teamsCount?: number;
      participantsCount?: number;
      status?: string;
    }>>('/api/sprints');

    return data.map((sprint) => ({
      id: sprint.id,
      name: sprint.name,
      startDate: sprint.startDate,
      endDate: sprint.endDate,
      description: sprint.description,
      managerName: sprint.managerName,
      isPrivate: sprint.isPrivate,
      isOpen: sprint.isOpen,
      teamsCount: sprint.teamsCount,
      participantsCount: sprint.participantsCount,
      status: sprint.status,
    }));
  } catch (error) {
    console.error('Error fetching sprints:', error);
    return [];
  }
}

/**
 * Get my sprints
 */
export async function getMySprints(): Promise<Sprint[]> {
  try {
    const data = await apiCall<Array<{
      id: string;
      name: string;
      startDate: string;
      endDate: string;
      description?: string;
      managerName?: string;
      isPrivate: boolean;
      isOpen: boolean;
      teamsCount?: number;
      participantsCount?: number;
      status?: string;
    }>>('/api/sprints/my');

    return data.map((sprint) => ({
      id: sprint.id,
      name: sprint.name,
      startDate: sprint.startDate,
      endDate: sprint.endDate,
      description: sprint.description,
      managerName: sprint.managerName,
      isPrivate: sprint.isPrivate,
      isOpen: sprint.isOpen,
      teamsCount: sprint.teamsCount,
      participantsCount: sprint.participantsCount,
      status: sprint.status,
    }));
  } catch (error) {
    console.error('Error fetching my sprints:', error);
    return [];
  }
}

/**
 * Get sprint rankings
 */
export async function getSprintRankings(
  sprintId: string,
  type: 'TEAM' | 'INDIVIDUAL' = 'TEAM'
): Promise<SprintRanking[]> {
  try {
    const data = await apiCall<Array<{
      rank: number;
      team?: {
        teamId: string;
        name: string;
        score: number;
        commits: number;
        members: number;
      };
      user?: {
        userId: number;
        username: string;
        profileUrl: string;
        score: number;
        commits: number;
      };
    }>>(`/api/sprints/${sprintId}/ranking?type=${type}`);

    return data.map((item) => ({
      rank: item.rank,
      team: item.team,
      user: item.user,
    }));
  } catch (error) {
    console.error('Error fetching sprint rankings:', error);
    return [];
  }
}

// ==================== Ranking API ====================

export interface UserRank {
  rank: number;
  username: string;
  profileUrl: string;
  totalScore: number;
}

export interface CommitRank {
  rank: number;
  commit: {
    id: {
      commitSha: string;
      repoId: string;
      branchName: string;
    };
    repository: {
      id: string;
      reponame: string;
    };
    author: {
      username: string;
      profileUrl: string;
    };
    message: string;
    totalScore: number;
    committedAt: string;
  };
}

/**
 * Get user rankings
 */
export async function getUserRankings(
  scope: 'GLOBAL' | 'SPRINT' | 'TEAM' = 'GLOBAL',
  id?: string,
  period: 'ALL' | 'YEAR' | 'MONTH' | 'WEEK' | 'DAY' | 'HOUR' | 'SPRINT' = 'ALL',
  limit: number = 10
): Promise<UserRank[]> {
  try {
    const params = new URLSearchParams({
      scope,
      period,
      limit: limit.toString(),
    });
    
    if (id && scope !== 'GLOBAL') {
      params.set('id', id);
    }

    const data = await apiCall<Array<{
      rank: number;
      username: string;
      profileUrl: string;
      totalScore: number;
    }>>(`/api/rankings/users?${params.toString()}`);

    return data;
  } catch (error) {
    console.error('Error fetching user rankings:', error);
    return [];
  }
}

/**
 * Get commit rankings
 */
export async function getCommitRankings(
  scope: 'GLOBAL' | 'SPRINT' | 'TEAM' | 'USER' = 'GLOBAL',
  id?: string,
  period: 'ALL' | 'YEAR' | 'MONTH' | 'WEEK' | 'DAY' | 'HOUR' | 'SPRINT' = 'WEEK',
  limit: number = 10
): Promise<CommitRank[]> {
  try {
    const params = new URLSearchParams({
      scope,
      period,
      limit: limit.toString(),
    });
    
    if (id && scope !== 'GLOBAL') {
      params.set('id', id);
    }

    const data = await apiCall<Array<{
      rank: number;
      commit: {
        id: {
          commitSha: string;
          repoId: string;
          branchName: string;
        };
        repository: {
          id: string;
          reponame: string;
        };
        author: {
          username: string;
          profileUrl: string;
        };
        message: string;
        totalScore: number;
        committedAt: string;
      };
    }>>(`/api/rankings/commits?${params.toString()}`);

    return data;
  } catch (error) {
    console.error('Error fetching commit rankings:', error);
    return [];
  }
}

// ==================== User & Authentication API ====================

export interface UserResponse {
  id: number;
  username: string;
  email: string;
  notifyEmail?: string;
  notifySprint?: boolean;
  notifyWeekly?: boolean;
  profileUrl: string;
  location?: string;
  publicRepos?: number;
  company?: string;
  createdAt: string;
}

export interface UserUpdateRequest {
  company?: string;
  location?: string;
  notifyEmail?: string;
  notifySprint?: boolean;
  notifyWeekly?: boolean;
}

export interface DashboardStatsResponse {
  username: string;
  totalScore: number;
  totalCommits: number;
  currentStreak: number;
  activeSprints: Sprint[];
}

export interface CommitHeatmapResponse {
  date: string;
  count: number;
}

/**
 * Get my profile
 */
export async function getMyProfile(): Promise<UserResponse> {
  try {
    const data = await apiCall<UserResponse>('/api/users/me');
    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
}

/**
 * Update my profile
 */
export async function updateMyProfile(updates: UserUpdateRequest): Promise<UserResponse> {
  try {
    const data = await apiCall<UserResponse>('/api/users/me', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
    return data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}

/**
 * Get my dashboard stats
 */
export async function getMyDashboard(): Promise<DashboardStatsResponse> {
  try {
    const data = await apiCall<DashboardStatsResponse>('/api/users/me/dashboard');
    return data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
}

/**
 * Get my recent commits
 */
export async function getMyRecentCommits(): Promise<Commit[]> {
  try {
    const data = await apiCall<Array<{
      sha: string;
      message: string;
      committedAt: string;
      authorName: string;
      authorProfileUrl?: string;
      analysisStatus?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
      totalScore?: number;
    }>>('/api/users/me/commits/recent');

    return data.map((commit) => ({
      sha: commit.sha,
      message: commit.message,
      author: commit.authorName,
      username: commit.authorName,
      authorName: commit.authorName,
      authorProfileUrl: commit.authorProfileUrl,
      time: commit.committedAt,
      committedAt: commit.committedAt,
      verified: false,
      branch: 'main',
      analysisStatus: commit.analysisStatus,
      totalScore: commit.totalScore,
    }));
  } catch (error) {
    console.error('Error fetching recent commits:', error);
    return [];
  }
}

/**
 * Get my commit heatmap
 */
export async function getMyHeatmap(): Promise<CommitHeatmapResponse[]> {
  try {
    const data = await apiCall<CommitHeatmapResponse[]>('/api/users/me/activities/heatmap');
    return data;
  } catch (error) {
    console.error('Error fetching heatmap:', error);
    return [];
  }
}

/**
 * Logout
 */
export async function logout(): Promise<void> {
  try {
    await apiCall<void>('/api/auth/logout', {
      method: 'POST',
    });
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  } catch (error) {
    console.error('Error logging out:', error);
    // Clear tokens anyway
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
}

/**
 * Refresh token
 */
export async function refreshToken(refreshTokenValue: string): Promise<{ accessToken: string; refreshToken: string }> {
  try {
    const data = await apiCall<{
      grantType: string;
      accessToken: string;
      refreshToken: string;
    }>('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken: refreshTokenValue }),
    });
    
    setAuthToken(data.accessToken);
    if (typeof window !== 'undefined') {
      localStorage.setItem('refreshToken', data.refreshToken);
    }
    
    return { accessToken: data.accessToken, refreshToken: data.refreshToken };
  } catch (error) {
    console.error('Error refreshing token:', error);
    throw error;
  }
}

// Export token management functions
export { getAuthToken, setAuthToken };
