/**
 * Intent parser — converts raw speech transcripts into structured commands.
 *
 * Supported intents: add | remove | update-quantity | search | unknown
 *
 * Extracts: intent, itemName, quantity, unit, brand, attributes, minPrice, maxPrice
 */

import type { ParsedIntent } from '../types';

// ─── Number Parsing ───────────────────────────────────────────────────────────

const WORD_NUMBERS: Record<string, number> = {
  a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5,
  six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, dozen: 12, half: 0.5,
  // Hindi / Hinglish (unique keys only)
  'एक': 1, 'एके': 1, 'ek': 1, 'दो': 2, 'दोई': 2, 'do': 2, 'तीन': 3, 'teen': 3, 'चार': 4, 'पांच': 5, 'पाँच': 5, 'paanch': 5,
  // Bengali
  'এক': 1, 'দুই': 2, 'তিন': 3, 'চার': 4, 'পাঁচ': 5,
  // Tamil
  'ஒரு': 1, 'ஒன்று': 1, 'இரண்டு': 2, 'மூன்று': 3, 'நான்கு': 4, 'ஐந்து': 5,
  // Telugu
  'ఒకటి': 1, 'ఒక్కటి': 1, 'రెండు': 2, 'మూడు': 3, 'నాలుగు': 4, 'ఐదు': 5,
  // Spanish (single word only)
  'un': 1, 'dos': 2, 'tres': 3, 'cuatro': 4, 'cinco': 5,
  // French (single word only)
  'deux': 2, 'trois': 3, 'quatre': 4, 'cinq': 5,
};

function parseNumber(raw: string): number {
  const t = raw.trim().toLowerCase();
  if (WORD_NUMBERS[t] !== undefined) return WORD_NUMBERS[t];
  const n = parseFloat(t);
  return isNaN(n) ? 1 : n;
}

// ─── Units ────────────────────────────────────────────────────────────────────

const UNIT_ALTS = [
  // Longest first to prevent greedy short-match (packets before packs, etc.)
  'milliliters?', 'millilitres?', 'kilograms?', 'ounces?',
  'packages?', 'packets?', 'bottles?', 'cartons?', 'containers?',
  'gallons?', 'pounds?', 'liters?', 'litres?', 'slices?', 'sheets?',
  'bunches?', 'pieces?', 'loaves?', 'cloves?', 'cases?', 'rolls?',
  'heads?', 'tubes?', 'bars?', 'tubs?', 'bags?', 'cans?', 'jars?',
  'boxes?', 'packs?', 'cups?', 'bunch', 'dozen', 'loaf',
  'lbs?', 'kg', 'g', 'oz', 'ml',
];
const UNITS_PAT = UNIT_ALTS.join('|');

// Single-word number words safe to use in regex.
// CRITICAL: 'a' and 'an' must use \b (word boundary) so they don't match
// the start of item names like 'apples' → 'a' + 'pples'.
// We keep them in WORD_NUMBERS for parseNumber() but EXCLUDE them from the
// QTY_UNIT_RE pattern (they'd be ambiguous there anyway — "a milk" is qty=1
// but caught by cleanItemName stripping leading 'a').
const WORD_NUM_PAT = Object.keys(WORD_NUMBERS)
  .map(k => k.trim())
  .filter(k => k && !/\s/.test(k) && k !== 'a' && k !== 'an')  // exclude single-letter ambiguous words
  .map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
  .join('|');

// ─── Known Brands (longest match first) ──────────────────────────────────────

const KNOWN_BRANDS: string[] = [
  'organic valley', 'califia farms', "dave's killer", "nature's own",
  'bell & evans', 'seventh generation', 'blue diamond', 'local farms',
  'amul', 'colgate', 'dove', 'lifebuoy', 'dettol', 'surf', 'ariel',
  'haldirams', 'haldiram', 'parle', 'britannia', 'maggi', 'nestle',
  'pepsi', 'coca cola', 'coke', 'sprite', 'tropicana', 'dabur',
  'patanjali', 'himalaya', 'lays', 'kurkure', 'cadbury', 'kitkat',
  'oatly', 'chobani', 'tillamook', 'thomas', 'earthbound', 'naturesweet',
  'jennie-o', 'applegate', 'lacroix', 'chameleon', 'yogi',
  'cape cod', 'kind', 'skinnypop', 'method', "wyman's", 'caulipower',
].sort((a, b) => b.length - a.length);  // greedy: longest brand first

// ─── Attribute Keywords ────────────────────────────────────────────────────────

const ATTR_WORDS = [
  'organic', 'fresh', 'whole', 'low-fat', 'fat-free', 'sugar-free',
  'diet', 'light', 'dark', 'raw', 'frozen', 'canned', 'dried', 'smoked',
  'roasted', 'salted', 'unsalted', 'sweetened', 'unsweetened', 'wild',
  'free-range', 'grass-fed', 'gluten-free', 'vegan', 'skimmed',
  'extra-virgin', 'unprocessed', 'fortified', 'enriched',
];

// ─── Price Extraction ─────────────────────────────────────────────────────────

const CURR = '(?:₹|rs\\.?|inr|rupees?)?';
// CURR_TRAIL: optional trailing currency word (e.g., "300 rupees")
const CURR_TRAIL = '(?:\\s*(?:₹|rs\\.?|inr|rupees?))?';
const RE_BETWEEN = new RegExp(
  `between\\s*${CURR}\\s*(\\d+(?:\\.\\d+)?)\\s*(?:and|to|-)\\s*${CURR}\\s*(\\d+(?:\\.\\d+)?)${CURR_TRAIL}`, 'i'
);
const RE_MAX_P = new RegExp(
  `(?:under|below|less\\s+than|cheaper\\s+than|max(?:imum)?|within|up\\s+to|at\\s+most|upto?)\\s*${CURR}\\s*(\\d+(?:\\.\\d+)?)${CURR_TRAIL}`, 'i'
);
const RE_MIN_P = new RegExp(
  `(?:above|over|more\\s+than|at\\s+least|minimum|min)\\s*${CURR}\\s*(\\d+(?:\\.\\d+)?)${CURR_TRAIL}`, 'i'
);

function extractPrices(text: string): { minPrice?: number; maxPrice?: number; cleaned: string } {
  let cleaned = text;
  let minPrice: number | undefined, maxPrice: number | undefined;

  const btw = cleaned.match(RE_BETWEEN);
  if (btw) {
    minPrice = parseFloat(btw[1]);
    maxPrice = parseFloat(btw[2]);
    cleaned = cleaned.replace(RE_BETWEEN, '').replace(/\s+/g, ' ').trim();
  }
  const maxM = cleaned.match(RE_MAX_P);
  if (maxM && !maxPrice) {
    maxPrice = parseFloat(maxM[1]);
    cleaned = cleaned.replace(RE_MAX_P, '').replace(/\s+/g, ' ').trim();
  }
  const minM = cleaned.match(RE_MIN_P);
  if (minM && !minPrice) {
    minPrice = parseFloat(minM[1]);
    cleaned = cleaned.replace(RE_MIN_P, '').replace(/\s+/g, ' ').trim();
  }
  return { minPrice, maxPrice, cleaned };
}

function extractBrand(text: string): { brand?: string; cleaned: string } {
  const lower = text.toLowerCase();
  for (const b of KNOWN_BRANDS) {
    const idx = lower.indexOf(b);
    if (idx !== -1) {
      const cleaned = (text.slice(0, idx) + text.slice(idx + b.length))
        .replace(/\s+/g, ' ').trim();
      return { brand: b, cleaned };
    }
  }
  return { cleaned: text };
}

function extractAttributes(text: string): { attributes: string[]; cleaned: string } {
  const found: string[] = [];
  let cleaned = text;
  for (const attr of ATTR_WORDS) {
    const escaped = attr.replace(/[-]/g, '[-\\s]?');
    const re = new RegExp(`\\b${escaped}\\b`, 'i');
    if (re.test(cleaned)) {
      found.push(attr);
      cleaned = cleaned.replace(re, '').replace(/\s+/g, ' ').trim();
    }
  }
  return { attributes: found, cleaned };
}

// Qty + unit from the START of a phrase, returns the remaining item name
const QTY_UNIT_RE = new RegExp(
  `^(\\d+(?:\\.\\d+)?|${WORD_NUM_PAT})\\s*(?:(${UNITS_PAT})\\s*)?(?:of\\s+)?(.*)$`,
  'i'
);

function extractQtyUnit(text: string): { quantity: number; unit?: string; itemRaw: string } {
  const m = text.trim().match(QTY_UNIT_RE);
  if (m) {
    const qty = parseNumber(m[1]);
    const unit = m[2] ? normalizeUnit(m[2]) : undefined;
    const itemRaw = (m[3] || '').trim();
    if (itemRaw || unit) return { quantity: qty, unit, itemRaw: itemRaw || text };
  }
  return { quantity: 1, itemRaw: text };
}

function normalizeUnit(raw: string): string {
  const lower = raw.toLowerCase().trim();
  const M: Record<string, string> = {
    bottles: 'bottle', cans: 'can', jars: 'jar', bags: 'bag',
    boxes: 'box', packs: 'pack', packets: 'packet', packages: 'package',
    cartons: 'carton', gallons: 'gallon', liters: 'liter', litres: 'litre',
    pounds: 'lb', lbs: 'lb', kilograms: 'kg', grams: 'g', ounces: 'oz',
    cups: 'cup', pieces: 'piece', loaves: 'loaf', bunches: 'bunch',
    heads: 'head', cloves: 'clove', slices: 'slice', sheets: 'sheet',
    rolls: 'roll', tubes: 'tube', bars: 'bar', containers: 'container',
    tubs: 'tub', cases: 'case', milliliters: 'ml', millilitres: 'ml',
  };
  return M[lower] || lower;
}

function cleanItemName(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[.,!?;:]+$/, '')
    // Strip leading filler words
    .replace(/^(?:some|a\s+few|several|any|the|some\s+more|more|for\s+me|me)\s+/i, '')
    // Strip trailing filler
    .replace(/\s+(?:for\s+me|please|now)$/i, '')
    // Strip "anymore" / "any more"
    .replace(/\s+(?:any\s+)?more\b/gi, '')
    .replace(/\s+anymore$/i, '')
    // Strip "from my list" / "off my list"
    .replace(/\s+from\s+(?:my\s+)?(?:list|cart|basket)$/i, '')
    .replace(/\s+off\s+(?:(?:my|the)\s+)?(?:list|cart|basket)$/i, '')
    .replace(/\s+/g, ' ')
    .trim();
}

// ─── Action Patterns ──────────────────────────────────────────────────────────

// SEARCH: find / search for / show me / look for / where can I find
const RE_SEARCH = /^(?:find(?:\s+me)?|search(?:\s+for)?|look\s+for|show\s+me|locate|where\s+(?:can\s+i\s+)?(?:find|buy|get))\s+(.+)/i;

// REMOVE verbs: remove / delete / take off / cross off / drop / cancel / get rid of
const RE_REMOVE_VERB = /^(?:remove|delete|take\s+(?:off|out|away)|cross\s+(?:off|out)|drop|cancel|scratch\s+(?:off|out)|eliminate|get\s+rid\s+of)\s+(?:the\s+)?(.+?)(?:\s+(?:from|off)\s+(?:(?:my|the)\s+)?(?:list|cart|basket))?$/i;
// "Take water off my list" — item THEN "off"
const RE_TAKE_X_OFF = /^take\s+(?:the\s+)?(.+?)\s+(?:off|out|away)(?:\s+(?:from\s+)?(?:(?:my|the)\s+)?(?:list|cart|basket))?$/i;
// "I don't need apples anymore"
const RE_DONT_NEED = /^(?:i\s+)?(?:don'?t|do\s+not)\s+(?:need|want|require)\s+(?:any\s+(?:more\s+|of\s+the\s+)?|the\s+)?(.+?)(?:\s+(?:any\s+)?more|anymore)?$/i;
// "No more milk" / "Skip the bread"
const RE_NO_MORE = /^(?:no\s+more|not\s+having|skip(?:\s+the)?)\s+(.+)/i;

// UPDATE QUANTITY: change / update / modify / set X (quantity) to N
const RE_UPDATE_SET = /^(?:change|update|modify|set)\s+(?:the\s+)?(.+?)\s+(?:quantity\s+(?:of\s+)?)?to\s+(\d+(?:\.\d+)?|one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|dozen)/i;
// "Make apples 5"
const RE_MAKE_N = /^make\s+(?:the\s+)?(.+?)\s+(\d+)(?:\s+\w+)?$/i;

// ADD — explicit verbs
const RE_ADD_VERB = /^(?:please\s+)?(?:can\s+(?:you\s+)?)?(?:add|buy|get|order|grab|pick\s+up|purchase|include|let'?s\s+get|we\s+need|get\s+me)\s+(?:some\s+|a\s+few\s+|some\s+more\s+|more\s+)?(.+)/i;
// ADD — "I want to buy X" / "I'd like X"
const RE_I_WANT = /^(?:i\s+)?(?:want(?:\s+to\s+(?:buy|get|order))?|would\s+like(?:\s+to\s+(?:buy|get))?|i'?d\s+like(?:\s+to\s+(?:buy|get))?)\s+(?:some\s+|a\s+)?(.+)/i;
// ADD — "I need X"
const RE_I_NEED = /^(?:i\s+)?need(?:\s+to\s+(?:buy|get))?\s+(?:some\s+|a\s+)?(.+)/i;
// ADD — "Running low on milk" / "Out of eggs"
const RE_RUN_LOW = /^(?:i(?:'m|\s+am)\s+)?(?:running\s+low\s+on|running\s+out\s+of|out\s+of|almost\s+out\s+of)\s+(.+)/i;

// SUBSTITUTE / ALTERNATIVE:
// "Give me an alternative to milk" / "Find a substitute for butter" / "What can I use instead of bread?" / "Alternative for milk"
const RE_SUBSTITUTE = /^(?:give\s+(?:me\s+)?(?:an?\s+)?(?:alternative|substitute)\s+(?:to|for)?|find\s+(?:a\s+)?(?:substitute|alternative)(?:\s+for)?|what\s+can\s+i\s+(?:use|buy|get)\s+instead\s+of|(?:substitute|alternative|swap)\s+(?:to|for)?)\s+(?:the\s+)?(.+)/i;

// ─── Main Export ─────────────────────────────────────────────────────────────

export function parseIntent(raw: string): ParsedIntent {
  const input = raw.trim();

  // ── 1. UPDATE QUANTITY ──────────────────────────────────────────────────────
  // "Change milk quantity to 3" / "Set apples to 5" / "Update water to 2"
  const setM = input.match(RE_UPDATE_SET);
  if (setM) {
    return {
      action: 'update-quantity',
      itemName: cleanItemName(setM[1]),
      quantity: parseNumber(setM[2]),
      raw: input,
    };
  }

  // "Make apples 5" — "Make X [integer]"
  const makeM = input.match(RE_MAKE_N);
  if (makeM) {
    return {
      action: 'update-quantity',
      itemName: cleanItemName(makeM[1]),
      quantity: parseInt(makeM[2], 10),
      raw: input,
    };
  }

  // "I need two more bottles of water" — incremental add
  const needMoreRE = new RegExp(
    `^(?:i\\s+)?need\\s+(\\d+(?:\\.\\d+)?|${WORD_NUM_PAT})\\s+more\\s+(?:(${UNITS_PAT})\\s+(?:of\\s+)?)?(.+)`,
    'i'
  );
  const needMoreM = input.match(needMoreRE);
  if (needMoreM) {
    return {
      action: 'add',   // addItem already merges/increments
      itemName: cleanItemName(needMoreM[3]),
      quantity: parseNumber(needMoreM[1]),
      unit: needMoreM[2] ? normalizeUnit(needMoreM[2]) : undefined,
      raw: input,
    };
  }

  // ── 1.5 SUBSTITUTE / ALTERNATIVE ───────────────────────────────────────────
  // "Give me an alternative to milk" / "Find a substitute for butter"
  const subM = input.match(RE_SUBSTITUTE);
  if (subM) {
    return {
      action: 'substitute',
      itemName: cleanItemName(subM[1]),
      quantity: 1,
      raw: input,
    };
  }

  // ── 2. SEARCH ───────────────────────────────────────────────────────────────
  // "Find organic apples" / "Show me Colgate under 250" / "Search for 1 litre milk"
  const searchM = input.match(RE_SEARCH);
  if (searchM) {
    let rest = searchM[1];
    const { minPrice, maxPrice, cleaned: c1 } = extractPrices(rest);
    const { brand, cleaned: c2 }              = extractBrand(c1);
    const { attributes, cleaned: c3 }         = extractAttributes(c2);
    const { quantity, unit, itemRaw }          = extractQtyUnit(c3);
    const itemName = cleanItemName(itemRaw) || cleanItemName(c2) || brand || '';
    return {
      action: 'search',
      itemName,
      quantity,
      unit,
      brand:      brand || undefined,
      attributes: attributes.length ? attributes : undefined,
      minPrice,
      maxPrice,
      raw: input,
    };
  }

  // ── 3. REMOVE ───────────────────────────────────────────────────────────────
  // "Remove milk" / "Remove bread from my list"
  const removeVerbM = input.match(RE_REMOVE_VERB);
  if (removeVerbM) {
    return { action: 'remove', itemName: cleanItemName(removeVerbM[1]), quantity: 1, raw: input };
  }
  // "Take water off my list"
  const takeOffM = input.match(RE_TAKE_X_OFF);
  if (takeOffM) {
    return { action: 'remove', itemName: cleanItemName(takeOffM[1]), quantity: 1, raw: input };
  }
  // "I don't need apples anymore"
  const dontNeedM = input.match(RE_DONT_NEED);
  if (dontNeedM) {
    return { action: 'remove', itemName: cleanItemName(dontNeedM[1]), quantity: 1, raw: input };
  }
  // "No more bread"
  const noMoreM = input.match(RE_NO_MORE);
  if (noMoreM) {
    return { action: 'remove', itemName: cleanItemName(noMoreM[1]), quantity: 1, raw: input };
  }

  // ── 4. ADD — "I want to buy bananas" / "I'd like some milk" ─────────────────
  const wantM = input.match(RE_I_WANT);
  if (wantM) {
    const { quantity, unit, itemRaw } = extractQtyUnit(wantM[1]);
    return { action: 'add', itemName: cleanItemName(itemRaw || wantM[1]), quantity, unit, raw: input };
  }

  // ── 5. ADD — "I need apples" ─────────────────────────────────────────────────
  const needM = input.match(RE_I_NEED);
  if (needM) {
    const { quantity, unit, itemRaw } = extractQtyUnit(needM[1]);
    return { action: 'add', itemName: cleanItemName(itemRaw || needM[1]), quantity, unit, raw: input };
  }

  // ── 6. ADD — "Running low on milk" / "Out of eggs" ──────────────────────────
  const runLowM = input.match(RE_RUN_LOW);
  if (runLowM) {
    return { action: 'add', itemName: cleanItemName(runLowM[1]), quantity: 1, raw: input };
  }

  // ── 7. ADD — explicit verb (add / buy / get / order / etc.) ─────────────────
  // "Add milk" / "Buy 5 oranges" / "Please add three packets of bread"
  const addVerbM = input.match(RE_ADD_VERB);
  if (addVerbM) {
    const { quantity, unit, itemRaw } = extractQtyUnit(addVerbM[1]);
    return {
      action: 'add',
      itemName: cleanItemName(itemRaw || addVerbM[1]),
      quantity,
      unit,
      raw: input,
    };
  }

  // ── 8. STANDALONE PRICE — "toothpaste under 300 rupees" ─────────────────────
  const sPriceM = input.match(/^(.+?)\s+(?:under|below|less\s+than|cheaper\s+than)\s+(?:₹|rs\.?|inr|rupees?)?\s*(\d+)/i);
  if (sPriceM) {
    const { brand, cleaned: c1 }      = extractBrand(sPriceM[1]);
    const { attributes, cleaned: c2 } = extractAttributes(c1);
    return {
      action: 'search',
      itemName: cleanItemName(c2 || sPriceM[1]),
      quantity: 1,
      brand,
      attributes: attributes.length ? attributes : undefined,
      maxPrice: parseFloat(sPriceM[2]),
      raw: input,
    };
  }

  // ── 9. FALLBACK — bare noun phrase (e.g. "eggs") → add ─────────────────────
  const lower = input.toLowerCase();
  if (lower.length > 0 && lower.length < 60 && !/[?]/.test(lower)) {
    const { quantity, unit, itemRaw } = extractQtyUnit(input);
    const itemName = cleanItemName(itemRaw || input);
    if (itemName) return { action: 'add', itemName, quantity, unit, raw: input };
  }

  return { action: 'unknown', itemName: '', quantity: 1, raw: input };
}
