import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const type = searchParams.get('type') || 'repositories';
    const language = searchParams.get('language');
    const sort = searchParams.get('sort') || 'best-match';

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required' },
        { status: 400 }
      );
    }

    // GitHub API를 사용하여 레포지토리 검색
    // 실제로는 인증 토큰이 필요할 수 있습니다
    let githubQuery = query;
    if (language) {
      githubQuery += ` language:${language}`;
    }

    // GitHub API 호출
    const githubUrl = new URL('https://api.github.com/search/repositories');
    githubUrl.searchParams.set('q', githubQuery);
    githubUrl.searchParams.set('sort', sort === 'best-match' ? '' : sort);
    githubUrl.searchParams.set('order', 'desc');
    githubUrl.searchParams.set('per_page', '30');

    const startTime = Date.now();
    const response = await fetch(githubUrl.toString(), {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        // 실제 사용 시에는 GitHub Personal Access Token을 환경 변수로 설정
        // 'Authorization': `token ${process.env.GITHUB_TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();
    const queryTime = Date.now() - startTime;

    // 응답 형식 변환
    const repositories = data.items.map((item: any) => ({
      id: item.id.toString(),
      owner: item.owner.login,
      name: item.name,
      fullName: item.full_name,
      description: item.description || '',
      language: item.language || '',
      stars: item.stargazers_count,
      forks: item.forks_count,
      updated: new Date(item.updated_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      isArchived: item.archived,
    }));

    return NextResponse.json({
      repositories,
      total: data.total_count,
      queryTime,
    });
  } catch (error: any) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
