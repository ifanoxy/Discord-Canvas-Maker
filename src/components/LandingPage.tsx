import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { 
  Sparkles, ArrowRight, Zap, Code2, ShieldCheck, 
  Palette, Terminal, Copy, Check, Users
} from 'lucide-react';

const PREVIEW_CODE_SNIPPET = `// Options strictement typées générées par le Studio
export interface CardOptions {
  username?: string;
  avatarUrl?: string;
  status?: 'online' | 'idle' | 'dnd' | 'offline';
  levelProgress?: number | { value: number; max: number };
  vipRole?: { name: string; color: string };
}

export async function generateDiscordCard(options: CardOptions = {}): Promise<Buffer> {
  const canvas = createCanvas(800, 320);
  const ctx = canvas.getContext('2d');
  // ... rendu 2D accéléré ...
  return canvas.toBuffer('image/png');
}`;

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeProjectId } = useStore();
  const [copied, setCopied] = useState(false);

  const handleOpenStudio = () => {
    navigate(activeProjectId ? `/project/${activeProjectId}` : '/dashboard');
  };

  return (
    <div style={{ minHeight: '100vh', width: '100vw', background: '#07080B', color: '#F2F3F5', position: 'relative', overflowX: 'hidden' }}>
      
      {/* Subtle Ambient Glows */}
      <div className="ambient-glow" style={{ top: '-10%', left: '20%', width: '600px', height: '600px', background: '#5865F2' }} />
      <div className="ambient-glow" style={{ top: '30%', right: '10%', width: '500px', height: '500px', background: '#00F0FF', opacity: 0.15 }} />
      <div className="ambient-glow" style={{ bottom: '10%', left: '15%', width: '550px', height: '550px', background: '#EB459E', opacity: 0.12 }} />

      {/* 1. NAVBAR */}
      <header style={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 100, 
        backdropFilter: 'blur(20px)', 
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(7, 8, 11, 0.75)'
      }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 32px', height: '72px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          
          {/* Logo & Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }} onClick={() => navigate('/')}>
            <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#5865F2', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(88,101,242,0.5)' }}>
              <Sparkles size={20} color="#FFFFFF" />
            </div>
            <span style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '-0.5px', color: '#FFFFFF' }}>Discord Canvas Maker</span>
          </div>

          {/* Nav Links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
            <a href="#features" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '14px', fontWeight: 500, transition: 'color 0.2s' }}>Fonctionnalités</a>
            <a href="#code" style={{ color: '#94A3B8', textDecoration: 'none', fontSize: '14px', fontWeight: 500, transition: 'color 0.2s' }}>Code & TypeScript</a>
            <button onClick={() => navigate('/workshop')} style={{ background: 'transparent', color: '#EB459E', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Users size={15} /> Workshop
            </button>
          </nav>

          {/* Action CTAs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button
              onClick={() => navigate('/dashboard')}
              style={{
                background: 'transparent',
                color: '#94A3B8',
                fontSize: '14px',
                fontWeight: 600,
                padding: '8px 16px',
                borderRadius: '8px',
              }}
            >
              Mes Projets
            </button>
            <button
              onClick={handleOpenStudio}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#5865F2',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: 600,
                padding: '10px 20px',
                borderRadius: '10px',
                boxShadow: '0 4px 16px rgba(88,101,242,0.4)',
              }}
            >
              Ouvrir le Studio <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section style={{ maxWidth: '1240px', margin: '0 auto', padding: '100px 32px 60px', textAlign: 'center', position: 'relative' }}>
        
        {/* Pill Badge */}
        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '8px', 
          background: 'rgba(88,101,242,0.12)', 
          border: '1px solid rgba(88,101,242,0.3)', 
          padding: '8px 18px', 
          borderRadius: '30px', 
          fontSize: '13px', 
          fontWeight: 600, 
          color: '#5865F2',
          marginBottom: '28px'
        }}>
          <Zap size={15} /> Studio Graphique 2D & Code Node.js Canvas
        </div>

        {/* Big Airy Headline */}
        <h1 style={{ 
          fontSize: '64px', 
          fontWeight: 800, 
          letterSpacing: '-2px', 
          lineHeight: '1.1', 
          maxWidth: '900px', 
          margin: '0 auto 24px', 
          color: '#FFFFFF' 
        }}>
          Concevez vos images Discord.<br />
          <span style={{ 
            background: 'linear-gradient(135deg, #5865F2 0%, #00F0FF 50%, #EB459E 100%)', 
            WebkitBackgroundClip: 'text', 
            WebkitTextFillColor: 'transparent' 
          }}>
            Exportez en Node.js typé.
          </span>
        </h1>

        {/* Subtitle */}
        <p style={{ 
          fontSize: '19px', 
          color: '#94A3B8', 
          maxWidth: '640px', 
          margin: '0 auto 40px', 
          lineHeight: '1.6', 
          fontWeight: 400 
        }}>
          Créez visuellement vos bannières, cartes de niveau (Rank), profils et jauges.
          Générez instantanément du code TypeScript avec vos paramètres strictement typés.
        </p>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginBottom: '80px' }}>
          <button
            onClick={handleOpenStudio}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: '#5865F2',
              color: '#FFFFFF',
              fontSize: '16px',
              fontWeight: 700,
              padding: '14px 32px',
              borderRadius: '12px',
              boxShadow: '0 8px 28px rgba(88,101,242,0.45)',
            }}
          >
            Lancer le Studio Graphique <ArrowRight size={18} />
          </button>

          <button
            onClick={() => navigate('/dashboard')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#FFFFFF',
              fontSize: '16px',
              fontWeight: 600,
              padding: '14px 28px',
              borderRadius: '12px',
            }}
          >
            Accéder à Mes Projets
          </button>
        </div>

        {/* 3. HERO SHOWCASE MOCKUP (AIRY FLOATING CARD) */}
        <div style={{ position: 'relative', maxWidth: '980px', margin: '0 auto' }}>
          <div style={{
            background: 'rgba(18, 20, 28, 0.75)',
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '24px',
            padding: '32px',
            boxShadow: '0 30px 80px -20px rgba(0,0,0,0.9), 0 0 50px -10px rgba(88,101,242,0.3)',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}>
            
            {/* Mockup Header Controls */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '16px' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ED4245' }} />
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#FEE75C' }} />
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#57F287' }} />
              </div>
              <div style={{ fontSize: '13px', color: '#94A3B8', fontWeight: 500 }}>
                Aperçu Canvas Dynamique • 800 × 320 px
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <span style={{ fontSize: '11px', background: 'rgba(88,101,242,0.2)', color: '#5865F2', padding: '3px 8px', borderRadius: '6px', fontWeight: 600 }}>TypeScript Ready</span>
              </div>
            </div>

            {/* Live Interactive Preview Card Demo */}
            <div style={{ 
              background: 'linear-gradient(135deg, #111318 0%, #1A1D24 100%)', 
              borderRadius: '16px', 
              border: '1px solid rgba(88,101,242,0.2)',
              padding: '32px 40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ position: 'absolute', right: '-50px', top: '-50px', width: '250px', height: '250px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(88,101,242,0.25) 0%, transparent 70%)' }} />

              {/* Left Profile Info */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '24px', zIndex: 1 }}>
                <div style={{ position: 'relative' }}>
                  <img 
                    src="https://cdn.discordapp.com/embed/avatars/0.png" 
                    alt="Discord Avatar" 
                    style={{ width: '90px', height: '90px', borderRadius: '50%', border: '3px solid #5865F2', boxShadow: '0 8px 24px rgba(88,101,242,0.3)' }} 
                  />
                  <div style={{ 
                    position: 'absolute', 
                    bottom: '2px', 
                    right: '2px', 
                    width: '22px', 
                    height: '22px', 
                    borderRadius: '50%', 
                    background: '#57F287', 
                    border: '4px solid #111318' 
                  }} />
                </div>

                <div style={{ textAlign: 'left' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '26px', fontWeight: 800, color: '#FFFFFF' }}>Wumpus Developer</span>
                    <span style={{ background: '#5865F2', color: '#fff', fontSize: '11px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px' }}>BOT</span>
                  </div>
                  <div style={{ fontSize: '14px', color: '#5865F2', fontWeight: 600, marginTop: '4px' }}>
                    NIVEAU 42 • RANG #1 DU SERVEUR
                  </div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(254,231,92,0.15)', border: '1px solid rgba(254,231,92,0.3)', padding: '3px 10px', borderRadius: '6px', marginTop: '8px' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#FEE75C' }} />
                    <span style={{ fontSize: '12px', fontWeight: 600, color: '#FEE75C' }}>Membre VIP Legend</span>
                  </div>
                </div>
              </div>

              {/* Right Progress Gauge & XP */}
              <div style={{ textAlign: 'right', minWidth: '260px', zIndex: 1 }}>
                <div style={{ fontSize: '13px', color: '#94A3B8', fontWeight: 600, marginBottom: '6px' }}>
                  EXPÉRIENCE : <strong style={{ color: '#57F287' }}>8,450</strong> / 10,000 XP
                </div>
                <div style={{ width: '100%', height: '20px', borderRadius: '10px', background: '#2B2D31', overflow: 'hidden', padding: '3px' }}>
                  <div style={{ width: '84%', height: '100%', borderRadius: '8px', background: 'linear-gradient(90deg, #5865F2, #57F287)', boxShadow: '0 0 12px rgba(87,242,135,0.5)' }} />
                </div>
                <div style={{ fontSize: '12px', color: '#64748B', marginTop: '6px' }}>84.5% complété</div>
              </div>
            </div>

            {/* Floating Tags Under Mockup */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#94A3B8' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#5865F2' }} />
                Interface TypeScript 100% Typée
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#94A3B8' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#57F287' }} />
                5 Styles de Jauges fluides avec Dégradés
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: '#94A3B8' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#FEE75C' }} />
                Smart Snapping (Touche Ctrl)
              </div>
            </div>
          </div>
        </div>

      </section>

      {/* 4. THREE PILLARS (AIRY FEATURE CARDS) */}
      <section id="features" style={{ maxWidth: '1240px', margin: '0 auto', padding: '120px 32px 80px' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <span style={{ fontSize: '13px', fontWeight: 700, color: '#5865F2', letterSpacing: '1px', textTransform: 'uppercase' }}>POURQUOI CET OUTIL ?</span>
          <h2 style={{ fontSize: '42px', fontWeight: 800, letterSpacing: '-1px', marginTop: '8px', color: '#FFFFFF' }}>
            Tout ce dont vous avez besoin,<br />pensé pour la performance.
          </h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '32px' }}>
          <div className="air-card" style={{ padding: '36px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(88,101,242,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#5865F2' }}>
              <Palette size={24} />
            </div>
            <div>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#5865F2' }}>01. DESIGN VISUEL</span>
              <h3 style={{ fontSize: '20px', fontWeight: 700, margin: '6px 0 10px', color: '#FFFFFF' }}>Éditeur Graphique 2D Précis</h3>
              <p style={{ fontSize: '14px', color: '#94A3B8', lineHeight: '1.6' }}>
                Placez vos avatars seuls ou avec statut, bannières, badges de rôles, émojis et jauges avec dégradés sans distorsion.
              </p>
            </div>
          </div>

          <div className="air-card" style={{ padding: '36px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(87,242,135,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#57F287' }}>
              <Code2 size={24} />
            </div>
            <div>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#57F287' }}>02. CODE SUR MESURE</span>
              <h3 style={{ fontSize: '20px', fontWeight: 700, margin: '6px 0 10px', color: '#FFFFFF' }}>Typage TypeScript Strict</h3>
              <p style={{ fontSize: '14px', color: '#94A3B8', lineHeight: '1.6' }}>
                Attribuez un nom de variable <code>paramKey</code> à chaque composant. L’interface <code>CardOptions</code> est générée uniquement avec vos champs nécessaires.
              </p>
            </div>
          </div>

          <div className="air-card" style={{ padding: '36px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(0,240,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00F0FF' }}>
              <Terminal size={24} />
            </div>
            <div>
              <span style={{ fontSize: '12px', fontWeight: 700, color: '#00F0FF' }}>03. INTÉGRATION RAPIDE</span>
              <h3 style={{ fontSize: '20px', fontWeight: 700, margin: '6px 0 10px', color: '#FFFFFF' }}>Prêt pour Discord.js</h3>
              <p style={{ fontSize: '14px', color: '#94A3B8', lineHeight: '1.6' }}>
                Exportez le code ou téléchargez le bundle ZIP complet avec <code>package.json</code> pour brancher votre bot en 3 lignes de code.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CODE SECTION */}
      <section id="code" style={{ maxWidth: '1240px', margin: '0 auto', padding: '80px 32px 100px' }}>
        <div style={{ background: '#0D0E13', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '48px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', alignItems: 'center' }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'rgba(88,101,242,0.15)', color: '#5865F2', padding: '6px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, marginBottom: '16px' }}>
              <ShieldCheck size={14} /> AUCUN ANY INDEX SIGNATURE
            </div>
            <h2 style={{ fontSize: '36px', fontWeight: 800, letterSpacing: '-1px', color: '#FFFFFF', lineHeight: '1.2', marginBottom: '16px' }}>
              Un code propre et maintenable pour votre bot.
            </h2>
            <p style={{ fontSize: '15px', color: '#94A3B8', lineHeight: '1.6', marginBottom: '28px' }}>
              Le moteur de rendu convertit chaque forme, texte et jauge en instructions directes Canvas 2D natives ultra-rapides, garantissant des temps de génération de quelques millisecondes seulement.
            </p>
            <button
              onClick={handleOpenStudio}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: '#5865F2',
                color: '#FFFFFF',
                fontSize: '14px',
                fontWeight: 600,
                padding: '12px 24px',
                borderRadius: '10px',
              }}
            >
              Tester dans le Studio <ArrowRight size={16} />
            </button>
          </div>

          <div style={{ background: '#07080B', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 40px rgba(0,0,0,0.8)' }}>
            <div style={{ padding: '12px 18px', background: '#12141A', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: '#94A3B8', fontFamily: 'monospace' }}>cardGenerator.ts</span>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(PREVIEW_CODE_SNIPPET);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                style={{ display: 'flex', alignItems: 'center', gap: '4px', background: copied ? '#57F287' : 'rgba(255,255,255,0.08)', color: copied ? '#000' : '#fff', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 600 }}
              >
                {copied ? <Check size={12} /> : <Copy size={12} />}
                {copied ? 'Copié' : 'Copier'}
              </button>
            </div>
            <pre style={{ margin: 0, padding: '20px', fontFamily: '"Fira Code", monospace', fontSize: '13px', lineHeight: '1.6', color: '#a5b4fc', overflowX: 'auto' }}>
              <code>{PREVIEW_CODE_SNIPPET}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* 6. CALL TO ACTION */}
      <section style={{ maxWidth: '1240px', margin: '0 auto', padding: '0 32px 100px' }}>
        <div style={{ 
          background: 'linear-gradient(135deg, rgba(88,101,242,0.15) 0%, rgba(0,240,255,0.08) 100%)', 
          border: '1px solid rgba(88,101,242,0.3)', 
          borderRadius: '24px', 
          padding: '60px 40px', 
          textAlign: 'center',
          boxShadow: '0 20px 60px rgba(0,0,0,0.6)'
        }}>
          <h2 style={{ fontSize: '40px', fontWeight: 800, color: '#FFFFFF', marginBottom: '14px', letterSpacing: '-1px' }}>
            Prêt à concevoir vos cartes Discord ?
          </h2>
          <p style={{ fontSize: '16px', color: '#94A3B8', maxWidth: '540px', margin: '0 auto 32px' }}>
            Aucune installation compliquée. Ouvrez le studio directement dans votre navigateur et commencez à créer.
          </p>
          <button
            onClick={handleOpenStudio}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              background: '#5865F2',
              color: '#FFFFFF',
              fontSize: '16px',
              fontWeight: 700,
              padding: '14px 36px',
              borderRadius: '12px',
              boxShadow: '0 8px 30px rgba(88,101,242,0.5)',
            }}
          >
            Lancer le Studio Maintenant <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '32px 0', textAlign: 'center', color: '#64748B', fontSize: '13px' }}>
        <p>Discord Canvas Maker — Créateur et générateur de code TypeScript / Node.js Canvas open-source.</p>
      </footer>

    </div>
  );
};
