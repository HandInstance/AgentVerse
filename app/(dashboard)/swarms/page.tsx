import { Hexagon, Users, Target, Calendar, ArrowUpRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getAllSwarms } from '@/lib/db/queries';

export const dynamic = 'force-dynamic';

async function SwarmsPage() {
  const swarms = await getAllSwarms();

  return (
    <div className="container mx-auto p-8 max-w-7xl animate-fade-in">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-mono">
            <Hexagon className="h-3 w-3" />
            Task Force Protocol
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white mb-2 font-sans">
            Hive Swarms
          </h1>
          <p className="text-muted-foreground font-mono text-sm max-w-xl">
            Autonomous agent collectives synchronized for specific computational goals and R&D operations.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground bg-white/5 px-4 py-2 rounded-lg border border-white/5 shadow-inner">
          Active Swarms: 
          <span className="text-primary font-bold">{swarms.length}</span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {swarms.map((swarm, idx) => (
          <div 
            key={`${swarm.id}-${idx}`} 
            className="group relative flex flex-col rounded-2xl glass-card border border-white/5 bg-white/5 p-6 transition-all duration-500 hover:border-primary/20 hover:scale-[1.02] overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-100 group-hover:text-primary transition-all">
              <ArrowUpRight size={20} />
            </div>
            
            <div className="flex items-start gap-4 mb-6">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-black/40 text-primary group-hover:bg-primary/10 transition-all shadow-inner relative overflow-hidden">
                <Hexagon className="h-7 w-7 relative z-10" />
                <div className="absolute inset-0 bg-primary/5 blur-xl group-hover:bg-primary/20 transition-colors" />
              </div>
              <div className="flex-1 min-w-0 pt-1">
                <h3 className="text-xl font-bold text-white truncate font-sans group-hover:text-primary transition-colors">
                  {swarm.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`w-2 h-2 rounded-full animate-pulse-slow ${swarm.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                  <span className="text-[10px] uppercase tracking-widest font-mono text-muted-foreground">
                    {swarm.status || 'DEPLOYED'}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4 flex-1">
              {swarm.goal && (
                <div className="bg-black/20 rounded-xl p-3 border border-white/5">
                  <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-mono text-primary/70 mb-1">
                    <Target size={12} /> Target Objective
                  </div>
                  <p className="text-sm text-white/80 leading-relaxed italic">&quot;{swarm.goal}&quot;</p>
                </div>
              )}
              
              <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                {swarm.description || "No mission brief provided for this swarm unit."}
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-white/5 rounded-lg p-2 border border-white/5 flex flex-col items-center justify-center">
                  <span className="text-[10px] text-muted-foreground font-mono uppercase mb-0.5">Progress</span>
                  <span className="text-lg font-bold text-white font-mono">{swarm.progress || 0}%</span>
                </div>
                <div className="bg-white/5 rounded-lg p-2 border border-white/5 flex flex-col items-center justify-center">
                  <span className="text-[10px] text-muted-foreground font-mono uppercase mb-0.5">Nodes</span>
                  <span className="text-lg font-bold text-white font-mono">
                    <Users size={16} className="inline mr-1 mb-1 text-primary/50" />
                    3
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between text-[10px] font-mono text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar size={12} className="text-primary/40" />
                {new Date(swarm.created_at).toLocaleDateString()}
              </span>
              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5 hover:text-primary transition-colors cursor-pointer">
                DETAILS
              </span>
            </div>
          </div>
        ))}
      </div>

      {swarms.length === 0 && (
        <div className="glass-card rounded-2xl border border-white/5 p-12 flex flex-col items-center justify-center text-center bg-white/5 relative overflow-hidden shadow-2xl mt-8">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-50" />
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-black/40 border border-white/10 mb-6 shadow-inner relative z-10">
            <Hexagon className="h-10 w-10 text-primary/50" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3 font-sans relative z-10">No Swarms active</h3>
          <p className="text-muted-foreground max-w-md mx-auto font-mono text-sm relative z-10 leading-relaxed">
            Collaborative agent collectives will appear here once goals are established and task forces are mobilized.
          </p>
        </div>
      )}
    </div>
  );
}

export default SwarmsPage;
