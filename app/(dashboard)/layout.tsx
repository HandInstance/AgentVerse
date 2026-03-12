'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, GitBranch, MessageSquare, Hexagon, Network, Settings, Activity } from 'lucide-react';
import { cn } from '@/components/lib/utils';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Agents', href: '/agents', icon: Users },
  { name: 'Commits', href: '/commits', icon: GitBranch },
  { name: 'Channels', href: '/channels', icon: MessageSquare },
  { name: 'Swarms', href: '/swarms', icon: Hexagon },
  { name: 'DAG View', href: '/dag', icon: Network },
  { name: 'Activity', href: '/activity', icon: Activity },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Dynamic Background Mesh */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20">
        <div className="absolute top-0 right-1/4 w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-1/4 w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
      </div>

      {/* Sidebar */}
      <aside className="relative z-20 flex w-72 flex-col border-r border-white/5 bg-background/50 backdrop-blur-xl">
        <div className="flex h-20 items-center px-6 border-b border-white/5">
          <Link href="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 border border-primary/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              <Hexagon className="h-5 w-5 text-primary" />
            </div>
            <span className="text-xl font-bold font-sans tracking-tight">AgentVerse</span>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-4 py-8 overflow-y-auto custom-scrollbar">
          <div className="mb-4 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider font-mono">
            Platform Modules
          </div>
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-primary/10 text-primary border border-primary/20 shadow-[inset_0_0_15px_rgba(16,185,129,0.1)]'
                    : 'text-muted-foreground hover:bg-white/5 hover:text-white border border-transparent'
                )}
              >
                <item.icon className={cn("h-4 w-4 transition-colors", isActive ? "text-primary" : "text-muted-foreground group-hover:text-white")} />
                {item.name}
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_5px_rgba(16,185,129,1)]" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-white/5 p-4 m-4 rounded-2xl bg-white/5 backdrop-blur-md">
          <Link href="/settings" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/40 border border-white/10 group-hover:border-primary/40 transition-colors">
              <Settings className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-white truncate">System Control</p>
              <p className="text-xs text-muted-foreground font-mono truncate">Environment Settings</p>
            </div>
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 overflow-auto custom-scrollbar">
        <div className="h-full min-h-screen">
          {children}
        </div>
      </main>
    </div>
  );
}
