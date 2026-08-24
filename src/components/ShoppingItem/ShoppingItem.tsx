import type { ShoppingItem as ShoppingItemType } from '../../types';
import { getItemSubDetail, getItemEmoji } from '../../utils/itemDetails';

interface ShoppingItemProps {
  item: ShoppingItemType;
  onRemove: (id: string) => void;
  onToggleChecked: (id: string) => void;
  onUpdateQuantity: (id: string, delta: number) => void;
}

export function ShoppingItem({
  item,
  onRemove,
  onToggleChecked,
  onUpdateQuantity,
}: ShoppingItemProps) {
  const displayName = item.name.charAt(0).toUpperCase() + item.name.slice(1);
  const subDetail = getItemSubDetail(item.name, item.unit);
  const emoji = getItemEmoji(item.name, item.category);

  return (
    <li className={`voxa-item-row ${item.checked ? 'completed' : ''}`}>
      {/* Left: Emoji + Title + Sub-detail */}
      <div className="voxa-item-left">
        <span className="voxa-item-emoji">{emoji}</span>
        <div className="voxa-item-details">
          <span className="voxa-item-title">{displayName}</span>
          <span className="voxa-item-sub">{subDetail}</span>
        </div>
      </div>

      {/* Right: Stepper + Checkbox + Delete */}
      <div className="voxa-item-right">
        {/* Stepper [-] N [+] */}
        <div className="voxa-stepper">
          <button
            className="voxa-stepper-btn"
            onClick={() => onUpdateQuantity(item.id, -1)}
            aria-label={`Decrease ${item.name}`}
          >
            −
          </button>
          <span className="voxa-stepper-val">{item.quantity}</span>
          <button
            className="voxa-stepper-btn"
            onClick={() => onUpdateQuantity(item.id, 1)}
            aria-label={`Increase ${item.name}`}
          >
            +
          </button>
        </div>

        {/* Checkmark circle toggle */}
        <button
          className={`voxa-check-btn ${item.checked ? 'checked' : ''}`}
          onClick={() => onToggleChecked(item.id)}
          aria-label={item.checked ? `Uncheck ${item.name}` : `Check ${item.name}`}
        >
          ✓
        </button>

        {/* Delete button */}
        <button
          style={{ color: 'var(--text-muted)', fontSize: '0.9rem', opacity: 0.6, marginLeft: '0.25rem' }}
          onClick={() => onRemove(item.id)}
          aria-label={`Remove ${item.name}`}
        >
          ✕
        </button>
      </div>
    </li>
  );
}
