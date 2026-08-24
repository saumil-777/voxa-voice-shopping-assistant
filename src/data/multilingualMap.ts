/**
 * Multilingual keyword maps for voice command recognition.
 * Maps action keywords and common item names to English equivalents.
 *
 * Supported: Hindi (hi-IN), Tamil (ta-IN), Telugu (te-IN), Bengali (bn-IN)
 */

export interface LangKeywords {
  add:    string[];
  remove: string[];
  search: string[];
  need:   string[];      // "I need X" variants
  itemMap: Record<string, string>;   // native word → English
}

export const MULTILINGUAL_KEYWORDS: Record<string, LangKeywords> = {

  'hi-IN': {
    add:    ['जोड़ो', 'जोड़ें', 'डालो', 'लाओ', 'खरीदो', 'लेना', 'लेकर आओ', 'add', 'add करो', 'add karo', 'जोड़ो', 'जोड़ना'],
    remove: ['हटाओ', 'हटाएं', 'निकालो', 'हटा दो', 'निकाल दो', 'मत चाहिए', 'हटाओ', 'हटा', 'निकालो'],
    search: ['ढूंढो', 'खोजो', 'दिखाओ', 'खोजें', 'ढूंढें', 'dhoondo', 'dhoondho', 'dhoondo', 'dhoondna'],
    need:   ['चाहिए', 'मुझे चाहिए', 'हमें चाहिए', 'zaroorat', 'chahiye', 'चाहिएगा'],
    itemMap: {
      // Devanagari → English
      'दूध': 'milk', 'चीनी': 'sugar', 'नमक': 'salt', 'आटा': 'flour',
      'चावल': 'rice', 'दाल': 'lentils', 'रोटी': 'bread', 'आलू': 'potato',
      'टमाटर': 'tomatoes', 'प्याज': 'onion', 'लहसुन': 'garlic', 'अदरक': 'ginger',
      'सेब': 'apple', 'केला': 'banana', 'संतरा': 'orange', 'अंगूर': 'grapes',
      'मटर': 'peas', 'गाजर': 'carrots', 'पालक': 'spinach', 'बैंगन': 'eggplant',
      'दही': 'yogurt', 'पनीर': 'cheese', 'मक्खन': 'butter', 'घी': 'ghee',
      'चाय': 'tea', 'कॉफी': 'coffee', 'पानी': 'water', 'जूस': 'juice',
      'अंडे': 'eggs', 'चिकन': 'chicken', 'मछली': 'fish',
      'साबुन': 'soap', 'शैम्पू': 'shampoo', 'टूथपेस्ट': 'toothpaste',
      'बिस्किट': 'cookies', 'चिप्स': 'chips', 'नूडल्स': 'noodles',
      'मैगी': 'noodles', 'बाजरा': 'millet', 'ज्वार': 'sorghum',
      // Units & common words (Devanagari)
      'पैकट': 'packet', 'पैकेट': 'packet', 'बोतल': 'bottle', 'बोतलें': 'bottle', 'बरण्ड': 'brand',
      'किलो': 'kg', 'किलोग्राम': 'kg', 'ग्राम': 'g', 'लीटर': 'liter', 'लिटर': 'liter',
      // Romanized / Hinglish → English
      'doodh': 'milk', 'dudh': 'milk', 'doodh ka': 'milk', 'doodh ko': 'milk',
      'seb': 'apple', 'sebo': 'apple', 'seb ko': 'apple', 'kela': 'banana', 'apple': 'apple',
      'pani': 'water', 'paani': 'water', 'packet': 'packet', 'packets': 'packet',
      'botal': 'bottle', 'bottle': 'bottle', 'bottles': 'bottle', 'box': 'box', 'do': '2', 'doa': '2',
      'teen': '3', 'paanch': '5', 'ek': '1', 'chaar': '4',
      'add karo': 'add', 'add': 'add', 'hatao': 'remove', 'hata dena': 'remove',
    },
  },

  // Tamil (ta-IN) — simple verbs and a few items (Tamil script + common romanization)
  'ta-IN': {
    add: ['சேர்க்கவும்', 'சேர்', 'சேர்க்க', 'add', 'செர்', 'சேர்க்கவும்'],
    remove: ['அகற்று', 'நீக்கு', 'கிழி', 'remove', 'அகற்று'],
    search: ['தேடுக', 'கண்டுபிடி', 'தேடு', 'find', 'தேடு'],
    need: ['வேண்டும்', 'கேட்க', 'want', 'வேணும்'],
    itemMap: {
      'பால்': 'milk', 'பால': 'milk', 'பழம்': 'apple', 'ஆப்பிள்': 'apple',
      'அரிசி': 'rice', 'உப்பு': 'salt', 'சக்கரை': 'sugar', 'தயிர்': 'yogurt',
      // Units / Romanization
      'பாக்கெட்': 'packet', 'போத்தல்': 'bottle', 'போக்கெட்': 'packet', 'paal': 'milk', 'pani': 'water', 'vellam': 'water',
      '1': '1', '2': '2', '3': '3', 'நாலு': '4', 'ஐந்து': '5',
    },
  },

  // Telugu (te-IN)
  'te-IN': {
    add: ['జోడించండి', 'జోడించు', 'add', 'జోడించండి', 'జోడించు'],
    remove: ['తొలగించండి', 'తీసేయండి', 'తొలగించు', 'remove', 'తొలగించు'],
    search: ['కానుకుందాం', 'శోధించండి', 'search', 'కండి', 'తెచ్'],
    need: ['కావాలి', 'త్వరగా', 'want', 'కావాలి'],
    itemMap: {
      'పాలు': 'milk', 'పాలను': 'milk', 'ఆపిల్': 'apple', 'అరటి': 'banana',
      'నెయ్యి': 'butter', 'నూనె': 'oil', 'paalu': 'milk', 'appil': 'apple', 'water': 'water',
      'ప్యాకెట్': 'packet', 'ప్యాక్': 'packet', 'బాతిలు': 'bottle', 'బాటిల్': 'bottle',
      'ఒకటి': '1', 'రెండు': '2', 'మూడు': '3', 'ఐదు': '5',
    },
  },

  // Bengali (bn-IN)
  'bn-IN': {
    add: ['যোগ', 'যোগ করুন', 'যোগ কর', 'add', 'যোক', 'যোগ করুন', 'যোগ করুন'],
    remove: ['হটান', 'বাতিল', 'মুছুন', 'remove', 'সরান', 'ফেলে দিন'],
    search: ['খুঁজুন', 'জানুন', 'অনুসন্ধান', 'search', 'dhoondo', 'খুঁজে'],
    need: ['চাই', 'প্রয়োজন', 'darkhast', 'প্রয়োজন'],
    itemMap: {
      'দুধ': 'milk', 'দই': 'yogurt', 'চাল': 'rice', 'ভাত': 'rice',
      'পেঁয়াজ': 'onion', 'রসুন': 'garlic', 'আলু': 'potato', 'আপেল': 'apple',
      'পানি': 'water', 'প্যাকেট': 'packet', 'বোটল': 'bottle',
      '১': '1', '২': '2', '৩': '3', '৫': '5',
      'dudh': 'milk', 'pani': 'water', 'packet': 'packet', 'bottle': 'bottle',
    },
  },

  'es-ES': {
    add:    ['agregar', 'añadir', 'pon', 'agrega', 'añade', 'comprar', 'quiero comprar'],
    remove: ['quitar', 'eliminar', 'borrar', 'remove', 'saca', 'quita'],
    search: ['buscar', 'encontrar', 'busca', 'encuentra', 'muéstrame', 'mostrar'],
    need:   ['necesito', 'necesitamos', 'quiero', 'queremos'],
    itemMap: {
      'leche': 'milk', 'pan': 'bread', 'azúcar': 'sugar', 'sal': 'salt',
      'arroz': 'rice', 'huevos': 'eggs', 'mantequilla': 'butter',
      'manzanas': 'apple', 'plátanos': 'banana', 'naranja': 'orange',
      'tomates': 'tomatoes', 'cebollas': 'onion', 'ajo': 'garlic',
      'pollo': 'chicken', 'carne': 'beef', 'pescado': 'fish',
      'queso': 'cheese', 'yogur': 'yogurt', 'café': 'coffee', 'té': 'tea',
      'agua': 'water', 'jugo': 'juice', 'jabón': 'soap', 'champú': 'shampoo',
      'patatas': 'potato', 'papas': 'potato', 'zanahorias': 'carrots',
      'espinacas': 'spinach', 'lechuga': 'lettuce', 'uvas': 'grapes',
    },
  },

  'fr-FR': {
    add:    ['ajouter', 'ajoute', 'mettre', 'acheter', 'rajouter', 'mets'],
    remove: ['supprimer', 'enlever', 'retirer', 'effacer', 'enlève', 'supprime'],
    search: ['chercher', 'trouver', 'cherche', 'trouve', 'montrer', 'montre'],
    need:   ["j'ai besoin", 'il me faut', 'je veux', 'nous avons besoin'],
    itemMap: {
      'lait': 'milk', 'pain': 'bread', 'sucre': 'sugar', 'sel': 'salt',
      'riz': 'rice', 'œufs': 'eggs', 'oeufs': 'eggs', 'beurre': 'butter',
      'pommes': 'apple', 'bananes': 'banana', 'oranges': 'orange',
      'tomates': 'tomatoes', 'oignons': 'onion', 'ail': 'garlic',
      'poulet': 'chicken', 'bœuf': 'beef', 'poisson': 'fish',
      'fromage': 'cheese', 'yaourt': 'yogurt', 'café': 'coffee', 'thé': 'tea',
      'eau': 'water', 'jus': 'juice', 'savon': 'soap', 'shampooing': 'shampoo',
      'pommes de terre': 'potato', 'carottes': 'carrots', 'épinards': 'spinach',
      'laitue': 'lettuce', 'raisins': 'grapes',
    },
  },

  'de-DE': {
    add:    ['hinzufügen', 'hinzufüge', 'kaufen', 'hol', 'hole', 'add'],
    remove: ['entfernen', 'löschen', 'streichen', 'entferne', 'lösche'],
    search: ['suchen', 'finden', 'suche', 'finde', 'zeige', 'zeigen'],
    need:   ['ich brauche', 'wir brauchen', 'ich möchte', 'ich will'],
    itemMap: {
      'milch': 'milk', 'brot': 'bread', 'zucker': 'sugar', 'salz': 'salt',
      'reis': 'rice', 'eier': 'eggs', 'butter': 'butter',
      'äpfel': 'apple', 'apfel': 'apple', 'bananen': 'banana',
      'orangen': 'orange', 'tomaten': 'tomatoes', 'zwiebeln': 'onion',
      'knoblauch': 'garlic', 'hähnchen': 'chicken', 'fleisch': 'meat',
      'fisch': 'fish', 'käse': 'cheese', 'joghurt': 'yogurt',
      'kaffee': 'coffee', 'tee': 'tea', 'wasser': 'water',
      'saft': 'juice', 'seife': 'soap', 'shampoo': 'shampoo',
      'kartoffeln': 'potato', 'karotten': 'carrots', 'spinat': 'spinach',
      'trauben': 'grapes', 'erdbeeren': 'strawberries',
    },
  },
};

/**
 * Pre-process a non-English transcript:
 * 1. Try to detect and translate action verbs → 'add' | 'remove' | 'search'
 * 2. Translate known item names to English
 * Returns a normalized English-like transcript ready for the main parser.
 */
export function preprocessMultilingual(transcript: string, lang: string): string {
  const langCode = lang as keyof typeof MULTILINGUAL_KEYWORDS;
  const map = MULTILINGUAL_KEYWORDS[langCode];
  if (!map) return transcript;  // English or unknown — pass through
  // Normalize common Indic digits (Devanagari, Bengali, Tamil, Telugu) to ASCII
  const normalizedDigits = transcript
    .replace(/[\u0966-\u096F]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x0966 + 48)) // Devanagari
    .replace(/[\u09E6-\u09EF]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x09E6 + 48)) // Bengali
    .replace(/[\u0BE6-\u0BEF]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x0BE6 + 48)) // Tamil
    .replace(/[\u0C66-\u0C6F]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x0C66 + 48)); // Telugu

  const lower = normalizedDigits.toLowerCase().trim();
  let action = '';
  let rest = lower;

  // Detect action keyword
  for (const kw of map.add) {
    if (lower.includes(kw)) { action = 'add'; rest = lower.replace(kw, '').trim(); break; }
  }
  if (!action) {
    for (const kw of map.remove) {
      if (lower.includes(kw)) { action = 'remove'; rest = lower.replace(kw, '').trim(); break; }
    }
  }
  if (!action) {
    for (const kw of map.search) {
      if (lower.includes(kw)) { action = 'search'; rest = lower.replace(kw, '').trim(); break; }
    }
  }
  if (!action) {
    for (const kw of map.need) {
      if (lower.includes(kw)) { action = 'add'; rest = lower.replace(kw, '').trim(); break; }
    }
  }

  // Translate item names
  let translated = rest;
  for (const [native, english] of Object.entries(map.itemMap)) {
    const n = native.toLowerCase();
    if (translated.includes(n)) translated = translated.replace(new RegExp(n, 'g'), english);
  }

  // Compose normalized string
  if (action && translated) return `${action} ${translated}`.trim();
  if (translated) return translated.trim();  // No action detected — let main parser try
  return transcript;
}
