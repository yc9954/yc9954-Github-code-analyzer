import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization');

    if (!authHeader) {
      return NextResponse.json(
        { error: 'Authorization header is required' },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { messages, commits, selectedCommit } = body;

    // Validate messages
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: 'Messages array is required and must not be empty' },
        { status: 400 }
      );
    }

    // Prepare enhanced messages with commit context
    let enhancedMessages = [...messages];

    // Add commit context as a system-like message if commits are provided
    if (commits && Array.isArray(commits) && commits.length > 0) {
      const commitContext = {
        role: 'user',
        content: `다음은 현재 분석 중인 커밋 데이터입니다:\n\n${JSON.stringify({
          totalCommits: commits.length,
          selectedCommit: selectedCommit,
          commits: commits.map((c: any) => ({
            sha: c.sha,
            message: c.message,
            author: c.author || c.authorName,
            time: c.time || c.committedAt,
            branch: c.branch,
            additions: c.additions,
            deletions: c.deletions,
            analysisStatus: c.analysisStatus,
            totalScore: c.totalScore,
            authorProfileUrl: c.authorProfileUrl
          }))
        }, null, 2)}\n\n위 커밋 정보를 참고하여 다음 질문에 답변해주세요.`
      };

      // Insert commit context before user messages
      enhancedMessages = [commitContext, ...messages];
    }

    // Ensure role is set to "user" for all messages if not already set
    enhancedMessages = enhancedMessages.map((msg: any) => ({
      role: msg.role || 'user',
      content: msg.content
    }));

    const backendUrl = 'https://api.sprintgit.com/api/chat';
    console.log(`[API/chat] Proxying to ${backendUrl}`);

    const response = await fetch(backendUrl, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        messages: enhancedMessages,
        commits: commits,
        selectedCommit: selectedCommit
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('[API/chat] Backend error:', errorData);
      return NextResponse.json(
        { error: `Backend API error: ${response.status}`, details: errorData },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('[API/chat] Internal error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
