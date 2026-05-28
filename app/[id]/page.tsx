"use client";
import React from 'react';
import { useParams, useRouter, redirect } from 'next/navigation';
import { useAppContext } from '@/src/context/AppContext';
import ToolsViews from '@/src/components/ToolsViews';
import { PageId } from '@/src/types';

export default function ToolPage() {
  const { id } = useParams();
  const router = useRouter();
  const { products, preselectedProduct, addXP, saveGeneratedContent, addCalendarEvents } = useAppContext();
  
  if (!id || typeof id !== 'string') return null;

  // Re-map URL parameter (e.g., 'caption-tool') back to internal ID ('caption_tool')
  const toolId = id.replace('-', '_') as PageId;

  const validTools = ['caption_tool', 'description_tool', 'content_plan_tool', 'chat_reply_tool', 'competitor_tool'];
  if (!validTools.includes(toolId)) {
    redirect('/dashboard');
  }

  return (
    <ToolsViews
      toolId={toolId}
      products={products}
      preselectedProduct={preselectedProduct}
      onAddXP={addXP}
      onSaveContent={saveGeneratedContent}
      onAddCalendarEvents={addCalendarEvents}
      onNavigate={(p) => router.push(`/${p.replace('_', '-')}`)}
    />
  );
}
