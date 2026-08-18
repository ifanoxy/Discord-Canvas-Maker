import type { BackgroundConfig } from './presets';

export interface ExportCodeOptions {
  language: 'typescript' | 'javascript';
  canvasWidth: number;
  canvasHeight: number;
  bgConfig?: BackgroundConfig;
  canvasObjects: any[];
}

interface ExtractedOption {
  key: string;
  type: string;
  comment?: string;
}

export function generateNodeCanvasCode({
  language = 'typescript',
  canvasWidth = 800,
  canvasHeight = 600,
  bgConfig = {
    type: 'color',
    color: '#313338',
    gradientStart: '#5865F2',
    gradientEnd: '#1E1F22',
    gradientAngle: 135,
    gradientType: 'linear',
    imageUrl: '',
    presetId: 'cyber-discord'
  },
  canvasObjects = []
}: ExportCodeOptions): string {
  const isTS = language === 'typescript';

  // 1. Extract exact dynamic variables from canvas objects
  const dynamicOptionsMap = new Map<string, ExtractedOption>();

  canvasObjects.forEach((obj, idx) => {
    const customKey = obj.paramKey;

    if (obj.type === 'i-text' || obj.type === 'text') {
      const match = (obj.text || '').match(/\{([a-zA-Z0-9_]+)\}/);
      const varKey = customKey || (match ? match[1] : undefined);
      if (varKey) {
        dynamicOptionsMap.set(varKey, {
          key: varKey,
          type: 'string',
          comment: `Texte dynamique pour: "${obj.text}"`
        });
      }
    } else if (obj.type === 'progress-bar') {
      const varKey = customKey || (idx === 0 ? 'progress' : `progress_${idx + 1}`);
      dynamicOptionsMap.set(varKey, {
        key: varKey,
        type: 'number | { value: number; max: number }',
        comment: `Progression de la jauge (${obj.barStyle || 'horizontal'})`
      });
    } else if (obj.type === 'discord-avatar') {
      const mode = obj.displayMode || 'both';
      if (mode !== 'status-only') {
        const avKey = customKey || 'avatarUrl';
        dynamicOptionsMap.set(avKey, {
          key: avKey,
          type: 'string',
          comment: 'URL de l\'avatar Discord (PNG, JPG ou GIF)'
        });
      }
      if (mode !== 'avatar-only' && obj.status !== 'none') {
        const stKey = obj.paramKeyStatus || 'status';
        dynamicOptionsMap.set(stKey, {
          key: stKey,
          type: "'online' | 'idle' | 'dnd' | 'offline' | 'none'",
          comment: 'Statut Discord de l\'utilisateur'
        });
      }
    } else if (obj.type === 'discord-role-badge') {
      const roleKey = customKey || 'role';
      dynamicOptionsMap.set(roleKey, {
        key: roleKey,
        type: '{ name: string; color: string }',
        comment: `Informations du rôle Discord`
      });
    } else if (obj.type === 'discord-banner') {
      const bannerKey = customKey || 'bannerUrl';
      dynamicOptionsMap.set(bannerKey, {
        key: bannerKey,
        type: 'string',
        comment: 'URL de la bannière Discord'
      });
    }
  });

  const extractedOptions = Array.from(dynamicOptionsMap.values());

  let code = '';

  // 2. Header Imports
  if (isTS) {
    code += `import { createCanvas, loadImage, registerFont, CanvasRenderingContext2D } from 'canvas';\n`;
    code += `import * as path from 'path';\n\n`;

    // Strictly typed interface WITHOUT [key: string]: any;
    code += `/**\n * Options strictement typées pour la génération de cette image\n */\n`;
    code += `export interface CardOptions {\n`;
    if (extractedOptions.length === 0) {
      code += `  // Aucun paramètre dynamique configuré sur les composants\n`;
    } else {
      extractedOptions.forEach(opt => {
        if (opt.comment) code += `  /** ${opt.comment} */\n`;
        code += `  ${opt.key}?: ${opt.type};\n`;
      });
    }
    code += `}\n\n`;
  } else {
    code += `const { createCanvas, loadImage, registerFont } = require('canvas');\n`;
    code += `const path = require('path');\n\n`;
  }

  // 3. Helper Functions
  code += `// --- FONCTIONS UTILITAIRES DE DESSIN ---\n\n`;

  // RoundRect helper
  code += `function roundRect(${isTS ? 'ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number' : 'ctx, x, y, width, height, radius'}) {\n`;
  code += `  const r = Math.min(radius || 0, width / 2, height / 2);\n`;
  code += `  ctx.beginPath();\n`;
  code += `  ctx.moveTo(x + r, y);\n`;
  code += `  ctx.lineTo(x + width - r, y);\n`;
  code += `  ctx.quadraticCurveTo(x + width, y, x + width, y + r);\n`;
  code += `  ctx.lineTo(x + width, y + height - r);\n`;
  code += `  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);\n`;
  code += `  ctx.lineTo(x + r, y + height);\n`;
  code += `  ctx.quadraticCurveTo(x, y + height, x, y + height - r);\n`;
  code += `  ctx.lineTo(x, y + r);\n`;
  code += `  ctx.quadraticCurveTo(x, y, x + r, y);\n`;
  code += `  ctx.closePath();\n`;
  code += `}\n\n`;

  // Hex to RGBA helper
  code += `function hexToRgba(${isTS ? 'hex: string, alpha: number' : 'hex, alpha'}) {\n`;
  code += `  let c = hex.replace('#', '');\n`;
  code += `  if (c.length === 3) c = c.split('').map(x => x + x).join('');\n`;
  code += `  if (c.length !== 6) return \`rgba(88, 101, 242, \${alpha})\`;\n`;
  code += `  const num = parseInt(c, 16);\n`;
  code += `  return \`rgba(\${(num >> 16) & 255}, \${(num >> 8) & 255}, \${num & 255}, \${alpha})\`;\n`;
  code += `}\n\n`;

  // Auto-truncate or fit text helper
  code += `function drawFittedText(${isTS ? 'ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth?: number' : 'ctx, text, x, y, maxWidth'}) {\n`;
  code += `  if (!maxWidth || ctx.measureText(text).width <= maxWidth) {\n`;
  code += `    ctx.fillText(text, x, y);\n`;
  code += `    return;\n`;
  code += `  }\n`;
  code += `  let truncated = text;\n`;
  code += `  while (truncated.length > 1 && ctx.measureText(truncated + '...').width > maxWidth) {\n`;
  code += `    truncated = truncated.slice(0, -1);\n`;
  code += `  }\n`;
  code += `  ctx.fillText(truncated + '...', x, y);\n`;
  code += `}\n\n`;

  // Draw Preset Background Helper
  code += `function drawPresetBackground(${isTS ? 'ctx: CanvasRenderingContext2D, width: number, height: number, presetId: string' : 'ctx, width, height, presetId'}) {\n`;
  code += `  ctx.fillStyle = '#111318'; ctx.fillRect(0, 0, width, height);\n`;
  code += `  const grad = ctx.createLinearGradient(0, 0, width, height);\n`;
  code += `  grad.addColorStop(0, '#1E1F22'); grad.addColorStop(1, '#5865F2');\n`;
  code += `  ctx.fillStyle = grad; ctx.fillRect(0, 0, width, height);\n`;
  code += `}\n\n`;

  // 4. Main Export Function Signature
  if (isTS) {
    code += `/**\n * Génère l'image Canvas Discord\n * @param options Paramètres dynamiques personnalisés\n * @returns Buffer PNG\n */\n`;
    code += `export async function generateDiscordCard(options: CardOptions = {}): Promise<Buffer> {\n`;
  } else {
    code += `/**\n * Génère l'image Canvas Discord\n * @param {Object} options Paramètres dynamiques personnalisés\n * @returns {Promise<Buffer>} Buffer PNG\n */\n`;
    code += `async function generateDiscordCard(options = {}) {\n`;
  }

  code += `  const canvas = createCanvas(${canvasWidth}, ${canvasHeight});\n`;
  code += `  const ctx = canvas.getContext('2d');\n\n`;

  // 5. Background Rendering
  code += `  // ================= 1. ARRIÈRE-PLAN =================\n`;
  if (bgConfig.type === 'transparent') {
    code += `  // Arrière-plan transparent (aucun remplissage opaque)\n`;
    code += `  ctx.clearRect(0, 0, ${canvasWidth}, ${canvasHeight});\n\n`;
  } else if (bgConfig.type === 'color') {
    code += `  ctx.fillStyle = '${bgConfig.color || '#313338'}';\n`;
    code += `  ctx.fillRect(0, 0, ${canvasWidth}, ${canvasHeight});\n\n`;
  } else if (bgConfig.type === 'gradient') {
    code += `  const bgGrad = ctx.createLinearGradient(0, 0, ${canvasWidth}, ${canvasHeight});\n`;
    code += `  bgGrad.addColorStop(0, '${bgConfig.gradientStart || '#5865F2'}');\n`;
    code += `  bgGrad.addColorStop(1, '${bgConfig.gradientEnd || '#1E1F22'}');\n`;
    code += `  ctx.fillStyle = bgGrad;\n`;
    code += `  ctx.fillRect(0, 0, ${canvasWidth}, ${canvasHeight});\n\n`;
  } else if (bgConfig.type === 'preset') {
    code += `  // Background Preset : ${bgConfig.presetId || 'cyber-discord'}\n`;
    code += `  drawPresetBackground(ctx, ${canvasWidth}, ${canvasHeight}, '${bgConfig.presetId || 'cyber-discord'}');\n\n`;
  }

  // 6. Canvas Elements Rendering
  code += `  // ================= 2. ÉLÉMENTS GRAPHIQUES =================\n\n`;

  for (let idx = 0; idx < canvasObjects.length; idx++) {
    const obj = canvasObjects[idx];
    const left = Math.round(obj.left || 0);
    const top = Math.round(obj.top || 0);
    const scaleX = obj.scaleX || 1;
    const scaleY = obj.scaleY || 1;
    const w = Math.round((obj.width || 0) * scaleX);
    const h = Math.round((obj.height || 0) * scaleY);
    const shadow = obj.shadow;
    const customKey = obj.paramKey;

    code += `  // [Élément #${idx + 1}: ${obj.type}${customKey ? ` | Variable: options.${customKey}` : ''}]\n`;
    code += `  ctx.save();\n`;

    // Apply Shadow if present
    if (shadow && shadow.color && shadow.color !== 'transparent' && shadow.blur > 0) {
      code += `  ctx.shadowColor = '${shadow.color}';\n`;
      code += `  ctx.shadowBlur = ${shadow.blur || 0};\n`;
      code += `  ctx.shadowOffsetX = ${shadow.offsetX || 0};\n`;
      code += `  ctx.shadowOffsetY = ${shadow.offsetY || 0};\n`;
    }

    if (obj.type === 'rect') {
      const rx = obj.rx || 0;
      const hasFill = obj.fill && obj.fill !== 'transparent';
      const hasStroke = obj.stroke && obj.stroke !== 'transparent' && obj.strokeWidth > 0;

      if (hasFill) {
        code += `  ctx.fillStyle = '${obj.fill}';\n`;
        if (rx > 0) {
          code += `  roundRect(ctx, ${left}, ${top}, ${w}, ${h}, ${rx});\n`;
          code += `  ctx.fill();\n`;
        } else {
          code += `  ctx.fillRect(${left}, ${top}, ${w}, ${h});\n`;
        }
      }
      if (hasStroke) {
        code += `  ctx.strokeStyle = '${obj.stroke}';\n`;
        code += `  ctx.lineWidth = ${obj.strokeWidth};\n`;
        if (rx > 0) {
          code += `  roundRect(ctx, ${left}, ${top}, ${w}, ${h}, ${rx});\n`;
          code += `  ctx.stroke();\n`;
        } else {
          code += `  ctx.strokeRect(${left}, ${top}, ${w}, ${h});\n`;
        }
      }
    } else if (obj.type === 'circle') {
      const radius = Math.round((obj.radius || 40) * scaleX);
      const cx = left + radius;
      const cy = top + radius;
      const hasFill = obj.fill && obj.fill !== 'transparent';
      const hasStroke = obj.stroke && obj.stroke !== 'transparent' && obj.strokeWidth > 0;

      if (hasFill) {
        code += `  ctx.fillStyle = '${obj.fill}';\n`;
        code += `  ctx.beginPath();\n`;
        code += `  ctx.arc(${cx}, ${cy}, ${radius}, 0, Math.PI * 2);\n`;
        code += `  ctx.fill();\n`;
      }
      if (hasStroke) {
        code += `  ctx.strokeStyle = '${obj.stroke}';\n`;
        code += `  ctx.lineWidth = ${obj.strokeWidth};\n`;
        code += `  ctx.beginPath();\n`;
        code += `  ctx.arc(${cx}, ${cy}, ${radius}, 0, Math.PI * 2);\n`;
        code += `  ctx.stroke();\n`;
      }
    } else if (obj.type === 'triangle') {
      code += `  ctx.fillStyle = '${obj.fill || '#FEE75C'}';\n`;
      code += `  ctx.beginPath();\n`;
      code += `  ctx.moveTo(${left + w / 2}, ${top});\n`;
      code += `  ctx.lineTo(${left + w}, ${top + h});\n`;
      code += `  ctx.lineTo(${left}, ${top + h});\n`;
      code += `  ctx.closePath();\n`;
      code += `  ctx.fill();\n`;
    } else if (obj.type === 'line') {
      code += `  ctx.strokeStyle = '${obj.stroke || '#5865F2'}';\n`;
      code += `  ctx.lineWidth = ${obj.strokeWidth || 4};\n`;
      code += `  ctx.lineCap = '${obj.strokeLineCap || 'round'}';\n`;
      code += `  ctx.beginPath();\n`;
      code += `  ctx.moveTo(${left}, ${top});\n`;
      code += `  ctx.lineTo(${left + w}, ${top + h});\n`;
      code += `  ctx.stroke();\n`;
    } else if (obj.type === 'circle-arc') {
      const r = obj.radius || 50;
      const sAngle = (((obj.startAngle || 0) * Math.PI) / 180).toFixed(4);
      const eAngle = (((obj.endAngle || 180) * Math.PI) / 180).toFixed(4);
      code += `  ctx.strokeStyle = '${obj.stroke || '#5865F2'}';\n`;
      code += `  ctx.lineWidth = ${obj.strokeWidth || 8};\n`;
      code += `  ctx.lineCap = '${obj.strokeLineCap || 'round'}';\n`;
      code += `  ctx.beginPath();\n`;
      code += `  ctx.arc(${left + r}, ${top + r}, ${r}, ${sAngle}, ${eAngle}, false);\n`;
      code += `  ctx.stroke();\n`;
    } else if (obj.type === 'i-text' || obj.type === 'text') {
      const fontSize = Math.round((obj.fontSize || 32) * scaleY);
      const fontWeight = obj.fontWeight || 'normal';
      const fontStyle = obj.fontStyle || 'normal';
      const fontFamily = obj.fontFamily || 'Inter';

      code += `  ctx.font = '${fontStyle} ${fontWeight} ${fontSize}px "${fontFamily}", sans-serif';\n`;
      code += `  ctx.fillStyle = '${obj.fill || '#F2F3F5'}';\n`;
      code += `  ctx.textBaseline = 'top';\n`;

      const match = (obj.text || '').match(/\{([a-zA-Z0-9_]+)\}/);
      const varKey = customKey || (match ? match[1] : undefined);
      if (varKey) {
        code += `  const val_${varKey} = options.${varKey} !== undefined ? String(options.${varKey}) : '${(obj.text || '').replace(/'/g, "\\'")}';\n`;
        code += `  drawFittedText(ctx, val_${varKey}, ${left}, ${top}, ${w > 50 ? w : 400});\n`;
      } else {
        code += `  drawFittedText(ctx, '${(obj.text || '').replace(/'/g, "\\'")}', ${left}, ${top});\n`;
      }
    } else if (obj.type === 'progress-bar') {
      const style = obj.barStyle || 'horizontal';
      const pbRx = obj.rx || 10;
      const pbMax = obj.progressMax || 100;
      const pbVal = obj.progressValue !== undefined ? obj.progressValue : 65;
      const varKey = customKey || (idx === 0 ? 'progress' : `progress_${idx + 1}`);
      const isGrad = !!obj.gradientFill;
      const gStart = obj.gradientStart || '#5865F2';
      const gEnd = obj.gradientEnd || '#57F287';

      code += `  // Progress Bar (${style}) -> Variable: options.${varKey}\n`;
      code += `  const optProg = options.${varKey};\n`;
      code += `  const pValue = typeof optProg === 'number' ? optProg : (typeof optProg === 'object' ? optProg.value : ${pbVal});\n`;
      code += `  const pMax = typeof optProg === 'object' && optProg.max ? optProg.max : ${pbMax};\n`;
      code += `  const pRatio = Math.max(0, Math.min(1, pValue / pMax));\n`;

      if (isGrad) {
        code += `  const pGrad = ctx.createLinearGradient(${left}, ${top}, ${left + w}, ${top + h});\n`;
        code += `  pGrad.addColorStop(0, '${gStart}');\n`;
        code += `  pGrad.addColorStop(1, '${gEnd}');\n`;
        code += `  const pFill = pGrad;\n`;
      } else {
        code += `  const pFill = '${obj.progressColor || '#57F287'}';\n`;
      }

      if (style === 'horizontal') {
        code += `  ctx.fillStyle = '${obj.barBackground || '#2B2D31'}';\n`;
        code += `  roundRect(ctx, ${left}, ${top}, ${w}, ${h}, ${pbRx});\n`;
        code += `  ctx.fill();\n`;
        code += `  if (pRatio > 0) {\n`;
        code += `    ctx.fillStyle = pFill;\n`;
        code += `    roundRect(ctx, ${left}, ${top}, Math.max(${pbRx * 2}, ${w} * pRatio), ${h}, ${pbRx});\n`;
        code += `    ctx.fill();\n`;
        code += `  }\n`;
      } else if (style === 'vertical') {
        code += `  ctx.fillStyle = '${obj.barBackground || '#2B2D31'}';\n`;
        code += `  roundRect(ctx, ${left}, ${top}, ${w}, ${h}, ${pbRx});\n`;
        code += `  ctx.fill();\n`;
        code += `  if (pRatio > 0) {\n`;
        code += `    ctx.fillStyle = pFill;\n`;
        code += `    const pH = Math.max(${pbRx * 2}, ${h} * pRatio);\n`;
        code += `    roundRect(ctx, ${left}, ${top + h} - pH, ${w}, pH, ${pbRx});\n`;
        code += `    ctx.fill();\n`;
        code += `  }\n`;
      } else if (style === 'segmented') {
        const segs = obj.segments || 10;
        code += `  const totalSegs = ${segs};\n`;
        code += `  const segGap = 4;\n`;
        code += `  const sWidth = (${w} - segGap * (totalSegs - 1)) / totalSegs;\n`;
        code += `  const activeSegs = Math.round(pRatio * totalSegs);\n`;
        code += `  for (let s = 0; s < totalSegs; s++) {\n`;
        code += `    const sX = ${left} + s * (sWidth + segGap);\n`;
        code += `    ctx.fillStyle = s < activeSegs ? pFill : '${obj.barBackground || '#2B2D31'}';\n`;
        code += `    roundRect(ctx, sX, ${top}, sWidth, ${h}, Math.min(${pbRx}, sWidth / 2));\n`;
        code += `    ctx.fill();\n`;
        code += `  }\n`;
      } else if (style === 'circular' || style === 'radial') {
        const isRad = style === 'radial';
        code += `  const ringRadius = Math.min(${w}, ${h}) / 2 - 10;\n`;
        code += `  const ringX = ${left} + ${w / 2};\n`;
        code += `  const ringY = ${top} + ${h / 2};\n`;
        code += `  const startA = ${isRad ? '(150 * Math.PI) / 180' : '-Math.PI / 2'};\n`;
        code += `  const totalA = ${isRad ? '(240 * Math.PI) / 180' : 'Math.PI * 2'};\n`;
        code += `  ctx.lineWidth = Math.max(6, Math.min(${w}, ${h}) * 0.12);\n`;
        code += `  ctx.lineCap = 'round';\n`;
        code += `  ctx.strokeStyle = '${obj.barBackground || '#2B2D31'}';\n`;
        code += `  ctx.beginPath(); ctx.arc(ringX, ringY, ringRadius, startA, startA + totalA, false); ctx.stroke();\n`;
        code += `  if (pRatio > 0) {\n`;
        code += `    ctx.strokeStyle = pFill;\n`;
        code += `    ctx.beginPath(); ctx.arc(ringX, ringY, ringRadius, startA, startA + totalA * pRatio, false); ctx.stroke();\n`;
        code += `  }\n`;
        if (obj.showPercentageText) {
          code += `  ctx.fillStyle = '#FFFFFF';\n`;
          code += `  ctx.font = 'bold ' + Math.round(ringRadius * 0.55) + 'px Inter, sans-serif';\n`;
          code += `  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';\n`;
          code += `  ctx.fillText(Math.round(pRatio * 100) + '%', ringX, ringY);\n`;
        }
      }
    } else if (obj.type === 'discord-avatar') {
      const r = Math.round(obj.avatarRadius || 50);
      const bWidth = obj.borderWidth || 0;
      const bColor = obj.borderColor || '#5865F2';
      const status = obj.status || 'online';
      const mode = obj.displayMode || 'both';
      const isBot = !!obj.isBot;
      const avVarKey = customKey || 'avatarUrl';
      const stVarKey = obj.paramKeyStatus || 'status';

      code += `  // Discord Avatar / Profil (${mode})\n`;
      const avX = left + r + bWidth;
      const avY = top + r + bWidth;

      if (mode !== 'status-only') {
        code += `  const targetAvatar = options.${avVarKey} || '${obj.avatarUrl || 'https://cdn.discordapp.com/embed/avatars/0.png'}';\n`;
        code += `  try {\n`;
        code += `    const avImg = await loadImage(targetAvatar);\n`;
        code += `    ctx.save();\n`;
        code += `    ctx.beginPath(); ctx.arc(${avX}, ${avY}, ${r}, 0, Math.PI * 2); ctx.closePath(); ctx.clip();\n`;
        code += `    ctx.drawImage(avImg, ${avX - r}, ${avY - r}, ${r * 2}, ${r * 2});\n`;
        code += `    ctx.restore();\n`;
        code += `  } catch (err) {\n`;
        code += `    ctx.fillStyle = '#5865F2';\n`;
        code += `    ctx.beginPath(); ctx.arc(${avX}, ${avY}, ${r}, 0, Math.PI * 2); ctx.fill();\n`;
        code += `  }\n`;

        if (bWidth > 0) {
          code += `  ctx.strokeStyle = '${bColor}';\n`;
          code += `  ctx.lineWidth = ${bWidth};\n`;
          code += `  ctx.beginPath(); ctx.arc(${avX}, ${avY}, ${r + bWidth / 2}, 0, Math.PI * 2); ctx.stroke();\n`;
        }
      }

      if (mode !== 'avatar-only' && status !== 'none') {
        code += `  const userStatus = options.${stVarKey} || '${status}';\n`;
        code += `  if (userStatus !== 'none') {\n`;
        const sRadius = mode === 'status-only' ? r * 0.6 : Math.max(8, r * 0.28);
        const angle = (45 * Math.PI) / 180;
        const stX = mode === 'status-only' ? avX : avX + Math.cos(angle) * (r - sRadius * 0.5);
        const stY = mode === 'status-only' ? avY : avY + Math.sin(angle) * (r - sRadius * 0.5);

        code += `    ctx.fillStyle = '#1E1F22';\n`;
        code += `    ctx.beginPath(); ctx.arc(${stX}, ${stY}, ${sRadius + 3}, 0, Math.PI * 2); ctx.fill();\n`;
        code += `    let stColor = '#57F287';\n`;
        code += `    if (userStatus === 'idle') stColor = '#FEE75C';\n`;
        code += `    else if (userStatus === 'dnd') stColor = '#ED4245';\n`;
        code += `    else if (userStatus === 'offline') stColor = '#80848E';\n`;
        code += `    ctx.fillStyle = stColor;\n`;
        code += `    ctx.beginPath(); ctx.arc(${stX}, ${stY}, ${sRadius}, 0, Math.PI * 2); ctx.fill();\n`;
        code += `  }\n`;
      }

      if (isBot && mode !== 'status-only') {
        const bW = r * 0.8, bH = r * 0.35;
        code += `  ctx.fillStyle = '#5865F2';\n`;
        code += `  roundRect(ctx, ${avX + r * 0.4}, ${avY - r * 0.9}, ${bW}, ${bH}, 4);\n`;
        code += `  ctx.fill();\n`;
        code += `  ctx.fillStyle = '#FFFFFF';\n`;
        code += `  ctx.font = 'bold ' + Math.round(${bH * 0.65}) + 'px Inter, sans-serif';\n`;
        code += `  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';\n`;
        code += `  ctx.fillText('BOT', ${avX + r * 0.4 + bW / 2}, ${avY - r * 0.9 + bH / 2});\n`;
      }
    } else if (obj.type === 'discord-role-badge') {
      const rName = obj.roleName || 'Admin';
      const rColor = obj.roleColor || '#5865F2';
      const fSize = obj.fontSize || 16;
      const pillRx = obj.rx || 6;
      const roleVarKey = customKey || 'role';

      code += `  // Discord Role Badge -> Variable: options.${roleVarKey}\n`;
      code += `  const roleInfo = options.${roleVarKey} || { name: '${rName}', color: '${rColor}' };\n`;
      code += `  const rCol = roleInfo.color || '${rColor}';\n`;
      code += `  const rTxt = roleInfo.name || '${rName}';\n`;
      code += `  ctx.font = '600 ${fSize}px "${obj.fontFamily || 'Inter'}", sans-serif';\n`;
      code += `  const textMetrics = ctx.measureText(rTxt);\n`;
      code += `  const pillW = Math.max(80, textMetrics.width + 38);\n`;
      code += `  const pillH = ${fSize} + 14;\n`;
      code += `  ctx.fillStyle = hexToRgba(rCol, 0.15);\n`;
      code += `  ctx.strokeStyle = hexToRgba(rCol, 0.4);\n`;
      code += `  ctx.lineWidth = 1;\n`;
      code += `  roundRect(ctx, ${left}, ${top}, pillW, pillH, ${pillRx});\n`;
      code += `  ctx.fill(); ctx.stroke();\n`;
      code += `  const dotR = Math.max(3, pillH * 0.18);\n`;
      code += `  ctx.fillStyle = rCol;\n`;
      code += `  ctx.beginPath(); ctx.arc(${left} + 14, ${top} + pillH / 2, dotR, 0, Math.PI * 2); ctx.fill();\n`;
      code += `  ctx.fillStyle = '#F2F3F5';\n`;
      code += `  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';\n`;
      code += `  ctx.fillText(rTxt, ${left} + 14 + dotR + 8, ${top} + pillH / 2 + 1);\n`;
    } else if (obj.type === 'discord-banner') {
      const bannerVarKey = customKey || 'bannerUrl';
      const bType = obj.bannerType || 'color';
      const rx = obj.rx || 12;

      code += `  // Discord Banner -> Variable: options.${bannerVarKey}\n`;
      code += `  ctx.save();\n`;
      code += `  roundRect(ctx, ${left}, ${top}, ${w}, ${h}, ${rx});\n`;
      code += `  ctx.clip();\n`;
      if (bType === 'image') {
        code += `  const bannerTarget = options.${bannerVarKey} || '${obj.bannerUrl || ''}';\n`;
        code += `  if (bannerTarget) {\n`;
        code += `    try {\n`;
        code += `      const bImg = await loadImage(bannerTarget);\n`;
        code += `      ctx.drawImage(bImg, ${left}, ${top}, ${w}, ${h});\n`;
        code += `    } catch (bErr) {\n`;
        code += `      ctx.fillStyle = '${obj.fill || '#5865F2'}'; ctx.fillRect(${left}, ${top}, ${w}, ${h});\n`;
        code += `    }\n`;
        code += `  } else {\n`;
        code += `    ctx.fillStyle = '${obj.fill || '#5865F2'}'; ctx.fillRect(${left}, ${top}, ${w}, ${h});\n`;
        code += `  }\n`;
      } else if (bType === 'gradient') {
        code += `  const bGrad = ctx.createLinearGradient(${left}, ${top}, ${left + w}, ${top + h});\n`;
        code += `  bGrad.addColorStop(0, '${obj.gradientStart || '#5865F2'}');\n`;
        code += `  bGrad.addColorStop(1, '${obj.gradientEnd || '#1E1F22'}');\n`;
        code += `  ctx.fillStyle = bGrad;\n`;
        code += `  ctx.fillRect(${left}, ${top}, ${w}, ${h});\n`;
      } else {
        code += `  ctx.fillStyle = '${obj.fill || '#5865F2'}';\n`;
        code += `  ctx.fillRect(${left}, ${top}, ${w}, ${h});\n`;
      }
      code += `  ctx.restore();\n`;
    } else if (obj.type === 'image') {
      const srcUrl = obj.src || (obj as any)._element?.src || '';
      if (srcUrl) {
        code += `  try {\n`;
        code += `    const loadedImg = await loadImage('${srcUrl}');\n`;
        code += `    ctx.drawImage(loadedImg, ${left}, ${top}, ${w}, ${h});\n`;
        code += `  } catch (imgErr) {\n`;
        code += `    console.warn('Impossible de charger image:', imgErr);\n`;
        code += `  }\n`;
      }
    }

    code += `  ctx.restore();\n\n`;
  }

  // 7. Return Buffer
  code += `  return canvas.toBuffer('image/png');\n`;
  code += `}\n\n`;

  // 8. CommonJS export for Javascript or ES Module for TS
  if (!isTS) {
    code += `module.exports = { generateDiscordCard };\n`;
  }

  return code;
}
