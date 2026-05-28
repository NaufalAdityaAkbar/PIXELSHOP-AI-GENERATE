"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/src/context/AppContext';

export default function Page() {
  const router = useRouter();
  const { session } = useAppContext();

  useEffect(() => {
    if (session.isLoggedIn) {
      router.push('/dashboard');
    }
  }, [session.isLoggedIn, router]);

  // ClientLayout will automatically handle the Login/Landing view if not logged in
  return null;
}
