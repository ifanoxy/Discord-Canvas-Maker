import type { BackgroundConfig } from '../utils/presets';

export interface CanvasImage {
  id: string;
  name: string;
  width: number;
  height: number;
  canvasState: string; // JSON Fabric object
  bgConfig: BackgroundConfig;
  updatedAt: number;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  tags: string[];
  isPublic: boolean;
  author: {
    id: string;
    name: string;
    avatar: string;
    badge?: string;
  };
  createdAt: number;
  updatedAt: number;
  images: CanvasImage[];
}

export interface WorkshopItem {
  id: string;
  title: string;
  description: string;
  category: 'rank' | 'welcome' | 'profile' | 'stats' | 'gaming' | 'anime' | 'minimalist';
  coverImage: string;
  author: {
    id: string;
    name: string;
    avatar: string;
    badge?: string;
  };
  isFavorited?: boolean;
  tags: string[];
  projectData: Project;
}

export interface UserSession {
  id: string;
  name: string;
  avatar: string;
  role: 'guest' | 'member' | 'admin';
  exportQuota: number;
  exportsUsed: number;
  rateLimitReset: number;
}

export interface ToastNotification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}
