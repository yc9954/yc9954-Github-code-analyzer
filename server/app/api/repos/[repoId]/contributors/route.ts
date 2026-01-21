import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ repoId: string }> }
) {
    try {
        const authHeader = request.headers.get('Authorization');

        if (!authHeader) {
            return NextResponse.json(
                { error: 'Authorization header is required' },
                { status: 401 }
            );
        }

        const { repoId } = await params;
        const backendUrl = `https://api.sprintgit.com/api/repos/${repoId}/contributors`;

        console.log(`[API/repo-contributors] Proxying GET to ${backendUrl}`);

        const response = await fetch(backendUrl, {
            headers: {
                'Authorization': authHeader,
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`[API/repo-contributors] Backend error (${response.status}):`, errorText);
            return NextResponse.json(
                { error: `Backend API error: ${response.status}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('[API/repo-contributors] Internal error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
