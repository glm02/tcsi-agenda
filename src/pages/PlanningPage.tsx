import { useState } from 'react';
import { useStudent } from '@/contexts/StudentContext';
import AgendaView from '@/components/views/AgendaView';
import AgendaList from '@/components/AgendaList';
import { Calendar, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast as sonnerToast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
const PlanningPage = () => {
  const { allEvents, taskStatus, toggleTask, profile, updateProfile, refreshAgenda } = useStudent();
  const [showFullAgenda, setShowFullAgenda] = useState(false);
  const [adeModalOpen, setAdeModalOpen] = useState(false);
  const [adeUrlInput, setAdeUrlInput] = useState('');
  const [adeTestStatus, setAdeTestStatus] = useState<'idle' | 'testing' | 'ok' | 'error'>('idle');
  const [adeTestMessage, setAdeTestMessage] = useState('');

  const handleTestAde = async () => {
    const url = adeUrlInput.trim() || profile.adeUrl;
    if (!url) {
      setAdeTestStatus('error');
      setAdeTestMessage('Indiquez une URL.');
      return;
    }
    setAdeTestStatus('testing');
    setAdeTestMessage('');
    try {
      const { data, error } = await supabase.functions.invoke('fetch-ical', { body: { url } });
      if (error) {
        setAdeTestStatus('error');
        setAdeTestMessage(error.message || 'Erreur lors du test.');
        return;
      }
      const text = data?.data;
      if (text && String(text).includes('BEGIN:VCALENDAR')) {
        setAdeTestStatus('ok');
        setAdeTestMessage('Lien valide. Votre emploi du temps a été récupéré.');
      } else {
        setAdeTestStatus('error');
        setAdeTestMessage('Le lien ne renvoie pas un calendrier iCal valide.');
      }
    } catch {
      setAdeTestStatus('error');
      setAdeTestMessage('Timeout ou erreur réseau.');
    }
  };

  const handleSaveAde = async () => {
    if (adeTestStatus !== 'ok' && adeUrlInput.trim()) {
      sonnerToast.error('Testez le lien avant de sauvegarder.');
      return;
    }
    if (adeUrlInput.trim()) {
      await updateProfile({ adeUrl: adeUrlInput.trim() });
      await refreshAgenda();
      sonnerToast.success('Lien ADE enregistré.');
    }
    setAdeModalOpen(false);
    setAdeUrlInput('');
    setAdeTestStatus('idle');
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Planning</h1>
        <Button variant="outline" size="sm" onClick={() => { setAdeUrlInput(profile.adeUrl); setAdeModalOpen(true); }}>
          Paramétrer mon ADE
        </Button>
      </div>

      {showFullAgenda ? (
        <div className="fixed inset-0 z-50 bg-background overflow-y-auto">
          <div className="sticky top-0 bg-background/95 backdrop-blur-md p-4 border-b border-border flex items-center justify-between z-10">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Calendar size={20} /> Agenda complet
            </h2>
            <button
              type="button"
              onClick={() => setShowFullAgenda(false)}
              className="p-2 rounded-full border border-border text-muted-foreground hover:bg-muted"
            >
              <X size={20} />
            </button>
          </div>
          <div className="p-4 pb-10">
            <AgendaList events={allEvents} onExpand={() => {}} />
          </div>
        </div>
      ) : (
        <AgendaView
          events={allEvents}
          taskStatus={taskStatus}
          onToggle={toggleTask}
          onExpandAgenda={() => setShowFullAgenda(true)}
        />
      )}

      <Dialog open={adeModalOpen} onOpenChange={setAdeModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Lien ADE (iCal)</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="ade-url">URL du calendrier</Label>
              <Input
                id="ade-url"
                value={adeUrlInput}
                onChange={(e) => { setAdeUrlInput(e.target.value); setAdeTestStatus('idle'); }}
                placeholder="https://..."
                className="mt-2 font-mono text-xs"
              />
            </div>
            {adeTestMessage && (
              <p className={`text-sm ${adeTestStatus === 'ok' ? 'text-green-600' : 'text-destructive'}`}>
                {adeTestMessage}
              </p>
            )}
            <Button variant="secondary" onClick={handleTestAde} disabled={adeTestStatus === 'testing'}>
              {adeTestStatus === 'testing' ? 'Test en cours…' : 'Tester mon lien'}
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAdeModalOpen(false)}>Annuler</Button>
            <Button onClick={handleSaveAde}>Sauvegarder</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlanningPage;
