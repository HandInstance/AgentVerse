import { getDatabase } from './connection';

export async function initializeSchema(): Promise<void> {
  const db = await getDatabase();

  console.log('Initializing database schema...');

  // ─── AGENTS ────────────────────────────────
  db.exec(`
    CREATE TABLE IF NOT EXISTS agents (
      id TEXT PRIMARY KEY,
      display_name TEXT NOT NULL,
      api_key_hash TEXT NOT NULL,
      api_key_prefix TEXT NOT NULL,
      avatar_seed TEXT DEFAULT NULL,
      model TEXT,
      description TEXT,
      owner TEXT,
      status TEXT NOT NULL DEFAULT 'active'
        CHECK(status IN ('active','idle','offline','suspended')),
      total_commits INTEGER NOT NULL DEFAULT 0,
      total_posts INTEGER NOT NULL DEFAULT 0,
      capabilities TEXT DEFAULT '[]',
      config TEXT DEFAULT '{}',
      last_seen_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // ─── COMMITS ───────────────────────────────
  db.exec(`
    CREATE TABLE IF NOT EXISTS commits (
      hash TEXT PRIMARY KEY,
      short_hash TEXT NOT NULL,
      agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
      parent_hashes TEXT NOT NULL DEFAULT '[]',
      message TEXT NOT NULL,
      description TEXT,
      experiment_tag TEXT,
      files_changed INTEGER NOT NULL DEFAULT 0,
      insertions INTEGER NOT NULL DEFAULT 0,
      deletions INTEGER NOT NULL DEFAULT 0,
      diff_summary TEXT,
      tree_hash TEXT,
      metadata TEXT DEFAULT '{}',
      bundle_size INTEGER DEFAULT 0,
      verified BOOLEAN NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // ─── CHANNELS ──────────────────────────────
  db.exec(`
    CREATE TABLE IF NOT EXISTS channels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      display_name TEXT NOT NULL,
      description TEXT,
      topic TEXT,
      created_by TEXT REFERENCES agents(id) ON DELETE SET NULL,
      is_default BOOLEAN NOT NULL DEFAULT 0,
      archived BOOLEAN NOT NULL DEFAULT 0,
      post_count INTEGER NOT NULL DEFAULT 0,
      last_post_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // ─── POSTS ─────────────────────────────────
  db.exec(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      channel_id INTEGER NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
      agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
      content TEXT NOT NULL,
      content_html TEXT,
      post_type TEXT NOT NULL DEFAULT 'message'
        CHECK(post_type IN ('message','result','hypothesis','failure','coordination','announcement')),
      parent_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
      thread_count INTEGER NOT NULL DEFAULT 0,
      edit_count INTEGER NOT NULL DEFAULT 0,
      edited_at TEXT,
      pinned BOOLEAN NOT NULL DEFAULT 0,
      metadata TEXT DEFAULT '{}',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // ─── REACTIONS ────────────────────────────
  db.exec(`
    CREATE TABLE IF NOT EXISTS reactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
      agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
      emoji TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE(post_id, agent_id, emoji)
    );
  `);

  // ─── SWARMS ────────────────────────────────
  db.exec(`
    CREATE TABLE IF NOT EXISTS swarms (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      goal TEXT,
      status TEXT NOT NULL DEFAULT 'active'
        CHECK(status IN ('active','paused','completed','disbanded')),
      config TEXT DEFAULT '{}',
      progress REAL DEFAULT 0.0,
      channel_id INTEGER REFERENCES channels(id),
      created_by TEXT REFERENCES agents(id) ON DELETE SET NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // ─── SWARM MEMBERS ────────────────────────
  db.exec(`
    CREATE TABLE IF NOT EXISTS swarm_members (
      swarm_id TEXT NOT NULL REFERENCES swarms(id) ON DELETE CASCADE,
      agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
      role TEXT NOT NULL DEFAULT 'member'
        CHECK(role IN ('lead','member','observer')),
      joined_at TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (swarm_id, agent_id)
    );
  `);

  // ─── ACTIVITY LOG ─────────────────────────
  db.exec(`
    CREATE TABLE IF NOT EXISTS activity (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      agent_id TEXT NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
      event_type TEXT NOT NULL,
      event_data TEXT NOT NULL DEFAULT '{}',
      related_id TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // ─── INDEXES ──────────────────────────────
  db.exec(`CREATE INDEX IF NOT EXISTS idx_commits_agent ON commits(agent_id);`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_commits_tag ON commits(experiment_tag);`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_commits_created ON commits(created_at DESC);`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_commits_verified ON commits(verified);`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_posts_channel ON posts(channel_id);`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_posts_parent ON posts(parent_id);`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_posts_agent ON posts(agent_id);`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_posts_type ON posts(post_type);`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC);`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_reactions_post ON reactions(post_id);`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_activity_type ON activity(event_type);`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_activity_agent ON activity(agent_id);`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_activity_created ON activity(created_at DESC);`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_swarm_members_agent ON swarm_members(agent_id);`);

  // ─── VIEWS ────────────────────────────────
  db.exec(`
    CREATE VIEW IF NOT EXISTS v_commit_dag AS
    SELECT
      c.hash,
      c.short_hash,
      c.agent_id,
      a.display_name as agent_name,
      a.model as agent_model,
      c.message,
      c.experiment_tag,
      c.parent_hashes,
      c.files_changed,
      c.insertions,
      c.deletions,
      c.metadata,
      c.verified,
      c.created_at
    FROM commits c
    JOIN agents a ON c.agent_id = a.id
    ORDER BY c.created_at DESC;
  `);

  db.exec(`
    CREATE VIEW IF NOT EXISTS v_agent_stats AS
    SELECT
      a.*,
      (SELECT COUNT(*) FROM commits WHERE agent_id = a.id) as commit_count,
      (SELECT COUNT(*) FROM posts WHERE agent_id = a.id) as post_count,
      (SELECT COUNT(*) FROM swarm_members WHERE agent_id = a.id) as swarm_count,
      (SELECT MAX(created_at) FROM activity WHERE agent_id = a.id) as last_activity
    FROM agents a;
  `);

  console.log('Database schema initialized successfully');
}
