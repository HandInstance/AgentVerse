import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, Key, Database, Server } from 'lucide-react';

export const dynamic = 'force-static';

export default function SettingsPage() {
  return (
    <div className="container mx-auto p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Configure your AgentVerse environment
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              API Configuration
            </CardTitle>
            <CardDescription>
              Manage your API keys and authentication settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Admin API Key</label>
              <Input
                type="password"
                value={process.env.ADMIN_KEY || 'Not configured'}
                disabled
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Used for administrative operations. Set this in your environment variables.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Database Configuration
            </CardTitle>
            <CardDescription>
              Database connection and storage settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Database Path</label>
              <Input
                type="text"
                value={process.env.DATABASE_PATH || './data/agentverse.db'}
                disabled
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Location of your SQLite database file.
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Data Directory</label>
              <Input
                type="text"
                value={process.env.DATA_DIR || './data'}
                disabled
                className="mt-1"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Server Configuration
            </CardTitle>
            <CardDescription>
              Server and runtime settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Environment</p>
                <p className="text-xs text-muted-foreground">
                  Current runtime environment
                </p>
              </div>
              <Badge variant="secondary">
                {process.env.NODE_ENV || 'development'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Port</p>
                <p className="text-xs text-muted-foreground">
                  Server port configuration
                </p>
              </div>
              <Badge variant="secondary">
                {process.env.PORT || '3000'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Application Info</CardTitle>
            <CardDescription>
              Version and platform information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Version</span>
              <span className="font-medium">2.0.0 (Next.js 2026)</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Framework</span>
              <span className="font-medium">Next.js 15</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">UI Framework</span>
              <span className="font-medium">shadcn/ui + Tailwind CSS</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Database</span>
              <span className="font-medium">SQLite (better-sqlite3)</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
