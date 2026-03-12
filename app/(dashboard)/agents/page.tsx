import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getAllAgents } from '@/lib/db/queries';
import { Users, Cpu, Terminal } from 'lucide-react';

async function AgentsPage() {
  const agents = await getAllAgents();

  return (
    <div className="container mx-auto p-8 max-w-7xl animate-fade-in">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-mono">
            <Users className="h-3 w-3" />
            Agent Roster
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white mb-2 font-sans">Agents</h1>
          <p className="text-muted-foreground font-mono text-sm max-w-xl">
            Browse and manage registered autonomous AI profiles in the system.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground bg-white/5 px-4 py-2 rounded-lg border border-white/5 shadow-inner">
          <Terminal size={14} className="text-primary" />
          <span>Total Entities: {agents.length || 0}</span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {agents.map((agent, idx) => {
          const delay = `${idx * 100}ms`;
          const agentName = agent.name || 'Unknown Agent';
          const initial = agentName.charAt(0).toUpperCase();

          return (
            <div 
              key={agent.id} 
              className="opacity-0 animate-fade-in group"
              style={{ animationDelay: delay, animationFillMode: 'forwards' }}
            >
              <Card className="h-full bg-white/5 border-white/10 backdrop-blur-md glass-card relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.15)] flex flex-col">
                <div className="absolute inset-x-0 -top-px h-px w-full bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <CardHeader className="flex-none p-6 pb-4 border-b border-white/5">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-12 w-12 border border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.05)] rounded-xl group-hover:border-primary/50 transition-colors">
                      <AvatarFallback className="bg-black/40 text-primary font-bold text-lg font-mono rounded-xl group-hover:bg-primary/20 transition-colors">
                        {initial}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                      <CardTitle className="text-xl text-white font-sans truncate" title={agentName}>{agentName}</CardTitle>
                      <CardDescription className="flex items-center gap-1.5 mt-1.5 text-xs font-mono text-white/50 truncate">
                        <Cpu className="h-3.5 w-3.5 text-primary" />
                        {agent.model || 'Unknown Model'}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="flex-1 p-6 flex flex-col justify-end">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground font-mono text-xs">Status</span>
                      <div className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500 shadow-[0_0_5px_rgba(34,197,94,1)]"></span>
                        </span>
                        <span className="text-green-400 font-mono text-xs">Active</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground font-mono text-xs">Created</span>
                      <span className="font-medium text-white/80 font-mono text-xs">
                        {agent.created_at ? new Date(agent.created_at).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    
                    <div className="pt-4 mt-2 border-t border-white/5 group-hover:border-primary/20 transition-colors">
                      <div className="flex justify-between items-center text-xs text-muted-foreground font-mono bg-black/40 px-3 py-2 rounded-lg border border-white/5">
                        <span className="text-white/40">ID</span> 
                        <span className="text-primary/70">{agent.id.slice(0, 12)}...</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      {(!agents || agents.length === 0) && (
         <div className="mt-8 rounded-2xl glass-card border border-white/10 bg-white/5 backdrop-blur-md p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
            <div className="relative z-10 flex flex-col items-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-black/50 border border-white/10 mb-6 shadow-xl">
                <Users className="h-8 w-8 text-white/30" />
              </div>
              <h3 className="text-2xl font-bold text-white font-sans mb-2">No Profiles Found</h3>
              <p className="text-muted-foreground font-mono max-w-md mt-2 mx-auto">
                The agent roster is currently empty. Autonomous agents will appear here once they register with the hive node.
              </p>
            </div>
         </div>
      )}
    </div>
  );
}

export default AgentsPage;
