export interface FontOption {
  family: string;
  name: string;
  category: string;
  weights: number[];
  googleFont?: string;
  isCustom?: boolean;
  dataUrl?: string;
}

const STORAGE_KEY_CUSTOM_FONTS = 'discord_canvas_custom_fonts_v2';

export const DEFAULT_FONTS: FontOption[] = [
  { family: 'Inter', name: 'Inter (Défaut)', category: 'Sans-Serif', weights: [300, 400, 500, 600, 700, 800, 900], googleFont: 'Inter:wght@300;400;500;600;700;800;900' },
  { family: 'Poppins', name: 'Poppins', category: 'Sans-Serif', weights: [400, 500, 600, 700, 800], googleFont: 'Poppins:wght@400;500;600;700;800' },
  { family: 'Roboto', name: 'Roboto', category: 'Sans-Serif', weights: [300, 400, 500, 700, 900], googleFont: 'Roboto:wght@300;400;500;700;900' },
  { family: 'Montserrat', name: 'Montserrat', category: 'Sans-Serif', weights: [400, 500, 600, 700, 800, 900], googleFont: 'Montserrat:wght@400;500;600;700;800;900' },
  { family: 'Outfit', name: 'Outfit', category: 'Sans-Serif', weights: [400, 500, 600, 700, 800], googleFont: 'Outfit:wght@400;500;600;700;800' },
  { family: 'Plus Jakarta Sans', name: 'Plus Jakarta Sans', category: 'Sans-Serif', weights: [400, 500, 600, 700, 800], googleFont: 'Plus+Jakarta+Sans:wght@400;500;600;700;800' },
  { family: 'Space Grotesk', name: 'Space Grotesk (Moderne)', category: 'Sans-Serif', weights: [400, 600, 700], googleFont: 'Space+Grotesk:wght@400;600;700' },
  { family: 'Orbitron', name: 'Orbitron (Gaming/Futuriste)', category: 'Display', weights: [400, 600, 700, 900], googleFont: 'Orbitron:wght@400;600;700;900' },
  { family: 'Fira Code', name: 'Fira Code (Code/Mono)', category: 'Monospace', weights: [400, 500, 600, 700], googleFont: 'Fira+Code:wght@400;500;600;700' },
  { family: 'Fredoka', name: 'Fredoka (Arrondi)', category: 'Display', weights: [400, 500, 600, 700], googleFont: 'Fredoka:wght@400;500;600;700' },
  { family: 'Bebas Neue', name: 'Bebas Neue (Titres Impact)', category: 'Display', weights: [400], googleFont: 'Bebas+Neue' },
  { family: 'Chakra Petch', name: 'Chakra Petch (Discord Bot)', category: 'Sans-Serif', weights: [400, 600, 700], googleFont: 'Chakra+Petch:wght@400;600;700' },
  { family: 'Cinzel', name: 'Cinzel (RPG & Fantastique)', category: 'Serif', weights: [400, 700, 900], googleFont: 'Cinzel:wght@400;700;900' },
  { family: 'Russo One', name: 'Russo One (Arcade & Punch)', category: 'Display', weights: [400], googleFont: 'Russo+One' },
];

export let AVAILABLE_FONTS: FontOption[] = [...DEFAULT_FONTS];

/**
 * Loads custom imported fonts from localStorage and registers them in document.fonts & CSS @font-face
 */
export async function loadCustomFontsFromStorage(): Promise<FontOption[]> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_FONTS);
    if (!raw) return DEFAULT_FONTS;

    const saved: FontOption[] = JSON.parse(raw);
    if (!Array.isArray(saved)) return DEFAULT_FONTS;

    for (const font of saved) {
      if (font && font.dataUrl && font.family) {
        try {
          const fontFace = new FontFace(font.family, `url("${font.dataUrl}")`);
          const loaded = await fontFace.load();
          document.fonts.add(loaded);

          // CSS @font-face fallback
          const styleId = `custom-font-${font.family.replace(/[^a-zA-Z0-9]/g, '-')}`;
          if (!document.getElementById(styleId)) {
            const styleEl = document.createElement('style');
            styleEl.id = styleId;
            styleEl.textContent = `@font-face { font-family: "${font.family}"; src: url("${font.dataUrl}"); }`;
            document.head.appendChild(styleEl);
          }
        } catch (e) {
          console.warn('Erreur chargement police personnalisée stockée:', font.family, e);
        }
      }
    }

    const customList = saved.filter(s => s && s.family && !DEFAULT_FONTS.some(d => d.family === s.family));
    AVAILABLE_FONTS = [...customList, ...DEFAULT_FONTS];
    return AVAILABLE_FONTS;
  } catch (err) {
    console.warn('Erreur lecture stockage polices:', err);
    return DEFAULT_FONTS;
  }
}

/**
 * Registers and persists a new custom font file (.ttf, .otf, .woff, .woff2)
 */
export async function importCustomFontFile(file: File, customName?: string): Promise<FontOption> {
  if (!file) {
    throw new Error('Aucun fichier sélectionné.');
  }

  // Clean and sanitize family name
  const rawName = (customName || file.name.replace(/\.[^/.]+$/, '')).trim();
  const cleanFamilyName = rawName.replace(/[^a-zA-Z0-9 _-]/g, '').trim() || 'CustomFont';

  return new Promise((resolve, reject) => {
    const arrayReader = new FileReader();

    arrayReader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        if (!arrayBuffer) {
          throw new Error('Lecture du fichier impossible.');
        }

        // 1. Register with native FontFace API using ArrayBuffer (ultra-compatible)
        const fontFace = new FontFace(cleanFamilyName, arrayBuffer);
        const loadedFace = await fontFace.load();
        document.fonts.add(loadedFace);

        // 2. Also create DataURL for localStorage persistence & CSS fallback
        const blob = new Blob([arrayBuffer], { type: file.type || 'font/ttf' });
        const dataUrlReader = new FileReader();

        dataUrlReader.onload = (dataEvt) => {
          const dataUrl = dataEvt.target?.result as string;

          // CSS @font-face fallback
          const styleId = `custom-font-${cleanFamilyName.replace(/[^a-zA-Z0-9]/g, '-')}`;
          let styleEl = document.getElementById(styleId) as HTMLStyleElement | null;
          if (!styleEl) {
            styleEl = document.createElement('style');
            styleEl.id = styleId;
            document.head.appendChild(styleEl);
          }
          styleEl.textContent = `@font-face { font-family: "${cleanFamilyName}"; src: url("${dataUrl}"); }`;

          const newFontOption: FontOption = {
            family: cleanFamilyName,
            name: `${cleanFamilyName} (Importée)`,
            category: 'Custom',
            weights: [400, 600, 700, 800],
            isCustom: true,
            dataUrl: dataUrl
          };

          // Save to localStorage
          try {
            const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_FONTS);
            let list: FontOption[] = raw ? JSON.parse(raw) : [];
            if (!Array.isArray(list)) list = [];
            list = list.filter(f => f && f.family !== cleanFamilyName);
            list.unshift(newFontOption);
            localStorage.setItem(STORAGE_KEY_CUSTOM_FONTS, JSON.stringify(list));
          } catch (storageErr) {
            console.warn('Impossible de sauvegarder dans localStorage (quota dépassé):', storageErr);
          }

          AVAILABLE_FONTS = [newFontOption, ...AVAILABLE_FONTS.filter(f => f.family !== cleanFamilyName)];
          resolve(newFontOption);
        };

        dataUrlReader.onerror = () => {
          // If dataUrl conversion fails, still resolve with memory font
          const newFontOption: FontOption = {
            family: cleanFamilyName,
            name: `${cleanFamilyName} (Session)`,
            category: 'Custom',
            weights: [400, 600, 700, 800],
            isCustom: true
          };
          AVAILABLE_FONTS = [newFontOption, ...AVAILABLE_FONTS.filter(f => f.family !== cleanFamilyName)];
          resolve(newFontOption);
        };

        dataUrlReader.readAsDataURL(blob);
      } catch (err: any) {
        reject(new Error(err?.message || 'Erreur lors du chargement de la police.'));
      }
    };

    arrayReader.onerror = () => reject(new Error('Erreur de lecture du fichier.'));
    arrayReader.readAsArrayBuffer(file);
  });
}

/**
 * Injects Google Fonts into the browser document dynamically
 */
export function ensureGoogleFontsLoaded() {
  const fontFamilies = AVAILABLE_FONTS.map(f => f.googleFont).filter(Boolean);
  const href = `https://fonts.googleapis.com/css2?${fontFamilies.map(f => `family=${f}`).join('&')}&display=swap`;
  
  if (!document.getElementById('google-fonts-loader')) {
    const link = document.createElement('link');
    link.id = 'google-fonts-loader';
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }
}
