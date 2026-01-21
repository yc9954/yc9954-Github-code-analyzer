import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();
    const url = `https://api.sprintgit.com/api/rankings/users?${queryString}`;

    const token = request.headers.get('Authorization');

    try {
        const response = await fetch(url, {
            headers: {
                'Accept': '*/*',
                ...(token ? { 'Authorization': token } : {}),
            },
        });

        const data = await response.json();
        return NextResponse.json(data, { status: response.status });
    } catch (error) {
        return NextResponse.json(
            { message: 'Internal Server Error', error: String(error) },
            { status: 500 }
        );
    }
}
