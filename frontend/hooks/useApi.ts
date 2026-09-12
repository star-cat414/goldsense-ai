"use client";

import { useCallback, useEffect, useState, type DependencyList } from "react";

export interface ApiState<T> {
  data: T | undefined;
  loading: boolean;
  error: Error | undefined;
  retry: () => void;
}

export function useApi<T>(fetcher: () => Promise<T>, deps: DependencyList = []): ApiState<T> {
  const [data, setData] = useState<T | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | undefined>(undefined);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    const controller = typeof AbortController !== "undefined" ? new AbortController() : undefined;
    setLoading(true);
    setError(undefined);

    fetcher()
      .then((result) => {
        if (active) {
          setData(result);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (active) {
          setError(err instanceof Error ? err : new Error("Request failed."));
          setLoading(false);
        }
      });

    return () => {
      active = false;
      controller?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, attempt]);

  const retry = useCallback(() => {
    setAttempt((value) => value + 1);
  }, []);

  return { data, loading, error, retry };
}