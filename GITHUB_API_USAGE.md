# GitHub API Integration Guide

## Overview

이 프로젝트는 GitHub REST API를 통합하여 실제 저장소 데이터를 가져옵니다.

## Quick Start

### 1. GitHub Personal Access Token 생성

1. GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. "Generate new token (classic)" 클릭
3. 필요한 권한 선택:
   - `repo` (전체 저장소 접근)
   - `read:user` (사용자 정보 읽기)
4. 토큰 생성 및 복사 (한 번만 표시됩니다!)

### 2. 애플리케이션에서 토큰 설정

Settings 페이지에서 토큰을 입력하거나, 브라우저 콘솔에서:

```javascript
localStorage.setItem('github_token', 'your_github_token_here');
localStorage.setItem('github_username', 'your_github_username');
```

### 3. 토큰 없이 사용 (제한적)

토큰 없이도 공개 저장소에 대해 제한된 요청을 할 수 있습니다:
- 시간당 60개 요청으로 제한
- 인증된 요청은 시간당 5,000개 요청

## 사용 방법

### GitHubService 직접 사용

```typescript
import { githubService } from '@/services/github';

// 토큰 설정 (선택사항)
githubService.setToken('your_token_here');

// 사용자 저장소 가져오기
const repos = await githubService.getUserRepositories('octocat');

// 커밋 가져오기
const commits = await githubService.getCommits('owner', 'repo', 'main');

// 단일 커밋 상세 정보
const commit = await githubService.getCommit('owner', 'repo', 'sha');

// 브랜치 목록
const branches = await githubService.getBranches('owner', 'repo');

// 기여자 목록
const contributors = await githubService.getContributors('owner', 'repo');

// 언어 통계
const languages = await githubService.getLanguages('owner', 'repo');
```

### React Hooks 사용 (권장)

```typescript
import {
  useUserRepositories,
  useCommits,
  useBranches
} from '@/hooks/useGitHub';

function MyComponent() {
  // 사용자 저장소
  const { data: repos, loading, error } = useUserRepositories('octocat');

  // 커밋 목록
  const { data: commits, loading, error, refresh } = useCommits('owner', 'repo', 'main');

  // 브랜치 목록
  const { data: branches, loading, error } = useBranches('owner', 'repo');

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {repos?.map(repo => (
        <div key={repo.id}>{repo.name}</div>
      ))}
    </div>
  );
}
```

### Context 사용

```typescript
import { useGitHubContext } from '@/contexts/GitHubContext';

function SettingsComponent() {
  const { token, setToken, username, setUsername, isAuthenticated } = useGitHubContext();

  const handleSave = () => {
    setToken('your_token_here');
    setUsername('your_username');
  };

  return (
    <div>
      {isAuthenticated ? (
        <p>Authenticated as {username}</p>
      ) : (
        <p>Not authenticated</p>
      )}
    </div>
  );
}
```

## API Types

### GitHubRepository
```typescript
interface GitHubRepository {
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
```

### GitHubCommit
```typescript
interface GitHubCommit {
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
```

## 예제: CommitsPage 업데이트

```typescript
import { useState } from 'react';
import { useCommits } from '@/hooks/useGitHub';
import { useGitHubContext } from '@/contexts/GitHubContext';

export function CommitsPage() {
  const { username } = useGitHubContext();
  const [selectedRepo, setSelectedRepo] = useState('web-dashboard');
  const [branch, setBranch] = useState('main');

  const { data: commits, loading, error } = useCommits(
    username,
    selectedRepo,
    branch
  );

  if (loading) return <div>Loading commits...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {commits?.map((commit) => (
        <div key={commit.sha}>
          <h3>{commit.commit.message}</h3>
          <p>{commit.commit.author.name} - {commit.commit.author.date}</p>
        </div>
      ))}
    </div>
  );
}
```

## Rate Limits

GitHub API에는 요청 제한이 있습니다:

- **인증 없음**: 시간당 60개 요청
- **인증 있음**: 시간당 5,000개 요청

현재 rate limit 확인:
```typescript
const response = await fetch('https://api.github.com/rate_limit', {
  headers: { 'Authorization': `Bearer ${token}` }
});
const data = await response.json();
console.log(data);
```

## Troubleshooting

### "API rate limit exceeded" 오류
- 토큰을 사용하여 인증하세요
- 요청 수를 줄이세요
- 캐싱을 구현하세요

### "Bad credentials" 오류
- 토큰이 유효한지 확인하세요
- 토큰이 만료되지 않았는지 확인하세요
- 필요한 권한이 있는지 확인하세요

### CORS 오류
- GitHub API는 CORS를 지원합니다
- 프록시 서버가 필요하지 않습니다

## Next Steps

1. ✅ GitHub API 서비스 레이어 구축
2. ✅ React Hooks 생성
3. ✅ Context Provider 추가
4. 🔄 페이지에서 실제 데이터 사용
5. ⏳ 에러 핸들링 개선
6. ⏳ 로딩 상태 UI 개선
7. ⏳ 캐싱 구현
8. ⏳ OAuth 인증 구현

## Resources

- [GitHub REST API 문서](https://docs.github.com/en/rest)
- [GitHub API Rate Limits](https://docs.github.com/en/rest/overview/resources-in-the-rest-api#rate-limiting)
- [Personal Access Tokens](https://github.com/settings/tokens)
