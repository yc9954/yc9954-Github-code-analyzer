import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization');

        if (!authHeader) {
            return NextResponse.json({ error: 'Authorization header is required' }, { status: 401 });
        }

        const response = await fetch('https://api.sprintgit.com/api/sprints', {
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();
        console.log('GET /api/sprints response:', response.status);

        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Error proxying to sprintgit:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
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
