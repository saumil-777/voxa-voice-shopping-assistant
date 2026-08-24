import { getCurrentSeasonalItems, getCurrentSeason } from '../../data/seasonalData';

interface SeasonalSuggestionsProps {
  onAddItem: (name: string) => void;
}

export function SeasonalSuggestions({ onAddItem }: SeasonalSuggestionsProps) {
  const seasonalItems = getCurrentSeasonalItems().slice(0, 3);
  const season = getCurrentSeason();

  if (seasonalItems.length === 0) return null;

  return (
    <div className="voxa-card">
      <div className="voxa-section-header">
        <div className="voxa-section-title">
          <span>🌱</span> SEASONAL PICKS & RECOMMENDATIONS
        </div>
        <span className="voxa-tag-badge">
          {season.emoji} {season.name} Season
        </span>
      </div>

      <div className="voxa-suggestions-grid">
        {seasonalItems.map(item => (
          <div key={item.id} className="voxa-suggestion-card">
            <div className="voxa-suggestion-top">
              <span className="voxa-suggestion-icon">{item.emoji}</span>
              <div className="voxa-suggestion-info">
                <span className="voxa-suggestion-name">
                  {item.name.charAt(0).toUpperCase() + item.name.slice(1)}
                </span>
                <span className="voxa-suggestion-reason">{item.reason}</span>
              </div>
            </div>
            <div className="voxa-suggestion-actions">
              <button
                className="voxa-add-btn"
                onClick={() => onAddItem(item.name)}
                aria-label={`Add seasonal item ${item.name}`}
              >
                + Add
              </button>
              <span className="voxa-tag-badge">In Season</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
