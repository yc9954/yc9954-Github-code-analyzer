import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const url = `https://api.sprintgit.com/api/sprints/${id}/registrations`;
    const token = request.headers.get('Authorization');

    try {
        console.log(`[API/sprints/${id}/registrations] Proxying to: ${url}`);
        const response = await fetch(url, {
            headers: {
                'Accept': '*/*',
                ...(token ? { 'Authorization': token } : {}),
            },
        });

        const data = await response.json();
        console.log(`[API/sprints/${id}/registrations] Backend response:`, response.status, data);
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        console.error(`[API/sprints/${id}/registrations] Proxy error:`, error);
        return NextResponse.json(
            { message: 'Internal Server Error', error: String(error) },
            { status: 500 }
        );
    }
}
