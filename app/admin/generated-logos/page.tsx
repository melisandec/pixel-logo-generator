"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";

type Entry = {
  id: string;
  text: string;
  seed: number;
  username?: string | null;
  displayName?: string | null;
  rarity?: string | null;
  logoImageUrl?: string | null;
  cardImageUrl?: string | null;
  imageUrl?: string | null;
  createdAt: string;
  casted?: boolean;
  castUrl?: string | null;
  likes?: number;
  recasts?: number;
  pfpUrl?: string | null;
};

const RARITY_COLORS = {
  LEGENDARY: '#FFD700',
  EPIC: '#9933FF',
  RARE: '#3366FF',
  COMMON: '#00FF00',
};

export default function AdminGeneratedLogos() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'gallery'>('table');
  const [filterUsername, setFilterUsername] = useState("");
  const [filterRarity, setFilterRarity] = useState("");
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'rarest'>('newest');
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [editData, setEditData] = useState<Partial<Entry>>({});

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/generated-logos?sort=recent&limit=500`);
      const data = await res.json();
      setEntries(data.entries || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const filteredEntries = useMemo(() => {
    let filtered = [...entries];

    if (filterUsername) {
      filtered = filtered.filter((e) =>
        (e.username || "").toLowerCase().includes(filterUsername.toLowerCase())
      );
    }

    if (filterRarity) {
      filtered = filtered.filter((e) => e.rarity === filterRarity);
    }

    // Sort
    if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sortBy === 'rarest') {
      const rarityOrder = { LEGENDARY: 0, EPIC: 1, RARE: 2, COMMON: 3 };
      filtered.sort((a, b) => {
        const aOrder = rarityOrder[a.rarity as keyof typeof rarityOrder] ?? 999;
        const bOrder = rarityOrder[b.rarity as keyof typeof rarityOrder] ?? 999;
        return aOrder - bOrder;
      });
    }

    return filtered;
  }, [entries, filterUsername, filterRarity, sortBy]);

  const stats = useMemo(() => {
    const totalEntries = entries.length;
    const uniqueUsers = new Set(entries.map((e) => e.username)).size;
    const rarityCount = {
      LEGENDARY: entries.filter((e) => e.rarity === 'LEGENDARY').length,
      EPIC: entries.filter((e) => e.rarity === 'EPIC').length,
      RARE: entries.filter((e) => e.rarity === 'RARE').length,
      COMMON: entries.filter((e) => e.rarity === 'COMMON').length,
      UNKNOWN: entries.filter((e) => !e.rarity).length,
    };
    const castedCount = entries.filter((e) => e.castUrl).length;
    const totalLikes = entries.reduce((sum, e) => sum + (e.likes || 0), 0);

    return {
      totalEntries,
      uniqueUsers,
      rarityCount,
      castedCount,
      totalLikes,
      avgLikesPerEntry: (totalLikes / totalEntries).toFixed(1),
    };
  }, [entries]);

  async function remove(id: string) {
    if (!confirm("Delete this entry? This cannot be undone.")) return;
    await fetch(`/api/generated-logos?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    setEntries((s) => s.filter((e) => e.id !== id));
    setSelectedEntry(null);
  }

  async function updateEntry(id: string, updates: Partial<Entry>) {
    try {
      const res = await fetch(`/api/generated-logos`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updates }),
      });
      
      if (!res.ok) {
        const error = await res.json();
        alert(`Failed to update: ${error.error || 'Unknown error'}`);
        return;
      }
      
      const data = await res.json();
      setEntries((s) => s.map((e) => (e.id === id ? { ...e, ...updates } : e)));
      setSelectedEntry((s) => (s?.id === id ? { ...s, ...updates } : s));
      setEditingEntry(null);
      alert('✅ Entry updated successfully!');
    } catch (e) {
      console.error(e);
      alert(`Error: ${e instanceof Error ? e.message : 'Failed to update entry'}`);
    }
  }

  const downloadCSV = () => {
    const headers = ['ID', 'Username', 'Text', 'Seed', 'Rarity', 'Logo Image URL', 'Card Image URL', 'Created At', 'Likes', 'Recasts', 'Casted'];
    const rows = filteredEntries.map((e) => [
      e.id,
      e.username || '',
      e.text || '',
      e.seed || '',
      e.rarity || 'UNKNOWN',
      e.logoImageUrl || '',
      e.cardImageUrl || '',
      new Date(e.createdAt).toISOString(),
      e.likes || 0,
      e.recasts || 0,
      e.casted ? 'Yes' : 'No',
    ]);

    const csv = [headers, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logos-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0a0e27", color: "#00ff00", fontFamily: "monospace", padding: 20 }}>
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 30 }}>
          <h1 style={{ fontSize: 28, marginBottom: 4, fontWeight: 'bold' }}>🎨 ADMIN DASHBOARD — Logo Gallery</h1>
          <p style={{ fontSize: 12, color: '#00aa00', margin: 0 }}>Monitor all generated logos, detect data issues, and manage gallery content</p>
        </div>

        {/* Stats Panel */}
        <div
          style={{
            backgroundColor: '#071026',
            border: '1px solid #00ff00',
            padding: 16,
            marginBottom: 20,
            borderRadius: 4,
            cursor: 'pointer',
          }}
          onClick={() => setShowStats(!showStats)}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h2 style={{ margin: 0, fontSize: 14 }}>📊 Database Statistics</h2>
            <span style={{ fontSize: 12 }}>{showStats ? '▼' : '▶'}</span>
          </div>

          {showStats && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12 }}>
              <div style={{ backgroundColor: '#0a0e27', padding: 12, border: '1px solid #00aa00' }}>
                <div style={{ fontSize: 10, color: '#00aa00', marginBottom: 4 }}>TOTAL ENTRIES</div>
                <div style={{ fontSize: 24, fontWeight: 'bold' }}>{stats.totalEntries}</div>
              </div>
              <div style={{ backgroundColor: '#0a0e27', padding: 12, border: '1px solid #00aa00' }}>
                <div style={{ fontSize: 10, color: '#00aa00', marginBottom: 4 }}>UNIQUE USERS</div>
                <div style={{ fontSize: 24, fontWeight: 'bold' }}>{stats.uniqueUsers}</div>
              </div>
              <div style={{ backgroundColor: '#0a0e27', padding: 12, border: '1px solid #FFD700' }}>
                <div style={{ fontSize: 10, color: '#FFD700', marginBottom: 4 }}>LEGENDARY 🌟</div>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#FFD700' }}>{stats.rarityCount.LEGENDARY}</div>
              </div>
              <div style={{ backgroundColor: '#0a0e27', padding: 12, border: '1px solid #9933FF' }}>
                <div style={{ fontSize: 10, color: '#9933FF', marginBottom: 4 }}>EPIC ✨</div>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#9933FF' }}>{stats.rarityCount.EPIC}</div>
              </div>
              <div style={{ backgroundColor: '#0a0e27', padding: 12, border: '1px solid #3366FF' }}>
                <div style={{ fontSize: 10, color: '#3366FF', marginBottom: 4 }}>RARE 💎</div>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#3366FF' }}>{stats.rarityCount.RARE}</div>
              </div>
              <div style={{ backgroundColor: '#0a0e27', padding: 12, border: '1px solid #00ff00' }}>
                <div style={{ fontSize: 10, color: '#00aa00', marginBottom: 4 }}>COMMON ✓</div>
                <div style={{ fontSize: 24, fontWeight: 'bold' }}>{stats.rarityCount.COMMON}</div>
              </div>
              <div style={{ backgroundColor: '#0a0e27', padding: 12, border: '1px solid #ff6600' }}>
                <div style={{ fontSize: 10, color: '#ff6600', marginBottom: 4 }}>UNKNOWN ⚠️</div>
                <div style={{ fontSize: 24, fontWeight: 'bold', color: '#ff6600' }}>{stats.rarityCount.UNKNOWN}</div>
              </div>
              <div style={{ backgroundColor: '#0a0e27', padding: 12, border: '1px solid #00aa00' }}>
                <div style={{ fontSize: 10, color: '#00aa00', marginBottom: 4 }}>CASTED 📢</div>
                <div style={{ fontSize: 24, fontWeight: 'bold' }}>{stats.castedCount}</div>
              </div>
              <div style={{ backgroundColor: '#0a0e27', padding: 12, border: '1px solid #00aa00' }}>
                <div style={{ fontSize: 10, color: '#00aa00', marginBottom: 4 }}>TOTAL LIKES ❤️</div>
                <div style={{ fontSize: 24, fontWeight: 'bold' }}>{stats.totalLikes}</div>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 20 }}>
          <input
            placeholder="Filter by username..."
            value={filterUsername}
            onChange={(e) => setFilterUsername(e.target.value)}
            style={{
              padding: 10,
              backgroundColor: '#071026',
              border: '1px solid #00ff00',
              color: '#00ff00',
              fontFamily: 'monospace',
              fontSize: 12,
            }}
          />

          <select
            value={filterRarity}
            onChange={(e) => setFilterRarity(e.target.value)}
            style={{
              padding: 10,
              backgroundColor: '#071026',
              border: '1px solid #00ff00',
              color: '#00ff00',
              fontFamily: 'monospace',
              fontSize: 12,
            }}
          >
            <option value="">All Rarities</option>
            <option value="LEGENDARY">LEGENDARY 🌟</option>
            <option value="EPIC">EPIC ✨</option>
            <option value="RARE">RARE 💎</option>
            <option value="COMMON">COMMON ✓</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            style={{
              padding: 10,
              backgroundColor: '#071026',
              border: '1px solid #00ff00',
              color: '#00ff00',
              fontFamily: 'monospace',
              fontSize: 12,
            }}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="rarest">Rarest First</option>
          </select>
        </div>

        {/* View Mode & Actions */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
          <button
            onClick={() => setViewMode('table')}
            style={{
              padding: '8px 12px',
              backgroundColor: viewMode === 'table' ? '#00ff00' : '#071026',
              color: viewMode === 'table' ? '#0a0e27' : '#00ff00',
              border: '1px solid #00ff00',
              fontFamily: 'monospace',
              cursor: 'pointer',
              fontWeight: viewMode === 'table' ? 'bold' : 'normal',
            }}
          >
            📋 Table View
          </button>

          <button
            onClick={() => setViewMode('gallery')}
            style={{
              padding: '8px 12px',
              backgroundColor: viewMode === 'gallery' ? '#00ff00' : '#071026',
              color: viewMode === 'gallery' ? '#0a0e27' : '#00ff00',
              border: '1px solid #00ff00',
              fontFamily: 'monospace',
              cursor: 'pointer',
              fontWeight: viewMode === 'gallery' ? 'bold' : 'normal',
            }}
          >
            🎨 Gallery View
          </button>

          <button
            onClick={load}
            style={{
              padding: '8px 12px',
              backgroundColor: '#071026',
              color: '#00ff00',
              border: '1px solid #00ff00',
              fontFamily: 'monospace',
              cursor: 'pointer',
            }}
          >
            🔄 Refresh
          </button>

          <button
            onClick={downloadCSV}
            style={{
              padding: '8px 12px',
              backgroundColor: '#071026',
              color: '#00ff00',
              border: '1px solid #00ff00',
              fontFamily: 'monospace',
              cursor: 'pointer',
              marginLeft: 'auto',
            }}
          >
            📥 Export CSV
          </button>
        </div>

        {/* Content */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#00aa00' }}>
            Loading entries... ⏳
          </div>
        ) : viewMode === 'table' ? (
          // Table View
          <div style={{ overflowX: 'auto', marginBottom: 40 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ backgroundColor: '#071026', borderBottom: '2px solid #00ff00' }}>
                  <th style={{ padding: 10, textAlign: 'left', borderRight: '1px solid #00aa00' }}>Username</th>
                  <th style={{ padding: 10, textAlign: 'left', borderRight: '1px solid #00aa00' }}>Logo Text</th>
                  <th style={{ padding: 10, textAlign: 'left', borderRight: '1px solid #00aa00' }}>Seed</th>
                  <th style={{ padding: 10, textAlign: 'center', borderRight: '1px solid #00aa00', width: 80 }}>Rarity</th>
                  <th style={{ padding: 10, textAlign: 'center', borderRight: '1px solid #00aa00', width: 60 }}>Likes</th>
                  <th style={{ padding: 10, textAlign: 'left', borderRight: '1px solid #00aa00' }}>Created</th>
                  <th style={{ padding: 10, textAlign: 'center' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map((e) => (
                  <tr
                    key={e.id}
                    style={{
                      borderBottom: '1px solid #00aa00',
                      backgroundColor: '#0a0e27',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                    }}
                    onMouseEnter={(ev) => (ev.currentTarget.style.backgroundColor = '#071026')}
                    onMouseLeave={(ev) => (ev.currentTarget.style.backgroundColor = '#0a0e27')}
                  >
                    <td style={{ padding: 10, borderRight: '1px solid #00aa00' }}>
                      <span style={{ fontWeight: 'bold' }}>{e.username || '—'}</span>
                    </td>
                    <td style={{ padding: 10, borderRight: '1px solid #00aa00' }}>&quot;{e.text}&quot;</td>
                    <td style={{ padding: 10, borderRight: '1px solid #00aa00', fontFamily: 'monospace', fontSize: 11 }}>
                      {e.seed}
                    </td>
                    <td
                      style={{
                        padding: 10,
                        borderRight: '1px solid #00aa00',
                        textAlign: 'center',
                        color: RARITY_COLORS[e.rarity as keyof typeof RARITY_COLORS] || '#ff6600',
                        fontWeight: 'bold',
                      }}
                    >
                      {e.rarity || '⚠️ UNKNOWN'}
                    </td>
                    <td style={{ padding: 10, borderRight: '1px solid #00aa00', textAlign: 'center' }}>
                      ❤️ {e.likes || 0}
                    </td>
                    <td style={{ padding: 10, borderRight: '1px solid #00aa00', fontSize: 11, color: '#00aa00' }}>
                      {new Date(e.createdAt).toLocaleDateString()} {new Date(e.createdAt).toLocaleTimeString()}
                    </td>
                    <td style={{ padding: 10, textAlign: 'center' }}>
                      <button
                        onClick={() => setSelectedEntry(e)}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: '#071026',
                          color: '#00ff00',
                          border: '1px solid #00ff00',
                          fontFamily: 'monospace',
                          fontSize: 11,
                          cursor: 'pointer',
                        }}
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          // Gallery View
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 16, marginBottom: 40 }}>
            {filteredEntries.map((e) => (
              <div
                key={e.id}
                onClick={() => setSelectedEntry(e)}
                style={{
                  backgroundColor: '#071026',
                  border: '2px solid #00aa00',
                  padding: 12,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  borderRadius: 4,
                }}
                onMouseEnter={(ev) => {
                  ev.currentTarget.style.borderColor = '#00ff00';
                  ev.currentTarget.style.boxShadow = '0 0 12px #00ff00';
                }}
                onMouseLeave={(ev) => {
                  ev.currentTarget.style.borderColor = '#00aa00';
                  ev.currentTarget.style.boxShadow = 'none';
                }}
              >
                {/* Logo Image */}
                {e.logoImageUrl || e.cardImageUrl || e.imageUrl ? (
                  <div style={{ marginBottom: 12, position: 'relative', aspectRatio: '1', backgroundColor: '#0a0e27', borderRadius: 4, overflow: 'hidden' }}>
                    <Image
                      src={e.logoImageUrl || e.cardImageUrl || e.imageUrl || ''}
                      alt={e.text}
                      fill
                      style={{ objectFit: 'cover' }}
                    />
                  </div>
                ) : (
                  <div style={{ marginBottom: 12, aspectRatio: '1', backgroundColor: '#0a0e27', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00aa00', fontSize: 12 }}>
                    No Image
                  </div>
                )}

                {/* Text */}
                <div style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 8, color: '#00ff00', wordBreak: 'break-word' }}>&quot;{e.text}&quot;</div>

                {/* User Info */}
                <div style={{ fontSize: 11, color: '#00aa00', marginBottom: 8 }}>
                  {e.username || '—'} {e.displayName && e.displayName !== e.username ? `(${e.displayName})` : ''}
                </div>

                {/* Seed */}
                <div style={{ fontSize: 10, color: '#00aa00', fontFamily: 'monospace', marginBottom: 8, wordBreak: 'break-all' }}>
                  🎲 {e.seed}
                </div>

                {/* Rarity Badge */}
                <div style={{ marginBottom: 8 }}>
                  <span
                    style={{
                      display: 'inline-block',
                      backgroundColor: RARITY_COLORS[e.rarity as keyof typeof RARITY_COLORS] || '#ff6600',
                      color: '#0a0e27',
                      padding: '4px 8px',
                      borderRadius: 3,
                      fontSize: 11,
                      fontWeight: 'bold',
                    }}
                  >
                    {e.rarity || '⚠️ UNKNOWN'}
                  </span>
                </div>

                {/* Stats */}
                <div style={{ fontSize: 10, color: '#00aa00', display: 'flex', gap: 8, justifyContent: 'space-between', borderTop: '1px solid #00aa00', paddingTop: 8 }}>
                  <span>❤️ {e.likes || 0}</span>
                  <span>📢 {e.recasts || 0}</span>
                  <span>{e.casted ? '✅ Casted' : '⏳ Pending'}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Detail Modal */}
        {selectedEntry && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}
            onClick={() => setSelectedEntry(null)}
          >
            <div
              style={{
                backgroundColor: '#071026',
                border: '2px solid #00ff00',
                padding: 24,
                borderRadius: 4,
                maxWidth: 600,
                maxHeight: '90vh',
                overflowY: 'auto',
                color: '#00ff00',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h2 style={{ margin: 0, fontSize: 18 }}>📋 Logo Details</h2>
                <button
                  onClick={() => setSelectedEntry(null)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#00ff00',
                    fontSize: 20,
                    cursor: 'pointer',
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Logo Preview */}
              {selectedEntry.logoImageUrl || selectedEntry.cardImageUrl || selectedEntry.imageUrl ? (
                <div style={{ marginBottom: 16, backgroundColor: '#0a0e27', padding: 12, borderRadius: 4, border: '1px solid #00aa00', position: 'relative', aspectRatio: '1' }}>
                  <Image
                    src={selectedEntry.logoImageUrl || selectedEntry.cardImageUrl || selectedEntry.imageUrl || ''}
                    alt={selectedEntry.text}
                    fill
                    style={{ borderRadius: 4 }}
                  />
                </div>
              ) : null}

              <div style={{ display: 'grid', gap: 12 }}>
                <div>
                  <div style={{ fontSize: 10, color: '#00aa00', marginBottom: 4 }}>ID</div>
                  <div style={{ fontSize: 11, fontFamily: 'monospace', color: '#00ff00', wordBreak: 'break-all' }}>{selectedEntry.id}</div>
                </div>

                <div>
                  <div style={{ fontSize: 10, color: '#00aa00', marginBottom: 4 }}>TEXT</div>
                  <div style={{ fontSize: 14, fontWeight: 'bold' }}>&quot;{selectedEntry.text}&quot;</div>
                </div>

                <div>
                  <div style={{ fontSize: 10, color: '#00aa00', marginBottom: 4 }}>SEED</div>
                  <div style={{ fontSize: 12, fontFamily: 'monospace' }}>{selectedEntry.seed}</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 10, color: '#00aa00', marginBottom: 4 }}>USERNAME</div>
                    <div style={{ fontSize: 12, fontWeight: 'bold' }}>{selectedEntry.username || '—'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: '#00aa00', marginBottom: 4 }}>RARITY</div>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: 'bold',
                        color: RARITY_COLORS[selectedEntry.rarity as keyof typeof RARITY_COLORS] || '#ff6600',
                      }}
                    >
                      {selectedEntry.rarity || '⚠️ UNKNOWN'}
                    </div>
                  </div>
                </div>

                <div>
                  <div style={{ fontSize: 10, color: '#00aa00', marginBottom: 4 }}>DISPLAY NAME</div>
                  <div style={{ fontSize: 12 }}>{selectedEntry.displayName || '—'}</div>
                </div>

                <div>
                  <div style={{ fontSize: 10, color: '#00aa00', marginBottom: 4 }}>CREATED</div>
                  <div style={{ fontSize: 12 }}>{new Date(selectedEntry.createdAt).toLocaleString()}</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
                  <div>
                    <div style={{ fontSize: 10, color: '#00aa00', marginBottom: 4 }}>LIKES</div>
                    <div style={{ fontSize: 14, fontWeight: 'bold' }}>❤️ {selectedEntry.likes || 0}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: '#00aa00', marginBottom: 4 }}>RECASTS</div>
                    <div style={{ fontSize: 14, fontWeight: 'bold' }}>📢 {selectedEntry.recasts || 0}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 10, color: '#00aa00', marginBottom: 4 }}>STATUS</div>
                    <div style={{ fontSize: 12, fontWeight: 'bold' }}>{selectedEntry.casted ? '✅ Casted' : '⏳ Pending'}</div>
                  </div>
                </div>

                {selectedEntry.logoImageUrl && (
                  <div>
                    <div style={{ fontSize: 10, color: '#00aa00', marginBottom: 4 }}>LOGO IMAGE URL</div>
                    <a href={selectedEntry.logoImageUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: '#3366FF', wordBreak: 'break-all', textDecoration: 'underline' }}>
                      {selectedEntry.logoImageUrl.substring(0, 60)}...
                    </a>
                  </div>
                )}

                {selectedEntry.cardImageUrl && (
                  <div>
                    <div style={{ fontSize: 10, color: '#00aa00', marginBottom: 4 }}>CARD IMAGE URL</div>
                    <a href={selectedEntry.cardImageUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: '#3366FF', wordBreak: 'break-all', textDecoration: 'underline' }}>
                      {selectedEntry.cardImageUrl.substring(0, 60)}...
                    </a>
                  </div>
                )}

                {selectedEntry.castUrl && (
                  <div>
                    <div style={{ fontSize: 10, color: '#00aa00', marginBottom: 4 }}>CAST URL</div>
                    <a href={selectedEntry.castUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: '#3366FF', wordBreak: 'break-all', textDecoration: 'underline' }}>
                      {selectedEntry.castUrl.substring(0, 60)}...
                    </a>
                  </div>
                )}

                <div style={{ borderTop: '1px solid #00aa00', paddingTop: 12, display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => {
                      setEditingEntry(selectedEntry);
                      setEditData(selectedEntry);
                    }}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      backgroundColor: '#0066cc',
                      color: '#fff',
                      border: '1px solid #00aaff',
                      fontFamily: 'monospace',
                      cursor: 'pointer',
                      borderRadius: 3,
                    }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => remove(selectedEntry.id)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      backgroundColor: '#cc0000',
                      color: '#fff',
                      border: '1px solid #ff0000',
                      fontFamily: 'monospace',
                      cursor: 'pointer',
                      borderRadius: 3,
                    }}
                  >
                    🗑️ Delete
                  </button>
                  <button
                    onClick={() => setSelectedEntry(null)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      backgroundColor: '#071026',
                      color: '#00ff00',
                      border: '1px solid #00ff00',
                      fontFamily: 'monospace',
                      cursor: 'pointer',
                      borderRadius: 3,
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {editingEntry && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2000,
            }}
            onClick={() => setEditingEntry(null)}
          >
            <div
              style={{
                backgroundColor: '#071026',
                border: '2px solid #00aaff',
                padding: 24,
                borderRadius: 4,
                maxWidth: 500,
                color: '#00ff00',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{ margin: 0, fontSize: 18, marginBottom: 16 }}>✏️ Edit Logo Entry</h2>

              <div style={{ display: 'grid', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 10, color: '#00aa00', display: 'block', marginBottom: 4 }}>TEXT</label>
                  <input
                    type="text"
                    value={editData.text || ''}
                    onChange={(e) => setEditData((s) => ({ ...s, text: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      backgroundColor: '#0a0e27',
                      border: '1px solid #00aa00',
                      color: '#00ff00',
                      fontFamily: 'monospace',
                      borderRadius: 3,
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 10, color: '#00aa00', display: 'block', marginBottom: 4 }}>RARITY</label>
                  <select
                    value={editData.rarity || ''}
                    onChange={(e) => setEditData((s) => ({ ...s, rarity: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      backgroundColor: '#0a0e27',
                      border: '1px solid #00aa00',
                      color: '#00ff00',
                      fontFamily: 'monospace',
                      borderRadius: 3,
                      boxSizing: 'border-box',
                    }}
                  >
                    <option value="">—</option>
                    <option value="LEGENDARY">LEGENDARY</option>
                    <option value="EPIC">EPIC</option>
                    <option value="RARE">RARE</option>
                    <option value="COMMON">COMMON</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: 10, color: '#00aa00', display: 'block', marginBottom: 4 }}>CAST URL</label>
                  <input
                    type="text"
                    value={editData.castUrl || ''}
                    onChange={(e) => setEditData((s) => ({ ...s, castUrl: e.target.value }))}
                    placeholder="https://warpcast.com/..."
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      backgroundColor: '#0a0e27',
                      border: '1px solid #00aa00',
                      color: '#00ff00',
                      fontFamily: 'monospace',
                      fontSize: 11,
                      borderRadius: 3,
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div>
                  <label style={{ fontSize: 10, color: '#00aa00', display: 'block', marginBottom: 4 }}>LOGO IMAGE URL</label>
                  <input
                    type="text"
                    value={editData.logoImageUrl || ''}
                    onChange={(e) => setEditData((s) => ({ ...s, logoImageUrl: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      backgroundColor: '#0a0e27',
                      border: '1px solid #00aa00',
                      color: '#00ff00',
                      fontFamily: 'monospace',
                      fontSize: 11,
                      borderRadius: 3,
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                  <button
                    onClick={() => updateEntry(editingEntry.id, editData)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      backgroundColor: '#00aa00',
                      color: '#0a0e27',
                      border: '1px solid #00ff00',
                      fontFamily: 'monospace',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      borderRadius: 3,
                    }}
                  >
                    💾 Save
                  </button>
                  <button
                    onClick={() => setEditingEntry(null)}
                    style={{
                      flex: 1,
                      padding: '8px 12px',
                      backgroundColor: '#071026',
                      color: '#00ff00',
                      border: '1px solid #00ff00',
                      fontFamily: 'monospace',
                      cursor: 'pointer',
                      borderRadius: 3,
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
