import React from 'react';
import { ChromePicker } from 'react-color';

const DISCORD_PALETTE = [
  '#5865F2', // Blurple
  '#57F287', // Green
  '#FEE75C', // Yellow
  '#ED4245', // Red
  '#EB459E', // Fuchsia
  '#FFFFFF', // White
  '#000000', // Black
  '#313338', // Dark background
  '#2B2D31', // Darker background
  '#1E1F22', // Darkest background
  '#99AAB5', // Greyple
];

interface CustomColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  recentColors: string[];
  addRecentColor: (color: string) => void;
}

export const CustomColorPicker: React.FC<CustomColorPickerProps> = ({ color, onChange, recentColors, addRecentColor }) => {
  return (
    <div style={{ background: 'var(--panel-bg)', padding: '16px', borderRadius: '8px', border: '1px solid var(--panel-border)', boxShadow: 'var(--shadow-glass)', width: '260px' }}>
      <ChromePicker 
        color={color} 
        onChange={(c) => onChange(c.hex)} 
        onChangeComplete={(c) => addRecentColor(c.hex)}
        disableAlpha={true}
        styles={{
          default: {
            picker: { background: 'transparent', boxShadow: 'none', width: '100%', padding: 0 },
            body: { padding: '12px 0 0 0' }
          }
        }}
      />
      
      {/* Recent Colors */}
      <div style={{ marginTop: '16px' }}>
        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 600 }}>Couleurs récentes</div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {recentColors.length === 0 && <span style={{ fontSize: '12px', color: '#555' }}>Aucune</span>}
          {recentColors.map((rc, i) => (
            <div 
              key={i} 
              onClick={() => onChange(rc)}
              style={{ width: '20px', height: '20px', borderRadius: '4px', background: rc, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)' }}
            />
          ))}
        </div>
      </div>

      {/* Discord Palette */}
      <div style={{ marginTop: '16px' }}>
        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 600 }}>Palette Discord</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '6px' }}>
          {DISCORD_PALETTE.map((dc, i) => (
            <div 
              key={i} 
              onClick={() => onChange(dc)}
              title={dc}
              style={{ width: '100%', aspectRatio: '1', borderRadius: '4px', background: dc, cursor: 'pointer', border: '1px solid rgba(255,255,255,0.1)' }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
