import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Shield, Plus, Trash2, ArrowLeft, Megaphone, Users, AlertTriangle, Info, CheckCircle, BarChart3, MessageSquare } from 'lucide-react';

interface Announcement {
  id: string;
  text: string;
  type: string;
  created_at: string;
}

interface UserProfile {
  user_id: string;
  first_name: string;
  last_name: string | null;
  created_at: string;
}

interface FeedbackItem {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
}

interface StatsData {
  usersCount: number;
  gradesCount: number;
  announcementsCount: number;
}

const ANNOUNCEMENT_TYPES = [
  { value: 'INFO', label: 'Info', icon: Info, color: 'text-blue-400' },
  { value: 'WARNING', label: 'Attention', icon: AlertTriangle, color: 'text-amber-400' },
  { value: 'SUCCESS', label: 'Succès', icon: CheckCircle, color: 'text-emerald-400' },
];

const AdminPanel = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [newText, setNewText] = useState('');
  const [newType, setNewType] = useState('INFO');
  const [tab, setTab] = useState<'announcements' | 'users' | 'stats' | 'feedback'>('announcements');
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [stats, setStats] = useState<StatsData>({ usersCount: 0, gradesCount: 0, announcementsCount: 0 });

  // Check admin role
  useEffect(() => {
    if (!user) return;
    const check = async () => {
      const { data } = await supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' });
      setIsAdmin(!!data);
    };
    check();
  }, [user]);

  // Load data
  const loadAnnouncements = useCallback(async () => {
    const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
    if (data) setAnnouncements(data);
  }, []);

  const loadUsers = useCallback(async () => {
    const { data } = await supabase.from('profiles').select('user_id, first_name, last_name, created_at').order('created_at', { ascending: false });
    if (data) setUsers(data);
  }, []);

  const loadFeedback = useCallback(async () => {
    const { data } = await supabase.from('feedback').select('id, user_id, message, created_at').order('created_at', { ascending: false });
    if (data) setFeedbackList(data);
  }, []);

  const loadStats = useCallback(async () => {
    const [u, g, a] = await Promise.all([
      supabase.from('profiles').select('user_id', { count: 'exact', head: true }),
      supabase.from('grades').select('id', { count: 'exact', head: true }),
      supabase.from('announcements').select('id', { count: 'exact', head: true }),
    ]);
    setStats({
      usersCount: u.count ?? 0,
      gradesCount: g.count ?? 0,
      announcementsCount: a.count ?? 0,
    });
  }, []);

  useEffect(() => {
    if (isAdmin) {
      loadAnnouncements();
      loadUsers();
      loadFeedback();
      loadStats();
    }
  }, [isAdmin, loadAnnouncements, loadUsers, loadFeedback, loadStats]);

  const addAnnouncement = async () => {
    if (!newText.trim()) return;
    await supabase.from('announcements').insert({ text: newText.trim(), type: newType });
    setNewText('');
    loadAnnouncements();
  };

  const deleteAnnouncement = async (id: string) => {
    await supabase.from('announcements').delete().eq('id', id);
    loadAnnouncements();
  };

  if (authLoading || isAdmin === null) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="h-screen bg-background flex flex-col items-center justify-center gap-4 px-6">
        <Shield className="text-destructive" size={48} />
        <h1 className="text-2xl font-bold">Accès refusé</h1>
        <p className="text-muted-foreground text-center">Tu n'as pas les permissions nécessaires pour accéder à cette page.</p>
        <button onClick={() => navigate('/')} className="mt-4 bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-semibold">
          Retour à l'accueil
        </button>
      </div>
    );
  }

  const typeConfig = (type: string) => ANNOUNCEMENT_TYPES.find(t => t.value === type) || ANNOUNCEMENT_TYPES[0];

  return (
    <div className="min-h-screen bg-background pb-10">
      {/* Header */}
      <header className="p-6 pt-12 bg-gradient-to-b from-destructive/10 to-transparent sticky top-0 z-40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/dashboard')} className="p-2 bg-card rounded-full border border-border text-muted-foreground hover:text-foreground transition-colors" title="Retour au dashboard">
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="text-xs font-bold text-destructive mb-1 uppercase tracking-wider flex items-center gap-1">
              <Shield size={12} /> Administration
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Panel Admin</h1>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="px-4 mt-4 flex flex-wrap gap-2">
        {[
          { id: 'announcements' as const, icon: Megaphone, label: 'Annonces' },
          { id: 'users' as const, icon: Users, label: 'Utilisateurs' },
          { id: 'stats' as const, icon: BarChart3, label: 'Statistiques' },
          { id: 'feedback' as const, icon: MessageSquare, label: 'Retours' },
        ].map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
              tab === id ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground'
            }`}
          >
            <Icon size={16} /> {label}
          </button>
        ))}
      </div>

      <main className="px-4 mt-6 space-y-4">
        {tab === 'announcements' && (
          <>
            {/* New announcement */}
            <div className="fintech-card p-4 space-y-3 border border-foreground/5">
              <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground">Nouvelle annonce</h3>
              <div className="flex gap-2">
                {ANNOUNCEMENT_TYPES.map(t => (
                  <button
                    key={t.value}
                    onClick={() => setNewType(t.value)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
                      newType === t.value ? 'bg-foreground/10 border-foreground/20' : 'border-transparent text-muted-foreground'
                    }`}
                  >
                    <t.icon size={14} className={t.color} />
                    {t.label}
                  </button>
                ))}
              </div>
              <textarea
                value={newText}
                onChange={e => setNewText(e.target.value)}
                placeholder="Contenu de l'annonce..."
                className="w-full bg-background/50 rounded-xl p-3 text-sm outline-none resize-none min-h-[80px] border border-foreground/5 placeholder-foreground/30"
              />
              <button
                onClick={addAnnouncement}
                disabled={!newText.trim()}
                className="w-full bg-primary text-primary-foreground font-bold py-3 rounded-xl flex items-center justify-center gap-2 disabled:opacity-40 transition-opacity"
              >
                <Plus size={18} /> Publier
              </button>
            </div>

            {/* Existing announcements */}
            <div className="space-y-3">
              {announcements.length === 0 && (
                <p className="text-center text-muted-foreground text-sm py-8">Aucune annonce pour le moment.</p>
              )}
              {announcements.map(a => {
                const tc = typeConfig(a.type);
                return (
                  <div key={a.id} className="fintech-card p-4 border border-foreground/5 flex items-start gap-3">
                    <tc.icon size={18} className={tc.color + ' mt-0.5 shrink-0'} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-relaxed">{a.text}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(a.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <button
                      onClick={() => deleteAnnouncement(a.id)}
                      className="p-2 text-destructive/60 hover:text-destructive transition-colors shrink-0"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {tab === 'users' && (
          <div className="space-y-3">
            <div className="fintech-card p-4 border border-foreground/5">
              <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-1">Utilisateurs inscrits</h3>
              <p className="text-2xl font-bold">{users.length}</p>
            </div>
            {users.map(u => (
              <div key={u.user_id} className="fintech-card p-4 border border-foreground/5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-sm shrink-0">
                  {u.first_name?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">{u.first_name} {u.last_name || ''}</p>
                  <p className="text-xs text-muted-foreground">
                    Inscrit le {new Date(u.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === 'stats' && (
          <div className="grid gap-4 md:grid-cols-3">
            <div className="fintech-card p-5 border border-foreground/5">
              <BarChart3 className="text-primary mb-2" size={24} />
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Utilisateurs</p>
              <p className="text-3xl font-bold">{stats.usersCount}</p>
            </div>
            <div className="fintech-card p-5 border border-foreground/5">
              <BarChart3 className="text-primary mb-2" size={24} />
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Notes enregistrées</p>
              <p className="text-3xl font-bold">{stats.gradesCount}</p>
            </div>
            <div className="fintech-card p-5 border border-foreground/5">
              <Megaphone className="text-primary mb-2" size={24} />
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Annonces</p>
              <p className="text-3xl font-bold">{stats.announcementsCount}</p>
            </div>
          </div>
        )}

        {tab === 'feedback' && (
          <div className="space-y-3">
            <div className="fintech-card p-4 border border-foreground/5">
              <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-1">Retours des étudiants</h3>
              <p className="text-2xl font-bold">{feedbackList.length}</p>
            </div>
            {feedbackList.length === 0 && (
              <p className="text-center text-muted-foreground text-sm py-8">Aucun retour pour le moment.</p>
            )}
            {feedbackList.map(f => (
              <div key={f.id} className="fintech-card p-4 border border-foreground/5">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{f.message}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  Utilisateur {f.user_id.slice(0, 8)}… · {new Date(f.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminPanel;
