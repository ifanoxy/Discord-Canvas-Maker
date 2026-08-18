export interface BackgroundConfig {
  type: 'color' | 'transparent' | 'gradient' | 'image' | 'preset';
  color?: string;
  gradientStart?: string;
  gradientEnd?: string;
  gradientAngle?: number; // 0 to 360
  gradientType?: 'linear' | 'radial';
  imageUrl?: string;
  presetId?: string;
}

export interface PresetBackground {
  id: string;
  name: string;
  previewGradient: string;
}

export const PRESET_BACKGROUNDS: PresetBackground[] = [
  // 1 - 10 : Discord & Cyber Essentials
  { id: 'cyber-discord', name: 'Cyber Discord Dark', previewGradient: 'linear-gradient(135deg, #1E1F22 0%, #2B2D31 50%, #5865F2 100%)' },
  { id: 'aurora-glow', name: 'Aurora Mesh Glow', previewGradient: 'radial-gradient(circle at 80% 20%, #5865F2 0%, #00F0FF 40%, #0F1015 100%)' },
  { id: 'synthwave-grid', name: 'Synthwave Horizon', previewGradient: 'linear-gradient(180deg, #12072B 0%, #3B0944 60%, #EB459E 100%)' },
  { id: 'isometric-hex', name: 'Hexagones Cybernétiques', previewGradient: 'linear-gradient(135deg, #14171A 0%, #23272A 70%, #57F287 100%)' },
  { id: 'frosted-glass', name: 'Frosted Glass Slate', previewGradient: 'linear-gradient(135deg, #202225 0%, #2F3136 100%)' },
  { id: 'midnight-nitro', name: 'Midnight Nitro Purple', previewGradient: 'linear-gradient(135deg, #19092B 0%, #4D127A 60%, #8A2BE2 100%)' },
  { id: 'neon-matrix', name: 'Matrix Digital Neon', previewGradient: 'linear-gradient(180deg, #05140A 0%, #0D2818 70%, #57F287 100%)' },
  { id: 'crimson-void', name: 'Crimson Void & Embers', previewGradient: 'linear-gradient(135deg, #1B0B0E 0%, #4A0E17 60%, #ED4245 100%)' },
  { id: 'emerald-circuit', name: 'Emerald Circuit Board', previewGradient: 'linear-gradient(135deg, #0A1C14 0%, #103B24 60%, #00FF88 100%)' },
  { id: 'sunset-gradient', name: 'Sunset Rose & Gold', previewGradient: 'linear-gradient(135deg, #230B1C 0%, #5E1238 50%, #FF7B00 100%)' },

  // 11 - 20 : Espace, Géométrie & 3D
  { id: 'ocean-abyss', name: 'Ocean Abyss & Trench', previewGradient: 'linear-gradient(180deg, #050D1A 0%, #0A2540 60%, #00D2FF 100%)' },
  { id: 'studio-minimal', name: 'Studio Minimal Slate', previewGradient: 'linear-gradient(135deg, #111215 0%, #1E2026 100%)' },
  { id: 'golden-luxury', name: 'Golden Luxury Noir', previewGradient: 'linear-gradient(135deg, #120F08 0%, #36290C 60%, #FFD700 100%)' },
  { id: 'hightech-dots', name: 'High-Tech Matrix Dots', previewGradient: 'linear-gradient(135deg, #0B0E14 0%, #151D2A 100%)' },
  { id: 'hologram-scan', name: 'Hologram Scanlines', previewGradient: 'linear-gradient(180deg, #061118 0%, #0B2B3E 70%, #00F0FF 100%)' },
  { id: 'vaporwave-pastel', name: 'Vaporwave Pastel Lilac', previewGradient: 'linear-gradient(135deg, #2D1436 0%, #6E3B7E 50%, #FFB6C1 100%)' },
  { id: 'cyber-poly-mesh', name: 'Low-Poly Mesh Géométrique', previewGradient: 'linear-gradient(135deg, #0A192F 0%, #172A45 50%, #64FFDA 100%)' },
  { id: 'quantum-rings', name: 'Anneaux Quantiques Centrés', previewGradient: 'radial-gradient(circle, #6366F1 0%, #1E1B4B 60%, #090818 100%)' },
  { id: 'diagonal-prism', name: 'Prisme Diagonal Facetté', previewGradient: 'linear-gradient(45deg, #180B28 0%, #431E6D 50%, #9055FF 100%)' },
  { id: 'retrowave-wireframe', name: 'Grille Filaire Perspective 3D', previewGradient: 'linear-gradient(180deg, #180520 0%, #3B0945 60%, #FF2A85 100%)' },

  // 21 - 30 : Abstrait Futuriste & Vitesse
  { id: 'abstract-waves', name: 'Vagues Fluides Luminescentes', previewGradient: 'linear-gradient(135deg, #060B1E 0%, #0E275C 50%, #38BDF8 100%)' },
  { id: 'hyper-speed', name: 'Vitesse Warp Hyper-Espace', previewGradient: 'radial-gradient(circle at 50% 50%, #FFFFFF 0%, #3B82F6 40%, #030712 100%)' },
  { id: 'digital-circuit', name: 'Microprocesseur & Puces', previewGradient: 'linear-gradient(135deg, #070B14 0%, #0F2038 60%, #38BDF8 100%)' },
  { id: 'carbon-fiber', name: 'Fibre de Carbone Tissée', previewGradient: 'linear-gradient(135deg, #0D0E11 0%, #1A1C23 100%)' },
  { id: 'nebula-galaxy', name: 'Galaxie Spirale & Nébuleuse', previewGradient: 'radial-gradient(circle, #C084FC 0%, #581C87 50%, #0F071D 100%)' },
  { id: 'cyber-glitch', name: 'Effet Glitch & Bandes Néon', previewGradient: 'linear-gradient(90deg, #0D0E15 0%, #00F0FF 20%, #0D0E15 40%, #FF0055 80%, #0D0E15 100%)' },
  { id: 'neon-bokeh', name: 'Cercles Bokeh Lumineux', previewGradient: 'radial-gradient(circle at 30% 30%, #EC4899 0%, #8B5CF6 50%, #0B0A16 100%)' },
  { id: 'prism-refraction', name: 'Dispersion Spectrale Prismatique', previewGradient: 'linear-gradient(120deg, #111827 0%, #3B82F6 25%, #10B981 50%, #F59E0B 75%, #EF4444 100%)' },
  { id: 'deep-space', name: 'Vide Spatial & Étoiles', previewGradient: 'radial-gradient(circle, #1E1B4B 0%, #05050A 100%)' },
  { id: 'solar-flare', name: 'Éruption Solaire Incandescente', previewGradient: 'radial-gradient(circle at 0% 0%, #FEF08A 0%, #EA580C 40%, #450A0A 100%)' },

  // 31 - 40 : Gaming, RPG & Fantastique
  { id: 'toxic-waste', name: 'Vert Toxique & Particules', previewGradient: 'radial-gradient(circle at 50% 100%, #22C55E 0%, #064E3B 50%, #022C22 100%)' },
  { id: 'electric-storm', name: 'Orage Électrique & Éclairs', previewGradient: 'linear-gradient(180deg, #0F172A 0%, #1E3A8A 50%, #60A5FA 100%)' },
  { id: 'cyber-tunnel', name: 'Tunnel Hexagonal Infini', previewGradient: 'radial-gradient(circle, #00F0FF 0%, #0369A1 40%, #082F49 100%)' },
  { id: 'magma-core', name: 'Noyau de Magma & Lave', previewGradient: 'linear-gradient(135deg, #180808 0%, #450A0A 50%, #DC2626 100%)' },
  { id: 'sakura-night', name: 'Pétales Sakura & Nuit de Tokyo', previewGradient: 'linear-gradient(180deg, #0B0517 0%, #2E083B 60%, #F472B6 100%)' },
  { id: 'crystal-cave', name: 'Caverne de Cristaux & Améthyste', previewGradient: 'linear-gradient(135deg, #10061E 0%, #3B0764 50%, #A855F7 100%)' },
  { id: 'deep-purple-nitro', name: 'Nitro Améthyste Sombre', previewGradient: 'linear-gradient(135deg, #1E0A3C 0%, #4C1D95 60%, #06B6D4 100%)' },
  { id: 'supernova', name: 'Supernova Stellaire Dorée', previewGradient: 'radial-gradient(circle at 50% 50%, #FFFFFF 0%, #FBBF24 35%, #78350F 70%, #0F0904 100%)' },
  { id: 'frost-crystal', name: 'Givre & Glace Polaire', previewGradient: 'linear-gradient(135deg, #081B2B 0%, #0E3D5C 50%, #BAE6FD 100%)' },
  { id: 'blood-moon', name: 'Lune Rouge Sang & Brume', previewGradient: 'radial-gradient(circle at 80% 20%, #EF4444 0%, #7F1D1D 40%, #1A0507 100%)' },

  // 41 - 50 : Minimalistes, Dégradés & Graphiques
  { id: 'zen-gradient', name: 'Thé Vert Zen & Crème', previewGradient: 'linear-gradient(135deg, #061A14 0%, #064E3B 50%, #6EE7B7 100%)' },
  { id: 'cotton-candy', name: 'Barbe à Papa Pastel', previewGradient: 'linear-gradient(135deg, #180E28 0%, #6B21A8 50%, #F472B6 80%, #38BDF8 100%)' },
  { id: 'obsidian-gold', name: 'Obsidienne Noire & Filets d\'Or', previewGradient: 'linear-gradient(135deg, #09090B 0%, #18181B 60%, #CA8A04 100%)' },
  { id: 'holographic-foil', name: 'Papier Holographique Métallisé', previewGradient: 'linear-gradient(135deg, #1E1B4B 0%, #4338CA 30%, #EC4899 60%, #38BDF8 100%)' },
  { id: 'dune-sunset', name: 'Dunes Désertiques & Crépuscule', previewGradient: 'linear-gradient(180deg, #1C0A1A 0%, #581C87 40%, #B45309 80%, #FBBF24 100%)' },
  { id: 'deep-sea-bioluminescence', name: 'Bioluminescence Sous-Marine', previewGradient: 'radial-gradient(circle at 50% 80%, #2DD4BF 0%, #0F766E 40%, #042F2E 100%)' },
  { id: 'blueprint-grid', name: 'Plan d\'Architecte Blueprint', previewGradient: 'linear-gradient(135deg, #0B192C 0%, #1E3E62 100%)' },
  { id: 'arcade-neon', name: 'Arcade Rétro 90s Néon', previewGradient: 'linear-gradient(135deg, #130026 0%, #4A0072 50%, #00F0FF 100%)' },
  { id: 'techno-stripes', name: 'Bandes de Sécurité Cyber', previewGradient: 'linear-gradient(135deg, #0A0A0E 0%, #1F1F2E 60%, #EAB308 100%)' },
  { id: 'cosmic-aurora-3d', name: 'Aurore Cosmique Multi-Dimensionnelle', previewGradient: 'linear-gradient(135deg, #05050D 0%, #1E1035 40%, #064E3B 70%, #06B6D4 100%)' },

  // 51 - 60 : COLLECTION SPÉCIALE FROSTED GLASS & GLASSMORPHISM
  { id: 'glass-cyan-aura', name: 'Frosted Glass Cyan Aura', previewGradient: 'radial-gradient(circle at 75% 25%, #00F0FF 0%, #091A28 60%, #03070E 100%)' },
  { id: 'glass-violet-neon', name: 'Frosted Glass Violet Glow', previewGradient: 'radial-gradient(circle at 25% 75%, #A855F7 0%, #280C48 60%, #0A0314 100%)' },
  { id: 'glass-emerald-pulse', name: 'Frosted Glass Émeraude', previewGradient: 'radial-gradient(circle at 80% 20%, #10B981 0%, #064E3B 60%, #021C14 100%)' },
  { id: 'glass-sunset-amber', name: 'Frosted Glass Sunset Ambre', previewGradient: 'radial-gradient(circle at 70% 30%, #F97316 0%, #DB2777 50%, #110515 100%)' },
  { id: 'glass-midnight-noir', name: 'Frosted Glass Noir Titane', previewGradient: 'radial-gradient(circle at 50% 50%, #52525B 0%, #18181B 60%, #09090B 100%)' },
  { id: 'glass-crimson-flame', name: 'Frosted Glass Crimson Flame', previewGradient: 'radial-gradient(circle at 85% 15%, #EF4444 0%, #5C0B12 60%, #150204 100%)' },
  { id: 'glass-aurora-dual', name: 'Frosted Glass Dual Aurora', previewGradient: 'linear-gradient(135deg, #00F0FF 0%, #090B14 50%, #EC4899 100%)' },
  { id: 'glass-golden-champagne', name: 'Frosted Glass Or Champagne', previewGradient: 'radial-gradient(circle at 30% 70%, #FACC15 0%, #451A03 60%, #0B0602 100%)' },
  { id: 'glass-ice-glacier', name: 'Frosted Glass Glacier Polaire', previewGradient: 'radial-gradient(circle at 60% 20%, #E0F2FE 0%, #0284C7 50%, #031D33 100%)' },
  { id: 'glass-cyber-blurple', name: 'Frosted Glass Discord Blurple', previewGradient: 'radial-gradient(circle at 75% 25%, #5865F2 0%, #1E1B4B 60%, #080718 100%)' }
];

export function renderBackgroundToContext(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  config: BackgroundConfig,
  bgImageElement?: HTMLImageElement | null
) {
  ctx.save();

  if (config.type === 'color') {
    ctx.fillStyle = config.color || '#313338';
    ctx.fillRect(0, 0, width, height);
  } else if (config.type === 'transparent') {
    ctx.clearRect(0, 0, width, height);
  } else if (config.type === 'gradient') {
    const angle = (config.gradientAngle || 135) * (Math.PI / 180);
    const cx = width / 2;
    const cy = height / 2;
    const r = Math.sqrt(width * width + height * height) / 2;

    const x1 = cx - Math.cos(angle) * r;
    const y1 = cy - Math.sin(angle) * r;
    const x2 = cx + Math.cos(angle) * r;
    const y2 = cy + Math.sin(angle) * r;

    if (config.gradientType === 'radial') {
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(width, height) / 2);
      grad.addColorStop(0, config.gradientStart || '#5865F2');
      grad.addColorStop(1, config.gradientEnd || '#1E1F22');
      ctx.fillStyle = grad;
    } else {
      const grad = ctx.createLinearGradient(x1, y1, x2, y2);
      grad.addColorStop(0, config.gradientStart || '#5865F2');
      grad.addColorStop(1, config.gradientEnd || '#1E1F22');
      ctx.fillStyle = grad;
    }
    ctx.fillRect(0, 0, width, height);
  } else if (config.type === 'image' && bgImageElement && bgImageElement.complete) {
    ctx.drawImage(bgImageElement, 0, 0, width, height);
  } else if (config.type === 'preset') {
    drawPresetBackground(ctx, width, height, config.presetId || 'cyber-discord');
  } else {
    ctx.fillStyle = '#313338';
    ctx.fillRect(0, 0, width, height);
  }

  ctx.restore();
}

/**
 * Draws all 60 advanced aesthetic presets (including the 10 Frosted Glass collection)
 */
export function drawPresetBackground(ctx: CanvasRenderingContext2D, width: number, height: number, presetId: string) {
  ctx.save();

  // Helper gradient creators
  const linear = (x1: number, y1: number, x2: number, y2: number, stops: [number, string][]) => {
    const g = ctx.createLinearGradient(x1, y1, x2, y2);
    stops.forEach(([pos, col]) => g.addColorStop(pos, col));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);
    return g;
  };

  const radial = (cx: number, cy: number, r: number, stops: [number, string][]) => {
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    stops.forEach(([pos, col]) => g.addColorStop(pos, col));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, width, height);
    return g;
  };

  // Dedicated Frosted Glass renderer helper
  const drawFrostedGlass = (
    bgColor: string,
    orbs: Array<{ xRatio: number; yRatio: number; rRatio: number; color: string }>,
    cardBorderColor: string,
    cardFillAlpha = 0.04
  ) => {
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    orbs.forEach(orb => {
      const cx = width * orb.xRatio;
      const cy = height * orb.yRatio;
      const rad = Math.min(width, height) * orb.rRatio;
      const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
      g.addColorStop(0, orb.color);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, width, height);
    });

    const marginX = width * 0.035;
    const marginY = height * 0.045;
    const cardW = width - marginX * 2;
    const cardH = height - marginY * 2;
    const rx = 18;

    ctx.fillStyle = `rgba(255, 255, 255, ${cardFillAlpha})`;
    ctx.strokeStyle = cardBorderColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(marginX, marginY, cardW, cardH, rx);
    else ctx.rect(marginX, marginY, cardW, cardH);
    ctx.fill();
    ctx.stroke();

    // Top subtle reflection line inside glass
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(marginX + rx, marginY + 1);
    ctx.lineTo(marginX + cardW - rx, marginY + 1);
    ctx.stroke();
  };

  switch (presetId) {
    // 1. Cyber Discord Dark
    case 'cyber-discord': {
      ctx.fillStyle = '#1E1F22';
      ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = 'rgba(88, 101, 242, 0.09)';
      ctx.lineWidth = 1.5;
      for (let x = -height; x < width + height; x += 36) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x + height, height); ctx.stroke();
      }
      radial(width * 0.85, height * 0.15, Math.min(width, height) * 0.7, [[0, 'rgba(88, 101, 242, 0.35)'], [1, 'rgba(88, 101, 242, 0)']]);
      break;
    }

    // 2. Aurora Mesh Glow
    case 'aurora-glow': {
      ctx.fillStyle = '#0B0D13';
      ctx.fillRect(0, 0, width, height);
      radial(width * 0.15, height * 0.2, Math.min(width, height) * 0.8, [[0, 'rgba(0, 240, 255, 0.35)'], [1, 'rgba(0, 240, 255, 0)']]);
      radial(width * 0.85, height * 0.8, Math.min(width, height) * 0.7, [[0, 'rgba(235, 69, 158, 0.35)'], [1, 'rgba(235, 69, 158, 0)']]);
      radial(width * 0.5, height * 0.5, Math.min(width, height) * 0.6, [[0, 'rgba(88, 101, 242, 0.25)'], [1, 'rgba(88, 101, 242, 0)']]);
      break;
    }

    // 3. Synthwave Horizon
    case 'synthwave-grid': {
      linear(0, 0, 0, height, [[0, '#0F051D'], [0.55, '#39084B'], [0.75, '#EB459E'], [1, '#FEE75C']]);
      const horizonY = height * 0.65;
      ctx.fillStyle = '#08020E';
      ctx.fillRect(0, horizonY, width, height - horizonY);
      ctx.strokeStyle = '#00F0FF';
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(0, horizonY); ctx.lineTo(width, horizonY); ctx.stroke();
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.35)';
      ctx.lineWidth = 1;
      const vpX = width / 2;
      for (let bx = -width; bx <= width * 2; bx += 50) {
        ctx.beginPath(); ctx.moveTo(vpX, horizonY); ctx.lineTo(bx, height); ctx.stroke();
      }
      break;
    }

    // 4. Hexagones Cybernétiques
    case 'isometric-hex': {
      ctx.fillStyle = '#111418';
      ctx.fillRect(0, 0, width, height);
      radial(width * 0.9, height * 0.1, Math.min(width, height) * 0.7, [[0, 'rgba(87, 242, 135, 0.25)'], [1, 'rgba(87, 242, 135, 0)']]);
      ctx.strokeStyle = 'rgba(87, 242, 135, 0.1)';
      ctx.lineWidth = 1;
      const hexSize = 28;
      const hDist = hexSize * Math.sqrt(3);
      const vDist = hexSize * 1.5;
      for (let r = 0; r < height / vDist + 2; r++) {
        for (let c = 0; c < width / hDist + 2; c++) {
          const cx = c * hDist + ((r % 2) * hDist) / 2;
          const cy = r * vDist;
          drawHexagon(ctx, cx, cy, hexSize);
        }
      }
      break;
    }

    // 5. Frosted Glass Slate (Original)
    case 'frosted-glass': {
      drawFrostedGlass(
        '#14161B',
        [{ xRatio: 0.5, yRatio: 0.4, rRatio: 0.65, color: 'rgba(99, 102, 241, 0.35)' }],
        'rgba(255, 255, 255, 0.12)'
      );
      break;
    }

    // 6. Midnight Nitro Purple
    case 'midnight-nitro': {
      linear(0, 0, width, height, [[0, '#10051C'], [0.5, '#2D0A4E'], [1, '#6F1AB6']]);
      radial(width * 0.2, height * 0.8, Math.min(width, height) * 0.6, [[0, 'rgba(254, 231, 92, 0.2)'], [1, 'rgba(254, 231, 92, 0)']]);
      break;
    }

    // 7. Matrix Digital Neon
    case 'neon-matrix': {
      ctx.fillStyle = '#050B07';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = 'rgba(87, 242, 135, 0.14)';
      ctx.font = '12px monospace';
      for (let x = 15; x < width; x += 25) {
        for (let y = 20; y < height; y += 30) {
          ctx.fillText(String.fromCharCode(0x30A0 + Math.floor((x * 7 + y * 13) % 96)), x, y);
        }
      }
      break;
    }

    // 8. Crimson Void
    case 'crimson-void': {
      linear(0, 0, width, height, [[0, '#120507'], [0.6, '#380B12'], [1, '#ED4245']]);
      radial(width * 0.85, height * 0.2, Math.min(width, height) * 0.7, [[0, 'rgba(255, 100, 100, 0.25)'], [1, 'rgba(255, 100, 100, 0)']]);
      break;
    }

    // 9. Emerald Circuit
    case 'emerald-circuit': {
      linear(0, 0, width, height, [[0, '#06130C'], [0.6, '#0B2618'], [1, '#104A2F']]);
      ctx.strokeStyle = 'rgba(87, 242, 135, 0.2)';
      ctx.lineWidth = 1.5;
      for (let y = 30; y < height; y += 60) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width * 0.4, y);
        ctx.lineTo(width * 0.5, y + 25);
        ctx.lineTo(width, y + 25);
        ctx.stroke();
      }
      break;
    }

    // 10. Sunset Rose & Gold
    case 'sunset-gradient': {
      linear(0, 0, width, height, [[0, '#1C0617'], [0.4, '#5C143B'], [0.8, '#D83A56'], [1, '#FFAC41']]);
      break;
    }

    // 11. Ocean Abyss & Trench
    case 'ocean-abyss': {
      linear(0, 0, 0, height, [[0, '#040C17'], [0.5, '#0A2540'], [1, '#00D2FF']]);
      radial(width * 0.5, height * 0.85, Math.min(width, height) * 0.6, [[0, 'rgba(0, 240, 255, 0.25)'], [1, 'rgba(0, 240, 255, 0)']]);
      break;
    }

    // 12. Studio Minimal Slate
    case 'studio-minimal': {
      linear(0, 0, width, height, [[0, '#0F1014'], [1, '#1A1C23']]);
      radial(width / 2, height / 2, Math.max(width, height) * 0.6, [[0, 'rgba(255, 255, 255, 0.04)'], [1, 'rgba(255, 255, 255, 0)']]);
      break;
    }

    // 13. Golden Luxury Noir
    case 'golden-luxury': {
      linear(0, 0, width, height, [[0, '#0E0C07'], [0.6, '#241E0F'], [1, '#E6B800']]);
      radial(width * 0.8, height * 0.2, Math.min(width, height) * 0.6, [[0, 'rgba(255, 215, 0, 0.25)'], [1, 'rgba(255, 215, 0, 0)']]);
      break;
    }

    // 14. High-Tech Matrix Dots
    case 'hightech-dots': {
      ctx.fillStyle = '#0B0D14';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = 'rgba(0, 240, 255, 0.15)';
      for (let x = 20; x < width; x += 30) {
        for (let y = 20; y < height; y += 30) {
          ctx.beginPath();
          ctx.arc(x, y, 1.2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      radial(width * 0.8, height * 0.3, Math.min(width, height) * 0.6, [[0, 'rgba(56, 189, 248, 0.2)'], [1, 'rgba(56, 189, 248, 0)']]);
      break;
    }

    // 15. Hologram Scanlines
    case 'hologram-scan': {
      linear(0, 0, 0, height, [[0, '#051016'], [0.7, '#0A2636'], [1, '#00F0FF']]);
      ctx.fillStyle = 'rgba(0, 240, 255, 0.05)';
      for (let y = 0; y < height; y += 4) {
        ctx.fillRect(0, y, width, 1.5);
      }
      break;
    }

    // 16. Vaporwave Pastel Lilac
    case 'vaporwave-pastel': {
      linear(0, 0, width, height, [[0, '#281136'], [0.5, '#683680'], [1, '#FFB7C5']]);
      radial(width * 0.2, height * 0.8, Math.min(width, height) * 0.6, [[0, 'rgba(147, 197, 253, 0.3)'], [1, 'rgba(147, 197, 253, 0)']]);
      break;
    }

    // 17. Low-Poly Mesh Géométrique
    case 'cyber-poly-mesh': {
      linear(0, 0, width, height, [[0, '#07101E'], [0.5, '#0F223D'], [1, '#1E4068']]);
      ctx.strokeStyle = 'rgba(100, 255, 218, 0.12)';
      ctx.lineWidth = 1;
      const step = 60;
      for (let x = 0; x < width + step; x += step) {
        for (let y = 0; y < height + step; y += step) {
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + step, y);
          ctx.lineTo(x + step / 2, y + step);
          ctx.closePath();
          ctx.stroke();
        }
      }
      radial(width * 0.85, height * 0.15, Math.min(width, height) * 0.65, [[0, 'rgba(100, 255, 218, 0.25)'], [1, 'rgba(100, 255, 218, 0)']]);
      break;
    }

    // 18. Anneaux Quantiques Centrés
    case 'quantum-rings': {
      ctx.fillStyle = '#070612';
      ctx.fillRect(0, 0, width, height);
      const qx = width / 2;
      const qy = height / 2;
      radial(qx, qy, Math.min(width, height) * 0.55, [[0, 'rgba(99, 102, 241, 0.3)'], [1, 'rgba(99, 102, 241, 0)']]);
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.15)';
      ctx.lineWidth = 1.5;
      for (let rad = 30; rad < Math.max(width, height); rad += 35) {
        ctx.beginPath();
        ctx.arc(qx, qy, rad, 0, Math.PI * 2);
        ctx.stroke();
      }
      break;
    }

    // 19. Prisme Diagonal Facetté
    case 'diagonal-prism': {
      linear(0, 0, width, height, [[0, '#10051F'], [0.5, '#2D0F55'], [1, '#6F28D1']]);
      ctx.fillStyle = 'rgba(144, 85, 255, 0.08)';
      for (let i = -width; i < width * 2; i += 70) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i + height * 0.6, height);
        ctx.lineTo(i + height * 0.6 + 35, height);
        ctx.lineTo(i + 35, 0);
        ctx.closePath();
        ctx.fill();
      }
      break;
    }

    // 20. Grille Filaire Perspective 3D
    case 'retrowave-wireframe': {
      linear(0, 0, 0, height, [[0, '#12021A'], [0.5, '#280538'], [0.75, '#780B5E'], [1, '#FF2A85']]);
      const rHorizon = height * 0.55;
      ctx.fillStyle = '#08010B';
      ctx.fillRect(0, rHorizon, width, height - rHorizon);
      ctx.strokeStyle = '#FF2A85';
      ctx.lineWidth = 1.5;
      const rVp = width / 2;
      for (let x = -width; x <= width * 2; x += 40) {
        ctx.beginPath(); ctx.moveTo(rVp, rHorizon); ctx.lineTo(x, height); ctx.stroke();
      }
      for (let y = rHorizon; y <= height; y += (y - rHorizon + 8) * 0.4) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
      }
      break;
    }

    // 21. Vagues Fluides Luminescentes
    case 'abstract-waves': {
      linear(0, 0, width, height, [[0, '#040915'], [0.5, '#0C1C3E'], [1, '#1A458E']]);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        ctx.moveTo(0, height * 0.3 + i * 25);
        ctx.bezierCurveTo(width * 0.3, height * 0.1 + i * 20, width * 0.7, height * 0.6 + i * 20, width, height * 0.4 + i * 25);
        ctx.stroke();
      }
      break;
    }

    // 22. Vitesse Warp Hyper-Espace
    case 'hyper-speed': {
      ctx.fillStyle = '#02040A';
      ctx.fillRect(0, 0, width, height);
      const wcx = width / 2;
      const wcy = height / 2;
      radial(wcx, wcy, Math.min(width, height) * 0.6, [[0, 'rgba(59, 130, 246, 0.4)'], [1, 'rgba(0,0,0,0)']]);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
      ctx.lineWidth = 1.2;
      for (let a = 0; a < Math.PI * 2; a += Math.PI / 16) {
        const len = Math.min(width, height) * 0.8;
        ctx.beginPath();
        ctx.moveTo(wcx + Math.cos(a) * 30, wcy + Math.sin(a) * 30);
        ctx.lineTo(wcx + Math.cos(a) * len, wcy + Math.sin(a) * len);
        ctx.stroke();
      }
      break;
    }

    // 23. Microprocesseur & Puces
    case 'digital-circuit': {
      linear(0, 0, width, height, [[0, '#04070F'], [0.6, '#0B1728'], [1, '#163359']]);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.18)';
      ctx.lineWidth = 1.5;
      for (let x = 40; x < width; x += 80) {
        ctx.strokeRect(x, 40, 40, 40);
        ctx.beginPath(); ctx.moveTo(x + 20, 80); ctx.lineTo(x + 20, height); ctx.stroke();
      }
      break;
    }

    // 24. Fibre de Carbone Tissée
    case 'carbon-fiber': {
      ctx.fillStyle = '#0B0C0E';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      for (let x = 0; x < width; x += 12) {
        for (let y = 0; y < height; y += 12) {
          if ((x + y) % 24 === 0) ctx.fillRect(x, y, 10, 10);
        }
      }
      break;
    }

    // 25. Galaxie Spirale & Nébuleuse
    case 'nebula-galaxy': {
      linear(0, 0, width, height, [[0, '#0A0413'], [0.5, '#2D0A4E'], [1, '#7C1F9E']]);
      radial(width * 0.7, height * 0.3, Math.min(width, height) * 0.7, [[0, 'rgba(236, 72, 153, 0.35)'], [1, 'rgba(0,0,0,0)']]);
      radial(width * 0.3, height * 0.7, Math.min(width, height) * 0.6, [[0, 'rgba(56, 189, 248, 0.3)'], [1, 'rgba(0,0,0,0)']]);
      break;
    }

    // 26. Effet Glitch & Bandes Néon
    case 'cyber-glitch': {
      ctx.fillStyle = '#08080C';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = 'rgba(0, 240, 255, 0.08)';
      ctx.fillRect(0, height * 0.2, width, 18);
      ctx.fillRect(0, height * 0.55, width, 24);
      ctx.fillStyle = 'rgba(255, 0, 85, 0.08)';
      ctx.fillRect(0, height * 0.25, width, 12);
      ctx.fillRect(0, height * 0.65, width, 16);
      break;
    }

    // 27. Cercles Bokeh Lumineux
    case 'neon-bokeh': {
      linear(0, 0, width, height, [[0, '#0B0516'], [0.5, '#240A3D'], [1, '#4A1468']]);
      const bokehColors = ['rgba(236, 72, 153, 0.25)', 'rgba(139, 92, 246, 0.25)', 'rgba(56, 189, 248, 0.25)'];
      for (let i = 0; i < 12; i++) {
        const bx = (width * ((i * 37) % 100)) / 100;
        const by = (height * ((i * 53) % 100)) / 100;
        const br = 25 + (i * 7) % 45;
        radial(bx, by, br, [[0, bokehColors[i % 3]], [1, 'rgba(0,0,0,0)']]);
      }
      break;
    }

    // 28. Dispersion Spectrale Prismatique
    case 'prism-refraction': {
      linear(0, 0, width, height, [
        [0, '#0A0E1A'],
        [0.3, '#1E293B'],
        [0.5, '#0E7490'],
        [0.7, '#A16207'],
        [1, '#991B1B']
      ]);
      break;
    }

    // 29. Vide Spatial & Étoiles
    case 'deep-space': {
      ctx.fillStyle = '#030308';
      ctx.fillRect(0, 0, width, height);
      radial(width * 0.5, height * 0.5, Math.max(width, height) * 0.6, [[0, 'rgba(30, 27, 75, 0.4)'], [1, 'rgba(0,0,0,0)']]);
      ctx.fillStyle = '#FFFFFF';
      for (let i = 0; i < 60; i++) {
        const sx = (width * ((i * 47) % 100)) / 100;
        const sy = (height * ((i * 73) % 100)) / 100;
        const sr = (i % 3 === 0) ? 1.5 : 0.8;
        ctx.beginPath(); ctx.arc(sx, sy, sr, 0, Math.PI * 2); ctx.fill();
      }
      break;
    }

    // 30. Éruption Solaire Incandescente
    case 'solar-flare': {
      radial(width * 0.1, height * 0.1, Math.min(width, height) * 1.1, [
        [0, '#FEF08A'],
        [0.3, '#F97316'],
        [0.7, '#7F1D1D'],
        [1, '#0C0303']
      ]);
      break;
    }

    // 31. Vert Toxique & Particules
    case 'toxic-waste': {
      radial(width * 0.5, height * 0.9, Math.min(width, height) * 0.8, [
        [0, 'rgba(34, 197, 94, 0.4)'],
        [0.5, 'rgba(6, 78, 59, 0.8)'],
        [1, '#021F17']
      ]);
      break;
    }

    // 32. Orage Électrique & Éclairs
    case 'electric-storm': {
      linear(0, 0, 0, height, [[0, '#090E17'], [0.6, '#172554'], [1, '#3B82F6']]);
      radial(width * 0.7, height * 0.2, Math.min(width, height) * 0.6, [[0, 'rgba(191, 219, 254, 0.4)'], [1, 'rgba(0,0,0,0)']]);
      break;
    }

    // 33. Tunnel Hexagonal Infini
    case 'cyber-tunnel': {
      ctx.fillStyle = '#020617';
      ctx.fillRect(0, 0, width, height);
      const tcx = width / 2;
      const tcy = height / 2;
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.25)';
      ctx.lineWidth = 1.5;
      for (let s = 20; s < Math.max(width, height); s += 30) {
        drawHexagon(ctx, tcx, tcy, s);
      }
      break;
    }

    // 34. Noyau de Magma & Lave
    case 'magma-core': {
      linear(0, 0, width, height, [[0, '#150303'], [0.5, '#450A0A'], [1, '#B91C1C']]);
      radial(width * 0.8, height * 0.8, Math.min(width, height) * 0.6, [[0, 'rgba(251, 146, 60, 0.35)'], [1, 'rgba(0,0,0,0)']]);
      break;
    }

    // 35. Pétales Sakura & Nuit de Tokyo
    case 'sakura-night': {
      linear(0, 0, 0, height, [[0, '#080312'], [0.6, '#280738'], [1, '#F472B6']]);
      radial(width * 0.85, height * 0.15, Math.min(width, height) * 0.5, [[0, 'rgba(255, 255, 255, 0.2)'], [1, 'rgba(0,0,0,0)']]);
      break;
    }

    // 36. Caverne de Cristaux & Améthyste
    case 'crystal-cave': {
      linear(0, 0, width, height, [[0, '#0C0318'], [0.5, '#2E0854'], [1, '#9333EA']]);
      radial(width * 0.2, height * 0.3, Math.min(width, height) * 0.6, [[0, 'rgba(192, 132, 252, 0.3)'], [1, 'rgba(0,0,0,0)']]);
      break;
    }

    // 37. Nitro Améthyste Sombre
    case 'deep-purple-nitro': {
      linear(0, 0, width, height, [[0, '#15052A'], [0.5, '#3B0764'], [1, '#06B6D4']]);
      break;
    }

    // 38. Supernova Stellaire Dorée
    case 'supernova': {
      radial(width * 0.5, height * 0.5, Math.min(width, height) * 0.7, [
        [0, '#FFFFFF'],
        [0.25, '#FBBF24'],
        [0.6, '#78350F'],
        [1, '#090502']
      ]);
      break;
    }

    // 39. Givre & Glace Polaire
    case 'frost-crystal': {
      linear(0, 0, width, height, [[0, '#061320'], [0.5, '#0C2E4E'], [1, '#7DD3FC']]);
      radial(width * 0.8, height * 0.2, Math.min(width, height) * 0.5, [[0, 'rgba(255, 255, 255, 0.3)'], [1, 'rgba(0,0,0,0)']]);
      break;
    }

    // 40. Lune Rouge Sang & Brume
    case 'blood-moon': {
      ctx.fillStyle = '#0D0204';
      ctx.fillRect(0, 0, width, height);
      radial(width * 0.75, height * 0.25, Math.min(width, height) * 0.4, [
        [0, '#EF4444'],
        [0.7, '#7F1D1D'],
        [1, 'rgba(127, 29, 29, 0)']
      ]);
      break;
    }

    // 41. Thé Vert Zen & Crème
    case 'zen-gradient': {
      linear(0, 0, width, height, [[0, '#04130E'], [0.5, '#064E3B'], [1, '#34D399']]);
      break;
    }

    // 42. Barbe à Papa Pastel
    case 'cotton-candy': {
      linear(0, 0, width, height, [[0, '#140A22'], [0.4, '#581C87'], [0.75, '#EC4899'], [1, '#38BDF8']]);
      break;
    }

    // 43. Obsidienne Noire & Filets d'Or
    case 'obsidian-gold': {
      linear(0, 0, width, height, [[0, '#08080A'], [0.6, '#18181B'], [1, '#CA8A04']]);
      ctx.strokeStyle = 'rgba(234, 179, 8, 0.25)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(0, height * 0.8);
      ctx.lineTo(width * 0.6, height * 0.4);
      ctx.lineTo(width, height * 0.6);
      ctx.stroke();
      break;
    }

    // 44. Papier Holographique Métallisé
    case 'holographic-foil': {
      linear(0, 0, width, height, [[0, '#131138'], [0.3, '#3730A3'], [0.6, '#DB2777'], [1, '#06B6D4']]);
      break;
    }

    // 45. Dunes Désertiques & Crépuscule
    case 'dune-sunset': {
      linear(0, 0, 0, height, [[0, '#140513'], [0.4, '#4A0E4E'], [0.75, '#9A3412'], [1, '#FBBF24']]);
      break;
    }

    // 46. Bioluminescence Sous-Marine
    case 'deep-sea-bioluminescence': {
      radial(width * 0.5, height * 0.85, Math.min(width, height) * 0.75, [
        [0, '#2DD4BF'],
        [0.4, '#0D9488'],
        [0.7, '#042F2E'],
        [1, '#021312']
      ]);
      break;
    }

    // 47. Plan d'Architecte Blueprint
    case 'blueprint-grid': {
      linear(0, 0, width, height, [[0, '#081426'], [1, '#132F54']]);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 25) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
      }
      for (let y = 0; y < height; y += 25) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
      }
      break;
    }

    // 48. Arcade Rétro 90s Néon
    case 'arcade-neon': {
      linear(0, 0, width, height, [[0, '#0D001A'], [0.5, '#3B0066'], [1, '#00F0FF']]);
      radial(width * 0.8, height * 0.2, Math.min(width, height) * 0.5, [[0, 'rgba(235, 69, 158, 0.35)'], [1, 'rgba(0,0,0,0)']]);
      break;
    }

    // 49. Bandes de Sécurité Cyber
    case 'techno-stripes': {
      ctx.fillStyle = '#0A0A0E';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = 'rgba(234, 179, 8, 0.12)';
      for (let x = -height; x < width + height; x += 45) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + 20, 0);
        ctx.lineTo(x + 20 + height, height);
        ctx.lineTo(x + height, height);
        ctx.closePath();
        ctx.fill();
      }
      break;
    }

    // 50. Aurore Cosmique Multi-Dimensionnelle
    case 'cosmic-aurora-3d': {
      linear(0, 0, width, height, [[0, '#04040A'], [0.4, '#170B2C'], [0.7, '#064E3B'], [1, '#06B6D4']]);
      radial(width * 0.5, height * 0.5, Math.min(width, height) * 0.6, [[0, 'rgba(168, 85, 247, 0.25)'], [1, 'rgba(0,0,0,0)']]);
      break;
    }

    // 51. Frosted Glass Cyan Aura
    case 'glass-cyan-aura': {
      drawFrostedGlass(
        '#040913',
        [{ xRatio: 0.8, yRatio: 0.2, rRatio: 0.7, color: 'rgba(0, 240, 255, 0.35)' }],
        'rgba(0, 240, 255, 0.25)',
        0.05
      );
      break;
    }

    // 52. Frosted Glass Violet Glow
    case 'glass-violet-neon': {
      drawFrostedGlass(
        '#0B0414',
        [{ xRatio: 0.25, yRatio: 0.75, rRatio: 0.65, color: 'rgba(168, 85, 247, 0.38)' }],
        'rgba(168, 85, 247, 0.25)',
        0.05
      );
      break;
    }

    // 53. Frosted Glass Émeraude
    case 'glass-emerald-pulse': {
      drawFrostedGlass(
        '#030E0A',
        [{ xRatio: 0.8, yRatio: 0.2, rRatio: 0.7, color: 'rgba(16, 185, 129, 0.35)' }],
        'rgba(16, 185, 129, 0.25)',
        0.05
      );
      break;
    }

    // 54. Frosted Glass Sunset Ambre
    case 'glass-sunset-amber': {
      drawFrostedGlass(
        '#110410',
        [
          { xRatio: 0.75, yRatio: 0.25, rRatio: 0.6, color: 'rgba(249, 115, 22, 0.35)' },
          { xRatio: 0.25, yRatio: 0.8, rRatio: 0.5, color: 'rgba(219, 39, 119, 0.3)' }
        ],
        'rgba(249, 115, 22, 0.25)',
        0.05
      );
      break;
    }

    // 55. Frosted Glass Noir Titane
    case 'glass-midnight-noir': {
      drawFrostedGlass(
        '#09090B',
        [{ xRatio: 0.5, yRatio: 0.5, rRatio: 0.75, color: 'rgba(255, 255, 255, 0.08)' }],
        'rgba(255, 255, 255, 0.15)',
        0.03
      );
      break;
    }

    // 56. Frosted Glass Crimson Flame
    case 'glass-crimson-flame': {
      drawFrostedGlass(
        '#140306',
        [{ xRatio: 0.85, yRatio: 0.15, rRatio: 0.7, color: 'rgba(239, 68, 68, 0.35)' }],
        'rgba(239, 68, 68, 0.25)',
        0.05
      );
      break;
    }

    // 57. Frosted Glass Dual Aurora
    case 'glass-aurora-dual': {
      drawFrostedGlass(
        '#060810',
        [
          { xRatio: 0.15, yRatio: 0.2, rRatio: 0.65, color: 'rgba(0, 240, 255, 0.35)' },
          { xRatio: 0.85, yRatio: 0.8, rRatio: 0.65, color: 'rgba(236, 72, 153, 0.35)' }
        ],
        'rgba(255, 255, 255, 0.16)',
        0.06
      );
      break;
    }

    // 58. Frosted Glass Or Champagne
    case 'glass-golden-champagne': {
      drawFrostedGlass(
        '#0E0A04',
        [{ xRatio: 0.3, yRatio: 0.7, rRatio: 0.65, color: 'rgba(250, 204, 21, 0.35)' }],
        'rgba(250, 204, 21, 0.25)',
        0.05
      );
      break;
    }

    // 59. Frosted Glass Glacier Polaire
    case 'glass-ice-glacier': {
      drawFrostedGlass(
        '#031422',
        [{ xRatio: 0.65, yRatio: 0.25, rRatio: 0.7, color: 'rgba(224, 242, 254, 0.3)' }],
        'rgba(186, 230, 253, 0.28)',
        0.07
      );
      break;
    }

    // 60. Frosted Glass Discord Blurple
    case 'glass-cyber-blurple':
    default: {
      drawFrostedGlass(
        '#090916',
        [
          { xRatio: 0.8, yRatio: 0.2, rRatio: 0.7, color: 'rgba(88, 101, 242, 0.38)' },
          { xRatio: 0.2, yRatio: 0.8, rRatio: 0.5, color: 'rgba(87, 242, 135, 0.25)' }
        ],
        'rgba(88, 101, 242, 0.28)',
        0.06
      );
      break;
    }
  }

  ctx.restore();
}

function drawHexagon(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const hx = x + r * Math.cos(angle);
    const hy = y + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(hx, hy);
    else ctx.lineTo(hx, hy);
  }
  ctx.closePath();
  ctx.stroke();
}
