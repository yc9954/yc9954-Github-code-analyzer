import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization');
        console.log('[API/users/me/repositories] Received request.');

        if (!authHeader) {
            return NextResponse.json(
                { error: 'Authorization header is required' },
                { status: 401 }
            );
        }

        // Proxy the request to the real backend
        console.log('[API/users/me/repositories] Proxying to https://api.sprintgit.com/api/users/me/repositories');
        const response = await fetch('https://api.sprintgit.com/api/users/me/repositories', {
            headers: {
                'Authorization': authHeader,
                'Accept': 'application/json',
            },
        });

        console.log('[API/users/me/repositories] Backend response status:', response.status);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('[API/users/me/repositories] Backend error:', errorData);
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
        console.error('[API/users/me/repositories] Internal error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
