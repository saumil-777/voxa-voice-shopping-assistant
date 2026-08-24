// ─── Language Support ────────────────────────────────────────────────────────

export type SupportedLanguage = 'en-IN' | 'hi-IN' | 'ta-IN' | 'te-IN' | 'bn-IN';

export const LANGUAGE_META: Record<SupportedLanguage, { label: string; flag: string; name: string; speechCode: string }> = {
  'en-IN': { label: 'English', flag: 'English', name: 'English', speechCode: 'en-IN' },
  'hi-IN': { label: 'हिन्दी', flag: 'हिन्दी', name: 'Hindi', speechCode: 'hi-IN' },
  'ta-IN': { label: 'தமிழ்', flag: 'தமிழ்', name: 'Tamil', speechCode: 'ta-IN' },
  'te-IN': { label: 'తెలుగు', flag: 'తెలుగు', name: 'Telugu', speechCode: 'te-IN' },
  'bn-IN': { label: 'বাংলা', flag: 'বাংলা', name: 'Bengali', speechCode: 'bn-IN' },
};

// ─── Category Types ──────────────────────────────────────────────────────────
export type Category =
  | 'dairy'
  | 'produce'
  | 'snacks'
  | 'bakery'
  | 'meat'
  | 'beverages'
  | 'household'
  | 'frozen'
  | 'other';

export const CATEGORY_META: Record<
  Category,
  { label: string; emoji: string; color: string }
> = {
  dairy:     { label: 'Dairy',     emoji: '🥛', color: '#60a5fa' },
  produce:   { label: 'Produce',   emoji: '🥦', color: '#34d399' },
  snacks:    { label: 'Snacks',    emoji: '🍿', color: '#fbbf24' },
  bakery:    { label: 'Bakery',    emoji: '🥖', color: '#f97316' },
  meat:      { label: 'Meat',      emoji: '🥩', color: '#f87171' },
  beverages: { label: 'Beverages', emoji: '🧃', color: '#a78bfa' },
  household: { label: 'Household', emoji: '🧹', color: '#94a3b8' },
  frozen:    { label: 'Frozen',    emoji: '🧊', color: '#67e8f9' },
  other:     { label: 'Other',     emoji: '🛒', color: '#e2e8f0' },
};

// ─── Shopping Item ────────────────────────────────────────────────────────────

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: number;
  unit?: string;
  category: Category;
  addedAt: number; // timestamp
  checked: boolean;
}

// ─── Intent Parser ────────────────────────────────────────────────────────────

export type IntentAction = 'add' | 'remove' | 'search' | 'update-quantity' | 'substitute' | 'unknown';

export interface ParsedIntent {
  action: IntentAction;
  itemName: string;
  quantity: number;
  unit?: string;
  brand?: string;           // e.g. "amul", "colgate"
  attributes?: string[];    // e.g. ["organic", "fresh"]
  minPrice?: number;        // "above ₹100"
  maxPrice?: number;        // "under ₹500"
  raw: string;
}

// ─── Product Catalog ─────────────────────────────────────────────────────────

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: Category;
  price: number;
  currency: 'INR' | 'USD';
  size: string;
  unit: string;
  availability: boolean;
  organic?: boolean;
  substitutes?: string[];
}

// ─── Purchase History ─────────────────────────────────────────────────────────

export interface PurchaseHistoryItem {
  id: string;
  name: string;
  category: Category;
  lastPurchasedDaysAgo: number;
  purchaseIntervalDays: number;  // typical purchase frequency in days
  typicalQuantity: number;
  unit?: string;
}

// ─── Seasonal Item ────────────────────────────────────────────────────────────

export interface SeasonalItem {
  id: string;
  name: string;
  category: Category;
  reason: string;
  emoji: string;
}

// ─── Toast ────────────────────────────────────────────────────────────────────

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

// ─── Voice Recognition State ──────────────────────────────────────────────────

export type VoiceState = 'idle' | 'listening' | 'processing' | 'success' | 'error';

export interface VoiceRecognitionResult {
  transcript: string;
  interimTranscript: string;
  lastTranscript: string;   // persists after processing completes
  state: VoiceState;
  errorMessage: string | null;
  isSupported: boolean;
  start: () => void;
  stop: () => void;
}

// ─── Command Result (shown after voice command processes) ─────────────────────

export interface CommandResult {
  transcript: string;  // What was heard
  message: string;     // Confirmation or error message
  success: boolean;    // Whether the action succeeded
}
