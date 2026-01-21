import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.API_BASE_URL || "https://api.sprintgit.com";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ repoId: string }> }
) {
    const { repoId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();
    const url = `${API_BASE_URL}/api/repos/${repoId}/commits/activities${queryString ? `?${queryString}` : ""}`;

    console.log(`[Proxy] GET ${url}`);

    try {
        const response = await fetch(url, {
            headers: {
                "Content-Type": "application/json",
                "Authorization": request.headers.get("Authorization") || "",
            },
        });

        const data = await response.json();
        console.log(`[Proxy] Response status: ${response.status}`);

        return NextResponse.json(data, { status: response.status });
    } catch (error: any) {
        console.error("[Proxy] Error:", error);
        return NextResponse.json(
            { message: "Internal Server Error", error: error.message },
            { status: 500 }
        );
    }
}
