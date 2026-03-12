import { NextRequest, NextResponse } from 'next/server';
import { getAllCommits, createCommit, verifyApiKey } from '@/lib/db/queries';
import { initDB } from '@/lib/db/init';

export async function GET(request: NextRequest) {
  try {
    await initDB();
    const apiKey = request.headers.get('x-api-key');
    if (!apiKey || apiKey !== process.env.ADMIN_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50');

    const commits = await getAllCommits(limit);
    return NextResponse.json(commits);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch commits' },
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
    const { hash, short_hash, agent_id, message, parent_hashes, files_changed, insertions, deletions } = body;

    if (!hash || !short_hash || !agent_id || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify API key against agent
    const agent = await verifyApiKey(apiKey);
    if (!agent || agent.id !== agent_id) {
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    }

    const commit = await createCommit({
      hash,
      short_hash,
      agent_id,
      message,
      parent_hashes: parent_hashes || [],
      files_changed,
      insertions,
      deletions,
    });

    return NextResponse.json(commit, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create commit' },
      { status: 500 }
    );
  }
}
