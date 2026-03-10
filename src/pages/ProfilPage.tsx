import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  User,
  LogOut,
  Shield,
  ChevronRight,
  Camera,
  Link2,
  Eye,
  EyeOff,
  Palette,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useStudent } from '@/contexts/StudentContext';
import { supabase } from '@/integrations/supabase/client';
import ProfileAvatar from '@/components/ProfileAvatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import FeedbackForm from '@/components/FeedbackForm';

const AVATAR_BUCKET = 'avatars';

const ProfilPage = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const {
    profile,
    stats,
    updateProfile,
    isAdmin,
    refreshAgenda,
  } = useStudent();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [adeTestStatus, setAdeTestStatus] = useState<'idle' | 'testing' | 'ok' | 'error'>('idle');
  const [adeTestMessage, setAdeTestMessage] = useState('');

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image trop volumineuse (max 2 Mo).');
      return;
    }
    setUploading(true);
    const ext = file.name.split('.').pop() || 'jpg';
    const path = `${user.id}.${ext}`;
    const { error } = await supabase.storage.from(AVATAR_BUCKET).upload(path, file, {
      upsert: true,
      contentType: file.type,
    });
    if (error) {
      toast.error(error.message || 'Erreur lors de l\'upload.');
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
    await updateProfile({ avatarUrl: urlData.publicUrl });
    toast.success('Photo mise à jour.');
    setUploading(false);
  };

  const handleTestAde = async () => {
    if (!profile.adeUrl?.trim()) {
      setAdeTestStatus('error');
      setAdeTestMessage('Indiquez une URL ADE.');
      return;
    }
    setAdeTestStatus('testing');
    setAdeTestMessage('');
    try {
      const { data, error } = await supabase.functions.invoke('fetch-ical', {
        body: { url: profile.adeUrl.trim() },
      });
      if (error) {
        setAdeTestStatus('error');
        setAdeTestMessage(error.message || 'Erreur lors du test.');
        return;
      }
      const text = data?.data;
      if (text && String(text).includes('BEGIN:VCALENDAR')) {
        setAdeTestStatus('ok');
        setAdeTestMessage('Lien valide.');
      } else {
        setAdeTestStatus('error');
        setAdeTestMessage('Format iCal invalide.');
      }
    } catch {
      setAdeTestStatus('error');
      setAdeTestMessage('Timeout ou erreur réseau.');
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Profil</h1>

      {/* Carte profil */}
      <div className="rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-border p-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <ProfileAvatar
              src={profile.avatarUrl}
              firstName={profile.firstName}
              lastName={profile.lastName}
              pseudo={profile.pseudo}
              size="lg"
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg border-2 border-background"
            >
              {uploading ? <Loader2 size={16} className="animate-spin" /> : <Camera size={14} />}
            </button>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-lg font-bold truncate">
              {profile.pseudo?.trim() || profile.firstName || 'Étudiant'}
            </p>
            <p className="text-sm text-muted-foreground">Promo GEII</p>
            <p className="text-2xl font-bold tabular-nums mt-1">
              {profile.blurGrades ? '•••' : (stats.global ?? '--')}
              <span className="text-sm font-normal text-muted-foreground ml-1">/20</span>
            </p>
          </div>
        </div>
      </div>

      {/* Champs */}
      <div className="rounded-2xl border border-border bg-card p-4 space-y-4">
        <div>
          <Label>Prénom</Label>
          <Input
            value={profile.firstName}
            onChange={(e) => updateProfile({ firstName: e.target.value })}
            className="mt-1"
          />
        </div>
        <div>
          <Label>Nom</Label>
          <Input
            value={profile.lastName || ''}
            onChange={(e) => updateProfile({ lastName: e.target.value })}
            className="mt-1"
          />
        </div>
        <div>
          <Label>Pseudo (classements)</Label>
          <Input
            value={profile.pseudo || ''}
            onChange={(e) => updateProfile({ pseudo: e.target.value || null })}
            placeholder="Affiché dans le classement"
            className="mt-1"
          />
        </div>
        <div>
          <Label>Lien ADE (iCal)</Label>
          <Input
            value={profile.adeUrl}
            onChange={(e) => { updateProfile({ adeUrl: e.target.value }); setAdeTestStatus('idle'); }}
            placeholder="https://..."
            className="mt-1 font-mono text-xs"
          />
          <div className="flex items-center gap-2 mt-2">
            <Button variant="secondary" size="sm" onClick={handleTestAde} disabled={adeTestStatus === 'testing'}>
              {adeTestStatus === 'testing' ? 'Test…' : 'Tester mon lien'}
            </Button>
            {adeTestMessage && (
              <span className={`text-sm ${adeTestStatus === 'ok' ? 'text-green-600' : 'text-destructive'}`}>
                {adeTestMessage}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Préférences */}
      <div className="rounded-2xl border border-border bg-card p-4 space-y-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Palette size={18} /> Affichage
        </h3>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {profile.blurGrades ? <EyeOff size={18} /> : <Eye size={18} />}
            <span className="text-sm">Mode confidentialité (flouter les notes)</span>
          </div>
          <Switch
            checked={profile.blurGrades}
            onCheckedChange={(v) => updateProfile({ blurGrades: v })}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm">Participer au classement public</span>
          <Switch
            checked={profile.rankingVisible}
            onCheckedChange={(v) => updateProfile({ rankingVisible: v })}
          />
        </div>
      </div>

      {/* Infos */}
      <div className="rounded-2xl border border-border divide-y divide-border">
        <div className="p-4 flex items-center gap-3">
          <User size={18} className="text-muted-foreground" />
          <span className="text-sm flex-1">Email</span>
          <span className="text-xs text-muted-foreground font-mono truncate max-w-[180px]">{user?.email}</span>
        </div>
        <div className="p-4 flex items-center gap-3">
          <Link2 size={18} className="text-muted-foreground" />
          <span className="text-sm flex-1">Version</span>
          <span className="text-xs text-muted-foreground font-mono">Hub GEII v2</span>
        </div>
      </div>

      {isAdmin && (
        <Button
          variant="outline"
          className="w-full border-destructive/30 text-destructive hover:bg-destructive/10"
          onClick={() => navigate('/admin')}
        >
          <Shield size={18} className="mr-2" /> Administration
          <ChevronRight size={16} className="ml-auto" />
        </Button>
      )}

      <FeedbackForm userId={user?.id ?? ''} />

      <Button
        variant="destructive"
        className="w-full"
        onClick={() => signOut()}
      >
        <LogOut size={18} className="mr-2" /> Se déconnecter
      </Button>
    </div>
  );
};

export default ProfilPage;
