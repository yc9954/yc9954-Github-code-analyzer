import { NextRequest, NextResponse } from 'next/server';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const authHeader = request.headers.get('Authorization');

        if (!authHeader) {
            return NextResponse.json({ error: 'Authorization header is required' }, { status: 401 });
        }

        const body = await request.json();
        const targetUrl = `https://api.sprintgit.com/api/sprints/${encodeURIComponent(id)}/registration`;
        console.log(`[API/sprints/${id}/registration] Proxying POST to ${targetUrl}`);

        const response = await fetch(targetUrl, {
            method: 'POST',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify(body),
        });

        console.log(`[API/sprints/${id}/registration] Backend response status: ${response.status}`);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error(`[API/sprints/${id}/registration] Backend error:`, errorData);
            return NextResponse.json(
                { error: `Backend API error: ${response.status}`, details: errorData },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('[API/sprints/registration] Internal error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
