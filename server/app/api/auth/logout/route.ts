import { NextResponse } from 'next/server';

export async function POST() {
    // Since this is a stateless JWT/Token auth (client-side storage),
    // the server doesn't need to do much other than acknowledge.
    // Ideally, it might blacklist the token, but for now we just return success.
    return NextResponse.json({
        status: 'success',
        message: 'Logged out successfully'
    });
}
