import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';

const PAGES = [
  { key: 'home', label: 'Home', description: 'Hero slider, purpose, what-we-do, featured, and stay-connected sections' },
  { key: 'about', label: 'About', description: 'Intro text, mission, and what-we-do items' },
  { key: 'internship', label: 'Internship Programme', description: 'Overview, eligibility, and how-to-apply steps' },
  { key: 'visiting-fellowship', label: 'Visiting Fellowship', description: 'Overview, eligibility, and how-to-apply steps' },
  { key: 'contact', label: 'Contact', description: 'Contact email and institutional information' },
];

export default function PagesListPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-ink">Pages</h1>
      <p className="text-sm text-ink-muted">Edit the content of static pages across the public site.</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PAGES.map((p) => (
          <Link
            key={p.key}
            to={`/admin/pages/${p.key}`}
            className="flex items-start gap-4 rounded-card border border-line bg-white p-4 transition-shadow hover:shadow-md"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-medium text-ink">{p.label}</h2>
              <p className="mt-1 text-sm text-ink-muted">{p.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
