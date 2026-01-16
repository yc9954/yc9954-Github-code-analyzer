import { useState, useEffect, useCallback } from 'react';
import {
  githubService,
  type GitHubRepository,
  type GitHubCommit,
  type GitHubBranch,
  type GitHubContributor,
  type GitHubLanguages,
} from '@/services/github';

interface UseGitHubState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

/**
 * Hook to fetch user repositories
 */
export function useUserRepositories(username: string | null) {
  const [state, setState] = useState<UseGitHubState<GitHubRepository[]>>({
    data: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (!username) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    let mounted = true;

    const fetchData = async () => {
      setState(prev => ({ ...prev, loading: true, error: null }));
      try {
        const repos = await githubService.getUserRepositories(username);
        if (mounted) {
          setState({ data: repos, loading: false, error: null });
        }
      } catch (error) {
        if (mounted) {
          setState({ data: null, loading: false, error: error as Error });
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [username]);

  return state;
}

/**
 * Hook to fetch repository details
 */
export function useRepository(owner: string | null, repo: string | null) {
  const [state, setState] = useState<UseGitHubState<GitHubRepository>>({
    data: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (!owner || !repo) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    let mounted = true;

    const fetchData = async () => {
      setState(prev => ({ ...prev, loading: true, error: null }));
      try {
        const repository = await githubService.getRepository(owner, repo);
        if (mounted) {
          setState({ data: repository, loading: false, error: null });
        }
      } catch (error) {
        if (mounted) {
          setState({ data: null, loading: false, error: error as Error });
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [owner, repo]);

  return state;
}

/**
 * Hook to fetch commits
 */
export function useCommits(
  owner: string | null,
  repo: string | null,
  branch: string = 'main'
) {
  const [state, setState] = useState<UseGitHubState<GitHubCommit[]>>({
    data: null,
    loading: false,
    error: null,
  });

  const refresh = useCallback(async () => {
    if (!owner || !repo) return;

    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const commits = await githubService.getCommits(owner, repo, branch);
      setState({ data: commits, loading: false, error: null });
    } catch (error) {
      setState({ data: null, loading: false, error: error as Error });
    }
  }, [owner, repo, branch]);

  useEffect(() => {
    if (!owner || !repo) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    refresh();
  }, [owner, repo, branch, refresh]);

  return { ...state, refresh };
}

/**
 * Hook to fetch a single commit
 */
export function useCommit(
  owner: string | null,
  repo: string | null,
  sha: string | null
) {
  const [state, setState] = useState<UseGitHubState<GitHubCommit>>({
    data: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (!owner || !repo || !sha) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    let mounted = true;

    const fetchData = async () => {
      setState(prev => ({ ...prev, loading: true, error: null }));
      try {
        const commit = await githubService.getCommit(owner, repo, sha);
        if (mounted) {
          setState({ data: commit, loading: false, error: null });
        }
      } catch (error) {
        if (mounted) {
          setState({ data: null, loading: false, error: error as Error });
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [owner, repo, sha]);

  return state;
}

/**
 * Hook to fetch branches
 */
export function useBranches(owner: string | null, repo: string | null) {
  const [state, setState] = useState<UseGitHubState<GitHubBranch[]>>({
    data: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (!owner || !repo) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    let mounted = true;

    const fetchData = async () => {
      setState(prev => ({ ...prev, loading: true, error: null }));
      try {
        const branches = await githubService.getBranches(owner, repo);
        if (mounted) {
          setState({ data: branches, loading: false, error: null });
        }
      } catch (error) {
        if (mounted) {
          setState({ data: null, loading: false, error: error as Error });
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [owner, repo]);

  return state;
}

/**
 * Hook to fetch contributors
 */
export function useContributors(owner: string | null, repo: string | null) {
  const [state, setState] = useState<UseGitHubState<GitHubContributor[]>>({
    data: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (!owner || !repo) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    let mounted = true;

    const fetchData = async () => {
      setState(prev => ({ ...prev, loading: true, error: null }));
      try {
        const contributors = await githubService.getContributors(owner, repo);
        if (mounted) {
          setState({ data: contributors, loading: false, error: null });
        }
      } catch (error) {
        if (mounted) {
          setState({ data: null, loading: false, error: error as Error });
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [owner, repo]);

  return state;
}

/**
 * Hook to fetch repository languages
 */
export function useLanguages(owner: string | null, repo: string | null) {
  const [state, setState] = useState<UseGitHubState<GitHubLanguages>>({
    data: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    if (!owner || !repo) {
      setState({ data: null, loading: false, error: null });
      return;
    }

    let mounted = true;

    const fetchData = async () => {
      setState(prev => ({ ...prev, loading: true, error: null }));
      try {
        const languages = await githubService.getLanguages(owner, repo);
        if (mounted) {
          setState({ data: languages, loading: false, error: null });
        }
      } catch (error) {
        if (mounted) {
          setState({ data: null, loading: false, error: error as Error });
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, [owner, repo]);

  return state;
}
