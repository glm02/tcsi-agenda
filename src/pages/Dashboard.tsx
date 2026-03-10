import { Link } from 'react-router-dom';
import {
  FileText,
  Calculator,
  ExternalLink,
  AlertTriangle,
  ChevronRight,
  Calendar,
  CheckCircle,
  XCircle,
  Loader2,
} from 'lucide-react';
import { useStudent } from '@/contexts/StudentContext';
import { TASKS_DATA } from '@/contexts/StudentContext';
// removed hardcoded modules
import { calcAvg, getGradeColor } from '@/lib/helpers';
import ProfileAvatar from '@/components/ProfileAvatar';
import WeatherWidget from '@/components/WeatherWidget';
import BadgesWidget from '@/components/BadgesWidget';
import ObjectiveGradeWidget from '@/components/ObjectiveGradeWidget';
import DailyQuote from '@/components/DailyQuote';
import { useTestAde } from '@/hooks/useTestAde';

const Dashboard = () => {
  const {
    profile,
    stats,
    rankingPosition,
    rankingTotal,
    taskStatus,
    allEvents,
    s2Grades,
    announcements,
    modules,
  } = useStudent();

  // Sécurité : valeurs par défaut si undefined
  const safeProfile = profile || { firstName: '', lastName: '', adeUrl: '', pseudo: null, blurGrades: false };
  const safeStats = stats || { global: null, avg21: null, avg22: null };
  const safeTaskStatus = taskStatus || {};
  const safeAllEvents = allEvents || [];
  const safeS2Grades = s2Grades || {};
  const safeAnnouncements = announcements || [];

  const displayName = safeProfile.pseudo?.trim() || safeProfile.firstName || 'Étudiant';

  const upcomingTasks = TASKS_DATA.filter(t => !safeTaskStatus[t.title + t.module])
    .map(t => ({ ...t, diff: new Date(t.end).getTime() - Date.now() }))
    .filter(t => t.diff > 0)
    .sort((a, b) => a.diff - b.diff)
    .slice(0, 5);

  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 7);
  const weekEvents = safeAllEvents.filter(e => e.start >= monday && e.start < sunday);
  const weekHours = weekEvents.reduce((acc, e) => {
    const end = e.end || new Date(e.start.getTime() + 60 * 60 * 1000);
    return acc + (end.getTime() - e.start.getTime()) / (60 * 60 * 1000);
  }, 0);
  const weekExams = upcomingTasks.filter(t => t.diff < 7 * 24 * 60 * 60 * 1000).length;

  const atRiskUEs = modules.map(m => ({
    ...m,
    avg: parseFloat(calcAvg(safeS2Grades[m.id]) || ''),
  }))
    .filter(m => !isNaN(m.avg) && m.avg < 10)
    .sort((a, b) => a.avg - b.avg)
    .slice(0, 5);

  const { status: adeStatus, message: adeMessage, test: testAde } = useTestAde(safeProfile.adeUrl || '');

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      {/* Header: avatar, nom, promo, moyenne, classement */}
      <header className="rounded-2xl bg-gradient-to-br from-primary/15 via-primary/5 to-transparent border border-border p-5 md:p-6">
        <div className="flex items-start gap-4">
          <ProfileAvatar
            src={safeProfile.avatarUrl}
            firstName={safeProfile.firstName}
            lastName={safeProfile.lastName}
            pseudo={safeProfile.pseudo}
            size="lg"
            className="shrink-0"
          />
          <div className="min-w-0 flex-1">
            <h1 className="text-xl md:text-2xl font-bold truncate">{displayName}</h1>
            <p className="text-sm text-muted-foreground">Promo GEII</p>
            <div className="flex flex-wrap items-center gap-4 mt-3">
              <div>
                <span className={`text-2xl font-bold tabular-nums ${getGradeColor(safeStats.global ?? null)}`}>
                  {safeProfile.blurGrades ? '•••' : (safeStats.global ?? '--')}
                </span>
                <span className="text-xs text-muted-foreground ml-1">/20</span>
              </div>
              {rankingPosition != null && rankingTotal != null && (
                <div className="text-sm text-muted-foreground">
                  <span className="font-semibold text-foreground">{rankingPosition}e</span>
                  {' / '}
                  {rankingTotal} au classement
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Annonces */}
      {safeAnnouncements.length > 0 && (
        <div className="space-y-2">
          {safeAnnouncements.slice(0, 2).map((a, i) => (
            <div
              key={i}
              className={`p-4 rounded-xl border flex items-start gap-3 ${
                a.type === 'WARNING'
                  ? 'bg-destructive/10 border-destructive/20'
                  : a.type === 'SUCCESS'
                    ? 'bg-green-500/10 border-green-500/20'
                    : 'bg-primary/10 border-primary/20'
              }`}
            >
              <AlertTriangle size={18} className="shrink-0 mt-0.5" />
              <p className="text-sm">{a.text}</p>
            </div>
          ))}
        </div>
      )}

      {/* Météo + Test agenda */}
      <div className="grid md:grid-cols-2 gap-4">
        <WeatherWidget />
        <section className="rounded-2xl border border-border bg-card p-4">
          <h2 className="font-bold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2 mb-3">
            <Calendar size={16} /> Lien agenda ADE
          </h2>
          <p className="text-xs text-muted-foreground mb-2 truncate" title={safeProfile.adeUrl || ''}>
            {safeProfile.adeUrl ? (safeProfile.adeUrl.length > 45 ? safeProfile.adeUrl.slice(0, 45) + '…' : safeProfile.adeUrl) : 'Non configuré'}
          </p>
          <button
            type="button"
            onClick={() => testAde()}
            disabled={adeStatus === 'testing' || !safeProfile.adeUrl}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-primary/10 text-primary text-sm font-medium hover:bg-primary/20 disabled:opacity-50"
          >
            {adeStatus === 'testing' ? <Loader2 size={16} className="animate-spin" /> : adeStatus === 'ok' ? <CheckCircle size={16} /> : adeStatus === 'error' ? <XCircle size={16} /> : <Calendar size={16} />}
            {adeStatus === 'testing' ? 'Test en cours…' : adeStatus === 'ok' ? 'Lien valide' : adeStatus === 'error' ? 'Erreur' : 'Tester le lien'}
          </button>
          {adeMessage && <p className={`text-xs mt-2 ${adeStatus === 'ok' ? 'text-green-600' : 'text-destructive'}`}>{adeMessage}</p>}
          <Link to="/planning" className="mt-3 inline-block text-xs font-medium text-primary hover:underline">Paramétrer l&apos;agenda</Link>
        </section>
      </div>

      {/* Widgets: Prochains contrôles, Charge de la semaine */}
      <div className="grid md:grid-cols-2 gap-4">
        <section className="rounded-2xl border border-border bg-card p-4">
          <h2 className="font-bold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2 mb-3">
            <FileText size={16} /> Prochains contrôles
          </h2>
          {upcomingTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucun devoir à venir</p>
          ) : (
            <ul className="space-y-2">
              {upcomingTasks.map((t, i) => (
                <li key={i} className="flex items-center justify-between text-sm">
                  <span className="truncate">{t.title}</span>
                  <span className="text-muted-foreground shrink-0 ml-2">
                    J-{Math.ceil(t.diff / (24 * 60 * 60 * 1000))}
                  </span>
                </li>
              ))}
            </ul>
          )}
          <Link
            to="/planning"
            className="mt-3 flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            Voir le planning <ChevronRight size={14} />
          </Link>
        </section>

        <section className="rounded-2xl border border-border bg-card p-4">
          <h2 className="font-bold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2 mb-3">
            <AlertTriangle size={16} /> Charge de la semaine
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-xl bg-muted/50">
              <div className="text-2xl font-bold tabular-nums">{Math.round(weekHours)}h</div>
              <div className="text-xs text-muted-foreground">Cours / EDT</div>
            </div>
            <div className="p-3 rounded-xl bg-muted/50">
              <div className="text-2xl font-bold tabular-nums">{weekExams}</div>
              <div className="text-xs text-muted-foreground">Contrôles à venir</div>
            </div>
          </div>
          <Link
            to="/planning"
            className="mt-3 flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            Voir le planning <ChevronRight size={14} />
          </Link>
        </section>
      </div>

      {/* UE à risque */}
      {atRiskUEs.length > 0 && (
        <section className="rounded-2xl border border-border bg-card p-4">
          <h2 className="font-bold text-sm uppercase tracking-wider text-muted-foreground flex items-center gap-2 mb-3">
            <AlertTriangle size={16} /> UE à surveiller
          </h2>
          <div className="space-y-2">
            {atRiskUEs.map(m => (
              <div key={m.id} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium truncate">{m.label}</span>
                    <span className={`font-mono shrink-0 ${getGradeColor(String(m.avg))}`}>
                      {safeProfile.blurGrades ? '••' : m.avg.toFixed(1)}/20
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        m.avg < 8 ? 'bg-destructive' : 'bg-warning'
                      }`}
                      style={{ width: `${Math.min(100, (m.avg / 20) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Link
            to="/notes"
            className="mt-3 flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            Voir mes notes <ChevronRight size={14} />
          </Link>
        </section>
      )}

      {/* Badges + Objectif moyenne */}
      <div className="grid md:grid-cols-2 gap-4">
        <BadgesWidget
          taskStatus={safeTaskStatus}
          globalAvg={safeStats.global}
        />
        <ObjectiveGradeWidget currentAvg={safeStats.global} blurGrades={safeProfile.blurGrades} />
      </div>

      {/* Liens rapides */}
      <section className="rounded-2xl border border-border bg-card p-4">
        <h2 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-3">
          Actions rapides
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link
            to="/notes"
            className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted/50 transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
              <Calculator size={20} />
            </div>
            <span className="text-sm font-medium">Ajouter une note</span>
          </Link>
          <Link
            to="/profil"
            className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted/50 transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Calendar size={20} />
            </div>
            <span className="text-sm font-medium">Tester mon ADE</span>
          </Link>
          <Link
            to="/notes"
            className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted/50 transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <FileText size={20} />
            </div>
            <span className="text-sm font-medium">Export PDF</span>
          </Link>
          <Link
            to="/ressources"
            className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted/50 transition-colors"
          >
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
              <ExternalLink size={20} />
            </div>
            <span className="text-sm font-medium">Ressources</span>
          </Link>
        </div>
      </section>

      {/* Citation du jour */}
      <DailyQuote />
    </div>
  );
};

export default Dashboard;
