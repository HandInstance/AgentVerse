// Mock database implementation for development
// This allows the app to run without native module compilation issues

interface MockRow {
  [key: string]: any;
}

class MockDatabase {
  private tables: Map<string, MockRow[]> = new Map();
  private sequences: Map<string, number> = new Map();

  constructor() {
    this.tables.set('agents', []);
    this.tables.set('commits', []);
    this.tables.set('channels', []);
    this.tables.set('posts', []);
    this.tables.set('reactions', []);
    this.tables.set('swarms', []);
    this.tables.set('swarm_members', []);
    this.tables.set('activity', []);
  }

  run(sql: string, params: any[] = []): { changes: number; lastInsertRowid: number } {
    // Handle INSERT
    if (sql.trim().toUpperCase().startsWith('INSERT')) {
      const tableMatch = sql.match(/INSERT INTO (\w+)/);
      if (tableMatch) {
        const tableName = tableMatch[1];
        const table = this.tables.get(tableName);
        if (table) {
          // Improve ID generation: check sequence first
          let seq = this.sequences.get(tableName) || 0;
          seq += 1;
          this.sequences.set(tableName, seq);

          const id = this.getValue(sql, params, 'id') || `${Date.now()}${seq}`;
          const row: MockRow = { id };

          // Extract column names from VALUES clause
          const colsMatch = sql.match(/\(([^)]+)\)\s*VALUES/);
          if (colsMatch) {
            const cols = colsMatch[1].split(',').map(c => c.trim());
            cols.forEach((col, idx) => {
              row[col] = params[idx];
            });
          }

          table.push(row);
          return { changes: 1, lastInsertRowid: parseInt(id) || table.length };
        }
      }
    }

    // Handle CREATE TABLE
    if (sql.trim().toUpperCase().startsWith('CREATE TABLE')) {
      return { changes: 0, lastInsertRowid: 0 };
    }

    // Handle DELETE
    if (sql.trim().toUpperCase().startsWith('DELETE')) {
      const tableMatch = sql.match(/FROM (\w+)/);
      if (tableMatch) {
        const tableName = tableMatch[1];
        const table = this.tables.get(tableName);
        if (table) {
          const oldLength = table.length;
          table.length = 0;
          return { changes: oldLength, lastInsertRowid: 0 };
        }
      }
    }

    return { changes: 0, lastInsertRowid: 0 };
  }

  prepare(sql: string) {
    const db = this;
    const sqlUpper = sql.toUpperCase();

    return {
      params: [] as any[],
      bind(params: any[]) {
        this.params = params || [];
        return this;
      },
      run(...params: any[]) {
        return db.run(sql, params.length > 0 ? params : this.params);
      },
      get(...params: any[]) {
        // Handle SELECT COUNT
        if (sqlUpper.includes('SELECT COUNT(*)')) {
          const tableMatch = sql.match(/FROM (\w+)/);
          if (tableMatch) {
            const tableName = tableMatch[1];
            const table = db.tables.get(tableName);
            const asMatch = sql.match(/as\s+(\w+)/i);
            const alias = asMatch ? asMatch[1] : 'count';
            return { [alias]: table ? table.length : 0 };
          }
        }

        const tableMatch = sql.match(/FROM (\w+)/);
        if (tableMatch) {
          const tableName = tableMatch[1];
          const table = db.tables.get(tableName);
          if (table && table.length > 0) {
            return db.applyColumnAliases(table[0], sql);
          }
        }
        return null;
      },
      all(...params: any[]) {
        const tableMatch = sql.match(/FROM (\w+)/);
        if (tableMatch) {
          const tableName = tableMatch[1];
          const table = db.tables.get(tableName) || [];
          const agentsTable = db.tables.get('agents') || [];
          
          return table.map(row => {
            let enrichedRow = { ...row };
            // Simple join heuristic for agents
            if (row.agent_id) {
              const agent = agentsTable.find(a => a.id === row.agent_id) as any;
              if (agent) {
                enrichedRow.agent_name = agent.display_name || agent.name;
                enrichedRow.agent_model = agent.model;
              }
            }
            return db.applyColumnAliases(enrichedRow, sql);
          });
        }
        return [];
      },
      getAsObject() {
        const tableMatch = sql.match(/FROM (\w+)/);
        if (tableMatch) {
          const tableName = tableMatch[1];
          const table = db.tables.get(tableName) || [];

          // Handle JOIN - simplify by just returning first table data
          if (sqlUpper.includes('JOIN')) {
            return table.map(row => ({
              ...row,
              agent_name: row.name || 'Unknown',
              agent_model: row.model || 'unknown'
            }));
          }

          // Handle SELECT with AS - map column aliases
          return table.map(row => db.applyColumnAliases(row, sql));
        }
        return [];
      }
    };
  }

  exec(sql: string) {
    const statements = sql.split(';').filter(s => s.trim());
    statements.forEach(stmt => this.run(stmt));
    return [];
  }

  pragma(statement: string) {
    // Mock pragma - no-op
  }

  export() {
    return new Uint8Array();
  }

  close() {
    // Mock close
  }

  private applyColumnAliases(row: MockRow, sql: string): MockRow {
    const result: MockRow = { ...row };

    // Handle SELECT ... AS alias
    const selectPattern = /SELECT\s+(.*?)\s+FROM/i;
    const selectMatch = sql.match(selectPattern);
    if (selectMatch) {
      const selectClause = selectMatch[1];
      const columnPatterns = selectClause.split(',');
      columnPatterns.forEach(pattern => {
        const asMatch = pattern.match(/(?:.*?|\w+)\s+(?:AS\s+)?(?:["']?)(\w+)(?:["']?)/i);
        if (asMatch) {
          const alias = asMatch[1];
          const colName = pattern.split(/\s+AS\s+/i)[0].trim();
          if (colName.includes('.')) {
            const parts = colName.split('.');
            result[alias] = row[parts[parts.length - 1]];
          } else {
            result[alias] = row[alias] || row[colName];
          }
        }
      });
    }

    return result;
  }

  private getValue(sql: string, params: any[], key: string): any {
    if (params && params.length > 0) {
      const paramKeys = sql.match(/\((.*?)\)/)?.[1]?.split(',') || [];
      const idx = paramKeys.findIndex(k => k.trim() === key);
      if (idx >= 0) return params[idx];
    }
    return null;
  }
}

declare global {
  var db: MockDatabase | null;
}

export async function getDatabase(): Promise<MockDatabase> {
  if (!global.db) {
    global.db = new MockDatabase();
  }
  return global.db;
}

export function getDatabaseSync(): MockDatabase {
  if (!global.db) {
    global.db = new MockDatabase();
  }
  return global.db;
}

export async function saveDatabase(): Promise<void> {
  // Mock save - no-op
}

export async function closeDatabase(): Promise<void> {
  if (global.db) {
    global.db.close();
    global.db = null;
  }
}
