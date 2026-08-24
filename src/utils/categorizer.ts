import type { Category } from '../types';
import { CATEGORY_MAP } from '../data/categoryMap';

/**
 * Categorizes an item name by checking tokens against the category map.
 * Falls back to 'other' if no match found.
 */
export function categorizeItem(itemName: string): Category {
  const lower = itemName.toLowerCase().trim();

  // 1. Exact match first
  if (CATEGORY_MAP[lower]) return CATEGORY_MAP[lower];

  // 2. Check multi-word phrases (up to 3 words)
  const words = lower.split(/\s+/);
  for (let len = Math.min(words.length, 3); len >= 2; len--) {
    for (let start = 0; start <= words.length - len; start++) {
      const phrase = words.slice(start, start + len).join(' ');
      if (CATEGORY_MAP[phrase]) return CATEGORY_MAP[phrase];
    }
  }

  // 3. Single word token match
  for (const word of words) {
    // Strip common suffixes for better matching
    const stripped = word.replace(/(?:es|s)$/, '');
    if (CATEGORY_MAP[word]) return CATEGORY_MAP[word];
    if (CATEGORY_MAP[stripped]) return CATEGORY_MAP[stripped];
  }

  return 'other';
}
