"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/src/context/AppContext';
import DashboardView from '@/src/components/DashboardView';

export default function DashboardPage() {
  const { shopInfo, products, contents, events, achievements, checkOffPost, addXP } = useAppContext();
  const router = useRouter();

  return (
    <DashboardView
      shopInfo={shopInfo}
      productsCount={products.length}
      contentsCount={contents.length}
      events={events}
      achievements={achievements}
      onNavigate={(p) => router.push(`/${p.replace('_', '-')}`)}
      onPostCheck={checkOffPost}
      onAddXP={addXP}
    />
  );
}
