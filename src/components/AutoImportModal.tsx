import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { parseTranscript } from '@/lib/helpers';
import type { ModuleConfig } from '@/lib/constants';

interface AutoImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  modules: ModuleConfig[];
  onImport: (extracted: { moduleId: string; grades: { value: string; name: string }[] }[]) => void;
}

const AutoImportModal = ({ isOpen, onClose, modules, onImport }: AutoImportModalProps) => {
  const [text, setText] = useState('');
  const [preview, setPreview] = useState<{ moduleId: string; grades: { value: string; name: string }[] }[] | null>(null);

  if (!isOpen) return null;

  const handleAnalyze = () => {
    const extracted = parseTranscript(text, modules);
    setPreview(extracted);
  };

  const handleConfirm = () => {
    if (preview) {
      onImport(preview);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-lg rounded-2xl shadow-xl border border-border flex flex-col max-h-[90vh]">
        <div className="p-4 border-b border-border flex justify-between items-center">
          <h2 className="font-bold text-lg">Import Auto (Tomuss / ADE)</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">✕</button>
        </div>
        
        <div className="p-4 overflow-y-auto space-y-4">
          <p className="text-sm text-muted-foreground">Collez ici le texte brut de votre relevé de notes depuis votre intranet (incluant les codes comme R1.01 ou TCSI-1 et les notes).</p>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full h-32 p-3 rounded-xl border border-input bg-background text-sm"
            placeholder="R1.01 - Mathématiques : 14.5&#10;S1.1 - SAÉ 1 : 12"
          />
          
          <Button onClick={handleAnalyze} disabled={!text.trim()} className="w-full">
            Analyser le texte
          </Button>

          {preview && (
            <div className="mt-4 space-y-2">
              <h3 className="font-semibold text-sm">Aperçu de l'import :</h3>
              {preview.length === 0 ? (
                <p className="text-xs text-destructive">Aucune note détectée. Vérifiez le format.</p>
              ) : (
                <div className="space-y-2">
                  {preview.map(item => {
                    const mod = modules.find(m => m.id === item.moduleId);
                    return (
                      <div key={item.moduleId} className="text-xs bg-foreground/5 p-2 rounded">
                        <span className="font-bold">{mod?.label}</span> : {item.grades.map(g => g.value).join(', ')}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-border flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>Annuler</Button>
          <Button className="flex-1" disabled={!preview || preview.length === 0} onClick={handleConfirm}>
            Importer ({preview?.reduce((acc, curr) => acc + curr.grades.length, 0) || 0} notes)
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AutoImportModal;
