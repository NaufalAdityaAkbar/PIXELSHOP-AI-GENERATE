/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, CalendarEvent, Achievement, AITrainerSettings, ShopInfo } from './types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1',
    name: 'Hijab Bella Square Syari Premium',
    price: 35000,
    description: 'Hijab Bella Square kualitas teratas, bahan double hycon premium. Tebal, dingin, tidak menerawang, sangat tegak di dahi dan mudah diatur.',
    category: 'Fashion Muslim'
  },
  {
    id: 'prod-2',
    name: 'Keripik Basreng Gurih Pedas Daun Jeruk',
    price: 18500,
    description: 'Bakso goreng renyah diiris tipis dengan bumbu cabai asli premium dicampur daun jeruk purut segar melimpah. Sekali gigit langsung merem-melek!',
    category: 'Kuliner & Cemilan'
  },
  {
    id: 'prod-3',
    name: 'Kopi Susu Premium Gula Aren 1L',
    price: 65000,
    description: 'Espresso blend Arabica-Robusta racikan barista dicampur susu segar New Zealand dan sirup gula aren organik asli Jawa Barat. Segar tahan 3 hari di kulkas.',
    category: 'Minuman'
  },
  {
    id: 'prod-4',
    name: 'Minyak Kemiri Bakar Penumbuh Rambut',
    price: 49000,
    description: 'Minyak kemiri asli yang diolah secara dibakar tradisional untuk menstimulasi folikel rambut rusak. Menumbuhkan, menebalkan, dan membuat berkilau alami.',
    category: 'Kecantikan'
  }
];

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach-1',
    title: '🏪 Grand Opening',
    description: 'Selesaikan setup profil toko pertama kali',
    progress: 1,
    target: 1,
    unlocked: true,
    unlockedAt: new Date().toISOString(),
    xpReward: 50,
    iconName: 'store'
  },
  {
    id: 'ach-2',
    title: '✍️ Penulis Pertama',
    description: 'Selesaikan generate caption AI pertamamu',
    progress: 0,
    target: 1,
    unlocked: false,
    xpReward: 100,
    iconName: 'pen'
  },
  {
    id: 'ach-3',
    title: '📦 Stok Lengkap',
    description: 'Tambah minimal 10 produk di katalog produkmu',
    progress: 4, // Starts with 4 default mock products
    target: 10,
    unlocked: false,
    xpReward: 150,
    iconName: 'package'
  },
  {
    id: 'ach-4',
    title: '🔥 7-Day Streak',
    description: 'Lakukan postingan berkala selama 7 hari berturut-turut',
    progress: 3,
    target: 7,
    unlocked: false,
    xpReward: 200,
    iconName: 'zap'
  },
  {
    id: 'ach-5',
    title: '🧠 Latih AI',
    description: 'Lengkapi kustomisasi brand voice di halaman AI Trainer',
    progress: 0,
    target: 1,
    unlocked: false,
    xpReward: 150,
    iconName: 'brain'
  },
  {
    id: 'ach-6',
    title: '🚀 Viral Starter',
    description: 'Berhasil membuat total 50 konten pemasaran di PixelShop',
    progress: 0,
    target: 50,
    unlocked: false,
    xpReward: 300,
    iconName: 'award'
  }
];

export const INITIAL_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: 'ev-1',
    title: 'Promo Hijab Senin Ceria',
    date: '2026-05-25',
    time: '11:00',
    platform: 'instagram',
    format: 'Instagram Reels',
    caption: 'Bestie! Udah siap tampil syari super anggun di awal minggu? Hijab Bella Square kita ini solusinya! Diskon 15% hari Senin aja. Buruan checkout!',
    status: 'done',
    xpAwarded: true
  },
  {
    id: 'ev-2',
    title: 'Unboxing Basreng Renyah Daun Jeruk',
    date: '2026-05-26',
    time: '14:00',
    platform: 'tiktok',
    format: 'TikTok Video Short',
    caption: 'SIAPA YANG TAHAN LIHAT BASRENG GURIH PEDAS SEGEGER INI? 😭 Pas banget crispy-nya, wangi daun jeruk asli. Klik keranjang kuning sekarang juga!',
    status: 'scheduled',
    xpAwarded: false
  },
  {
    id: 'ev-3',
    title: 'Rekomendasi Kopi Ngantuk Siang',
    date: '2026-05-27',
    time: '12:30',
    platform: 'whatsapp',
    format: 'WhatsApp Broadcast',
    caption: 'Stok Kopi Susu Aren 1 Liter meluncur lagi nih guys! Pas banget buat nemenin kerjaan kantor biar anti ngantuk. Pesan lewat WA ya!',
    status: 'draft',
    xpAwarded: false
  }
];

export const DEFAULT_AI_TRAINER: AITrainerSettings = {
  character: 'Sahabat Jualan',
  favoriteWords: 'Kak, Yuk belanja, Bestie, Murah meriah, Premium Bengis',
  avoidWords: 'Maaf merepotkan, Tidak bergaransi, Produk murahan',
  formalityLevel: 2,
  sampleCaptions: [
    'Halo bestie! Kenalin produk baru yang siap bikin kamu terpana. Desain elegan banget!',
    'Jangan kaget kak! Akhirnya ready stock kembali basreng legendaris kita yang renyahnya beneran juara umum.',
    'Sstt.. khusus follower setia ada rahasia diskon super hemat malam ini.'
  ],
  targetAge: 'dewasa muda',
  targetLocation: 'Jakarta & Seluruh Indonesia'
};

export const DEFAULT_SHOP: ShopInfo = {
  shopName: 'Dapur & Modis Cantik',
  category: 'Fesyen & Kuliner Lokal',
  description: 'Menyediakan fashion muslim premium bergaya kekinian dan cemilan pedas gurih buatan lokal pilihan keluarga Indonesia.',
  platforms: ['instagram', 'tiktok', 'whatsapp', 'shopee'],
  brandVoice: 'ceria',
  level: 1,
  xp: 120,
  streak: 3
};
