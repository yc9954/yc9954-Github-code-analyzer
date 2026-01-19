import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ owner: string; repo: string }> }
) {
  try {
    const { owner, repo } = await params;
    const searchParams = request.nextUrl.searchParams;
    const branch = searchParams.get('branch') || 'main';
    const perPage = parseInt(searchParams.get('per_page') || '30');
    const page = parseInt(searchParams.get('page') || '1');

    if (!owner || !repo) {
      return NextResponse.json(
        { error: 'Owner and repo parameters are required' },
        { status: 400 }
      );
    }

    // GitHub API를 사용하여 커밋 목록 가져오기
    const githubUrl = new URL(`https://api.github.com/repos/${owner}/${repo}/commits`);
    githubUrl.searchParams.set('sha', branch);
    githubUrl.searchParams.set('per_page', perPage.toString());
    githubUrl.searchParams.set('page', page.toString());

    const response = await fetch(githubUrl.toString(), {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        // 실제 사용 시에는 GitHub Personal Access Token을 환경 변수로 설정
        // 'Authorization': `token ${process.env.GITHUB_TOKEN}`,
      },
    });

    if (!response.ok) {
      if (response.status === 404 || response.status === 403) {
        return NextResponse.json({
          commits: [],
        });
      }
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const commits = await response.json();

    // 커밋 정보를 필요한 형식으로 변환
    const formattedCommits = commits.map((commit: any) => {
      const commitDate = new Date(commit.commit.author.date);
      const now = new Date();
      const diffMs = now.getTime() - commitDate.getTime();
      const diffMinutes = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);

      let timeAgo = 'Unknown';
      if (diffMinutes < 1) {
        timeAgo = 'Just now';
      } else if (diffMinutes < 60) {
        timeAgo = `${diffMinutes}m ago`;
      } else if (diffHours < 24) {
        timeAgo = `${diffHours}h ago`;
      } else if (diffDays === 1) {
        timeAgo = '1 day ago';
      } else if (diffDays < 7) {
        timeAgo = `${diffDays} days ago`;
      } else {
        const diffWeeks = Math.floor(diffDays / 7);
        timeAgo = `${diffWeeks}w ago`;
      }

      // Verified 상태 확인 (GPG 서명 여부)
      const verified = commit.commit.verification?.verified || false;

      return {
        sha: commit.sha,
        message: commit.commit.message.split('\n')[0], // 첫 번째 줄만 (제목)
        author: commit.commit.author.name,
        username: commit.author?.login || commit.commit.author.name.toLowerCase().replace(/\s+/g, ''),
        time: timeAgo,
        verified,
        branch: branch,
        avatar: commit.author?.avatar_url,
        additions: commit.stats?.additions || 0,
        deletions: commit.stats?.deletions || 0,
        files: commit.files?.length || 0,
      };
    });

    return NextResponse.json({
      commits: formattedCommits,
    });
  } catch (error: any) {
    console.error('Error fetching commits:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error', commits: [] },
      { status: 500 }
    );
  }
}
