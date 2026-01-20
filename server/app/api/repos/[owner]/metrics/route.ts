
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ owner: string }> }
) {
    try {
        const { owner } = await params;
        // Handle single segment repo ID case (e.g. "vortexdb")
        // Here 'owner' captures the single segment ID
        const sprintGitUrl = `https://api.sprintgit.com/api/repos/${encodeURIComponent(owner)}/metrics`;

        const response = await fetch(sprintGitUrl, {
            headers: {
                'Accept': 'application/json',
                'Authorization': request.headers.get('Authorization') || '',
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
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
