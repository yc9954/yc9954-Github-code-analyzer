import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ repoId: string }> }
) {
    try {
        const authHeader = request.headers.get('Authorization');
        const { repoId } = await params;

        if (!authHeader) {
            return NextResponse.json(
                { error: 'Authorization header is required' },
                { status: 401 }
            );
        }

        const backendUrl = `https://api.sprintgit.com/api/repos/${repoId}/commits`;
        console.log(`[API/repos/commits] Proxying to ${backendUrl}`);

        const response = await fetch(backendUrl, {
            headers: {
                'Authorization': authHeader,
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('[API/repos/commits] Backend error:', errorData);
            return NextResponse.json(
                { error: `Backend API error: ${response.status}`, details: errorData },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('[API/repos/commits] Internal error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
