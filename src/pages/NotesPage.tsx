import { Plus } from 'lucide-react';
import { useStudent } from '@/contexts/StudentContext';
import NotesView from '@/components/views/NotesView';
// removed MODULES_CONFIG_S2 import
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
  } = useStudent();

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Notes</h1>
        <button
          type="button"
          onClick={() => setSelectedModule(modules[0] as ModuleConfig)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90"
        >
          <Plus size={18} /> Ajouter une note
        </button>
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
    </div>
  );
};

export default NotesPage;
