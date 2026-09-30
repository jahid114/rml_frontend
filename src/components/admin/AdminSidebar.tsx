import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  CalendarDays,
  FlaskConical,
  Briefcase,
  FileText,
  Settings,
  Image,
  ShieldCheck,
  ChevronLeft,
} from 'lucide-react';
import { cn } from '@/components/ui/cn';
import { useAuth } from '@/lib/use-auth';

const NAV: NavItem[] = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/people', icon: Users, label: 'People' },
  { to: '/admin/publications', icon: BookOpen, label: 'Publications' },
  { to: '/admin/events', icon: CalendarDays, label: 'Events' },
  { to: '/admin/research', icon: FlaskConical, label: 'Research' },
  { to: '/admin/jobs', icon: Briefcase, label: 'Jobs' },
  { to: '/admin/pages', icon: FileText, label: 'Pages' },
  { to: '/admin/media', icon: Image, label: 'Media' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
];

interface NavItem {
  to: string;
  icon: typeof LayoutDashboard;
  label: string;
  end?: boolean;
}

const ADMIN_NAV: NavItem[] = [
  { to: '/admin/administrators', icon: ShieldCheck, label: 'Administrators' },
];

export function AdminSidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const { hasRole } = useAuth();
  const items = hasRole('admin') ? [...NAV, ...ADMIN_NAV] : NAV;
  return (
    <aside
      className={cn(
        'fixed inset-y-0 left-0 z-30 flex flex-col border-r border-line bg-primary text-white transition-[width] duration-200',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      <div className="flex h-14 items-center justify-between border-b border-white/10 px-4">
        {!collapsed && <span className="text-sm font-semibold tracking-wide">RML Admin</span>}
        <button
          onClick={onToggle}
          className="rounded p-1 text-white/60 hover:text-white"
          aria-label="Toggle sidebar"
        >
          <ChevronLeft className={cn('h-4 w-4 transition-transform', collapsed && 'rotate-180')} />
        </button>
      </div>
      <nav className="flex-1 overflow-y-auto py-2">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-4 py-2.5 text-sm transition-colors',
                isActive ? 'bg-white/15 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white',
                collapsed && 'justify-center px-2'
              )
            }
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
