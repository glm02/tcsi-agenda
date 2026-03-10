import { useState } from 'react';
import { MessageCircle, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface FeedbackFormProps {
  userId: string;
}

const FeedbackForm = ({ userId }: FeedbackFormProps) => {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  const submit = async () => {
    const text = message.trim();
    if (!text || !userId) return;
    setSending(true);
    const { error } = await supabase.from('feedback').insert({ user_id: userId, message: text });
    setSending(false);
    if (error) {
      toast.error(error.message || 'Erreur lors de l\'envoi.');
      return;
    }
    setMessage('');
    toast.success('Merci pour ton retour !');
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-4 space-y-3">
      <h3 className="font-semibold text-sm flex items-center gap-2">
        <MessageCircle size={18} /> Signaler / Suggérer
      </h3>
      <textarea
        value={message}
        onChange={e => setMessage(e.target.value)}
        placeholder="Signaler une erreur ou suggérer une amélioration..."
        className="w-full min-h-[80px] rounded-xl border border-border bg-background px-3 py-2 text-sm resize-none placeholder:text-muted-foreground"
      />
      <Button
        onClick={submit}
        disabled={sending || !message.trim()}
        variant="secondary"
        className="w-full"
      >
        {sending ? <span className="animate-pulse">Envoi…</span> : <><Send size={16} className="mr-2" /> Envoyer</>}
      </Button>
    </div>
  );
};

export default FeedbackForm;
