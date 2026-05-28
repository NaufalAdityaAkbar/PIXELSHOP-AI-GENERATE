"use client";
import React from 'react';
import { useAppContext } from '@/src/context/AppContext';
import { AchievementsView } from '@/src/components/SupportingViews';

export default function AchievementsPage() {
  const { achievements, shopInfo } = useAppContext();

  return (
    <AchievementsView
      achievements={achievements}
      xpTotal={shopInfo.xp}
    />
  );
}
