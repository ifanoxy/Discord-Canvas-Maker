import React, { useRef, useEffect } from 'react';
import type { BackgroundConfig } from '../utils/presets';
import { renderBackgroundToContext } from '../utils/presets';

interface CanvasThumbnailPreviewProps {
  width: number;
  height: number;
  bgConfig?: BackgroundConfig;
  canvasState?: string;
  className?: string;
  style?: React.CSSProperties;
}

export const CanvasThumbnailPreview: React.FC<CanvasThumbnailPreviewProps> = ({
  width = 800,
  height = 450,
  bgConfig = { type: 'preset', presetId: 'glass-cyber-blurple' },
  canvasState = '',
  style
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set internal resolution matching the design dimensions
    canvas.width = width;
    canvas.height = height;

    // 1. Draw Background
    renderBackgroundToContext(ctx, width, height, bgConfig);

    // 2. Draw Fabric Objects from canvasState JSON
    if (canvasState) {
      try {
        const parsed = JSON.parse(canvasState);
        const objects: any[] = parsed.objects || [];

        objects.forEach(obj => {
          ctx.save();

          const left = obj.left || 0;
          const top = obj.top || 0;
          const scaleX = obj.scaleX || 1;
          const scaleY = obj.scaleY || 1;
          const angle = obj.angle || 0;

          ctx.translate(left, top);
          if (angle) ctx.rotate((angle * Math.PI) / 180);
          ctx.scale(scaleX, scaleY);

          // Render based on Fabric Object type
          switch (obj.type) {
            case 'discord-avatar': {
              const r = obj.avatarRadius || 60;
              const mode = obj.displayMode || 'both';
              const bWidth = obj.borderWidth || 3;
              const bColor = obj.borderColor || '#5865F2';
              const status = obj.status || 'online';

              if (mode !== 'status-only') {
                // Outer circle border
                ctx.beginPath();
                ctx.arc(r, r, r, 0, Math.PI * 2);
                ctx.fillStyle = '#5865F2';
                ctx.fill();

                if (bWidth > 0) {
                  ctx.lineWidth = bWidth;
                  ctx.strokeStyle = bColor;
                  ctx.stroke();
                }

                // Discord Clyde Mascot Silhouette
                ctx.save();
                ctx.beginPath();
                ctx.arc(r, r, r - bWidth, 0, Math.PI * 2);
                ctx.clip();
                ctx.fillStyle = '#5865F2';
                ctx.fillRect(0, 0, r * 2, r * 2);

                ctx.fillStyle = '#FFFFFF';
                const s = (r * 2) / 120;
                ctx.translate(r - 40 * s, r - 30 * s);
                ctx.scale(s * 0.8, s * 0.8);
                // Draw Discord Clyde logo
                const path = new Path2D('M85.0 0C38.0 0 0 38.0 0 85.0C0 106.3 7.8 125.8 20.8 140.8L12.5 167.5C11.5 170.8 14.8 173.8 18.0 172.5L46.8 161.2C58.3 167.0 71.3 170.0 85.0 170.0C132.0 170.0 170.0 132.0 170.0 85.0C170.0 38.0 132.0 0 85.0 0ZM58.0 95.0C50.0 95.0 43.5 88.5 43.5 80.5C43.5 72.5 50.0 66.0 58.0 66.0C66.0 66.0 72.5 72.5 72.5 80.5C72.5 88.5 66.0 95.0 58.0 95.0ZM112.0 95.0C104.0 95.0 97.5 88.5 97.5 80.5C97.5 72.5 104.0 66.0 112.0 66.0C120.0 66.0 126.5 72.5 126.5 80.5C126.5 88.5 120.0 95.0 112.0 95.0Z');
                ctx.fill(path);
                ctx.restore();
              }

              // Status dot
              if (mode !== 'avatar-only' && status !== 'none') {
                const sr = r * 0.32;
                const sx = r * 2 - sr;
                const sy = r * 2 - sr;
                const statusColors: Record<string, string> = {
                  online: '#23A55A',
                  idle: '#F0B232',
                  dnd: '#F23F43',
                  offline: '#80848E',
                  streaming: '#593695'
                };

                ctx.beginPath();
                ctx.arc(sx, sy, sr + 3, 0, Math.PI * 2);
                ctx.fillStyle = '#111214';
                ctx.fill();

                ctx.beginPath();
                ctx.arc(sx, sy, sr, 0, Math.PI * 2);
                ctx.fillStyle = statusColors[status] || '#23A55A';
                ctx.fill();
              }
              break;
            }

            case 'discord-banner': {
              const bw = obj.width || 600;
              const bh = obj.height || 160;
              const brx = obj.rx || 12;
              const bStart = obj.gradientStart || '#5865F2';
              const bEnd = obj.gradientEnd || '#1E1F22';

              const bg = ctx.createLinearGradient(0, 0, bw, bh);
              bg.addColorStop(0, bStart);
              bg.addColorStop(1, bEnd);
              ctx.fillStyle = bg;

              ctx.beginPath();
              if (ctx.roundRect) ctx.roundRect(0, 0, bw, bh, brx);
              else ctx.rect(0, 0, bw, bh);
              ctx.fill();
              break;
            }

            case 'discord-role-badge': {
              const rName = obj.roleName || 'Role';
              const rColor = obj.roleColor || '#5865F2';
              const fSize = obj.fontSize || 14;
              const rRx = obj.rx || 6;
              const fFam = obj.fontFamily || 'Inter';

              ctx.font = `600 ${fSize}px "${fFam}", sans-serif`;
              const textWidth = ctx.measureText(rName).width;
              const dotRadius = fSize * 0.32;
              const badgePaddingX = 10;
              const badgePaddingY = 5;
              const badgeW = textWidth + dotRadius * 2 + 10 + badgePaddingX * 2;
              const badgeH = fSize + badgePaddingY * 2 + 4;

              const originXOffset = obj.originX === 'center' ? -badgeW / 2 : 0;
              ctx.translate(originXOffset, 0);

              // Pill background
              ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
              ctx.strokeStyle = rColor;
              ctx.lineWidth = 1.2;
              ctx.beginPath();
              if (ctx.roundRect) ctx.roundRect(0, 0, badgeW, badgeH, rRx);
              else ctx.rect(0, 0, badgeW, badgeH);
              ctx.fill();
              ctx.stroke();

              // Role Color Dot
              ctx.beginPath();
              ctx.arc(badgePaddingX + dotRadius, badgeH / 2, dotRadius, 0, Math.PI * 2);
              ctx.fillStyle = rColor;
              ctx.fill();

              // Role Text
              ctx.fillStyle = '#FFFFFF';
              ctx.textBaseline = 'middle';
              ctx.fillText(rName, badgePaddingX + dotRadius * 2 + 6, badgeH / 2);
              break;
            }

            case 'progress-bar': {
              const pbW = obj.width || 300;
              const pbH = obj.height || 20;
              const style = obj.barStyle || 'horizontal';
              const val = obj.progressValue || 50;
              const max = obj.progressMax || 100;
              const pct = Math.max(0, Math.min(1, val / max));
              const pBg = obj.barBackground || '#2B2D31';
              const pCol = obj.progressColor || '#57F287';
              const gFill = obj.gradientFill;
              const gStart = obj.gradientStart || '#5865F2';
              const gEnd = obj.gradientEnd || '#57F287';

              if (style === 'horizontal') {
                const rx = obj.rx || pbH / 2;
                // Background Track
                ctx.fillStyle = pBg;
                ctx.beginPath();
                if (ctx.roundRect) ctx.roundRect(0, 0, pbW, pbH, rx);
                else ctx.rect(0, 0, pbW, pbH);
                ctx.fill();

                // Filled Bar
                if (pct > 0) {
                  const fillW = Math.max(rx * 2, pbW * pct);
                  if (gFill) {
                    const grad = ctx.createLinearGradient(0, 0, pbW, 0);
                    grad.addColorStop(0, gStart);
                    grad.addColorStop(1, gEnd);
                    ctx.fillStyle = grad;
                  } else {
                    ctx.fillStyle = pCol;
                  }
                  ctx.beginPath();
                  if (ctx.roundRect) ctx.roundRect(0, 0, fillW, pbH, rx);
                  else ctx.rect(0, 0, fillW, pbH);
                  ctx.fill();
                }
              } else if (style === 'circular' || style === 'radial') {
                const size = Math.min(pbW, pbH);
                const cx = size / 2;
                const cy = size / 2;
                const radius = (size - 14) / 2;
                const strokeW = 10;

                // Background Ring
                ctx.lineWidth = strokeW;
                ctx.strokeStyle = pBg;
                ctx.beginPath();
                ctx.arc(cx, cy, radius, 0, Math.PI * 2);
                ctx.stroke();

                // Active Arc
                if (pct > 0) {
                  ctx.strokeStyle = gFill ? gStart : pCol;
                  ctx.lineCap = 'round';
                  ctx.beginPath();
                  ctx.arc(cx, cy, radius, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * pct);
                  ctx.stroke();
                }

                // Center percentage text
                if (obj.showPercentageText) {
                  ctx.fillStyle = '#FFFFFF';
                  ctx.font = `700 ${size * 0.22}px "Inter", sans-serif`;
                  ctx.textAlign = 'center';
                  ctx.textBaseline = 'middle';
                  ctx.fillText(`${Math.round(pct * 100)}%`, cx, cy);
                }
              } else if (style === 'segmented') {
                const segments = obj.segments || 10;
                const gap = 4;
                const segW = (pbW - (segments - 1) * gap) / segments;
                const activeCount = Math.round(pct * segments);

                for (let s = 0; s < segments; s++) {
                  const sx = s * (segW + gap);
                  ctx.fillStyle = s < activeCount ? (gFill ? gStart : pCol) : pBg;
                  ctx.beginPath();
                  if (ctx.roundRect) ctx.roundRect(sx, 0, segW, pbH, 4);
                  else ctx.rect(sx, 0, segW, pbH);
                  ctx.fill();
                }
              }
              break;
            }

            case 'i-text':
            case 'text': {
              const text = obj.text || '';
              const fSize = obj.fontSize || 24;
              const fFam = obj.fontFamily || 'Inter';
              const fWeight = obj.fontWeight || 'normal';
              const fStyle = obj.fontStyle || 'normal';
              const fill = obj.fill || '#FFFFFF';

              ctx.font = `${fStyle} ${fWeight} ${fSize}px "${fFam}", sans-serif`;
              ctx.fillStyle = typeof fill === 'string' ? fill : '#FFFFFF';
              ctx.textBaseline = 'top';

              if (obj.originX === 'center') {
                ctx.textAlign = 'center';
              } else if (obj.originX === 'right') {
                ctx.textAlign = 'right';
              } else {
                ctx.textAlign = 'left';
              }

              ctx.fillText(text, 0, 0);
              break;
            }

            case 'rect': {
              const rw = obj.width || 100;
              const rh = obj.height || 100;
              const rrx = obj.rx || 0;
              ctx.fillStyle = typeof obj.fill === 'string' ? obj.fill : 'rgba(255,255,255,0.1)';
              ctx.beginPath();
              if (ctx.roundRect) ctx.roundRect(0, 0, rw, rh, rrx);
              else ctx.rect(0, 0, rw, rh);
              ctx.fill();
              if (obj.stroke && obj.strokeWidth) {
                ctx.lineWidth = obj.strokeWidth;
                ctx.strokeStyle = obj.stroke;
                ctx.stroke();
              }
              break;
            }

            case 'circle': {
              const cr = obj.radius || 40;
              ctx.fillStyle = typeof obj.fill === 'string' ? obj.fill : 'rgba(255,255,255,0.1)';
              ctx.beginPath();
              ctx.arc(cr, cr, cr, 0, Math.PI * 2);
              ctx.fill();
              if (obj.stroke && obj.strokeWidth) {
                ctx.lineWidth = obj.strokeWidth;
                ctx.strokeStyle = obj.stroke;
                ctx.stroke();
              }
              break;
            }

            default:
              break;
          }

          ctx.restore();
        });
      } catch (err) {
        console.warn('Erreur rendu thumbnail canvas:', err);
      }
    }
  }, [width, height, bgConfig, canvasState]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0D0E12',
        overflow: 'hidden',
        position: 'relative',
        ...style
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: 'contain',
          display: 'block',
          boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
          borderRadius: '6px'
        }}
      />
    </div>
  );
};
