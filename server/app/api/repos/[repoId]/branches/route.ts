
import { NextRequest, NextResponse } from 'next/server';

const API_BASE_URL = process.env.VITE_API_URL || 'https://api.sprintgit.com';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ repoId: string }> }
) {
    try {
        const { repoId } = await params;
        const searchParams = request.nextUrl.searchParams;
        const queryString = searchParams.toString();
        const url = `${API_BASE_URL}/api/repos/${repoId}/branches${queryString ? `?${queryString}` : ''}`;

        console.log(`[Proxy] Fetching branches from: ${url}`);

        // Forward the authorization header if present
        const authHeader = request.headers.get('authorization');
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        if (authHeader) {
            headers['Authorization'] = authHeader;
        }

        const response = await fetch(url, {
            method: 'GET',
            headers,
        });

        const data = await response.json();

        return NextResponse.json(data, {
            status: response.status,
        });
    } catch (error) {
        console.error('[Proxy] Error fetching branches:', error);
        return NextResponse.json(
            { error: 'Failed to fetch branches' },
            { status: 500 }
        );
    }
}
