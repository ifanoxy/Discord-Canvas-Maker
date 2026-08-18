import React, { useState, useMemo } from 'react';
import { Search, X, Sparkles } from 'lucide-react';

export type EmojiPlatformStyle = 'twemoji' | 'apple' | 'google' | 'unicode';

interface EmojiItem {
  name: string;
  char: string;
  code: string; // hex code points without 0x e.g. "1f600"
  category: string;
}

const EMOJI_DATABASE: EmojiItem[] = [
  // Smileys & Emotion
  { name: 'grinning', char: '😀', code: '1f600', category: 'smileys' },
  { name: 'smiley', char: '😃', code: '1f603', category: 'smileys' },
  { name: 'smile', char: '😄', code: '1f604', category: 'smileys' },
  { name: 'grin', char: '😁', code: '1f601', category: 'smileys' },
  { name: 'laughing', char: '😆', code: '1f606', category: 'smileys' },
  { name: 'sweat_smile', char: '😅', code: '1f605', category: 'smileys' },
  { name: 'joy', char: '😂', code: '1f602', category: 'smileys' },
  { name: 'rofl', char: '🤣', code: '1f923', category: 'smileys' },
  { name: 'relaxed', char: '☺️', code: '263a-fe0f', category: 'smileys' },
  { name: 'blush', char: '😊', code: '1f60a', category: 'smileys' },
  { name: 'innocent', char: '😇', code: '1f607', category: 'smileys' },
  { name: 'heart_eyes', char: '😍', code: '1f60d', category: 'smileys' },
  { name: 'star_struck', char: '🤩', code: '1f929', category: 'smileys' },
  { name: 'kissing_heart', char: '😘', code: '1f618', category: 'smileys' },
  { name: 'cool_sunglasses', char: '😎', code: '1f60e', category: 'smileys' },
  { name: 'smirk', char: '😏', code: '1f60f', category: 'smileys' },
  { name: 'thinking', char: '🤔', code: '1f914', category: 'smileys' },
  { name: 'salute', char: '🫡', code: '1fae1', category: 'smileys' },
  { name: 'zipper_mouth', char: '🤐', code: '1f910', category: 'smileys' },
  { name: 'hugging', char: '🤗', code: '1f917', category: 'smileys' },
  { name: 'shushing', char: '🤫', code: '1f92b', category: 'smileys' },
  { name: 'nerd', char: '🤓', code: '1f913', category: 'smileys' },
  { name: 'cry', char: '😢', code: '1f622', category: 'smileys' },
  { name: 'sob', char: '😭', code: '1f62d', category: 'smileys' },
  { name: 'scream', char: '😱', code: '1f631', category: 'smileys' },
  { name: 'rage', char: '😡', code: '1f621', category: 'smileys' },
  { name: 'exploding_head', char: '🤯', code: '1f92f', category: 'smileys' },
  { name: 'partying', char: '🥳', code: '1f973', category: 'smileys' },
  { name: 'skull', char: '💀', code: '1f480', category: 'smileys' },
  { name: 'clown', char: '🤡', code: '1f921', category: 'smileys' },
  { name: 'poop', char: '💩', code: '1f4a9', category: 'smileys' },
  { name: 'ghost', char: '👻', code: '1f47b', category: 'smileys' },
  { name: 'alien', char: '👽', code: '1f47d', category: 'smileys' },
  { name: 'robot', char: '🤖', code: '1f916', category: 'smileys' },

  // Gestures & Badges
  { name: 'thumbsup', char: '👍', code: '1f44d', category: 'gestures' },
  { name: 'thumbsdown', char: '👎', code: '1f44e', category: 'gestures' },
  { name: 'clap', char: '👏', code: '1f44f', category: 'gestures' },
  { name: 'wave', char: '👋', code: '1f44b', category: 'gestures' },
  { name: 'pray_thanks', char: '🙏', code: '1f64f', category: 'gestures' },
  { name: 'raised_hands', char: '🙌', code: '1f64c', category: 'gestures' },
  { name: 'eyes', char: '👀', code: '1f440', category: 'gestures' },
  { name: 'muscle', char: '💪', code: '1f4aa', category: 'gestures' },
  { name: 'handshake', char: '🤝', code: '1f91d', category: 'gestures' },
  { name: 'point_right', char: '👉', code: '1f449', category: 'gestures' },
  { name: 'fire', char: '🔥', code: '1f525', category: 'discord' },
  { name: 'sparkles', char: '✨', code: '2728', category: 'discord' },
  { name: 'star', char: '⭐', code: '2b50', category: 'discord' },
  { name: 'glowing_star', char: '🌟', code: '1f31f', category: 'discord' },
  { name: 'zap_lightning', char: '⚡', code: '26a1', category: 'discord' },
  { name: '100', char: '💯', code: '1f4af', category: 'discord' },
  { name: 'tada_party', char: '🎉', code: '1f389', category: 'discord' },
  { name: 'trophy', char: '🏆', code: '1f3c6', category: 'discord' },
  { name: 'medal', char: '🥇', code: '1f947', category: 'discord' },
  { name: 'crown', char: '👑', code: '1f451', category: 'discord' },
  { name: 'gem_diamond', char: '💎', code: '1f48e', category: 'discord' },
  { name: 'rocket', char: '🚀', code: '1f680', category: 'discord' },

  // Hearts & Symbols
  { name: 'red_heart', char: '❤️', code: '2764-fe0f', category: 'hearts' },
  { name: 'pink_heart', char: '🩷', code: '1fa77', category: 'hearts' },
  { name: 'orange_heart', char: '🧡', code: '1f9e1', category: 'hearts' },
  { name: 'yellow_heart', char: '💛', code: '1f49b', category: 'hearts' },
  { name: 'green_heart', char: '💚', code: '1f49a', category: 'hearts' },
  { name: 'blue_heart', char: '💙', code: '1f499', category: 'hearts' },
  { name: 'purple_heart', char: '💜', code: '1f49c', category: 'hearts' },
  { name: 'black_heart', char: '🖤', code: '1f5a4', category: 'hearts' },
  { name: 'white_heart', char: '🤍', code: '1f90d', category: 'hearts' },
  { name: 'broken_heart', char: '💔', code: '1f494', category: 'hearts' },
  { name: 'sparkling_heart', char: '💖', code: '1f496', category: 'hearts' },
  { name: 'shield', char: '🛡️', code: '1f6e1-fe0f', category: 'symbols' },
  { name: 'warning', char: '⚠️', code: '26a0-fe0f', category: 'symbols' },
  { name: 'check_mark', char: '✅', code: '2705', category: 'symbols' },
  { name: 'cross_mark', char: '❌', code: '274c', category: 'symbols' },
  { name: 'question', char: '❓', code: '2753', category: 'symbols' },
  { name: 'exclamation', char: '❗', code: '2757', category: 'symbols' },

  // Gaming & Tech
  { name: 'gamepad', char: '🎮', code: '1f3ae', category: 'gaming' },
  { name: 'joystick', char: '🕹️', code: '1f579-fe0f', category: 'gaming' },
  { name: 'dice', char: '🎲', code: '1f3b2', category: 'gaming' },
  { name: 'magic_wand', char: '🪄', code: '1fa84', category: 'gaming' },
  { name: 'headphones', char: '🎧', code: '1f3a7', category: 'gaming' },
  { name: 'microphone', char: '🎤', code: '1f3a4', category: 'gaming' },
  { name: 'speaker_sound', char: '🔊', code: '1f50a', category: 'gaming' },
  { name: 'mute', char: '🔇', code: '1f507', category: 'gaming' },
  { name: 'computer', char: '💻', code: '1f4bb', category: 'gaming' },
  { name: 'server_disk', char: '💽', code: '1f4bd', category: 'gaming' },
  { name: 'bell', char: '🔔', code: '1f514', category: 'gaming' },
  { name: 'lock', char: '🔒', code: '1f512', category: 'gaming' },
  { name: 'unlock', char: '🔓', code: '1f513', category: 'gaming' },
  { name: 'key', char: '🔑', code: '1f511', category: 'gaming' },
];

export function getEmojiCdnUrl(item: EmojiItem, style: EmojiPlatformStyle): string {
  // Normalize code for CDN
  const cleanCode = item.code.toLowerCase();
  
  if (style === 'twemoji') {
    // Twitter / Discord style SVG
    return `https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/svg/${cleanCode}.svg`;
  }
  if (style === 'apple') {
    // Apple emoji CDN
    return `https://raw.githubusercontent.com/iamcal/emoji-data/master/img-apple-64/${cleanCode}.png`;
  }
  if (style === 'google') {
    // Google Noto color emoji
    return `https://raw.githubusercontent.com/iamcal/emoji-data/master/img-google-64/${cleanCode}.png`;
  }
  return '';
}

interface EmojiSelectorProps {
  onSelect: (data: {
    type: 'unicode' | 'image';
    style: EmojiPlatformStyle;
    char: string;
    url?: string;
    name: string;
  }) => void;
  onClose: () => void;
}

export const EmojiSelector: React.FC<EmojiSelectorProps> = ({ onSelect, onClose }) => {
  const [platformStyle, setPlatformStyle] = useState<EmojiPlatformStyle>('twemoji');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredEmojis = useMemo(() => {
    return EMOJI_DATABASE.filter(e => {
      const matchSearch = !search || e.name.toLowerCase().includes(search.toLowerCase()) || e.char.includes(search);
      const matchCat = selectedCategory === 'all' || e.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [search, selectedCategory]);

  const handleEmojiClick = (item: EmojiItem) => {
    if (platformStyle === 'unicode') {
      onSelect({
        type: 'unicode',
        style: 'unicode',
        char: item.char,
        name: item.name,
      });
    } else {
      const url = getEmojiCdnUrl(item, platformStyle);
      onSelect({
        type: 'image',
        style: platformStyle,
        char: item.char,
        url: url,
        name: item.name,
      });
    }
  };

  return (
    <div 
      className="glass-panel" 
      style={{ 
        width: '340px', 
        borderRadius: '12px', 
        padding: '14px', 
        boxShadow: '0 16px 40px rgba(0,0,0,0.6)', 
        border: '1px solid var(--panel-border)',
        display: 'flex', 
        flexDirection: 'column', 
        gap: '12px',
        background: '#1E1F22',
        color: '#F2F3F5',
        zIndex: 999
      }}
    >
      {/* Header & Close */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '14px' }}>
          <Sparkles size={16} color="#5865F2" />
          <span>Sélecteur d'Émojis</span>
        </div>
        <button 
          onClick={onClose} 
          style={{ background: 'transparent', color: '#94A3B8', padding: '4px', borderRadius: '4px', cursor: 'pointer' }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Platform Style Tabs */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '4px', background: '#111214', padding: '4px', borderRadius: '8px' }}>
        {[
          { id: 'twemoji', label: 'Discord', icon: '🟣' },
          { id: 'apple', label: 'Apple', icon: '🍏' },
          { id: 'google', label: 'Android', icon: '🤖' },
          { id: 'unicode', label: 'Texte', icon: '🔤' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setPlatformStyle(tab.id as EmojiPlatformStyle)}
            style={{
              padding: '6px 2px',
              fontSize: '11px',
              fontWeight: 600,
              borderRadius: '6px',
              background: platformStyle === tab.id ? '#5865F2' : 'transparent',
              color: platformStyle === tab.id ? '#FFFFFF' : '#94A3B8',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '2px',
            }}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Search Input */}
      <div style={{ display: 'flex', alignItems: 'center', background: '#111214', borderRadius: '6px', padding: '6px 10px', gap: '8px', border: '1px solid var(--panel-border)' }}>
        <Search size={14} color="#94A3B8" />
        <input
          type="text"
          placeholder="Rechercher un émoji..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '13px', width: '100%' }}
        />
        {search && (
          <button onClick={() => setSearch('')} style={{ background: 'transparent', color: '#94A3B8' }}>
            <X size={12} />
          </button>
        )}
      </div>

      {/* Category Pills */}
      <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '4px' }}>
        {[
          { id: 'all', label: 'Tous' },
          { id: 'smileys', label: 'Visages' },
          { id: 'discord', label: 'Discord Pop' },
          { id: 'hearts', label: 'Cœurs' },
          { id: 'gaming', label: 'Gaming' },
          { id: 'gestures', label: 'Mains' },
          { id: 'symbols', label: 'Symboles' },
        ].map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            style={{
              padding: '3px 8px',
              fontSize: '11px',
              borderRadius: '12px',
              whiteSpace: 'nowrap',
              background: selectedCategory === cat.id ? 'rgba(88,101,242,0.3)' : '#2B2D31',
              color: selectedCategory === cat.id ? '#5865F2' : '#94A3B8',
              border: selectedCategory === cat.id ? '1px solid #5865F2' : '1px solid transparent',
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Emoji Grid */}
      <div 
        style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(7, 1fr)', 
          gap: '6px', 
          maxHeight: '220px', 
          overflowY: 'auto', 
          padding: '4px' 
        }}
      >
        {filteredEmojis.map((item) => {
          const cdnUrl = getEmojiCdnUrl(item, platformStyle);
          return (
            <button
              key={item.code}
              onClick={() => handleEmojiClick(item)}
              title={item.name}
              style={{
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#2B2D31',
                borderRadius: '6px',
                cursor: 'pointer',
                border: '1px solid rgba(255,255,255,0.05)',
                transition: 'transform 0.15s ease, background 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.15)';
                e.currentTarget.style.background = 'rgba(88,101,242,0.4)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.background = '#2B2D31';
              }}
            >
              {platformStyle === 'unicode' ? (
                <span style={{ fontSize: '20px' }}>{item.char}</span>
              ) : (
                <img 
                  src={cdnUrl} 
                  alt={item.name} 
                  style={{ width: '24px', height: '24px', objectFit: 'contain' }}
                  loading="lazy"
                />
              )}
            </button>
          );
        })}
      </div>
      
      <div style={{ fontSize: '11px', color: '#94A3B8', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '6px' }}>
        Style actif: <strong style={{ color: '#5865F2' }}>{platformStyle.toUpperCase()}</strong> ({filteredEmojis.length} émojis)
      </div>
    </div>
  );
};
