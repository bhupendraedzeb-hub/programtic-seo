'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getSession, signOutUser } from '@/lib/supabase';
import { DashboardLayout } from '@/components/DashboardLayout';

export default function Layout({ children }: { children: ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const session = await getSession();
    if (!session) {
      router.push('/auth/login');
    }
  };

  return <DashboardLayout>{children}</DashboardLayout>;
}
