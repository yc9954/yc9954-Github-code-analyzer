import { NextRequest, NextResponse } from 'next/server';

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { messages, commits, selectedCommit } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: 'Messages array is required' },
        { status: 400 }
      );
    }

    // OpenAI API 키 확인
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error('OpenAI API key is not configured');
      return NextResponse.json(
        { error: 'OpenAI API key is not configured. Please set OPENAI_API_KEY in your environment variables.' },
        { 
          status: 500,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          },
        }
      );
    }

    // 커밋 정보를 컨텍스트로 포함
    let systemMessage = `You are an expert code reviewer and repository analyst. When analyzing repositories and commits, you must provide comprehensive feedback in the following structured format:

## 필수 응답 형식:

### 1. 종합 점수 (100점 만점)
- 총점: XX/100점
- 각 항목별 점수:
  * 커밋 메시지 품질: XX/20점
  * 코드 품질: XX/30점
  * 기능 추가/수정: XX/20점
  * 문서화: XX/20점
  * 테스트: XX/10점

### 2. 코드에서 수정할 부분
- 구체적인 개선 사항과 수정이 필요한 코드 패턴을 나열
- 각 항목에 대해 구체적인 예시와 개선 방안 제시

### 3. 좋았던 부분
- 잘 작성된 코드, 패턴, 구조 등을 구체적으로 언급
- 다른 개발자들이 참고할 만한 좋은 사례

### 4. 커밋 기록에 대한 피드백
- 커밋 메시지의 명확성, 일관성 평가
- 커밋 빈도, 크기, 패턴 분석
- 브랜치 전략 및 워크플로우 평가

### 5. 바이브 코딩 여부 판단
- 바이브 코딩(Vibe Coding): 감에 의존한 코딩, 계획 없이 즉흥적으로 작성한 코드
- 판단 근거와 함께 명확히 "바이브 코딩입니다" 또는 "바이브 코딩이 아닙니다"로 답변
- 바이브 코딩인 경우, 개선 방안 제시

### 6. 기타 내용
- 추가적인 인사이트, 제안사항, 주의사항 등

모든 답변은 한국어로 작성하며, 구체적이고 실용적인 피드백을 제공해야 합니다.`;

    if (selectedCommit && commits) {
      const commit = commits.find((c: any) => c.sha === selectedCommit);
      if (commit) {
        systemMessage += `\n\n현재 분석 중인 특정 커밋:\n- SHA: ${commit.sha}\n- 메시지: ${commit.message}\n- 작성자: ${commit.author}\n- 시간: ${commit.time}\n- 브랜치: ${commit.branch}`;
        if (commit.additions !== undefined) {
          systemMessage += `\n- 추가된 줄: ${commit.additions}`;
        }
        if (commit.deletions !== undefined) {
          systemMessage += `\n- 삭제된 줄: ${commit.deletions}`;
        }
        if (commit.files !== undefined) {
          systemMessage += `\n- 변경된 파일 수: ${commit.files}`;
        }
      }
    } else if (commits && commits.length > 0) {
      // 최근 커밋들을 컨텍스트로 포함 (최대 20개)
      const recentCommits = commits.slice(0, 20).map((c: any) => {
        let commitInfo = `- ${c.sha.substring(0, 7)}: ${c.message} (${c.author}, ${c.time})`;
        if (c.additions !== undefined && c.deletions !== undefined) {
          commitInfo += ` [+${c.additions}/-${c.deletions}]`;
        }
        return commitInfo;
      }).join('\n');
      
      systemMessage += `\n\n최근 커밋 기록 (최근 ${commits.length}개):\n${recentCommits}`;
    }

    // OpenAI API 호출
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini', // 또는 'gpt-3.5-turbo', 'gpt-4' 등
        messages: [
          { role: 'system', content: systemMessage },
          ...messages.map((msg: any) => ({
            role: msg.role,
            content: msg.content,
          })),
        ],
        temperature: 0.7,
        max_tokens: 3000, // 상세한 피드백을 위해 토큰 수 증가
      }),
    });

    if (!openaiResponse.ok) {
      const errorData = await openaiResponse.json().catch(() => ({}));
      console.error('OpenAI API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to get response from OpenAI', details: errorData },
        { status: openaiResponse.status }
      );
    }

    const data = await openaiResponse.json();
    const assistantMessage = data.choices[0]?.message?.content || 'Sorry, I could not generate a response.';

    return NextResponse.json({
      message: assistantMessage,
    }, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error: any) {
    console.error('Error in chat API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    );
  }
}
