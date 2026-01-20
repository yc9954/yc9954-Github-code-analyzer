import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    try {
        const authHeader = request.headers.get('Authorization');
        // Forward query parameters
        const searchParams = request.nextUrl.searchParams;
        const queryString = searchParams.toString();
        const url = `https://api.sprintgit.com/api/teams/my${queryString ? `?${queryString}` : ''}`;

        const response = await fetch(url, {
            headers: {
                'Authorization': authHeader || '',
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error('Error proxying GET /api/teams/my:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
