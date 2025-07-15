import {NextRequest, NextResponse} from "next/server";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const agentId = searchParams.get('agentId');
    const apiKey = process.env.XI_API_KEY;

    if (!agentId) {
        return NextResponse.json({ error: 'Agent ID is required' }, { status: 400 });
    }
    if (!apiKey) {
        return NextResponse.json({ error: 'XI_API_KEY is not set' }, { status: 500 });
    }

    try {
        const response = await fetch(
            `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${agentId}`,
            {
                method: 'GET',
                headers: {
                    'xi-api-key': apiKey,
                }
            }
        );

        if (!response.ok) {
            console.error(response);
            throw new Error('Failed to get signed URL');
        }

        const data = await response.json();
        return NextResponse.json({signedUrl: data.signed_url});
    } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ error: 'Failed to get signed URL' }, { status: 500 });
    }
}
