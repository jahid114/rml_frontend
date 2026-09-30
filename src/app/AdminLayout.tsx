import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminTopbar } from '@/components/admin/AdminTopbar';
import { useApplyBrandColors } from '@/lib/hooks';

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  useApplyBrandColors();

  return (
    <div className="min-h-screen bg-canvas">
      <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <div className={`transition-[margin-left] duration-200 ${collapsed ? 'ml-16' : 'ml-60'}`}>
        <AdminTopbar />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
