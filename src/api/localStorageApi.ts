import type { Project, WorkshopItem, CanvasImage, UserSession } from '../types';
import type { BackgroundConfig } from '../utils/presets';

const STORAGE_KEYS = {
  PROJECTS: 'discord_canvas_projects_v7',
  WORKSHOP: 'discord_canvas_workshop_v7',
  LIKES: 'discord_canvas_likes',
  FAVORITES: 'discord_canvas_favorites',
  CUSTOM_REPO: 'discord_canvas_github_repo'
};

export const DEFAULT_GITHUB_REPO = 'ifanoxy/Discord-Canvas-Maker';
export const GITHUB_RAW_MANIFEST_URL = (repo: string) => 
  `https://raw.githubusercontent.com/${repo}/main/public/workshop/community-manifest.json`;

const INITIAL_LOCAL_PROJECTS: Project[] = [
  {
    id: 'proj-starter-rank',
    title: 'Mon Premier Projet Discord',
    description: 'Modèle de carte de niveau et profil Discord personnalisable prêt à l\'export.',
    coverImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
    tags: ['Discord', 'Rank', 'Starter'],
    isPublic: true,
    author: {
      id: 'usr-local',
      name: 'Utilisateur',
      avatar: 'https://cdn.discordapp.com/embed/avatars/0.png'
    },
    likes: 1,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    images: [
      {
        id: 'img-starter-1',
        name: 'Carte de Niveau Discord',
        width: 800,
        height: 450,
        bgConfig: { type: 'preset', presetId: 'frosted-glass' },
        canvasState: '{"version":"5.3.0","objects":[{"type":"discord-avatar","left":60,"top":125,"avatarRadius":70,"status":"online","displayMode":"both","borderColor":"#5865F2","borderWidth":4,"avatarUrl":"https://cdn.discordapp.com/embed/avatars/0.png","paramKey":"avatarUrl","paramKeyStatus":"status"},{"type":"i-text","left":230,"top":140,"text":"Pseudo#0001","fontSize":32,"fontFamily":"Inter","fontWeight":"700","fill":"#FFFFFF","paramKey":"username"},{"type":"discord-role-badge","left":230,"top":190,"roleName":"Membre Discord","roleColor":"#5865F2","fontSize":15,"rx":6,"ry":6,"paramKey":"role"},{"type":"progress-bar","left":230,"top":245,"width":480,"height":28,"rx":14,"ry":14,"barStyle":"horizontal","progressValue":75,"progressMax":100,"barBackground":"#2B2D31","progressColor":"#57F287","gradientFill":true,"gradientStart":"#5865F2","gradientEnd":"#57F287","paramKey":"xpBar"}]}',
        updatedAt: Date.now()
      }
    ]
  }
];

class LocalClientStorageApi {
  private userSession: UserSession = {
    id: 'usr-local',
    name: 'Utilisateur',
    avatar: 'https://cdn.discordapp.com/embed/avatars/0.png',
    role: 'member',
    exportQuota: 100,
    exportsUsed: 0,
    rateLimitReset: Date.now() + 60000
  };

  // Get all Projects stored locally on PC
  async getProjects(): Promise<Project[]> {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      if (raw) {
        return JSON.parse(raw);
      }
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(INITIAL_LOCAL_PROJECTS));
      return INITIAL_LOCAL_PROJECTS;
    } catch {
      return INITIAL_LOCAL_PROJECTS;
    }
  }

  // Save full project list to localStorage
  private saveProjects(projects: Project[]) {
    try {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
    } catch (err) {
      console.error('Erreur sauvegarde localStorage:', err);
    }
  }

  // Create new project
  async createProject(title: string, coverImage?: string, description?: string): Promise<Project> {
    const list = await this.getProjects();
    const newProj: Project = {
      id: `proj-${Date.now()}`,
      title: title || 'Nouveau Projet Sans Titre',
      description: description || 'Projet Discord Canvas',
      coverImage: coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
      tags: ['Discord', 'Canvas'],
      isPublic: true,
      author: {
        id: this.userSession.id,
        name: this.userSession.name,
        avatar: this.userSession.avatar
      },
      likes: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      images: [
        {
          id: `img-${Date.now()}-1`,
          name: 'Image 1',
          width: 800,
          height: 450,
          bgConfig: { type: 'preset', presetId: 'frosted-glass' },
          canvasState: '',
          updatedAt: Date.now()
        }
      ]
    };
    list.unshift(newProj);
    this.saveProjects(list);
    return newProj;
  }

  // Save / Upsert project
  async saveProject(project: Project): Promise<Project> {
    const list = await this.getProjects();
    const idx = list.findIndex(p => p.id === project.id);
    if (idx >= 0) {
      list[idx] = { ...project, updatedAt: Date.now() };
    } else {
      list.unshift(project);
    }
    this.saveProjects(list);
    return project;
  }

  // Update project
  async updateProject(id: string, data: Partial<Project>): Promise<Project> {
    const list = await this.getProjects();
    const idx = list.findIndex(p => p.id === id);
    if (idx === -1) throw new Error('Projet introuvable.');
    list[idx] = { ...list[idx], ...data, updatedAt: Date.now() };
    this.saveProjects(list);
    return list[idx];
  }

  // Delete project
  async deleteProject(id: string): Promise<boolean> {
    let list = await this.getProjects();
    list = list.filter(p => p.id !== id);
    this.saveProjects(list);
    return true;
  }

  // Duplicate project
  async duplicateProject(id: string): Promise<Project> {
    const list = await this.getProjects();
    const orig = list.find(p => p.id === id);
    if (!orig) throw new Error('Projet source introuvable.');

    const copy: Project = {
      ...orig,
      id: `proj-${Date.now()}`,
      title: `${orig.title} (Copie)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      images: orig.images.map(img => ({
        ...img,
        id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        updatedAt: Date.now()
      }))
    };

    list.unshift(copy);
    this.saveProjects(list);
    return copy;
  }

  // Save Canvas Image State
  async saveImageCanvasState(projectId: string, imageId: string, state: string, width?: number, height?: number, bgConfig?: BackgroundConfig) {
    const list = await this.getProjects();
    const proj = list.find(p => p.id === projectId);
    if (!proj) return;

    const img = proj.images.find(i => i.id === imageId);
    if (img) {
      img.canvasState = state;
      if (width) img.width = width;
      if (height) img.height = height;
      if (bgConfig) img.bgConfig = bgConfig;
      img.updatedAt = Date.now();
      proj.updatedAt = Date.now();
      this.saveProjects(list);
    }
  }

  // Add sub-image to project
  async addImage(projectId: string, name?: string, w = 800, h = 450, bgConfig?: BackgroundConfig): Promise<CanvasImage> {
    const list = await this.getProjects();
    const proj = list.find(p => p.id === projectId);
    if (!proj) throw new Error('Projet introuvable');

    const newImg: CanvasImage = {
      id: `img-${Date.now()}`,
      name: name || `Image ${proj.images.length + 1}`,
      width: w,
      height: h,
      bgConfig: bgConfig || { type: 'preset', presetId: 'frosted-glass' },
      canvasState: '',
      updatedAt: Date.now()
    };
    proj.images.push(newImg);
    proj.updatedAt = Date.now();
    this.saveProjects(list);
    return newImg;
  }

  // Delete sub-image
  async deleteImage(projectId: string, imageId: string): Promise<boolean> {
    const list = await this.getProjects();
    const proj = list.find(p => p.id === projectId);
    if (!proj || proj.images.length <= 1) return false;

    proj.images = proj.images.filter(i => i.id !== imageId);
    proj.updatedAt = Date.now();
    this.saveProjects(list);
    return true;
  }

  // ================= COMMUNITY WORKSHOP (GITHUB REPOSITORY INTEGRATION) =================

  getGitHubRepo(): string {
    return localStorage.getItem(STORAGE_KEYS.CUSTOM_REPO) || DEFAULT_GITHUB_REPO;
  }

  setGitHubRepo(repo: string) {
    localStorage.setItem(STORAGE_KEYS.CUSTOM_REPO, repo);
  }

  async getWorkshopItems(): Promise<WorkshopItem[]> {
    const repo = this.getGitHubRepo();
    let rawItems: any[] = [];

    try {
      const res = await fetch(GITHUB_RAW_MANIFEST_URL(repo), { cache: 'no-cache' });
      if (res.ok) {
        rawItems = await res.json();
      } else {
        throw new Error(`GitHub HTTP ${res.status}`);
      }
    } catch {
      try {
        const localRes = await fetch('/workshop/community-manifest.json');
        if (localRes.ok) {
          rawItems = await localRes.json();
        }
      } catch (e) {
        console.warn('Erreur chargement workshop local:', e);
      }
    }

    const likes = this.getLocalLikes();
    const favs = this.getLocalFavorites();

    return rawItems.map(item => {
      const projData: Project = item.projectData || {
        id: item.id,
        title: item.title,
        description: item.description,
        coverImage: item.coverImage,
        tags: item.tags || [],
        isPublic: true,
        author: typeof item.author === 'string' 
          ? { id: 'usr-author', name: item.author, avatar: 'https://cdn.discordapp.com/embed/avatars/0.png' }
          : item.author,
        likes: item.likes || 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        images: item.images || []
      };

      return {
        id: item.id,
        title: item.title,
        description: item.description,
        category: item.category || 'rank',
        coverImage: item.coverImage,
        author: typeof item.author === 'string'
          ? { id: 'usr-author', name: item.author, avatar: 'https://cdn.discordapp.com/embed/avatars/0.png' }
          : item.author,
        likes: item.likes || 0,
        downloads: item.downloads || 0,
        tags: item.tags || [],
        isLiked: !!likes[item.id],
        isFavorited: !!favs[item.id],
        projectData: projData
      };
    });
  }

  private getLocalLikes(): Record<string, boolean> {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.LIKES) || '{}');
    } catch {
      return {};
    }
  }

  private getLocalFavorites(): Record<string, boolean> {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.FAVORITES) || '{}');
    } catch {
      return {};
    }
  }

  async toggleLike(itemId: string): Promise<{ likes: number; isLiked: boolean }> {
    const likes = this.getLocalLikes();
    const isLiked = !likes[itemId];
    likes[itemId] = isLiked;
    localStorage.setItem(STORAGE_KEYS.LIKES, JSON.stringify(likes));
    return { likes: isLiked ? 1 : 0, isLiked };
  }

  async toggleFavorite(itemId: string): Promise<boolean> {
    const favs = this.getLocalFavorites();
    const isFav = !favs[itemId];
    favs[itemId] = isFav;
    localStorage.setItem(STORAGE_KEYS.FAVORITES, JSON.stringify(favs));
    return isFav;
  }

  async cloneWorkshopItem(item: WorkshopItem): Promise<Project> {
    const list = await this.getProjects();
    const newProj: Project = {
      ...item.projectData,
      id: `proj-cloned-${Date.now()}`,
      title: `${item.title} (Modèle Communauté)`,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      images: item.projectData.images.map((img, idx) => ({
        ...img,
        id: `img-cloned-${Date.now()}-${idx}`,
        updatedAt: Date.now()
      }))
    };
    list.unshift(newProj);
    this.saveProjects(list);
    return newProj;
  }

  // Aliases for compatibility
  async toggleLikeWorkshopItem(id: string) { return this.toggleLike(id); }
  async toggleFavoriteWorkshopItem(id: string) { return this.toggleFavorite(id); }
  async cloneWorkshopProject(id: string) {
    const items = await this.getWorkshopItems();
    const item = items.find(i => i.id === id);
    if (!item) throw new Error('Modèle introuvable');
    return this.cloneWorkshopItem(item);
  }

  async exportCardWithRateLimit(): Promise<{ success: boolean; error?: string; remaining: number }> {
    return { success: true, remaining: 100 };
  }

  getUserSession(): UserSession {
    return this.userSession;
  }

  formatProjectForGitHubPR(project: Project, authorName: string, category: string) {
    return {
      id: `tpl-${project.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString().slice(-4)}`,
      title: project.title,
      description: project.description,
      author: authorName || 'Auteur Discord',
      category: category || 'rank',
      tags: project.tags || ['Community'],
      likes: 1,
      downloads: 0,
      coverImage: project.coverImage || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
      images: project.images.map(img => ({
        id: img.id,
        name: img.name,
        width: img.width,
        height: img.height,
        bgConfig: img.bgConfig,
        canvasState: img.canvasState
      }))
    };
  }
}

export const localApi = new LocalClientStorageApi();
export const mockApi = localApi;
