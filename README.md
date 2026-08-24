# VOXA — Voice Command Shopping Assistant

VOXA is a voice-first shopping assistant implemented as a client-side React + TypeScript application. It demonstrates a production-oriented, assessment-ready implementation of natural-language voice and typed commands to manage a shopping list, discover products from a local catalog, and receive smart and seasonal suggestions.

## Live Demo

Try VOXA here:

👉 https://voxa-shopping-assistant.web.app

> For the best voice-command experience, use Google Chrome and allow microphone access when prompted.
## Project overview

Problem: Managing shopping lists and finding products can be time-consuming while multitasking (cooking, commuting). Voice-first interactions reduce friction by letting users speak simple commands to add, remove, or update items and perform quick product searches without interrupting their flow.

What VOXA does:
- Accepts voice or typed commands and normalizes them to a single command-processing pipeline.
- Supports add/remove/update shopping-list operations with quantity and unit handling.
- Searches a static product catalog with brand and price filters and allows adding search results to the list.
- Provides smart suggestions (based on local purchase-history data), seasonal recommendations, and substitutes for items.
- Persists the shopping list to `localStorage` and provides a responsive UI for desktop and mobile.

How voice and text work together:
- Typed input uses the same intent parser and command executor as voice input so business logic is shared and consistent.
- Voice input uses the browser Web Speech API when available; recognition transcripts are normalized and passed to the parser.

---

## Current status

This repository contains a functional, assessment-ready implementation with the following areas implemented and verified:

- Voice command interaction (Web Speech API; `src/hooks/useVoiceRecognition.ts`)
- Multilingual preprocessing and language selector (`src/data/multilingualMap.ts`, `src/components/LanguageSelector`)
- Natural-language intent parsing (`src/utils/intentParser.ts`)
- Shopping-list management (`src/hooks/useShoppingList.ts`)
- Product search and filtering (static `src/data/productCatalog.json` and `src/components/ProductSearch`)
- Smart suggestions (derived from `src/data/purchaseHistory.json`)
- Seasonal recommendations (`src/data/seasonalData.ts`)
- Substitute recommendations (`src/data/substituteMap.ts`)
- Persistent list using `localStorage`
- Responsive UI components under `src/components/*`
- Graceful error and loading states for voice and UI flows
- Production build verified (`npm run build`)

Limitations and known items:
- Voice behavior depends on the browser Web Speech API and microphone permissions; Chrome/Edge are recommended for manual voice QA.
- The product catalog is static JSON; there is no external retailer API or cloud database.

---

## Key features (concise)

### Voice interaction
- Microphone input using the Web Speech API (`useVoiceRecognition`).
- Transcript and interim transcript feedback shown to the user.
- States: `idle` → `listening` → `processing` → `success`/`error` → `idle`.
- Explicit cleanup and watchdog to avoid permanently stuck listening states.

### Natural-language commands
- Commands are normalized and parsed into intents and entities.
- Example commands supported:
  - `Add milk`
  - `Add 2 bottles of water`
  - `I want to buy 5 oranges`
  - `Remove milk`
  - `Change apples quantity to 3`
  - `Find organic apples`
  - `Find toothpaste under 300 rupees`
  - `Give me an alternative to milk`

### Multilingual support
- Locale vocab and normalization present for: `en-IN`, `hi-IN`, `ta-IN`, `te-IN`, `bn-IN` (and additional vocab maps for `es-ES`, `fr-FR`, `de-DE`).
- The language selector (UI) sets the speech-recognition `lang` and the preprocessing map used to translate local tokens to English equivalents.
- Multilingual preprocessing (`preprocessMultilingual`) converts local-language tokens and digits to ASCII and replaces common words with English terms so the core parser is language-agnostic.

### Shopping list
- Add, remove, and update quantity operations via `useShoppingList`.
- Toggle completion (checked) and clear-checked operations.
- Last-added substitutes are surfaced when available.
- Persistence using `localStorage` under the key `voice-shopping-list`.

### Product discovery and filters
- Product catalog is a static JSON file (`src/data/productCatalog.json`).
- Search supports term matching and shows product cards.
- Price and brand filters are implemented in the ProductSearch component.
- No-results state is handled in the UI and the user can fall back to typed input.
- Search-result add actions add items to the shopping list.

### Smart suggestions & substitutes
- Smart suggestions use `src/data/purchaseHistory.json` to suggest items overdue based on purchase intervals.
- Seasonal recommendations use `src/data/seasonalData.ts` to provide in-season items.
- Substitute recommendations are provided via `src/data/substituteMap.ts` and surfaced after relevant adds.

### Responsive UI
- Components are designed responsively and tested at common widths (desktop/tablet/mobile). Touch targets and stepper controls are mobile-friendly.

---

## System architecture

```mermaid
flowchart TB
  A[User (Voice or Text)] --> B[VoiceInput / Bottom Typed Input]
  B --> C{If voice}
  C -->|yes| D[Web Speech API (useVoiceRecognition)]
  C -->|no| E[Direct transcript from input]
  D --> F[Transcript]
  E --> F
  F --> G[Multilingual preprocessing]
  G --> H[Intent & Entity Parser]
  H --> I[Command Processor]
  I --> J[Application state (useShoppingList)]
  I --> K[ProductSearch]
  J --> L[UI Components (ShoppingList / Suggestions / SubstitutePanel)]
```

Each layer is implemented in `src/` and the application uses a shared pipeline so typed and voice commands produce consistent outcomes.

---

## Project structure (actual)

```
src/
├── components/
│   ├── ActionFeedback/
│   ├── ErrorBoundary/
│   ├── LanguageSelector/
│   ├── ProductSearch/
│   ├── SeasonalSuggestions/
│   ├── ShoppingItem/
│   ├── ShoppingList/
│   ├── SmartSuggestions/
│   ├── SubstitutePanel/
│   ├── Toast/
│   └── VoiceInput/
├── context/
│   └── ToastContext.tsx
├── data/
│   ├── categoryMap.ts
│   ├── multilingualMap.ts
│   ├── productCatalog.json
│   ├── purchaseHistory.json
│   ├── seasonalData.ts
│   └── substituteMap.ts
├── hooks/
│   ├── useShoppingList.ts
│   └── useVoiceRecognition.ts
├── types/
├── utils/
│   ├── categorizer.ts
│   ├── intentParser.ts
│   └── itemDetails.ts
├── App.tsx
├── main.tsx
└── index.css / App.css
```

Key responsibilities:
- `components/*` — render UI, surface actions and feedback.
- `hooks/*` — encapsulate state and voice lifecycle.
- `utils/*` — parsing, categorization, and helper logic.
- `data/*` — static catalogs, maps, and sample history.

---

## Command processing pipeline (detailed)

1. Input: user speaks or types a command.
2. If voice: `useVoiceRecognition` produces an interim/final transcript.
3. `preprocessMultilingual(transcript, lang)` maps non-English tokens and localized digits to English equivalents.
4. `parseIntent` (in `src/utils/intentParser.ts`) extracts intent and entities:
   - Intent examples: `ADD_ITEM`, `REMOVE_ITEM`, `SEARCH`, `SET_QUANTITY`.
   - Entities: `itemName`, `quantity`, `unit`, `maxPrice`, `brand`.
5. The command executor updates `useShoppingList` or triggers a product search.
6. UI components render results and feedback.

Example: `Add 2 bottles of water` → intent `ADD_ITEM`, item `water`, quantity `2`, unit `bottle`.

Example: `Find toothpaste under 300 rupees` → intent `SEARCH`, item `toothpaste`, maxPrice `300`.

---

## Multilingual architecture

- Language selector sets the BCP-47 `lang` used by the SpeechRecognition instance in `useVoiceRecognition`.
- `preprocessMultilingual` scans the transcript for mapped tokens (from `src/data/multilingualMap.ts`) and replaces them with English equivalents and ASCII digits.
- The normalized text is fed to the same `parseIntent` pipeline, allowing the core parser to be language-independent.

This approach limits duplication while supporting local-language and romanized input common in multilingual regions.

---

## State management

- `useShoppingList` holds the shopping list items, last-added substitutes, suggestions, and persistence logic. It exposes functions to add/remove/update/toggle items.
- Voice UI state (listening/processing/success/error) is local to `useVoiceRecognition` and exposed to components for rendering.
- Search state is managed inside the `ProductSearch` component and uses the static catalog.
- Selected language is persisted via `localStorage` (via the language selector component).

Persistence:
- Shopping list saved to `localStorage` under `voice-shopping-list` using `JSON.stringify`.

---

## Error handling

- Microphone permission denied: `useVoiceRecognition` maps `not-allowed`/`service-not-allowed` to a friendly error and transitions state to `error`.
- Unsupported browser: `useVoiceRecognition` detects missing Web Speech API and provides a fallback message instructing typed input.
- No speech: `no-speech` events produce user feedback and the recognition session is cleaned up.
- Network/service errors: `network` errors are surfaced with actionable hints (Brave-specific hint if Brave is detected).
- Stuck listening prevention: a watchdog auto-stops recognition after a configurable timeout (`MAX_LISTEN_MS`) and the hook ensures `abort()`/`stop()` and state reset.

---

## UI/UX approach

Principles used in the project:
- Voice-first interaction with a robust typed-input fallback.
- Minimalist layout that keeps the shopping list central.
- Clear state feedback (interim transcript, processing and success banners).
- Responsive design with touch-friendly controls for mobile.
- Progressive enhancement: voice features only activate when supported.

---

## Development process (phases)

- Phase 1 — Project foundation: scaffolding with Vite + React + TypeScript, core shopping list UI.
- Phase 2 — Command processing: implement `intentParser` and typed-command handling.
- Phase 3 — Voice recognition: `useVoiceRecognition` and speech lifecycle handling.
- Phase 4 — Multilingual support: `multilingualMap` and language selector.
- Phase 5 — Product discovery: product catalog, search and filters, add-from-search.
- Phase 6 — Smart suggestions: purchase history and seasonal picks.
- Phase 7 — Reliability & persistence: localStorage, cleanup, and manual QA.
- Phase 8 — Production polish: remove dev-only artifacts and verify `npm run build`.

---

## Testing & quality assurance

Manual verification performed includes:
- Command flows: add/remove/update (typed and voice)
- Quantity operations and stepper controls
- Search examples: organic apples, toothpaste under a price bound
- Substitute flows and suggestion adds
- Persistence after reload
- Voice lifecycle tests in Chrome (manual mic tests)
- Responsive checks across common widths

Notes: Web Speech API is browser-dependent; manual mic testing in Chrome/Edge is required for final voice QA. Headless automation cannot fully validate microphone access.

---

## Technology stack

| Technology | Purpose |
|---|---|
| React | UI framework |
| TypeScript | Static typing |
| Vite | Dev server & build tool |
| Tailwind CSS | Styling utilities |
| lucide-react | Icons |
| Web Speech API | Browser speech recognition (no external speech service) |

All dependencies are declared in `package.json`.

---

## Installation & local development

```bash
git clone <repo-url>
cd "Unthinkable Assessment"
npm install
npm run dev
```

Open the local dev URL reported by Vite (commonly `http://localhost:5173`).

Production build and preview:

```bash
npm run build
npm run preview
```

---

## Production build

The project produces a production-ready static build via:

```bash
npm run build
```

This repository has been verified to build successfully in the current environment.

---

## Deployment

Deployment is intended for static hosting (Vercel, Netlify, GitHub Pages). `vercel.json` is included to support SPA routing; follow Vercel's Vite preset and use the `dist` directory produced by the build.

---

## Browser compatibility

- Chrome and Edge are recommended for the best Web Speech API behavior and microphone experience.
- Brave and Firefox may block mic access by default or produce `network` errors when privacy shields are enabled.
- The app falls back to typed commands when voice is unavailable.

---

## Data & security

- All data is stored locally in the browser (`localStorage`).
- Static product and suggestion data live in `src/data/`.
- There are no external APIs, no authentication, and no secrets required to run the application.

---

## Known limitations

- Web Speech API dependency and browser behavior variability.
- Static product catalog (no live pricing or inventory).
- No server-side persistence or user accounts.

---

## Future improvements (non-blocking)

- Integrate retailer APIs for live pricing and inventory
- Improve the intent parser with ML-backed NLP models
- Add optional cloud persistence and authentication for multi-device lists
- Expand language coverage and robustness for romanized input

---

## Engineering decisions

- Shared voice/text pipeline: the parser is shared between voice and typed input to avoid duplicate logic.
- Language normalization: map local tokens to English equivalents so the parser remains compact and robust.
- Web Speech API: chosen for a lightweight, client-only voice UX without third-party speech services.
- Local persistence: `localStorage` enables a dependency-light assessment artifact.

---

## Contributing / development notes

- Create a feature branch, implement changes, test locally with `npm run dev` and verify `npm run build` before opening a PR.
- Do not commit secrets or environment files.

---
## Brief Write-up of Approach

I approached VOXA by breaking the problem into four core layers: voice/text input, natural-language command processing, shopping-list/product actions, and user feedback. Instead of creating separate logic for voice and typed commands, I designed both inputs to flow through the same normalization and intent-processing pipeline, keeping the core business logic consistent and easier to extend.

For voice interaction, I used the browser Speech Recognition API with explicit listening, processing, success, and error states. Multilingual support was implemented through language-specific vocabulary, number/unit mappings, and normalization for English, Hindi/Hinglish, Tamil, Telugu, and Bengali before commands reach the common parser.

I built shopping-list operations around structured intents such as add, remove, update quantity, search, and substitute. Product discovery was extended with price/brand filtering and recommendations using the application's available data.

Reliability was treated as an important part of the implementation. I tested representative voice and typed commands, multilingual inputs, search/filter flows, persistence after refresh, error states, responsive layouts, and production builds. Browser-specific Speech Recognition limitations were handled gracefully rather than masking failures with simulated responses.

---

## License

No license file is included in this repository. Include a `LICENSE` if you want to license the code before public distribution.
