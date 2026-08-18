import React from 'react';
import { useStore } from '../store/useStore';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export const Toasts: React.FC = () => {
  const { toasts, removeToast } = useStore();

  if (toasts.length === 0) return null;

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '380px' }}>
      {toasts.map(toast => {
        let icon = <CheckCircle2 size={18} color="#57F287" />;
        let borderColor = 'rgba(87,242,135,0.4)';
        let bgGlow = 'rgba(87,242,135,0.1)';

        if (toast.type === 'error') {
          icon = <AlertCircle size={18} color="#ED4245" />;
          borderColor = 'rgba(237,66,69,0.4)';
          bgGlow = 'rgba(237,66,69,0.12)';
        } else if (toast.type === 'warning') {
          icon = <AlertTriangle size={18} color="#FEE75C" />;
          borderColor = 'rgba(254,231,92,0.4)';
          bgGlow = 'rgba(254,231,92,0.12)';
        } else if (toast.type === 'info') {
          icon = <Info size={18} color="#5865F2" />;
          borderColor = 'rgba(88,101,242,0.4)';
          bgGlow = 'rgba(88,101,242,0.12)';
        }

        return (
          <div
            key={toast.id}
            style={{
              background: '#14161C',
              border: `1px solid ${borderColor}`,
              boxShadow: `0 12px 30px rgba(0,0,0,0.8), 0 0 20px ${bgGlow}`,
              borderRadius: '12px',
              padding: '14px 16px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              color: '#FFFFFF',
              animation: 'slideIn 0.2s ease-out'
            }}
          >
            <div style={{ marginTop: '2px' }}>{icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '2px' }}>{toast.title}</div>
              <div style={{ fontSize: '12px', color: '#94A3B8', lineHeight: '1.4' }}>{toast.message}</div>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              style={{ background: 'transparent', color: '#64748B', padding: '2px' }}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
