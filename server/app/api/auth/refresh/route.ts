import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        console.log('[API/auth/refresh] Received refresh request.');

        if (!body.refreshToken) {
            return NextResponse.json(
                { error: 'Refresh token is required' },
                { status: 400 }
            );
        }

        // Proxy the request to the real backend
        console.log('[API/auth/refresh] Proxying to https://api.sprintgit.com/api/auth/refresh');

        const response = await fetch('https://api.sprintgit.com/api/auth/refresh', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(body),
        });

        console.log('[API/auth/refresh] Backend response status:', response.status);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('[API/auth/refresh] Backend error:', errorData);
            return NextResponse.json(
                {
                    error: `Backend API error: ${response.status}`,
                    details: errorData
                },
                { status: response.status }
            );
        }

        const data = await response.json();
        console.log('[API/auth/refresh] Success.');

        return NextResponse.json(data);

    } catch (error: any) {
        console.error('[API/auth/refresh] Internal error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
