import * as fabricNS from 'fabric';
const fabric = fabricNS.fabric || fabricNS;

// In-memory Global Image Cache for instant avatar and banner rendering
const imageCache = new Map<string, HTMLImageElement>();

function getOrLoadImage(url: string, onLoaded: (img: HTMLImageElement) => void): HTMLImageElement | null {
  if (!url) return null;
  const cached = imageCache.get(url);
  if (cached && cached.complete && cached.naturalWidth > 0) {
    return cached;
  }
  
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    imageCache.set(url, img);
    onLoaded(img);
  };
  img.onerror = () => {
    console.warn('Erreur chargement image:', url);
  };
  img.src = url;
  return null;
}

/**
 * Draws the iconic Discord Clyde mascot silhouette as a crisp vector fallback
 */
function drawDiscordClydeIcon(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number) {
  ctx.save();
  ctx.translate(cx, cy);
  const scale = size / 100;
  ctx.scale(scale, scale);

  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  // Clyde logo face path
  ctx.moveTo(35, -20);
  ctx.bezierCurveTo(25, -20, 16, -14, 12, -6);
  ctx.bezierCurveTo(2, -8, -2, -8, -12, -6);
  ctx.bezierCurveTo(-16, -14, -25, -20, -35, -20);
  ctx.bezierCurveTo(-40, -10, -42, 5, -42, 22);
  ctx.bezierCurveTo(-32, 28, -20, 30, -10, 30);
  ctx.bezierCurveTo(-8, 26, -5, 22, -3, 18);
  ctx.bezierCurveTo(-10, 16, -15, 12, -20, 6);
  ctx.bezierCurveTo(-15, 8, -8, 10, 0, 10);
  ctx.bezierCurveTo(8, 10, 15, 8, 20, 6);
  ctx.bezierCurveTo(15, 12, 10, 16, 3, 18);
  ctx.bezierCurveTo(5, 22, 8, 26, 10, 30);
  ctx.bezierCurveTo(20, 30, 32, 28, 42, 22);
  ctx.bezierCurveTo(42, 5, 40, -10, 35, -20);
  ctx.closePath();
  ctx.fill();

  // Left Eye
  ctx.fillStyle = '#5865F2';
  ctx.beginPath();
  ctx.arc(-14, 2, 6, 0, Math.PI * 2);
  ctx.fill();

  // Right Eye
  ctx.beginPath();
  ctx.arc(14, 2, 6, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Enhanced Multi-Style Progress Bar Fabric Class
 * Styles: 'horizontal' | 'circular' | 'radial' | 'segmented' | 'vertical'
 * Supports Solid Color AND Custom Gradients (gradientStart -> gradientEnd)
 */
export const ProgressBar = fabric.util.createClass(fabric.Rect, {
  type: 'progress-bar',

  initialize: function (options: any) {
    options || (options = {});
    this.callSuper('initialize', options);
    this.set('paramKey', options.paramKey || 'progress');
    this.set('barStyle', options.barStyle || 'horizontal'); // 'horizontal' | 'circular' | 'radial' | 'segmented' | 'vertical'
    this.set('progressValue', options.progressValue !== undefined ? options.progressValue : 65);
    this.set('progressMax', options.progressMax || 100);
    this.set('progressColor', options.progressColor || '#57F287'); // Discord Green
    this.set('gradientFill', options.gradientFill !== undefined ? options.gradientFill : false);
    this.set('gradientStart', options.gradientStart || '#5865F2');
    this.set('gradientEnd', options.gradientEnd || '#57F287');
    this.set('barBackground', options.barBackground || '#2B2D31'); // Discord Darker
    this.set('segments', options.segments || 10);
    this.set('rx', options.rx !== undefined ? options.rx : 10);
    this.set('ry', options.ry !== undefined ? options.ry : 10);
    this.set('showPercentageText', options.showPercentageText !== undefined ? options.showPercentageText : false);
    this.set('strokeWidth', options.strokeWidth || 0);
    this.set('stroke', options.stroke || null);
  },

  toObject: function () {
    return fabric.util.object.extend(this.callSuper('toObject'), {
      paramKey: this.get('paramKey'),
      barStyle: this.get('barStyle'),
      progressValue: this.get('progressValue'),
      progressMax: this.get('progressMax'),
      progressColor: this.get('progressColor'),
      gradientFill: this.get('gradientFill'),
      gradientStart: this.get('gradientStart'),
      gradientEnd: this.get('gradientEnd'),
      barBackground: this.get('barBackground'),
      segments: this.get('segments'),
      showPercentageText: this.get('showPercentageText'),
    });
  },

  _getFillStyle: function (ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) {
    if (this.gradientFill) {
      const grad = ctx.createLinearGradient(x1, y1, x2, y2);
      grad.addColorStop(0, this.gradientStart || '#5865F2');
      grad.addColorStop(1, this.gradientEnd || '#57F287');
      return grad;
    }
    return this.progressColor || '#57F287';
  },

  _render: function (ctx: CanvasRenderingContext2D) {
    const w = this.width;
    const h = this.height;
    const rx = Math.min(this.rx || 0, w / 2, h / 2);
    const ry = Math.min(this.ry || 0, w / 2, h / 2);

    const val = Number(this.progressValue) || 0;
    const max = Number(this.progressMax) || 100;
    const ratio = Math.max(0, Math.min(1, val / max));
    const style = this.barStyle || 'horizontal';

    ctx.save();

    if (style === 'horizontal') {
      // 1. Horizontal standard rounded bar
      ctx.fillStyle = this.barBackground;
      ctx.beginPath();
      this._drawRoundedRect(ctx, -w / 2, -h / 2, w, h, rx);
      ctx.fill();

      if (ratio > 0) {
        ctx.fillStyle = this._getFillStyle(ctx, -w / 2, 0, w / 2, 0);
        ctx.beginPath();
        const progW = Math.max(rx * 2, w * ratio);
        this._drawRoundedRect(ctx, -w / 2, -h / 2, Math.min(w, progW), h, rx);
        ctx.fill();
      }
    } else if (style === 'vertical') {
      // 2. Vertical Progress Bar
      ctx.fillStyle = this.barBackground;
      ctx.beginPath();
      this._drawRoundedRect(ctx, -w / 2, -h / 2, w, h, rx);
      ctx.fill();

      if (ratio > 0) {
        ctx.fillStyle = this._getFillStyle(ctx, 0, h / 2, 0, -h / 2);
        ctx.beginPath();
        const progH = Math.max(ry * 2, h * ratio);
        this._drawRoundedRect(ctx, -w / 2, h / 2 - progH, w, progH, rx);
        ctx.fill();
      }
    } else if (style === 'segmented') {
      // 3. Segmented Bar
      const totalSegments = Math.max(2, this.segments || 10);
      const gap = 4;
      const segW = (w - gap * (totalSegments - 1)) / totalSegments;
      const activeCount = Math.round(ratio * totalSegments);
      const fill = this._getFillStyle(ctx, -w / 2, 0, w / 2, 0);

      for (let i = 0; i < totalSegments; i++) {
        const segX = -w / 2 + i * (segW + gap);
        ctx.fillStyle = i < activeCount ? fill : this.barBackground;
        ctx.beginPath();
        this._drawRoundedRect(ctx, segX, -h / 2, segW, h, Math.min(rx, segW / 2));
        ctx.fill();
      }
    } else if (style === 'circular' || style === 'radial') {
      // 4. Circular Ring / Gauge Progress Bar
      const radius = Math.min(w, h) / 2 - (this.strokeWidth ? this.strokeWidth : 12);
      const lineWidth = Math.max(6, Math.min(w, h) * 0.12);
      const isRadial = style === 'radial'; // 240-degree gauge
      const startAngle = isRadial ? (150 * Math.PI) / 180 : -Math.PI / 2;
      const totalAngle = isRadial ? (240 * Math.PI) / 180 : Math.PI * 2;
      const endAngle = startAngle + totalAngle * ratio;

      // Track Background
      ctx.lineWidth = lineWidth;
      ctx.lineCap = 'round';
      ctx.strokeStyle = this.barBackground;
      ctx.beginPath();
      ctx.arc(0, 0, radius, startAngle, startAngle + totalAngle, false);
      ctx.stroke();

      // Progress Arc
      if (ratio > 0) {
        ctx.strokeStyle = this._getFillStyle(ctx, -radius, -radius, radius, radius);
        ctx.beginPath();
        ctx.arc(0, 0, radius, startAngle, endAngle, false);
        ctx.stroke();
      }

      // Center Percentage Text if enabled
      if (this.showPercentageText) {
        ctx.fillStyle = '#FFFFFF';
        ctx.font = `bold ${Math.round(radius * 0.55)}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`${Math.round(ratio * 100)}%`, 0, 0);
      }
    }

    // Optional Outline
    if (this.stroke && this.strokeWidth && style !== 'circular' && style !== 'radial') {
      ctx.strokeStyle = this.stroke;
      ctx.lineWidth = this.strokeWidth;
      ctx.beginPath();
      this._drawRoundedRect(ctx, -w / 2, -h / 2, w, h, rx);
      ctx.stroke();
    }

    ctx.restore();
  },

  _drawRoundedRect: function (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
});

(fabric as any).ProgressBar = ProgressBar;
(fabric as any).ProgressBar.fromObject = function (object: any, callback: any) {
  return fabric.Object._fromObject('ProgressBar', object, callback);
};

/**
 * Custom Fabric class for Circle Arc
 */
export const CircleArc = fabric.util.createClass(fabric.Object, {
  type: 'circle-arc',

  initialize: function (options: any) {
    options || (options = {});
    this.callSuper('initialize', options);
    this.set('radius', options.radius || 60);
    this.set('startAngle', options.startAngle !== undefined ? options.startAngle : 0);
    this.set('endAngle', options.endAngle !== undefined ? options.endAngle : 180);
    this.set('stroke', options.stroke || '#5865F2');
    this.set('strokeWidth', options.strokeWidth || 8);
    this.set('strokeLineCap', options.strokeLineCap || 'round');
    this.set('fill', 'transparent');
    this.set('width', (this.radius + this.strokeWidth) * 2);
    this.set('height', (this.radius + this.strokeWidth) * 2);
  },

  toObject: function () {
    return fabric.util.object.extend(this.callSuper('toObject'), {
      radius: this.get('radius'),
      startAngle: this.get('startAngle'),
      endAngle: this.get('endAngle'),
      strokeLineCap: this.get('strokeLineCap'),
    });
  },

  _render: function (ctx: CanvasRenderingContext2D) {
    const r = this.radius;
    const startRad = ((this.startAngle || 0) * Math.PI) / 180;
    const endRad = ((this.endAngle || 180) * Math.PI) / 180;

    ctx.save();
    ctx.strokeStyle = this.stroke;
    ctx.lineWidth = this.strokeWidth;
    ctx.lineCap = this.strokeLineCap || 'round';
    ctx.beginPath();
    ctx.arc(0, 0, r, startRad, endRad, false);
    ctx.stroke();
    ctx.restore();
  }
});

(fabric as any).CircleArc = CircleArc;
(fabric as any).CircleArc.fromObject = function (object: any, callback: any) {
  return fabric.Object._fromObject('CircleArc', object, callback);
};

/**
 * Custom Fabric class for Discord Role Badge
 */
export const DiscordRoleBadge = fabric.util.createClass(fabric.Object, {
  type: 'discord-role-badge',

  initialize: function (options: any) {
    options || (options = {});
    this.callSuper('initialize', options);
    this.set('paramKey', options.paramKey || 'role');
    this.set('roleName', options.roleName || 'Admin');
    this.set('roleColor', options.roleColor || '#5865F2');
    this.set('fontSize', options.fontSize || 16);
    this.set('fontFamily', options.fontFamily || 'Inter');
    this.set('rx', options.rx !== undefined ? options.rx : 6);
    this.set('ry', options.ry !== undefined ? options.ry : 6);
    this._recomputeDimensions();
  },

  _recomputeDimensions: function () {
    const textLen = (this.roleName || 'Admin').length;
    const estimatedWidth = Math.max(80, textLen * (this.fontSize * 0.65) + 36);
    const estimatedHeight = this.fontSize + 14;
    this.set('width', estimatedWidth);
    this.set('height', estimatedHeight);
  },

  toObject: function () {
    return fabric.util.object.extend(this.callSuper('toObject'), {
      paramKey: this.get('paramKey'),
      roleName: this.get('roleName'),
      roleColor: this.get('roleColor'),
      fontSize: this.get('fontSize'),
      fontFamily: this.get('fontFamily'),
      rx: this.get('rx'),
      ry: this.get('ry'),
    });
  },

  _render: function (ctx: CanvasRenderingContext2D) {
    this._recomputeDimensions();
    const w = this.width;
    const h = this.height;
    const rx = this.rx || 6;
    const color = this.roleColor || '#5865F2';

    ctx.save();

    // Background with soft alpha tint
    ctx.fillStyle = hexToRgba(color, 0.15);
    ctx.strokeStyle = hexToRgba(color, 0.4);
    ctx.lineWidth = 1;
    ctx.beginPath();
    this._drawRoundedRect(ctx, -w / 2, -h / 2, w, h, rx);
    ctx.fill();
    ctx.stroke();

    // Colored Dot
    const dotRadius = Math.max(3, h * 0.18);
    const dotX = -w / 2 + 12;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(dotX, 0, dotRadius, 0, Math.PI * 2);
    ctx.fill();

    // Role Name Text
    ctx.fillStyle = '#F2F3F5';
    ctx.font = `600 ${this.fontSize}px "${this.fontFamily}", sans-serif`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.roleName || 'Admin', dotX + dotRadius + 8, 1);

    ctx.restore();
  },

  _drawRoundedRect: function (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }
});

(fabric as any).DiscordRoleBadge = DiscordRoleBadge;
(fabric as any).DiscordRoleBadge.fromObject = function (object: any, callback: any) {
  return fabric.Object._fromObject('DiscordRoleBadge', object, callback);
};

/**
 * Custom Fabric class for Discord Avatar with Robust Async Image Caching & Vector Fallback
 */
export const DiscordAvatar = fabric.util.createClass(fabric.Object, {
  type: 'discord-avatar',

  initialize: function (options: any) {
    options || (options = {});
    this.callSuper('initialize', options);
    this.set('paramKey', options.paramKey || 'avatarUrl');
    this.set('paramKeyStatus', options.paramKeyStatus || 'status');
    this.set('displayMode', options.displayMode || 'both'); // 'both' | 'avatar-only' | 'status-only'
    this.set('avatarRadius', options.avatarRadius || 50);
    this.set('status', options.status || 'online');
    this.set('borderColor', options.borderColor || '#5865F2');
    this.set('borderWidth', options.borderWidth !== undefined ? options.borderWidth : 0);
    this.set('avatarUrl', options.avatarUrl || 'https://cdn.discordapp.com/embed/avatars/0.png');
    this.set('isBot', options.isBot || false);
    this.set('width', (this.avatarRadius + (this.borderWidth || 0)) * 2);
    this.set('height', (this.avatarRadius + (this.borderWidth || 0)) * 2);

    this._imgElement = null;
    this._loadAvatarImage();
  },

  _loadAvatarImage: function () {
    const url = this.avatarUrl || 'https://cdn.discordapp.com/embed/avatars/0.png';
    const cached = getOrLoadImage(url, (loadedImg) => {
      this._imgElement = loadedImg;
      this.dirty = true;
      if (this.canvas) {
        this.canvas.requestRenderAll();
      } else {
        // In case canvas is attached shortly after
        setTimeout(() => {
          if (this.canvas) this.canvas.requestRenderAll();
        }, 100);
      }
    });

    if (cached) {
      this._imgElement = cached;
    }
  },

  toObject: function () {
    return fabric.util.object.extend(this.callSuper('toObject'), {
      paramKey: this.get('paramKey'),
      paramKeyStatus: this.get('paramKeyStatus'),
      displayMode: this.get('displayMode'),
      avatarRadius: this.get('avatarRadius'),
      status: this.get('status'),
      borderColor: this.get('borderColor'),
      borderWidth: this.get('borderWidth'),
      avatarUrl: this.get('avatarUrl'),
      isBot: this.get('isBot'),
    });
  },

  _render: function (ctx: CanvasRenderingContext2D) {
    const r = this.avatarRadius || 50;
    const bWidth = this.borderWidth || 0;
    const bColor = this.borderColor || '#5865F2';
    const status = this.status || 'online';
    const mode = this.displayMode || 'both';

    // Auto trigger load if element not ready
    if (!this._imgElement && this.avatarUrl) {
      this._loadAvatarImage();
    }

    ctx.save();

    // 1. Render Avatar Image (if not status-only)
    if (mode !== 'status-only') {
      if (bWidth > 0) {
        ctx.strokeStyle = bColor;
        ctx.lineWidth = bWidth;
        ctx.beginPath();
        ctx.arc(0, 0, r + bWidth / 2, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.save();
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI * 2);
      ctx.closePath();
      ctx.clip();

      if (this._imgElement && this._imgElement.complete && this._imgElement.naturalWidth > 0) {
        ctx.drawImage(this._imgElement, -r, -r, r * 2, r * 2);
      } else {
        // Beautiful Discord Blurple background with Clyde Mascot vector icon (No cutoff text!)
        ctx.fillStyle = '#5865F2';
        ctx.fillRect(-r, -r, r * 2, r * 2);
        drawDiscordClydeIcon(ctx, 0, 0, r * 1.1);
      }
      ctx.restore();
    }

    // 2. Status Badge (if 'both' or 'status-only')
    if (mode !== 'avatar-only' && status !== 'none') {
      const statusRadius = mode === 'status-only' ? r * 0.6 : Math.max(8, r * 0.28);
      const angle = (45 * Math.PI) / 180;
      const statusX = mode === 'status-only' ? 0 : Math.cos(angle) * (r - statusRadius * 0.5);
      const statusY = mode === 'status-only' ? 0 : Math.sin(angle) * (r - statusRadius * 0.5);

      ctx.fillStyle = '#1E1F22';
      ctx.beginPath();
      ctx.arc(statusX, statusY, statusRadius + 3, 0, Math.PI * 2);
      ctx.fill();

      let statusColor = '#57F287';
      if (status === 'idle') statusColor = '#FEE75C';
      else if (status === 'dnd') statusColor = '#ED4245';
      else if (status === 'offline') statusColor = '#80848E';

      ctx.fillStyle = statusColor;
      ctx.beginPath();
      ctx.arc(statusX, statusY, statusRadius, 0, Math.PI * 2);
      ctx.fill();

      if (status === 'dnd') {
        ctx.fillStyle = '#1E1F22';
        ctx.fillRect(statusX - statusRadius * 0.6, statusY - statusRadius * 0.2, statusRadius * 1.2, statusRadius * 0.4);
      } else if (status === 'idle') {
        ctx.fillStyle = '#1E1F22';
        ctx.beginPath();
        ctx.arc(statusX - statusRadius * 0.35, statusY - statusRadius * 0.35, statusRadius * 0.65, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 3. Optional BOT Badge
    if (this.isBot && mode !== 'status-only') {
      const botW = r * 0.8;
      const botH = r * 0.35;
      const botX = r * 0.4;
      const botY = -r * 0.9;
      ctx.fillStyle = '#5865F2';
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(botX, botY, botW, botH, 4) : ctx.rect(botX, botY, botW, botH);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.font = `bold ${Math.round(botH * 0.65)}px Inter, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('BOT', botX + botW / 2, botY + botH / 2);
    }

    ctx.restore();
  }
});

(fabric as any).DiscordAvatar = DiscordAvatar;
(fabric as any).DiscordAvatar.fromObject = function (object: any, callback: any) {
  const avatar = new DiscordAvatar(object);
  if (callback) callback(avatar);
  return avatar;
};

/**
 * Custom Fabric class for Discord Banner with Image & Gradient Caching
 */
export const DiscordBanner = fabric.util.createClass(fabric.Rect, {
  type: 'discord-banner',

  initialize: function (options: any) {
    options || (options = {});
    this.callSuper('initialize', options);
    this.set('paramKey', options.paramKey || 'bannerUrl');
    this.set('bannerType', options.bannerType || 'color');
    this.set('bannerUrl', options.bannerUrl || '');
    this.set('gradientStart', options.gradientStart || '#5865F2');
    this.set('gradientEnd', options.gradientEnd || '#1E1F22');
    this.set('rx', options.rx !== undefined ? options.rx : 12);
    this.set('ry', options.ry !== undefined ? options.ry : 12);
    this.set('width', options.width || 400);
    this.set('height', options.height || 140);
    this.set('fill', options.fill || '#5865F2');

    this._imgElement = null;
    if (this.bannerUrl) this._loadBannerImage();
  },

  _loadBannerImage: function () {
    if (!this.bannerUrl) return;
    const cached = getOrLoadImage(this.bannerUrl, (loadedImg) => {
      this._imgElement = loadedImg;
      this.dirty = true;
      if (this.canvas) {
        this.canvas.requestRenderAll();
      } else {
        setTimeout(() => {
          if (this.canvas) this.canvas.requestRenderAll();
        }, 100);
      }
    });
    if (cached) this._imgElement = cached;
  },

  toObject: function () {
    return fabric.util.object.extend(this.callSuper('toObject'), {
      paramKey: this.get('paramKey'),
      bannerType: this.get('bannerType'),
      bannerUrl: this.get('bannerUrl'),
      gradientStart: this.get('gradientStart'),
      gradientEnd: this.get('gradientEnd'),
    });
  },

  _render: function (ctx: CanvasRenderingContext2D) {
    const w = this.width;
    const h = this.height;
    const rx = Math.min(this.rx || 12, w / 2, h / 2);
    const type = this.bannerType || 'color';

    // Auto trigger load if banner image not ready
    if (!this._imgElement && this.bannerUrl && type === 'image') {
      this._loadBannerImage();
    }

    ctx.save();

    ctx.beginPath();
    this._drawRoundedRect(ctx, -w / 2, -h / 2, w, h, rx);
    ctx.closePath();
    ctx.clip();

    if (type === 'image' && this._imgElement && this._imgElement.complete && this._imgElement.naturalWidth > 0) {
      ctx.drawImage(this._imgElement, -w / 2, -h / 2, w, h);
    } else if (type === 'gradient') {
      const grad = ctx.createLinearGradient(-w / 2, -h / 2, w / 2, h / 2);
      grad.addColorStop(0, this.gradientStart || '#5865F2');
      grad.addColorStop(1, this.gradientEnd || '#1E1F22');
      ctx.fillStyle = grad;
      ctx.fillRect(-w / 2, -h / 2, w, h);
    } else {
      ctx.fillStyle = this.fill || '#5865F2';
      ctx.fillRect(-w / 2, -h / 2, w, h);
    }

    ctx.restore();
  },

  _drawRoundedRect: function (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + width - r, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r);
    ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
});

(fabric as any).DiscordBanner = DiscordBanner;
(fabric as any).DiscordBanner.fromObject = function (object: any, callback: any) {
  const banner = new DiscordBanner(object);
  if (callback) callback(banner);
  return banner;
};

function hexToRgba(hex: string, alpha = 1) {
  let c = hex.replace('#', '');
  if (c.length === 3) c = c.split('').map(x => x + x).join('');
  if (c.length !== 6) return `rgba(88, 101, 242, ${alpha})`;
  const num = parseInt(c, 16);
  return `rgba(${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}, ${alpha})`;
}
