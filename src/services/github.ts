/**
 * GitHub API Service
 * Provides methods to interact with GitHub REST API
 */

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  owner: {
    login: string;
    avatar_url: string;
  };
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  updated_at: string;
  html_url: string;
  private: boolean;
}

export interface GitHubCommit {
  sha: string;
  commit: {
    author: {
      name: string;
      email: string;
      date: string;
    };
    message: string;
    verification?: {
      verified: boolean;
      reason: string;
    };
  };
  author: {
    login: string;
    avatar_url: string;
  } | null;
  html_url: string;
  stats?: {
    additions: number;
    deletions: number;
    total: number;
  };
}

export interface GitHubBranch {
  name: string;
  commit: {
    sha: string;
    url: string;
  };
  protected: boolean;
}

export interface GitHubContributor {
  login: string;
  id: number;
  avatar_url: string;
  contributions: number;
}

export interface GitHubLanguages {
  [language: string]: number;
}

class GitHubService {
  private baseURL = 'https://api.github.com';
  private token: string | null = null;

  /**
   * Set GitHub personal access token for authenticated requests
   * @param token GitHub personal access token
   */
  setToken(token: string) {
    this.token = token;
  }

  /**
   * Get headers for API requests
   */
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  /**
   * Make a GET request to GitHub API
   */
  private async get<T>(endpoint: string): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get user's repositories
   * @param username GitHub username
   * @param sort Sort by: created, updated, pushed, full_name
   * @param per_page Results per page (max 100)
   */
  async getUserRepositories(
    username: string,
    sort: 'created' | 'updated' | 'pushed' | 'full_name' = 'updated',
    per_page: number = 30
  ): Promise<GitHubRepository[]> {
    return this.get<GitHubRepository[]>(
      `/users/${username}/repos?sort=${sort}&per_page=${per_page}`
    );
  }

  /**
   * Get repository details
   * @param owner Repository owner
   * @param repo Repository name
   */
  async getRepository(owner: string, repo: string): Promise<GitHubRepository> {
    return this.get<GitHubRepository>(`/repos/${owner}/${repo}`);
  }

  /**
   * Get commits for a repository
   * @param owner Repository owner
   * @param repo Repository name
   * @param branch Branch name (default: main)
   * @param per_page Results per page (max 100)
   */
  async getCommits(
    owner: string,
    repo: string,
    branch: string = 'main',
    per_page: number = 30
  ): Promise<GitHubCommit[]> {
    return this.get<GitHubCommit[]>(
      `/repos/${owner}/${repo}/commits?sha=${branch}&per_page=${per_page}`
    );
  }

  /**
   * Get a single commit with detailed stats
   * @param owner Repository owner
   * @param repo Repository name
   * @param sha Commit SHA
   */
  async getCommit(owner: string, repo: string, sha: string): Promise<GitHubCommit> {
    return this.get<GitHubCommit>(`/repos/${owner}/${repo}/commits/${sha}`);
  }

  /**
   * Get branches for a repository
   * @param owner Repository owner
   * @param repo Repository name
   */
  async getBranches(owner: string, repo: string): Promise<GitHubBranch[]> {
    return this.get<GitHubBranch[]>(`/repos/${owner}/${repo}/branches`);
  }

  /**
   * Get contributors for a repository
   * @param owner Repository owner
   * @param repo Repository name
   * @param per_page Results per page (max 100)
   */
  async getContributors(
    owner: string,
    repo: string,
    per_page: number = 30
  ): Promise<GitHubContributor[]> {
    return this.get<GitHubContributor[]>(
      `/repos/${owner}/${repo}/contributors?per_page=${per_page}`
    );
  }

  /**
   * Get languages used in a repository
   * @param owner Repository owner
   * @param repo Repository name
   */
  async getLanguages(owner: string, repo: string): Promise<GitHubLanguages> {
    return this.get<GitHubLanguages>(`/repos/${owner}/${repo}/languages`);
  }

  /**
   * Search repositories
   * @param query Search query
   * @param sort Sort by: stars, forks, updated
   * @param per_page Results per page (max 100)
   */
  async searchRepositories(
    query: string,
    sort: 'stars' | 'forks' | 'updated' = 'stars',
    per_page: number = 30
  ): Promise<{ items: GitHubRepository[] }> {
    return this.get<{ items: GitHubRepository[] }>(
      `/search/repositories?q=${encodeURIComponent(query)}&sort=${sort}&per_page=${per_page}`
    );
  }

  /**
   * Get authenticated user's information (requires token)
   */
  async getAuthenticatedUser(): Promise<{
    login: string;
    id: number;
    avatar_url: string;
    name: string;
    email: string;
    bio: string;
    public_repos: number;
    followers: number;
    following: number;
  }> {
    if (!this.token) {
      throw new Error('GitHub token is required for this operation');
    }
    return this.get('/user');
  }

  /**
   * Format relative time (e.g., "2 hours ago")
   */
  formatRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    if (weeks < 4) return `${weeks}w ago`;
    if (months < 12) return `${months}mo ago`;
    return `${years}y ago`;
  }
}

// Export singleton instance
export const githubService = new GitHubService();
