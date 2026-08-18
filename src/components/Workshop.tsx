import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { localApi } from '../api/localStorageApi';
import type { WorkshopItem } from '../types';
import { 
  Sparkles, Heart, Bookmark, Download, Search, 
  ArrowLeft, ArrowRight, Flame, GitPullRequest, 
  RefreshCw, Copy, Check, ExternalLink, GitBranch
} from 'lucide-react';

export const Workshop: React.FC = () => {
  const navigate = useNavigate();
  const { projects, addToast, loadProjectsFromApi } = useStore();
  
  const [items, setItems] = useState<WorkshopItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'popular' | 'recent' | 'downloads'>('popular');
  const [cloningId, setCloningId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // GitHub PR Submission Modal State
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || '');
  const [authorName, setAuthorName] = useState('MonPseudoDiscord');
  const [selectedCategory, setSelectedCategory] = useState('rank');
  const [copiedPrJson, setCopiedPrJson] = useState(false);

  const currentRepo = localApi.getGitHubRepo();

  const loadWorkshopCatalog = async () => {
    setIsRefreshing(true);
    try {
      const data = await localApi.getWorkshopItems();
      setItems(data);
    } catch {
      addToast({ type: 'error', title: 'Erreur', message: 'Impossible de synchroniser avec GitHub.' });
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadWorkshopCatalog();
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(projects[0].id);
    }
  }, [projects]);

  const handleToggleLike = async (item: WorkshopItem, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await localApi.toggleLike(item.id);
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, likes: i.likes + (res.isLiked ? 1 : -1), isLiked: res.isLiked } : i));
      addToast({
        type: 'info',
        title: res.isLiked ? 'Aimé !' : 'Like retiré',
        message: res.isLiked ? `Vous aimez "${item.title}".` : `Like retiré de "${item.title}".`
      });
    } catch {
      addToast({ type: 'error', title: 'Erreur', message: 'Action impossible.' });
    }
  };

  const handleToggleFavorite = async (item: WorkshopItem, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const isFav = await localApi.toggleFavorite(item.id);
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, isFavorited: isFav } : i));
      addToast({
        type: 'success',
        title: isFav ? 'Ajouté aux favoris' : 'Retiré des favoris',
        message: isFav ? `"${item.title}" a été ajouté à votre collection sur ce PC.` : `"${item.title}" a été retiré.`
      });
    } catch {
      addToast({ type: 'error', title: 'Erreur', message: 'Action impossible.' });
    }
  };

  const handleCloneProject = async (item: WorkshopItem) => {
    setCloningId(item.id);
    try {
      const newProj = await localApi.cloneWorkshopItem(item);
      await loadProjectsFromApi();
      addToast({
        type: 'success',
        title: 'Modèle copié sur votre PC !',
        message: `"${item.title}" a été ajouté à vos projets personnels locaux.`
      });
      navigate(`/project/${newProj.id}`);
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Erreur de clonage',
        message: err.message || 'Impossible de cloner le modèle.'
      });
    } finally {
      setCloningId(null);
    }
  };

  const categories = [
    { id: 'all', label: 'Toutes les catégories' },
    { id: 'rank', label: 'Rank & XP' },
    { id: 'welcome', label: 'Bannières Welcome' },
    { id: 'profile', label: 'Profils & Nitro' },
    { id: 'stats', label: 'Statistiques & Jauges' },
    { id: 'gaming', label: 'Gaming / RPG' },
    { id: 'anime', label: 'Anime & Pastel' }
  ];

  const filteredItems = items
    .filter(i => activeCategory === 'all' || i.category === activeCategory)
    .filter(i => i.title.toLowerCase().includes(searchQuery.toLowerCase()) || i.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())))
    .sort((a, b) => {
      if (sortBy === 'popular') return (b.likes || 0) - (a.likes || 0);
      if (sortBy === 'downloads') return (b.downloads || 0) - (a.downloads || 0);
      return 0;
    });

  // Selected project for PR export
  const currentSelectedProj = projects.find(p => p.id === selectedProjectId) || projects[0];
  const generatedPrJson = currentSelectedProj 
    ? JSON.stringify(localApi.formatProjectForGitHubPR(currentSelectedProj, authorName, selectedCategory), null, 2)
    : '';

  return (
    <div style={{ minHeight: '100vh', width: '100vw', background: '#07080B', color: '#F2F3F5', display: 'flex', flexDirection: 'column' }}>
      
      {/* 1. TOP NAVBAR */}
      <header style={{ 
        height: '72px', 
        borderBottom: '1px solid rgba(255,255,255,0.06)', 
        background: 'rgba(7, 8, 11, 0.8)', 
        backdropFilter: 'blur(20px)',
        position: 'sticky',
        top: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 40px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#94A3B8',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 500,
            }}
          >
            <ArrowLeft size={15} /> Mes Projets (Local PC)
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#EB459E', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={18} color="#FFFFFF" />
            </div>
            <h1 style={{ fontSize: '17px', fontWeight: 800, margin: 0, color: '#FFFFFF' }}>Workshop Communautaire GitHub</h1>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          
          {/* Refresh button */}
          <button
            onClick={loadWorkshopCatalog}
            disabled={isRefreshing}
            title="Recharger le catalogue depuis le dépôt GitHub"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#94A3B8',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 500,
            }}
          >
            <RefreshCw size={14} className={isRefreshing ? 'spin-anim' : ''} /> {isRefreshing ? 'Sync...' : 'Actualiser GitHub'}
          </button>

          {/* Share via GitHub PR button */}
          <button
            onClick={() => setShowSubmitModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#238636',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#FFFFFF',
              padding: '9px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600,
              boxShadow: '0 4px 12px rgba(35,134,54,0.35)'
            }}
          >
            <GitPullRequest size={15} /> Proposer un Modèle (PR GitHub)
          </button>

          <button 
            onClick={() => navigate('/dashboard')} 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              background: '#5865F2', 
              color: '#FFFFFF', 
              padding: '9px 18px', 
              borderRadius: '8px', 
              fontWeight: 600,
              fontSize: '13px',
              boxShadow: '0 4px 14px rgba(88,101,242,0.4)' 
            }}
          >
            Studio Canvas <ArrowRight size={16} />
          </button>
        </div>
      </header>

      {/* 2. HERO WORKSHOP BANNER */}
      <section style={{ maxWidth: '1240px', margin: '0 auto', padding: '48px 32px 24px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(235,69,158,0.12)', color: '#EB459E', padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 700, marginBottom: '12px' }}>
            <Flame size={14} /> 100% LOCAL & GITHUB OPEN-SOURCE
          </div>
          <h2 style={{ fontSize: '36px', fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.5px', margin: 0 }}>
            Marketplace & Templates Communautaires
          </h2>
          <p style={{ fontSize: '15px', color: '#94A3B8', maxWidth: '680px', margin: '8px auto 0', lineHeight: '1.6' }}>
            Vos projets restent <strong>100% stockés sur votre PC</strong>. Le catalogue communautaire est hébergé en Open-Source sur GitHub : chacun peut cloner des designs ou proposer ses propres créations via une simple <strong>Pull Request</strong> !
          </p>

          {/* GitHub Repository Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#111318', border: '1px solid rgba(255,255,255,0.08)', padding: '6px 16px', borderRadius: '20px', fontSize: '12px', color: '#64748B', marginTop: '16px' }}>
            <GitBranch size={14} color="#94A3B8" /> Dépôt GitHub source : <strong style={{ color: '#5865F2' }}>{currentRepo}</strong>
          </div>
        </div>

        {/* Search & Filters Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
          
          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
            {categories.map(c => (
              <button
                key={c.id}
                onClick={() => setActiveCategory(c.id)}
                style={{
                  padding: '7px 14px',
                  borderRadius: '8px',
                  fontSize: '13px',
                  fontWeight: 600,
                  background: activeCategory === c.id ? '#5865F2' : 'rgba(255,255,255,0.04)',
                  color: activeCategory === c.id ? '#FFFFFF' : '#94A3B8',
                  border: activeCategory === c.id ? '1px solid #5865F2' : '1px solid rgba(255,255,255,0.06)',
                  whiteSpace: 'nowrap'
                }}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Search Box & Sort */}
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ position: 'relative', width: '240px' }}>
              <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
              <input
                type="text"
                placeholder="Rechercher un modèle..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  background: '#111318',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '8px',
                  padding: '7px 10px 7px 34px',
                  color: '#FFFFFF',
                  fontSize: '13px',
                }}
              />
            </div>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              style={{
                background: '#111318',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px',
                padding: '7px 10px',
                color: '#FFFFFF',
                fontSize: '13px',
              }}
            >
              <option value="popular">🔥 Les plus aimés</option>
              <option value="downloads">⚡ Téléchargements</option>
            </select>
          </div>

        </div>
      </section>

      {/* 3. WORKSHOP ITEMS GRID */}
      <main style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 32px 80px', width: '100%', flex: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '24px' }}>
          {filteredItems.map(item => {
            const imageCount = item.projectData?.images?.length || 1;
            const authorDisplayName = typeof item.author === 'object' ? item.author.name : item.author;

            return (
              <div
                key={item.id}
                className="air-card"
                style={{
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: '16px',
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: '#101216',
                  position: 'relative'
                }}
              >
                {/* Card Cover Image Preview */}
                <div style={{ width: '100%', height: '170px', borderRadius: '10px', overflow: 'hidden', position: 'relative', marginBottom: '16px', background: '#1A1C23' }}>
                  <img
                    src={item.coverImage}
                    alt={item.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                  
                  {/* Image Count Pill */}
                  <div style={{ position: 'absolute', bottom: '10px', left: '10px', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, color: '#fff' }}>
                    {imageCount} image{imageCount > 1 ? 's' : ''}
                  </div>

                  {/* Like & Favorite Actions */}
                  <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '6px' }}>
                    <button
                      onClick={(e) => handleToggleLike(item, e)}
                      style={{
                        background: item.isLiked ? '#ED4245' : 'rgba(0,0,0,0.6)',
                        color: '#FFFFFF',
                        border: 'none',
                        padding: '6px 10px',
                        borderRadius: '8px',
                        fontSize: '11px',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      <Heart size={13} fill={item.isLiked ? '#FFFFFF' : 'none'} /> {item.likes || 0}
                    </button>

                    <button
                      onClick={(e) => handleToggleFavorite(item, e)}
                      style={{
                        background: item.isFavorited ? '#FEE75C' : 'rgba(0,0,0,0.6)',
                        color: item.isFavorited ? '#000000' : '#FFFFFF',
                        border: 'none',
                        padding: '6px',
                        borderRadius: '8px',
                        cursor: 'pointer'
                      }}
                    >
                      <Bookmark size={13} fill={item.isFavorited ? '#000000' : 'none'} />
                    </button>
                  </div>
                </div>

                {/* Title & Author */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#FFFFFF' }}>{item.title}</h3>
                </div>
                <div style={{ fontSize: '12px', color: '#5865F2', fontWeight: 600, marginBottom: '10px' }}>
                  Par @{authorDisplayName}
                </div>

                <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#94A3B8', lineHeight: '1.5', flex: 1 }}>
                  {item.description}
                </p>

                {/* Tags */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                  {item.tags?.map(t => (
                    <span key={t} style={{ background: 'rgba(255,255,255,0.05)', color: '#94A3B8', fontSize: '11px', padding: '3px 8px', borderRadius: '4px' }}>
                      #{t}
                    </span>
                  ))}
                </div>

                {/* 1-Click Clone to Local PC */}
                <button
                  onClick={() => handleCloneProject(item)}
                  disabled={cloningId === item.id}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    background: '#5865F2',
                    color: '#FFFFFF',
                    fontSize: '13px',
                    fontWeight: 600,
                    border: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(88,101,242,0.3)'
                  }}
                >
                  <Download size={15} /> {cloningId === item.id ? 'Copie en cours...' : 'Copier sur mon PC & Éditer'}
                </button>
              </div>
            );
          })}
        </div>
      </main>

      {/* 4. MODAL: GITHUB PULL REQUEST SUBMISSION */}
      {showSubmitModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '24px' }}>
          <div style={{ width: '840px', maxHeight: '90vh', background: '#18191C', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 60px rgba(0,0,0,0.9)', overflow: 'hidden' }}>
            
            {/* Header */}
            <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <GitPullRequest size={20} color="#238636" />
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#FFFFFF' }}>
                  Partager votre création sur le Workshop GitHub
                </h3>
              </div>
              <button 
                onClick={() => setShowSubmitModal(false)}
                style={{ background: 'transparent', color: '#94A3B8', border: 'none', fontSize: '13px', cursor: 'pointer' }}
              >
                Fermer
              </button>
            </div>

            {/* Content */}
            <div style={{ padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Step instructions */}
              <div style={{ background: '#111318', padding: '16px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: '#5865F2', marginBottom: '8px' }}>
                  🚀 Comment partager votre création avec la communauté ?
                </div>
                <ol style={{ margin: 0, paddingLeft: '20px', fontSize: '13px', color: '#94A3B8', lineHeight: '1.6' }}>
                  <li>Sélectionnez le projet local à partager ci-dessous.</li>
                  <li>Cliquez sur <strong>"Copier le JSON du Modèle"</strong>.</li>
                  <li>Ouvrez le fichier <code style={{ color: '#57F287' }}>public/workshop/community-manifest.json</code> sur GitHub et collez votre bloc.</li>
                  <li>Soumettez une <strong>Pull Request</strong> : dès qu'elle est fusionnée, tous les utilisateurs verront votre modèle !</li>
                </ol>
              </div>

              {/* Form selection */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8' }}>Projet local à exporter</label>
                  <select
                    value={selectedProjectId}
                    onChange={e => setSelectedProjectId(e.target.value)}
                    style={{ background: '#111214', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', padding: '10px', borderRadius: '8px', fontSize: '13px' }}
                  >
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.title} ({p.images.length} image{p.images.length > 1 ? 's' : ''})</option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8' }}>Pseudo Auteur Discord</label>
                  <input
                    type="text"
                    value={authorName}
                    onChange={e => setAuthorName(e.target.value)}
                    style={{ background: '#111214', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', padding: '10px', borderRadius: '8px', fontSize: '13px' }}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8' }}>Catégorie</label>
                  <select
                    value={selectedCategory}
                    onChange={e => setSelectedCategory(e.target.value)}
                    style={{ background: '#111214', border: '1px solid rgba(255,255,255,0.1)', color: '#FFFFFF', padding: '10px', borderRadius: '8px', fontSize: '13px' }}
                  >
                    <option value="rank">Rank & XP</option>
                    <option value="welcome">Bannières Welcome</option>
                    <option value="profile">Profils & Nitro</option>
                    <option value="stats">Statistiques & Jauges</option>
                    <option value="gaming">Gaming / RPG</option>
                    <option value="anime">Anime & Pastel</option>
                  </select>
                </div>
              </div>

              {/* JSON Preview */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8' }}>JSON Généré pour la Pull Request :</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generatedPrJson);
                      setCopiedPrJson(true);
                      setTimeout(() => setCopiedPrJson(false), 2000);
                      addToast({ type: 'success', title: 'Copié !', message: 'JSON du modèle copié dans le presse-papier.' });
                    }}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', background: copiedPrJson ? '#57F287' : 'rgba(255,255,255,0.08)', color: copiedPrJson ? '#000' : '#fff', padding: '5px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, border: 'none', cursor: 'pointer' }}
                  >
                    {copiedPrJson ? <Check size={14} /> : <Copy size={14} />}
                    {copiedPrJson ? 'Copié !' : 'Copier le JSON'}
                  </button>
                </div>

                <pre style={{ background: '#0D0E11', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '8px', padding: '16px', color: '#a5b4fc', fontSize: '12px', maxHeight: '200px', overflowY: 'auto', margin: 0, fontFamily: 'monospace' }}>
                  <code>{generatedPrJson}</code>
                </pre>
              </div>
            </div>

            {/* Footer Actions */}
            <div style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#111318' }}>
              <span style={{ fontSize: '12px', color: '#64748B' }}>
                GitHub : <strong>https://github.com/{currentRepo}</strong>
              </span>

              <div style={{ display: 'flex', gap: '10px' }}>
                <a
                  href={`https://github.com/${currentRepo}/pulls`}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#238636',
                    color: '#FFFFFF',
                    padding: '8px 16px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    textDecoration: 'none'
                  }}
                >
                  <ExternalLink size={14} /> Ouvrir GitHub (Créer la PR)
                </a>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
