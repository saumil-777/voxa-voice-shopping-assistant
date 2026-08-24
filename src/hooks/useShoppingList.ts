import { useState, useCallback, useEffect } from 'react';
import type { ShoppingItem, Category } from '../types';
import { categorizeItem } from '../utils/categorizer';
import { getSubstitutes } from '../data/substituteMap';
import purchaseHistory from '../data/purchaseHistory.json';
import type { PurchaseHistoryItem } from '../types';

const STORAGE_KEY = 'voice-shopping-list';

function generateId(): string {
  return `item-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function loadFromStorage(): ShoppingItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as ShoppingItem[];
    return parsed;
  } catch {
    return [];
  }
}

function saveToStorage(items: ShoppingItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Silently fail if storage is unavailable
  }
}

export interface UseShoppingListReturn {
  items: ShoppingItem[];
  lastAddedSubstitutes: string[];
  lastAddedItemName: string | null;
  suggestions: PurchaseHistoryItem[];
  addItem: (name: string, quantity?: number, unit?: string) => ShoppingItem | null;
  removeItem: (id: string) => void;
  removeItemByName: (name: string) => boolean;
  toggleChecked: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  setQuantityByName: (name: string, quantity: number) => boolean;
  clearChecked: () => void;
  clearSubstitutes: () => void;
  dismissSuggestion: (id: string) => void;
  /** Manually trigger the substitute panel (e.g. for voice substitute commands). */
  showSubstitutes: (itemName: string, substitutes: string[]) => void;
}

export function useShoppingList(): UseShoppingListReturn {
  const [items, setItems] = useState<ShoppingItem[]>(loadFromStorage);
  const [lastAddedSubstitutes, setLastAddedSubstitutes] = useState<string[]>([]);
  const [lastAddedItemName, setLastAddedItemName] = useState<string | null>(null);
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(new Set());

  // Persist to localStorage on change
  useEffect(() => {
    saveToStorage(items);
  }, [items]);

  // Derive smart suggestions from purchase history
  // An item is suggested when lastPurchasedDaysAgo >= its individual purchaseIntervalDays
  const suggestions: PurchaseHistoryItem[] = (purchaseHistory as PurchaseHistoryItem[])
    .filter(h => {
      if (dismissedSuggestions.has(h.id)) return false;
      // Only suggest items whose expected purchase interval has passed
      if (h.lastPurchasedDaysAgo < h.purchaseIntervalDays) return false;
      // Don't suggest items already in the list
      const alreadyAdded = items.some(
        item => item.name.toLowerCase() === h.name.toLowerCase()
      );
      return !alreadyAdded;
    })
    // Sort by how overdue they are (most overdue first)
    .sort((a, b) => {
      const overdueA = a.lastPurchasedDaysAgo - a.purchaseIntervalDays;
      const overdueB = b.lastPurchasedDaysAgo - b.purchaseIntervalDays;
      return overdueB - overdueA;
    })
    .slice(0, 6);

  const addItem = useCallback(
    (name: string, quantity = 1, unit?: string): ShoppingItem | null => {
      if (!name.trim()) return null;

      const normalizedName = name.trim().toLowerCase();
      const category: Category = categorizeItem(normalizedName);
      const substitutes = getSubstitutes(normalizedName);

      let resultItem: ShoppingItem | null = null;

      setItems(prev => {
        const existingIndex = prev.findIndex(
          item => item.name.toLowerCase() === normalizedName
        );

        if (existingIndex >= 0) {
          const updated = [...prev];
          const existing = updated[existingIndex];
          const merged: ShoppingItem = {
            ...existing,
            quantity: existing.quantity + quantity,
            checked: false,
            unit: unit || existing.unit,
          };
          updated[existingIndex] = merged;
          resultItem = merged;
          return updated;
        }

        const newItem: ShoppingItem = {
          id: generateId(),
          name: normalizedName,
          quantity,
          unit,
          category,
          addedAt: Date.now(),
          checked: false,
        };
        resultItem = newItem;
        return [newItem, ...prev];
      });

      // Show substitutes if available
      if (substitutes.length > 0) {
        setLastAddedSubstitutes(substitutes);
        setLastAddedItemName(normalizedName);
      } else {
        setLastAddedSubstitutes([]);
        setLastAddedItemName(null);
      }

      // If state update was deferred, return constructed resultItem or new item object
      return resultItem || {
        id: generateId(),
        name: normalizedName,
        quantity,
        unit,
        category,
        addedAt: Date.now(),
        checked: false,
      };
    },
    []
  );

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const removeItemByName = useCallback((name: string): boolean => {
    const lower = name.toLowerCase().trim();
    if (!lower) return false;

    let matchFound = false;
    setItems(prev => {
      const filtered = prev.filter(item => {
        const itemLower = item.name.toLowerCase();
        const isMatch = itemLower === lower || itemLower.includes(lower) || lower.includes(itemLower);
        if (isMatch) matchFound = true;
        return !isMatch;
      });
      return filtered;
    });

    // Also check current items state if React callback hasn't run yet
    return matchFound || items.some(item => {
      const itemLower = item.name.toLowerCase();
      return itemLower === lower || itemLower.includes(lower) || lower.includes(itemLower);
    });
  }, [items]);

  const toggleChecked = useCallback((id: string) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  }, []);

  const updateQuantity = useCallback((id: string, delta: number) => {
    setItems(prev =>
      prev
        .map(item => {
          if (item.id !== id) return item;
          const newQty = Math.max(0, item.quantity + delta);
          return { ...item, quantity: newQty };
        })
        .filter(item => item.quantity > 0)
    );
  }, []);

  const clearChecked = useCallback(() => {
    setItems(prev => prev.filter(item => !item.checked));
  }, []);

  const clearSubstitutes = useCallback(() => {
    setLastAddedSubstitutes([]);
    setLastAddedItemName(null);
  }, []);

  const showSubstitutes = useCallback((itemName: string, substitutes: string[]) => {
    setLastAddedItemName(itemName);
    setLastAddedSubstitutes(substitutes);
  }, []);

  const dismissSuggestion = useCallback((id: string) => {
    setDismissedSuggestions(prev => new Set([...prev, id]));
  }, []);

  /**
   * Set an item's quantity to an absolute value (for "Change milk to 3" commands).
   * Returns true if the item was found and updated.
   * If quantity ≤ 0, the item is removed.
   */
  const setQuantityByName = useCallback((name: string, quantity: number): boolean => {
    const lower = name.toLowerCase().trim();
    if (!lower) return false;

    // Check current items state for a match
    const exists = items.some(item => {
      const il = item.name.toLowerCase();
      return il === lower || il.includes(lower) || lower.includes(il);
    });

    setItems(prev => {
      const idx = prev.findIndex(item => {
        const il = item.name.toLowerCase();
        return il === lower || il.includes(lower) || lower.includes(il);
      });
      if (idx === -1) return prev;
      if (quantity <= 0) return prev.filter((_, i) => i !== idx);
      const updated = [...prev];
      updated[idx] = { ...updated[idx], quantity };
      return updated;
    });

    return exists;
  }, [items]);

  return {
    items,
    lastAddedSubstitutes,
    lastAddedItemName,
    suggestions,
    addItem,
    removeItem,
    removeItemByName,
    toggleChecked,
    updateQuantity,
    setQuantityByName,
    clearChecked,
    clearSubstitutes,
    dismissSuggestion,
    showSubstitutes,
  };
}
