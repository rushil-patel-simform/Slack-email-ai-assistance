import React, { useState } from 'react';
import { useAutoDraft } from '../hooks/useAutoDraft';

interface ToastState {
  message: string;
  type: 'success' | 'error';
}

export default function IndexPopup(): React.ReactElement {
  const { autoDraftEnabled, isLoading, backendOnline, error, toggle, refresh } = useAutoDraft();
  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = (message: string, type: 'success' | 'error'): void => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleToggle = async (): Promise<void> => {
    try {
      await toggle();
      const nextState = !autoDraftEnabled;
      showToast(
        nextState ? '✅ Auto-Draft Enabled' : '⏸ Auto-Draft Disabled',
        'success',
      );
    } catch {
      showToast('❌ Failed to update setting', 'error');
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <span style={styles.headerIcon}>✉️</span>
        <span style={styles.headerTitle}>Gmail AI Assistant</span>
      </div>

      {/* Backend status */}
      <div style={styles.statusRow}>
        <span style={styles.statusLabel}>Backend</span>
        <span
          style={{
            ...styles.statusBadge,
            backgroundColor: backendOnline ? '#dcfce7' : '#fee2e2',
            color: backendOnline ? '#16a34a' : '#dc2626',
          }}
        >
          {backendOnline ? '● Connected' : '● Offline'}
        </span>
      </div>

      {/* Auto-draft status */}
      <div style={styles.statusRow}>
        <span style={styles.statusLabel}>Auto Draft</span>
        <span
          style={{
            ...styles.statusBadge,
            backgroundColor: autoDraftEnabled ? '#dbeafe' : '#f3f4f6',
            color: autoDraftEnabled ? '#1d4ed8' : '#6b7280',
          }}
        >
          {autoDraftEnabled ? '● ON' : '○ OFF'}
        </span>
      </div>

      <div style={styles.divider} />

      {/* Toggle Button */}
      <button
        onClick={handleToggle}
        disabled={isLoading || !backendOnline}
        style={{
          ...styles.toggleBtn,
          backgroundColor: autoDraftEnabled ? '#fee2e2' : '#dcfce7',
          color: autoDraftEnabled ? '#dc2626' : '#16a34a',
          opacity: isLoading || !backendOnline ? 0.6 : 1,
          cursor: isLoading || !backendOnline ? 'not-allowed' : 'pointer',
        }}
      >
        {isLoading ? '⏳ Updating...' : autoDraftEnabled
          ? '⏹ Stop Automatic Drafting'
          : '▶ Start Automatic Drafting'}
      </button>

      {/* Refresh */}
      <button
        onClick={refresh}
        disabled={isLoading}
        style={styles.refreshBtn}
      >
        🔄 Refresh Status
      </button>

      {/* Error */}
      {error && (
        <div style={styles.errorBox}>
          ⚠️ {error}
        </div>
      )}

      {/* Info note */}
      <div style={styles.note}>
        💡 The <strong>AI Reply</strong> button inside Gmail always works, regardless of this toggle.
      </div>

      {/* Toast */}
      {toast && (
        <div
          style={{
            ...styles.toast,
            backgroundColor: toast.type === 'success' ? '#16a34a' : '#dc2626',
          }}
        >
          {toast.message}
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '280px',
    padding: '16px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    backgroundColor: '#ffffff',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '4px',
  },
  headerIcon: {
    fontSize: '20px',
  },
  headerTitle: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#111827',
  },
  statusRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    fontSize: '13px',
    color: '#374151',
  },
  statusBadge: {
    fontSize: '12px',
    fontWeight: '500',
    padding: '2px 8px',
    borderRadius: '9999px',
  },
  divider: {
    height: '1px',
    backgroundColor: '#e5e7eb',
    margin: '4px 0',
  },
  toggleBtn: {
    width: '100%',
    padding: '10px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    transition: 'opacity 0.2s',
  },
  refreshBtn: {
    width: '100%',
    padding: '8px',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    backgroundColor: '#f9fafb',
    color: '#374151',
    fontSize: '12px',
    cursor: 'pointer',
  },
  errorBox: {
    padding: '8px 10px',
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    borderRadius: '6px',
    fontSize: '12px',
  },
  note: {
    fontSize: '11px',
    color: '#9ca3af',
    lineHeight: '1.5',
    marginTop: '4px',
  },
  toast: {
    position: 'fixed' as const,
    bottom: '12px',
    left: '50%',
    transform: 'translateX(-50%)',
    padding: '8px 16px',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '13px',
    fontWeight: '500',
    zIndex: 99999,
    whiteSpace: 'nowrap',
  },
};
