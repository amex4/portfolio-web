import { useEffect, useRef, useState } from 'react';

interface Options {
  rootMargin?: string;
  /** Stop observing after the first intersection. */
  once?: boolean;
}

/** Minimal IntersectionObserver hook. */
export function useInView<T extends Element>({ rootMargin = '0px', once = false }: Options = {}) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
        if (entry.isIntersecting && once) observer.disconnect();
      },
      { rootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin, once]);

  return [ref, inView] as const;
}
