import { NextRequest, NextResponse } from 'next/server';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    try {
        const authHeader = request.headers.get('Authorization');
        const { teamId } = await request.json();
        const url = `https://api.sprintgit.com/api/sprints/${id}/ban?teamId=${teamId}`;

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
        console.error(`Error proxying POST /api/sprints/${id}/ban:`, error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
