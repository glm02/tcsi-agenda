import { Plus } from 'lucide-react';
import { useStudent } from '@/contexts/StudentContext';
import NotesView from '@/components/views/NotesView';
import AutoImportModal from '@/components/AutoImportModal';
import { useState } from 'react';
import type { ModuleConfig } from '@/lib/constants';

const NotesPage = () => {
  const {
    semester,
    setSemester,
    visibleUEs,
    setVisibleUEs,
    s2Grades,
    absences,
    stats,
    history,
    setSelectedModule,
    updateAbsence,
    updateHistory,
    modules,
    handleUpdateGrades,
  } = useStudent();

  const [isImportOpen, setIsImportOpen] = useState(false);

  const handleImport = async (extracted: { moduleId: string; grades: { value: string; name: string }[] }[]) => {
    for (const item of extracted) {
      const existing = s2Grades[item.moduleId] || [];
      const newGrades = [...existing];
      item.grades.forEach(g => {
        newGrades.push({
          id: crypto.randomUUID(),
          value: g.value,
          coef: '1',
          name: g.name
        });
      });
      await handleUpdateGrades(item.moduleId, newGrades);
    }
    setIsImportOpen(false);
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Notes</h1>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsImportOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium hover:opacity-90"
          >
            Import Auto
          </button>
          <button
            type="button"
            onClick={() => setSelectedModule(modules[0] as ModuleConfig)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
          >
            <Plus size={18} /> Note
          </button>
        </div>
      </div>
      <NotesView
        semester={semester}
        setSemester={setSemester}
        visibleUEs={visibleUEs}
        setVisibleUEs={setVisibleUEs}
        s2Grades={s2Grades}
        absences={absences}
        stats={stats}
        history={history}
        onModuleClick={(mod) => setSelectedModule(mod)}
        onAbsenceUpdate={updateAbsence}
        onHistoryUpdate={updateHistory}
        modules={modules}
      />
      <AutoImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        modules={modules}
        onImport={handleImport}
      />
    </div>
  );
};

export default NotesPage;
