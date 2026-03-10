import { Award, Flame, TrendingUp, Target } from 'lucide-react';

interface BadgesWidgetProps {
  taskStatus: Record<string, boolean>;
  globalAvg: string | null;
  hasImproved?: boolean;
  targetGrade?: number | null;
}

const BadgesWidget = ({ taskStatus, globalAvg, hasImproved, targetGrade }: BadgesWidgetProps) => {
  const noLateTasks = Object.keys(taskStatus).length === 0 || Object.values(taskStatus).every(Boolean);
  const avgNum = globalAvg ? parseFloat(globalAvg) : null;
  const badges = [
    { id: 'no-late', icon: Flame, label: 'Aucun devoir en retard', earned: noLateTasks },
    { id: 'avg-14', icon: Award, label: 'Moyenne ≥ 14', earned: avgNum != null && avgNum >= 14 },
    { id: 'improved', icon: TrendingUp, label: 'Progression', earned: !!hasImproved },
    { id: 'target', icon: Target, label: 'Objectif atteint', earned: targetGrade != null && avgNum != null && avgNum >= targetGrade },
  ].filter(b => b.earned);

  if (badges.length === 0) return null;

  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <h2 className="font-bold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2 mb-3">
        <Award size={16} /> Badges
      </h2>
      <div className="flex flex-wrap gap-2">
        {badges.map(b => {
          const Icon = b.icon;
          return (
            <span
              key={b.id}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium"
            >
              <Icon size={14} /> {b.label}
            </span>
          );
        })}
      </div>
    </section>
  );
};

export default BadgesWidget;
