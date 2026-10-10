import { useState } from 'react';
import { Mail, MapPin, Send } from 'lucide-react';
import { Hero } from '@/components/Hero';
import { SectionHeading, Skeleton, Button } from '@/components/ui/primitives';
import { useContactContent, useSiteSettings } from '@/lib/hooks';
import { ApiError, sendContactNote } from '@/lib/client';

const HERO_IMAGE =
  '/images/site/hero-humanitarian-aid.jpg';

export default function ContactPage() {
  const { data: contact, isLoading } = useContactContent();
  const { data: settings } = useSiteSettings();
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  if (isLoading || !contact) {
    return (
      <div className="container-content py-20">
        <Skeleton className="h-96 w-full rounded-card" />
      </div>
    );
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSending(true);
    try {
      await sendContactNote({
        name: form.name.trim(),
        email: form.email.trim(),
        message: form.message.trim(),
      });
      setSubmitted(true);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Could not send your message — please try again later.'
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Hero
        image={HERO_IMAGE}
        eyebrow="Contact"
        heading="Contact"
        subhead="Get in touch with the Refugee and Migration Lab."
      />

      <div className="container-content py-12 lg:py-16">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
          {/* Details */}
          <section>
            <SectionHeading eyebrow="Reach us" title="Contact details" />
            <div className="mt-6 space-y-4">
              <a
                href={`mailto:${contact.contactEmail}`}
                className="flex items-start gap-3 rounded-card border border-line bg-white p-5 shadow-card hover:shadow-cardhover"
              >
                <Mail className="mt-0.5 h-5 w-5 flex-none text-accent" />
                <div>
                  <p className="font-medium text-ink">Email</p>
                  <p className="text-sm text-ink-muted">{contact.contactEmail}</p>
                </div>
              </a>
              <div className="flex items-start gap-3 rounded-card border border-line bg-white p-5 shadow-card">
                <MapPin className="mt-0.5 h-5 w-5 flex-none text-accent" />
                <div>
                  <p className="font-medium text-ink">Affiliation</p>
                  <p className="text-sm text-ink-muted">{contact.institutionalLine}</p>
                </div>
              </div>
            </div>

            {settings?.socialLinks && settings.socialLinks.length > 0 && (
              <div className="mt-8">
                <p className="text-sm font-semibold uppercase tracking-wider text-ink-muted">
                  Follow
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {settings.socialLinks.map((s) => (
                    <a
                      key={s.platform + s.url}
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full border border-line px-3 py-1 text-xs text-ink hover:border-accent hover:text-accent"
                    >
                      {s.platform}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Form */}
          {contact.formEnabled ? (
            <section>
              <SectionHeading eyebrow="Message" title="Send us a note" />
              {submitted ? (
                <div className="mt-6 rounded-card border border-line bg-white p-6 shadow-card">
                  <p className="font-medium text-ink">Thank you for your message.</p>
                  <p className="mt-1 text-sm text-ink-soft">
                    Your note has been sent to the RML team — we aim to respond within a week.
                  </p>
                </div>
              ) : (
                <form onSubmit={onSubmit} className="mt-6 space-y-4">
                  <div>
                    <label htmlFor="name" className="mb-1 block text-sm font-medium text-ink">
                      Name
                    </label>
                    <input
                      id="name"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full rounded-md border border-line bg-white px-3 py-2.5 text-sm focus:border-accent focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="mb-1 block text-sm font-medium text-ink">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full rounded-md border border-line bg-white px-3 py-2.5 text-sm focus:border-accent focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="mb-1 block text-sm font-medium text-ink">
                      Message
                    </label>
                    <textarea
                      id="message"
                      required
                      rows={5}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full rounded-md border border-line bg-white px-3 py-2.5 text-sm focus:border-accent focus:outline-none"
                    />
                  </div>
                  <Button type="submit" variant="accent" disabled={sending}>
                    <Send className="h-4 w-4" /> {sending ? 'Sending…' : 'Send message'}
                  </Button>
                  {error && <p className="text-sm text-red-600">{error}</p>}
                </form>
              )}
            </section>
          ) : (
            <section>
              <SectionHeading eyebrow="Message" title="Email is the best way to reach us" />
              <p className="mt-4 text-ink-soft">
                We aim to respond within a week. For press inquiries, please use the subject line
                &ldquo;Press.&rdquo;
              </p>
            </section>
          )}
        </div>
      </div>
    </>
  );
}
