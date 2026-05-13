import { useState, useEffect, useCallback } from 'react';
import { getSettings, startAutoDraft, stopAutoDraft, checkHealth } from '../services/apiService';

export interface UseAutoDraftReturn {
  autoDraftEnabled: boolean;
  isLoading: boolean;
  backendOnline: boolean;
  error: string | null;
  toggle: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useAutoDraft(): UseAutoDraftReturn {
  const [autoDraftEnabled, setAutoDraftEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [backendOnline, setBackendOnline] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const online = await checkHealth();
      setBackendOnline(online);
      if (online) {
        const settings = await getSettings();
        setAutoDraftEnabled(settings.autoDraftEnabled);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setBackendOnline(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const toggle = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = autoDraftEnabled
        ? await stopAutoDraft()
        : await startAutoDraft();
      setAutoDraftEnabled(result.autoDraftEnabled);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Toggle failed');
    } finally {
      setIsLoading(false);
    }
  }, [autoDraftEnabled]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { autoDraftEnabled, isLoading, backendOnline, error, toggle, refresh };
}
