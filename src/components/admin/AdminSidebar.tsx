'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  FileText, 
  Plus, 
  BookOpen, 
  Image, 
  Users, 
  Settings, 
  LogOut,
  Menu,
  X,
  Shield,
  FileEdit,
  Camera
} from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { useState } from 'react';
import { siteConfig } from '@/config/site';

interface SidebarItem {
  href: string;
  label: string;
  icon: React.ElementType;
  adminOnly?: boolean;
}

const sidebarItems: SidebarItem[] = [
  {
    href: '/admin',
    label: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    href: '/admin/posts',
    label: 'Posts',
    icon: FileText,
    adminOnly: true,
  },
  {
    href: '/admin/posts/new',
    label: 'New Post',
    icon: Plus,
    adminOnly: true,
  },
  {
    href: '/admin/journal',
    label: 'Journal',
    icon: BookOpen,
    adminOnly: true,
  },
  {
    href: '/admin/media',
    label: 'Media',
    icon: Image,
    adminOnly: true,
  },
  {
    href: '/admin/photos',
    label: 'Photography',
    icon: Camera,
    adminOnly: true,
  },
  {
    href: '/admin/subscribers',
    label: 'Subscribers',
    icon: Users,
    adminOnly: true,
  },
  {
    href: '/admin/users',
    label: 'User Management',
    icon: Shield,
    adminOnly: true,
  },
  {
    href: '/admin/pages',
    label: 'Pages',
    icon: FileEdit,
    adminOnly: true,
  },
  {
    href: '/admin/settings',
    label: 'Settings',
    icon: Settings,
  },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Filter sidebar items based on user role
  const filteredSidebarItems = sidebarItems.filter(item => {
    // If item is admin-only and user is not admin, hide it
    if (item.adminOnly && session?.user?.role !== 'ADMIN') {
      return false;
    }
    return true;
  });

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-secondary text-white">
      {/* Header */}
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-xl font-bold text-primary">{siteConfig.admin.title}</h1>
        {session?.user && (
          <>
            <p className="text-sm text-gray-300 mt-1">
              Welcome, {session.user.name || session.user.email}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Role: {session.user.role || 'User'}
            </p>
          </>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {filteredSidebarItems.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/admin' && pathname.startsWith(item.href));
            
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <item.icon size={20} />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        <button
          onClick={handleSignOut}
          className="flex items-center space-x-3 px-3 py-2 w-full text-gray-300 hover:bg-gray-700 hover:text-white rounded-lg transition-colors"
        >
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="p-2 bg-secondary text-white rounded-lg shadow-lg"
        >
          {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Desktop sidebar - fixed position, full height */}
      <div className="hidden lg:flex w-64 h-screen fixed left-0 top-0 z-40">
        <SidebarContent />
      </div>

      {/* Mobile sidebar overlay */}
      {isMobileOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div 
            className="absolute inset-0 bg-black bg-opacity-50"
            onClick={() => setIsMobileOpen(false)}
          />
          <div className="absolute left-0 top-0 w-64 h-full">
            <SidebarContent />
          </div>
        </div>
      )}
    </>
  );
}