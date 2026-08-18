export interface FontOption {
  family: string;
  name: string;
  category: string;
  weights: number[];
  googleFont?: string;
  localFileName?: string;
}

export const AVAILABLE_FONTS: FontOption[] = [
  { family: 'Inter', name: 'Inter (Défaut)', category: 'Sans-Serif', weights: [300, 400, 500, 600, 700, 800, 900], googleFont: 'Inter:wght@300;400;500;600;700;800;900' },
  { family: 'Poppins', name: 'Poppins', category: 'Sans-Serif', weights: [400, 500, 600, 700, 800], googleFont: 'Poppins:wght@400;500;600;700;800' },
  { family: 'Roboto', name: 'Roboto', category: 'Sans-Serif', weights: [300, 400, 500, 700, 900], googleFont: 'Roboto:wght@300;400;500;700;900' },
  { family: 'Montserrat', name: 'Montserrat', category: 'Sans-Serif', weights: [400, 500, 600, 700, 800, 900], googleFont: 'Montserrat:wght@400;500;600;700;800;900' },
  { family: 'Outfit', name: 'Outfit', category: 'Sans-Serif', weights: [400, 500, 600, 700, 800], googleFont: 'Outfit:wght@400;500;600;700;800' },
  { family: 'Plus Jakarta Sans', name: 'Plus Jakarta Sans', category: 'Sans-Serif', weights: [400, 500, 600, 700, 800], googleFont: 'Plus+Jakarta+Sans:wght@400;500;600;700;800' },
  { family: 'Orbitron', name: 'Orbitron (Gaming/Futuriste)', category: 'Display', weights: [400, 600, 700, 900], googleFont: 'Orbitron:wght@400;600;700;900' },
  { family: 'Fira Code', name: 'Fira Code (Code/Mono)', category: 'Monospace', weights: [400, 500, 600, 700], googleFont: 'Fira+Code:wght@400;500;600;700' },
  { family: 'Fredoka', name: 'Fredoka (Arrondi)', category: 'Display', weights: [400, 500, 600, 700], googleFont: 'Fredoka:wght@400;500;600;700' },
  { family: 'Bebas Neue', name: 'Bebas Neue (Titres Impact)', category: 'Display', weights: [400], googleFont: 'Bebas+Neue' },
  { family: 'Chakra Petch', name: 'Chakra Petch (Discord Bot)', category: 'Sans-Serif', weights: [400, 600, 700], googleFont: 'Chakra+Petch:wght@400;600;700' },
];

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
