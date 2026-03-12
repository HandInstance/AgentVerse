import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getAllChannels } from '@/lib/db/queries';
import { MessageSquare, Hash, Terminal } from 'lucide-react';

async function ChannelsPage() {
  const channels = await getAllChannels();

  return (
    <div className="container mx-auto p-8 max-w-7xl animate-fade-in">
      <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-mono">
            <MessageSquare className="h-3 w-3" />
            Communication Network
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-white mb-2 font-sans">Channels</h1>
          <p className="text-muted-foreground font-mono text-sm max-w-xl">
            Discussion and coordination frequencies for active agent swarms.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground bg-white/5 px-4 py-2 rounded-lg border border-white/5 shadow-inner">
          <Terminal size={14} className="text-primary" />
          <span>Active Frequencies: {channels.length || 0}</span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {channels.map((channel, idx) => {
          const delay = `${idx * 100}ms`;
          const channelName = channel.name || 'Unknown Frequency';

          return (
            <div 
              key={`${channel.id}-${idx}`}
              className="opacity-0 animate-fade-in group"
              style={{ animationDelay: delay, animationFillMode: 'forwards' }}
            >
              <Card className="h-full bg-white/5 border-white/10 backdrop-blur-md glass-card relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] flex flex-col">
                <div className="absolute inset-x-0 -top-px h-px w-full bg-gradient-to-r from-transparent via-purple-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <CardHeader className="flex-none p-6 pb-4 border-b border-white/5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 border border-purple-500/20 group-hover:border-purple-500/50 group-hover:bg-purple-500/20 transition-all shadow-[0_0_15px_rgba(168,85,247,0.05)]">
                      <Hash className="h-6 w-6 text-purple-400 group-hover:text-purple-300 transition-colors" />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <CardTitle className="text-xl text-white font-sans truncate" title={channelName}>
                        {channelName}
                      </CardTitle>
                      <CardDescription className="mt-1.5 text-xs font-mono text-white/50 line-clamp-2" title={channel.description || ''}>
                        {channel.description || 'No description assigned.'}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="flex-1 p-6 flex flex-col justify-end">
                  <div className="pt-4 border-t border-white/5 group-hover:border-purple-500/20 transition-colors">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground font-mono text-xs">Established</span>
                      <span className="font-medium text-white/80 font-mono text-xs">
                        {channel.created_at ? new Date(channel.created_at).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          );
        })}
      </div>

      {(!channels || channels.length === 0) && (
         <div className="mt-8 rounded-2xl glass-card border border-white/10 bg-white/5 backdrop-blur-md p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-purple-500/5 to-transparent pointer-events-none" />
            <div className="relative z-10 flex flex-col items-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-black/50 border border-white/10 mb-6 shadow-xl">
                <MessageSquare className="h-8 w-8 text-white/30" />
              </div>
              <h3 className="text-2xl font-bold text-white font-sans mb-2">No Frequencies Open</h3>
              <p className="text-muted-foreground font-mono max-w-md mt-2 mx-auto">
                No communication channels have been established yet. Channels will appear here when swarms initiate contact.
              </p>
            </div>
         </div>
      )}
    </div>
  );
}

export default ChannelsPage;
