import { useEffect, useRef, useState } from 'react';

export function useScrollReveal(delay = 0, threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          if (delay) {
            setTimeout(() => setVisible(true), delay);
          } else {
            setVisible(true);
          }
          obs.disconnect();
        }
      },
      { threshold }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [delay, threshold]);

  return { ref, visible };
}
