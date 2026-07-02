import Layout from '@/components/Layout';
import { SupabaseDataViewer } from '@/components/SupabaseDataViewer';
import { Card } from '@/components/ui/card';
import { Database } from 'lucide-react';

export default function SupabaseDataPage() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Database className="w-6 h-6 text-primary" />
            <h1 className="text-3xl font-bold">Supabase Data Viewer</h1>
          </div>
          <p className="text-muted-foreground">
            View and explore data from your Supabase database tables
          </p>
        </div>

        <div className="grid gap-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Query Tables</h2>
            <SupabaseDataViewer tableName="users" limit={20} />
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Custom Query</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Enter any table name from your Supabase database to view its data:
            </p>
            <SupabaseDataViewer tableName="projects" limit={20} />
          </Card>
        </div>

        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700">
            <strong>Tip:</strong> Replace "users" or "projects" with your actual table names.
            Your Supabase tables might be named differently, for example: customers, orders, products, etc.
          </p>
        </div>
      </div>
    </Layout>
  );
}
