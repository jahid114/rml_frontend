import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, Moon, Sun } from 'lucide-react';
import { cn } from './ui/cn';
import { useSiteSettings } from '@/lib/hooks';
import { useTheme } from '@/lib/theme';

interface NavItem {
  key: string;
  to: string;
  children?: { key: string; to: string; label: string }[];
}

const NAV: NavItem[] = [
  { key: 'home', to: '/' },
  { key: 'about', to: '/about' },
  {
    key: 'team',
    to: '/team',
    children: [
      { key: 'team', to: '/team', label: 'Research Team' },
      { key: 'research-assistants', to: '/team/research-assistants', label: 'Research Assistants' },
      { key: 'non-resident-fellows', to: '/team/non-resident-fellows', label: 'Non-Resident Fellows' },
      { key: 'affiliates', to: '/team/affiliates', label: 'Research Affiliates' },
    ],
  },
  { key: 'research', to: '/research' },
  { key: 'publications', to: '/publications' },
  { key: 'events', to: '/events' },
  {
    key: 'programmes',
    to: '/programmes/internship',
    children: [
      { key: 'internship', to: '/programmes/internship', label: 'Internship Programme' },
      { key: 'visiting-fellowship', to: '/programmes/visiting-fellowship', label: 'Visiting Fellowship' },
    ],
  },
  { key: 'join', to: '/join' },
  { key: 'contact', to: '/contact' },
];

export function Navbar() {
  const { data: settings } = useSiteSettings();
  const [open, setOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    setOpen(false);
    setOpenMenu(null);
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const labels = settings?.navLabels ?? {};
  const labelFor = (key: string) => labels[key] ?? key.charAt(0).toUpperCase() + key.slice(1).replace(/-/g, ' ');

  const logoUrl = settings?.logoUrl;
  const [logoError, setLogoError] = useState(false);
  useEffect(() => {
    setLogoError(false);
  }, [logoUrl]);
  const showLogo = Boolean(logoUrl) && !logoError;

  return (
    <header
      className={cn(
        'sticky top-0 z-50 border-b transition-all duration-300',
        scrolled ? 'border-line bg-canvas/95 shadow-sm backdrop-blur-xl' : 'border-transparent bg-canvas',
      )}
    >
      <div className='mx-auto flex h-[72px] w-full max-w-[1440px] items-center gap-2 px-3 sm:gap-3 sm:px-4 lg:h-[72px] lg:px-4 xl:px-6'>
        {/* Brand block: logo + wordmark are visible at every width. It grows to
            fill the free space on small screens so the action buttons stay
            pinned to the far right; from 1280px up the inline nav takes over
            that space instead. */}
        <Link
          to='/'
          className='flex min-w-0 flex-1 items-center gap-2 sm:gap-3 xl:flex-none'
          aria-label='RML home'
        >
          {showLogo ? (
            <img
              src={logoUrl}
              alt='RML logo'
              className='h-6 w-auto shrink-0 min-[360px]:h-7 sm:h-8 lg:h-9'
              onError={() => setLogoError(true)}
            />
          ) : (
            <span className='shrink-0 font-serif text-xl text-primary sm:text-2xl'>RML</span>
          )}
          <span className='min-w-0 border-l border-line pl-2 text-[10px] font-semibold uppercase leading-tight tracking-[.08em] text-ink-soft sm:text-xs sm:tracking-[.13em]'>
            Refugee and Migration Lab
          </span>
        </Link>

        <nav className='hidden items-center gap-1 xl:ml-auto xl:flex' aria-label='Primary'>
          {NAV.map((item) => (
            <div
              key={item.key}
              className='relative'
              onMouseEnter={() => item.children && setOpenMenu(item.key)}
              onMouseLeave={() => setOpenMenu(null)}
            >
              <NavLink
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-2 text-xs font-semibold uppercase tracking-wide transition-colors',
                    isActive ? 'bg-primary text-white' : 'text-ink hover:bg-primary/5 hover:text-primary',
                  )
                }
              >
                {labelFor(item.key)}
                {item.children && <ChevronDown className='h-3.5 w-3.5' aria-hidden />}
              </NavLink>
              {item.children && openMenu === item.key && (
                <div className='absolute left-0 top-full pt-1'>
                  <div className='w-56 overflow-hidden rounded-lg border border-line bg-white py-1 shadow-card'>
                    {item.children.map((c) => (
                      <Link
                        key={c.to}
                        to={c.to}
                        className='block px-4 py-2 text-sm text-ink hover:bg-primary/5 hover:text-primary'
                      >
                        {c.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </nav>

        <div className='flex shrink-0 items-center'>
          <button
            type='button'
            className='rounded-md p-2 text-ink transition-colors hover:bg-primary/5'
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? <Moon className='h-5 w-5' /> : <Sun className='h-5 w-5' />}
          </button>
          <button
            type='button'
            className='rounded-md p-2 text-ink xl:hidden'
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            {open ? <X className='h-6 w-6' /> : <Menu className='h-6 w-6' />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className='border-t border-line bg-canvas xl:hidden'>
          <nav className='container-content flex flex-col gap-1 py-4' aria-label='Mobile'>
            {NAV.map((item) => (
              <div key={item.key}>
                <NavLink
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    cn(
                      'block rounded-md px-3 py-2.5 text-base font-medium',
                      isActive ? 'bg-accent/10 text-accent' : 'text-ink hover:bg-primary/5',
                    )
                  }
                >
                  {labelFor(item.key)}
                </NavLink>
                {item.children && (
                  <div className='ml-3 border-l border-line pl-2'>
                    {item.children.map((c) => (
                      <Link
                        key={c.to}
                        to={c.to}
                        className='block rounded-md px-3 py-2 text-sm text-ink-muted hover:text-primary'
                      >
                        {c.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
