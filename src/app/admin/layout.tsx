import { AdminSidebar } from '@/components/admin/AdminSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-muted flex">
      <AdminSidebar />
      
      {/* Main content area - adjusted for fixed sidebar */}
      <div className="flex-1 lg:ml-64 min-h-screen">
        <main className="p-4 lg:p-8 pt-20 lg:pt-8">
          <div className="max-w-7xl mx-auto relative z-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}