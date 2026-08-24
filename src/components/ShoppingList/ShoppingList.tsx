import { useState } from 'react';
import type { ShoppingItem as ShoppingItemType } from '../../types';
import { ShoppingItem } from '../ShoppingItem/ShoppingItem';

interface ShoppingListProps {
  items: ShoppingItemType[];
  onRemove: (id: string) => void;
  onToggleChecked: (id: string) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
  onClearChecked: () => void;
  onFocusManualInput?: () => void;
}

export function ShoppingList({
  items,
  onRemove,
  onToggleChecked,
  onUpdateQuantity,
  onClearChecked,
  onFocusManualInput,
}: ShoppingListProps) {
  const [showMenu, setShowMenu] = useState(false);

  const unchecked = items.filter(i => !i.checked);
  const checked = items.filter(i => i.checked);
  const totalCount = items.length;

  return (
    <div className="voxa-card voxa-list-card">
      {/* List Header */}
      <div className="voxa-list-header">
        <div className="voxa-section-title">
          <span>🛒</span> YOUR LIST
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', position: 'relative' }}>
          <span className="voxa-count-badge">{totalCount} ITEMS</span>
          <button
            className="voxa-icon-btn"
            style={{ width: '32px', height: '32px', fontSize: '0.85rem' }}
            onClick={() => setShowMenu(m => !m)}
            aria-label="List options"
          >
            •••
          </button>
          {showMenu && (
            <div
              style={{
                position: 'absolute',
                top: '40px',
                right: '0',
                background: 'rgba(20, 18, 38, 0.95)',
                border: '1px solid var(--border-violet)',
                borderRadius: 'var(--r-md)',
                padding: '0.5rem',
                zIndex: 50,
                boxShadow: 'var(--shadow-card)',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem',
                minWidth: '130px',
              }}
            >
              <button
                style={{
                  fontSize: '0.75rem',
                  padding: '0.4rem 0.6rem',
                  textAlign: 'left',
                  color: 'var(--text-secondary)',
                  borderRadius: 'var(--r-sm)',
                }}
                onClick={() => {
                  onClearChecked();
                  setShowMenu(false);
                }}
              >
                Clear checked ({checked.length})
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Empty State */}
      {items.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🛒</div>
          <p style={{ fontWeight: 700, color: '#ffffff', fontSize: '1.1rem' }}>Your list is empty</p>
          <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
            Speak or type to add items to your list.
          </p>
        </div>
      ) : (
        <ul className="voxa-item-rows">
          {/* Unchecked items first */}
          {unchecked.map(item => (
            <ShoppingItem
              key={item.id}
              item={item}
              onRemove={onRemove}
              onToggleChecked={onToggleChecked}
              onUpdateQuantity={onUpdateQuantity}
            />
          ))}
          {/* Checked items below */}
          {checked.map(item => (
            <ShoppingItem
              key={item.id}
              item={item}
              onRemove={onRemove}
              onToggleChecked={onToggleChecked}
              onUpdateQuantity={onUpdateQuantity}
            />
          ))}
        </ul>
      )}

      {/* Add Item Manually Button */}
      <button className="voxa-add-manual-btn" onClick={onFocusManualInput}>
        <span>+</span> Add item manually
      </button>
    </div>
  );
}
