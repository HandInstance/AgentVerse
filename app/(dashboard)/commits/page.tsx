import { GitBranch, GitCommit, Clock, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { getAllCommits } from '@/lib/db/queries';

export const dynamic = 'force-dynamic';

async function CommitsPage() {
  const commits = await getAllCommits();

  return (
    <div className="container mx-auto p-8 max-w-7xl animate-fade-in">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-mono">
            <GitBranch className="h-3 w-3" />
            Commit History
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white mb-2 font-sans">
            Version Control
          </h1>
          <p className="text-muted-foreground font-mono text-sm max-w-xl">
            Browse sequential and parallel code changes from all autonomous agents.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground bg-white/5 px-4 py-2 rounded-lg border border-white/5 shadow-inner">
          Total Commits: 
          <span className="text-primary font-bold">{commits.length}</span>
        </div>
      </div>

      <div className="grid gap-4">
        {commits.map((commit, idx) => (
          <div 
            key={`${commit.id || commit.hash}-${idx}`} 
            className="group relative rounded-xl glass-card border border-white/5 bg-white/5 p-6 transition-all duration-300 hover:border-primary/30 hover:bg-white/10 overflow-hidden"
          >
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="flex items-start gap-5">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/40 text-primary group-hover:bg-primary/10 transition-colors shadow-inner relative overflow-hidden">
                <GitCommit className="h-6 w-6 relative z-10" />
                <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-2">
                  <h3 className="font-semibold text-lg text-white font-sans truncate pr-4">
                    {commit.message}
                  </h3>
                  <div className="shrink-0 flex items-center gap-2">
                    <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5 font-mono text-[10px] tracking-wider uppercase">
                      {commit.branch || 'MAIN'}
                    </Badge>
                    <Badge variant="secondary" className="font-mono text-xs bg-black/40 text-muted-foreground border border-white/10">
                      {commit.hash && commit.hash.length > 8 ? commit.hash.slice(0, 8) : commit.hash || 'unknown'}
                    </Badge>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-3 text-xs text-muted-foreground font-mono">
                  <span className="flex items-center gap-1.5 bg-black/20 px-2 py-1 rounded-md border border-white/5">
                    <Clock className="h-3 w-3 text-primary/70" />
                    {new Date(commit.created_at).toLocaleString()}
                  </span>
                  
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/50" />
                    Agent ID: <span className="text-white/70">{commit.agent_id ? commit.agent_id.slice(0, 8) : 'unknown'}...</span>
                  </span>

                  {(commit.parents_json && JSON.parse(commit.parents_json || '[]').length > 0) && (
                    <span className="flex items-center gap-1.5 ml-auto text-primary/60 hover:text-primary transition-colors cursor-pointer">
                      View Parent <ArrowRight className="h-3 w-3" />
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {commits.length === 0 && (
        <div className="glass-card rounded-2xl border border-white/5 p-12 flex flex-col items-center justify-center text-center bg-white/5 relative overflow-hidden shadow-2xl mt-8">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-50" />
          <div className="flex items-center justify-center w-20 h-20 rounded-full bg-black/40 border border-white/10 mb-6 shadow-inner relative z-10">
            <GitBranch className="h-10 w-10 text-primary/50" />
          </div>
          <h3 className="text-2xl font-bold text-white mb-3 font-sans relative z-10">No commits yet</h3>
          <p className="text-muted-foreground max-w-md mx-auto font-mono text-sm relative z-10 leading-relaxed">
            Commits will appear here when agents push code to repositories. 
            Initiate an action to start filling the history.
          </p>
        </div>
      )}
    </div>
  );
}

export default CommitsPage;
