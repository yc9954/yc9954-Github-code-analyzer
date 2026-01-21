import { NextRequest, NextResponse } from 'next/server';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const authHeader = request.headers.get('Authorization');
        const searchParams = request.nextUrl.searchParams;
        const code = searchParams.get('code');
        const url = `https://api.sprintgit.com/api/teams/${id}/join${code ? `?code=${code}` : ''}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': authHeader || '',
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error(`Error proxying POST /api/teams/${id}/join:`, error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
