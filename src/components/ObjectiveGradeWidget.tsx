import { useState } from 'react';
import { Target } from 'lucide-react';

interface ObjectiveGradeWidgetProps {
  currentAvg: string | null;
  blurGrades?: boolean;
}

const ObjectiveGradeWidget = ({ currentAvg, blurGrades }: ObjectiveGradeWidgetProps) => {
  const [target, setTarget] = useState<string>('');
  const cur = currentAvg ? parseFloat(currentAvg) : null;
  const tar = target ? parseFloat(target) : null;
  const gap = cur != null && tar != null && tar > cur ? (tar - cur).toFixed(2) : null;

  return (
    <section className="rounded-2xl border border-border bg-card p-4">
      <h2 className="font-bold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2 mb-3">
        <Target size={16} /> Objectif de moyenne
      </h2>
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <span className="text-xs text-muted-foreground">Actuel </span>
          <span className="font-bold tabular-nums">{blurGrades ? '••' : (currentAvg ?? '--')}</span>
          <span className="text-muted-foreground text-sm">/20</span>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-muted-foreground">Cible</label>
          <input
            type="number"
            min={0}
            max={20}
            step={0.5}
            value={target}
            onChange={e => setTarget(e.target.value)}
            placeholder="12"
            className="w-16 rounded-lg border border-border bg-background px-2 py-1.5 text-sm font-mono"
          />
          <span className="text-muted-foreground text-sm">/20</span>
        </div>
      </div>
      {gap != null && (
        <p className="text-xs text-muted-foreground mt-2">
          Il te manque <span className="font-semibold text-foreground">{gap} points</span> pour atteindre ton objectif.
        </p>
      )}
      {cur != null && tar != null && cur >= tar && (
        <p className="text-xs text-green-600 font-medium mt-2">Objectif atteint !</p>
      )}
    </section>
  );
};

export default ObjectiveGradeWidget;
