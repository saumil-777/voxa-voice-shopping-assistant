import type { SupportedLanguage } from '../../types';
import { LANGUAGE_META } from '../../types';
import './LanguageSelector.css';

interface LanguageSelectorProps {
  currentLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
}

export function LanguageSelector({ currentLanguage, onLanguageChange }: LanguageSelectorProps) {
  return (
    <div className="language-selector">
      <select
        className="language-selector__select"
        value={currentLanguage}
        onChange={e => onLanguageChange(e.target.value as SupportedLanguage)}
        aria-label="Select voice command language"
      >
        {Object.entries(LANGUAGE_META).map(([code, meta]) => (
          <option key={code} value={code} style={{ background: '#0e0e1a', color: '#f0eeff' }}>
            {meta.flag} {meta.label}
          </option>
        ))}
      </select>
      <span className="language-selector__arrow">▾</span>
    </div>
  );
}
