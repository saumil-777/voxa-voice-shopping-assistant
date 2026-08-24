import { useEffect, useRef } from 'react';
import './SubstitutePanel.css';

interface SubstitutePanelProps {
  itemName: string;
  substitutes: string[];
  isUnavailable?: boolean;
  onSwap: (substitute: string) => void;
  onDismiss: () => void;
}

export function SubstitutePanel({
  itemName,
  substitutes,
  isUnavailable = false,
  onSwap,
  onDismiss,
}: SubstitutePanelProps) {
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // Keep visible longer if unavailable message
    dismissTimer.current = setTimeout(onDismiss, isUnavailable ? 10000 : 8000);
    return () => {
      if (dismissTimer.current) clearTimeout(dismissTimer.current);
    };
  }, [onDismiss, isUnavailable]);

  const displayName = itemName.charAt(0).toUpperCase() + itemName.slice(1);

  if (substitutes.length === 0) return null;

  return (
    <div className="substitute-panel" role="complementary" aria-label="Substitute suggestions">
      <div className="substitute-panel__header">
        <div className="substitute-panel__header-left">
          <span className="substitute-panel__icon">{isUnavailable ? '⚠️' : '🔄'}</span>
          <div>
            <p className="substitute-panel__title">
              {isUnavailable
                ? `${displayName} is currently unavailable.`
                : `Alternatives for ${displayName}`}
            </p>
            <p className="substitute-panel__sub">Try these alternatives:</p>
          </div>
        </div>
        <button className="substitute-panel__close" onClick={onDismiss} aria-label="Dismiss">×</button>
      </div>

      <div className="substitute-panel__options">
        {substitutes.map(sub => (
          <button
            key={sub}
            className="substitute-panel__option"
            onClick={() => { onSwap(sub); onDismiss(); }}
          >
            <span className="substitute-panel__option-name">
              {sub.charAt(0).toUpperCase() + sub.slice(1)}
            </span>
            <span className="substitute-panel__swap">+ Add substitute</span>
          </button>
        ))}
      </div>

      <div className="substitute-panel__bar">
        <div className="substitute-panel__bar-fill" />
      </div>
    </div>
  );
}
