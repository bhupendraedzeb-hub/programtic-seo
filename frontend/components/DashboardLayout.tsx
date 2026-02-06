'use client';

import { ReactNode, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signOutUser } from '@/lib/supabase';
import { useAuth } from './AuthProvider';
import toast from 'react-hot-toast';

export function DashboardLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    const { error } = await signOutUser();
    if (error) {
      toast.error(error.message || 'Failed to log out');
      return;
    }
    toast.success('Logged out successfully');
    router.push('/');
  };

  const menuItems = [
    {
      label: 'Overview',
      href: '/dashboard',
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <path d="M4 20V10m6 10V4m6 16v-6m4 6V8" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      label: 'Templates',
      href: '/dashboard/templates',
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <path d="M6 4h9l3 3v13H6z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinejoin="round" />
          <path d="M15 4v4h4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      label: 'Results',
      href: '/dashboard/pages',
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <path d="M6 4h12v16H6z" stroke="currentColor" strokeWidth="2" fill="none" />
          <path d="M9 8h6M9 12h6M9 16h4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      label: 'Generate Page',
      href: '/dashboard/generate',
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <path d="M12 3v6m0 6v6M3 12h6m6 0h6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
      ),
    },
    {
      label: 'Bulk Generator',
      href: '/dashboard/generate/bulk',
      icon: (
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
      ),
    },
  ];

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem('dashboard_collapsed') : null;
    if (stored === 'true') {
      setCollapsed(true);
      setSidebarOpen(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('dashboard_collapsed', String(collapsed));
  }, [collapsed]);

  return (
    <div className="flex h-screen bg-[var(--bg)] text-[var(--ink)]">
      {/* Sidebar */}
      <aside
        className={`${
          collapsed ? 'w-20' : 'w-72'
        } border-r border-[var(--line)] bg-[var(--panel)] transition-all duration-300 overflow-hidden relative`}
      >
        <div className={`p-6 flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {!collapsed && (
            <div className="flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--brand)] text-white font-bold">
                PS
              </span>
              <div>
                <h1 className="font-display text-lg font-semibold">Programmatic SEO</h1>
                <p className="text-xs text-[var(--muted)]">Workspace</p>
              </div>
            </div>
          )}
          <button
            onClick={() => {
              const next = !collapsed;
              setCollapsed(next);
              setSidebarOpen(!next);
            }}
            className="p-2 rounded-full border border-[var(--line)] text-[var(--muted)] hover:text-[var(--ink)] hover:bg-[var(--soft)]"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                <path d="M8 6l6 6-6 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                <path d="M16 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        </div>

        <nav className="mt-6 space-y-1 px-4">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center gap-3 rounded-2xl px-4 py-3 text-sm text-[var(--ink)] transition hover:bg-[var(--soft)]"
            >
              <span className="text-[var(--brand)]">{item.icon}</span>
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-6 left-0 right-0 px-6">
          <button
            onClick={handleLogout}
            className="w-full py-2.5 px-4 rounded-full border border-[var(--line)] text-sm font-medium text-[var(--accent)] hover:bg-[var(--soft)]"
          >
            <span className="inline-flex items-center justify-center gap-2">
              <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden="true">
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="none" />
                <path d="M11 8l4 4-4 4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M15 12H7" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {!collapsed && <span>Logout</span>}
            </span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="bg-[var(--panel)] border-b border-[var(--line)]">
          <div className="px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="font-display text-lg font-semibold">Dashboard</h2>
              <p className="text-xs text-[var(--muted)]">Monitor generation, results, and templates</p>
            </div>
            <div className="flex items-center gap-4">
              {user && (
                <div className="text-sm text-right">
                  <p className="font-medium">{user.email}</p>
                  <p className="text-[var(--muted)]">Account</p>
                </div>
              )}
              <div className="w-10 h-10 bg-[var(--brand)] rounded-full flex items-center justify-center text-white font-bold">
                {user?.email?.[0].toUpperCase()}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
