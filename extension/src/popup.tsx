import React, { useState, useEffect, useCallback } from "react"

const BACKEND_URL = "http://localhost:3000"

// ── API helpers ────────────────────────────────────────────────
async function getSettings(): Promise<{ autoDraftEnabled: boolean }> {
  const r = await fetch(`${BACKEND_URL}/settings`)
  if (!r.ok) throw new Error(`HTTP ${r.status}`)
  const j = await r.json()
  return j.data
}

async function startAutoDraft(): Promise<{ autoDraftEnabled: boolean }> {
  const r = await fetch(`${BACKEND_URL}/settings/auto-draft/start`, { method: "POST" })
  if (!r.ok) throw new Error(`HTTP ${r.status}`)
  const j = await r.json()
  return j.data
}

async function stopAutoDraft(): Promise<{ autoDraftEnabled: boolean }> {
  const r = await fetch(`${BACKEND_URL}/settings/auto-draft/stop`, { method: "POST" })
  if (!r.ok) throw new Error(`HTTP ${r.status}`)
  const j = await r.json()
  return j.data
}

async function checkHealth(): Promise<boolean> {
  try {
    const r = await fetch(`${BACKEND_URL}/health`, { signal: AbortSignal.timeout(3000) })
    return r.ok
  } catch {
    return false
  }
}

// ── Main Popup ─────────────────────────────────────────────────
export default function IndexPopup() {
  const [autoDraft, setAutoDraft] = useState(false)
  const [loading, setLoading] = useState(true)
  const [online, setOnline] = useState(false)
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3000)
  }

  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const isOnline = await checkHealth()
      setOnline(isOnline)
      if (isOnline) {
        const s = await getSettings()
        setAutoDraft(s.autoDraftEnabled)
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error")
      setOnline(false)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { refresh() }, [refresh])

  const handleToggle = async () => {
    setLoading(true)
    try {
      const result = autoDraft ? await stopAutoDraft() : await startAutoDraft()
      setAutoDraft(result.autoDraftEnabled)
      showToast(result.autoDraftEnabled ? "✅ Auto-Draft ON" : "⏸ Auto-Draft OFF", result.autoDraftEnabled)
    } catch (e) {
      showToast("❌ Failed to update", false)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      width: 280, padding: 16, fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',
      background: "#fff", display: "flex", flexDirection: "column", gap: 10
    }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, paddingBottom: 4, borderBottom: "1px solid #e5e7eb" }}>
        <span style={{ fontSize: 22 }}>✉️</span>
        <div>
          <div style={{ fontWeight: 700, fontSize: 14, color: "#111" }}>Gmail AI Assistant</div>
          <div style={{ fontSize: 11, color: "#9ca3af" }}>AI-powered email replies</div>
        </div>
      </div>

      {/* Status rows */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <StatusRow label="Backend" value={online ? "● Connected" : "● Offline"}
          color={online ? "#16a34a" : "#dc2626"} bg={online ? "#dcfce7" : "#fee2e2"} />
        <StatusRow label="Auto Draft" value={autoDraft ? "● ON" : "○ OFF"}
          color={autoDraft ? "#1d4ed8" : "#6b7280"} bg={autoDraft ? "#dbeafe" : "#f3f4f6"} />
      </div>

      {/* Toggle button */}
      <button
        onClick={handleToggle}
        disabled={loading || !online}
        style={{
          width: "100%", padding: "10px 0", border: "none", borderRadius: 8,
          fontSize: 13, fontWeight: 600, cursor: loading || !online ? "not-allowed" : "pointer",
          opacity: loading || !online ? 0.55 : 1,
          background: autoDraft ? "#fee2e2" : "#dcfce7",
          color: autoDraft ? "#dc2626" : "#16a34a",
          transition: "opacity 0.2s",
        }}>
        {loading ? "⏳ Updating..." : autoDraft ? "⏹ Stop Auto-Drafting" : "▶ Start Auto-Drafting"}
      </button>

      {/* Refresh */}
      <button
        onClick={refresh}
        disabled={loading}
        style={{
          width: "100%", padding: "7px 0", border: "1px solid #e5e7eb",
          borderRadius: 8, background: "#f9fafb", color: "#374151",
          fontSize: 12, cursor: "pointer",
        }}>
        🔄 Refresh Status
      </button>

      {/* Error */}
      {error && (
        <div style={{ padding: "7px 10px", background: "#fef2f2", color: "#dc2626", borderRadius: 6, fontSize: 12 }}>
          ⚠️ {error}
        </div>
      )}

      {/* Info note */}
      <div style={{ fontSize: 11, color: "#9ca3af", lineHeight: 1.5 }}>
        💡 <strong>AI Reply</strong> button inside Gmail always works — independent of this toggle.
      </div>

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 12, left: "50%", transform: "translateX(-50%)",
          background: toast.ok ? "#16a34a" : "#dc2626", color: "#fff",
          padding: "7px 16px", borderRadius: 6, fontSize: 13, fontWeight: 500,
          whiteSpace: "nowrap", zIndex: 9999,
        }}>
          {toast.msg}
        </div>
      )}
    </div>
  )
}

// ── Reusable status row ────────────────────────────────────────
function StatusRow({ label, value, color, bg }: { label: string; value: string; color: string; bg: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
      <span style={{ fontSize: 13, color: "#374151" }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 500, padding: "2px 8px", borderRadius: 999, color, background: bg }}>
        {value}
      </span>
    </div>
  )
}
