import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useHomeContent, useAboutContent, useInternshipContent, useVisitingContent, useContactContent, useUpdatePageContent } from '@/lib/hooks';
import { uploadMediaFile } from '@/lib/client';
import { FormField, Input, Textarea } from '@/components/admin/FormField';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { RepeatableList } from '@/components/admin/RepeatableList';
import { WhatWeDoEditor } from '@/components/admin/WhatWeDoEditor';
import { HeroSlidesEditor } from '@/components/admin/HeroSlidesEditor';
import { Button } from '@/components/ui/primitives';
import { BackButton } from '@/components/admin/BackButton';
import { showToast } from '@/components/admin/Toast';
import { normalizeHomeContent } from '@/lib/utils';
import type { PageContentKey, HomeContent, AboutContent, ProgrammePageContent, ContactContent } from '@/lib/types';

/** Upload pending slide files (keyed by slide index) and return slides with final URLs. */
async function resolveSlideFiles(
  slides: HomeContent['heroSlides'],
  files: Record<number, File | null>
): Promise<HomeContent['heroSlides']> {
  return Promise.all(
    slides.map(async (slide, i) => {
      const file = files[i];
      if (!file) return slide;
      const uploaded = await uploadMediaFile(file, slide.title || file.name, 'pages');
      return { ...slide, imageUrl: uploaded.url };
    })
  );
}

const PAGE_LABELS: Record<PageContentKey, string> = {
  home: 'Home',
  about: 'About',
  internship: 'Internship Programme',
  'visiting-fellowship': 'Visiting Fellowship',
  contact: 'Contact',
};

export default function PageContentFormPage() {
  const { pageKey } = useParams<{ pageKey: PageContentKey }>();
  const key = pageKey as PageContentKey;

  if (key === 'home') return <HomeEditor />;
  if (key === 'about') return <AboutEditor />;
  if (key === 'internship' || key === 'visiting-fellowship') return <ProgrammeEditor pageKey={key} />;
  if (key === 'contact') return <ContactEditor />;
  return <div className="text-ink-muted">Unknown page.</div>;
}

// ─── Home ────────────────────────────────────────────────────────────────────

function HomeEditor() {
  const navigate = useNavigate();
  const { data, isLoading } = useHomeContent();
  const updateContent = useUpdatePageContent();
  const [form, setForm] = useState<HomeContent | null>(null);
  const slideFiles = useRef<Record<number, File | null>>({});

  useEffect(() => { if (data) setForm((prev) => prev ?? normalizeHomeContent(data)); }, [data]);

  const set = <K extends keyof HomeContent>(key: K, val: HomeContent[K]) => setForm((f) => f ? { ...f, [key]: val } : f);

  const handleSave = async () => {
    if (!form) return;
    if (!Array.isArray(form.heroSlides) || form.heroSlides.length === 0) {
      showToast('error', 'Add at least one hero slide');
      return;
    }
    const incomplete = form.heroSlides.findIndex(
      (s) => !s.imageUrl || !s.eyebrow || !s.title || !s.description || !s.ctaLabel || !s.ctaUrl,
    );
    if (incomplete !== -1) {
      showToast('error', `Hero slide ${incomplete + 1} is incomplete — fill every field`);
      return;
    }
    try {
      const heroSlides = await resolveSlideFiles(form.heroSlides, slideFiles.current);
      await updateContent.mutateAsync({ key: 'home', data: { ...form, heroSlides } });
      slideFiles.current = {};
      showToast('success', 'Home content saved');
      navigate('/admin/pages');
    } catch { showToast('error', 'Something went wrong'); }
  };

  if (isLoading || !form) return <div className="h-64 animate-pulse rounded-card bg-line/40" />;

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <BackButton to="/admin/pages" label="Back to pages" />
      <div>
        <h1 className="text-2xl font-semibold text-ink">Edit: Home</h1>
        <p className="mt-1 text-sm text-ink-muted">Every section of the public homepage is editable below. Add, edit, delete and reorder hero slides — the featured event / job cards pull live data automatically.</p>
      </div>

      {/* ── Hero slider ── */}
      <section className="rounded-card border border-line bg-white p-6 space-y-5">
        <div>
          <h2 className="text-base font-semibold text-ink">Hero slider</h2>
          <p className="mt-0.5 text-xs text-ink-muted">Slides appear in order on the homepage carousel. Use the arrows to reorder.</p>
        </div>
        <HeroSlidesEditor
          slides={form.heroSlides}
          onChange={(slides) => set('heroSlides', slides)}
          onFile={(i, file) => { slideFiles.current[i] = file; }}
        />
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.includeEventSlide}
            onChange={(e) => set('includeEventSlide', e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-line text-primary focus:ring-primary"
          />
          <span>
            <span className="font-medium text-ink">Append upcoming event as final slide</span>
            <span className="block text-xs text-ink-muted">When enabled, the next upcoming event is automatically added after your slides. Turn off for full manual control.</span>
          </span>
        </label>
      </section>

      {/* ── Purpose ── */}
      <section className="rounded-card border border-line bg-white p-6 space-y-5">
        <div>
          <h2 className="text-base font-semibold text-ink">Purpose section</h2>
          <p className="mt-0.5 text-xs text-ink-muted">Intro block below the hero (“Our purpose”).</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Kicker" required>
            <Input value={form.purposeKicker} onChange={(e) => set('purposeKicker', e.target.value)} />
          </FormField>
          <FormField label="Link label" required hint="Links to /about">
            <Input value={form.purposeCtaLabel} onChange={(e) => set('purposeCtaLabel', e.target.value)} />
          </FormField>
        </div>
        <FormField label="Quote" required>
          <Textarea rows={2} value={form.purposeQuote} onChange={(e) => set('purposeQuote', e.target.value)} />
        </FormField>
        <FormField label="Heading" required>
          <Input value={form.purposeHeading} onChange={(e) => set('purposeHeading', e.target.value)} />
        </FormField>
        <FormField label="Mission Text">
          <Textarea rows={4} value={form.missionText} onChange={(e) => set('missionText', e.target.value)} />
        </FormField>
      </section>

      {/* ── What we do ── */}
      <section className="rounded-card border border-line bg-white p-6 space-y-5">
        <div>
          <h2 className="text-base font-semibold text-ink">What we do section</h2>
          <p className="mt-0.5 text-xs text-ink-muted">Dark band with discipline cards.</p>
        </div>
        <FormField label="Kicker" required>
          <Input value={form.whatWeDoKicker} onChange={(e) => set('whatWeDoKicker', e.target.value)} />
        </FormField>
        <FormField label="Heading" required>
          <Input value={form.whatWeDoHeading} onChange={(e) => set('whatWeDoHeading', e.target.value)} />
        </FormField>
        <FormField label="Intro">
          <Textarea rows={2} value={form.whatWeDoIntro} onChange={(e) => set('whatWeDoIntro', e.target.value)} />
        </FormField>
        <WhatWeDoEditor items={form.whatWeDoItems} onChange={(items) => set('whatWeDoItems', items)} />
      </section>

      {/* ── Featured / Now at RML ── */}
      <section className="rounded-card border border-line bg-white p-6 space-y-5">
        <div>
          <h2 className="text-base font-semibold text-ink">Featured section (“Now at RML”)</h2>
          <p className="mt-0.5 text-xs text-ink-muted">Event and join cards pull the next upcoming event and the featured job automatically; the fields below control headings and fallbacks shown when none exist.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Kicker" required>
            <Input value={form.eventsKicker} onChange={(e) => set('eventsKicker', e.target.value)} />
          </FormField>
          <FormField label="“View all” link label" required>
            <Input value={form.eventsLinkLabel} onChange={(e) => set('eventsLinkLabel', e.target.value)} />
          </FormField>
        </div>
        <FormField label="Heading" required>
          <Input value={form.eventsHeading} onChange={(e) => set('eventsHeading', e.target.value)} />
        </FormField>
        <FormField label="Event card CTA label" required>
          <Input value={form.featuredCardCtaLabel} onChange={(e) => set('featuredCardCtaLabel', e.target.value)} />
        </FormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Join fallback badge" required hint="Shown when no featured job exists">
            <Input value={form.joinFallbackBadge} onChange={(e) => set('joinFallbackBadge', e.target.value)} />
          </FormField>
          <FormField label="Join card CTA label" required>
            <Input value={form.joinCtaLabel} onChange={(e) => set('joinCtaLabel', e.target.value)} />
          </FormField>
        </div>
        <FormField label="Join fallback title" required>
          <Input value={form.joinFallbackTitle} onChange={(e) => set('joinFallbackTitle', e.target.value)} />
        </FormField>
        <FormField label="Join fallback text">
          <Textarea rows={2} value={form.joinFallbackText} onChange={(e) => set('joinFallbackText', e.target.value)} />
        </FormField>
      </section>

      {/* ── Stay connected ── */}
      <section className="rounded-card border border-line bg-white p-6 space-y-5">
        <div>
          <h2 className="text-base font-semibold text-ink">Stay connected section</h2>
          <p className="mt-0.5 text-xs text-ink-muted">Social buttons are managed under Site Settings; only the headings live here.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="Kicker" required>
            <Input value={form.connectKicker} onChange={(e) => set('connectKicker', e.target.value)} />
          </FormField>
          <FormField label="Heading" required>
            <Input value={form.connectHeading} onChange={(e) => set('connectHeading', e.target.value)} />
          </FormField>
        </div>
      </section>

      {/* ── SEO ── */}
      <section className="rounded-card border border-line bg-white p-6 space-y-5">
        <h2 className="text-base font-semibold text-ink">SEO</h2>
        <FormField label="SEO Title">
          <Input value={form.seoTitle ?? ''} onChange={(e) => set('seoTitle', e.target.value)} placeholder="Defaults to site title" />
        </FormField>
        <FormField label="SEO Description">
          <Textarea rows={2} value={form.seoDescription ?? ''} onChange={(e) => set('seoDescription', e.target.value)} placeholder="Meta description" />
        </FormField>
        <div className="flex gap-3 pt-2">
          <Button onClick={handleSave} disabled={updateContent.isLoading}>{updateContent.isLoading ? 'Saving...' : 'Save'}</Button>
          <Button variant="ghost" onClick={() => navigate('/admin/pages')}>Cancel</Button>
        </div>
      </section>
    </div>
  );
}

// ─── About ───────────────────────────────────────────────────────────────────

function AboutEditor() {
  const navigate = useNavigate();
  const { data, isLoading } = useAboutContent();
  const updateContent = useUpdatePageContent();
  const [form, setForm] = useState<AboutContent | null>(null);
  const [heroFile, setHeroFile] = useState<File | null>(null);

  useEffect(() => { if (data) setForm(data); }, [data]);

  const set = <K extends keyof AboutContent>(key: K, val: AboutContent[K]) => setForm((f) => f ? { ...f, [key]: val } : f);

  const handleSave = async () => {
    if (!form) return;
    try {
      let heroImageUrl = form.heroImageUrl;
      if (heroFile) {
        heroImageUrl = (await uploadMediaFile(heroFile, heroFile.name, 'pages')).url;
      }
      await updateContent.mutateAsync({ key: 'about', data: { ...form, heroImageUrl } });
      showToast('success', 'About content saved');
      navigate('/admin/pages');
    } catch { showToast('error', 'Something went wrong'); }
  };

  if (isLoading || !form) return <div className="h-64 animate-pulse rounded-card bg-line/40" />;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <BackButton to="/admin/pages" label="Back to pages" />
      <h1 className="text-2xl font-semibold text-ink">Edit: About</h1>
      <div className="rounded-card border border-line bg-white p-6 space-y-5">
        <FormField label="Hero Image">
          <ImageUpload value={form.heroImageUrl} onChange={(url) => set('heroImageUrl', url)} onFile={setHeroFile} />
        </FormField>
        <FormField label="Intro Text">
          <Textarea rows={3} value={form.introText} onChange={(e) => set('introText', e.target.value)} />
        </FormField>
        <FormField label="Mission Text">
          <Textarea rows={4} value={form.missionText} onChange={(e) => set('missionText', e.target.value)} />
        </FormField>
        <WhatWeDoEditor items={form.whatWeDoItems} onChange={(items) => set('whatWeDoItems', items)} />
        <div className="rounded-md border border-line p-4 space-y-3">
          <span className="text-sm font-medium text-ink">SEO</span>
          <FormField label="SEO Title">
            <Input value={form.seoTitle ?? ''} onChange={(e) => set('seoTitle', e.target.value)} placeholder="Defaults to site title" />
          </FormField>
          <FormField label="SEO Description">
            <Textarea rows={2} value={form.seoDescription ?? ''} onChange={(e) => set('seoDescription', e.target.value)} placeholder="Meta description" />
          </FormField>
        </div>
        <div className="flex gap-3 pt-2">
          <Button onClick={handleSave} disabled={updateContent.isLoading}>{updateContent.isLoading ? 'Saving...' : 'Save'}</Button>
          <Button variant="ghost" onClick={() => navigate('/admin/pages')}>Cancel</Button>
        </div>
      </div>
    </div>
  );
}

// ─── Programme (Internship / Visiting Fellowship) ────────────────────────────

function ProgrammeEditor({ pageKey }: { pageKey: 'internship' | 'visiting-fellowship' }) {
  const navigate = useNavigate();
  const hook = pageKey === 'internship' ? useInternshipContent : useVisitingContent;
  const { data, isLoading } = hook();
  const updateContent = useUpdatePageContent();
  const [form, setForm] = useState<ProgrammePageContent | null>(null);
  const [heroFile, setHeroFile] = useState<File | null>(null);

  useEffect(() => { if (data) setForm(data); }, [data]);

  const set = <K extends keyof ProgrammePageContent>(key: K, val: ProgrammePageContent[K]) => setForm((f) => f ? { ...f, [key]: val } : f);

  const handleSave = async () => {
    if (!form) return;
    try {
      let heroImageUrl = form.heroImageUrl;
      if (heroFile) {
        heroImageUrl = (await uploadMediaFile(heroFile, heroFile.name, 'pages')).url;
      }
      await updateContent.mutateAsync({ key: pageKey, data: { ...form, heroImageUrl } });
      showToast('success', `${PAGE_LABELS[pageKey]} content saved`);
      navigate('/admin/pages');
    } catch { showToast('error', 'Something went wrong'); }
  };

  if (isLoading || !form) return <div className="h-64 animate-pulse rounded-card bg-line/40" />;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <BackButton to="/admin/pages" label="Back to pages" />
      <h1 className="text-2xl font-semibold text-ink">Edit: {PAGE_LABELS[pageKey]}</h1>
      <div className="rounded-card border border-line bg-white p-6 space-y-5">
        <FormField label="Hero Image">
          <ImageUpload value={form.heroImageUrl} onChange={(url) => set('heroImageUrl', url)} onFile={setHeroFile} />
        </FormField>
        <FormField label="Overview Text">
          <Textarea rows={4} value={form.overviewText} onChange={(e) => set('overviewText', e.target.value)} />
        </FormField>
        <RepeatableList
          items={form.eligibilityItems}
          onChange={(items) => set('eligibilityItems', items)}
          label="Eligibility Items"
          placeholder="e.g. PhD students, NGO workers..."
        />
        <RepeatableList
          items={form.howToApplySteps}
          onChange={(items) => set('howToApplySteps', items)}
          label="How to Apply Steps"
          placeholder="e.g. A formal application with SOP..."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="CTA Label">
            <Input value={form.ctaLabel} onChange={(e) => set('ctaLabel', e.target.value)} />
          </FormField>
          <FormField label="CTA URL">
            <Input value={form.ctaUrl} onChange={(e) => set('ctaUrl', e.target.value)} />
          </FormField>
        </div>
        <div className="rounded-md border border-line p-4 space-y-3">
          <span className="text-sm font-medium text-ink">SEO</span>
          <FormField label="SEO Title">
            <Input value={form.seoTitle ?? ''} onChange={(e) => set('seoTitle', e.target.value)} placeholder="Defaults to site title" />
          </FormField>
          <FormField label="SEO Description">
            <Textarea rows={2} value={form.seoDescription ?? ''} onChange={(e) => set('seoDescription', e.target.value)} placeholder="Meta description" />
          </FormField>
        </div>
        <div className="flex gap-3 pt-2">
          <Button onClick={handleSave} disabled={updateContent.isLoading}>{updateContent.isLoading ? 'Saving...' : 'Save'}</Button>
          <Button variant="ghost" onClick={() => navigate('/admin/pages')}>Cancel</Button>
        </div>
      </div>
    </div>
  );
}

// ─── Contact ─────────────────────────────────────────────────────────────────

function ContactEditor() {
  const navigate = useNavigate();
  const { data, isLoading } = useContactContent();
  const updateContent = useUpdatePageContent();
  const [form, setForm] = useState<ContactContent | null>(null);

  useEffect(() => { if (data) setForm(data); }, [data]);

  const set = <K extends keyof ContactContent>(key: K, val: ContactContent[K]) => setForm((f) => f ? { ...f, [key]: val } : f);

  const handleSave = async () => {
    if (!form) return;
    try {
      await updateContent.mutateAsync({ key: 'contact', data: form });
      showToast('success', 'Contact content saved');
      navigate('/admin/pages');
    } catch { showToast('error', 'Something went wrong'); }
  };

  if (isLoading || !form) return <div className="h-64 animate-pulse rounded-card bg-line/40" />;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <BackButton to="/admin/pages" label="Back to pages" />
      <h1 className="text-2xl font-semibold text-ink">Edit: Contact</h1>
      <div className="rounded-card border border-line bg-white p-6 space-y-5">
        <FormField label="Contact Email" required>
          <Input type="email" value={form.contactEmail} onChange={(e) => set('contactEmail', e.target.value)} />
        </FormField>
        <FormField label="Institutional Line">
          <Input value={form.institutionalLine} onChange={(e) => set('institutionalLine', e.target.value)} />
        </FormField>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.formEnabled}
            onChange={(e) => set('formEnabled', e.target.checked)}
            className="h-4 w-4 rounded border-line text-primary focus:ring-primary"
          />
          Enable contact form
        </label>
        <div className="flex gap-3 pt-2">
          <Button onClick={handleSave} disabled={updateContent.isLoading}>{updateContent.isLoading ? 'Saving...' : 'Save'}</Button>
          <Button variant="ghost" onClick={() => navigate('/admin/pages')}>Cancel</Button>
        </div>
      </div>
    </div>
  );
}
