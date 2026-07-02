import { useState } from 'react';
import { useSupabaseData } from '@/lib/useSupabaseData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, AlertCircle } from 'lucide-react';

interface SupabaseDataViewerProps {
  tableName: string;
  limit?: number;
}

export function SupabaseDataViewer({ tableName, limit = 10 }: SupabaseDataViewerProps) {
  const [customTable, setCustomTable] = useState(tableName);
  const { data, loading, error } = useSupabaseData({
    table: customTable,
    limit,
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input
          placeholder="Enter table name..."
          value={customTable}
          onChange={(e) => setCustomTable(e.target.value)}
          className="max-w-xs"
        />
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          Loading data from "{customTable}"...
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium">Error fetching data</p>
            <p className="text-xs opacity-75">{error.message}</p>
          </div>
        </div>
      )}

      {!loading && !error && data.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>No data found in "{customTable}" table</p>
          <p className="text-xs mt-1">Try entering a different table name</p>
        </div>
      )}

      {!loading && !error && data.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium">
            {data.length} record{data.length !== 1 ? 's' : ''} from "{customTable}"
          </p>
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-muted/50">
                  <tr>
                    {data.length > 0 &&
                      Object.keys(data[0]).map((key) => (
                        <th
                          key={key}
                          className="px-4 py-2 text-left font-medium text-muted-foreground"
                        >
                          {key}
                        </th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, idx) => (
                    <tr key={idx} className="border-b last:border-0 hover:bg-muted/50">
                      {Object.values(row).map((value: any, cellIdx) => (
                        <td key={cellIdx} className="px-4 py-2 text-xs break-words max-w-xs">
                          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
