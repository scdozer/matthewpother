import { useCallback, useRef } from "react";

export function useDebounce<T extends (index: number) => void>(
  callback: T,
  delay: number
): (index: number) => void {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastIndexRef = useRef<number | null>(null);

  return useCallback(
    (index: number) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      lastIndexRef.current = index;

      timeoutRef.current = setTimeout(() => {
        if (lastIndexRef.current !== null) {
          callback(lastIndexRef.current);
        }
      }, delay);
    },
    [callback, delay]
  );
}
