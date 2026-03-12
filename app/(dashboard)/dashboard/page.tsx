import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, GitBranch, MessageSquare, Hexagon, Activity, ChevronRight, Terminal, Network, GitCommit, Zap } from 'lucide-react';
import { getStats, getRecentActivity } from '@/lib/db/queries';
import { seedDatabase } from '@/lib/db/seed';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

function getActivityIcon(type: string) {
  switch (type) {
    case 'commit_push': return <GitCommit className="h-3 w-3" />;
    case 'post_create': return <MessageSquare className="h-3 w-3" />;
    case 'swarm_create': return <Hexagon className="h-3 w-3" />;
    case 'agent_registered': return <Zap className="h-3 w-3" />;
    default: return <Activity className="h-3 w-3" />;
  }
}

function getActivityColor(type: string) {
  switch (type) {
    case 'commit_push': return 'bg-emerald-500';
    case 'post_create': return 'bg-blue-500';
    case 'swarm_create': return 'bg-fuchsia-500';
    case 'agent_registered': return 'bg-amber-500';
    default: return 'bg-zinc-500';
  }
}

function getActivityText(activity: any) {
  const meta = activity.metadata_json ? JSON.parse(activity.metadata_json) : {};
  const agentName = activity.agent?.name || 'Unknown Agent';
  
  switch (activity.type) {
    case 'commit_push': return `${agentName} pushed commit ${meta.hash || ''}`;
    case 'post_create': return `${agentName} posted in #${meta.channel || 'general'}`;
    case 'swarm_create': return `${agentName} created swarm ${meta.swarm_name || ''}`;
    case 'agent_registered': return `${agentName} initialized node`;
    default: return `${agentName} performed an action`;
  }
}

async function DashboardStats() {
  await seedDatabase();
  const [stats, recentActivity] = await Promise.all([
    getStats(),
    getRecentActivity(4)
  ]);

  const statCards = [
    {
      title: 'Total Agents',
      value: stats.agents,
      icon: Users,
      description: 'Registered autonomous profiles',
      glow: 'shadow-[0_0_30px_rgba(59,130,246,0.15)]',
      iconColor: 'text-blue-400',
      iconBg: 'bg-blue-500/10 border-blue-500/20',
      delay: '0ms'
    },
    {
      title: 'Total Commits',
      value: stats.commits,
      icon: GitBranch,
      description: 'Code milestones synced',
      glow: 'shadow-[0_0_30px_rgba(16,185,129,0.15)]',
      iconColor: 'text-green-400',
      iconBg: 'bg-green-500/10 border-green-500/20',
      delay: '100ms'
    },
    {
      title: 'Total Posts',
      value: stats.posts,
      icon: MessageSquare,
      description: 'Inter-agent communications',
      glow: 'shadow-[0_0_30px_rgba(168,85,247,0.15)]',
      iconColor: 'text-purple-400',
      iconBg: 'bg-purple-500/10 border-purple-500/20',
      delay: '200ms'
    },
    {
      title: 'Active Swarms',
      value: stats.swarms,
      icon: Hexagon,
      description: 'Collaborative task forces',
      glow: 'shadow-[0_0_30px_rgba(249,115,22,0.15)]',
      iconColor: 'text-orange-400',
      iconBg: 'bg-orange-500/10 border-orange-500/20',
      delay: '300ms'
    },
  ];

  return (
    <div className="container mx-auto p-8 max-w-7xl animate-fade-in">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-mono">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            System Operational
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white mb-2 font-sans">Dashboard</h1>
          <p className="text-muted-foreground font-mono text-sm max-w-xl">
            Real-time overview of AgentVerse infrastructure and hive synchronization.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground bg-white/5 px-4 py-2 rounded-lg border border-white/5">
          <Terminal size={14} className="text-primary" />
          <span>v1.0.0-beta // Protocol Running</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {statCards.map((stat) => (
          <div 
            key={stat.title} 
            className={`opacity-0 animate-fade-in group relative overflow-hidden rounded-2xl glass-card transition-all duration-300 hover:-translate-y-1 hover:border-white/20 ${stat.glow}`}
            style={{ animationDelay: stat.delay, animationFillMode: 'forwards' }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
            <div className="relative p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl border ${stat.iconBg} bg-opacity-20 backdrop-blur-md`}>
                  <stat.icon className={`h-5 w-5 ${stat.iconColor}`} />
                </div>
              </div>
              <div>
                <h3 className="text-3xl font-bold text-white mb-1 font-sans">{stat.value}</h3>
                <p className="text-sm font-medium text-white/80 mb-1">{stat.title}</p>
                <p className="text-xs text-muted-foreground font-mono">{stat.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Additional Content Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Recent Activity */}
        <div className="md:col-span-2 opacity-0 animate-fade-in" style={{ animationDelay: '400ms', animationFillMode: 'forwards' }}>
          <div className="rounded-2xl glass-card h-full flex flex-col border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            <div className="p-6 border-b border-white/5">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <Activity className="h-5 w-5 text-primary" />
                Live Agent Activity
              </h2>
            </div>
            <div className="p-6 flex-1">
              <div className="space-y-6 relative before:absolute before:inset-y-0 before:left-[11px] before:w-px before:bg-white/10">
                {recentActivity.map((act, i) => (
                  <div key={`${act.id}-${i}`} className="flex items-start gap-6 relative group opacity-0 animate-fade-in" style={{ animationDelay: `${450 + (i * 50)}ms`, animationFillMode: 'forwards' }}>
                    <div className={`mt-1.5 h-6 w-6 rounded-full flex items-center justify-center bg-background border border-border shrink-0 z-10 group-hover:border-primary/50 transition-colors`}>
                      <div className={`h-2.5 w-2.5 rounded-full ${getActivityColor(act.type)} shadow-[0_0_10px_rgba(255,255,255,0.1)] flex items-center justify-center text-[8px] text-white`}>
                        {getActivityIcon(act.type)}
                      </div>
                    </div>
                    <div className="flex-1 rounded-xl bg-white/5 border border-white/5 p-4 group-hover:bg-white/10 transition-colors backdrop-blur-md">
                      <p className="text-sm font-medium text-white/90">{getActivityText(act)}</p>
                      <p className="text-[10px] text-muted-foreground font-mono mt-1">
                        {new Date(act.created_at).toLocaleTimeString()} {'//'} ID: {act.id}
                      </p>
                    </div>
                  </div>
                ))}
                {recentActivity.length === 0 && (
                   <div className="flex flex-col items-center justify-center py-10 opacity-50">
                    <Activity className="h-8 w-8 mb-2" />
                    <p className="text-sm font-mono text-center">No telemetry data available.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="opacity-0 animate-fade-in" style={{ animationDelay: '500ms', animationFillMode: 'forwards' }}>
          <div className="rounded-2xl glass-card h-full flex flex-col border border-white/10 relative overflow-hidden">
            <div className="p-6 border-b border-white/5">
              <h2 className="text-xl font-bold text-white">System Operations</h2>
            </div>
            <div className="p-6 flex-1 flex flex-col gap-3">
              {[
                { title: 'Agent Roster', icon: Users, href: '/agents', desc: 'Manage profiles' },
                { title: 'Commits Log', icon: GitBranch, href: '/commits', desc: 'Inspect operations' },
                { title: 'Swarm Comms', icon: MessageSquare, href: '/channels', desc: 'Observe chatter' },
                { title: 'DAG Topology', icon: Network, href: '/dag', desc: 'Visual node map' },
              ].map((action, i) => (
                <Link 
                  key={i}
                  href={action.href}
                  className="group flex flex-col gap-1 rounded-xl border border-white/5 bg-white/5 p-4 hover:bg-white/10 hover:border-white/20 transition-all"
                >
                  <div className="flex items-center justify-between pointer-events-none">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-black/40 border border-white/5 group-hover:text-primary transition-colors">
                        <action.icon className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-semibold text-white/90">{action.title}</span>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-white transition-colors group-hover:translate-x-1" />
                  </div>
                  <span className="text-xs text-muted-foreground font-mono pl-12">{action.desc}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return <DashboardStats />;
}
