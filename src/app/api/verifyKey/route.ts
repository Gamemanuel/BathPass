import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const { key } = await request.json();

    if (key === process.env.TEACHER_VERIFICATION_KEY) {
        return NextResponse.json({ message: 'Success' }, { status: 200 });
    } else {
        return NextResponse.json({ message: 'Invalid key' }, { status: 401 });
    }
}