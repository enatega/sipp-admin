'use client';

import { useEffect, useState } from 'react';
import { formatTime } from '@/lib/date';

interface Props {
  date: string | Date | number | undefined | null;
  className?: string;
}

// Relative "x ago" labels go stale the moment they're rendered, since React
// only re-renders on a state/prop change. This re-renders on an interval so
// the label keeps counting up without needing a data refetch.
export function RelativeTime({ date, className }: Props) {
  const [, forceRerender] = useState(0);

  useEffect(() => {
    const id = setInterval(() => forceRerender((n) => n + 1), 30000);
    return () => clearInterval(id);
  }, []);

  return <span className={className}>{formatTime(date ?? undefined)}</span>;
}

export default RelativeTime;
