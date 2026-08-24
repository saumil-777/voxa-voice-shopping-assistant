import type { SeasonalItem } from '../types';

/**
 * Seasonal produce & grocery recommendations by month.
 * India-centric with universal grocery items.
 * Month index: 0 = January … 11 = December
 */
const SEASONAL_BY_MONTH: SeasonalItem[][] = [
  // January (0)
  [
    { id: 's-jan-1', name: 'strawberries',   category: 'produce',   emoji: '🍓', reason: 'Peak season — sweetest now' },
    { id: 's-jan-2', name: 'peas',           category: 'produce',   emoji: '🫛', reason: 'Fresh winter peas available' },
    { id: 's-jan-3', name: 'carrots',        category: 'produce',   emoji: '🥕', reason: 'Sweet winter carrots' },
    { id: 's-jan-4', name: 'oranges',        category: 'produce',   emoji: '🍊', reason: 'Citrus season — high Vitamin C' },
    { id: 's-jan-5', name: 'broccoli',       category: 'produce',   emoji: '🥦', reason: 'Best in cool weather' },
  ],
  // February (1)
  [
    { id: 's-feb-1', name: 'strawberries',   category: 'produce',   emoji: '🍓', reason: 'Still peak season' },
    { id: 's-feb-2', name: 'spinach',        category: 'produce',   emoji: '🥬', reason: 'Tender winter spinach' },
    { id: 's-feb-3', name: 'cauliflower',    category: 'produce',   emoji: '🥦', reason: 'Crisp winter cauliflower' },
    { id: 's-feb-4', name: 'guava',          category: 'produce',   emoji: '🍈', reason: 'Guava season ending soon' },
    { id: 's-feb-5', name: 'dark chocolate', category: 'snacks',    emoji: '🍫', reason: "Valentine's week — treat yourself" },
  ],
  // March (2)
  [
    { id: 's-mar-1', name: 'mango',          category: 'produce',   emoji: '🥭', reason: 'Mango season begins!' },
    { id: 's-mar-2', name: 'jackfruit',      category: 'produce',   emoji: '🍈', reason: 'Raw jackfruit in season' },
    { id: 's-mar-3', name: 'watermelon',     category: 'produce',   emoji: '🍉', reason: 'Early summer — stay hydrated' },
    { id: 's-mar-4', name: 'cucumber',       category: 'produce',   emoji: '🥒', reason: 'Cool & refreshing' },
    { id: 's-mar-5', name: 'sparkling water',category: 'beverages', emoji: '💧', reason: 'Summer hydration essential' },
  ],
  // April (3)
  [
    { id: 's-apr-1', name: 'mango',          category: 'produce',   emoji: '🥭', reason: 'Peak mango month!' },
    { id: 's-apr-2', name: 'litchi',         category: 'produce',   emoji: '🍒', reason: 'Litchi season just started' },
    { id: 's-apr-3', name: 'watermelon',     category: 'produce',   emoji: '🍉', reason: 'Beat the heat' },
    { id: 's-apr-4', name: 'coconut water',  category: 'beverages', emoji: '🥥', reason: 'Natural hydration in summer' },
    { id: 's-apr-5', name: 'lemon',          category: 'produce',   emoji: '🍋', reason: 'For refreshing nimbu pani' },
  ],
  // May (4)
  [
    { id: 's-may-1', name: 'mango',          category: 'produce',   emoji: '🥭', reason: 'Alphonso & Kesar peak month' },
    { id: 's-may-2', name: 'jamun',          category: 'produce',   emoji: '🫐', reason: 'Jamun season begins' },
    { id: 's-may-3', name: 'ice cream',      category: 'frozen',    emoji: '🍨', reason: 'Summer staple!' },
    { id: 's-may-4', name: 'coconut water',  category: 'beverages', emoji: '🥥', reason: 'Essential hydration' },
    { id: 's-may-5', name: 'mint',           category: 'produce',   emoji: '🌿', reason: 'For cooling drinks & chutneys' },
  ],
  // June (5)
  [
    { id: 's-jun-1', name: 'plums',          category: 'produce',   emoji: '🍑', reason: 'Plum season — rich in antioxidants' },
    { id: 's-jun-2', name: 'peaches',        category: 'produce',   emoji: '🍑', reason: 'Himalayan peaches in season' },
    { id: 's-jun-3', name: 'ice cream',      category: 'frozen',    emoji: '🍨', reason: 'Beat the June heat' },
    { id: 's-jun-4', name: 'corn',           category: 'produce',   emoji: '🌽', reason: 'Monsoon corn just arrived' },
    { id: 's-jun-5', name: 'ginger',         category: 'produce',   emoji: '🫚', reason: 'Immunity boost for monsoon' },
  ],
  // July (6)
  [
    { id: 's-jul-1', name: 'corn',           category: 'produce',   emoji: '🌽', reason: 'Monsoon bhutta season!' },
    { id: 's-jul-2', name: 'pineapple',      category: 'produce',   emoji: '🍍', reason: 'Peak pineapple month' },
    { id: 's-jul-3', name: 'mushrooms',      category: 'produce',   emoji: '🍄', reason: 'Wild monsoon mushrooms' },
    { id: 's-jul-4', name: 'turmeric',       category: 'other',     emoji: '🌿', reason: 'Monsoon immunity booster' },
    { id: 's-jul-5', name: 'green tea',      category: 'beverages', emoji: '🍵', reason: 'Warm drink for rainy days' },
  ],
  // August (7)
  [
    { id: 's-aug-1', name: 'pomegranate',    category: 'produce',   emoji: '🍎', reason: 'Early pomegranate season' },
    { id: 's-aug-2', name: 'pear',           category: 'produce',   emoji: '🍐', reason: 'Himalayan pears in season' },
    { id: 's-aug-3', name: 'green beans',    category: 'produce',   emoji: '🫘', reason: 'Fresh monsoon beans' },
    { id: 's-aug-4', name: 'chocolate',      category: 'snacks',    emoji: '🍫', reason: "Raksha Bandhan — gift sweets" },
    { id: 's-aug-5', name: 'walnuts',        category: 'snacks',    emoji: '🌰', reason: 'New harvest walnuts' },
  ],
  // September (8)
  [
    { id: 's-sep-1', name: 'pomegranate',    category: 'produce',   emoji: '🍎', reason: 'Peak pomegranate sweetness' },
    { id: 's-sep-2', name: 'grapes',         category: 'produce',   emoji: '🍇', reason: 'Nashik grapes in season' },
    { id: 's-sep-3', name: 'apples',         category: 'produce',   emoji: '🍎', reason: 'Kashmiri apple harvest' },
    { id: 's-sep-4', name: 'sweet potato',   category: 'produce',   emoji: '🍠', reason: 'Navratri fasting staple' },
    { id: 's-sep-5', name: 'nuts',           category: 'snacks',    emoji: '🥜', reason: 'Festival season snacking' },
  ],
  // October (9)
  [
    { id: 's-oct-1', name: 'grapes',         category: 'produce',   emoji: '🍇', reason: 'Still abundant & sweet' },
    { id: 's-oct-2', name: 'pomegranate',    category: 'produce',   emoji: '🍎', reason: 'Diwali gift fruit' },
    { id: 's-oct-3', name: 'cashews',        category: 'snacks',    emoji: '🥜', reason: 'Diwali dry fruits' },
    { id: 's-oct-4', name: 'almonds',        category: 'snacks',    emoji: '🌰', reason: 'Diwali mithai ingredients' },
    { id: 's-oct-5', name: 'dates',          category: 'snacks',    emoji: '🌴', reason: 'Festive season sweetener' },
  ],
  // November (10)
  [
    { id: 's-nov-1', name: 'oranges',        category: 'produce',   emoji: '🍊', reason: 'Nagpur orange season begins' },
    { id: 's-nov-2', name: 'guava',          category: 'produce',   emoji: '🍈', reason: 'Guava season peak' },
    { id: 's-nov-3', name: 'cauliflower',    category: 'produce',   emoji: '🥦', reason: 'Winter vegetables arriving' },
    { id: 's-nov-4', name: 'peas',           category: 'produce',   emoji: '🫛', reason: 'Fresh winter peas' },
    { id: 's-nov-5', name: 'hot chocolate',  category: 'beverages', emoji: '☕', reason: 'Warming up for winter' },
  ],
  // December (11)
  [
    { id: 's-dec-1', name: 'oranges',        category: 'produce',   emoji: '🍊', reason: 'Citrus peak — great for immunity' },
    { id: 's-dec-2', name: 'strawberries',   category: 'produce',   emoji: '🍓', reason: 'Early winter strawberries' },
    { id: 's-dec-3', name: 'carrots',        category: 'produce',   emoji: '🥕', reason: 'For gajar ka halwa season' },
    { id: 's-dec-4', name: 'dark chocolate', category: 'snacks',    emoji: '🍫', reason: 'Christmas season treat' },
    { id: 's-dec-5', name: 'coffee',         category: 'beverages', emoji: '☕', reason: 'Cozy winter brew' },
  ],
];

/**
 * Returns the seasonal items for the current month.
 */
export function getCurrentSeasonalItems(): SeasonalItem[] {
  const month = new Date().getMonth(); // 0-11
  return SEASONAL_BY_MONTH[month] ?? [];
}

/**
 * Returns the current season name for display.
 */
export function getCurrentSeason(): { name: string; emoji: string } {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4)  return { name: 'Summer', emoji: '☀️' };
  if (month >= 5 && month <= 8)  return { name: 'Monsoon', emoji: '🌧️' };
  if (month >= 9 && month <= 10) return { name: 'Autumn', emoji: '🍂' };
  return { name: 'Winter', emoji: '❄️' };
}
