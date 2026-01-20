import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization');
        const searchParams = request.nextUrl.searchParams;
        const page = searchParams.get('page') || '0';
        const size = searchParams.get('size') || '10';

        const url = `https://api.sprintgit.com/api/teams/public?page=${page}&size=${size}`;

        const response = await fetch(url, {
            headers: {
                'Authorization': authHeader || '',
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Error proxying GET /api/teams/public:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
