import { useState, useEffect } from 'react';
import { readStorage, writeStorage } from '../utils/storage';

/** useState와 같지만 값이 localStorage에 유지된다. revive로 저장된 JSON을 원래 타입으로 복원한다. */
export function usePersistentState<T>(
  key: string,
  initial: T,
  revive?: (raw: unknown) => T,
) {
  const [value, setValue] = useState<T>(() => {
    const stored = readStorage<unknown>(key, undefined);
    if (stored === undefined) return initial;
    return revive ? revive(stored) : (stored as T);
  });

  useEffect(() => {
    writeStorage(key, value);
  }, [key, value]);

  return [value, setValue] as const;
}
