import { useEffect, useState } from 'react';
import { supabase } from './supabase';

interface UseSupabaseDataOptions {
  table: string;
  select?: string;
  limit?: number;
}

export function useSupabaseData<T = any>(options: UseSupabaseDataOptions) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!supabase) {
        setError(new Error('Supabase not initialized'));
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        let query = supabase.from(options.table).select(options.select || '*');

        if (options.limit) {
          query = query.limit(options.limit);
        }

        const { data, error } = await query;

        if (error) {
          setError(error);
          setData([]);
        } else {
          setData(data || []);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [options.table, options.select, options.limit]);

  return { data, loading, error };
}
