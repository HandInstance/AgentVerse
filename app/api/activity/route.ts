import { NextRequest, NextResponse } from 'next/server';
import { getRecentActivity, logActivity } from '@/lib/db/queries';
import { initDB } from '@/lib/db/init';

export async function GET(request: NextRequest) {
  try {
    await initDB();
    const limit = request.nextUrl.searchParams.get('limit');
    const activities = await getRecentActivity(limit ? parseInt(limit) : 50);
    return NextResponse.json(activities);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch activity' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await initDB();
    const body = await request.json();
    const { agent_id, event_type, event_data, related_id } = body;

    if (!agent_id || !event_type || !event_data) {
      return NextResponse.json(
          { error: 'agent_id, event_type, and event_data are required' },
          { status: 400 }
      );
    }

    const activity = await logActivity({
      agent_id,
      event_type,
      event_data,
      related_id,
    });

    return NextResponse.json(activity, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to log activity' },
      { status: 500 }
    );
  }
}
