import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { useDocumentMeta } from '@/lib/seo';
import { AuthProvider } from '@/lib/auth';
import { PublicLayout } from '@/app/PublicLayout';
import RequireAuth from '@/app/RequireAuth';
import RequireRole from '@/app/RequireRole';
import AdminLayout from '@/app/AdminLayout';
import { Toaster } from '@/components/admin/Toast';
import HomePage from '@/pages/public/HomePage';
import AboutPage from '@/pages/public/AboutPage';
import { TeamListPage, PersonDetailPage } from '@/pages/public/TeamPages';
import { ResearchPage, ResearchDetailPage } from '@/pages/public/ResearchPages';
import { PublicationsPage, PublicationDetailPage } from '@/pages/public/PublicationPages';
import { EventsPage, EventDetailPage } from '@/pages/public/EventPages';
import { ProgrammePage } from '@/pages/public/ProgrammePage';
import JoinPage from '@/pages/public/JoinPage';
import ContactPage from '@/pages/public/ContactPage';
import LoginPage from '@/pages/admin/LoginPage';
import DashboardPage from '@/pages/admin/DashboardPage';
import PeopleListPage from '@/pages/admin/PeopleListPage';
import PersonFormPage from '@/pages/admin/PersonFormPage';
import PublicationsListPage from '@/pages/admin/PublicationsListPage';
import PublicationFormPage from '@/pages/admin/PublicationFormPage';
import EventsListPage from '@/pages/admin/EventsListPage';
import EventFormPage from '@/pages/admin/EventFormPage';
import ResearchListPage from '@/pages/admin/ResearchListPage';
import ResearchFormPage from '@/pages/admin/ResearchFormPage';
import JobsListPage from '@/pages/admin/JobsListPage';
import JobFormPage from '@/pages/admin/JobFormPage';
import PagesListPage from '@/pages/admin/PagesListPage';
import PageContentFormPage from '@/pages/admin/PageContentFormPage';
import SettingsPage from '@/pages/admin/SettingsPage';
import MediaPage from '@/pages/admin/MediaPage';
import AdministratorsListPage from '@/pages/admin/AdministratorsListPage';
import AdministratorFormPage from '@/pages/admin/AdministratorFormPage';
import AdministratorPasswordPage from '@/pages/admin/AdministratorPasswordPage';
import { ThemeProvider } from '@/lib/theme';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const NotFound = () => {
  // Soft-404 mitigation: the SPA fallback returns HTTP 200 for unknown paths,
  // so the not-found page tells crawlers not to index it.
  useDocumentMeta({
    title: 'Page not found',
    description: 'The page you are looking for does not exist.',
    robots: 'noindex, follow',
  });

  return (
    <div className='container-content py-32 text-center'>
      <h1 className='text-3xl'>Page not found</h1>
      <p className='mt-3 text-ink-muted'>The page you are looking for does not exist.</p>
      <a href='/' className='mt-6 inline-block text-accent underline'>
        Back to home
      </a>
    </div>
  );
};

const router = createBrowserRouter([
  {
    element: <PublicLayout />,
    children: [
      { path: '/', element: <HomePage /> },
      { path: '/about', element: <AboutPage /> },
      { path: '/team', element: <TeamListPage /> },
      { path: '/team/research-assistants', element: <TeamListPage /> },
      { path: '/team/non-resident-fellows', element: <TeamListPage /> },
      { path: '/team/affiliates', element: <TeamListPage /> },
      { path: '/team/:slug', element: <PersonDetailPage /> },
      { path: '/research', element: <ResearchPage /> },
      { path: '/research/:slug', element: <ResearchDetailPage /> },
      { path: '/publications', element: <PublicationsPage /> },
      { path: '/publications/:slug', element: <PublicationDetailPage /> },
      { path: '/events', element: <EventsPage /> },
      { path: '/events/:slug', element: <EventDetailPage /> },
      { path: '/programmes/internship', element: <ProgrammePage pageKey="internship" /> },
      { path: '/programmes/visiting-fellowship', element: <ProgrammePage pageKey="visiting-fellowship" /> },
      { path: '/join', element: <JoinPage /> },
      { path: '/contact', element: <ContactPage /> },
      { path: '*', element: <NotFound /> },
    ],
  },
  {
    path: '/admin/login',
    element: <LoginPage />,
  },
  {
    path: '/admin',
    element: <RequireAuth />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { index: true, element: <DashboardPage /> },
          { path: 'people', element: <PeopleListPage /> },
          { path: 'people/:id', element: <PersonFormPage /> },
          { path: 'publications', element: <PublicationsListPage /> },
          { path: 'publications/:id', element: <PublicationFormPage /> },
          { path: 'events', element: <EventsListPage /> },
          { path: 'events/:id', element: <EventFormPage /> },
          { path: 'research', element: <ResearchListPage /> },
          { path: 'research/:id', element: <ResearchFormPage /> },
          { path: 'jobs', element: <JobsListPage /> },
          { path: 'jobs/:id', element: <JobFormPage /> },
          { path: 'pages', element: <PagesListPage /> },
          { path: 'pages/:pageKey', element: <PageContentFormPage /> },
          { path: 'settings', element: <SettingsPage /> },
          { path: 'media', element: <MediaPage /> },
          {
            element: <RequireRole roles={['admin']} />,
            children: [
              { path: 'administrators', element: <AdministratorsListPage /> },
              { path: 'administrators/:id', element: <AdministratorFormPage /> },
              { path: 'administrators/:id/password', element: <AdministratorPasswordPage /> },
            ],
          },
          { path: '*', element: <NotFound /> },
        ],
      },
    ],
  },
]);

export default function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RouterProvider router={router} />
          <Toaster />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
