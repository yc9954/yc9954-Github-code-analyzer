// API configuration for backend
const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'https://api.sprintgit.com';

// Token management
const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('accessToken');
};

const setAuthToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem('accessToken', token);
};

// Flag to prevent recursive refresh and infinite loops
let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

const subscribeTokenRefresh = (cb: (token: string) => void) => {
  refreshSubscribers.push(cb);
};

const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach(cb => cb(token));
  refreshSubscribers = [];
};

const onTokenRefreshFailed = () => {
  refreshSubscribers = [];
  isRefreshing = false;
};

// Rate Limit State
let currentRateLimit = {
  limit: 5000,
  remaining: 5000,
  reset: Date.now() + 3600000,
};

export const getRateLimit = () => currentRateLimit;

// Helper function to make authenticated API calls
// Health Check Function
export async function checkHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    if (response.ok) {
      const data = await response.json();
      return (data.status === 'success' || data.status === 200);
    }
    return false;
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
}

// Helper function to make authenticated API calls with Retry and Health Check
async function apiCall<T>(
  endpoint: string,
  options: RequestInit = {},
  retries = 5,
  delay = 1000
): Promise<T> {
  const token = getAuthToken();
  const isRefreshEndpoint = endpoint.includes('/api/auth/refresh');
  const isHealthEndpoint = endpoint.includes('/api/health');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  // Don't send the expired access token to the refresh endpoint or health check
  if (token && !isRefreshEndpoint && !isHealthEndpoint) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  console.log(`[apiCall] Requesting ${endpoint} (Attempts left: ${retries})`, { headers });

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Capture Rate Limit Headers
    const limit = response.headers.get('X-RateLimit-Limit');
    const remaining = response.headers.get('X-RateLimit-Remaining');
    const reset = response.headers.get('X-RateLimit-Reset');

    if (limit && remaining && reset) {
      currentRateLimit = {
        limit: parseInt(limit, 10),
        remaining: parseInt(remaining, 10),
        reset: parseInt(reset, 10) * 1000,
      };
    }

    if (!response.ok) {
      // 401 Unauthorized handling (Refresh Token Logic) - Do NOT retry this loop
      if (response.status === 401 && !isRefreshEndpoint) {
        const refreshTokenValue = localStorage.getItem('refreshToken');

        if (!refreshTokenValue) {
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          if (typeof window !== 'undefined') window.location.href = '/login';
          throw new Error('인증이 만료되었습니다. 다시 로그인해주세요.');
        }

        if (!isRefreshing) {
          isRefreshing = true;
          try {
            console.log('Token expired, attempting refresh...');
            const newTokens = await refreshToken(refreshTokenValue);
            isRefreshing = false;
            onTokenRefreshed(newTokens.accessToken);
          } catch (error) {
            console.error('Refresh failed, logging out');
            onTokenRefreshFailed();
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            if (typeof window !== 'undefined') window.location.href = '/login';
            throw new Error('세션이 만료되었습니다. 다시 로그인해주세요.');
          }
        }

        return new Promise<T>((resolve, reject) => {
          const timeout = setTimeout(() => {
            if (typeof window !== 'undefined') window.location.href = '/login';
            reject(new Error('인증 토큰 갱신 시간 초과'));
          }, 15000);

          subscribeTokenRefresh(async (newToken: string) => {
            clearTimeout(timeout);
            try {
              // Retry the call ONCE with new token, do not recurse deeply
              headers['Authorization'] = `Bearer ${newToken}`;
              const retryResponse = await fetch(`${API_BASE_URL}${endpoint}`, {
                ...options,
                headers,
              });
              if (!retryResponse.ok) {
                if (retryResponse.status === 401) {
                  if (typeof window !== 'undefined') window.location.href = '/login';
                }
                const retryError = await retryResponse.json().catch(() => ({}));
                throw new Error(retryError.message || `Retry failed with status: ${retryResponse.status}`);
              }
              const data = await retryResponse.json();
              if (data.status === 'success' || (data.status && data.data !== undefined)) {
                resolve(data.data as T);
              } else {
                resolve(data as T);
              }
            } catch (err) {
              reject(err);
            }
          });
        });
      }

      // If 5xx error or other error, fallback to normal error handling in this iteration
      // Check if we should retry based on status code (only for 5xx or network errors)
      if (response.status >= 500 && retries > 0) {
        throw new Error(`Server error: ${response.status}`); // Throw to catch block for retry
      }

      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const status = data.status?.toLowerCase();
    if ((status === 'success' || status === 'ok') && data.data !== undefined) {
      return data.data as T;
    }
    return data as T;

  } catch (error: any) {
    // Retry Logic
    if (retries > 0 && !isRefreshEndpoint && !isHealthEndpoint) {
      console.warn(`[apiCall] Request failed, retrying in ${delay}ms...`, error);
      await new Promise(res => setTimeout(res, delay));
      return apiCall<T>(endpoint, options, retries - 1, delay * 1.5); // Exponential backoff
    }

    // After all retries failed, check Server Health
    if (!isHealthEndpoint && !isRefreshEndpoint) {
      console.error("All retries failed. Checking system health...");
      // const isHealthy = await checkHealth();
      // if (!isHealthy) {
      //   console.error("System is unhealthy. Redirecting to server-error.");
      //   window.location.href = '/server-error'; // Force redirect
      //   // Throwing a promise validation error to stop further execution flow in UI
      //   throw new Error("System Unavailable");
      // }
    }

    throw error;
  }
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
  isPrivate?: boolean;
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

export interface TeamRepo {
  id: string;
  reponame: string;
  repoUrl: string;
  description: string;
  language: string;
  size: number;
  stars: number;
  topics: string[];
  createdAt: string;
  updatedAt: string;
  pushedAt: string;
  lastSyncAt: string;
  languages: Record<string, number>;
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
  analysisStatus?: 'PENDING' | 'IN_PROGRESS' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
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

export interface CommitAnalysis {
  sha: string;
  message: string;
  committedAt: string;
  authorName: string;
  analysisStatus: 'PENDING' | 'IN_PROGRESS' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
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

export type AnalysisStatus = 'PENDING' | 'IN_PROGRESS' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface RepoMetrics {
  commitCount: number;
  averageScore: number;
  totalScore: number;
}

// ==================== API Functions ====================

/**
 * Search repositories, users, teams, sprints, or commits
 */
export async function searchRepositories(
  query: string,
  language?: string,
  sort: 'best-match' | 'stars' | 'updated' = 'best-match',
  type: 'repositories' | 'users' | 'teams' | 'sprints' | 'ALL' = 'ALL',
  page: number = 1,
  perPage: number = 20
): Promise<SearchResponse> {
  try {
    const params = new URLSearchParams({
      q: query,
      page: page.toString(),
      per_page: perPage.toString(),
    });

    if (language) {
      params.set('language', language);
    }

    if (sort !== 'best-match') {
      params.set('sort', sort);
    }

    // Map type to backend type
    let backendType = 'ALL';
    if (type === 'repositories') backendType = 'REPOSITORY';
    else if (type === 'users') backendType = 'USER';
    else if (type === 'teams') backendType = 'TEAM';
    else if (type === 'sprints') backendType = 'SPRINT';

    if (backendType !== 'ALL') {
      params.set('type', backendType);
    }

    const data = await apiCall<{
      users?: Array<{ id: number; username: string; profileUrl: string }>;
      repositories?: Array<{ id: string; reponame: string; description?: string }>;
      teams?: Array<{ id: string; name: string; description?: string }>;
      sprints?: Array<{ id: string; name: string; description?: string }>;
      commits?: Array<{ sha: string; message: string; repoId: string; repoName: string; authorName: string; committedAt: string }>;
      total?: number;
      totalPages?: number;
    }>(`/api/search?${params.toString()}`);

    // Transform backend response to frontend format
    const repositories = data.repositories?.map((repo) => {
      const nameParts = repo.reponame.split('/');
      const owner = nameParts.length > 1 ? nameParts[0] : '';
      const name = nameParts.length > 1 ? nameParts[1] : repo.reponame;
      return {
        id: repo.id,
        owner,
        name,
        fullName: repo.reponame,
        description: repo.description,
        stars: 0,
        updated: new Date().toISOString(),
        language: language || 'Unknown', // Backend might not return language yet, use filter or default
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
      teams: data.teams,
      sprints: data.sprints,
      // If backend provides totals, use them. Otherwise fallback to current page length (inaccurate but safer than nothing)
      total: data.total || (repositories.length + users.length + (data.teams?.length || 0) + (data.sprints?.length || 0)),
      queryTime: 0,
      page,
      perPage,
      totalPages: data.totalPages || Math.ceil((repositories.length + users.length + (data.teams?.length || 0) + (data.sprints?.length || 0)) / perPage) || 1,
    };
  } catch (error) {
    console.error('Error searching:', error);
    throw error;
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
    throw error;
  }
}

/**
 * Get repository branches
 */
export async function getRepositoryBranches(
  repoId: string
): Promise<Branch[]> {
  try {
    // repoId is the actual DB ID (e.g., "R_kgDOHpMnag")
    const data = await apiCall<Array<{
      name: string;
      lastCommitSha: string;
      commitCount: number;
    }>>(`/api/repos/${encodeURIComponent(repoId)}/branches`);

    if (!Array.isArray(data)) {
      console.warn('Branches response is not an array:', data);
      return [{ name: 'main', commits: 0, lastCommit: 'Unknown' }];
    }

    return data.map((branch: any) => ({
      name: branch.name,
      commits: branch.commitCount || 0,
      lastCommit: branch.lastCommitSha || 'Unknown',
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
  repoId: string,
  branch: string = 'main',
  page: number = 1,
  perPage: number = 20
): Promise<Commit[]> {
  try {
    // repoId is the actual DB ID
    const data = await apiCall<Array<{
      sha: string;
      message: string;
      committedAt: string;
      authorName: string;
      authorProfileUrl?: string;
      analysisStatus?: 'PENDING' | 'IN_PROGRESS' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
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
  repoId: string,
  sha: string
): Promise<CommitAnalysis | null> {
  try {
    const data = await apiCall<CommitAnalysis>(
      `/api/repos/${repoId}/commits/${sha}/analysis`
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
    const payload = {
      messages,
      commits,
      selectedCommit,
      owner,
      repo
    };

    return await apiCall('/api/chat', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  } catch (error: any) {
    console.error('Error sending chat message:', error);
    throw error;
  }
}

// ==================== Repository Sync API ====================

/**
 * Trigger repository sync
 */
export async function syncRepository(repoId: string): Promise<void> {
  try {
    await apiCall(`/api/repos/${encodeURIComponent(repoId)}/sync`, {
      method: 'POST',
    });
    console.log(`Sync triggered for ${repoId}`);
  } catch (error) {
    console.error(`Error syncing repository ${repoId}:`, error);
  }
}

/**
 * Get repository metrics
 */
export async function getRepoMetrics(repoId: string): Promise<RepoMetrics | null> {
  try {
    // repoId corresponds to 'reponame' (owner/repo) from TeamRepo
    // We encode it because the backend route is /api/repos/[...repoId]/metrics
    // But we need to pass it properly.
    // Frontend route: /api/repos/owner/repo/metrics
    // encodeURIComponent(repoId) would enable passing slashes in one segment if the backend expects it.
    // However, the Next.js catch-all route [...repoId] will capture 'owner/repo' as ['owner', 'repo'].
    // So we can just pass the path.
    const data = await apiCall<RepoMetrics>(`/api/repos/${repoId}/metrics`);
    return data;
  } catch (error) {
    console.error(`Error fetching metrics for ${repoId}:`, error);
    return null;
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
    const data = await apiCall<{
      content: Array<{
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
      }>;
      hasNext: boolean;
    }>('/api/sprints');

    // Extract content array from paginated response
    const sprints = data.content || [];

    return sprints.map((sprint) => ({
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
    throw error;
  }
}

/**
 * Get a single sprint by ID
 */
export async function getSprint(sprintId: string): Promise<Sprint> {
  try {
    const data = await apiCall<{
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
    }>(`/api/sprints/${sprintId}`);

    return {
      id: data.id,
      name: data.name,
      startDate: data.startDate,
      endDate: data.endDate,
      description: data.description,
      managerName: data.managerName,
      isPrivate: data.isPrivate,
      isOpen: data.isOpen,
      teamsCount: data.teamsCount,
      participantsCount: data.participantsCount,
      status: data.status,
    };
  } catch (error) {
    console.error(`Error fetching sprint ${sprintId}:`, error);
    throw error;
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
 * Create a new sprint
 */
export async function createSprint(data: {
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  isPrivate: boolean;
  isOpen: boolean;
  managerId: number;
}): Promise<string> {
  try {
    const result = await apiCall<string>('/api/sprints', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return result;
  } catch (error) {
    console.error('Error creating sprint:', error);
    throw error;
  }
}

/**
 * Register for a sprint
 */
export async function registerSprint(
  sprintId: string,
  data: { teamId: string; repoId: string }
): Promise<void> {
  try {
    await apiCall(`/api/sprints/${sprintId}/registration`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error('Error registering for sprint:', error);
    throw error;
  }
}

/**
 * Get sprint rankings
 */
export async function getSprintRankings(
  sprintId: string,
  type: 'TEAM' | 'INDIVIDUAL' = 'TEAM' // Note: New API might only support INDIVIDUAL (users) based on curl? Keeping signature for now.
): Promise<SprintRanking[]> {
  try {
    // Current user request strictly asks for: api/rankings/users?scope=SPRINT&id=...
    // We will use type to decide if we call this new endpoint (for individual) or keep old one (for team).
    // Or, if user implies this IS the ranking API now.
    // Let's assume 'INDIVIDUAL' maps to this new endpoint.

    if (type === 'INDIVIDUAL') {
      const response = await apiCall<{
        status: string;
        message: string;
        data: Array<{
          profileUrl: string;
          rank: number;
          totalScore: number;
          username: string;
        }>;
      }>(`/api/rankings/users?scope=SPRINT&id=${sprintId}&period=ALL&limit=10`);

      if (!response.data || !Array.isArray(response.data)) {
        return [];
      }

      return response.data.map(item => ({
        rank: item.rank,
        user: {
          userId: 0, // Not provided in new response
          username: item.username,
          profileUrl: item.profileUrl,
          score: item.totalScore,
          commits: 0 // Not provided
        }
      }));
    } else {
      // Updated TEAM ranking logic based on user provided curl/response
      // API call returns the unwrapped array (data.data) because of the wrapper logic in apiCall
      const response = await apiCall<Array<{
        rank: number;
        teamName: string;
        name?: string; // Some apis might return name
        teamId?: string;
        score: number;
        commits: number;
        memberCount: number;
        members?: number;
      }>>(`/api/sprints/${sprintId}/ranking?type=TEAM`);

      if (!response || !Array.isArray(response)) {
        console.warn('Sprint metrics response is not an array:', response);
        return [];
      }

      return response.map((item) => ({
        rank: item.rank,
        team: {
          teamId: item.teamId || "unknown",
          name: item.teamName || item.name || "Unknown Team",
          score: item.score || 0,
          commits: item.commits || 0,
          members: item.memberCount || item.members || 0
        },
      }));
    }

  } catch (error) {
    console.error('Error fetching sprint rankings:', error);
    return [];
  }
}

/**
 * Update sprint information (Manager only)
 */
export async function updateSprint(
  sprintId: string,
  data: {
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    isPrivate: boolean;
    isOpen: boolean;
    managerId: number;
  }
): Promise<void> {
  try {
    await apiCall(`/api/sprints/${sprintId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  } catch (error) {
    console.error('Error updating sprint:', error);
    throw error;
  }
}

/**
 * Ban a team from a sprint (Manager only)
 */
export async function banTeam(sprintId: string, teamId: string): Promise<void> {
  try {
    await apiCall(`/api/sprints/${sprintId}/ban`, {
      method: 'POST',
      body: JSON.stringify({ teamId }),
    });
  } catch (error) {
    console.error('Error banning team:', error);
    throw error;
  }
}

/**
 * Approve or reject a team registration (Manager only)
 */
export async function approveTeam(
  sprintId: string,
  teamId: string,
  approve: boolean
): Promise<void> {
  try {
    await apiCall(`/api/sprints/${sprintId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ teamId, approve }),
    });
  } catch (error) {
    console.error('Error approving/rejecting team:', error);
    throw error;
  }
}

/**
 * Get sprint basic info
 */
export async function getSprintInfo(sprintId: string): Promise<{
  sprintId: string;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
  open: boolean;
  private: boolean;
}> {
  try {
    return await apiCall(`/api/sprints/${encodeURIComponent(sprintId)}/info`);
  } catch (error) {
    console.error('Error fetching sprint info:', error);
    throw error;
  }
}

/**
 * Register team for sprint
 */
export async function registerTeamForSprint(
  sprintId: string,
  teamId: string,
  repoId: string
): Promise<{
  sprintId: string;
  teamId: string;
  repoId: string;
  status: string;
  webhookUrl?: string;
  webhookSent?: boolean;
  webhookError?: string;
}> {
  try {
    return await apiCall(`/api/sprints/${encodeURIComponent(sprintId)}/registration`, {
      method: 'POST',
      body: JSON.stringify({ teamId, repoId }),
    });
  } catch (error) {
    console.error('Error registering team for sprint:', error);
    throw error;
  }
}

export interface SprintRegistration {
  teamId: string;
  teamName: string;
  repoId: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'BANNED';
  registeredAt: string;
}

/**
 * Get all registrations for a sprint (Manager only)
 */
export async function getSprintRegistrations(sprintId: string): Promise<SprintRegistration[]> {
  try {
    const data = await apiCall<SprintRegistration[]>(`/api/sprints/${sprintId}/registrations`);
    return data;
  } catch (error) {
    console.error('Error fetching sprint registrations:', error);
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

// ==================== Notification API ====================

export interface Notification {
  id: number;
  type: 'ANALYSIS_COMPLETED' | 'ANALYSIS_FAILED' | 'TEAM_INVITE' | 'SPRINT_ALERT';
  message: string;
  createdAt: string;
  read: boolean;
}

/**
 * Get notifications
 */
export async function getNotifications(): Promise<Notification[]> {
  try {
    const data = await apiCall<Notification[]>('/api/notifications');
    return data;
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return [];
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(id: number): Promise<void> {
  try {
    await apiCall(`/api/notifications/${id}/read`, {
      method: 'PUT',
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
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
// Profile with stats
export interface UserProfileResponse {
  username: string;
  profileUrl: string;
  totalCommits: number;
  totalScore: number;
  participatingSprints: Array<{
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    description: string;
    managerName: string;
    isPrivate: boolean;
    isOpen: boolean;
    teamsCount: number;
    participantsCount: number;
    status: 'active' | 'completed';
  }>;
}

export async function getUserProfile(username: string): Promise<UserProfileResponse> {
  const data = await apiCall<UserProfileResponse>(`/api/users/${username}/profile`);
  return data;
}

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

    return data
      .map((commit) => ({
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
      }))
      .filter(commit => !commit.message.includes('/actuator/prometheus'));

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

// ==================== Team API ====================

export interface PageResponse<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number;
}


export interface TeamCreateRequest {
  name: string;
  description: string;
  leaderId: number;
  isPublic: boolean;
}

export interface TeamUpdateRequest {
  name: string;
  description: string;
  isPublic?: boolean;
}

export interface TeamDetailResponse {
  teamId: string;
  name: string;
  description: string;
  leaderUsername: string;
  leaderProfileUrl: string;
  isPublic: boolean;
  joinCode: string;
  memberCount?: number;
}

export interface TeamMemberResponse {
  userId: number;
  username: string;
  profileUrl?: string; // Add profileUrl
  role: string;
  status: string;
  inTeamRank: number;
  commitCount: number;
  contributionScore: number;
}

export interface TeamRepo {
  id: string;
  reponame: string;
  repoUrl: string;
  description: string;
  language: string;
  size: number;
  stars: number;
  topics: string[];
  createdAt: string;
  updatedAt: string;
  pushedAt: string;
  lastSyncAt: string;
  languages: Record<string, number>;
}

export interface Team {
  id: string; // ID from search is string
  name: string;
  description: string;
  isPublic?: boolean;
}

// Create Team
export async function createTeam(data: TeamCreateRequest): Promise<TeamDetailResponse> {
  try {
    const result = await apiCall<TeamDetailResponse>('/api/teams', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return result;
  } catch (error) {
    console.error('Error creating team:', error);
    throw error;
  }
}

// Get Team List (using Search for now as there is no list all teams endpoint)
export async function getTeams(query: string = ""): Promise<Team[]> {
  const result = await searchRepositories(query, undefined, undefined, 'teams');
  return result.teams || [];
}

// Get Team Detail
export async function getTeam(teamId: string): Promise<TeamDetailResponse> {
  return apiCall<TeamDetailResponse>(`/api/teams/${teamId}`);
}

// Get My Teams (Active/Approved)
export async function getMyTeams(): Promise<TeamDetailResponse[]> {
  return apiCall<TeamDetailResponse[]>('/api/teams/my');
}

// Get My Pending Teams
export async function getMyPendingTeams(): Promise<TeamDetailResponse[]> {
  return apiCall<TeamDetailResponse[]>('/api/teams/my?status=PENDING');
}

// Get Leader Teams
export async function getLeaderTeams(): Promise<TeamDetailResponse[]> {
  return apiCall<TeamDetailResponse[]>('/api/teams/leader');
}

// Get Public Teams (Paginated)
export async function getPublicTeams(page: number = 0, size: number = 10): Promise<PageResponse<TeamDetailResponse>> {
  return apiCall<PageResponse<TeamDetailResponse>>(`/api/teams/public?page=${page}&size=${size}`);
}

// Update Team
export async function updateTeam(teamId: string, data: TeamUpdateRequest): Promise<void> {
  await apiCall(`/api/teams/${teamId}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

// Join Team
export async function joinTeam(teamId: string): Promise<TeamMemberResponse> {
  const url = `/api/teams/${teamId}/join`;
  return apiCall<TeamMemberResponse>(url, {
    method: 'POST',
  });
}

// Approve Member
export async function approveMember(teamId: string, userId: number): Promise<void> {
  await apiCall(`/api/teams/${teamId}/approve?userId=${userId}`, {
    method: 'POST',
  });
}

// Remove Member (Kick)
export async function removeMember(teamId: string, userId: number): Promise<void> {
  await apiCall(`/api/teams/${teamId}/members/${userId}`, {
    method: 'DELETE',
  });
}

// Get Team Members
export async function getTeamMembers(teamId: string): Promise<TeamMemberResponse[]> {
  return apiCall<TeamMemberResponse[]>(`/api/teams/${teamId}/members`);
}

/**
 * Get available repositories for a team
 */
export async function getAvailableTeamRepos(teamId: string): Promise<TeamRepo[]> {
  try {
    const data = await apiCall<{ data: TeamRepo[] } | TeamRepo[]>(`/api/teams/${teamId}/repos/available`);
    // Handle both wrapped and unwrapped responses if necessary, but apiCall handles 'data' key mainly.
    // If apiCall unwraps 'data', then 'data' variable holds the array.
    // However, the Swagger says response is { status, message, data: [...] }.
    // My apiCall implementation (lines 147-152) checks for 'data' property and returns it if present.
    // So 'data' here should be TeamRepo[] directly.
    return data as TeamRepo[];
  } catch (error) {
    console.error('Error fetching available team repos:', error);
    throw error;
  }
}


export interface CommitActivity {
  sha: string;
  message: string;
  committedAt: string;
  authorName: string;
  authorProfileUrl?: string;
  analysisStatus: 'PENDING' | 'IN_PROGRESS' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  totalScore: number;
}

export async function getRepositoryCommitActivities(repoId: string): Promise<CommitActivity[]> {
  try {
    const data = await apiCall<{ data: CommitActivity[] } | CommitActivity[]>(`/api/repos/${repoId}/commits/activities`);
    if (Array.isArray(data)) {
      return data;
    }
    // Handle wrapped response
    if (data && 'data' in data && Array.isArray((data as any).data)) {
      return (data as any).data;
    }
    return [];
  } catch (error) {
    console.error('Error fetching commit activities:', error);
    return [];
  }
}

export async function getCommitAnalysisStatus(repoId: string, sha: string): Promise<AnalysisStatus> {
  const result = await apiCall<{ data: AnalysisStatus } | AnalysisStatus>(`/api/repos/${repoId}/commits/${sha}/status`);
  // Handle wrapper if present
  if (typeof result === 'object' && result !== null && 'data' in result) {
    return (result as any).data;
  }
  return result as AnalysisStatus;
}

// Integrated Search
export interface SearchResult {
  users?: User[];
  repositories?: Repository[];
  teams?: Team[];
  total?: number;
}

export async function searchResources(
  query: string,
  type: 'ALL' | 'USER' | 'REPOSITORY' | 'TEAM' = 'ALL'
): Promise<SearchResult> {
  return apiCall<SearchResult>(`/api/search?q=${encodeURIComponent(query)}&type=${type}`);
}



/**
 * Add a repository to a team
 */
export async function addRepoToTeam(teamId: string, repoId: string): Promise<void> {
  try {
    await apiCall(`/api/teams/${teamId}/repos`, {
      method: 'POST',
      body: JSON.stringify({ repoId }),
    });
  } catch (error) {
    console.error('Error adding repo to team:', error);
    throw error;
  }
}

/**
 * Get team repositories
 */
export async function getTeamRepos(teamId: string): Promise<TeamRepo[]> {
  try {
    const data = await apiCall<{ data: TeamRepo[] } | TeamRepo[]>(`/api/teams/${teamId}/repos`);
    return data as TeamRepo[];
  } catch (error) {
    console.error('Error fetching team repos:', error);
    throw error;
  }
}
/**
 * Withdraw user (Delete Account)
 */
export async function withdrawUser(): Promise<void> {
  try {
    const result = await apiCall<any>('/api/users/me', {
      method: 'DELETE',
    });
    return result;
  } catch (error) {
    console.error('Error withdrawing user:', error);
    throw error;
  }
}
