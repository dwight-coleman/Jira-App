import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

/**
 * A filter value backed by a URL query parameter, so any filtered view can be
 * copied out of the address bar and shared — the recipient lands on exactly the
 * same slice of data.
 *
 * Values equal to `fallback` are removed from the URL rather than serialised,
 * keeping links short and the default state clean.
 */
export function useUrlFilter(key: string, fallback: string): [string, (value: string) => void] {
  const [params, setParams] = useSearchParams();
  const value = params.get(key) ?? fallback;

  const setValue = useCallback(
    (next: string) => {
      setParams(
        (prev) => {
          const updated = new URLSearchParams(prev);
          if (next === fallback || next === '') updated.delete(key);
          else updated.set(key, next);
          return updated;
        },
        { replace: true }
      );
    },
    [key, fallback, setParams]
  );

  return [value, setValue];
}

/** Clears a set of filter params in one history entry. */
export function useClearUrlFilters(keys: string[]): () => void {
  const [, setParams] = useSearchParams();
  return useCallback(() => {
    setParams(
      (prev) => {
        const updated = new URLSearchParams(prev);
        keys.forEach((k) => updated.delete(k));
        return updated;
      },
      { replace: true }
    );
  }, [keys, setParams]);
}
