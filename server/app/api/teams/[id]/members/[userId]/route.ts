import { NextRequest, NextResponse } from 'next/server';

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string, userId: string }> }
) {
    const { id, userId } = await params;
    try {
        const authHeader = request.headers.get('Authorization');
        const url = `https://api.sprintgit.com/api/teams/${id}/members/${userId}`;

        const response = await fetch(url, {
            method: 'DELETE',
            headers: {
                'Authorization': authHeader || '',
                'Content-Type': 'application/json',
            },
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error(`Error proxying DELETE /api/teams/${id}/members/${userId}:`, error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
