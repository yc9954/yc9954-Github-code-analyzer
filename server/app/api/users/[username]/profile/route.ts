import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ username: string }> }
) {
    try {
        const username = (await params).username;
        const authHeader = request.headers.get('Authorization');
        console.log(`[API/users/${username}/profile] Received request.`);

        if (!authHeader) {
            return NextResponse.json(
                { error: 'Authorization header is required' },
                { status: 401 }
            );
        }

        // Proxy the request to the real backend
        const targetUrl = `https://api.sprintgit.com/api/users/${username}/profile`;
        console.log(`[API/users/${username}/profile] Proxying to ${targetUrl}`);

        const response = await fetch(targetUrl, {
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'User-Agent': request.headers.get('user-agent') || 'NextJS-Proxy',
            },
        });

        console.log(`[API/users/${username}/profile] Backend response status:`, response.status);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error(`[API/users/${username}/profile] Backend error:`, errorData);
            return NextResponse.json(
                {
                    error: `Backend API error: ${response.status}`,
                    details: errorData
                },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);

    } catch (error: any) {
        console.error(`[API/users/${username}/profile] Internal error:`, error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
