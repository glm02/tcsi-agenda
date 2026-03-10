import type { ReactNode } from 'react';
import Sidebar from '@/components/Sidebar';
import HubBottomNav from '@/components/HubBottomNav';
import { useStudent } from '@/contexts/StudentContext';
import GradeEditorModal from '@/components/GradeEditorModal';
import type { ModuleConfig } from '@/lib/constants';

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  try {
    const {
      profileLoaded,
      profile,
      s2Grades,
      selectedModule,
      setSelectedModule,
      handleUpdateGrades,
      isAdmin,
    } = useStudent();

    if (!profileLoaded) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background text-foreground">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Chargement du profil…</p>
        </div>
      );
    }

    const safeS2Grades = s2Grades || {};
    const safeIsAdmin = isAdmin || false;

    return (
      <div className="min-h-screen bg-background flex">
        <Sidebar isAdmin={safeIsAdmin} />
        <main className="flex-1 min-h-screen pb-24 md:pb-0">
          {children}
        </main>
        <HubBottomNav />
        {selectedModule && (
          <GradeEditorModal
            module={selectedModule as ModuleConfig}
            grades={safeS2Grades[selectedModule.id] || []}
            onClose={() => setSelectedModule(null)}
            onSave={(grades) => handleUpdateGrades(selectedModule.id, grades)}
          />
        )}
      </div>
    );
  } catch (error) {
    console.error('AppLayout error:', error);
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background text-foreground">
        <p className="text-sm text-destructive">Erreur de chargement du layout</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm"
        >
          Recharger
        </button>
      </div>
    );
  }
};

export default AppLayout;
