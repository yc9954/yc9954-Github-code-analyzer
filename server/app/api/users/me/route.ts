import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization');
        console.log('[API/users/me] Received request.');
        console.log('[API/users/me] Auth Header:', authHeader ? 'Present' : 'Missing', authHeader ? `(${authHeader.substring(0, 15)}...)` : '');

        if (!authHeader) {
            console.error('[API/users/me] Missing Authorization header');
            return NextResponse.json(
                { error: 'Authorization header is required' },
                { status: 401 }
            );
        }

        // Proxy the request to the real backend
        console.log('[API/users/me] Proxying to https://api.sprintgit.com/api/users/me');
        const response = await fetch('https://api.sprintgit.com/api/users/me', {
            headers: {
                'Authorization': authHeader, // Forward the Bearer token
                'Accept': 'application/json',
            },
        });

        console.log('[API/users/me] Backend response status:', response.status);
        console.log('[API/users/me] Backend response headers:', Object.fromEntries(response.headers.entries()));

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('[API/users/me] Backend error:', errorData);
            // Try to log raw text if errorData is empty
            if (Object.keys(errorData).length === 0) {
                const text = await response.text();
                console.error('[API/users/me] Backend raw response:', text);
            }
            return NextResponse.json(
                {
                    error: `Backend API error: ${response.status}`,
                    details: errorData
                },
                { status: response.status }
            );
        }

        const data = await response.json();
        console.log('[API/users/me] Success. Data keys:', Object.keys(data));

        // Return the data exactly as received (it matches the frontend expectations)
        return NextResponse.json(data);

    } catch (error: any) {
        console.error('[API/users/me] Internal error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function PUT(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization');
        console.log('[API/users/me][PUT] Received request. Auth Header present:', !!authHeader);

        if (!authHeader) {
            return NextResponse.json(
                { error: 'Authorization header is required' },
                { status: 401 }
            );
        }

        const body = await request.json();
        console.log('[API/users/me][PUT] Request body:', JSON.stringify(body));

        // Proxy the request to the real backend
        console.log('[API/users/me][PUT] Proxying to https://api.sprintgit.com/api/users/me');
        const response = await fetch('https://api.sprintgit.com/api/users/me', {
            method: 'PUT',
            headers: {
                'Authorization': authHeader, // Forward the Bearer token
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(body),
        });

        console.log('[API/users/me][PUT] Backend response status:', response.status);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('[API/users/me][PUT] Backend error:', errorData);
            return NextResponse.json(
                {
                    error: `Backend API error: ${response.status}`,
                    details: errorData
                },
                { status: response.status }
            );
        }

        const data = await response.json();
        console.log('[API/users/me][PUT] Success.');

        return NextResponse.json(data);

    } catch (error: any) {
        console.error('[API/users/me][PUT] Internal error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization');
        console.log('[API/users/me][DELETE] Received request. Auth Header present:', !!authHeader);

        if (!authHeader) {
            return NextResponse.json(
                { error: 'Authorization header is required' },
                { status: 401 }
            );
        }

        // Proxy the request to the real backend
        console.log('[API/users/me][DELETE] Proxying to https://api.sprintgit.com/api/users/me');
        const response = await fetch('https://api.sprintgit.com/api/users/me', {
            method: 'DELETE',
            headers: {
                'Authorization': authHeader, // Forward the Bearer token
                'Accept': 'application/json',
            },
        });

        console.log('[API/users/me][DELETE] Backend response status:', response.status);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('[API/users/me][DELETE] Backend error:', errorData);
            return NextResponse.json(
                {
                    error: `Backend API error: ${response.status}`,
                    details: errorData
                },
                { status: response.status }
            );
        }

        // The backend might return 204 No Content or 200 with JSON
        let data = {};
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        }

        console.log('[API/users/me][DELETE] Success.');

        return NextResponse.json(data);

    } catch (error: any) {
        console.error('[API/users/me][DELETE] Internal error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
