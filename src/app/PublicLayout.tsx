import { Outlet, ScrollRestoration } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { useApplyBrandColors, useApplyFavicon } from '@/lib/hooks';

export function PublicLayout() {
  useApplyBrandColors();
  useApplyFavicon();
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="site-content flex-1">
        <Outlet />
      </main>
      <Footer />
      <ScrollRestoration />
    </div>
  );
}
