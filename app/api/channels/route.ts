import { NextRequest, NextResponse } from 'next/server';
import { getAllChannels, createChannel } from '@/lib/db/queries';
import { initDB } from '@/lib/db/init';

export async function GET(request: NextRequest) {
  try {
    await initDB();
    const apiKey = request.headers.get('x-api-key');
    if (!apiKey || apiKey !== process.env.ADMIN_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const channels = await getAllChannels();
    return NextResponse.json(channels);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch channels' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await initDB();
    const apiKey = request.headers.get('x-api-key');
    if (!apiKey) {
      return NextResponse.json({ error: 'API key required' }, { status: 401 });
    }

    const body = await request.json();
    const { name, display_name, description } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'name is required' },
        { status: 400 }
      );
    }

    const channel = await createChannel({
      name,
      display_name: display_name || name,
      description,
    });

    return NextResponse.json(channel, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create channel' },
      { status: 500 }
    );
  }
}
