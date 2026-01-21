
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const sprintGitUrl = `https://api.sprintgit.com/api/teams/${id}/repos`;

        const response = await fetch(sprintGitUrl, {
            headers: {
                'Accept': 'application/json',
                'Authorization': request.headers.get('Authorization') || '',
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`SprintGit API error (${response.status}):`, errorText);
            return NextResponse.json(
                { error: `SprintGit API error: ${response.status}`, details: errorText },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Proxy error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();
        const sprintGitUrl = `https://api.sprintgit.com/api/teams/${id}/repos`;

        const response = await fetch(sprintGitUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': request.headers.get('Authorization') || '',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`SprintGit API error (${response.status}):`, errorText);
            return NextResponse.json(
                { error: `SprintGit API error: ${response.status}`, details: errorText },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Proxy error:', error);
        return NextResponse.json(
            { error: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
