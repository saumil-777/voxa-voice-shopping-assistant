/**
 * Formats sub-detail text for shopping list items (e.g., "Amul • Toned", "Bisleri • 1L")
 * matching the VOXA design reference.
 */

const ITEM_SUB_DETAILS: Record<string, string> = {
  milk: 'Amul • Toned',
  apples: 'Fresh • Medium',
  apple: 'Fresh • Medium',
  bread: 'Brown Bread',
  water: 'Bisleri • 1L',
  eggs: 'Farm Fresh • Dozen',
  egg: 'Farm Fresh • Dozen',
  banana: 'Organic • Robusta',
  bananas: 'Organic • Robusta',
  orange: 'Nagpur • Juicy',
  oranges: 'Nagpur • Juicy',
  rice: 'Basmati • 5kg Pack',
  flour: 'Chakki Fresh • Atta',
  butter: 'Amul • Pasteurized',
  cheese: 'Amul • Processed',
  coffee: 'Nescafe • Classic',
  tea: 'Tata Tea • Premium',
  toothpaste: 'Colgate • Total 12',
  soap: 'Dove • Cream Bar',
};

export function getItemSubDetail(name: string, unit?: string): string {
  const lower = name.toLowerCase().trim();
  if (ITEM_SUB_DETAILS[lower]) {
    return ITEM_SUB_DETAILS[lower];
  }
  if (unit) {
    return `${name.charAt(0).toUpperCase() + name.slice(1)} • ${unit}`;
  }
  return 'Standard Quality';
}

export function getItemEmoji(name: string, category: string): string {
  const lower = name.toLowerCase().trim();
  if (lower.includes('milk')) return '🥛';
  if (lower.includes('apple')) return '🍎';
  if (lower.includes('bread')) return '🍞';
  if (lower.includes('water')) return '💧';
  if (lower.includes('banana')) return '🍌';
  if (lower.includes('orange')) return '🍊';
  if (lower.includes('egg')) return '🥚';
  if (lower.includes('rice')) return '🌾';
  if (lower.includes('cheese')) return '🧀';
  if (lower.includes('butter')) return '🧈';
  if (lower.includes('coffee')) return '☕';
  if (lower.includes('tea')) return '🍵';
  if (lower.includes('toothpaste')) return '🪥';
  if (lower.includes('soap')) return '🧼';

  const categoryEmojis: Record<string, string> = {
    dairy: '🥛',
    produce: '🥦',
    snacks: '🍿',
    bakery: '🥖',
    meat: '🥩',
    beverages: '🧃',
    household: '🧹',
    frozen: '🧊',
    other: '🛒',
  };
  return categoryEmojis[category] || '🛒';
}
