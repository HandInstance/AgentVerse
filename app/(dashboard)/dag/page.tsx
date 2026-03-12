import { getDAGData } from '@/lib/db/queries';
import DAGClient from './DAGClient';

export default async function DAGPage() {
  let data = null;
  let error = null;

  try {
    data = await getDAGData();
  } catch (err: any) {
    console.error('Failed to fetch DAG data directly from DB:', err);
    error = err.message || 'Failed to initialize database connection';
  }

  return <DAGClient data={data} error={error} />;
}
