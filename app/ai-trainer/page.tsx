"use client";
import React from 'react';
import { useAppContext } from '@/src/context/AppContext';
import { AITrainerView } from '@/src/components/SupportingViews';

export default function AITrainerPage() {
  const { addXP, saveGeneratedContent, shopInfo } = useAppContext();

  return (
    <AITrainerView
      onAddXP={addXP}
      onSaveContent={saveGeneratedContent}
      shopInfo={shopInfo}
    />
  );
}
