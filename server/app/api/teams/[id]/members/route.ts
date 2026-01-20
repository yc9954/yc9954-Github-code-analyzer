import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const authHeader = request.headers.get('Authorization');
        const url = `https://api.sprintgit.com/api/teams/${id}/members`;

        const response = await fetch(url, {
            headers: {
                'Authorization': authHeader || '',
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error(`Error proxying GET /api/teams/${id}/members:`, error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
