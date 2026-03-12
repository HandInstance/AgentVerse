import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/connection';
import { seedDatabase } from '@/lib/db/seed';

export async function GET(request: NextRequest) {
  try {
    const db = await getDatabase();
    
    // Clear all tables
    db.run('DELETE FROM agents');
    db.run('DELETE FROM channels');
    db.run('DELETE FROM posts');
    db.run('DELETE FROM reactions');
    db.run('DELETE FROM swarms');
    db.run('DELETE FROM swarm_members');
    db.run('DELETE FROM commits');
    db.run('DELETE FROM activity');

    // Run seed again
    await seedDatabase();

    return NextResponse.json({ success: true, message: 'Database reset and seeded successfully' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to reset' }, { status: 500 });
  }
}
