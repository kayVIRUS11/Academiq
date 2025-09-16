
'use client';

import { useState, useEffect } from 'react';
import { useToast } from './use-toast';
import { syncOfflineRequests } from '@/lib/offline-sync';

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check initial status
    if (typeof window !== 'undefined' && typeof window.navigator !== 'undefined') {
        setIsOnline(window.navigator.onLine);
    }

    const handleOnline = async () => {
      setIsOnline(true);
      toast({ title: 'You are back online!', description: 'Syncing any pending changes...' });
      try {
        await syncOfflineRequests();
        toast({ title: 'Sync Complete!', description: 'Your data is up to date.'});
        // Optionally, trigger a data re-fetch for all contexts
        window.location.reload();
      } catch (error) {
        console.error('Sync failed', error);
        toast({ title: 'Sync Failed', description: 'Could not sync all offline changes.', variant: 'destructive'});
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast({ title: 'You are now offline', description: 'Changes will be saved locally and synced when you return.' });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [toast]);

  return isOnline;
}
