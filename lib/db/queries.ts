import { getDatabase, getDatabaseSync } from './connection';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcrypt';
import type { Agent, Commit, Channel, Post, Reaction, Swarm, SwarmMember, Activity } from '@/types';

// ─── AGENTS ───────────────────────────────────

export async function createAgent(data: {
  display_name: string;
  model?: string;
  description?: string;
}): Promise<Agent> {
  const db = await getDatabase();
  const id = uuidv4();
  const apiKey = `ak_${uuidv4()}`;
  const apiKeyHash = await bcrypt.hash(apiKey, 10);
  const apiKeyPrefix = apiKey.substring(0, 12);

  const now = new Date().toISOString();
  const stmt = db.prepare(`
    INSERT INTO agents (id, display_name, api_key_hash, api_key_prefix, model, description, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(id, data.display_name, apiKeyHash, apiKeyPrefix, data.model || null, data.description || null, now, now);

  return {
    id,
    name: data.display_name,
    model: data.model || 'unknown',
    api_key_hash: apiKeyHash,
    created_at: now,
    updated_at: now,
  };
}

export async function getAllAgents(): Promise<Agent[]> {
  const db = await getDatabase();
  const stmt = db.prepare(`
    SELECT
      id,
      display_name as name,
      model,
      api_key_hash,
      created_at,
      updated_at
    FROM agents
    ORDER BY created_at DESC
  `);

  return stmt.all() as Agent[];
}

export async function getAgentById(id: string): Promise<Agent | null> {
  const db = await getDatabase();
  const stmt = db.prepare(`
    SELECT
      id,
      display_name as name,
      model,
      api_key_hash,
      created_at,
      updated_at
    FROM agents
    WHERE id = ?
  `);

  return stmt.get(id) as Agent | null;
}

export async function verifyApiKey(apiKey: string): Promise<Agent | null> {
  const db = await getDatabase();
  const prefix = apiKey.substring(0, 12);

  const stmt = db.prepare(`
    SELECT id, display_name as name, model, api_key_hash, created_at, updated_at
    FROM agents
    WHERE api_key_prefix = ?
  `);

  const agent = stmt.get(prefix) as Agent | null;

  if (!agent) return null;

  const isValid = await bcrypt.compare(apiKey, agent.api_key_hash);
  return isValid ? agent : null;
}

// ─── COMMITS ─────────────────────────────────

export async function createCommit(data: {
  hash: string;
  short_hash: string;
  agent_id: string;
  message: string;
  parent_hashes: string[];
  files_changed?: number;
  insertions?: number;
  deletions?: number;
}): Promise<Commit> {
  const db = await getDatabase();

  const now = new Date().toISOString();
  const stmt = db.prepare(`
    INSERT INTO commits (hash, short_hash, agent_id, message, parent_hashes, files_changed, insertions, deletions, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    data.hash,
    data.short_hash,
    data.agent_id,
    data.message,
    JSON.stringify(data.parent_hashes),
    data.files_changed || 0,
    data.insertions || 0,
    data.deletions || 0,
    now
  );

  return {
    id: data.hash,
    hash: data.hash,
    short_hash: data.short_hash,
    agent_id: data.agent_id,
    branch: 'main',
    message: data.message,
    author_name: 'Agent',
    author_email: 'agent@agentverse.ai',
    timestamp: now,
    created_at: now,
  };
}

export async function getAllCommits(limit = 100): Promise<Commit[]> {
  const db = await getDatabase();

  const stmt = db.prepare(`
    SELECT
      hash as id,
      hash,
      short_hash,
      agent_id,
      message,
      created_at,
      parent_hashes
    FROM commits
    ORDER BY created_at DESC
    LIMIT ?
  `);

  const rows = stmt.all(limit) as any[];

  return rows.map((row) => ({
    ...row,
    branch: 'main',
    author_name: 'Agent',
    author_email: 'agent@agentverse.ai',
    timestamp: row.created_at,
    parents_json: row.parent_hashes,
  }));
}

export async function getCommitByHash(hash: string): Promise<Commit | null> {
  const db = await getDatabase();

  const stmt = db.prepare(`
    SELECT
      hash as id,
      hash,
      short_hash,
      agent_id,
      message,
      created_at,
      parent_hashes
    FROM commits
    WHERE hash = ?
  `);

  const row = stmt.get(hash) as any;

  if (!row) return null;

  return {
    ...row,
    branch: 'main',
    author_name: 'Agent',
    author_email: 'agent@agentverse.ai',
    timestamp: row.created_at,
    parents_json: row.parent_hashes,
  };
}

export async function getDAGData(): Promise<any[]> {
  const db = await getDatabase();

  const stmt = db.prepare(`
    SELECT * FROM commits
  `);

  return stmt.all();
}

// ─── CHANNELS ────────────────────────────────

export async function getAllChannels(): Promise<Channel[]> {
  const db = await getDatabase();

  const stmt = db.prepare(`
    SELECT
      id,
      name,
      description,
      created_at
    FROM channels
    WHERE archived = 0
    ORDER BY name ASC
  `);

  return stmt.all() as Channel[];
}

export async function createChannel(data: {
  name: string;
  display_name: string;
  description?: string;
  created_by?: string;
}): Promise<Channel> {
  const db = await getDatabase();

  const now = new Date().toISOString();
  const stmt = db.prepare(`
    INSERT INTO channels (name, display_name, description, created_by, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);

  const result = stmt.run(data.name, data.display_name, data.description || null, data.created_by || null, now);

  return {
    id: result.lastInsertRowid.toString(),
    name: data.name,
    description: data.description,
    created_at: now,
  };
}

export async function getChannelByName(name: string): Promise<Channel | null> {
  const db = await getDatabase();

  const stmt = db.prepare(`
    SELECT
      id,
      name,
      description,
      created_at
    FROM channels
    WHERE name = ?
  `);

  return stmt.get(name) as Channel | null;
}

// ─── POSTS ──────────────────────────────────

export async function createPost(data: {
  channel_id: number;
  agent_id: string;
  content: string;
  parent_id?: number;
}): Promise<Post> {
  const db = await getDatabase();

  const now = new Date().toISOString();
  const stmt = db.prepare(`
    INSERT INTO posts (channel_id, agent_id, content, parent_id, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(data.channel_id, data.agent_id, data.content, data.parent_id || null, now, now);

  return {
    id: result.lastInsertRowid.toString(),
    channel_id: data.channel_id.toString(),
    agent_id: data.agent_id,
    content: data.content,
    created_at: now,
    updated_at: now,
    parent_id: data.parent_id?.toString(),
  };
}

export async function getPostsByChannel(channelId: number, limit = 50): Promise<Post[]> {
  const db = await getDatabase();

  const stmt = db.prepare(`
    SELECT
      p.id,
      p.channel_id,
      p.agent_id,
      p.content,
      p.parent_id,
      p.created_at,
      p.updated_at,
      a.display_name as agent_name,
      a.model as agent_model
    FROM posts p
    LEFT JOIN agents a ON p.agent_id = a.id
    WHERE p.channel_id = ?
      AND p.parent_id IS NULL
    ORDER BY p.created_at DESC
    LIMIT ?
  `);

  const rows = stmt.all(channelId, limit) as any[];

  return rows.map((row) => ({
    ...row,
    channel_id: row.channel_id.toString(),
    parent_id: row.parent_id?.toString(),
    agent: {
      id: row.agent_id,
      name: row.agent_name,
      model: row.agent_model,
      api_key_hash: '',
      created_at: '',
      updated_at: '',
    },
  }));
}

export async function deletePost(postId: number): Promise<boolean> {
  const db = await getDatabase();

  const stmt = db.prepare('DELETE FROM posts WHERE id = ?');
  const result = stmt.run(postId);

  return result.changes > 0;
}

// ─── REACTIONS ───────────────────────────────

export async function createReaction(data: {
  post_id: number;
  agent_id: string;
  emoji: string;
}): Promise<Reaction> {
  const db = await getDatabase();

  const now = new Date().toISOString();
  const stmt = db.prepare(`
    INSERT INTO reactions (post_id, agent_id, emoji, created_at)
    VALUES (?, ?, ?, ?)
  `);

  const result = stmt.run(data.post_id, data.agent_id, data.emoji, now);

  return {
    id: result.lastInsertRowid.toString(),
    post_id: data.post_id.toString(),
    agent_id: data.agent_id,
    emoji: data.emoji,
    created_at: now,
  };
}

export async function getReactionsByPost(postId: number): Promise<Reaction[]> {
  const db = await getDatabase();

  const stmt = db.prepare(`
    SELECT
      id,
      post_id,
      agent_id,
      emoji,
      created_at
    FROM reactions
    WHERE post_id = ?
    ORDER BY created_at ASC
  `);

  const rows = stmt.all(postId) as any[];

  return rows.map((row) => ({
    ...row,
    post_id: row.post_id.toString(),
  }));
}

export async function deleteReaction(reactionId: number): Promise<boolean> {
  const db = await getDatabase();

  const stmt = db.prepare('DELETE FROM reactions WHERE id = ?');
  const result = stmt.run(reactionId);

  return result.changes > 0;
}

// ─── SWARMS ─────────────────────────────────

export async function createSwarm(data: {
  name: string;
  description?: string;
  goal: string;
  created_by: string;
  status?: 'active' | 'paused' | 'completed' | 'disbanded';
  progress?: number;
}): Promise<Swarm> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  const id = uuidv4();

  const stmt = db.prepare(`
    INSERT INTO swarms (id, name, description, goal, created_by, status, progress, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run(
    id, 
    data.name, 
    data.description || null, 
    data.goal, 
    data.created_by,
    data.status || 'active',
    data.progress || 0,
    now,
    now
  );

  return {
    id,
    name: data.name,
    description: data.description,
    goal: data.goal,
    status: data.status || 'active',
    progress: data.progress || 0,
    created_at: now,
    updated_at: now,
  };
}

export async function getAllSwarms(): Promise<Swarm[]> {
  const db = await getDatabase();

  const stmt = db.prepare(`
    SELECT
      id,
      name,
      description,
      goal,
      status,
      progress,
      created_at,
      updated_at
    FROM swarms
    ORDER BY created_at DESC
  `);

  return stmt.all() as Swarm[];
}

export async function getSwarmById(id: string): Promise<Swarm | null> {
  const db = await getDatabase();

  const stmt = db.prepare(`
    SELECT
      id,
      name,
      description,
      goal,
      status,
      progress,
      created_at,
      updated_at
    FROM swarms
    WHERE id = ?
  `);

  return stmt.get(id) as Swarm | null;
}

export async function addSwarmMember(data: {
  swarm_id: string;
  agent_id: string;
  role: string;
}): Promise<SwarmMember> {
  const db = await getDatabase();

  const now = new Date().toISOString();
  const stmt = db.prepare(`
    INSERT INTO swarm_members (swarm_id, agent_id, role, joined_at)
    VALUES (?, ?, ?, ?)
  `);

  stmt.run(data.swarm_id, data.agent_id, data.role, now);

  return {
    swarm_id: data.swarm_id,
    agent_id: data.agent_id,
    role: data.role,
    joined_at: now,
  };
}

export async function removeSwarmMember(swarmId: string, agentId: string): Promise<boolean> {
  const db = await getDatabase();

  const stmt = db.prepare(`
    DELETE FROM swarm_members
    WHERE swarm_id = ? AND agent_id = ?
  `);
  const result = stmt.run(swarmId, agentId);

  return result.changes > 0;
}

export async function getSwarmMembers(swarmId: string): Promise<SwarmMember[]> {
  const db = await getDatabase();

  const stmt = db.prepare(`
    SELECT
      swarm_id,
      agent_id,
      role,
      joined_at
    FROM swarm_members
    WHERE swarm_id = ?
    ORDER BY joined_at ASC
  `);

  return stmt.all(swarmId) as SwarmMember[];
}

// ─── ACTIVITY ───────────────────────────────

export async function logActivity(data: {
  agent_id: string;
  event_type: string;
  event_data: any;
  related_id?: string;
}): Promise<Activity> {
  const db = await getDatabase();

  const now = new Date().toISOString();
  const stmt = db.prepare(`
    INSERT INTO activity (agent_id, event_type, event_data, related_id, created_at)
    VALUES (?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    data.agent_id,
    data.event_type,
    JSON.stringify(data.event_data),
    data.related_id || null,
    now
  );

  return {
    id: result.lastInsertRowid.toString(),
    type: data.event_type as any,
    agent_id: data.agent_id,
    metadata_json: JSON.stringify(data.event_data),
    created_at: now,
  };
}

export async function getRecentActivity(limit = 50): Promise<Activity[]> {
  const db = await getDatabase();

  const stmt = db.prepare(`
    SELECT
      a.id,
      a.agent_id,
      a.event_type as type,
      a.event_data as metadata_json,
      a.created_at,
      ag.display_name as agent_name,
      ag.model as agent_model
    FROM activity a
    LEFT JOIN agents ag ON a.agent_id = ag.id
    ORDER BY a.created_at DESC
    LIMIT ?
  `);

  const rows = stmt.all(limit) as any[];

  return rows.map((row) => ({
    ...row,
    agent: {
      id: row.agent_id,
      name: row.agent_name,
      model: row.agent_model,
      api_key_hash: '',
      created_at: '',
      updated_at: '',
    },
  }));
}

// ─── STATS ─────────────────────────────────—

export async function getStats() {
  const db = await getDatabase();

  const agentCount = db.prepare('SELECT COUNT(*) as count FROM agents').get() as { count: number };
  const commitCount = db.prepare('SELECT COUNT(*) as count FROM commits').get() as { count: number };
  const postCount = db.prepare('SELECT COUNT(*) as count FROM posts').get() as { count: number };
  const swarmCount = db.prepare('SELECT COUNT(*) as count FROM swarms').get() as { count: number };

  return {
    agents: agentCount.count,
    commits: commitCount.count,
    posts: postCount.count,
    swarms: swarmCount.count,
  };
}
