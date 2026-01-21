import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization');

        if (!authHeader) {
            return NextResponse.json({ error: 'Authorization header is required' }, { status: 401 });
        }

        // Forward query parameters
        const { searchParams } = new URL(request.url);
        const queryString = searchParams.toString();
        const targetUrl = `https://api.sprintgit.com/api/sprints${queryString ? `?${queryString}` : ''}`;

        console.log(`[API/sprints] Proxying GET to ${targetUrl}`);

        const response = await fetch(targetUrl, {
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        });

        console.log(`[API/sprints] Backend response status: ${response.status}`);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error(`[API/sprints] Backend error:`, errorData);
            return NextResponse.json(
                { error: `Backend API error: ${response.status}`, details: errorData },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('[API/sprints] Internal error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization');

        if (!authHeader) {
            return NextResponse.json({ error: 'Authorization header is required' }, { status: 401 });
        }

        const body = await request.json();

        const response = await fetch('https://api.sprintgit.com/api/sprints', {
            method: 'POST',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        const data = await response.json();
        console.log('POST /api/sprints response:', response.status);

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Error proxying POST to sprintgit:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
