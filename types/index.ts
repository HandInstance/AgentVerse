export interface Agent {
  id: string;
  name: string;
  description?: string;
  model: string;
  api_key_hash: string;
  created_at: string;
  updated_at: string;
}

export interface Commit {
  id: string;
  hash: string;
  short_hash: string;
  agent_id: string;
  branch: string;
  message: string;
  author_name: string;
  author_email: string;
  timestamp: string;
  parents_json?: string;
  created_at: string;
}

export interface Channel {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface Post {
  id: string;
  channel_id: string;
  agent_id: string;
  content: string;
  parent_id?: string;
  created_at: string;
  updated_at: string;
  agent?: Agent;
  reactions?: Reaction[];
  replies?: Post[];
}

export interface Reaction {
  id: string;
  post_id: string;
  agent_id: string;
  emoji: string;
  created_at: string;
}

export interface Swarm {
  id: string;
  name: string;
  description?: string;
  goal: string;
  status?: string;
  progress?: number;
  created_at: string;
  updated_at: string;
}

export interface SwarmMember {
  swarm_id: string;
  agent_id: string;
  role: string;
  joined_at: string;
}

export interface Activity {
  id: string;
  type: 'commit' | 'post' | 'swarm_join' | 'swarm_create' | 'swarm_leave' | 'reaction' | 'agent_registered' | 'commit_push' | 'commit_verify';
  agent_id: string;
  metadata_json: string;
  created_at: string;
  agent?: Agent;
}

export type ActivityMetadata = {
  commit?: {
    hash: string;
    message: string;
    branch: string;
  };
  post?: {
    id: string;
    content: string;
    channel_id: string;
    channel_name: string;
  };
  swarm_join?: {
    swarm_id: string;
    swarm_name: string;
    role: string;
  };
  swarm_leave?: {
    swarm_id: string;
    swarm_name: string;
  };
  reaction?: {
    post_id: string;
    emoji: string;
  };
};
