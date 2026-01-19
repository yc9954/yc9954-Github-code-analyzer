// API configuration for Next.js backend
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

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
}

export interface Branch {
  name: string;
  commits: number;
  lastCommit: string;
}

export interface User {
  id: string;
  login: string;
  avatar: string;
  type: string;
  url: string;
}

export interface SearchResponse {
  repositories?: Repository[];
  users?: User[];
  total: number;
  queryTime: number;
  page?: number;
  perPage?: number;
  totalPages?: number;
}

// Search repositories or users
export async function searchRepositories(
  query: string,
  language?: string,
  sort: 'best-match' | 'stars' | 'updated' = 'best-match',
  type: 'repositories' | 'users' = 'repositories',
  page: number = 1,
  perPage: number = 20
): Promise<SearchResponse> {
  try {
    const params = new URLSearchParams({
      q: query,
      type,
      ...(language && { language }),
      ...(sort && { sort }),
      page: page.toString(),
      per_page: perPage.toString(),
    });

    const response = await fetch(`${API_BASE_URL}/search?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error('Failed to search');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching:', error);
    // Fallback to empty results
    return {
      repositories: type === 'repositories' ? [] : undefined,
      users: type === 'users' ? [] : undefined,
      total: 0,
      queryTime: 0,
      page: 1,
      perPage: 20,
      totalPages: 0,
    };
  }
}

// Get repository branches
export async function getRepositoryBranches(
  owner: string,
  repo: string
): Promise<Branch[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/repositories/${owner}/${repo}/branches`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch branches');
    }

    const data = await response.json();
    return data.branches || [];
  } catch (error) {
    console.error('Error fetching branches:', error);
    // Fallback to default branch
    return [
      { name: 'main', commits: 0, lastCommit: 'Unknown' },
    ];
  }
}

// Get user repositories (for repository selection)
export async function getUserRepositories(): Promise<Repository[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/repositories`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch repositories');
    }

    const data = await response.json();
    return data.repositories || [];
  } catch (error) {
    console.error('Error fetching user repositories:', error);
    return [];
  }
}

export interface Commit {
  sha: string;
  message: string;
  author: string;
  username: string;
  time: string;
  verified: boolean;
  branch: string;
  avatar?: string;
  additions?: number;
  deletions?: number;
  files?: number;
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

// Get repository commits
export async function getRepositoryCommits(
  owner: string,
  repo: string,
  branch: string = 'main',
  page: number = 1,
  perPage: number = 20
): Promise<Commit[]> {
  try {
    const params = new URLSearchParams({
      branch,
      page: page.toString(),
      per_page: perPage.toString(),
    });

    const response = await fetch(`${API_BASE_URL}/repositories/${owner}/${repo}/commits?${params.toString()}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Failed to fetch commits:', response.status, errorText);
      throw new Error('Failed to fetch commits');
    }

    const data = await response.json();
    console.log('Commits API response:', data);
    console.log('Commits array:', data.commits);
    console.log('Commits count:', data.commits?.length || 0);
    
    if (!data.commits) {
      console.warn('No commits property in response:', data);
    }
    
    return data.commits || [];
  } catch (error) {
    console.error('Error fetching commits:', error);
    return [];
  }
}

// Send chat message to GPT API
export async function sendChatMessage(
  messages: ChatMessage[],
  commits?: Commit[],
  selectedCommit?: string
): Promise<ChatResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages,
        commits,
        selectedCommit,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || errorData.details || `HTTP ${response.status}: ${response.statusText}`;
      console.error('Chat API error:', errorData);
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('Error sending chat message:', error);
    // 네트워크 에러인 경우 더 명확한 메시지 제공
    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
      throw new Error('서버에 연결할 수 없습니다. 서버가 실행 중인지 확인해주세요.');
    }
    throw error;
  }
}
