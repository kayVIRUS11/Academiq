import { useState, useEffect } from 'react';
import { useSupabase } from '@/supabase';

export function useSupabaseRealtime<T extends { id: string }>(table: string, orderByCol?: string, ascending: boolean = true) {
    const { supabase, user } = useSupabase();
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || !supabase) {
            setData([]);
            setLoading(false);
            return;
        }

        setLoading(true);

        const fetchData = async () => {
            let query = supabase.from(table).select('*').eq('uid', user.id);
            if (orderByCol) {
                query = query.order(orderByCol, { ascending });
            }
            
            const { data: fetchedData, error } = await query;
            
            if (!error && fetchedData) {
                setData(fetchedData as unknown as T[]);
            } else if (error) {
                console.error(`Error fetching ${table}:`, error);
            }
            setLoading(false);
        };

        fetchData();

        const channelname = `public:${table}:${user.id}`;
        const channel = supabase.channel(channelname)
            .on('postgres_changes', { event: '*', schema: 'public', table: table, filter: `uid=eq.${user.id}` }, (payload) => {
                if (payload.eventType === 'INSERT') {
                    setData(prev => {
                        const exists = prev.find(item => item.id === payload.new.id);
                        if (exists) return prev;
                        let next = [...prev, payload.new as unknown as T];
                        // Simplistic re-sort
                        if (orderByCol) {
                            next.sort((a: any, b: any) => {
                                if (a[orderByCol] < b[orderByCol]) return ascending ? -1 : 1;
                                if (a[orderByCol] > b[orderByCol]) return ascending ? 1 : -1;
                                return 0;
                            });
                        }
                        return next;
                    });
                } else if (payload.eventType === 'UPDATE') {
                    setData(prev => prev.map(item => item.id === payload.new.id ? payload.new as unknown as T : item));
                } else if (payload.eventType === 'DELETE') {
                    setData(prev => prev.filter(item => item.id !== payload.old.id));
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [user, supabase, table, orderByCol, ascending]);

    return { data, setData, loading };
}
