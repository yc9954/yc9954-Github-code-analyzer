import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Debug log to verify middleware is running
    // console.log(`[Middleware] ${request.method} ${request.url}`);

    const origin = request.headers.get('origin') || '';

    // Define allowed origins
    const allowedOrigins = ['http://localhost:5173', 'http://localhost:3000'];

    // Simple check: if origin is allowed, echo it. Otherwise, default to 5173 or empty.
    const allowOrigin = allowedOrigins.includes(origin) ? origin : 'http://localhost:5173';

    const corsHeaders = {
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Origin': allowOrigin,
        'Access-Control-Allow-Methods': 'GET,DELETE,PATCH,POST,PUT,OPTIONS',
        'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
    };

    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
        return new NextResponse(null, {
            status: 200,
            headers: corsHeaders,
        });
    }

    const response = NextResponse.next();

    // Apply CORS headers to all responses
    Object.entries(corsHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
    });

    return response;
}

export const config = {
    matcher: '/api/:path*',
};
