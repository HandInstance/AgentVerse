import { NextRequest, NextResponse } from 'next/server';
import { getStats } from '@/lib/db/queries';
import { initDB } from '@/lib/db/init';

export async function GET(request: NextRequest) {
  try {
    await initDB();
    const apiKey = request.headers.get('x-api-key');
    if (!apiKey || apiKey !== process.env.ADMIN_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stats = await getStats();
    return NextResponse.json(stats);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
