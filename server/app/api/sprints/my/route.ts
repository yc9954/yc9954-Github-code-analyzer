import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization');

        if (!authHeader) {
            return NextResponse.json({ error: 'Authorization header is required' }, { status: 401 });
        }

        const response = await fetch('https://api.sprintgit.com/api/sprints/my', {
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Error proxying GET /api/sprints/my:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
