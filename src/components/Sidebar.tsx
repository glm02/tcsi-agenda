import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  GraduationCap,
  Calendar,
  Trophy,
  BookMarked,
  User,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/notes', icon: GraduationCap, label: 'Notes' },
  { to: '/planning', icon: Calendar, label: 'Planning' },
  { to: '/classement', icon: Trophy, label: 'Classement' },
  { to: '/ressources', icon: BookMarked, label: 'Ressources' },
  { to: '/profil', icon: User, label: 'Profil' },
] as const;

interface SidebarProps {
  isAdmin: boolean;
  className?: string;
}

const Sidebar = ({ isAdmin, className }: SidebarProps) => (
  <aside
    className={cn(
      'hidden md:flex flex-col w-56 min-h-screen bg-card/80 border-r border-border sticky top-0',
      className
    )}
  >
    <div className="p-4 border-b border-border">
      <NavLink to="/dashboard" className="flex items-center gap-2 font-bold text-lg tracking-tight">
        <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground text-sm">
          GEII
        </span>
        Hub étudiant
      </NavLink>
    </div>
    <nav className="flex-1 p-3 space-y-1">
      {navItems.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
            )
          }
        >
          <Icon size={20} strokeWidth={2} />
          {label}
        </NavLink>
      ))}
      {isAdmin && (
        <NavLink
          to="/admin"
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors mt-4 pt-4 border-t border-border',
              isActive
                ? 'bg-destructive/15 text-destructive'
                : 'text-muted-foreground hover:bg-destructive/10 hover:text-destructive'
            )
          }
        >
          <Shield size={20} strokeWidth={2} />
          Administration
        </NavLink>
      )}
    </nav>
  </aside>
);

export default Sidebar;
