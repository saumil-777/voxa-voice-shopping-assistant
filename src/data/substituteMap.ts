/**
 * Maps item names (lowercase) to a list of healthier/common substitute options.
 * Shown when the user adds a specific item to their list.
 */
export const SUBSTITUTE_MAP: Record<string, string[]> = {
  // Dairy alternatives
  milk: ['almond milk', 'oat milk', 'soy milk'],
  'whole milk': ['2% milk', 'oat milk', 'almond milk'],
  butter: ['margarine', 'coconut oil', 'olive oil'],
  cream: ['half and half', 'coconut cream', 'evaporated milk'],
  'sour cream': ['Greek yogurt', 'crème fraîche', 'coconut cream'],
  'cream cheese': ['ricotta', 'neufchâtel cheese', 'cashew cream'],
  'heavy cream': ['coconut cream', 'evaporated milk', 'half and half'],
  cheese: ['nutritional yeast', 'vegan cheese', 'ricotta'],
  yogurt: ['Greek yogurt', 'coconut yogurt', 'kefir'],

  // Sweeteners
  sugar: ['honey', 'maple syrup', 'coconut sugar'],
  'brown sugar': ['coconut sugar', 'muscovado sugar', 'maple syrup'],
  'white sugar': ['raw cane sugar', 'honey', 'agave nectar'],

  // Grains & Bakery
  bread: ['sourdough bread', 'whole wheat bread', 'ezekiel bread'],
  'white bread': ['whole wheat bread', 'sourdough', 'multigrain bread'],
  'all-purpose flour': ['whole wheat flour', 'almond flour', 'oat flour'],
  pasta: ['whole wheat pasta', 'chickpea pasta', 'lentil pasta'],
  rice: ['brown rice', 'cauliflower rice', 'quinoa'],
  'white rice': ['brown rice', 'quinoa', 'wild rice'],

  // Oils & Fats
  'vegetable oil': ['olive oil', 'avocado oil', 'coconut oil'],
  'canola oil': ['avocado oil', 'olive oil', 'sunflower oil'],

  // Proteins
  beef: ['ground turkey', 'plant-based burger', 'lentils'],
  'ground beef': ['ground turkey', 'beyond meat', 'tempeh'],
  chicken: ['tofu', 'tempeh', 'chickpeas'],
  bacon: ['turkey bacon', 'tempeh strips', 'coconut bacon'],
  sausage: ['turkey sausage', 'chicken sausage', 'plant-based sausage'],

  // Snacks
  chips: ['rice cakes', 'veggie chips', 'popcorn'],
  cookies: ['energy balls', 'rice cakes', 'fruit'],
  chocolate: ['dark chocolate', 'cacao nibs', 'carob'],

  // Beverages
  soda: ['sparkling water', 'kombucha', 'flavored water'],
  'energy drink': ['green tea', 'matcha latte', 'sparkling water'],
  coffee: ['matcha', 'chicory coffee', 'green tea'],

  // Condiments
  mayonnaise: ['avocado mayo', 'Greek yogurt', 'hummus'],
  ketchup: ['salsa', 'tomato paste', 'mustard'],

  // Eggs
  eggs: ['flax eggs', 'chia eggs', 'silken tofu'],
};

/**
 * Get substitutes for an item name. Checks exact match, then partial match.
 */
export function getSubstitutes(itemName: string): string[] {
  const lower = itemName.toLowerCase().trim();

  // Exact match
  if (SUBSTITUTE_MAP[lower]) return SUBSTITUTE_MAP[lower];

  // Partial match — check if any key is contained within the item name
  for (const [key, subs] of Object.entries(SUBSTITUTE_MAP)) {
    if (lower.includes(key) || key.includes(lower)) {
      return subs;
    }
  }

  return [];
}
