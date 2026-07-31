import React, { useMemo } from 'react';
import { useUser } from '../contexts/UserContext';

interface ActivityKolamProps {
  days?: number;
  className?: string;
}

/**
 * A dot-grid activity tracker styled after kolam (Tamil threshold art):
 * each dot represents a day, brightening with how much practice happened.
 * This is a genuinely new feature (not present in the original app) built
 * entirely from existing session data, so it needs no backend changes.
 */
const ActivityKolam: React.FC<ActivityKolamProps> = ({ days = 35, className = '' }) => {
  const { sessions } = useUser();

  const cells = useMemo(() => {
    const counts = new Map<string, number>();
    sessions.forEach((session) => {
      const date = new Date(session.completedAt);
      if (Number.isNaN(date.getTime())) return;
      const key = date.toISOString().slice(0, 10);
      counts.set(key, (counts.get(key) || 0) + 1);
    });

    const today = new Date();
    const result: { key: string; count: number; isToday: boolean }[] = [];
    for (let i = days - 1; i >= 0; i -= 1) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      result.push({ key, count: counts.get(key) || 0, isToday: i === 0 });
    }
    return result;
  }, [sessions, days]);

  const activeDays = cells.filter((c) => c.count > 0).length;

  const dotClass = (count: number) => {
    if (count === 0) return 'bg-ink-50 dark:bg-ink-500';
    if (count === 1) return 'bg-marigold-300';
    if (count === 2) return 'bg-marigold-500';
    return 'bg-vermillion-500';
  };

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-semibold text-ink-600 dark:text-cream-200">
          Practice kolam · last {days} days
        </p>
        <p className="text-xs text-ink-300 dark:text-cream-300/60">{activeDays} active days</p>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {cells.map((cell) => (
          <span
            key={cell.key}
            title={`${cell.key}: ${cell.count} session${cell.count === 1 ? '' : 's'}`}
            className={`aspect-square rounded-full transition-colors ${dotClass(cell.count)} ${
              cell.isToday ? 'ring-2 ring-offset-2 ring-vermillion-400 dark:ring-offset-ink-700' : ''
            }`}
          />
        ))}
      </div>
      <div className="flex items-center gap-3 mt-3 text-[11px] text-ink-300 dark:text-cream-300/60">
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-ink-50 dark:bg-ink-500 inline-block" />None</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-marigold-300 inline-block" />1</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-marigold-500 inline-block" />2</span>
        <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-vermillion-500 inline-block" />3+</span>
      </div>
    </div>
  );
};

export default ActivityKolam;
