import { useEffect, useState } from 'react';
import './ActionFeedback.css';

export type FeedbackAction = 'add' | 'remove' | null;

export interface ActionFeedbackProps {
  action: FeedbackAction;
  itemName: string | null;
  quantity?: number;
  unit?: string;
  category?: string;
  categoryEmoji?: string;
  onDone?: () => void;
}

export function ActionFeedback({
  action, itemName, quantity, unit, category, categoryEmoji, onDone,
}: ActionFeedbackProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!action || !itemName) return;
    setVisible(true);
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(() => onDone?.(), 350);
    }, 2200);
    return () => clearTimeout(t);
  }, [action, itemName, onDone]);

  if (!action || !itemName) return null;

  const isAdd = action === 'add';
  const displayName = itemName.charAt(0).toUpperCase() + itemName.slice(1);
  const qtyText = quantity && quantity > 1
    ? `${quantity}${unit ? ' ' + unit : ''} × `
    : '';

  return (
    <div
      className={`action-fb action-fb--${action} ${visible ? 'action-fb--in' : 'action-fb--out'}`}
      role="status"
      aria-live="polite"
    >
      <span className="action-fb__icon">{isAdd ? '✓' : '✕'}</span>
      <div className="action-fb__body">
        <span className="action-fb__verb">{isAdd ? 'Added' : 'Removed'}</span>
        <span className="action-fb__item">
          {qtyText}{displayName}
        </span>
        {isAdd && category && (
          <span className="action-fb__cat">{categoryEmoji} {category}</span>
        )}
      </div>
    </div>
  );
}
