/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export function getLevelName(xp: number): string {
  if (xp < 500) return 'Pedagang Pemula';
  if (xp < 1000) return 'Content Rookie';
  if (xp < 1500) return 'Caption Master';
  if (xp < 2000) return 'Konten Pro';
  return 'UMKM Legend';
}

export function getLevelRange(xp: number): { min: number; max: number; currentProgress: number; percent: number } {
  let min = 0;
  let max = 500;
  if (xp >= 500 && xp < 1000) {
    min = 500;
    max = 1000;
  } else if (xp >= 1000 && xp < 1500) {
    min = 1000;
    max = 1500;
  } else if (xp >= 1500 && xp < 2000) {
    min = 1500;
    max = 2000;
  } else if (xp >= 2000) {
    min = 2000;
    max = 5000; // soft cap
  }

  const currentProgress = xp - min;
  const range = max - min;
  const percent = Math.min(Math.round((currentProgress / range) * 100), 100);

  return { min, max, currentProgress, percent };
}

export function formatPriceIDR(price: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(price);
}
