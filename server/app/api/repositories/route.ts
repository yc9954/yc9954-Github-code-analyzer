import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // 실제로는 인증된 사용자의 레포지토리를 가져와야 합니다
    // 여기서는 예시로 빈 배열을 반환하거나, GitHub API를 사용할 수 있습니다
    
    // GitHub API를 사용하여 사용자 레포지토리 가져오기
    // 실제 사용 시에는 인증 토큰이 필요합니다
    const githubUrl = 'https://api.github.com/user/repos?per_page=100&sort=updated';
    
    // 인증이 필요한 경우 (실제 구현 시)
    // const response = await fetch(githubUrl, {
    //   headers: {
    //     'Authorization': `token ${process.env.GITHUB_TOKEN}`,
    //     'Accept': 'application/vnd.github.v3+json',
    //   },
    // });

    // 현재는 예시 데이터 반환
    // 실제로는 위의 GitHub API 호출 결과를 변환해야 합니다
    const repositories = [
      { id: "1", name: "web-dashboard", owner: "johndoe", fullName: "johndoe/web-dashboard", stars: 234, forks: 45, description: "Web dashboard application" },
      { id: "2", name: "api-server", owner: "johndoe", fullName: "johndoe/api-server", stars: 156, forks: 32, description: "RESTful API server" },
      { id: "3", name: "mobile-app", owner: "johndoe", fullName: "johndoe/mobile-app", stars: 289, forks: 67, description: "Mobile application" },
      { id: "4", name: "data-pipeline", owner: "johndoe", fullName: "johndoe/data-pipeline", stars: 89, forks: 12, description: "Data processing pipeline" },
      { id: "5", name: "auth-service", owner: "johndoe", fullName: "johndoe/auth-service", stars: 145, forks: 23, description: "Authentication service" },
    ];

    return NextResponse.json({
      repositories,
    });
  } catch (error: any) {
    console.error('Error fetching repositories:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
