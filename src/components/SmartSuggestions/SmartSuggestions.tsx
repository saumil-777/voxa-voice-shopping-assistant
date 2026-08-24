import type { PurchaseHistoryItem } from '../../types';
import { getItemEmoji } from '../../utils/itemDetails';

interface SmartSuggestionsProps {
  suggestions?: PurchaseHistoryItem[];
  onAddSuggestion: (item: PurchaseHistoryItem) => void;
  onAddByName?: (name: string) => void;
}

/**
 * Generates a human-readable reason from real purchase history data.
 * Uses purchaseIntervalDays and lastPurchasedDaysAgo to compute "overdue" state.
 */
function getSmartReason(item: PurchaseHistoryItem): { reason: string; tag: string; tagStyle: TagStyle } {
  const overdueDays = item.lastPurchasedDaysAgo - item.purchaseIntervalDays;

  if (overdueDays >= 7) {
    return {
      reason: `Usually every ${item.purchaseIntervalDays} days · ${item.lastPurchasedDaysAgo} days ago`,
      tag: 'Overdue',
      tagStyle: TAG_STYLES.overdue,
    };
  }
  if (overdueDays >= 1) {
    return {
      reason: `Usually every ${item.purchaseIntervalDays} days · You may be running low`,
      tag: 'Running Low',
      tagStyle: TAG_STYLES.low,
    };
  }
  return {
    reason: `Purchased every ~${item.purchaseIntervalDays} days`,
    tag: 'Frequent',
    tagStyle: TAG_STYLES.frequent,
  };
}

interface TagStyle {
  background: string;
  color: string;
  borderColor: string;
}

const TAG_STYLES = {
  overdue: {
    background: 'rgba(239, 68, 68, 0.2)',
    color: '#fca5a5',
    borderColor: 'rgba(239, 68, 68, 0.35)',
  },
  low: {
    background: 'rgba(245, 158, 11, 0.2)',
    color: '#fbbf24',
    borderColor: 'rgba(245, 158, 11, 0.35)',
  },
  frequent: {
    background: 'rgba(124, 58, 237, 0.2)',
    color: '#c4b5fd',
    borderColor: 'rgba(124, 58, 237, 0.35)',
  },
};

export function SmartSuggestions({ suggestions = [], onAddSuggestion }: SmartSuggestionsProps) {
  if (suggestions.length === 0) {
    return (
      <div className="voxa-card">
        <div className="voxa-section-header">
          <div className="voxa-section-title">
            <span>✨</span> SMART SUGGESTIONS
          </div>
        </div>
        <p style={{ color: 'var(--text-secondary, #94a3b8)', fontSize: '0.875rem', margin: '0.5rem 0' }}>
          No overdue items right now. Your shopping is on track! 🎯
        </p>
      </div>
    );
  }

  return (
    <div className="voxa-card">
      <div className="voxa-section-header">
        <div className="voxa-section-title">
          <span>✨</span> SMART SUGGESTIONS
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary, #94a3b8)' }}>
          Based on your purchase history
        </span>
      </div>

      <div className="voxa-suggestions-grid">
        {suggestions.slice(0, 3).map(item => {
          const { reason, tag, tagStyle } = getSmartReason(item);
          const displayName = item.name.charAt(0).toUpperCase() + item.name.slice(1);
          const emoji = getItemEmoji(item.name, item.category);

          return (
            <div key={item.id} className="voxa-suggestion-card">
              <div className="voxa-suggestion-top">
                <span className="voxa-suggestion-icon">{emoji}</span>
                <div className="voxa-suggestion-info">
                  <span className="voxa-suggestion-name">{displayName}</span>
                  <span className="voxa-suggestion-reason">{reason}</span>
                </div>
              </div>
              <div className="voxa-suggestion-actions">
                <button
                  className="voxa-add-btn"
                  onClick={() => onAddSuggestion(item)}
                >
                  + Add
                </button>
                <span
                  className="voxa-tag-badge"
                  style={tagStyle}
                >
                  {tag}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
