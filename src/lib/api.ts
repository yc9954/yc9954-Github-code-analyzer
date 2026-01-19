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

export interface SearchResponse {
  repositories: Repository[];
  total: number;
  queryTime: number;
}

// Search repositories
export async function searchRepositories(
  query: string,
  language?: string,
  sort: 'best-match' | 'stars' | 'updated' = 'best-match'
): Promise<SearchResponse> {
  try {
    const params = new URLSearchParams({
      q: query,
      type: 'repositories',
      ...(language && { language }),
      ...(sort && { sort }),
    });

    const response = await fetch(`${API_BASE_URL}/search?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error('Failed to search repositories');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching repositories:', error);
    // Fallback to empty results
    return {
      repositories: [],
      total: 0,
      queryTime: 0,
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

// Get repository commits
export async function getRepositoryCommits(
  owner: string,
  repo: string,
  branch: string = 'main',
  page: number = 1,
  perPage: number = 30
): Promise<Commit[]> {
  try {
    const params = new URLSearchParams({
      branch,
      page: page.toString(),
      per_page: perPage.toString(),
    });

    const response = await fetch(`${API_BASE_URL}/repositories/${owner}/${repo}/commits?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch commits');
    }

    const data = await response.json();
    return data.commits || [];
  } catch (error) {
    console.error('Error fetching commits:', error);
    return [];
  }
}
