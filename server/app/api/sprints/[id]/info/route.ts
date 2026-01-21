import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const authHeader = request.headers.get('Authorization');

        if (!authHeader) {
            return NextResponse.json({ error: 'Authorization header is required' }, { status: 401 });
        }

        const targetUrl = `https://api.sprintgit.com/api/sprints/${encodeURIComponent(id)}/info`;
        console.log(`[API/sprints/${id}/info] Proxying GET to ${targetUrl}`);

        const response = await fetch(targetUrl, {
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        });

        console.log(`[API/sprints/${id}/info] Backend response status: ${response.status}`);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error(`[API/sprints/${id}/info] Backend error:`, errorData);
            return NextResponse.json(
                { error: `Backend API error: ${response.status}`, details: errorData },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('[API/sprints/info] Internal error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
