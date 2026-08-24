import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import type { Product, Category } from '../../types';
import { CATEGORY_META } from '../../types';
import productCatalog from '../../data/productCatalog.json';
import { getItemEmoji } from '../../utils/itemDetails';
import './ProductSearch.css';

interface ProductSearchProps {
  onAddToList: (name: string, category?: Category, unit?: string) => void;
  externalQuery?: string;
  externalBrand?: string;
  externalMinPrice?: number;
  externalMaxPrice?: number;
  externalOrganicOnly?: boolean;
  externalNonce?: number;
}

function normalize(s: string) {
  return s.toLowerCase().replace(/\s+/g, ' ').trim();
}

const BRANDS = Array.from(
  new Set((productCatalog as Product[]).map(p => p.brand))
).sort();

export function ProductSearch({
  onAddToList,
  externalQuery,
  externalBrand,
  externalMinPrice,
  externalMaxPrice,
  externalOrganicOnly,
  externalNonce,
}: ProductSearchProps) {
  const [query, setQuery] = useState(externalQuery || '');
  const [debouncedQuery, setDebouncedQuery] = useState(externalQuery || '');
  const [selectedBrand, setSelectedBrand] = useState<string>(externalBrand || '');
  const [minPrice, setMinPrice] = useState<number | undefined>(externalMinPrice);
  const [maxPrice, setMaxPrice] = useState<number | undefined>(externalMaxPrice);
  const [organicOnly, setOrganicOnly] = useState<boolean>(!!externalOrganicOnly);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync external filters from voice commands (using externalNonce to trigger re-sync every command)
  useEffect(() => {
    if (externalNonce !== undefined) {
      if (externalQuery !== undefined) {
        setQuery(externalQuery);
        setDebouncedQuery(externalQuery);
      }
      if (externalBrand !== undefined) {
        setSelectedBrand(externalBrand);
      }
      setMinPrice(externalMinPrice);
      setMaxPrice(externalMaxPrice);
      setOrganicOnly(!!externalOrganicOnly);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalNonce]);

  const handleQueryChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedQuery(val), 250);
  }, []);

  const clearAllFilters = useCallback(() => {
    setQuery('');
    setDebouncedQuery('');
    setSelectedBrand('');
    setMinPrice(undefined);
    setMaxPrice(undefined);
    setOrganicOnly(false);
    setInStockOnly(false);
    setSelectedCategory('');
  }, []);

  // Filter matching products
  const filteredProducts = useMemo(() => {
    const q = normalize(debouncedQuery);

    return (productCatalog as Product[]).filter(product => {
      // 1. Min / Max Price Filter
      if (minPrice !== undefined && product.price < minPrice) return false;
      if (maxPrice !== undefined && product.price > maxPrice) return false;

      // 2. Organic Filter
      if (organicOnly && !product.organic) return false;

      // 3. Availability / In Stock Filter
      if (inStockOnly && !product.availability) return false;

      // 4. Brand Filter
      if (selectedBrand && normalize(product.brand) !== normalize(selectedBrand)) return false;

      // 5. Category Filter
      if (selectedCategory && product.category !== selectedCategory) return false;

      // 6. Text Search Matching (Name, Brand, Category, Size)
      if (q) {
        const name = normalize(product.name);
        const brand = normalize(product.brand);
        const category = normalize(product.category);
        const size = normalize(product.size);

        if (name.includes(q) || brand.includes(q) || category.includes(q) || size.includes(q)) {
          return true;
        }

        const tokens = q.split(' ').filter(t => t.length > 1);
        const matchesAllTokens = tokens.every(
          t => name.includes(t) || brand.includes(t) || category.includes(t) || size.includes(t)
        );
        if (!matchesAllTokens) return false;
      }

      return true;
    });
  }, [debouncedQuery, selectedBrand, minPrice, maxPrice, organicOnly, inStockOnly, selectedCategory]);

  const handleAdd = useCallback(
    (product: Product) => {
      onAddToList(product.name, product.category, product.unit);
      setAddedIds(prev => new Set([...prev, product.id]));
      setTimeout(() => {
        setAddedIds(prev => {
          const next = new Set(prev);
          next.delete(product.id);
          return next;
        });
      }, 2000);
    },
    [onAddToList]
  );

  const hasActiveFilters =
    !!debouncedQuery ||
    !!selectedBrand ||
    minPrice !== undefined ||
    maxPrice !== undefined ||
    organicOnly ||
    inStockOnly ||
    !!selectedCategory;

  return (
    <section className="voxa-search-container" aria-label="Product Catalog and Search">

      {/* ── Search Input Bar ── */}
      <div className="voxa-search-bar">
        <svg className="voxa-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          id="product-search-input"
          type="search"
          className="voxa-search-input"
          placeholder='Search products (e.g. "organic apples", "Amul milk", "toothpaste")'
          value={query}
          onChange={handleQueryChange}
          autoComplete="off"
        />
        {query && (
          <button className="voxa-search-clear-btn" onClick={() => { setQuery(''); setDebouncedQuery(''); }}>
            ✕
          </button>
        )}
      </div>

      {/* ── Interpreted Filters Status Bar ── */}
      <div className="voxa-interpreted-bar">
        <div className="voxa-interpreted-title">
          <span>🎯 INTERPRETED FILTERS:</span>
        </div>
        <div className="voxa-filter-tags">
          <span className="voxa-filter-chip">
            <strong>Search:</strong> {debouncedQuery ? `"${debouncedQuery}"` : 'All Products'}
          </span>
          <span className="voxa-filter-chip">
            <strong>Brand:</strong> {selectedBrand || 'Any'}
          </span>
          <span className="voxa-filter-chip">
            <strong>Price:</strong>{' '}
            {minPrice !== undefined && maxPrice !== undefined
              ? `₹${minPrice} - ₹${maxPrice}`
              : maxPrice !== undefined
              ? `Under ₹${maxPrice}`
              : minPrice !== undefined
              ? `Above ₹${minPrice}`
              : 'Any Price'}
          </span>
          <span className="voxa-filter-chip">
            <strong>Organic:</strong> {organicOnly ? '🌿 Yes' : 'All'}
          </span>
          {selectedCategory && (
            <span className="voxa-filter-chip">
              <strong>Category:</strong> {selectedCategory}
            </span>
          )}
        </div>
        {hasActiveFilters && (
          <button className="voxa-reset-filters-btn" onClick={clearAllFilters}>
            Reset Filters ✕
          </button>
        )}
      </div>

      {/* ── Interactive Filter Controls ── */}
      <div className="voxa-controls-row">
        {/* Brand Dropdown */}
        <select
          className="voxa-select-control"
          value={selectedBrand}
          onChange={e => setSelectedBrand(e.target.value)}
        >
          <option value="">All Brands</option>
          {BRANDS.map(b => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>

        {/* Category Dropdown */}
        <select
          className="voxa-select-control"
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {Object.entries(CATEGORY_META).map(([catKey, meta]) => (
            <option key={catKey} value={catKey}>{meta.emoji} {meta.label}</option>
          ))}
        </select>

        {/* Price Preset Chips */}
        <button
          className={`voxa-chip-btn ${maxPrice === 100 ? 'active' : ''}`}
          onClick={() => setMaxPrice(p => p === 100 ? undefined : 100)}
        >
          Under ₹100
        </button>
        <button
          className={`voxa-chip-btn ${maxPrice === 300 ? 'active' : ''}`}
          onClick={() => setMaxPrice(p => p === 300 ? undefined : 300)}
        >
          Under ₹300
        </button>
        <button
          className={`voxa-chip-btn ${minPrice === 200 ? 'active' : ''}`}
          onClick={() => setMinPrice(p => p === 200 ? undefined : 200)}
        >
          Above ₹200
        </button>

        {/* Organic Toggle */}
        <button
          className={`voxa-chip-btn ${organicOnly ? 'active-organic' : ''}`}
          onClick={() => setOrganicOnly(o => !o)}
        >
          🌿 Organic Only
        </button>

        {/* In-Stock Toggle */}
        <button
          className={`voxa-chip-btn ${inStockOnly ? 'active-stock' : ''}`}
          onClick={() => setInStockOnly(s => !s)}
        >
          ✓ In-Stock Only
        </button>
      </div>

      {/* ── Product Grid ── */}
      {filteredProducts.length > 0 ? (
        <div className="voxa-product-grid">
          {filteredProducts.map(product => {
            const meta = CATEGORY_META[product.category];
            const emoji = getItemEmoji(product.name, product.category);
            const isAdded = addedIds.has(product.id);

            return (
              <div key={product.id} className="voxa-product-card">
                <div className="voxa-product-top">
                  <span className="voxa-product-emoji">{emoji}</span>
                  <div className="voxa-product-badges">
                    <span className="voxa-cat-badge" style={{ color: meta.color }}>
                      {meta.label}
                    </span>
                    {product.organic && (
                      <span className="voxa-organic-badge">🌿 Organic</span>
                    )}
                  </div>
                </div>

                <div className="voxa-product-body">
                  <h4 className="voxa-product-title">{product.name}</h4>
                  <div className="voxa-product-brand-line">
                    <span className="voxa-brand-tag">{product.brand}</span>
                    <span className="voxa-size-tag">{product.size}</span>
                  </div>
                </div>

                <div className="voxa-product-footer">
                  <div className="voxa-product-price-box">
                    <span className="voxa-product-price">₹{product.price.toFixed(2)}</span>
                    <span className={`voxa-stock-status ${product.availability ? 'in-stock' : 'out-stock'}`}>
                      {product.availability ? '✓ In Stock' : '✗ Out of Stock'}
                    </span>
                  </div>

                  <button
                    className={`voxa-product-add-btn ${isAdded ? 'added' : ''}`}
                    onClick={() => handleAdd(product)}
                    disabled={!product.availability || isAdded}
                  >
                    {isAdded ? '✓ Added' : '+ Add to list'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ── Empty State ── */
        <div className="voxa-search-empty">
          <div className="voxa-empty-icon">🔍</div>
          <h3 className="voxa-empty-title">No matching products found</h3>
          <p className="voxa-empty-sub">
            We couldn't find any products matching your current filters.
          </p>
          <div className="voxa-empty-actions">
            <button className="voxa-add-btn" onClick={clearAllFilters}>
              Reset All Filters
            </button>
            {maxPrice !== undefined && (
              <button className="voxa-pill-btn" onClick={() => setMaxPrice(undefined)}>
                Clear Max Price (₹{maxPrice})
              </button>
            )}
            {organicOnly && (
              <button className="voxa-pill-btn" onClick={() => setOrganicOnly(false)}>
                Clear Organic Filter
              </button>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
