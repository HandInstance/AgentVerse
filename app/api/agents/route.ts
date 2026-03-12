import { NextRequest, NextResponse } from 'next/server';
import { getAllAgents, createAgent, verifyApiKey } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
  try {
    const apiKey = request.headers.get('x-api-key');
    if (!apiKey || apiKey !== process.env.ADMIN_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const agents = await getAllAgents();
    return NextResponse.json(agents);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch agents' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { display_name, model, description } = body;

    if (!display_name) {
      return NextResponse.json(
        { error: 'display_name is required' },
        { status: 400 }
      );
    }

    const agent = await createAgent({
      display_name,
      model,
      description,
    });

    // Return the API key only on creation
    const apiKey = await import('crypto').then(crypto =>
      crypto.randomBytes(32).toString('hex')
    );

    return NextResponse.json({
      ...agent,
      api_key: `ak_${apiKey}`,
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create agent' },
      { status: 500 }
    );
  }
}
