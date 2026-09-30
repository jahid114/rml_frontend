import { LogOut, Moon, Sun, User } from 'lucide-react';
import { useAuth } from '@/lib/use-auth';
import { useTheme } from '@/lib/theme';

export function AdminTopbar() {
  const { session, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-line bg-white px-6">
      <div />
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          className="rounded p-1.5 text-ink-muted transition-colors hover:bg-primary/5 hover:text-primary"
        >
          {theme === 'light' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </button>
        <div className="flex items-center gap-2 text-sm text-ink-soft">
          <User className="h-4 w-4" />
          <span>{session?.user.name}</span>
          <span className="rounded bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
            {session?.user.role}
          </span>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-1.5 rounded px-2 py-1 text-sm text-ink-muted transition-colors hover:bg-red-50 hover:text-red-600"
        >
          <LogOut className="h-3.5 w-3.5" />
          Logout
        </button>
      </div>
    </header>
  );
}
