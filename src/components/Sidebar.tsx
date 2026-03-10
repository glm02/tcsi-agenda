import { ViewId } from './BottomNav';
import { Home, FileText, Calendar, Compass, Settings, LogOut } from 'lucide-react';

interface SidebarProps {
  active: ViewId;
  setView: (v: ViewId) => void;
  onSignOut: () => void;
  profileName: string;
}

const Sidebar = ({ active, setView, onSignOut, profileName }: SidebarProps) => {
  const navItems: { id: ViewId; icon: any; label: string }[] = [
    { id: 'HOME', icon: Home, label: 'Dashboard' },
    { id: 'NOTES', icon: FileText, label: 'Scolarité' },
    { id: 'AGENDA', icon: Calendar, label: 'Planning' },
    { id: 'LIFE', icon: Compass, label: 'Campus' },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 h-screen bg-card/60 backdrop-blur-xl border-r border-white/5 shadow-2xl sticky top-0 left-0 p-6">
      <div className="flex items-center gap-3 mb-10 pl-2">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center font-bold text-primary-foreground shadow-lg shadow-primary/20">
          OS
        </div>
        <h1 className="font-bold text-xl tracking-tight">GEII-OS</h1>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map(item => {
          const Icon = item.icon;
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setView(item.id)}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all duration-200 ${
                isActive 
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20 font-bold translate-x-1' 
                  : 'text-muted-foreground hover:bg-card-hover hover:text-foreground'
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="mt-auto space-y-2 pt-6 border-t border-white/5">
        <button
          onClick={() => setView('SETTINGS')}
          className={`w-full flex items-center gap-4 px-4 py-3 rounded-2xl transition-all duration-200 ${
            active === 'SETTINGS'
              ? 'bg-foreground/10 text-foreground font-bold'
              : 'text-muted-foreground hover:bg-card-hover hover:text-foreground'
          }`}
        >
          <div className="w-6 h-6 rounded-full bg-foreground/10 flex items-center justify-center font-bold text-xs">
            {profileName?.[0]?.toUpperCase() || 'U'}
          </div>
          <span className="flex-1 text-left">Paramètres</span>
        </button>
        
        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-2xl text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut size={20} />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
