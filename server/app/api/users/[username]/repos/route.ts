import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.API_BASE_URL || 'https://api.sprintgit.com';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ username: string }> }
) {
    try {
        const { username } = await params;
        const backendUrl = `${API_BASE_URL}/api/users/${username}/repos`;

        console.log(`[Proxy] Forwarding request to: ${backendUrl}`);

        const response = await fetch(backendUrl, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                // Forward authorization if present (though this is public data, some endpoints might check auth)
                ...(request.headers.get("Authorization") ? { "Authorization": request.headers.get("Authorization")! } : {}),
            },
        });

        if (!response.ok) {
            console.error(`[Proxy] Backend returned ${response.status}: ${response.statusText}`);
            return NextResponse.json(
                { error: `Backend error: ${response.status}` },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('[Proxy] Error forwarding request:', error);
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        );
    }
}
