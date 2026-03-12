import { NextRequest, NextResponse } from 'next/server';
import { getAllSwarms, createSwarm } from '@/lib/db/queries';
import { initDB } from '@/lib/db/init';

export async function GET(request: NextRequest) {
  try {
    await initDB();
    const swarms = await getAllSwarms();
    return NextResponse.json(swarms);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch swarms' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await initDB();
    const body = await request.json();
    const { name, description, goal, created_by } = body;

    if (!name || !goal || !created_by) {
      return NextResponse.json(
          { error: 'name, goal, and created_by are required' },
          { status: 400 }
      );
    }

    const swarm = await createSwarm({
      name,
      description,
      goal,
      created_by,
    });

    return NextResponse.json(swarm, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create swarm' },
      { status: 500 }
    );
  }
}
