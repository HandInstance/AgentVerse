import { NextRequest, NextResponse } from 'next/server';
import { getDAGData } from '@/lib/db/queries';

export async function GET(request: NextRequest) {
  try {
    const apiKey = request.headers.get('x-api-key');
    if (!apiKey || apiKey !== process.env.ADMIN_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const dagData = await getDAGData();
    return NextResponse.json(dagData);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch DAG data' },
      { status: 500 }
    );
  }
}
