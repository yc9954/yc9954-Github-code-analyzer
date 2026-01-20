
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ owner: string; repo: string }> }
) {
    try {
        const { owner, repo } = await params;
        // Construct the repoId as expected by upstream SprintGit API
        // Assuming upstream expects "owner/repo" which might need encoding if passed as a single path param
        // OR if upstream is /api/repos/:owner/:repo/metrics it would be easier.
        // Based on previous files, upstream seems to be /api/repos/{repoId}/metrics.
        // Let's assume repoId = "owner/repo".
        // We should encode it to be safe if it's a single path param.
        const repoId = `${owner}/${repo}`;
        const encodedRepoId = encodeURIComponent(repoId);
        const sprintGitUrl = `https://api.sprintgit.com/api/repos/${encodedRepoId}/metrics`;

        const response = await fetch(sprintGitUrl, {
            headers: {
                'Accept': 'application/json',
                'Authorization': request.headers.get('Authorization') || '',
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            // If 404, maybe upstream expects different format?
            if (response.status === 404) {
                console.log(`Upstream 404 for ${sprintGitUrl}. Trying unencoded slash.`);
                // Fallback: maybe upstream accepts /api/repos/owner/repo/metrics directly?
                // But existing upstream API docs usually mean {repoId} is one token.
            }
            console.error(`SprintGit API error (${response.status}):`, errorText);
            return NextResponse.json(
                { error: `SprintGit API error: ${response.status}`, details: errorText },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Proxy error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
