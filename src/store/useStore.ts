import { create } from 'zustand';
import type { Project, CanvasImage, ToastNotification } from '../types';
import type { BackgroundConfig } from '../utils/presets';
import { mockApi } from '../api/mockApi';

export type EditorTool = 
  | 'select' 
  | 'rect' 
  | 'circle' 
  | 'triangle' 
  | 'star' 
  | 'line' 
  | 'circle-arc' 
  | 'text' 
  | 'image' 
  | 'discord-avatar' 
  | 'discord-avatar-only'
  | 'discord-status'
  | 'discord-banner'
  | 'discord-role' 
  | 'discord-channel'
  | 'progress-horizontal'
  | 'progress-circular'
  | 'progress-radial'
  | 'progress-segmented'
  | 'progress-vertical'
  | 'emoji';

interface AppState {
  // Projects Hierarchy
  projects: Project[];
  activeProjectId: string;
  activeImageId: string;
  loadProjectsFromApi: () => Promise<void>;
  
  // Project Actions
  addProject: (title: string, coverImage?: string, description?: string) => Promise<string>;
  updateProject: (id: string, data: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<boolean>;
  duplicateProject: (id: string) => Promise<Project | null>;
  setActiveProject: (id: string) => void;

  // Image / Canvas Actions within active Project
  addImageToProject: (projectId: string, name?: string, w?: number, h?: number, bgConfig?: BackgroundConfig) => string;
  updateImageCanvasState: (projectId: string, imageId: string, state: string, width?: number, height?: number, bgConfig?: BackgroundConfig) => void;
  deleteImageFromProject: (projectId: string, imageId: string) => void;
  setActiveImage: (imageId: string) => void;

  // Editor State
  activeTool: EditorTool;
  setActiveTool: (tool: EditorTool) => void;
  shapeDrawMode: 'fill' | 'stroke';
  setShapeDrawMode: (mode: 'fill' | 'stroke') => void;
  
  // Selection
  selectedObjectId: string | null;
  setSelectedObjectId: (id: string | null) => void;
  selectedObjectProps: Record<string, any>;
  setSelectedObjectProps: (props: Record<string, any>) => void;

  // Grid & Smart Guides
  showGrid: boolean;
  setShowGrid: (show: boolean) => void;
  gridSize: number;
  setGridSize: (size: number) => void;

  // Clipboard
  clipboardData: any;
  setClipboardData: (data: any) => void;

  // Background
  bgConfig: BackgroundConfig;
  setBgConfig: (config: Partial<BackgroundConfig>) => void;

  // Export Settings
  exportLanguage: 'typescript' | 'javascript';
  setExportLanguage: (lang: 'typescript' | 'javascript') => void;

  // Recent colors
  recentColors: string[];
  addRecentColor: (color: string) => void;

  // Toasts
  toasts: ToastNotification[];
  addToast: (toast: Omit<ToastNotification, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useStore = create<AppState>((set, get) => ({
  projects: [],
  activeProjectId: 'proj-cyber-suite',
  activeImageId: 'img-rank-1',

  loadProjectsFromApi: async () => {
    const list = await mockApi.getProjects();
    set({ projects: list });
    if (list.length > 0) {
      const activeProj = list.find(p => p.id === get().activeProjectId) || list[0];
      const activeImg = activeProj.images.find(img => img.id === get().activeImageId) || activeProj.images[0];
      set({ 
        activeProjectId: activeProj.id, 
        activeImageId: activeImg ? activeImg.id : '',
        bgConfig: activeImg ? activeImg.bgConfig : get().bgConfig
      });
    }
  },

  addProject: async (title, coverImage, description) => {
    const newId = 'proj-' + Date.now();
    const newImageId = 'img-' + Date.now();
    const defaultImage: CanvasImage = {
      id: newImageId,
      name: 'Canvas Principal',
      width: 800,
      height: 450,
      canvasState: '',
      bgConfig: {
        type: 'preset',
        color: '#1E1F22',
        gradientStart: '#5865F2',
        gradientEnd: '#1E1F22',
        gradientAngle: 135,
        gradientType: 'linear',
        imageUrl: '',
        presetId: 'cyber-discord'
      },
      updatedAt: Date.now()
    };

    const newProject: Project = {
      id: newId,
      title: title || `Nouveau Projet #${get().projects.length + 1}`,
      description: description || 'Projet créé avec Discord Canvas Maker',
      coverImage: coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
      tags: ['Discord Bot', 'Custom'],
      isPublic: false,
      author: {
        id: 'usr-1',
        name: 'Wumpus Developer',
        avatar: 'https://cdn.discordapp.com/embed/avatars/0.png'
      },
      likes: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      images: [defaultImage]
    };

    await mockApi.saveProject(newProject);
    set((state) => ({
      projects: [newProject, ...state.projects],
      activeProjectId: newId,
      activeImageId: newImageId,
      bgConfig: defaultImage.bgConfig
    }));

    get().addToast({
      type: 'success',
      title: 'Projet créé',
      message: `Le projet "${newProject.title}" est prêt.`
    });

    return newId;
  },

  updateProject: async (id, data) => {
    const target = get().projects.find(p => p.id === id);
    if (!target) return;
    const updated = { ...target, ...data, updatedAt: Date.now() };
    await mockApi.saveProject(updated);
    set((state) => ({
      projects: state.projects.map(p => p.id === id ? updated : p)
    }));
  },

  deleteProject: async (id) => {
    const success = await mockApi.deleteProject(id);
    if (!success) {
      get().addToast({
        type: 'warning',
        title: 'Action impossible',
        message: 'Vous devez conserver au moins un projet.'
      });
      return false;
    }
    const updatedProjects = get().projects.filter(p => p.id !== id);
    const nextActive = updatedProjects[0];
    set({
      projects: updatedProjects,
      activeProjectId: nextActive ? nextActive.id : '',
      activeImageId: nextActive && nextActive.images[0] ? nextActive.images[0].id : ''
    });
    get().addToast({
      type: 'info',
      title: 'Projet supprimé',
      message: 'Le projet a été retiré de votre espace de travail.'
    });
    return true;
  },

  duplicateProject: async (id) => {
    const cloned = await mockApi.duplicateProject(id);
    if (cloned) {
      set((state) => ({
        projects: [cloned, ...state.projects],
        activeProjectId: cloned.id,
        activeImageId: cloned.images[0] ? cloned.images[0].id : ''
      }));
      get().addToast({
        type: 'success',
        title: 'Projet dupliqué',
        message: `Une copie de "${cloned.title}" a été créée.`
      });
    }
    return cloned;
  },

  setActiveProject: (id) => {
    const target = get().projects.find(p => p.id === id);
    if (!target) return;
    const firstImg = target.images[0];
    set({
      activeProjectId: id,
      activeImageId: firstImg ? firstImg.id : '',
      bgConfig: firstImg ? firstImg.bgConfig : get().bgConfig
    });
  },

  addImageToProject: (projectId, name, w, h, bgConfig) => {
    const newImgId = 'img-' + Date.now();
    const newImg: CanvasImage = {
      id: newImgId,
      name: name || `Image #${get().projects.find(p => p.id === projectId)?.images.length || 1}`,
      width: w || 800,
      height: h || 450,
      canvasState: '',
      bgConfig: bgConfig || get().bgConfig,
      updatedAt: Date.now()
    };

    set((state) => {
      const updatedProjects = state.projects.map(p => {
        if (p.id === projectId) {
          const updated = { ...p, images: [...p.images, newImg], updatedAt: Date.now() };
          mockApi.saveProject(updated);
          return updated;
        }
        return p;
      });
      return {
        projects: updatedProjects,
        activeImageId: newImgId,
        bgConfig: newImg.bgConfig
      };
    });

    get().addToast({
      type: 'success',
      title: 'Image ajoutée',
      message: `L'image "${newImg.name}" a été ajoutée au projet.`
    });

    return newImgId;
  },

  updateImageCanvasState: (projectId, imageId, stateJson, width, height, bgConfig) => {
    set((state) => {
      const updatedProjects = state.projects.map(p => {
        if (p.id === projectId) {
          const updatedImages = p.images.map(img => {
            if (img.id === imageId) {
              return {
                ...img,
                canvasState: stateJson,
                updatedAt: Date.now(),
                ...(width !== undefined ? { width } : {}),
                ...(height !== undefined ? { height } : {}),
                ...(bgConfig !== undefined ? { bgConfig } : {})
              };
            }
            return img;
          });
          const updatedProj = { ...p, images: updatedImages, updatedAt: Date.now() };
          mockApi.saveProject(updatedProj);
          return updatedProj;
        }
        return p;
      });
      return { projects: updatedProjects };
    });
  },

  deleteImageFromProject: (projectId, imageId) => {
    set((state) => {
      const project = state.projects.find(p => p.id === projectId);
      if (!project || project.images.length <= 1) {
        get().addToast({
          type: 'warning',
          title: 'Action impossible',
          message: 'Un projet doit contenir au moins une image.'
        });
        return state;
      }
      const updatedImages = project.images.filter(img => img.id !== imageId);
      const nextActiveImg = updatedImages[0].id;
      const updatedProjects = state.projects.map(p => {
        if (p.id === projectId) {
          const updatedProj = { ...p, images: updatedImages, updatedAt: Date.now() };
          mockApi.saveProject(updatedProj);
          return updatedProj;
        }
        return p;
      });
      return {
        projects: updatedProjects,
        activeImageId: nextActiveImg
      };
    });
  },

  setActiveImage: (imageId) => {
    const proj = get().projects.find(p => p.id === get().activeProjectId);
    const img = proj?.images.find(i => i.id === imageId);
    if (img) {
      set({ activeImageId: imageId, bgConfig: img.bgConfig });
    }
  },

  // Editor Tools
  activeTool: 'select',
  setActiveTool: (tool) => set({ activeTool: tool }),

  shapeDrawMode: 'fill',
  setShapeDrawMode: (mode) => set({ shapeDrawMode: mode }),

  selectedObjectId: null,
  setSelectedObjectId: (id) => set({ selectedObjectId: id }),

  selectedObjectProps: {},
  setSelectedObjectProps: (props) => set({ selectedObjectProps: props }),

  // Grid
  showGrid: false,
  setShowGrid: (show) => set({ showGrid: show }),
  gridSize: 20,
  setGridSize: (size) => set({ gridSize: size }),

  // Clipboard
  clipboardData: null,
  setClipboardData: (data) => set({ clipboardData: data }),

  // Background
  bgConfig: {
    type: 'preset',
    color: '#1E1F22',
    gradientStart: '#5865F2',
    gradientEnd: '#1E1F22',
    gradientAngle: 135,
    gradientType: 'linear',
    imageUrl: '',
    presetId: 'cyber-discord'
  },
  setBgConfig: (config) => set((state) => {
    const newBg = { ...state.bgConfig, ...config };
    return { bgConfig: newBg };
  }),

  exportLanguage: 'typescript',
  setExportLanguage: (lang) => set({ exportLanguage: lang }),

  recentColors: ['#5865F2', '#57F287', '#FEE75C', '#ED4245', '#EB459E', '#FFFFFF'],
  addRecentColor: (color) => set((state) => {
    if (state.recentColors.includes(color)) return state;
    const newColors = [color, ...state.recentColors].slice(0, 12);
    return { recentColors: newColors };
  }),

  // Toasts
  toasts: [],
  addToast: (toast) => {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 4);
    const newToast: ToastNotification = { ...toast, id };
    set((state) => ({ toasts: [...state.toasts, newToast] }));
    setTimeout(() => {
      get().removeToast(id);
    }, toast.duration || 4000);
  },
  removeToast: (id) => set((state) => ({ toasts: state.toasts.filter(t => t.id !== id) }))
}));

// Auto-load initial projects on boot
useStore.getState().loadProjectsFromApi();
