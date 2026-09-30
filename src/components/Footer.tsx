import { Link } from 'react-router-dom';
import { Facebook, Linkedin, Youtube, Instagram, Twitter, MessageCircle } from 'lucide-react';
import { useSiteSettings } from '@/lib/hooks';

const PLATFORM_ICONS: Record<string, typeof Facebook> = {
  Facebook,
  LinkedIn: Linkedin,
  YouTube: Youtube,
  Instagram,
  X: Twitter,
  Bluesky: MessageCircle,
  Threads: MessageCircle,
};

const FOOTER_NAV = [
  { key: 'about', to: '/about' },
  { key: 'team', to: '/team' },
  { key: 'research', to: '/research' },
  { key: 'publications', to: '/publications' },
  { key: 'events', to: '/events' },
  { key: 'join', to: '/join' },
  { key: 'contact', to: '/contact' },
];

export function Footer() {
  const { data: settings } = useSiteSettings();
  const labels = settings?.navLabels ?? {};
  const labelFor = (key: string) =>
    labels[key] ?? key.charAt(0).toUpperCase() + key.slice(1).replace(/-/g, ' ');

  return (
    <footer className="border-t border-white/10 bg-primary text-white">
      <div className="container-content py-16">
        <div className="grid gap-12 md:grid-cols-[1.4fr_.7fr_.9fr]">
          <div>
            <div className="mb-3 flex items-center gap-3">
              {settings?.logoUrl && (
                <img src={settings.logoUrl} alt="RML logo" className="h-10 w-auto brightness-0 invert" />
              )}
              <span className="font-serif text-xl">Refugee &amp; Migration Lab</span>
            </div>
            <p className="text-sm leading-6 text-white/70">
              {settings?.footerText ??
                'An interdisciplinary research collective researching people and politics across borders.'}
            </p>
            <a
              href={`mailto:${settings?.contactEmail ?? 'contact@rml.example.org'}`}
              className="mt-4 inline-block text-sm text-accent-200 underline underline-offset-2"
            >
              {settings?.contactEmail ?? 'contact@rml.example.org'}
            </a>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/80">
              Navigate
            </h3>
            <ul className="space-y-2 text-sm">
              {FOOTER_NAV.map((item) => (
                <li key={item.to}>
                  <Link to={item.to} className="text-white/70 transition-colors hover:text-white">
                    {labelFor(item.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wider text-white/80">
              Follow
            </h3>
            <div className="flex flex-wrap gap-3">
              {settings?.socialLinks?.map((s) => {
                const Icon = PLATFORM_ICONS[s.platform] ?? MessageCircle;
                return (
                  <a
                    key={s.platform + s.url}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={s.platform}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white transition-colors hover:border-accent hover:bg-accent"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 text-xs text-white/50">
          &copy; {new Date().getFullYear()} Refugee and Migration Lab. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
