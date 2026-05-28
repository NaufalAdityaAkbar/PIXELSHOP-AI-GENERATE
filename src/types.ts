/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  category: string;
  imageUrl?: string;
}

export interface GeneratedContent {
  id: string;
  type: 'caption' | 'description' | 'content-plan' | 'chat-reply' | 'competitor';
  title: string;
  content: string; // Dynamic JSON string or clean formatted text
  timestamp: string;
  productId?: string;
  platform?: string;
  extraInfo?: string;
}

export interface CalendarEvent {
  id: string;
  title: string; // e.g., "Promo Hijab Cantik"
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  platform: 'instagram' | 'tiktok' | 'whatsapp' | 'shopee' | 'tokopedia' | 'other';
  format: string; // e.g., "Reels", "Story", "Feeds", "Chat Broadcast"
  caption: string;
  status: 'draft' | 'scheduled' | 'done';
  contentId?: string; // Links back to history
  xpAwarded?: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  unlocked: boolean;
  unlockedAt?: string;
  xpReward: number;
  iconName: string; // e.g., 'store', 'pen', 'package', 'zap', 'brain', 'award'
}

export interface AITrainerSettings {
  character: 'Sahabat Jualan' | 'Expert Advisor' | 'Hype Master';
  favoriteWords: string;
  avoidWords: string;
  formalityLevel: number; // 1-5
  sampleCaptions: string[]; // up to 3 captions
  targetAge: 'remaja' | 'dewasa muda' | 'ibu rumah tangga' | 'semua';
  targetLocation: string;
  toneWarna?: 'emosional-hangat' | 'rasional-informatif' | 'hype-energetik';
}

export interface ShopInfo {
  shopName: string;
  category: string;
  description: string;
  platforms: string[]; // ['instagram', 'shopee', etc.]
  brandVoice: 'santai' | 'formal' | 'ceria' | 'elegan';
  level: number;
  xp: number;
  streak: number;
  lastActiveDate?: string;
}

export interface UserSession {
  email: string;
  shopInfo?: ShopInfo;
  isLoggedIn: boolean;
}

export type PageId =
  | 'landing'
  | 'auth'
  | 'onboarding'
  | 'dashboard'
  | 'products'
  | 'caption_tool'
  | 'description_tool'
  | 'content_plan_tool'
  | 'chat_reply_tool'
  | 'competitor_tool'
  | 'calendar'
  | 'history'
  | 'achievements'
  | 'ai_trainer'
  | 'settings';

export interface ConfirmDialogOptions {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'danger';
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}
