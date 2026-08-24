import { useCallback, useEffect, useRef, useState } from 'react';
import { ToastProvider, useToast } from './context/ToastContext';
import { useVoiceRecognition } from './hooks/useVoiceRecognition';
import { useShoppingList } from './hooks/useShoppingList';
import { parseIntent } from './utils/intentParser';
import { preprocessMultilingual } from './data/multilingualMap';
import { getSubstitutes } from './data/substituteMap';
import { VoiceInput } from './components/VoiceInput/VoiceInput';
import { LanguageSelector } from './components/LanguageSelector/LanguageSelector';
import { ShoppingList } from './components/ShoppingList/ShoppingList';
import { SmartSuggestions } from './components/SmartSuggestions/SmartSuggestions';
import { SeasonalSuggestions } from './components/SeasonalSuggestions/SeasonalSuggestions';
import { ProductSearch } from './components/ProductSearch/ProductSearch';
import { ToastContainer } from './components/Toast/Toast';
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary';
import { ActionFeedback } from './components/ActionFeedback/ActionFeedback';
import type { FeedbackAction } from './components/ActionFeedback/ActionFeedback';
import type { CommandResult, PurchaseHistoryItem, SupportedLanguage } from './types';
import { CATEGORY_META } from './types';
import { SubstitutePanel } from './components/SubstitutePanel/SubstitutePanel';
import voxaBasketImg from './assets/voxa_grocery_basket.png';
import './index.css';

interface FeedbackState {
  key: number;
  action: FeedbackAction;
  itemName: string | null;
  quantity?: number;
  unit?: string;
  category?: string;
  categoryEmoji?: string;
}

type TabType = 'home' | 'list' | 'search' | 'suggestions' | 'history' | 'settings';

function AppInner() {
  const { addToast } = useToast();
  const feedbackKey = useRef(0);

  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(() => {
    try {
      const saved = window.localStorage.getItem('voxa_language');
      if (saved) return saved as SupportedLanguage;
    } catch {}
    // Prefer navigator.language if available and matches our options
    const nav = typeof navigator !== 'undefined' ? navigator.language : 'en-IN';
    const allowed: SupportedLanguage[] = ['en-IN', 'hi-IN', 'ta-IN', 'te-IN', 'bn-IN'];
    if (nav && allowed.includes(nav as SupportedLanguage)) return nav as SupportedLanguage;
    return 'en-IN';
  });
  
  const [searchOpen, setSearchOpen] = useState(false);
  const [externalSearch, setExternalSearch] = useState<{
    query?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    organicOnly?: boolean;
    nonce: number;
  } | undefined>(undefined);

  const [commandResult, setCommandResult] = useState<CommandResult | null>(null);
  
  // Bottom input text state
  const [bottomInputText, setBottomInputText] = useState('');
  const bottomInputRef = useRef<HTMLInputElement>(null);

  const [feedback, setFeedback] = useState<FeedbackState>({
    key: 0, action: null, itemName: null,
  });

  const {
    items, lastAddedSubstitutes, lastAddedItemName, suggestions,
    addItem, removeItem, removeItemByName, toggleChecked,
    updateQuantity, setQuantityByName, clearChecked, clearSubstitutes, showSubstitutes,
  } = useShoppingList();

  // Toggle Theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const showFeedback = useCallback((
    action: FeedbackAction,
    itemName: string,
    quantity?: number,
    unit?: string,
    category?: string,
    categoryEmoji?: string,
  ) => {
    feedbackKey.current += 1;
    setFeedback({ key: feedbackKey.current, action, itemName, quantity, unit, category, categoryEmoji });
  }, []);

  const handleVoiceResult = useCallback((rawTranscript: string) => {
    const transcript = preprocessMultilingual(rawTranscript, currentLanguage);
    const intent = parseIntent(transcript);

    if (intent.action === 'add') {
      if (!intent.itemName) {
         const examples: Record<string, string> = {
           'en-IN': "Try: Add 2 bottles of water",
           'hi-IN': 'उदाहरण: 2 पैकेट दूध जोड़ें',
           'ta-IN': 'உதாரணம்: 2 பால் பாக்கெட்டுகளை சேர்க்கவும்',
           'te-IN': 'ఉదాహరణ: 2 ప్యాకెట్ల పాలు జోడించండి',
           'bn-IN': 'উদাহরণ: ২ প্যাকেট দুধ যোগ করুন',
         };
         const ex = examples[currentLanguage] || examples['en-IN'];
         setCommandResult({ transcript: rawTranscript, message: "I couldn't understand that.", success: false });
         addToast(ex, 'info');
        return;
      }
      const added = addItem(intent.itemName, intent.quantity, intent.unit);
      if (added) {
        const meta = CATEGORY_META[added.category];
        const qtyStr = intent.quantity > 1 ? `${intent.quantity} ` : '';
        const unitStr = intent.unit ? `${intent.unit} ` : '';
        const msg = `Added ${qtyStr}${unitStr}${intent.itemName}`;
        setCommandResult({ transcript: rawTranscript, message: msg, success: true });
        showFeedback('add', intent.itemName, intent.quantity, intent.unit, meta.label, meta.emoji);
      }
    } else if (intent.action === 'remove') {
      if (!intent.itemName) {
        setCommandResult({ transcript: rawTranscript, message: "Couldn't understand what to remove.", success: false });
        addToast("Couldn't understand what to remove.", 'warning');
        return;
      }
      const removed = removeItemByName(intent.itemName);
      if (removed) {
        const msg = `Removed ${intent.itemName} from your list`;
        setCommandResult({ transcript: rawTranscript, message: msg, success: true });
        showFeedback('remove', intent.itemName);
      } else {
        const msg = `"${intent.itemName}" wasn't on your list`;
        setCommandResult({ transcript: rawTranscript, message: msg, success: false });
        addToast(msg, 'warning');
      }
    } else if (intent.action === 'update-quantity') {
      if (!intent.itemName) {
        setCommandResult({ transcript: rawTranscript, message: "Couldn't understand which item to update.", success: false });
        addToast("Couldn't understand which item to update.", 'warning');
        return;
      }
      const updated = setQuantityByName(intent.itemName, intent.quantity);
      if (updated) {
        const msg = `Updated ${intent.itemName} quantity to ${intent.quantity}`;
        setCommandResult({ transcript: rawTranscript, message: msg, success: true });
        addToast(msg, 'success');
      } else {
        const msg = `"${intent.itemName}" isn't on your list. Add it first.`;
        setCommandResult({ transcript: rawTranscript, message: msg, success: false });
        addToast(msg, 'warning');
      }
    } else if (intent.action === 'substitute') {
      const subs = getSubstitutes(intent.itemName);
      if (subs.length > 0) {
        showSubstitutes(intent.itemName, subs);
        const msg = `Alternatives for "${intent.itemName}": ${subs.slice(0, 3).join(', ')}`;
        setCommandResult({ transcript: rawTranscript, message: msg, success: true });
        addToast(`Showing alternatives for "${intent.itemName}"`, 'info');
      } else {
        const msg = `No direct substitutes found for "${intent.itemName}". Try searching in catalog.`;
        setCommandResult({ transcript: rawTranscript, message: msg, success: false });
        addToast(msg, 'warning');
      }
    } else if (intent.action === 'search') {
      setSearchOpen(true);
      setActiveTab('search');
      const isOrganic = (intent.attributes && intent.attributes.includes('organic')) || intent.raw.toLowerCase().includes('organic');
      setExternalSearch({
        query: intent.itemName,
        brand: intent.brand,
        minPrice: intent.minPrice,
        maxPrice: intent.maxPrice,
        organicOnly: isOrganic,
        nonce: Date.now(),
      });
      const currSymbol = currency === 'INR' ? '₹' : '$';
      const priceStr = intent.maxPrice ? ` under ${currSymbol}${intent.maxPrice}` : intent.minPrice ? ` above ${currSymbol}${intent.minPrice}` : '';
      const brandStr = intent.brand ? ` (${intent.brand})` : '';
      const orgStr = isOrganic ? ' (Organic)' : '';
      const msg = `Searching for "${intent.itemName}"${brandStr}${orgStr}${priceStr}`;
      setCommandResult({ transcript: rawTranscript, message: msg, success: true });
      addToast(msg, 'info');
    } else {
      const msg = "Try saying: 'add 2 bottles of water' or 'remove bread'";
      setCommandResult({ transcript: rawTranscript, message: "I couldn't understand that. Try saying 'Add milk'.", success: false });
      addToast(msg, 'info');
    }
  }, [currentLanguage, addItem, removeItemByName, setQuantityByName, showSubstitutes, addToast, showFeedback, currency]);

  const handleManualSubmit = useCallback((text: string) => {
    handleVoiceResult(text);
  }, [handleVoiceResult]);

  const { transcript, interimTranscript, lastTranscript, state, errorMessage, isSupported, start, stop } =
    useVoiceRecognition({ onResult: handleVoiceResult, lang: currentLanguage });

  useEffect(() => {
    if (state === 'listening') setCommandResult(null);
  }, [state]);

  const handleAddSuggestion = useCallback((item: PurchaseHistoryItem) => {
    const added = addItem(item.name, item.typicalQuantity, item.unit);
    if (added) {
      const meta = CATEGORY_META[added.category];
      showFeedback('add', item.name, item.typicalQuantity, item.unit, meta.label, meta.emoji);
    }
  }, [addItem, showFeedback]);

  const handleAddByName = useCallback((name: string) => {
    const added = addItem(name);
    if (added) {
      const meta = CATEGORY_META[added.category];
      showFeedback('add', name, 1, undefined, meta.label, meta.emoji);
    }
  }, [addItem, showFeedback]);

  const handleSwapSubstitute = useCallback((substitute: string) => {
    // Only remove the original item if it's actually on the shopping list
    // (voice-triggered substitute commands don't add the original first)
    if (lastAddedItemName) {
      const isOnList = items.some(
        i => i.name.toLowerCase() === lastAddedItemName.toLowerCase()
      );
      if (isOnList) removeItemByName(lastAddedItemName);
    }
    // Clear substitute state first so addItem doesn't re-trigger the panel
    clearSubstitutes();
    const added = addItem(substitute);
    if (added) {
      const meta = CATEGORY_META[added.category];
      showFeedback('add', substitute, 1, undefined, meta.label, meta.emoji);
      addToast(`Added "${substitute}" to your list`, 'success');
    }
  }, [lastAddedItemName, items, removeItemByName, clearSubstitutes, addItem, showFeedback, addToast]);

  const handleBottomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bottomInputText.trim()) return;
    handleManualSubmit(bottomInputText.trim());
    setBottomInputText('');
  };

  const handleMicClick = () => {
    if (!isSupported) return;
    state === 'listening' ? stop() : start();
  };

  return (
    <div className="voxa-container">
      {/* Background Orbs */}
      <div className="voxa-bg-glow" aria-hidden="true">
        <div className="voxa-orb voxa-orb-1" />
        <div className="voxa-orb voxa-orb-2" />
      </div>

      {/* ── HEADER ── */}
      <header className="voxa-header">
        {/* Brand */}
        <div className="voxa-brand">
          <div className="voxa-logo-mark">
            <span className="voxa-logo-bar voxa-logo-bar-1" />
            <span className="voxa-logo-bar voxa-logo-bar-2" />
            <span className="voxa-logo-bar voxa-logo-bar-3" />
            <span className="voxa-logo-bar voxa-logo-bar-4" />
            <span className="voxa-logo-bar voxa-logo-bar-5" />
          </div>
          <div className="voxa-brand-text">
            <span className="voxa-title">VOXA</span>
            <span className="voxa-subtitle">Your intelligent shopping companion</span>
          </div>
        </div>

        {/* Controls Pill */}
        <div className="voxa-header-controls">
          {/* Language Selector Pill */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <LanguageSelector
              currentLanguage={currentLanguage}
              onLanguageChange={(lang) => {
                setCurrentLanguage(lang);
                try { window.localStorage.setItem('voxa_language', lang); } catch {}
              }}
            />
          </div>

          {/* Currency Selector Pill */}
          <button
            className="voxa-pill-btn"
            onClick={() => setCurrency(c => c === 'INR' ? 'USD' : 'INR')}
          >
            <span>{currency === 'INR' ? '₹' : '$'}</span>
            <span>{currency}</span>
            <span style={{ fontSize: '0.65rem', opacity: 0.7 }}>▾</span>
          </button>

          {/* Theme Toggle */}
          <button
            className="voxa-icon-btn"
            onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle Theme"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          {/* development-only UI removed for production submission */}
        </div>
      </header>

      {/* ── SIDEBAR NAVIGATION ── */}
      <aside className="voxa-sidebar">
        <ul className="voxa-nav-list">
          <li>
            <button
              className={`voxa-nav-item ${activeTab === 'home' ? 'active' : ''}`}
              onClick={() => setActiveTab('home')}
            >
              <span className="voxa-nav-icon">🏠</span>
              <span>Home</span>
            </button>
          </li>
          <li>
            <button
              className={`voxa-nav-item ${activeTab === 'list' ? 'active' : ''}`}
              onClick={() => setActiveTab('list')}
            >
              <span className="voxa-nav-icon">🛒</span>
              <span>Your List</span>
            </button>
          </li>
          <li>
            <button
              className={`voxa-nav-item ${activeTab === 'search' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('search');
                setSearchOpen(true);
              }}
            >
              <span className="voxa-nav-icon">🔍</span>
              <span>Search</span>
            </button>
          </li>
          <li>
            <button
              className={`voxa-nav-item ${activeTab === 'suggestions' ? 'active' : ''}`}
              onClick={() => setActiveTab('suggestions')}
            >
              <span className="voxa-nav-icon">✨</span>
              <span>Suggestions</span>
            </button>
          </li>
          <li>
            <button
              className={`voxa-nav-item ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              <span className="voxa-nav-icon">🕒</span>
              <span>History</span>
            </button>
          </li>
          <li>
            <button
              className={`voxa-nav-item ${activeTab === 'settings' ? 'active' : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              <span className="voxa-nav-icon">⚙️</span>
              <span>Settings</span>
            </button>
          </li>
        </ul>

        {/* Sidebar Footer Widgets */}
        <div className="voxa-sidebar-footer">
          {/* Streak Card */}
          <div className="voxa-streak-card">
            <span className="voxa-streak-header">Shopping Streak 🔥</span>
            <div className="voxa-streak-val">
              7 <span>days</span>
            </div>
            <span className="voxa-streak-sub">Great job!</span>
          </div>

          {/* Quick Language Dropdown */}
          <div style={{ width: '100%' }}>
            <LanguageSelector
              currentLanguage={currentLanguage}
              onLanguageChange={(lang) => { setCurrentLanguage(lang); try { window.localStorage.setItem('voxa_language', lang); } catch {} }}
            />
          </div>

          {/* User Profile Box */}
          <div className="voxa-user-widget">
            <div className="voxa-user-avatar">S</div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span className="voxa-user-name">VOXA User</span>
                <span className="voxa-user-badge">👑 Premium</span>
              </div>
          </div>
        </div>
      </aside>

      {/* ── MAIN DASHBOARD ── */}
      <main className="voxa-main" id="main-content">

        {/* Top Greeting Banner */}
        <div className="voxa-card voxa-greeting-card">
          <div className="voxa-greeting-content">
            <h1 className="voxa-greeting-title">Good morning 👋</h1>
            <p className="voxa-greeting-sub">
              You usually buy milk around now.<br />
              Need anything else?
            </p>
          </div>
          <div className="voxa-greeting-graphic">
            <img src={voxaBasketImg} alt="Grocery Basket" className="voxa-greeting-img" />
          </div>
        </div>

        {/* Real-time Action Feedback Overlay */}
        {feedback.action && (
          <ActionFeedback
            key={feedback.key}
            action={feedback.action}
            itemName={feedback.itemName}
            quantity={feedback.quantity}
            unit={feedback.unit}
            category={feedback.category}
            categoryEmoji={feedback.categoryEmoji}
            onDone={() => setFeedback(f => ({ ...f, action: null, itemName: null }))}
          />
        )}

        {/* Voice Assistant Center Card */}
        <VoiceInput
          voiceState={state}
          transcript={transcript}
          interimTranscript={interimTranscript}
          lastTranscript={lastTranscript}
          errorMessage={errorMessage}
          isSupported={isSupported}
          onStart={start}
          onStop={stop}
          commandResult={commandResult}
          language={currentLanguage}
        />

        {/* Substitute panel */}
        {lastAddedSubstitutes.length > 0 && lastAddedItemName && (
          <div className="voxa-card" style={{ padding: '1rem' }}>
            <SubstitutePanel
              itemName={lastAddedItemName}
              substitutes={lastAddedSubstitutes}
              onSwap={handleSwapSubstitute}
              onDismiss={clearSubstitutes}
            />
          </div>
        )}

        {/* Smart Suggestions Section */}
        {(activeTab === 'home' || activeTab === 'suggestions') && (
          <>
            <SmartSuggestions
              suggestions={suggestions}
              onAddSuggestion={handleAddSuggestion}
              onAddByName={handleAddByName}
            />
            <SeasonalSuggestions onAddItem={handleAddByName} />
          </>
        )}

        {/* Shopping List Section */}
        {(activeTab === 'home' || activeTab === 'list') && (
          <ShoppingList
            items={items}
            onRemove={removeItem}
            onToggleChecked={toggleChecked}
            onUpdateQuantity={updateQuantity}
            onClearChecked={clearChecked}
            onFocusManualInput={() => bottomInputRef.current?.focus()}
          />
        )}

        {/* Product Catalog & Search Section */}
        {(searchOpen || activeTab === 'search') && (
          <div className="voxa-card">
            <div className="voxa-section-header">
              <div className="voxa-section-title">
                <span>🔍</span> PRODUCT CATALOG & SEARCH
              </div>
            </div>
            <ProductSearch
              onAddToList={handleAddByName}
              externalQuery={externalSearch?.query}
              externalBrand={externalSearch?.brand}
              externalMinPrice={externalSearch?.minPrice}
              externalMaxPrice={externalSearch?.maxPrice}
              externalOrganicOnly={externalSearch?.organicOnly}
              externalNonce={externalSearch?.nonce}
            />
          </div>
        )}

        {/* History Tab View */}
        {activeTab === 'history' && (
          <div className="voxa-card">
            <div className="voxa-section-header">
              <div className="voxa-section-title"><span>🕒</span> PURCHASE HISTORY</div>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Items tracked from your shopping patterns:
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '1rem' }}>
              {suggestions.length > 0 ? suggestions.map(s => (
                <div key={s.id} className="voxa-item-row">
                  <div className="voxa-item-left">
                    <span className="voxa-item-title">{s.name.charAt(0).toUpperCase() + s.name.slice(1)}</span>
                    <span className="voxa-item-sub">
                      Every ~{s.purchaseIntervalDays} days · Last bought {s.lastPurchasedDaysAgo} days ago
                    </span>
                  </div>
                  <button className="voxa-add-btn" onClick={() => handleAddSuggestion(s)}>
                    + Re-add
                  </button>
                </div>
              )) : (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                  All items are up to date. Nothing overdue! 🎉
                </p>
              )}
            </div>
          </div>
        )}

        {/* Settings Tab View */}
        {activeTab === 'settings' && (
          <div className="voxa-card">
            <div className="voxa-section-header">
              <div className="voxa-section-title"><span>⚙️</span> VOXA SETTINGS</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Voice Language</span>
                <select
                  value={currentLanguage}
                  onChange={e => {
                    const v = e.target.value as SupportedLanguage;
                    setCurrentLanguage(v);
                    try { window.localStorage.setItem('voxa_language', v); } catch {}
                  }}
                  style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid var(--border-violet)', padding: '0.4rem 0.8rem', borderRadius: 'var(--r-sm)' }}
                >
                  <option value="en-IN">English (India)</option>
                  <option value="hi-IN">हिन्दी (Hindi)</option>
                  <option value="ta-IN">தமிழ் (Tamil)</option>
                  <option value="te-IN">తెలుగు (Telugu)</option>
                  <option value="bn-IN">বাংলা (Bengali)</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Currency Symbol</span>
                <select
                  value={currency}
                  onChange={e => setCurrency(e.target.value as ('INR' | 'USD'))}
                  style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid var(--border-violet)', padding: '0.4rem 0.8rem', borderRadius: 'var(--r-sm)' }}
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                </select>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ── PERSISTENT BOTTOM VOICE INPUT BAR ── */}
      <div className="voxa-bottom-bar">
        <form className="voxa-bottom-input-card" onSubmit={handleBottomSubmit}>
          {/* Mic Button */}
          <button
            type="button"
            className="voxa-bottom-mic-btn"
            onClick={handleMicClick}
            aria-label="Voice command"
          >
            {state === 'listening' ? '⏹' : '🎙'}
          </button>

          {/* Text Input */}
          <input
            ref={bottomInputRef}
            type="text"
            className="voxa-bottom-input"
            placeholder='Ask anything... e.g., "Add 2 bottles of water"'
            value={bottomInputText}
            onChange={e => setBottomInputText(e.target.value)}
          />

          {/* Submit Send Button */}
          <button
            type="submit"
            className="voxa-bottom-send-btn"
            disabled={!bottomInputText.trim()}
            aria-label="Send command"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="22" y1="2" x2="11" y2="13"/>
              <polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </form>
      </div>

      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AppInner />
      </ToastProvider>
    </ErrorBoundary>
  );
}
