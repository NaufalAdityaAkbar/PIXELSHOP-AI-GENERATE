"use client";
import React from 'react';
import { useAppContext } from '@/src/context/AppContext';
import { SettingsView } from '@/src/components/SupportingViews';

export default function SettingsPage() {
  const { shopInfo, updateShopInfo, handleResetApp } = useAppContext();

  return (
    <SettingsView
      shopInfo={shopInfo}
      onUpdateShop={updateShopInfo}
      onResetApp={handleResetApp}
    />
  );
}
