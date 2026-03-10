import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type AdeTestStatus = 'idle' | 'testing' | 'ok' | 'error';

export function useTestAde(adeUrl: string) {
  const [status, setStatus] = useState<AdeTestStatus>('idle');
  const [message, setMessage] = useState('');

  const test = useCallback(async () => {
    const url = adeUrl?.trim();
    if (!url) {
      setStatus('error');
      setMessage('Indiquez une URL ADE.');
      return;
    }
    setStatus('testing');
    setMessage('');
    try {
      const { data, error } = await supabase.functions.invoke('fetch-ical', { body: { url } });
      if (error) {
        setStatus('error');
        setMessage(error.message || 'Erreur lors du test.');
        return;
      }
      const text = data?.data;
      if (text && String(text).includes('BEGIN:VCALENDAR')) {
        setStatus('ok');
        setMessage('Lien valide. Emploi du temps récupérable.');
      } else {
        setStatus('error');
        setMessage('Le lien ne renvoie pas un calendrier iCal valide.');
      }
    } catch {
      setStatus('error');
      setMessage('Timeout ou erreur réseau.');
    }
  }, [adeUrl]);

  return { status, message, test };
}
