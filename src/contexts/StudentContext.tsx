import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  useCallback,
  type ReactNode,
} from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { DEFAULT_ADE, MODULES_CONFIG_GEII_S1, MODULES_CONFIG_GEII_S2, MODULES_CONFIG_TCSI_S1, MODULES_CONFIG_TCSI_S2, TASKS_DATA } from '@/lib/constants';
import { calcAvg, type Grade } from '@/lib/helpers';
import { parseICS, generateDemoSchedule, type CalendarEvent } from '@/lib/ical-parser';
import type { ModuleConfig } from '@/lib/constants';
import type { StudentProfile } from '@/types/profile';

type Announcement = { text: string; type: string };

interface StudentState {
  profile: StudentProfile;
  profileLoaded: boolean;
  quickNote: string;
  semester: number;
  setSemester: (s: number) => void;
  visibleUEs: { 21: boolean; 22: boolean };
  setVisibleUEs: (v: { 21: boolean; 22: boolean }) => void;
  s2Grades: Record<string, Grade[]>;
  absences: Record<string, number>;
  taskStatus: Record<string, boolean>;
  history: Record<string, Record<string, string>>;
  allEvents: CalendarEvent[];
  announcements: Announcement[];
  isAdmin: boolean;
  stats: { avg21: string | null; avg22: string | null; global: string | null };
  rankingPosition: number | null;
  rankingTotal: number | null;
  modules: ModuleConfig[];
}

interface StudentActions {
  setProfile: (p: StudentProfile | ((prev: StudentProfile) => StudentProfile)) => void;
  setQuickNote: (note: string) => void;
  updateProfile: (updates: Partial<StudentProfile>) => Promise<void>;
  updateQuickNote: (note: string) => Promise<void>;
  handleUpdateGrades: (moduleId: string, grades: Grade[]) => Promise<void>;
  updateAbsence: (modId: string, delta: number) => Promise<void>;
  toggleTask: (key: string) => Promise<void>;
  updateHistory: (sem: number, key: string, val: string) => Promise<void>;
  refreshAgenda: () => Promise<void>;
  setSelectedModule: (mod: ModuleConfig | null) => void;
}

const defaultProfile: StudentProfile = {
  firstName: '',
  lastName: '',
  adeUrl: DEFAULT_ADE,
  quickNote: '',
  avatarUrl: null,
  pseudo: null,
  theme: 'system',
  accentColor: null,
  dashboardPreference: 'grades',
  blurGrades: false,
  rankingVisible: true,
};

const StudentContext = createContext<(StudentState & StudentActions & { selectedModule: ModuleConfig | null }) | null>(null);

const safeDefaultContext: StudentState & StudentActions & { selectedModule: ModuleConfig | null } = {
  profile: defaultProfile,
  modules: MODULES_CONFIG_GEII_S2,
  profileLoaded: true,
  quickNote: '',
  semester: 2,
  setSemester: () => {},
  visibleUEs: { 21: true, 22: true },
  setVisibleUEs: () => {},
  s2Grades: {},
  absences: {},
  taskStatus: {},
  history: {},
  allEvents: [],
  announcements: [],
  isAdmin: false,
  stats: { avg21: null, avg22: null, global: null },
  rankingPosition: null,
  rankingTotal: null,
  setProfile: () => {},
  setQuickNote: () => {},
  updateProfile: async () => {},
  updateQuickNote: async () => {},
  handleUpdateGrades: async () => {},
  updateAbsence: async () => {},
  toggleTask: async () => {},
  updateHistory: async () => {},
  refreshAgenda: async () => {},
  setSelectedModule: () => {},
  selectedModule: null,
};

export function StudentProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfileState] = useState<StudentProfile>(defaultProfile);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [quickNote, setQuickNote] = useState('');
  const [semester, setSemester] = useState(2);
  const [visibleUEs, setVisibleUEs] = useState({ 21: true, 22: true });
  const [s2Grades, setS2Grades] = useState<Record<string, Grade[]>>({});
  const [absences, setAbsences] = useState<Record<string, number>>({});
  const [taskStatus, setTaskStatus] = useState<Record<string, boolean>>({});
  const [history, setHistory] = useState<Record<string, Record<string, string>>>({});
  const [allEvents, setAllEvents] = useState<CalendarEvent[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedModule, setSelectedModule] = useState<ModuleConfig | null>(null);
  const [rankingPosition, setRankingPosition] = useState<number | null>(null);
  const [rankingTotal, setRankingTotal] = useState<number | null>(null);

  const modules = useMemo(() => {
    if (profile.filiere === 'TCSI') {
      return semester === 1 ? MODULES_CONFIG_TCSI_S1 : MODULES_CONFIG_TCSI_S2;
    }
    return semester === 1 ? MODULES_CONFIG_GEII_S1 : MODULES_CONFIG_GEII_S2;
  }, [profile.filiere, semester]);

  const stats = useMemo(() => {
    try {
      let p21 = 0, c21 = 0, p22 = 0, c22 = 0;
      const safeGrades = s2Grades || {};
      modules.forEach(m => {
        const avg = parseFloat(calcAvg(safeGrades[m.id]) || '');
        if (!isNaN(avg)) {
          if (m.coef1 > 0) { p21 += avg * m.coef1; c21 += m.coef1; }
          if (m.coef2 > 0) { p22 += avg * m.coef2; c22 += m.coef2; }
        }
      });
      const avg21 = c21 ? (p21 / c21).toFixed(2) : null;
      const avg22 = c22 ? (p22 / c22).toFixed(2) : null;
      const global = (avg21 && avg22) ? ((parseFloat(avg21) + parseFloat(avg22)) / 2).toFixed(2) : null;
      return { avg21, avg22, global };
    } catch {
      return { avg21: null, avg22: null, global: null };
    }
  }, [s2Grades, modules]);

  useEffect(() => {
    if (!user) return;

    const timeout = window.setTimeout(() => {
      setProfileLoaded(true);
    }, 8000);

    const loadProfile = async () => {
      try {
        const pending = localStorage.getItem('geii_pending_profile');
        if (pending) {
          const p = JSON.parse(pending);
          await supabase.from('profiles').upsert({
            user_id: user.id,
            first_name: p.first_name,
            last_name: p.last_name,
            ade_url: p.ade_url,
          }, { onConflict: 'user_id' });
          setProfileState({
            ...defaultProfile,
            firstName: p.first_name,
            lastName: p.last_name,
            adeUrl: p.ade_url,
          });
          localStorage.removeItem('geii_pending_profile');
          return;
        }

        const { data, error } = await supabase.from('profiles').select('*').eq('user_id', user.id).single();
        if (data) {
          const row = data as Record<string, unknown>;
          setProfileState({
            firstName: (row.first_name as string) || (user.email?.split('@')[0] ?? ''),
            lastName: (row.last_name as string) || '',
            adeUrl: (row.ade_url as string) || DEFAULT_ADE,
            quickNote: (row.quick_note as string) || '',
            avatarUrl: (row.avatar_url as string | null) ?? null,
            pseudo: (row.pseudo as string | null) ?? null,
            theme: ((row.theme as string) || 'system') as StudentProfile['theme'],
            accentColor: (row.accent_color as string | null) ?? null,
            dashboardPreference: ((row.dashboard_preference as string) || 'grades') as StudentProfile['dashboardPreference'],
            blurGrades: !!row.blur_grades,
            rankingVisible: row.ranking_visible !== false,
            filiere: ((row.filiere as string) || 'GEII') as StudentProfile['filiere'],
          });
          setQuickNote((row.quick_note as string) || '');
        } else {
          // Nouveau user sans profil : créer une ligne par défaut et afficher l'app
          const fallbackName = user.email?.split('@')[0] ?? 'Étudiant';
          await supabase.from('profiles').upsert({
            user_id: user.id,
            first_name: fallbackName,
            last_name: '',
            ade_url: DEFAULT_ADE,
          }, { onConflict: 'user_id' });
          setProfileState({
            ...defaultProfile,
            firstName: fallbackName,
            lastName: '',
            adeUrl: DEFAULT_ADE,
          });
        }
      } catch {
        // Erreur réseau / Supabase : afficher quand même l'app avec profil par défaut
        const fallbackName = user.email?.split('@')[0] ?? 'Étudiant';
        setProfileState({
          ...defaultProfile,
          firstName: fallbackName,
          lastName: '',
          adeUrl: DEFAULT_ADE,
        });
      } finally {
        setProfileLoaded(true);
      }
    };

    const loadGrades = async () => {
      const { data } = await supabase.from('grades').select('*').eq('user_id', user.id);
      if (data) {
        const map: Record<string, Grade[]> = {};
        data.forEach((g: { id: string; module_id: string; value: number; coef: number; name: string }) => {
          if (!map[g.module_id]) map[g.module_id] = [];
          map[g.module_id].push({ id: g.id, value: String(g.value), coef: String(g.coef), name: g.name });
        });
        setS2Grades(map);
      }
    };

    const loadAbsences = async () => {
      const { data } = await supabase.from('absences').select('*').eq('user_id', user.id);
      if (data) {
        const map: Record<string, number> = {};
        data.forEach((a: { module_id: string; count: number }) => { map[a.module_id] = a.count; });
        setAbsences(map);
      }
    };

    const loadTaskStatus = async () => {
      const { data } = await supabase.from('task_status').select('*').eq('user_id', user.id);
      if (data) {
        const map: Record<string, boolean> = {};
        data.forEach((t: { task_key: string; done: boolean }) => { map[t.task_key] = t.done; });
        setTaskStatus(map);
      }
    };

    const loadHistory = async () => {
      const { data } = await supabase.from('semester_history').select('*').eq('user_id', user.id);
      if (data) {
        const map: Record<string, Record<string, string>> = {};
        data.forEach((h: { semester: number; ue1_avg: number | null; ue2_avg: number | null }) => {
          map[`s${h.semester}`] = {
            [`ue${h.semester}1`]: String(h.ue1_avg ?? ''),
            [`ue${h.semester}2`]: String(h.ue2_avg ?? ''),
          };
        });
        setHistory(map);
      }
    };

    const checkAdmin = async () => {
      const { data } = await supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' });
      setIsAdmin(!!data);
    };

    const loadRanking = async () => {
      // Pour une vraie filière, il faudrait récupérer la filière de chaque user via une jointure.
      // Pour l'instant, on calcule le classement avec les modules de l'étudiant actuel
      const { data: gradesData } = await supabase.from('grades').select('user_id, value, coef, module_id');
      if (!gradesData?.length) return;
      
      const userAverages: Record<string, { sum: number; coef: number }> = {};
      
      gradesData.forEach((g: { user_id: string; value: number; coef: number; module_id: string }) => {
        // On ne compte que les notes qui font partie de la filière actuelle
        const mod = modules.find(m => m.id === g.module_id);
        if (!mod) return;
        
        if (!userAverages[g.user_id]) userAverages[g.user_id] = { sum: 0, coef: 0 };
        const c = mod.coef1 + mod.coef2 + (mod.coef3 || 0);
        userAverages[g.user_id].sum += g.value * c;
        userAverages[g.user_id].coef += c;
      });
      const sorted = Object.entries(userAverages)
        .filter(([, v]) => v.coef > 0)
        .map(([uid, v]) => ({ user_id: uid, avg: v.sum / v.coef }))
        .sort((a, b) => b.avg - a.avg);
      setRankingTotal(sorted.length);
      const pos = sorted.findIndex(s => s.user_id === user.id);
      setRankingPosition(pos >= 0 ? pos + 1 : null);
    };

    loadProfile();
    loadGrades();
    loadAbsences();
    loadTaskStatus();
    loadHistory();
    checkAdmin();
    loadRanking();

    const channel = supabase
      .channel('announcements')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'announcements' }, () => {
        supabase.from('announcements').select('*').order('created_at', { ascending: false }).then(({ data }) => {
          if (data) setAnnouncements(data.map((a: { text: string; type: string }) => ({ text: a.text, type: a.type })));
        });
      })
      .subscribe();

    supabase.from('announcements').select('*').order('created_at', { ascending: false }).then(({ data }) => {
      if (data) setAnnouncements(data.map((a: { text: string; type: string }) => ({ text: a.text, type: a.type })));
    });

    return () => {
      clearTimeout(timeout);
      supabase.removeChannel(channel);
    };
  }, [user, modules]);

  const fetchAgenda = useCallback(async () => {
    if (!profile.adeUrl) return;
    let text = '';
    try {
      const { data, error } = await supabase.functions.invoke('fetch-ical', { body: { url: profile.adeUrl } });
      if (!error && data?.data && String(data.data).includes('BEGIN:VCALENDAR')) text = String(data.data);
    } catch { /* ignore */ }
    if (!text) text = generateDemoSchedule();
    setAllEvents(parseICS(text).sort((a, b) => a.start.getTime() - b.start.getTime()));
  }, [profile.adeUrl]);

  useEffect(() => {
    if (!profile.adeUrl) return;
    fetchAgenda();
  }, [profile.adeUrl, fetchAgenda]);

  const updateProfile = useCallback(async (updates: Partial<StudentProfile>) => {
    if (!user) return;
    const newProfile = { ...profile, ...updates };
    setProfileState(newProfile);
    await supabase.from('profiles').update({
      first_name: newProfile.firstName,
      last_name: newProfile.lastName,
      ade_url: newProfile.adeUrl,
      quick_note: newProfile.quickNote ?? '',
      avatar_url: newProfile.avatarUrl ?? null,
      pseudo: newProfile.pseudo ?? null,
      theme: newProfile.theme ?? 'system',
      accent_color: newProfile.accentColor ?? null,
      dashboard_preference: newProfile.dashboardPreference ?? 'grades',
      blur_grades: newProfile.blurGrades ?? false,
      ranking_visible: newProfile.rankingVisible ?? true,
      filiere: newProfile.filiere ?? 'GEII',
    }).eq('user_id', user.id);
  }, [profile, user]);

  const updateQuickNote = useCallback(async (note: string) => {
    if (!user) return;
    setQuickNote(note);
    await supabase.from('profiles').update({ quick_note: note }).eq('user_id', user.id);
  }, [user]);

  const handleUpdateGrades = useCallback(async (moduleId: string, grades: Grade[]) => {
    if (!user) return;
    setS2Grades(prev => ({ ...prev, [moduleId]: grades }));
    await supabase.from('grades').delete().eq('user_id', user.id).eq('module_id', moduleId);
    if (grades.length > 0) {
      await supabase.from('grades').insert(
        grades.map(g => ({
          user_id: user.id,
          module_id: moduleId,
          name: g.name,
          value: parseFloat(g.value),
          coef: parseFloat(g.coef),
        }))
      );
    }
  }, [user]);

  const updateAbsence = useCallback(async (modId: string, delta: number) => {
    if (!user) return;
    const newCount = Math.max(0, (absences[modId] || 0) + delta);
    setAbsences(a => ({ ...a, [modId]: newCount }));
    await supabase.from('absences').upsert(
      { user_id: user.id, module_id: modId, count: newCount },
      { onConflict: 'user_id,module_id' }
    );
  }, [absences, user]);

  const toggleTask = useCallback(async (key: string) => {
    if (!user) return;
    const done = !taskStatus[key];
    setTaskStatus(ts => ({ ...ts, [key]: done }));
    await supabase.from('task_status').upsert(
      { user_id: user.id, task_key: key, done },
      { onConflict: 'user_id,task_key' }
    );
  }, [taskStatus, user]);

  const updateHistory = useCallback(async (sem: number, key: string, val: string) => {
    if (!user) return;
    const semKey = `s${sem}`;
    const newHist = { ...history, [semKey]: { ...history[semKey], [key]: val } };
    setHistory(newHist);
    const ue1Key = `ue${sem}1`;
    const ue2Key = `ue${sem}2`;
    await supabase.from('semester_history').upsert(
      {
        user_id: user.id,
        semester: sem,
        ue1_avg: newHist[semKey]?.[ue1Key] ? parseFloat(newHist[semKey][ue1Key]) : null,
        ue2_avg: newHist[semKey]?.[ue2Key] ? parseFloat(newHist[semKey][ue2Key]) : null,
      },
      { onConflict: 'user_id,semester' }
    );
  }, [history, user]);

  const value = useMemo(
    () => ({
      profile: profile || defaultProfile,
      profileLoaded,
      quickNote: quickNote || '',
      semester,
      setSemester,
      visibleUEs: visibleUEs || { 21: true, 22: true },
      setVisibleUEs,
      s2Grades: s2Grades || {},
      absences: absences || {},
      taskStatus: taskStatus || {},
      history: history || {},
      allEvents: allEvents || [],
      announcements: announcements || [],
      isAdmin: isAdmin || false,
      stats: stats || { avg21: null, avg22: null, global: null },
      rankingPosition: rankingPosition ?? null,
      rankingTotal: rankingTotal ?? null,
      modules,
      setProfile: setProfileState,
      setQuickNote,
      updateProfile,
      updateQuickNote,
      handleUpdateGrades,
      updateAbsence,
      toggleTask,
      updateHistory,
      refreshAgenda: fetchAgenda,
      setSelectedModule,
      selectedModule: selectedModule || null,
    }),
    [
      profile,
      profileLoaded,
      quickNote,
      semester,
      visibleUEs,
      s2Grades,
      absences,
      taskStatus,
      history,
      allEvents,
      announcements,
      isAdmin,
      stats,
      rankingPosition,
      rankingTotal,
      modules,
      updateProfile,
      updateQuickNote,
      handleUpdateGrades,
      updateAbsence,
      toggleTask,
      updateHistory,
      fetchAgenda,
      selectedModule,
    ]
  );

  return <StudentContext.Provider value={value}>{children}</StudentContext.Provider>;
}

export function useStudent() {
  const ctx = useContext(StudentContext);
  if (!ctx) {
    if (import.meta.env.DEV) {
      console.warn('useStudent called outside StudentProvider – using default values');
    }
    return safeDefaultContext;
  }
  return ctx;
}

export { TASKS_DATA };
