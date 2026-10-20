import { useEffect, useState } from 'react';
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
  { key: 'internship', to: '/programmes/internship' },
  { key: 'visiting-fellowship', to: '/programmes/visiting-fellowship' },
  { key: 'join', to: '/join' },
  { key: 'contact', to: '/contact' },
];

export function Footer() {
  const { data: settings } = useSiteSettings();
  const labels = settings?.navLabels ?? {};
  const labelFor = (key: string) =>
    labels[key] ?? key.charAt(0).toUpperCase() + key.slice(1).replace(/-/g, ' ');

  // Use the same logo rendering as the header (Navbar). The uploaded logo
  // already has a dark background with white text, so no invert filter —
  // the previous `brightness-0 invert` turned it into a solid white box.
  const logoUrl = settings?.logoUrl;
  const [logoError, setLogoError] = useState(false);
  useEffect(() => {
    setLogoError(false);
  }, [logoUrl]);
  const showLogo = Boolean(logoUrl) && !logoError;

  return (
    <footer className="border-t border-white/10 bg-primary text-white">
      <div className="container-content py-16">
        <div className="grid gap-12 md:grid-cols-[1.4fr_.7fr_.9fr]">
          <div>
            <Link to="/" className="mb-3 flex items-center gap-3" aria-label="RML home">
              {showLogo ? (
                <img
                  src={logoUrl}
                  alt="RML logo"
                  className="h-10 w-auto rounded"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <span className="font-serif text-2xl text-white">RML</span>
              )}
              <span className="font-serif text-xl">Refugee and Migration Lab</span>
            </Link>
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

        <div className="mt-12 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <span>&copy; {new Date().getFullYear()} Refugee and Migration Lab. All rights reserved.</span>
          <span>
            Developed by{' '}
            <a
              href="https://github.com/jahid114"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/70 underline underline-offset-2 transition-colors hover:text-white"
            >
              MD Zanea Alam Jahid
            </a>
          </span>
          <a
            href="/sitemap.xml"
            className="text-white/50 underline underline-offset-2 transition-colors hover:text-white"
          >
            Sitemap
          </a>
        </div>
      </div>
    </footer>
  );
}
