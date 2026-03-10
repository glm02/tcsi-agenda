import { useState } from 'react';
import { ExternalLink, Check, X, Loader2 } from 'lucide-react';
import { USEFUL_LINKS } from '@/lib/constants';
import { GraduationCap, FileText, Calendar, Mail, Paperclip, Train } from 'lucide-react';

const iconMap = {
  GraduationCap,
  FileText,
  Calendar,
  Mail,
  Paperclip,
  Train,
};

const RessourcesPage = () => {
  const [testingUrl, setTestingUrl] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<Record<string, boolean | null>>({});

  const testLink = async (url: string, name: string) => {
    setTestingUrl(name);
    setTestResult(prev => ({ ...prev, [name]: null }));
    try {
      const res = await fetch(url, { method: 'HEAD', mode: 'no-cors' }).catch(() => null);
      setTestResult(prev => ({ ...prev, [name]: true }));
    } catch {
      setTestResult(prev => ({ ...prev, [name]: false }));
    }
    setTestingUrl(null);
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-2">Ressources</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Liens utiles vers l&apos;ENT, Moodle, emploi du temps, etc.
      </p>
      <div className="grid gap-3">
        {USEFUL_LINKS.map(link => {
          const Icon = iconMap[link.icon as keyof typeof iconMap] || ExternalLink;
          const testing = testingUrl === link.name;
          const result = testResult[link.name];
          return (
            <a
              key={link.name}
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 p-4 rounded-2xl border border-border bg-card hover:bg-muted/50 transition-colors"
            >
              <div className={`w-12 h-12 rounded-xl ${link.color} flex items-center justify-center text-white`}>
                <Icon size={24} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold">{link.name}</p>
                <p className="text-xs text-muted-foreground truncate">{link.url}</p>
              </div>
              <button
                type="button"
                onClick={(e) => { e.preventDefault(); testLink(link.url, link.name); }}
                disabled={testing}
                className="p-2 rounded-lg border border-border hover:bg-muted text-muted-foreground hover:text-foreground"
                title="Tester le lien"
              >
                {testing ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : result === true ? (
                  <Check size={18} className="text-green-500" />
                ) : result === false ? (
                  <X size={18} className="text-destructive" />
                ) : (
                  <ExternalLink size={18} />
                )}
              </button>
            </a>
          );
        })}
      </div>
    </div>
  );
};

export default RessourcesPage;
