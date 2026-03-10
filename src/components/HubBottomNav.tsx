import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  GraduationCap,
  Calendar,
  Trophy,
  BookMarked,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Accueil' },
  { to: '/notes', icon: GraduationCap, label: 'Notes' },
  { to: '/planning', icon: Calendar, label: 'Planning' },
  { to: '/classement', icon: Trophy, label: 'Classement' },
  { to: '/ressources', icon: BookMarked, label: 'Ressources' },
  { to: '/profil', icon: User, label: 'Profil' },
] as const;

const HubBottomNav = () => (
  <nav className="fixed bottom-0 left-0 right-0 md:hidden bg-card/95 backdrop-blur-xl border-t border-border z-50 pb-safe pt-2">
    <div className="flex justify-around px-2">
      {navItems.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center justify-center py-2 px-3 min-w-[56px] rounded-xl transition-all',
              isActive ? 'text-primary' : 'text-muted-foreground'
            )
          }
        >
          {({ isActive }) => (
            <>
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.5} className="mb-0.5" />
              <span className="text-[10px] font-medium">{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </div>
  </nav>
);

export default HubBottomNav;
