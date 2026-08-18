import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { mockApi } from '../api/mockApi';
import * as fabricNS from 'fabric';
const fabric = fabricNS.fabric || fabricNS;
import { 
  MousePointer2, Square, Circle, Triangle, Star, Minus, PieChart,
  Type, Users, Hash, Percent, Plus, 
  FileArchive, Settings, Code, Smile, Copy, Check,
  ShieldCheck, Layers, ArrowLeft, Grid, Edit3, Image as ImageIcon,
  Trash2, User, Upload
} from 'lucide-react';
import { CustomColorPicker } from './CustomColorPicker';
import { EmojiSelector } from './EmojiSelector';
import '../utils/fabricExtensions'; 
import { generateNodeCanvasCode } from '../utils/exportCode';
import { exportProjectToZip } from '../utils/exportZip';
import { initAligningGuidelines } from '../utils/snapping';
import { AVAILABLE_FONTS, ensureGoogleFontsLoaded, loadCustomFontsFromStorage, importCustomFontFile, type FontOption } from '../utils/fonts';
import { PRESET_BACKGROUNDS, renderBackgroundToContext, type BackgroundConfig } from '../utils/presets';

export const CanvasEditor: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();

  const { 
    projects, activeProjectId, setActiveProject,
    activeImageId, setActiveImage, addImageToProject, 
    deleteImageFromProject, updateImageCanvasState,
    activeTool, setActiveTool, 
    shapeDrawMode, setShapeDrawMode,
    selectedObjectProps, setSelectedObjectProps,
    showGrid, setShowGrid, gridSize, setGridSize,
    clipboardData, setClipboardData,
    bgConfig, setBgConfig, exportLanguage, setExportLanguage,
    recentColors, addRecentColor, addToast
  } = useStore();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasInst = useRef<fabric.Canvas | null>(null);

  const [fabricCanvas, setFabricCanvas] = useState<fabric.Canvas | null>(null);
  const [showCode, setShowCode] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);

  // Dimensions
  const [canvasWidth, setCanvasWidth] = useState(800);
  const [canvasHeight, setCanvasHeight] = useState(450);

  // Modals & Submenus
  const [showColorPicker, setShowColorPicker] = useState<{show: boolean, key: string}>({show: false, key: ''});
  const [showEmoji, setShowEmoji] = useState(false);
  const [activeSubmenu, setActiveSubmenu] = useState<'shapes' | 'discord' | 'progress' | null>(null);
  const [editingImgId, setEditingImgId] = useState<string | null>(null);
  const [editingImgName, setEditingImgName] = useState('');

  // Resize State
  const [isResizing, setIsResizing] = useState(false);
  const resizeStartPos = useRef({ x: 0, y: 0, w: 800, h: 450 });

  // Custom Font State
  const [fontList, setFontList] = useState<FontOption[]>(AVAILABLE_FONTS);
  const fontFileInputRef = useRef<HTMLInputElement>(null);

  // Drawing State
  const isDrawing = useRef(false);
  const drawingObj = useRef<fabric.Object | null>(null);
  const origin = useRef({x: 0, y: 0});

  // Current Project & Image
  const currentProject = projects.find(p => p.id === (projectId || activeProjectId)) || projects[0];
  const currentImage = currentProject?.images.find(img => img.id === activeImageId) || currentProject?.images[0];

  useEffect(() => {
    ensureGoogleFontsLoaded();
    loadCustomFontsFromStorage().then(fonts => setFontList([...fonts]));
    if (projectId && projectId !== activeProjectId) {
      setActiveProject(projectId);
    }
  }, [projectId]);

  const handleFontFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target?.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file) return;

    try {
      const newFont = await importCustomFontFile(file);
      setFontList([...AVAILABLE_FONTS]);

      if (fabricCanvas) {
        const activeObj = fabricCanvas.getActiveObject();
        if (activeObj) {
          if (activeObj.type === 'i-text' || activeObj.type === 'text') {
            (activeObj as any).set('fontFamily', newFont.family);
            activeObj.dirty = true;
            fabricCanvas.requestRenderAll();
            updateProps(activeObj);
            persistCanvasState();
          } else if (activeObj.type === 'discord-role-badge') {
            (activeObj as any).fontFamily = newFont.family;
            activeObj.dirty = true;
            fabricCanvas.requestRenderAll();
            updateProps(activeObj);
            persistCanvasState();
          }
        }
      }

      setSelectedObjectProps((prev: any) => ({ ...prev, fontFamily: newFont.family }));

      addToast({
        type: 'success',
        title: 'Police importée avec succès !',
        message: `La police "${newFont.family}" est désormais disponible et appliquée.`
      });
    } catch (err: any) {
      console.error('Erreur import police:', err);
      addToast({
        type: 'error',
        title: 'Erreur import police',
        message: err?.message || 'Fichier de police non valide.'
      });
    } finally {
      if (e.target) {
        e.target.value = '';
      }
    }
  };

  // Apply Background helper
  const applyCanvasBackground = useCallback((canvas: fabric.Canvas, config: BackgroundConfig, width: number, height: number) => {
    if (!canvas) return;

    if (config.type === 'transparent') {
      canvas.backgroundColor = 'transparent';
      canvas.backgroundImage = undefined;
      canvas.requestRenderAll();
      return;
    }

    const bgCanvas = document.createElement('canvas');
    bgCanvas.width = width;
    bgCanvas.height = height;
    const bgCtx = bgCanvas.getContext('2d');
    if (bgCtx) {
      renderBackgroundToContext(bgCtx, width, height, config);
      const dataUrl = bgCanvas.toDataURL();
      fabric.Image.fromURL(dataUrl, (img: fabric.Image) => {
        if (canvas) {
          canvas.setBackgroundImage(img, () => {
            canvas.requestRenderAll();
          }, {
            originX: 'left',
            originY: 'top',
            left: 0,
            top: 0,
          });
        }
      });
    }
  }, []);

  // Sync canvas dimensions and JSON state when switching active image
  useEffect(() => {
    if (currentImage && fabricCanvas) {
      const w = currentImage.width || 800;
      const h = currentImage.height || 450;
      setCanvasWidth(w);
      setCanvasHeight(h);
      fabricCanvas.setWidth(w);
      fabricCanvas.setHeight(h);

      if (currentImage.bgConfig) setBgConfig(currentImage.bgConfig);

      if (currentImage.canvasState) {
        try {
          fabricCanvas.loadFromJSON(currentImage.canvasState, () => {
            applyCanvasBackground(fabricCanvas, currentImage.bgConfig || bgConfig, w, h);
            fabricCanvas.requestRenderAll();
          });
        } catch (err) {
          console.warn('Erreur chargement canvas:', err);
        }
      } else {
        fabricCanvas.clear();
        applyCanvasBackground(fabricCanvas, currentImage.bgConfig || bgConfig, w, h);
        fabricCanvas.requestRenderAll();
      }
    }
  }, [activeImageId, fabricCanvas]);

  // Save Canvas State to Store helper
  const persistCanvasState = useCallback(() => {
    if (!fabricCanvas) return;
    const { activeProjectId: curProjId, activeImageId: curImgId, bgConfig: curBg } = useStore.getState();
    const json = fabricCanvas.toJSON([
      'paramKey', 'paramKeyStatus', 'displayMode', 'bannerType', 'bannerUrl', 'gradientStart', 
      'gradientEnd', 'gradientFill', 'barStyle', 'progressValue', 'progressMax', 'progressColor', 'barBackground', 
      'segments', 'showPercentageText', 'rx', 'ry', 'shadow', 'radius', 'startAngle', 
      'endAngle', 'strokeLineCap', 'avatarRadius', 'status', 'borderColor', 'borderWidth', 
      'avatarUrl', 'isBot', 'roleName', 'roleColor'
    ]);
    updateImageCanvasState(curProjId, curImgId, JSON.stringify(json), canvasWidth, canvasHeight, curBg);
  }, [fabricCanvas, canvasWidth, canvasHeight, updateImageCanvasState]);

  // Initialize Fabric Canvas
  useEffect(() => {
    if (canvasRef.current && !canvasInst.current) {
      const initCanvas = new fabric.Canvas(canvasRef.current, {
        width: canvasWidth,
        height: canvasHeight,
        preserveObjectStacking: true,
        selection: true,
      });
      canvasInst.current = initCanvas;
      setFabricCanvas(initCanvas);
      
      initAligningGuidelines(initCanvas);
      applyCanvasBackground(initCanvas, bgConfig, canvasWidth, canvasHeight);

      // Grid rendering directly on after:render (Crisp, clean, no DOM clash)
      initCanvas.on('after:render', () => {
        const isGridOn = useStore.getState().showGrid;
        const gSize = useStore.getState().gridSize || 20;
        if (isGridOn) {
          const ctx = initCanvas.getContext();
          const w = initCanvas.getWidth();
          const h = initCanvas.getHeight();
          ctx.save();
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
          ctx.lineWidth = 1;
          for (let x = gSize; x < w; x += gSize) {
            ctx.beginPath();
            ctx.moveTo(x + 0.5, 0);
            ctx.lineTo(x + 0.5, h);
            ctx.stroke();
          }
          for (let y = gSize; y < h; y += gSize) {
            ctx.beginPath();
            ctx.moveTo(0, y + 0.5);
            ctx.lineTo(w, y + 0.5);
            ctx.stroke();
          }
          ctx.restore();
        }
      });

      // Selection listeners
      initCanvas.on('selection:created', (e) => updateProps(e.selected?.[0]));
      initCanvas.on('selection:updated', (e) => updateProps(e.selected?.[0]));
      initCanvas.on('selection:cleared', () => setSelectedObjectProps({}));
      
      // Auto-save on modification
      initCanvas.on('object:modified', (e) => {
        updateProps(e.target);
        persistCanvasState();
      });

      // Grid Snapping while Moving
      initCanvas.on('object:moving', (e) => {
        const isGridOn = useStore.getState().showGrid;
        const gSize = useStore.getState().gridSize || 20;
        if (isGridOn && e.target) {
          e.target.set({
            left: Math.round((e.target.left || 0) / gSize) * gSize,
            top: Math.round((e.target.top || 0) / gSize) * gSize
          });
        }
      });

      // Grid Snapping while Scaling / Resizing
      initCanvas.on('object:scaling', (e) => {
        const isGridOn = useStore.getState().showGrid;
        const gSize = useStore.getState().gridSize || 20;
        if (isGridOn && e.target) {
          const target = e.target;
          const origW = target.width || 1;
          const origH = target.height || 1;
          const currentScaledW = origW * (target.scaleX || 1);
          const currentScaledH = origH * (target.scaleY || 1);
          const snappedW = Math.max(gSize, Math.round(currentScaledW / gSize) * gSize);
          const snappedH = Math.max(gSize, Math.round(currentScaledH / gSize) * gSize);
          target.set('scaleX', snappedW / origW);
          target.set('scaleY', snappedH / origH);
        }
      });

      // Drawing & Insertion Logic (Mouse Events)
      initCanvas.on('mouse:down', (o) => {
        const currentTool = useStore.getState().activeTool;
        if (currentTool === 'select') return;
        
        const pointer = initCanvas.getPointer(o.e);
        isDrawing.current = true;
        origin.current = { x: pointer.x, y: pointer.y };

        const drawMode = useStore.getState().shapeDrawMode;
        const fillCol = drawMode === 'fill' ? '#5865F2' : 'transparent';
        const strokeCol = '#5865F2';
        const strokeW = drawMode === 'stroke' ? 3 : 0;

        let obj: fabric.Object | null = null;

        // 1. One-click Tools (Avatar, Progress, Banner, Role, Text, Circle Arc)
        if (currentTool === 'discord-avatar-only') {
          obj = new (fabric as any).DiscordAvatar({
            left: pointer.x - 50,
            top: pointer.y - 50,
            avatarRadius: 50,
            status: 'none',
            displayMode: 'avatar-only',
            borderColor: '#5865F2',
            borderWidth: 2,
            avatarUrl: 'https://cdn.discordapp.com/embed/avatars/1.png',
            paramKey: 'userAvatar'
          });
        } else if (currentTool === 'discord-avatar') {
          obj = new (fabric as any).DiscordAvatar({
            left: pointer.x - 50,
            top: pointer.y - 50,
            avatarRadius: 50,
            status: 'online',
            displayMode: 'both',
            borderColor: '#5865F2',
            borderWidth: 3,
            avatarUrl: 'https://cdn.discordapp.com/embed/avatars/0.png',
            isBot: false,
            paramKey: 'avatarUrl',
            paramKeyStatus: 'status'
          });
        } else if (currentTool === 'discord-status') {
          obj = new (fabric as any).DiscordAvatar({
            left: pointer.x - 20,
            top: pointer.y - 20,
            avatarRadius: 20,
            status: 'online',
            displayMode: 'status-only',
            paramKeyStatus: 'userStatus'
          });
        } else if (currentTool === 'discord-banner') {
          obj = new (fabric as any).DiscordBanner({
            left: pointer.x - 200,
            top: pointer.y - 65,
            width: 400,
            height: 130,
            rx: 10,
            ry: 10,
            fill: '#5865F2',
            bannerType: 'gradient',
            gradientStart: '#5865F2',
            gradientEnd: '#EB459E',
            paramKey: 'bannerUrl'
          });
        } else if (currentTool === 'discord-role') {
          obj = new (fabric as any).DiscordRoleBadge({
            left: pointer.x - 60,
            top: pointer.y - 15,
            roleName: 'Admin Discord',
            roleColor: '#5865F2',
            fontSize: 16,
            rx: 6,
            ry: 6,
            paramKey: 'role'
          });
        } else if (currentTool === 'discord-channel') {
          obj = new fabric.IText('# général', { 
            left: pointer.x, 
            top: pointer.y, 
            fontFamily: 'Inter', 
            fontSize: 24, 
            fill: '#94A3B8',
            fontWeight: '600'
          });
        } else if (currentTool === 'text') {
          obj = new fabric.IText('Texte Discord', { 
            left: pointer.x, 
            top: pointer.y, 
            fontFamily: 'Inter', 
            fontSize: 32, 
            fill: '#F2F3F5',
            fontWeight: '600',
            paramKey: 'customText'
          } as any);
        } else if (currentTool === 'circle-arc') {
          obj = new (fabric as any).CircleArc({
            left: pointer.x - 60,
            top: pointer.y - 60,
            radius: 60,
            startAngle: 0,
            endAngle: 180,
            stroke: '#5865F2',
            strokeWidth: 8,
          });
        } else if (currentTool.startsWith('progress-')) {
          const style = currentTool.replace('progress-', '') as any;
          const isCir = style === 'circular' || style === 'radial';
          obj = new (fabric as any).ProgressBar({
            left: pointer.x - (isCir ? 70 : 160), 
            top: pointer.y - (isCir ? 70 : 14), 
            width: isCir ? 140 : (style === 'vertical' ? 26 : 320), 
            height: isCir ? 140 : (style === 'vertical' ? 240 : 28), 
            rx: 14, 
            ry: 14,
            barStyle: style,
            progressValue: 65, 
            progressMax: 100, 
            barBackground: '#2B2D31', 
            progressColor: '#57F287',
            gradientFill: true,
            gradientStart: '#5865F2',
            gradientEnd: '#57F287',
            showPercentageText: isCir,
            paramKey: 'progress'
          });
        }

        // If one-click tool, add immediately and return to select mode
        if (obj) {
          initCanvas.add(obj);
          initCanvas.setActiveObject(obj);
          initCanvas.requestRenderAll();
          isDrawing.current = false;
          setActiveTool('select');
          persistCanvasState();
          return;
        }

        // 2. Drag-to-draw Shapes (Rect, Circle, Triangle, Star, Line)
        if (currentTool === 'rect') {
          obj = new fabric.Rect({ left: origin.current.x, top: origin.current.y, width: 1, height: 1, fill: fillCol, stroke: strokeCol, strokeWidth: strokeW, rx: 8, ry: 8 });
        } else if (currentTool === 'circle') {
          obj = new fabric.Circle({ left: origin.current.x, top: origin.current.y, radius: 1, fill: drawMode === 'fill' ? '#ED4245' : 'transparent', stroke: '#ED4245', strokeWidth: strokeW });
        } else if (currentTool === 'triangle') {
          obj = new fabric.Triangle({ left: origin.current.x, top: origin.current.y, width: 1, height: 1, fill: drawMode === 'fill' ? '#FEE75C' : 'transparent', stroke: '#FEE75C', strokeWidth: strokeW });
        } else if (currentTool === 'star') {
          obj = new fabric.Polygon([], { left: origin.current.x, top: origin.current.y, fill: drawMode === 'fill' ? '#FEE75C' : 'transparent', stroke: '#FEE75C', strokeWidth: strokeW });
        } else if (currentTool === 'line') {
          obj = new fabric.Line([origin.current.x, origin.current.y, origin.current.x, origin.current.y], {
            stroke: '#5865F2',
            strokeWidth: 4,
            strokeLineCap: 'round',
          });
        }

        if (obj) {
          initCanvas.add(obj);
          drawingObj.current = obj;
        }
      });

      initCanvas.on('mouse:move', (o) => {
        if (!isDrawing.current || !drawingObj.current) return;
        const pointer = initCanvas.getPointer(o.e);
        const curTool = useStore.getState().activeTool;
        
        if (curTool === 'rect' || curTool === 'triangle') {
          drawingObj.current.set({
            width: Math.max(2, Math.abs(pointer.x - origin.current.x)),
            height: Math.max(2, Math.abs(pointer.y - origin.current.y))
          });
          if (pointer.x < origin.current.x) drawingObj.current.set('left', pointer.x);
          if (pointer.y < origin.current.y) drawingObj.current.set('top', pointer.y);
        } else if (curTool === 'circle') {
          const radius = Math.max(2, Math.max(Math.abs(pointer.x - origin.current.x), Math.abs(pointer.y - origin.current.y)) / 2);
          (drawingObj.current as fabric.Circle).set('radius', radius);
          if (pointer.x < origin.current.x) drawingObj.current.set('left', origin.current.x - radius * 2);
          if (pointer.y < origin.current.y) drawingObj.current.set('top', origin.current.y - radius * 2);
        } else if (curTool === 'line' && drawingObj.current.type === 'line') {
          (drawingObj.current as fabric.Line).set({
            x2: pointer.x,
            y2: pointer.y,
          });
        } else if (curTool === 'star') {
          const w = Math.max(10, Math.abs(pointer.x - origin.current.x));
          const h = Math.max(10, Math.abs(pointer.y - origin.current.y));
          const cx = w / 2;
          const cy = h / 2;
          const spikes = 5;
          const outerRadius = w / 2;
          const innerRadius = w / 4;
          const points: fabric.Point[] = [];
          
          for (let i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (i * Math.PI) / spikes - Math.PI / 2;
            points.push(new fabric.Point(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius));
          }
          (drawingObj.current as fabric.Polygon).set({
            points: points,
            width: w,
            height: h
          });
          if (pointer.x < origin.current.x) drawingObj.current.set('left', pointer.x);
          if (pointer.y < origin.current.y) drawingObj.current.set('top', pointer.y);
        }
        initCanvas.requestRenderAll();
      });

      initCanvas.on('mouse:up', () => {
        if (isDrawing.current) {
          isDrawing.current = false;
          if (drawingObj.current) {
            // If just clicked without dragging, assign nice default dimensions
            if (drawingObj.current.type === 'rect' && (drawingObj.current.width || 0) < 10) {
              drawingObj.current.set({ width: 140, height: 100 });
            } else if (drawingObj.current.type === 'circle' && ((drawingObj.current as fabric.Circle).radius || 0) < 10) {
              (drawingObj.current as fabric.Circle).set({ radius: 50 });
            } else if (drawingObj.current.type === 'triangle' && (drawingObj.current.width || 0) < 10) {
              drawingObj.current.set({ width: 120, height: 100 });
            }
            drawingObj.current.setCoords();
            initCanvas.setActiveObject(drawingObj.current);
            initCanvas.requestRenderAll();
          }
          drawingObj.current = null;
          setActiveTool('select');
          persistCanvasState();
        }
      });
    }

    return () => {
      if (canvasInst.current) {
        canvasInst.current.dispose();
        canvasInst.current = null;
        setFabricCanvas(null);
      }
    };
  }, []);

  // Update background when bgConfig changes
  useEffect(() => {
    if (fabricCanvas) {
      applyCanvasBackground(fabricCanvas, bgConfig, canvasWidth, canvasHeight);
    }
  }, [bgConfig, canvasWidth, canvasHeight, fabricCanvas, applyCanvasBackground]);

  // Re-render when showGrid or gridSize changes
  useEffect(() => {
    if (fabricCanvas) {
      fabricCanvas.requestRenderAll();
    }
  }, [showGrid, gridSize, fabricCanvas]);

  // ADOBE ILLUSTRATOR SHORTCUTS (Delete, Copy, Paste, Cut, Duplicate, Arrows)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!fabricCanvas) return;
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement || e.target instanceof HTMLSelectElement) return;

      const activeObj = fabricCanvas.getActiveObject();

      // 1. Delete / Backspace
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (activeObj) {
          fabricCanvas.remove(activeObj);
          fabricCanvas.discardActiveObject();
          fabricCanvas.requestRenderAll();
          setSelectedObjectProps({});
          persistCanvasState();
          addToast({ type: 'info', title: 'Élément supprimé', message: 'L\'objet a été retiré du canvas.' });
        }
      }

      // 2. Ctrl + C (Copy)
      if (e.ctrlKey && e.key.toLowerCase() === 'c') {
        if (activeObj) {
          activeObj.clone((cloned: any) => {
            setClipboardData(cloned);
            addToast({ type: 'info', title: 'Copié', message: 'Élément copié dans le presse-papier.' });
          });
        }
      }

      // 3. Ctrl + V (Paste)
      if (e.ctrlKey && e.key.toLowerCase() === 'v') {
        if (clipboardData) {
          clipboardData.clone((clonedObj: any) => {
            fabricCanvas.discardActiveObject();
            clonedObj.set({
              left: clonedObj.left + 20,
              top: clonedObj.top + 20,
              evented: true,
            });
            if (clonedObj.type === 'activeSelection') {
              clonedObj.canvas = fabricCanvas;
              clonedObj.forEachObject((obj: any) => fabricCanvas.add(obj));
              clonedObj.setCoords();
            } else {
              fabricCanvas.add(clonedObj);
            }
            clipboardData.top += 20;
            clipboardData.left += 20;
            fabricCanvas.setActiveObject(clonedObj);
            fabricCanvas.requestRenderAll();
            persistCanvasState();
            addToast({ type: 'success', title: 'Collé', message: 'Nouvel élément inséré.' });
          });
        }
      }

      // 4. Ctrl + D (Duplicate in place)
      if (e.ctrlKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        if (activeObj) {
          activeObj.clone((cloned: any) => {
            cloned.set({
              left: activeObj.left! + 15,
              top: activeObj.top! + 15,
            });
            fabricCanvas.add(cloned);
            fabricCanvas.setActiveObject(cloned);
            fabricCanvas.requestRenderAll();
            persistCanvasState();
          });
        }
      }

      // 5. Arrow Keys (Move 1px or 10px with Shift)
      const step = e.shiftKey ? 10 : 1;
      if (activeObj) {
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          activeObj.set('top', (activeObj.top || 0) - step);
          activeObj.setCoords();
          fabricCanvas.requestRenderAll();
          updateProps(activeObj);
          persistCanvasState();
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          activeObj.set('top', (activeObj.top || 0) + step);
          activeObj.setCoords();
          fabricCanvas.requestRenderAll();
          updateProps(activeObj);
          persistCanvasState();
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          activeObj.set('left', (activeObj.left || 0) - step);
          activeObj.setCoords();
          fabricCanvas.requestRenderAll();
          updateProps(activeObj);
          persistCanvasState();
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          activeObj.set('left', (activeObj.left || 0) + step);
          activeObj.setCoords();
          fabricCanvas.requestRenderAll();
          updateProps(activeObj);
          persistCanvasState();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [fabricCanvas, clipboardData, persistCanvasState]);

  // Update selection properties in React State
  const updateProps = (obj: fabric.Object | undefined) => {
    if (!obj) {
      setSelectedObjectProps({});
      return;
    }
    
    const props: Record<string, any> = {
      type: obj.type,
      paramKey: (obj as any).paramKey || '',
      paramKeyStatus: (obj as any).paramKeyStatus || '',
      left: obj.left,
      top: obj.top,
      width: obj.width ? obj.width * (obj.scaleX || 1) : 0,
      height: obj.height ? obj.height * (obj.scaleY || 1) : 0,
      fill: obj.fill,
      stroke: obj.stroke || 'transparent',
      strokeWidth: obj.strokeWidth || 0,
      strokeLineCap: (obj as any).strokeLineCap || 'round',
      opacity: obj.opacity,
      rx: (obj as any).rx || 0,
      ry: (obj as any).ry || 0,
      shadowColor: obj.shadow ? (obj.shadow as fabric.Shadow).color : 'transparent',
      shadowBlur: obj.shadow ? (obj.shadow as fabric.Shadow).blur : 0,
      shadowOffsetX: obj.shadow ? (obj.shadow as fabric.Shadow).offsetX : 0,
      shadowOffsetY: obj.shadow ? (obj.shadow as fabric.Shadow).offsetY : 0,
    };
    
    if (obj.type === 'i-text' || obj.type === 'text') {
      const textObj = obj as fabric.IText;
      Object.assign(props, { 
        text: textObj.text, 
        fontSize: textObj.fontSize,
        fontFamily: textObj.fontFamily,
        fontWeight: textObj.fontWeight,
        fontStyle: textObj.fontStyle,
      });
    } else if (obj.type === 'progress-bar') {
      const pb = obj as any;
      Object.assign(props, { 
        barStyle: pb.barStyle || 'horizontal',
        progressValue: pb.progressValue, 
        progressMax: pb.progressMax,
        progressColor: pb.progressColor,
        gradientFill: pb.gradientFill,
        gradientStart: pb.gradientStart,
        gradientEnd: pb.gradientEnd,
        barBackground: pb.barBackground,
        segments: pb.segments || 10,
        showPercentageText: pb.showPercentageText
      });
    } else if (obj.type === 'discord-avatar') {
      const av = obj as any;
      Object.assign(props, {
        avatarRadius: av.avatarRadius,
        status: av.status,
        displayMode: av.displayMode || 'both',
        borderColor: av.borderColor,
        borderWidth: av.borderWidth,
        avatarUrl: av.avatarUrl,
        isBot: av.isBot,
      });
    } else if (obj.type === 'discord-banner') {
      const ban = obj as any;
      Object.assign(props, {
        bannerType: ban.bannerType || 'color',
        bannerUrl: ban.bannerUrl || '',
        gradientStart: ban.gradientStart || '#5865F2',
        gradientEnd: ban.gradientEnd || '#1E1F22',
      });
    } else if (obj.type === 'discord-role-badge') {
      const rb = obj as any;
      Object.assign(props, {
        roleName: rb.roleName,
        roleColor: rb.roleColor,
        fontSize: rb.fontSize,
        fontFamily: rb.fontFamily,
        rx: rb.rx
      });
    } else if (obj.type === 'circle-arc') {
      const arc = obj as any;
      Object.assign(props, {
        radius: arc.radius,
        startAngle: arc.startAngle,
        endAngle: arc.endAngle,
      });
    }

    setSelectedObjectProps(props);
  };

  // Instant reactive property update
  const handleUpdateProp = (key: string, value: any) => {
    if (!fabricCanvas) return;
    const obj = fabricCanvas.getActiveObject();
    if (!obj) return;
    
    if (key === 'width' || key === 'height') {
      obj.set('scaleX', 1);
      obj.set('scaleY', 1);
      obj.set(key as any, Number(value));
    } else if (['left', 'top', 'fontSize', 'progressValue', 'progressMax', 'strokeWidth', 'rx', 'ry', 'radius', 'startAngle', 'endAngle', 'avatarRadius', 'borderWidth', 'segments', 'shadowBlur', 'shadowOffsetX', 'shadowOffsetY'].includes(key)) {
      obj.set(key as any, Number(value));
    } else {
      obj.set(key as any, value);
    }

    // Special progress bar style reactivity
    if (key === 'barStyle' && obj.type === 'progress-bar') {
      const isCir = value === 'circular' || value === 'radial';
      if (isCir) {
        obj.set({ width: 140, height: 140 });
      } else if (value === 'vertical') {
        obj.set({ width: 26, height: 260 });
      } else {
        obj.set({ width: 340, height: 28 });
      }
      obj.set('barStyle' as any, value);
    }

    // Shadow special handling
    if (key.startsWith('shadow')) {
      const currentShadow = obj.shadow as fabric.Shadow;
      const shadow = new fabric.Shadow({
        color: key === 'shadowColor' ? value : currentShadow?.color || '#000000',
        blur: key === 'shadowBlur' ? Number(value) : currentShadow?.blur || 0,
        offsetX: key === 'shadowOffsetX' ? Number(value) : currentShadow?.offsetX || 0,
        offsetY: key === 'shadowOffsetY' ? Number(value) : currentShadow?.offsetY || 0,
      });
      obj.set('shadow', shadow);
    }

    // Avatar / Banner image reload
    if (key === 'avatarUrl' && obj.type === 'discord-avatar') {
      (obj as any).avatarUrl = value;
      (obj as any)._loadAvatarImage();
    }
    if (key === 'bannerUrl' && obj.type === 'discord-banner') {
      (obj as any).bannerUrl = value;
      (obj as any)._loadBannerImage();
    }
    
    obj.dirty = true;
    obj.setCoords();
    fabricCanvas.requestRenderAll();
    updateProps(obj);
    persistCanvasState();
  };

  // Handle Emoji Selection
  const handleSelectEmoji = (data: { type: 'unicode' | 'image'; style: string; char: string; url?: string; name: string }) => {
    if (!fabricCanvas) return;
    
    if (data.type === 'unicode' || !data.url) {
      const text = new fabric.IText(data.char, {
        left: canvasWidth / 2 - 20,
        top: canvasHeight / 2 - 20,
        fontFamily: 'Inter',
        fontSize: 50,
      });
      fabricCanvas.add(text);
      fabricCanvas.setActiveObject(text);
    } else {
      fabric.Image.fromURL(data.url, (img) => {
        img.scaleToWidth(50);
        img.set({
          left: canvasWidth / 2 - 25,
          top: canvasHeight / 2 - 25,
        });
        fabricCanvas.add(img);
        fabricCanvas.setActiveObject(img);
        fabricCanvas.requestRenderAll();
      }, { crossOrigin: 'anonymous' });
    }
    setShowEmoji(false);
    persistCanvasState();
  };

  // Interactive Border Resize with Grid Snapping
  const handleResizeStart = (dir: 'r' | 'b' | 'br', e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);
    resizeStartPos.current = {
      x: e.clientX,
      y: e.clientY,
      w: canvasWidth,
      h: canvasHeight
    };

    const gSize = useStore.getState().showGrid ? (useStore.getState().gridSize || 20) : 1;

    const handleMouseMove = (ev: MouseEvent) => {
      const deltaX = ev.clientX - resizeStartPos.current.x;
      const deltaY = ev.clientY - resizeStartPos.current.y;

      let newW = resizeStartPos.current.w;
      let newH = resizeStartPos.current.h;

      if (dir === 'r' || dir === 'br') {
        const rawW = resizeStartPos.current.w + deltaX;
        newW = Math.max(200, Math.min(3000, gSize > 1 ? Math.round(rawW / gSize) * gSize : Math.round(rawW)));
      }
      if (dir === 'b' || dir === 'br') {
        const rawH = resizeStartPos.current.h + deltaY;
        newH = Math.max(150, Math.min(3000, gSize > 1 ? Math.round(rawH / gSize) * gSize : Math.round(rawH)));
      }

      setCanvasWidth(newW);
      setCanvasHeight(newH);
      if (canvasInst.current) {
        canvasInst.current.setWidth(newW);
        canvasInst.current.setHeight(newH);
        applyCanvasBackground(canvasInst.current, bgConfig, newW, newH);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      persistCanvasState();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  // Export Code Trigger with Mock Rate-Limit Check
  const handleExportCodeClick = async () => {
    if (!fabricCanvas) return;

    // Simulate rate-limiting from backend
    const limitCheck = await mockApi.exportCardWithRateLimit();
    if (!limitCheck.success) {
      addToast({
        type: 'error',
        title: 'Rate Limit Atteint',
        message: limitCheck.error || 'Trop de requêtes d’export en peu de temps.'
      });
      return;
    }

    const json = fabricCanvas.toJSON([
      'paramKey', 'paramKeyStatus', 'displayMode', 'bannerType', 'bannerUrl', 'gradientStart', 
      'gradientEnd', 'gradientFill', 'barStyle', 'progressValue', 'progressMax', 'progressColor', 'barBackground', 
      'segments', 'showPercentageText', 'rx', 'ry', 'shadow', 'radius', 'startAngle', 
      'endAngle', 'strokeLineCap', 'avatarRadius', 'status', 'borderColor', 'borderWidth', 
      'avatarUrl', 'isBot', 'roleName', 'roleColor'
    ]);
    const code = generateNodeCanvasCode({
      language: exportLanguage,
      canvasWidth,
      canvasHeight,
      bgConfig,
      canvasObjects: json.objects || []
    });
    setGeneratedCode(code);
    setShowCode(true);
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: '#090A0E' }}>
      
      {/* 1. LEFT TOOLBAR */}
      <div className="glass-panel" style={{ width: '68px', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '16px 0', gap: '12px', zIndex: 40 }}>
        
        {/* Pointer / Select */}
        <ToolButton icon={<MousePointer2 size={20} />} active={activeTool === 'select'} onClick={() => { setActiveTool('select'); setActiveSubmenu(null); }} title="Sélectionner (V)" />
        
        <div style={{ width: '36px', height: '1px', background: 'var(--panel-border)', margin: '4px 0' }} />

        {/* Shapes Menu */}
        <div style={{ position: 'relative' }}>
          <ToolButton 
            icon={<Square size={20} />} 
            active={['rect', 'circle', 'triangle', 'star', 'line', 'circle-arc'].includes(activeTool) || activeSubmenu === 'shapes'} 
            onClick={() => setActiveSubmenu(activeSubmenu === 'shapes' ? null : 'shapes')} 
            title="Formes & Lignes" 
          />
          {activeSubmenu === 'shapes' && (
            <div className="glass-panel" style={{ position: 'absolute', left: '100%', top: 0, marginLeft: '10px', display: 'flex', flexDirection: 'column', gap: '6px', padding: '10px', borderRadius: '10px', width: '180px', zIndex: 100 }}>
              
              {/* Fill vs Stroke Mode Switcher */}
              <div style={{ display: 'flex', background: '#111214', padding: '3px', borderRadius: '6px', marginBottom: '6px' }}>
                <button
                  onClick={() => setShapeDrawMode('fill')}
                  style={{
                    flex: 1,
                    padding: '4px',
                    fontSize: '11px',
                    fontWeight: 600,
                    borderRadius: '4px',
                    background: shapeDrawMode === 'fill' ? '#5865F2' : 'transparent',
                    color: shapeDrawMode === 'fill' ? '#fff' : '#94A3B8'
                  }}
                >
                  Plein
                </button>
                <button
                  onClick={() => setShapeDrawMode('stroke')}
                  style={{
                    flex: 1,
                    padding: '4px',
                    fontSize: '11px',
                    fontWeight: 600,
                    borderRadius: '4px',
                    background: shapeDrawMode === 'stroke' ? '#5865F2' : 'transparent',
                    color: shapeDrawMode === 'stroke' ? '#fff' : '#94A3B8'
                  }}
                >
                  Contour
                </button>
              </div>

              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', padding: '2px 6px', fontWeight: 600 }}>FORMES</div>
              <SubmenuItem icon={<Square size={16} />} label="Rectangle" active={activeTool === 'rect'} onClick={() => { setActiveTool('rect'); setActiveSubmenu(null); }} />
              <SubmenuItem icon={<Circle size={16} />} label="Cercle" active={activeTool === 'circle'} onClick={() => { setActiveTool('circle'); setActiveSubmenu(null); }} />
              <SubmenuItem icon={<Triangle size={16} />} label="Triangle" active={activeTool === 'triangle'} onClick={() => { setActiveTool('triangle'); setActiveSubmenu(null); }} />
              <SubmenuItem icon={<Star size={16} />} label="Étoile" active={activeTool === 'star'} onClick={() => { setActiveTool('star'); setActiveSubmenu(null); }} />
              
              <div style={{ height: '1px', background: 'var(--panel-border)', margin: '4px 0' }} />
              <div style={{ fontSize: '11px', color: 'var(--text-secondary)', padding: '2px 6px', fontWeight: 600 }}>LIGNES & ARCS</div>
              <SubmenuItem icon={<Minus size={16} />} label="Ligne Droite" active={activeTool === 'line'} onClick={() => { setActiveTool('line'); setActiveSubmenu(null); }} />
              <SubmenuItem icon={<PieChart size={16} />} label="Arc de Cercle" active={activeTool === 'circle-arc'} onClick={() => { setActiveTool('circle-arc'); setActiveSubmenu(null); }} />
            </div>
          )}
        </div>

        {/* Discord Dedicated Components Menu */}
        <div style={{ position: 'relative' }}>
          <ToolButton 
            icon={<Users size={20} />} 
            active={['discord-avatar', 'discord-avatar-only', 'discord-status', 'discord-banner', 'discord-role', 'discord-channel'].includes(activeTool) || activeSubmenu === 'discord'} 
            onClick={() => setActiveSubmenu(activeSubmenu === 'discord' ? null : 'discord')} 
            title="Éléments Discord" 
          />
          {activeSubmenu === 'discord' && (
            <div className="glass-panel" style={{ position: 'absolute', left: '100%', top: 0, marginLeft: '10px', display: 'flex', flexDirection: 'column', gap: '6px', padding: '8px', borderRadius: '10px', width: '200px', zIndex: 100 }}>
              <div style={{ fontSize: '11px', color: '#5865F2', padding: '2px 6px', fontWeight: 700 }}>PROFIL & DISCORD</div>
              <SubmenuItem icon={<User size={16} />} label="Avatar Seul" active={activeTool === 'discord-avatar-only'} onClick={() => { setActiveTool('discord-avatar-only'); setActiveSubmenu(null); }} />
              <SubmenuItem icon={<Users size={16} />} label="Avatar + Statut" active={activeTool === 'discord-avatar'} onClick={() => { setActiveTool('discord-avatar'); setActiveSubmenu(null); }} />
              <SubmenuItem icon={<Circle size={16} />} label="Statut Seul" active={activeTool === 'discord-status'} onClick={() => { setActiveTool('discord-status'); setActiveSubmenu(null); }} />
              <SubmenuItem icon={<ImageIcon size={16} />} label="Bannière Discord" active={activeTool === 'discord-banner'} onClick={() => { setActiveTool('discord-banner'); setActiveSubmenu(null); }} />
              <SubmenuItem icon={<ShieldCheck size={16} />} label="Badge de Rôle" active={activeTool === 'discord-role'} onClick={() => { setActiveTool('discord-role'); setActiveSubmenu(null); }} />
              <SubmenuItem icon={<Hash size={16} />} label="Salon Textuel #" active={activeTool === 'discord-channel'} onClick={() => { setActiveTool('discord-channel'); setActiveSubmenu(null); }} />
            </div>
          )}
        </div>

        {/* Multi-Style Progress Bars */}
        <div style={{ position: 'relative' }}>
          <ToolButton 
            icon={<Percent size={20} />} 
            active={activeTool.startsWith('progress-') || activeSubmenu === 'progress'} 
            onClick={() => setActiveSubmenu(activeSubmenu === 'progress' ? null : 'progress')} 
            title="Barres de Progression & Jauges" 
          />
          {activeSubmenu === 'progress' && (
            <div className="glass-panel" style={{ position: 'absolute', left: '100%', top: 0, marginLeft: '10px', display: 'flex', flexDirection: 'column', gap: '6px', padding: '8px', borderRadius: '10px', width: '180px', zIndex: 100 }}>
              <div style={{ fontSize: '11px', color: '#57F287', padding: '2px 6px', fontWeight: 700 }}>BARRES & JAUGES</div>
              <SubmenuItem icon={<Minus size={16} />} label="Horizontale" active={activeTool === 'progress-horizontal'} onClick={() => { setActiveTool('progress-horizontal'); setActiveSubmenu(null); }} />
              <SubmenuItem icon={<Circle size={16} />} label="Circulaire (Ring)" active={activeTool === 'progress-circular'} onClick={() => { setActiveTool('progress-circular'); setActiveSubmenu(null); }} />
              <SubmenuItem icon={<PieChart size={16} />} label="Radiale (Jauge)" active={activeTool === 'progress-radial'} onClick={() => { setActiveTool('progress-radial'); setActiveSubmenu(null); }} />
              <SubmenuItem icon={<Layers size={16} />} label="Segmentée" active={activeTool === 'progress-segmented'} onClick={() => { setActiveTool('progress-segmented'); setActiveSubmenu(null); }} />
              <SubmenuItem icon={<Minus size={16} style={{ transform: 'rotate(90deg)' }} />} label="Verticale" active={activeTool === 'progress-vertical'} onClick={() => { setActiveTool('progress-vertical'); setActiveSubmenu(null); }} />
            </div>
          )}
        </div>

        {/* Text */}
        <ToolButton icon={<Type size={20} />} active={activeTool === 'text'} onClick={() => { setActiveTool('text'); setActiveSubmenu(null); }} title="Texte Dynamique (T)" />

        {/* Emojis Selector */}
        <div style={{ position: 'relative' }}>
          <ToolButton icon={<Smile size={20} />} active={showEmoji} onClick={() => { setShowEmoji(!showEmoji); setActiveSubmenu(null); }} title="Émojis Multi-Plateformes" />
          {showEmoji && (
            <div style={{ position: 'absolute', left: '100%', top: 0, marginLeft: '12px', zIndex: 200 }}>
              <EmojiSelector onSelect={handleSelectEmoji} onClose={() => setShowEmoji(false)} />
            </div>
          )}
        </div>
      </div>

      {/* 2. MAIN CENTER WORKSPACE */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
        
        {/* HEADER BAR */}
        <div className="glass-panel" style={{ height: '56px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', borderBottom: '1px solid var(--panel-border)' }}>
          
          {/* File Tabs for Current Project */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={() => navigate('/dashboard')}
              title="Retour aux projets"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: '#FFFFFF',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <ArrowLeft size={13} /> Mes Projets
            </button>

            <div style={{ width: '1px', height: '24px', background: 'var(--panel-border)', margin: '0 4px' }} />

            {/* Images Tabs of Active Project */}
            {currentProject?.images.map(img => (
              <div 
                key={img.id}
                onClick={() => setActiveImage(img.id)}
                style={{ 
                  padding: '6px 12px', 
                  background: activeImageId === img.id ? 'rgba(88,101,242,0.25)' : 'rgba(255,255,255,0.03)', 
                  border: activeImageId === img.id ? '1px solid #5865F2' : '1px solid var(--panel-border)',
                  color: activeImageId === img.id ? '#FFFFFF' : '#94A3B8',
                  borderRadius: 'var(--radius-md)', 
                  cursor: 'pointer', 
                  fontSize: '13px', 
                  fontWeight: 600,
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px' 
                }}
              >
                {editingImgId === img.id ? (
                  <input
                    type="text"
                    value={editingImgName}
                    onChange={(e) => setEditingImgName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        if (editingImgName.trim() && currentProject) {
                          updateImageCanvasState(currentProject.id, img.id, img.canvasState, img.width, img.height, img.bgConfig);
                        }
                        setEditingImgId(null);
                      }
                    }}
                    onBlur={() => setEditingImgId(null)}
                    autoFocus
                    style={{ background: '#111214', border: 'none', color: '#fff', fontSize: '13px', width: '100px' }}
                  />
                ) : (
                  <span>{img.name}</span>
                )}
                {activeImageId === img.id && editingImgId !== img.id && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingImgId(img.id);
                      setEditingImgName(img.name);
                    }}
                    title="Renommer l'image"
                    style={{ background: 'transparent', color: '#94A3B8', padding: '2px' }}
                  >
                    <Edit3 size={12} />
                  </button>
                )}
                {currentProject.images.length > 1 && activeImageId === img.id && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteImageFromProject(currentProject.id, img.id);
                    }}
                    title="Supprimer cette image"
                    style={{ background: 'transparent', color: '#ED4245', padding: '2px' }}
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            ))}

            <button 
              onClick={() => {
                if (currentProject) {
                  addImageToProject(currentProject.id);
                }
              }} 
              title="Ajouter une image au projet"
              style={{ background: 'rgba(255,255,255,0.05)', color: '#94A3B8', padding: '6px', borderRadius: '6px', display: 'flex', alignItems: 'center' }}
            >
              <Plus size={16} />
            </button>
          </div>

          {/* Center Info: Dimension & Grid Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            
            {/* Grid Toggle */}
            <button
              onClick={() => setShowGrid(!showGrid)}
              title={showGrid ? "Désactiver la grille" : "Activer la grille (Grille magnétique)"}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                background: showGrid ? 'rgba(88,101,242,0.25)' : 'rgba(255,255,255,0.04)',
                border: showGrid ? '1px solid #5865F2' : '1px solid var(--panel-border)',
                color: showGrid ? '#5865F2' : '#94A3B8',
                padding: '5px 10px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 600
              }}
            >
              <Grid size={14} /> Grille
            </button>

            {/* Custom Grid Size Input */}
            {showGrid && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#111214', border: '1px solid var(--panel-border)', padding: '2px 8px', borderRadius: '6px' }}>
                <input
                  type="number"
                  min={4}
                  max={200}
                  value={gridSize}
                  onChange={(e) => setGridSize(Math.max(4, Math.min(200, Number(e.target.value) || 20)))}
                  style={{
                    width: '42px',
                    background: 'transparent',
                    border: 'none',
                    color: '#5865F2',
                    fontSize: '12px',
                    fontWeight: 700,
                    textAlign: 'center'
                  }}
                />
                <span style={{ fontSize: '11px', color: '#64748B' }}>px</span>
              </div>
            )}

            <div style={{ background: '#111214', border: '1px solid var(--panel-border)', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', color: '#94A3B8', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>{canvasWidth} × {canvasHeight} px</span>
              {isResizing && <span style={{ color: '#5865F2', fontWeight: 600 }}>[Redimensionnement...]</span>}
            </div>
          </div>

          {/* Action Export Buttons */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={handleExportCodeClick} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                background: '#5865F2', 
                color: '#fff', 
                padding: '8px 16px', 
                borderRadius: 'var(--radius-md)', 
                fontWeight: 600,
                fontSize: '13px',
                boxShadow: '0 4px 12px rgba(88,101,242,0.4)'
              }}
            >
              <Code size={16} /> Code TypeScript / JS
            </button>

            <button 
              onClick={() => {
                if (currentProject) {
                  exportProjectToZip(currentProject.images, exportLanguage);
                }
              }} 
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px', 
                background: 'rgba(255,255,255,0.06)', 
                border: '1px solid var(--panel-border)', 
                color: '#fff', 
                padding: '8px 14px', 
                borderRadius: 'var(--radius-md)',
                fontSize: '13px',
                fontWeight: 500
              }}
            >
              <FileArchive size={16} /> ZIP
            </button>
          </div>
        </div>

        {/* CANVAS WORKSPACE VIEWPORT */}
        <div 
          style={{ 
            flex: 1, 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            background: '#0B0C10', 
            overflow: 'auto',
            position: 'relative',
            padding: '40px'
          }}
        >
          {/* Canvas Frame Wrapper */}
          <div 
            className={bgConfig.type === 'transparent' ? 'transparent-canvas-grid' : ''}
            style={{ 
              boxShadow: '0 20px 60px rgba(0,0,0,0.8), 0 0 0 1px var(--panel-border)', 
              borderRadius: '6px', 
              position: 'relative',
              width: canvasWidth, 
              height: canvasHeight 
            }}
          >
            <canvas ref={canvasRef} />

            {/* Resize Handles */}
            <div 
              className="canvas-resize-handle-r" 
              title="Glisser pour ajuster la largeur"
              onMouseDown={(e) => handleResizeStart('r', e)} 
            />
            <div 
              className="canvas-resize-handle-b" 
              title="Glisser pour ajuster la hauteur"
              onMouseDown={(e) => handleResizeStart('b', e)} 
            />
            <div 
              className="canvas-resize-handle-br" 
              title="Glisser pour redimensionner librement"
              onMouseDown={(e) => handleResizeStart('br', e)} 
            />
          </div>
        </div>

        {/* EXPORT CODE MODAL */}
        {showCode && (
          <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '24px' }}>
            <div style={{ width: '920px', height: '85vh', background: '#18191C', border: '1px solid var(--panel-border)', borderRadius: '16px', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 60px rgba(0,0,0,0.9)' }}>
              
              {/* Modal Header */}
              <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--panel-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#fff' }}>Code Node.js Canvas Généré</h3>
                  
                  {/* Language Selector */}
                  <div style={{ display: 'flex', background: '#111214', padding: '3px', borderRadius: '8px', border: '1px solid var(--panel-border)' }}>
                    <button
                      onClick={() => {
                        setExportLanguage('typescript');
                        if (fabricCanvas) {
                          const json = fabricCanvas.toJSON([
                            'paramKey', 'paramKeyStatus', 'displayMode', 'bannerType', 'bannerUrl', 'gradientStart', 
                            'gradientEnd', 'gradientFill', 'barStyle', 'progressValue', 'progressMax', 'progressColor', 'barBackground', 
                            'segments', 'showPercentageText', 'rx', 'ry', 'shadow', 'radius', 'startAngle', 
                            'endAngle', 'strokeLineCap', 'avatarRadius', 'status', 'borderColor', 'borderWidth', 
                            'avatarUrl', 'isBot', 'roleName', 'roleColor'
                          ]);
                          setGeneratedCode(generateNodeCanvasCode({
                            language: 'typescript',
                            canvasWidth,
                            canvasHeight,
                            bgConfig,
                            canvasObjects: json.objects || []
                          }));
                        }
                      }}
                      style={{
                        padding: '4px 12px',
                        fontSize: '12px',
                        fontWeight: 600,
                        borderRadius: '6px',
                        background: exportLanguage === 'typescript' ? '#5865F2' : 'transparent',
                        color: exportLanguage === 'typescript' ? '#fff' : '#94A3B8'
                      }}
                    >
                      TypeScript (Typé Strict)
                    </button>
                    <button
                      onClick={() => {
                        setExportLanguage('javascript');
                        if (fabricCanvas) {
                          const json = fabricCanvas.toJSON([
                            'paramKey', 'paramKeyStatus', 'displayMode', 'bannerType', 'bannerUrl', 'gradientStart', 
                            'gradientEnd', 'gradientFill', 'barStyle', 'progressValue', 'progressMax', 'progressColor', 'barBackground', 
                            'segments', 'showPercentageText', 'rx', 'ry', 'shadow', 'radius', 'startAngle', 
                            'endAngle', 'strokeLineCap', 'avatarRadius', 'status', 'borderColor', 'borderWidth', 
                            'avatarUrl', 'isBot', 'roleName', 'roleColor'
                          ]);
                          setGeneratedCode(generateNodeCanvasCode({
                            language: 'javascript',
                            canvasWidth,
                            canvasHeight,
                            bgConfig,
                            canvasObjects: json.objects || []
                          }));
                        }
                      }}
                      style={{
                        padding: '4px 12px',
                        fontSize: '12px',
                        fontWeight: 600,
                        borderRadius: '6px',
                        background: exportLanguage === 'javascript' ? '#5865F2' : 'transparent',
                        color: exportLanguage === 'javascript' ? '#fff' : '#94A3B8'
                      }}
                    >
                      JavaScript
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(generatedCode);
                      setCopiedCode(true);
                      setTimeout(() => setCopiedCode(false), 2000);
                      addToast({ type: 'success', title: 'Copié !', message: 'Code TypeScript copié dans le presse-papier.' });
                    }}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', background: copiedCode ? '#57F287' : 'rgba(255,255,255,0.08)', color: copiedCode ? '#000' : '#fff', padding: '6px 14px', borderRadius: '8px', fontSize: '13px', fontWeight: 600 }}
                  >
                    {copiedCode ? <Check size={16} /> : <Copy size={16} />}
                    {copiedCode ? 'Copié !' : 'Copier'}
                  </button>
                  <button 
                    onClick={() => setShowCode(false)} 
                    style={{ background: 'transparent', color: '#94A3B8', padding: '6px 10px', borderRadius: '8px' }}
                  >
                    Fermer
                  </button>
                </div>
              </div>

              {/* Code View Area */}
              <div style={{ flex: 1, overflow: 'auto', background: '#0D0E11', padding: '20px' }}>
                <pre style={{ margin: 0, fontFamily: '"Fira Code", monospace', fontSize: '13px', lineHeight: '1.6', color: '#a5b4fc' }}>
                  <code>{generatedCode}</code>
                </pre>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. RIGHT PROPERTIES PANEL */}
      <div className="glass-panel" style={{ width: '340px', borderLeft: '1px solid var(--panel-border)', display: 'flex', flexDirection: 'column', zIndex: 30, background: '#16181D' }}>
        
        {/* Panel Title */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--panel-border)', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Settings size={18} color="#5865F2" />
          <h2 style={{ fontSize: '15px', fontWeight: 600, color: '#fff' }}>Propriétés & Style</h2>
        </div>
        
        {/* Panel Content Scrollable */}
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '20px', overflowY: 'auto', flex: 1 }}>
          
          {/* A. NO OBJECT SELECTED -> CANVAS & BACKGROUND & GRID SETTINGS */}
          {Object.keys(selectedObjectProps).length === 0 ? (
            <>
              {/* Canvas Dimensions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>DIMENSIONS DU CANVAS</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <PropInput label="Largeur (W)" value={canvasWidth} onChange={(v) => { const n = Number(v) || 100; setCanvasWidth(n); fabricCanvas?.setWidth(n); persistCanvasState(); }} />
                  <PropInput label="Hauteur (H)" value={canvasHeight} onChange={(v) => { const n = Number(v) || 100; setCanvasHeight(n); fabricCanvas?.setHeight(n); persistCanvasState(); }} />
                </div>

                {/* Quick Presets */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '4px' }}>
                  {[
                    { label: 'Discord Banner', w: 960, h: 540 },
                    { label: 'Rank Card 16:9', w: 800, h: 450 },
                    { label: 'Mini Card', w: 600, h: 250 },
                    { label: 'Carré Avatar', w: 500, h: 500 },
                  ].map(p => (
                    <button
                      key={p.label}
                      onClick={() => {
                        setCanvasWidth(p.w);
                        setCanvasHeight(p.h);
                        fabricCanvas?.setWidth(p.w);
                        fabricCanvas?.setHeight(p.h);
                        persistCanvasState();
                      }}
                      style={{ padding: '6px', fontSize: '11px', background: '#2B2D31', color: '#94A3B8', borderRadius: '6px', textAlign: 'center' }}
                    >
                      {p.label} ({p.w}x{p.h})
                    </button>
                  ))}
                </div>
              </div>

              {/* Grid & Snapping Configuration */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: '#1A1D24', padding: '12px', borderRadius: '8px', border: '1px solid rgba(88,101,242,0.2)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#5865F2', textTransform: 'uppercase' }}>GRILLE MAGNÉTIQUE</span>
                  <input 
                    type="checkbox" 
                    checked={showGrid} 
                    onChange={(e) => setShowGrid(e.target.checked)} 
                  />
                </div>

                {showGrid && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '12px', color: '#94A3B8' }}>Taille de pas (px)</span>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <input
                          type="number"
                          min={4}
                          max={200}
                          value={gridSize}
                          onChange={(e) => setGridSize(Math.max(4, Math.min(200, Number(e.target.value) || 20)))}
                          style={{
                            width: '54px',
                            background: '#111214',
                            border: '1px solid var(--panel-border)',
                            color: '#5865F2',
                            fontSize: '12px',
                            fontWeight: 700,
                            padding: '4px 6px',
                            borderRadius: '6px',
                            textAlign: 'center'
                          }}
                        />
                        <span style={{ fontSize: '11px', color: '#64748B' }}>px</span>
                      </div>
                    </div>

                    {/* Quick Size Presets */}
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {[10, 20, 25, 50].map(sz => (
                        <button
                          key={sz}
                          onClick={() => setGridSize(sz)}
                          style={{
                            flex: 1,
                            padding: '4px 0',
                            borderRadius: '4px',
                            fontSize: '11px',
                            fontWeight: 600,
                            background: gridSize === sz ? '#5865F2' : '#2B2D31',
                            color: gridSize === sz ? '#fff' : '#94A3B8',
                            textAlign: 'center'
                          }}
                        >
                          {sz}px
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ fontSize: '11px', color: '#64748B', lineHeight: '1.4' }}>
                  💡 <strong>Astuce Alignement :</strong> Maintenez la touche <strong style={{ color: '#57F287' }}>Ctrl</strong> pour afficher les lignes d'alignement vertes intelligentes (bords, centres, symétrie).
                </div>
              </div>

              {/* Background Configuration */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>ARRIÈRE-PLAN DU CANVAS</div>
                
                {/* Type Switcher Tabs */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', background: '#111214', padding: '3px', borderRadius: '8px' }}>
                  {[
                    { id: 'preset', label: 'Presets' },
                    { id: 'color', label: 'Couleur' },
                    { id: 'gradient', label: 'Dégradé' },
                    { id: 'transparent', label: 'Transp.' },
                  ].map(t => (
                    <button
                      key={t.id}
                      onClick={() => {
                        setBgConfig({ type: t.id as any });
                        persistCanvasState();
                      }}
                      style={{
                        padding: '6px 2px',
                        fontSize: '11px',
                        fontWeight: 600,
                        borderRadius: '6px',
                        background: bgConfig.type === t.id ? '#5865F2' : 'transparent',
                        color: bgConfig.type === t.id ? '#fff' : '#94A3B8'
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Preset Picker (Single column minimalist list) */}
                {bgConfig.type === 'preset' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '380px', overflowY: 'auto', paddingRight: '4px' }}>
                    {PRESET_BACKGROUNDS.map(p => (
                      <div
                        key={p.id}
                        onClick={() => {
                          setBgConfig({ presetId: p.id });
                          persistCanvasState();
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '7px 10px',
                          borderRadius: '8px',
                          background: bgConfig.presetId === p.id ? 'rgba(88,101,242,0.25)' : '#2B2D31',
                          border: bgConfig.presetId === p.id ? '1px solid #5865F2' : '1px solid rgba(255,255,255,0.04)',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <div style={{ width: '28px', height: '20px', borderRadius: '4px', background: p.previewGradient, flexShrink: 0, border: '1px solid rgba(255,255,255,0.1)' }} />
                        <span style={{ fontSize: '12px', fontWeight: 600, color: bgConfig.presetId === p.id ? '#FFFFFF' : '#94A3B8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {p.name}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Solid Color */}
                {bgConfig.type === 'color' && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#1E1F22', padding: '10px 12px', borderRadius: '8px' }}>
                    <span style={{ fontSize: '13px' }}>Couleur de Fond</span>
                    <div 
                      style={{ width: '36px', height: '24px', borderRadius: '4px', background: bgConfig.color, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.2)' }}
                      onClick={() => setShowColorPicker({ show: true, key: 'bg-color' })}
                    />
                  </div>
                )}

                {/* Gradient Settings */}
                {bgConfig.type === 'gradient' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', background: '#1E1F22', padding: '12px', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px' }}>Début</span>
                      <div 
                        style={{ width: '32px', height: '20px', borderRadius: '4px', background: bgConfig.gradientStart, cursor: 'pointer' }}
                        onClick={() => setShowColorPicker({ show: true, key: 'bg-grad-start' })}
                      />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px' }}>Fin</span>
                      <div 
                        style={{ width: '32px', height: '20px', borderRadius: '4px', background: bgConfig.gradientEnd, cursor: 'pointer' }}
                        onClick={() => setShowColorPicker({ show: true, key: 'bg-grad-end' })}
                      />
                    </div>
                  </div>
                )}

                {/* Transparent Info */}
                {bgConfig.type === 'transparent' && (
                  <div style={{ background: '#1E1F22', padding: '12px', borderRadius: '8px', fontSize: '12px', color: '#94A3B8', lineHeight: '1.5' }}>
                    ✨ <strong>Fond 100% Transparent activé.</strong> L'image sera exportée sans fond opaque.
                  </div>
                )}
              </div>
            </>
          ) : (
            
            /* B. OBJECT SELECTED -> ADVANCED PROPERTIES */
            <>
              {/* Object Type Badge */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(88,101,242,0.15)', padding: '6px 12px', borderRadius: '6px', border: '1px solid rgba(88,101,242,0.3)' }}>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#5865F2', textTransform: 'uppercase' }}>
                  {selectedObjectProps.type}
                </span>
                <button 
                  onClick={() => {
                    if (fabricCanvas) {
                      const active = fabricCanvas.getActiveObject();
                      if (active) {
                        fabricCanvas.remove(active);
                        fabricCanvas.discardActiveObject();
                        fabricCanvas.requestRenderAll();
                        setSelectedObjectProps({});
                        persistCanvasState();
                      }
                    }
                  }}
                  style={{ background: 'transparent', color: '#ED4245', fontSize: '12px', fontWeight: 600 }}
                >
                  Supprimer
                </button>
              </div>

              {/* DYNAMIC PARAM KEY (OPTION NAME) */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', background: '#1A1D24', padding: '10px', borderRadius: '8px', border: '1px solid rgba(88,101,242,0.3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#5865F2' }}>NOM DU PARAMÈTRE (OPTIONS)</span>
                  <span style={{ fontSize: '10px', color: '#94A3B8' }}>options.<strong>{selectedObjectProps.paramKey || '...'}</strong></span>
                </div>
                <input 
                  type="text" 
                  value={selectedObjectProps.paramKey || ''} 
                  placeholder="Ex: userAvatar, xpBar, playerRank"
                  onChange={(e) => handleUpdateProp('paramKey', e.target.value)}
                  style={{ background: '#111214', border: '1px solid var(--panel-border)', color: '#fff', padding: '6px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 600 }} 
                />
              </div>

              {/* 1. GEOMETRY */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>GÉOMÉTRIE & POSITION</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <PropInput label="X" value={Math.round(selectedObjectProps.left)} onChange={(v) => handleUpdateProp('left', v)} />
                  <PropInput label="Y" value={Math.round(selectedObjectProps.top)} onChange={(v) => handleUpdateProp('top', v)} />
                  <PropInput label="W" value={Math.round(selectedObjectProps.width)} onChange={(v) => handleUpdateProp('width', v)} />
                  <PropInput label="H" value={Math.round(selectedObjectProps.height)} onChange={(v) => handleUpdateProp('height', v)} />
                </div>
                
                {/* Non-distorted Corner Radius */}
                {(selectedObjectProps.type === 'rect' || selectedObjectProps.type === 'progress-bar' || selectedObjectProps.type === 'discord-banner') && (
                  <PropInput 
                    label="Arrondi (Corner Radius)" 
                    value={selectedObjectProps.rx || 0} 
                    onChange={(v) => { handleUpdateProp('rx', v); handleUpdateProp('ry', v); }} 
                  />
                )}
              </div>

              {/* 2. FILL & STROKE */}
              {selectedObjectProps.type !== 'discord-avatar' && selectedObjectProps.type !== 'image' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>COULEURS & CONTOURS</div>
                  
                  {/* Fill Color */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#1E1F22', padding: '8px 12px', borderRadius: '6px' }}>
                    <span style={{ fontSize: '12px' }}>Remplissage (Fill)</span>
                    <div 
                      style={{ width: '36px', height: '22px', borderRadius: '4px', background: selectedObjectProps.fill, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.2)' }}
                      onClick={() => setShowColorPicker({ show: true, key: 'fill' })}
                    />
                  </div>

                  {/* Stroke Color & Width */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#1E1F22', padding: '8px 12px', borderRadius: '6px' }}>
                    <span style={{ fontSize: '12px' }}>Contour (Stroke)</span>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <input 
                        type="number" 
                        value={selectedObjectProps.strokeWidth || 0} 
                        onChange={e => handleUpdateProp('strokeWidth', e.target.value)} 
                        style={{ width: '48px', background: '#111214', border: '1px solid var(--panel-border)', color: '#fff', padding: '4px', borderRadius: '4px', fontSize: '12px', textAlign: 'center' }} 
                      />
                      <div 
                        style={{ width: '36px', height: '22px', borderRadius: '4px', background: selectedObjectProps.stroke || 'transparent', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.2)' }}
                        onClick={() => setShowColorPicker({ show: true, key: 'stroke' })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* 3. SHADOW */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>OMBRE PORTÉE (SHADOW)</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#1E1F22', padding: '8px 12px', borderRadius: '6px' }}>
                  <span style={{ fontSize: '12px' }}>Couleur Ombre</span>
                  <div 
                    style={{ width: '36px', height: '22px', borderRadius: '4px', background: selectedObjectProps.shadowColor || 'transparent', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.2)' }}
                    onClick={() => setShowColorPicker({ show: true, key: 'shadowColor' })}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
                  <PropInput label="Flou" value={selectedObjectProps.shadowBlur || 0} onChange={(v) => handleUpdateProp('shadowBlur', v)} />
                  <PropInput label="X" value={selectedObjectProps.shadowOffsetX || 0} onChange={(v) => handleUpdateProp('shadowOffsetX', v)} />
                  <PropInput label="Y" value={selectedObjectProps.shadowOffsetY || 0} onChange={(v) => handleUpdateProp('shadowOffsetY', v)} />
                </div>
              </div>

              {/* 4. DISCORD AVATAR SPECIFICS */}
              {selectedObjectProps.type === 'discord-avatar' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#5865F2', textTransform: 'uppercase' }}>RÉGLAGES AVATAR & PROFIL</div>
                  
                  {/* Mode Selector */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '11px', color: '#94A3B8' }}>Éléments à afficher</span>
                    <select
                      value={selectedObjectProps.displayMode || 'both'}
                      onChange={(e) => handleUpdateProp('displayMode', e.target.value)}
                      style={{ background: '#1E1F22', border: '1px solid var(--panel-border)', color: '#fff', padding: '8px', borderRadius: '6px', fontSize: '12px' }}
                    >
                      <option value="both">Avatar + Statut</option>
                      <option value="avatar-only">Avatar Seul</option>
                      <option value="status-only">Statut Seul</option>
                    </select>
                  </div>

                  {/* Status Picker */}
                  {selectedObjectProps.displayMode !== 'avatar-only' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '11px', color: '#94A3B8' }}>Statut de connexion</span>
                      <select
                        value={selectedObjectProps.status || 'online'}
                        onChange={(e) => handleUpdateProp('status', e.target.value)}
                        style={{ background: '#1E1F22', border: '1px solid var(--panel-border)', color: '#fff', padding: '8px', borderRadius: '6px', fontSize: '12px' }}
                      >
                        <option value="online">🟢 En ligne (Online)</option>
                        <option value="idle">🟡 Inactif (Idle)</option>
                        <option value="dnd">🔴 Ne pas déranger (DND)</option>
                        <option value="offline">⚪ Hors ligne (Offline)</option>
                        <option value="none">Aucun</option>
                      </select>
                    </div>
                  )}

                  {/* Avatar URL */}
                  {selectedObjectProps.displayMode !== 'status-only' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '11px', color: '#94A3B8' }}>URL de l'avatar</span>
                      <input 
                        type="text" 
                        value={selectedObjectProps.avatarUrl || ''} 
                        onChange={(e) => handleUpdateProp('avatarUrl', e.target.value)}
                        style={{ background: '#1E1F22', border: '1px solid var(--panel-border)', color: '#fff', padding: '8px', borderRadius: '6px', fontSize: '12px' }}
                      />
                    </div>
                  )}

                  {/* Border Width & Color */}
                  {selectedObjectProps.displayMode !== 'status-only' && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1E1F22', padding: '8px 12px', borderRadius: '6px' }}>
                      <span style={{ fontSize: '12px' }}>Bordure Avatar</span>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <input 
                          type="number" 
                          value={selectedObjectProps.borderWidth || 0} 
                          onChange={e => handleUpdateProp('borderWidth', e.target.value)} 
                          style={{ width: '45px', background: '#111214', border: '1px solid var(--panel-border)', color: '#fff', padding: '4px', borderRadius: '4px', fontSize: '12px', textAlign: 'center' }} 
                        />
                        <div 
                          style={{ width: '32px', height: '22px', borderRadius: '4px', background: selectedObjectProps.borderColor || '#5865F2', cursor: 'pointer' }}
                          onClick={() => setShowColorPicker({ show: true, key: 'borderColor' })}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 5. DISCORD BANNER SPECIFICS */}
              {selectedObjectProps.type === 'discord-banner' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#5865F2', textTransform: 'uppercase' }}>RÉGLAGES BANNIÈRE DISCORD</div>
                  
                  <select
                    value={selectedObjectProps.bannerType || 'color'}
                    onChange={(e) => handleUpdateProp('bannerType', e.target.value)}
                    style={{ background: '#1E1F22', border: '1px solid var(--panel-border)', color: '#fff', padding: '8px', borderRadius: '6px', fontSize: '12px' }}
                  >
                    <option value="color">Couleur Unie</option>
                    <option value="gradient">Dégradé Linéaire</option>
                    <option value="image">Image (URL)</option>
                  </select>

                  {selectedObjectProps.bannerType === 'image' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '11px', color: '#94A3B8' }}>URL de la Bannière</span>
                      <input 
                        type="text" 
                        value={selectedObjectProps.bannerUrl || ''} 
                        onChange={(e) => handleUpdateProp('bannerUrl', e.target.value)}
                        style={{ background: '#1E1F22', border: '1px solid var(--panel-border)', color: '#fff', padding: '8px', borderRadius: '6px', fontSize: '12px' }}
                      />
                    </div>
                  )}

                  {selectedObjectProps.bannerType === 'gradient' && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1E1F22', padding: '8px 12px', borderRadius: '6px' }}>
                      <span style={{ fontSize: '12px' }}>Dégradé Début / Fin</span>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <div 
                          style={{ width: '28px', height: '20px', borderRadius: '4px', background: selectedObjectProps.gradientStart || '#5865F2', cursor: 'pointer' }}
                          onClick={() => setShowColorPicker({ show: true, key: 'gradientStart' })}
                        />
                        <div 
                          style={{ width: '28px', height: '20px', borderRadius: '4px', background: selectedObjectProps.gradientEnd || '#1E1F22', cursor: 'pointer' }}
                          onClick={() => setShowColorPicker({ show: true, key: 'gradientEnd' })}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 6. DISCORD ROLE BADGE SPECIFICS */}
              {selectedObjectProps.type === 'discord-role-badge' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#5865F2', textTransform: 'uppercase' }}>RÉGLAGES RÔLE DISCORD</div>
                  <PropInput label="Nom du Rôle" value={selectedObjectProps.roleName || ''} onChange={(v) => handleUpdateProp('roleName', v)} />
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#1E1F22', padding: '8px 12px', borderRadius: '6px' }}>
                    <span style={{ fontSize: '12px' }}>Couleur du Rôle</span>
                    <div 
                      style={{ width: '36px', height: '22px', borderRadius: '4px', background: selectedObjectProps.roleColor || '#5865F2', cursor: 'pointer' }}
                      onClick={() => setShowColorPicker({ show: true, key: 'roleColor' })}
                    />
                  </div>
                  <PropInput label="Taille Police" value={selectedObjectProps.fontSize || 16} onChange={(v) => handleUpdateProp('fontSize', v)} />
                </div>
              )}

              {/* 7. PROGRESS BAR WITH GRADIENTS */}
              {selectedObjectProps.type === 'progress-bar' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#57F287', textTransform: 'uppercase' }}>BARRE DE PROGRESSION & DÉGRADÉS</div>
                  
                  {/* Style Selector */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '11px', color: '#94A3B8' }}>Style de Jauge</span>
                    <select
                      value={selectedObjectProps.barStyle || 'horizontal'}
                      onChange={(e) => handleUpdateProp('barStyle', e.target.value)}
                      style={{ background: '#1E1F22', border: '1px solid var(--panel-border)', color: '#fff', padding: '8px', borderRadius: '6px', fontSize: '12px' }}
                    >
                      <option value="horizontal">Horizontale Classique</option>
                      <option value="circular">Circulaire (Anneau / Ring)</option>
                      <option value="radial">Radiale (Jauge / Speedo)</option>
                      <option value="segmented">Segmentée (Blocs)</option>
                      <option value="vertical">Verticale</option>
                    </select>
                  </div>

                  {/* Value & Max */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <PropInput label="Valeur" value={selectedObjectProps.progressValue} onChange={(v) => handleUpdateProp('progressValue', v)} />
                    <PropInput label="Max" value={selectedObjectProps.progressMax} onChange={(v) => handleUpdateProp('progressMax', v)} />
                  </div>

                  {/* Gradient Fill Toggle */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#1E1F22', padding: '8px 12px', borderRadius: '6px' }}>
                    <span style={{ fontSize: '12px' }}>Remplissage en Dégradé</span>
                    <input 
                      type="checkbox" 
                      checked={!!selectedObjectProps.gradientFill} 
                      onChange={(e) => handleUpdateProp('gradientFill', e.target.checked)} 
                    />
                  </div>

                  {/* Gradient Colors vs Solid Color */}
                  {selectedObjectProps.gradientFill ? (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1E1F22', padding: '8px 12px', borderRadius: '6px' }}>
                      <span style={{ fontSize: '12px' }}>Dégradé Début / Fin</span>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <div 
                          style={{ width: '30px', height: '20px', borderRadius: '4px', background: selectedObjectProps.gradientStart || '#5865F2', cursor: 'pointer' }}
                          onClick={() => setShowColorPicker({ show: true, key: 'gradientStart' })}
                        />
                        <div 
                          style={{ width: '30px', height: '20px', borderRadius: '4px', background: selectedObjectProps.gradientEnd || '#57F287', cursor: 'pointer' }}
                          onClick={() => setShowColorPicker({ show: true, key: 'gradientEnd' })}
                        />
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1E1F22', padding: '8px 12px', borderRadius: '6px' }}>
                      <span style={{ fontSize: '12px' }}>Couleur Remplissage</span>
                      <div 
                        style={{ width: '32px', height: '20px', borderRadius: '4px', background: selectedObjectProps.progressColor || '#57F287', cursor: 'pointer' }}
                        onClick={() => setShowColorPicker({ show: true, key: 'progressColor' })}
                      />
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1E1F22', padding: '8px 12px', borderRadius: '6px' }}>
                    <span style={{ fontSize: '12px' }}>Couleur Fond Track</span>
                    <div 
                      style={{ width: '32px', height: '20px', borderRadius: '4px', background: selectedObjectProps.barBackground || '#2B2D31', cursor: 'pointer' }}
                      onClick={() => setShowColorPicker({ show: true, key: 'barBackground' })}
                    />
                  </div>

                  {/* Segment Count (if segmented) */}
                  {selectedObjectProps.barStyle === 'segmented' && (
                    <PropInput label="Nb Blocs" value={selectedObjectProps.segments || 10} onChange={(v) => handleUpdateProp('segments', v)} />
                  )}

                  {/* Percentage Text Toggle */}
                  {(selectedObjectProps.barStyle === 'circular' || selectedObjectProps.barStyle === 'radial') && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#1E1F22', padding: '8px 12px', borderRadius: '6px' }}>
                      <span style={{ fontSize: '12px' }}>Afficher Texte %</span>
                      <input 
                        type="checkbox" 
                        checked={!!selectedObjectProps.showPercentageText} 
                        onChange={(e) => handleUpdateProp('showPercentageText', e.target.checked)} 
                      />
                    </div>
                  )}
                </div>
              )}

              {/* 8. CIRCLE ARC SPECIFICS */}
              {selectedObjectProps.type === 'circle-arc' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#5865F2', textTransform: 'uppercase' }}>RÉGLAGES ARC DE CERCLE</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <PropInput label="Angle Début" value={selectedObjectProps.startAngle || 0} onChange={(v) => handleUpdateProp('startAngle', v)} />
                    <PropInput label="Angle Fin" value={selectedObjectProps.endAngle || 180} onChange={(v) => handleUpdateProp('endAngle', v)} />
                  </div>
                  <PropInput label="Rayon" value={selectedObjectProps.radius || 60} onChange={(v) => handleUpdateProp('radius', v)} />
                </div>
              )}

              {/* 9. TYPOGRAPHY */}
              {(selectedObjectProps.type === 'i-text' || selectedObjectProps.type === 'text') && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>TYPOGRAPHIE & TEXTE</div>
                  
                  <textarea 
                    value={selectedObjectProps.text || ''} 
                    onChange={(e) => handleUpdateProp('text', e.target.value)} 
                    rows={2}
                    style={{ background: '#1E1F22', border: '1px solid var(--panel-border)', color: '#fff', padding: '8px', borderRadius: '6px', fontSize: '13px', resize: 'vertical' }} 
                  />

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', color: '#94A3B8' }}>Police de Caractères</span>
                      <button
                        onClick={() => fontFileInputRef.current?.click()}
                        style={{
                          background: 'rgba(88,101,242,0.15)',
                          border: '1px solid rgba(88,101,242,0.3)',
                          color: '#5865F2',
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '10px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                        title="Importer un fichier de police (.ttf, .otf, .woff)"
                      >
                        <Upload size={11} /> Importer Police
                      </button>
                      <input
                        ref={fontFileInputRef}
                        type="file"
                        accept=".ttf,.otf,.woff,.woff2"
                        style={{ display: 'none' }}
                        onChange={handleFontFileUpload}
                      />
                    </div>
                    <select
                      value={selectedObjectProps.fontFamily || 'Inter'}
                      onChange={(e) => handleUpdateProp('fontFamily', e.target.value)}
                      style={{ background: '#1E1F22', border: '1px solid var(--panel-border)', color: '#fff', padding: '8px', borderRadius: '6px', fontSize: '12px' }}
                    >
                      {fontList.map(f => (
                        <option key={f.family} value={f.family}>{f.name}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <PropInput label="Taille" value={selectedObjectProps.fontSize || 32} onChange={(v) => handleUpdateProp('fontSize', v)} />
                    <select
                      value={selectedObjectProps.fontWeight || 'normal'}
                      onChange={(e) => handleUpdateProp('fontWeight', e.target.value)}
                      style={{ background: '#1E1F22', border: '1px solid var(--panel-border)', color: '#fff', padding: '6px', borderRadius: '4px', fontSize: '12px' }}
                    >
                      <option value="300">Light (300)</option>
                      <option value="normal">Normal (400)</option>
                      <option value="600">SemiBold (600)</option>
                      <option value="bold">Bold (700)</option>
                      <option value="900">Black (900)</option>
                    </select>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* 4. FLOATING COLOR PICKER MODAL */}
      {showColorPicker.show && (
        <div style={{ position: 'fixed', right: '355px', top: '100px', zIndex: 1000 }}>
          <div style={{ position: 'fixed', inset: 0 }} onClick={() => setShowColorPicker({ show: false, key: '' })} />
          <div style={{ position: 'relative' }}>
             <CustomColorPicker 
               color={
                 showColorPicker.key.startsWith('bg-') 
                   ? (showColorPicker.key === 'bg-color' ? bgConfig.color : (showColorPicker.key === 'bg-grad-start' ? bgConfig.gradientStart : bgConfig.gradientEnd))
                   : (selectedObjectProps[showColorPicker.key] || '#5865F2')
               } 
               onChange={(color) => {
                 if (showColorPicker.key === 'bg-color') {
                   setBgConfig({ color });
                 } else if (showColorPicker.key === 'bg-grad-start') {
                   setBgConfig({ gradientStart: color });
                 } else if (showColorPicker.key === 'bg-grad-end') {
                   setBgConfig({ gradientEnd: color });
                 } else {
                   handleUpdateProp(showColorPicker.key, color);
                 }
               }}
               recentColors={recentColors}
               addRecentColor={addRecentColor}
             />
          </div>
        </div>
      )}
    </div>
  );
};

const ToolButton = ({ icon, active, onClick, title }: { icon: React.ReactNode, active: boolean, onClick: () => void, title: string }) => (
  <button 
    onClick={onClick} 
    title={title} 
    style={{ 
      width: '44px', 
      height: '44px', 
      borderRadius: '10px', 
      background: active ? '#5865F2' : 'transparent', 
      color: active ? '#ffffff' : '#94A3B8', 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      border: 'none', 
      cursor: 'pointer', 
      transition: 'all 0.15s ease',
      boxShadow: active ? '0 4px 12px rgba(88,101,242,0.4)' : 'none'
    }}
  >
    {icon}
  </button>
);

const SubmenuItem = ({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) => (
  <button
    onClick={onClick}
    style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '7px 10px',
      borderRadius: '6px',
      background: active ? 'rgba(88,101,242,0.3)' : 'transparent',
      color: active ? '#5865F2' : '#F2F3F5',
      fontSize: '12px',
      fontWeight: 500,
      width: '100%',
      textAlign: 'left',
      cursor: 'pointer'
    }}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const PropInput = ({ label, value, onChange }: { label: string, value: string | number, onChange?: (val: string) => void }) => (
  <div style={{ display: 'flex', flexDirection: 'column', background: '#1E1F22', borderRadius: '6px', border: '1px solid var(--panel-border)', overflow: 'hidden' }}>
    <div style={{ padding: '4px 8px', color: 'var(--text-secondary)', fontSize: '10px', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>{label}</div>
    <input 
      type="text" 
      value={value !== undefined ? value : ''} 
      onChange={(e) => onChange?.(e.target.value)} 
      style={{ width: '100%', background: 'transparent', border: 'none', color: '#fff', padding: '6px 8px', fontSize: '12px', fontWeight: 500 }} 
    />
  </div>
);
