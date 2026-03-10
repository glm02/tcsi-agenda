import { useState, useEffect } from 'react';
import { Trophy, Eye, EyeOff } from 'lucide-react';
import { useStudent } from '@/contexts/StudentContext';
import { supabase } from '@/integrations/supabase/client';
import { MODULES_CONFIG_S2 } from '@/lib/constants';
import { calcAvg } from '@/lib/helpers';

type Tab = 'general' | 'ue';

interface RankEntry {
  user_id: string;
  pseudo: string | null;
  first_name: string;
  last_name: string | null;
  avg: number;
  rank: number;
}

const ClassementPage = () => {
  const { profile, stats, rankingPosition, rankingTotal, updateProfile } = useStudent();
  const [tab, setTab] = useState<Tab>('general');
  const [generalRanking, setGeneralRanking] = useState<RankEntry[]>([]);
  const [ueRanking, setUeRanking] = useState<Record<string, RankEntry[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRankings = async () => {
      const { data: profiles } = await supabase.from('profiles').select('user_id, first_name, last_name, pseudo');
      const { data: grades } = await supabase.from('grades').select('user_id, module_id, value, coef');
      if (!profiles?.length || !grades?.length) {
        setLoading(false);
        return;
      }

      const profileMap = Object.fromEntries(profiles.map(p => [p.user_id, p]));
      const userSums: Record<string, { sum: number; coef: number }> = {};
      grades.forEach((g: { user_id: string; module_id: string; value: number; coef: number }) => {
        const mod = MODULES_CONFIG_S2.find(m => m.id === g.module_id);
        if (!mod) return;
        const c = mod.coef21 + mod.coef22;
        if (!userSums[g.user_id]) userSums[g.user_id] = { sum: 0, coef: 0 };
        userSums[g.user_id].sum += g.value * c;
        userSums[g.user_id].coef += c;
      });

      const general = Object.entries(userSums)
        .filter(([, v]) => v.coef > 0)
        .map(([uid, v]) => ({
          user_id: uid,
          avg: v.sum / v.coef,
          pseudo: (profileMap[uid] as { pseudo?: string | null })?.pseudo ?? null,
          first_name: (profileMap[uid] as { first_name?: string })?.first_name ?? '',
          last_name: (profileMap[uid] as { last_name?: string | null })?.last_name ?? null,
        }))
        .sort((a, b) => b.avg - a.avg)
        .map((e, i) => ({ ...e, rank: i + 1 }))
        .filter(e => {
          const p = profileMap[e.user_id] as { ranking_visible?: boolean } | undefined;
          return p?.ranking_visible !== false;
        });

      setGeneralRanking(general as RankEntry[]);

      const byModule: Record<string, RankEntry[]> = {};
      MODULES_CONFIG_S2.forEach(m => {
        const modGrades = grades.filter((g: { module_id: string }) => g.module_id === m.id);
        const userAvg: Record<string, { sum: number; coef: number }> = {};
        modGrades.forEach((g: { user_id: string; value: number; coef: number }) => {
          if (!userAvg[g.user_id]) userAvg[g.user_id] = { sum: 0, coef: 0 };
          userAvg[g.user_id].sum += g.value * g.coef;
          userAvg[g.user_id].coef += g.coef;
        });
        const list = Object.entries(userAvg)
          .filter(([, v]) => v.coef > 0)
          .map(([uid, v]) => ({
            user_id: uid,
            avg: v.sum / v.coef,
            pseudo: (profileMap[uid] as { pseudo?: string | null })?.pseudo ?? null,
            first_name: (profileMap[uid] as { first_name?: string })?.first_name ?? '',
            last_name: (profileMap[uid] as { last_name?: string | null })?.last_name ?? null,
          }))
          .sort((a, b) => b.avg - a.avg)
          .map((e, i) => ({ ...e, rank: i + 1 }))
          .filter(e => {
            const p = profileMap[e.user_id] as { ranking_visible?: boolean } | undefined;
            return p?.ranking_visible !== false;
          }) as RankEntry[];
        byModule[m.id] = list;
      });
      setUeRanking(byModule);
      setLoading(false);
    };
    loadRankings();
  }, []);

  const displayName = (e: RankEntry) => e.pseudo?.trim() || `${e.first_name} ${e.last_name || ''}`.trim() || 'Anonyme';

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Trophy size={28} /> Classement
      </h1>

      {rankingPosition != null && rankingTotal != null && (
        <div className="rounded-2xl border border-border bg-card p-4 mb-6">
          <p className="text-sm text-muted-foreground">Ta position</p>
          <p className="text-2xl font-bold">
            {rankingPosition}e <span className="text-muted-foreground font-normal">/ {rankingTotal}</span>
          </p>
          <label className="flex items-center gap-2 mt-3 text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={profile.rankingVisible}
              onChange={(e) => updateProfile({ rankingVisible: e.target.checked })}
              className="rounded border-border"
            />
            {profile.rankingVisible ? <Eye size={16} /> : <EyeOff size={16} />}
            Participer au classement public
          </label>
        </div>
      )}

      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => setTab('general')}
          className={`px-4 py-2 rounded-xl text-sm font-medium ${tab === 'general' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
        >
          Général
        </button>
        <button
          type="button"
          onClick={() => setTab('ue')}
          className={`px-4 py-2 rounded-xl text-sm font-medium ${tab === 'ue' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}
        >
          Par UE
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
        </div>
      ) : tab === 'general' ? (
        <div className="rounded-2xl border border-border overflow-hidden">
          <ul className="divide-y divide-border">
            {generalRanking.slice(0, 20).map((e, i) => (
              <li key={e.user_id} className="flex items-center gap-4 p-4">
                <span className="w-8 text-center font-bold text-muted-foreground">{e.rank}</span>
                <span className="flex-1 font-medium truncate">{displayName(e)}</span>
                <span className="font-mono font-bold tabular-nums">{e.avg.toFixed(2)}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="space-y-6">
          {MODULES_CONFIG_S2.map(m => (
            <div key={m.id} className="rounded-2xl border border-border overflow-hidden">
              <h3 className="p-3 bg-muted/50 font-semibold text-sm">{m.label}</h3>
              <ul className="divide-y divide-border">
                {(ueRanking[m.id] || []).slice(0, 10).map(e => (
                  <li key={e.user_id} className="flex items-center gap-4 p-3">
                    <span className="w-6 text-center text-xs font-bold text-muted-foreground">{e.rank}</span>
                    <span className="flex-1 text-sm truncate">{displayName(e)}</span>
                    <span className="font-mono text-sm font-bold tabular-nums">{e.avg.toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClassementPage;
