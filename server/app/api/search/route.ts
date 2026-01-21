import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const type = searchParams.get('type') || 'repositories';
    const language = searchParams.get('language');
    const sort = searchParams.get('sort') || 'best-match';
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = Math.min(parseInt(searchParams.get('per_page') || '20'), 20); // 최대 20개로 제한

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required' },
        { status: 400 }
      );
    }

    const githubToken = process.env.GITHUB_TOKEN;
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
    };
    if (githubToken) {
      headers['Authorization'] = `token ${githubToken}`;
    }

    const startTime = Date.now();
    // GitHub API 호출 또는 SprintGit API 호출
    let githubUrl: URL;
    let githubQuery = query;

    // If type is ALL, TEAM, sprint, or explicitly asking for internal resources, proxy to backend
    // We'll treat ALL as an internal integrated search
    if (type === 'ALL' || type === 'TEAM' || type === 'SPRINT') {
      const sprintGitUrl = new URL(`https://api.sprintgit.com/api/search`);
      sprintGitUrl.searchParams.set('q', query);
      sprintGitUrl.searchParams.set('type', type);

      const response = await fetch(sprintGitUrl.toString(), {
        headers: {
          'Accept': 'application/json',
          'Authorization': request.headers.get('Authorization') || '',
        }
      });

      if (!response.ok) {
        // If external search fails, we might want to fallback or return error
        throw new Error(`SprintGit API error: ${response.status}`);
      }

      const result = await response.json();
      const queryTime = Date.now() - startTime;

      // The backend returns { data: { users, repositories, teams } } for type=ALL
      return NextResponse.json({
        ...result.data, // Spread users, repositories, teams
        total: (result.data.users?.length || 0) + (result.data.repositories?.length || 0) + (result.data.teams?.length || 0),
        queryTime,
        page,
        perPage,
        totalPages: 1,
      });
    }

    if (type === 'users') {
      // 유저 검색
      githubUrl = new URL('https://api.github.com/search/users');
      githubUrl.searchParams.set('q', githubQuery);
      githubUrl.searchParams.set('per_page', perPage.toString());
      githubUrl.searchParams.set('page', page.toString());
    } else {
      // 레포지토리 검색
      if (language) {
        githubQuery += ` language:${language}`;
      }
      githubUrl = new URL('https://api.github.com/search/repositories');
      githubUrl.searchParams.set('q', githubQuery);
      githubUrl.searchParams.set('sort', sort === 'best-match' ? '' : sort);
      githubUrl.searchParams.set('order', 'desc');
      githubUrl.searchParams.set('per_page', perPage.toString());
      githubUrl.searchParams.set('page', page.toString());
    }

    const response = await fetch(githubUrl.toString(), { headers });

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status}`);
    }

    const data = await response.json();
    const queryTime = Date.now() - startTime;

    if (type === 'users') {
      // 유저 검색 결과 변환
      const users = data.items.map((item: any) => ({
        id: item.id.toString(),
        login: item.login,
        avatar: item.avatar_url,
        type: item.type,
        url: item.html_url,
      }));

      return NextResponse.json({
        users,
        total: data.total_count,
        queryTime,
        page,
        perPage,
        totalPages: Math.ceil(data.total_count / perPage),
      });
    } else {
      // 레포지토리 검색 결과 변환
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
        page,
        perPage,
        totalPages: Math.ceil(data.total_count / perPage),
      });
    }
  } catch (error: any) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
