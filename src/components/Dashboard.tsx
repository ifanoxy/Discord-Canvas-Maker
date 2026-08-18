import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { exportProjectToZip } from '../utils/exportZip';
import { localApi } from '../api/localStorageApi';
import type { Project } from '../types';
import { 
  Sparkles, Plus, Copy, Trash2, Edit3, Check, FileArchive, 
  ArrowRight, Search, Clock, ArrowLeft,
  Users, Images, DownloadCloud, UploadCloud, ShieldCheck
} from 'lucide-react';

const COVER_PRESETS = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=600&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&auto=format&fit=crop&q=80'
];

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { 
    projects, loadProjectsFromApi, addProject, 
    updateProject, deleteProject, duplicateProject, 
    exportLanguage, addToast 
  } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCover, setNewCover] = useState(COVER_PRESETS[0]);

  useEffect(() => {
    loadProjectsFromApi();
  }, []);

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleStartRename = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(project.id);
    setEditingTitle(project.title);
  };

  const handleSaveRename = async (id: string) => {
    if (editingTitle.trim()) {
      await updateProject(id, { title: editingTitle.trim() });
      addToast({ type: 'success', title: 'Titre mis à jour', message: 'Le nom du projet a été modifié.' });
    }
    setEditingId(null);
  };

  const handleCreateProject = async () => {
    const title = newTitle.trim() || `Nouveau Projet #${projects.length + 1}`;
    const newId = await addProject(title, newCover, newDescription);
    setShowNewModal(false);
    addToast({ type: 'success', title: 'Projet créé', message: `"${title}" est prêt.` });
    navigate(`/project/${newId}`);
  };

  // Export all projects to JSON backup file
  const handleExportBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(projects, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `discord-canvas-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addToast({
      type: 'success',
      title: 'Sauvegarde téléchargée',
      message: 'Fichier .json de vos projets généré avec succès.'
    });
  };

  // Import projects from JSON backup file
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = async (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (Array.isArray(parsed)) {
            for (const proj of parsed) {
              if (proj.id && proj.title && Array.isArray(proj.images)) {
                await localApi.saveProject(proj);
              }
            }
            await loadProjectsFromApi();
            addToast({
              type: 'success',
              title: 'Projets restaurés',
              message: `${parsed.length} projet(s) importé(s) sur votre PC.`
            });
          }
        } catch {
          addToast({
            type: 'error',
            title: 'Fichier invalide',
            message: 'Le fichier JSON de sauvegarde est corrompu.'
          });
        }
      };
    }
  };

  return (
    <div style={{ minHeight: '100vh', width: '100vw', background: '#07080B', color: '#F2F3F5', display: 'flex', flexDirection: 'column' }}>
      
      {/* Hidden file input for restore */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleImportBackup} 
        accept=".json" 
        style={{ display: 'none' }} 
      />

      {/* 1. TOP HEADER NAVIGATION */}
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
            onClick={() => navigate('/')}
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
            <ArrowLeft size={15} /> Accueil
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#5865F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Sparkles size={18} color="#FFFFFF" />
            </div>
            <h1 style={{ fontSize: '17px', fontWeight: 800, margin: 0, color: '#FFFFFF' }}>Mes Projets Discord (Stockage Local)</h1>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          
          {/* Backup & Restore Buttons */}
          <button
            onClick={handleExportBackup}
            title="Exporter tous vos projets dans un fichier .json sécurisé"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#94A3B8',
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 600
            }}
          >
            <DownloadCloud size={14} /> Sauvegarder .JSON
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            title="Restaurer des projets depuis une sauvegarde .json"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: '#94A3B8',
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 600
            }}
          >
            <UploadCloud size={14} /> Importer .JSON
          </button>

          <button
            onClick={() => navigate('/workshop')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(235,69,158,0.12)',
              border: '1px solid rgba(235,69,158,0.3)',
              color: '#EB459E',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 600
            }}
          >
            <Users size={15} /> Workshop GitHub
          </button>

          <button 
            onClick={() => {
              const allImages = projects.flatMap(p => p.images.map(img => ({
                id: img.id,
                name: `${p.title} - ${img.name}`,
                canvasState: img.canvasState,
                canvasWidth: img.width,
                canvasHeight: img.height,
                bgConfig: img.bgConfig
              })));
              exportProjectToZip(allImages, exportLanguage);
            }} 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              background: 'rgba(255,255,255,0.05)', 
              border: '1px solid rgba(255,255,255,0.1)', 
              color: '#FFFFFF', 
              padding: '8px 14px', 
              borderRadius: '8px', 
              fontSize: '13px', 
              fontWeight: 500 
            }}
          >
            <FileArchive size={15} /> ZIP
          </button>

          <button 
            onClick={() => setShowNewModal(true)} 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '8px', 
              background: '#5865F2', 
              color: '#FFFFFF', 
              padding: '9px 16px', 
              borderRadius: '8px', 
              fontWeight: 600,
              fontSize: '13px',
              boxShadow: '0 4px 14px rgba(88,101,242,0.4)' 
            }}
          >
            <Plus size={16} /> Nouveau Projet
          </button>
        </div>
      </header>

      {/* 2. MAIN WORKSPACE */}
      <main style={{ maxWidth: '1240px', margin: '0 auto', padding: '48px 32px 80px', width: '100%', flex: 1 }}>
        
        {/* Header Title & Search */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: 800, margin: 0, color: '#FFFFFF', letterSpacing: '-0.5px' }}>
              Vos Espaces de Création
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
              <ShieldCheck size={14} color="#57F287" />
              <p style={{ margin: 0, fontSize: '13px', color: '#94A3B8' }}>
                {projects.length} projet{projects.length > 1 ? 's' : ''} sauvegardé{projects.length > 1 ? 's' : ''} localement sur votre navigateur.
              </p>
            </div>
          </div>

          <div style={{ position: 'relative', width: '300px' }}>
            <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
            <input
              type="text"
              placeholder="Filtrer vos projets..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                background: '#111318',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '10px',
                padding: '9px 12px 9px 40px',
                color: '#FFFFFF',
                fontSize: '13px',
              }}
            />
          </div>
        </div>

        {/* PROJECTS GRID */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '24px' }}>
          {filteredProjects.map(project => (
            <div
              key={project.id}
              onClick={() => navigate(`/project/${project.id}`)}
              className="air-card"
              style={{
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.08)',
                background: '#101216',
                cursor: 'pointer',
                position: 'relative'
              }}
            >
              {/* Cover Image */}
              <div style={{ width: '100%', height: '170px', borderRadius: '10px', overflow: 'hidden', position: 'relative', marginBottom: '16px', background: '#1A1C23' }}>
                <img
                  src={project.coverImage || COVER_PRESETS[0]}
                  alt={project.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                
                {/* Image Count Badge */}
                <div style={{ position: 'absolute', bottom: '10px', left: '10px', background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)', padding: '4px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Images size={12} /> {project.images.length} image{project.images.length > 1 ? 's' : ''}
                </div>

                {/* Quick actions top-right */}
                <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '6px' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicateProject(project.id);
                      addToast({ type: 'info', title: 'Dupliqué', message: `Copie de "${project.title}" créée.` });
                    }}
                    title="Dupliquer le projet"
                    style={{ background: 'rgba(0,0,0,0.6)', color: '#fff', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                  >
                    <Copy size={13} />
                  </button>
                  {projects.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteProject(project.id);
                        addToast({ type: 'info', title: 'Supprimé', message: `"${project.title}" a été retiré.` });
                      }}
                      title="Supprimer le projet"
                      style={{ background: 'rgba(237,66,69,0.8)', color: '#fff', border: 'none', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>

              {/* Title & Inline Edit */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                {editingId === project.id ? (
                  <div style={{ display: 'flex', gap: '6px', width: '100%' }} onClick={e => e.stopPropagation()}>
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={e => setEditingTitle(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSaveRename(project.id)}
                      autoFocus
                      style={{ flex: 1, background: '#18191C', border: '1px solid #5865F2', color: '#fff', padding: '4px 8px', borderRadius: '6px', fontSize: '15px', fontWeight: 700 }}
                    />
                    <button onClick={() => handleSaveRename(project.id)} style={{ background: '#5865F2', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '6px' }}>
                      <Check size={14} />
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                    <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {project.title}
                    </h3>
                    <button
                      onClick={(e) => handleStartRename(project, e)}
                      title="Renommer le projet"
                      style={{ background: 'transparent', color: '#64748B', border: 'none', padding: '2px', cursor: 'pointer' }}
                    >
                      <Edit3 size={13} />
                    </button>
                  </div>
                )}
              </div>

              <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#94A3B8', lineHeight: '1.5', flex: 1 }}>
                {project.description || 'Aucune description.'}
              </p>

              {/* Tags & Sub-Images Preview Tabs */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '16px' }}>
                {project.images.slice(0, 3).map(img => (
                  <span key={img.id} style={{ background: 'rgba(88,101,242,0.15)', color: '#5865F2', fontSize: '11px', fontWeight: 600, padding: '3px 8px', borderRadius: '4px' }}>
                    🖼️ {img.name}
                  </span>
                ))}
                {project.images.length > 3 && (
                  <span style={{ background: 'rgba(255,255,255,0.05)', color: '#94A3B8', fontSize: '11px', padding: '3px 8px', borderRadius: '4px' }}>
                    +{project.images.length - 3} autres
                  </span>
                )}
              </div>

              {/* Bottom Card Footer */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '14px', marginTop: 'auto' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: '#64748B' }}>
                  <Clock size={13} />
                  <span>Modifié {new Date(project.updatedAt).toLocaleDateString('fr-FR')}</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#5865F2', fontSize: '13px', fontWeight: 600 }}>
                  <span>Ouvrir dans le Studio</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* 3. MODAL: CREATE PROJECT */}
      {showNewModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '24px' }}>
          <div style={{ width: '540px', background: '#18191C', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px', boxShadow: '0 24px 60px rgba(0,0,0,0.9)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#fff' }}>Créer un Nouveau Projet</h3>
              <button onClick={() => setShowNewModal(false)} style={{ background: 'transparent', color: '#94A3B8', border: 'none', fontSize: '13px', cursor: 'pointer' }}>Fermer</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8' }}>Titre du projet</label>
              <input
                type="text"
                placeholder="Ex: Cartes XP Serveur RPG"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                style={{ background: '#111214', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px 12px', borderRadius: '8px', fontSize: '13px' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8' }}>Description</label>
              <textarea
                placeholder="Courte description de ce pack de cartes..."
                value={newDescription}
                onChange={e => setNewDescription(e.target.value)}
                rows={3}
                style={{ background: '#111214', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', padding: '10px 12px', borderRadius: '8px', fontSize: '13px', resize: 'vertical' }}
              />
            </div>

            {/* Cover selector */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8' }}>Image de couverture</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                {COVER_PRESETS.map((cov, idx) => (
                  <div
                    key={idx}
                    onClick={() => setNewCover(cov)}
                    style={{
                      height: '65px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border: newCover === cov ? '2px solid #5865F2' : '2px solid transparent',
                      position: 'relative'
                    }}
                  >
                    <img src={cov} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
              <button
                onClick={() => setShowNewModal(false)}
                style={{ background: 'transparent', color: '#94A3B8', border: 'none', padding: '10px 16px', borderRadius: '8px', fontSize: '13px' }}
              >
                Annuler
              </button>
              <button
                onClick={handleCreateProject}
                style={{ background: '#5865F2', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}
              >
                Créer & Ouvrir le Studio
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
