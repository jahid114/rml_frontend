import { Link } from 'react-router-dom';
import { Users, BookOpen, CalendarDays, FlaskConical, Briefcase } from 'lucide-react';
import { usePeople, usePublications, useEvents, useResearchThemes, useJobs, useActivity } from '@/lib/hooks';

function StatCard({
  icon: Icon,
  label,
  count,
  to,
}: {
  icon: typeof Users;
  label: string;
  count: number;
  to: string;
}) {
  return (
    <Link
      to={to}
      className="flex items-center gap-4 rounded-card border border-line bg-white p-4 transition-shadow hover:shadow-md"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-semibold text-ink">{count}</p>
        <p className="text-sm text-ink-muted">{label}</p>
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const { data: people = [] } = usePeople();
  const { data: publications = [] } = usePublications();
  const { data: events = [] } = useEvents();
  const { data: research = [] } = useResearchThemes();
  const { data: jobs = [] } = useJobs();
  const { data: activity = [] } = useActivity();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-ink">Dashboard</h1>
        <p className="text-sm text-ink-muted">Overview of your content.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <StatCard icon={Users} label="People" count={people.length} to="/admin/people" />
        <StatCard icon={BookOpen} label="Publications" count={publications.length} to="/admin/publications" />
        <StatCard icon={CalendarDays} label="Events" count={events.length} to="/admin/events" />
        <StatCard icon={FlaskConical} label="Research" count={research.length} to="/admin/research" />
        <StatCard icon={Briefcase} label="Jobs" count={jobs.length} to="/admin/jobs" />
      </div>

      <div className="rounded-card border border-line bg-white">
        <h2 className="border-b border-line px-4 py-3 text-sm font-semibold text-ink">Recent Activity</h2>
        {activity.length === 0 ? (
          <p className="px-4 py-6 text-sm text-ink-muted">No recent activity.</p>
        ) : (
          <ul className="divide-y divide-line">
            {activity.map((a) => (
              <li key={a.id} className="flex items-baseline gap-3 px-4 py-3 text-sm">
                <span className="shrink-0 rounded bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
                  {a.action}
                </span>
                <span className="text-ink">{a.target}</span>
                <span className="shrink-0 text-xs text-ink-muted">by {a.user}</span>
                <span className="ml-auto shrink-0 text-xs text-ink-muted">
                  {new Date(a.timestamp).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
