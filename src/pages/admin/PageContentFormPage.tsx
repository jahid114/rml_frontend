import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useHomeContent, useAboutContent, useContactContent, usePageContent, useUpdatePageContent } from '@/lib/hooks';
import { ApiError, uploadMediaFile } from '@/lib/client';
import { FormField, Input, Textarea } from '@/components/admin/FormField';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { RepeatableList } from '@/components/admin/RepeatableList';
import { WhatWeDoEditor } from '@/components/admin/WhatWeDoEditor';
import { HeroSlidesEditor } from '@/components/admin/HeroSlidesEditor';
import { Button } from '@/components/ui/primitives';
import { BackButton } from '@/components/admin/BackButton';
import { showToast } from '@/components/admin/Toast';
import { normalizeAboutContent, normalizeHomeContent, normalizeProgrammeContent } from '@/lib/utils';
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
    // A newly picked file lives only in slideFiles until upload on save —
    // treat it as satisfying the image requirement so replacing an image
    // (remove old → pick new → save) doesn't trip validation.
    const hasImage = (imageUrl: string, index: number) =>
      !!imageUrl || !!slideFiles.current[index];
    const incomplete = form.heroSlides.findIndex(
      (s, i) => !hasImage(s.imageUrl, i) || !s.eyebrow || !s.title || !s.description || !s.ctaLabel || !s.ctaUrl,
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
    } catch (e) { showToast('error', e instanceof ApiError ? `Save failed (${e.status}): ${e.message}` : 'Something went wrong'); }
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
          onSlideRemove={(i) => {
            const next: Record<number, File | null> = {};
            for (const [k, v] of Object.entries(slideFiles.current)) {
              const idx = Number(k);
              if (Number.isNaN(idx)) continue;
              if (idx < i) next[idx] = v;
              else if (idx > i) next[idx - 1] = v;
            }
            slideFiles.current = next;
          }}
          onSlideMove={(from, to) => {
            const next = { ...slideFiles.current };
            const tmp = next[from] ?? null;
            next[from] = next[to] ?? null;
            next[to] = tmp;
            slideFiles.current = next;
          }}
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
        <WhatWeDoEditor items={form.whatWeDoItems} onChange={(items) => set('whatWeDoItems', items)} max={4} variant="dark" />
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

  useEffect(() => { if (data) setForm((prev) => prev ?? normalizeAboutContent(data)); }, [data]);

  const set = <K extends keyof AboutContent>(key: K, val: AboutContent[K]) => setForm((f) => f ? { ...f, [key]: val } : f);

  const handleSave = async () => {
    if (!form) return;
    // Like the hero slides above, a newly picked file lives only in heroFile
    // until upload on save — accept it as satisfying the required image.
    if (!form.heroImageUrl.trim() && !heroFile) {
      showToast('error', 'Hero image is required');
      return;
    }
    if (!form.introText.trim() || !form.missionText.trim()) {
      showToast('error', 'Intro text and mission text are required');
      return;
    }
    if (!Array.isArray(form.whatWeDoItems) || form.whatWeDoItems.length === 0) {
      showToast('error', 'Add at least one “What RML does” card');
      return;
    }
    if (form.whatWeDoItems.length > 6) {
      showToast('error', '“What RML does” cards: maximum 6 items');
      return;
    }
    const incomplete = form.whatWeDoItems.findIndex((it) => !it.label.trim() || !it.text.trim());
    if (incomplete !== -1) {
      showToast('error', `“What RML does” card ${incomplete + 1} needs both a heading and body text`);
      return;
    }
    try {
      let heroImageUrl = form.heroImageUrl;
      if (heroFile) {
        heroImageUrl = (await uploadMediaFile(heroFile, heroFile.name, 'pages')).url;
      }
      const payload = { ...form, heroImageUrl };
      try {
        await updateContent.mutateAsync({ key: 'about', data: payload });
      } catch (e) {
        // Older backends validate About content against the previous schema
        // (no section-heading fields) and reject unknown keys with 400.
        // Retry with the legacy shape so card edits always persist — headings
        // fall back to defaults until the backend accepts the new fields.
        if (e instanceof ApiError && e.status === 400) {
          const { whatWeDoKicker: _kicker, whatWeDoHeading: _heading, whatWeDoIntro: _intro, ...legacyPayload } = payload;
          await updateContent.mutateAsync({ key: 'about', data: legacyPayload });
          showToast('success', 'Cards saved. Section headings need backend support — defaults shown for now.');
          navigate('/admin/pages');
          return;
        }
        throw e;
      }
      showToast('success', 'About content saved');
      navigate('/admin/pages');
    } catch (e) {
      showToast('error', e instanceof ApiError ? `Save failed (${e.status}): ${e.message}` : 'Something went wrong');
    }
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
        <div className="rounded-md border border-line p-4 space-y-4">
          <div>
            <span className="text-sm font-medium text-ink">What RML does section</span>
            <p className="mt-0.5 text-xs text-ink-muted">Public About page block titled “Our work in focus”. The intro line sits above the cards.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField label="Section kicker" hint="Small eyebrow above the heading">
              <Input value={form.whatWeDoKicker ?? ''} onChange={(e) => set('whatWeDoKicker', e.target.value)} placeholder="What RML does" />
            </FormField>
            <FormField label="Section heading" hint="Large title of the section">
              <Input value={form.whatWeDoHeading ?? ''} onChange={(e) => set('whatWeDoHeading', e.target.value)} placeholder="Our work in focus" />
            </FormField>
          </div>
          <FormField label="Intro line" hint="Line shown above the cards">
            <Input value={form.whatWeDoIntro ?? ''} onChange={(e) => set('whatWeDoIntro', e.target.value)} placeholder="The RML works on the following:" />
          </FormField>
          <FormField
            label="Cards"
            hint="Each card shows an icon, a heading (Label) and body text (Description). Up to 6 items."
          >
            <WhatWeDoEditor items={form.whatWeDoItems} onChange={(items) => set('whatWeDoItems', items)} max={6} />
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

// ─── Programme (Internship / Visiting Fellowship) ────────────────────────────

function ProgrammeEditor({ pageKey }: { pageKey: 'internship' | 'visiting-fellowship' }) {
  const navigate = useNavigate();
  // Single hook call (rules-of-hooks safe) — keyed by pageKey.
  const { data, isLoading } = usePageContent<ProgrammePageContent>(pageKey);
  const updateContent = useUpdatePageContent();
  const [form, setForm] = useState<ProgrammePageContent | null>(null);

  // Reset + normalize whenever the backend payload or pageKey changes.
  // Keeps unsaved edits on background refetch, but swaps content on pageKey switch.
  useEffect(() => {
    if (data) {
      setForm((prev) => {
        if (prev && prev.slug === pageKey) return prev;
        return normalizeProgrammeContent(data, pageKey);
      });
    }
  }, [data, pageKey]);

  const set = <K extends keyof ProgrammePageContent>(key: K, val: ProgrammePageContent[K]) => setForm((f) => f ? { ...f, [key]: val } : f);

  const handleSave = async () => {
    if (!form) return;
    const eligibilityItems = (form.eligibilityItems ?? []).map((s) => s.trim()).filter(Boolean);
    const howToApplySteps = (form.howToApplySteps ?? []).map((s) => s.trim()).filter(Boolean);
    if (!form.overviewText.trim()) {
      showToast('error', 'Overview text is required');
      return;
    }
    if (eligibilityItems.length === 0) {
      showToast('error', 'Add at least one eligibility item');
      return;
    }
    if (howToApplySteps.length === 0) {
      showToast('error', 'Add at least one how-to-apply step');
      return;
    }
    if (!form.ctaLabel.trim() || !form.ctaUrl.trim()) {
      showToast('error', 'CTA label and URL are required');
      return;
    }
    try {
      await updateContent.mutateAsync({
        key: pageKey,
        data: { ...form, slug: pageKey, eligibilityItems, howToApplySteps },
      });
      showToast('success', `${PAGE_LABELS[pageKey]} content saved`);
      navigate('/admin/pages');
    } catch { showToast('error', 'Something went wrong'); }
  };

  if (isLoading || !form) return <div className="h-64 animate-pulse rounded-card bg-line/40" />;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <BackButton to="/admin/pages" label="Back to pages" />
      <div>
        <h1 className="text-2xl font-semibold text-ink">Edit: {PAGE_LABELS[pageKey]}</h1>
        <p className="mt-1 text-sm text-ink-muted">
          {pageKey === 'internship'
            ? 'Public page: /programmes/internship — overview, eligibility, how-to-apply and contact CTA.'
            : 'Public page: /programmes/visiting-fellowship — overview, eligibility, how-to-apply and contact CTA.'}
        </p>
      </div>
      <div className="rounded-card border border-line bg-white p-6 space-y-5">
        <FormField label="Overview Text" required hint="Shown under the page heading. Press Enter for line breaks">
          <Textarea rows={6} value={form.overviewText} onChange={(e) => set('overviewText', e.target.value)} />
        </FormField>
        <RepeatableList
          items={form.eligibilityItems}
          onChange={(items) => set('eligibilityItems', items)}
          label="Eligibility Items"
          placeholder="e.g. PhD students, NGO workers..."
          hint="Each item shows as a bullet with a check icon on the public page"
        />
        <RepeatableList
          items={form.howToApplySteps}
          onChange={(items) => set('howToApplySteps', items)}
          label="How to Apply Steps"
          placeholder="e.g. A formal application with SOP (two pages)..."
          hint="Each step shows as a numbered item, including fee details as the last step"
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField label="CTA Label" required>
            <Input value={form.ctaLabel} onChange={(e) => set('ctaLabel', e.target.value)} placeholder="e.g. Apply by email" />
          </FormField>
          <FormField label="CTA URL" required hint="mailto:info.rml.org@gmail.com or https://...">
            <Input value={form.ctaUrl} onChange={(e) => set('ctaUrl', e.target.value)} placeholder="mailto:info.rml.org@gmail.com" />
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
