"use client";
import React from 'react';
import { useRouter } from 'next/navigation';
import { useAppContext } from '@/src/context/AppContext';
import { HistoryView } from '@/src/components/SupportingViews';

export default function HistoryPage() {
  const { contents, deleteGeneratedContent } = useAppContext();
  const router = useRouter();

  return (
    <HistoryView
      contents={contents}
      onDeleteContent={deleteGeneratedContent}
      onNavigate={(p) => router.push(`/${p.replace('_', '-')}`)}
    />
  );
}
