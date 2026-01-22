"use client";

import { useEffect, useState } from "react";

type Entry = {
  id: string;
  text: string;
  username?: string | null;
  createdAt: string;
  casted?: boolean;
  castUrl?: string | null;
};

export default function AdminGeneratedLogos() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Entry | null>(null);
  const [newText, setNewText] = useState("");
  const [newUsername, setNewUsername] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const res = await fetch(`/api/generated-logos?sort=recent&limit=200`);
      const data = await res.json();
      setEntries(data.entries || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this entry?")) return;
    await fetch(`/api/generated-logos?id=${encodeURIComponent(id)}`, { method: "DELETE" });
    setEntries((s) => s.filter((e) => e.id !== id));
  }

  async function saveEdit() {
    if (!editing) return;
    await fetch(`/api/generated-logos`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editing.id, text: editing.text, casted: editing.casted }),
    });
    setEditing(null);
    load();
  }

  async function addNew() {
    if (!newText) return alert('Text required');
    const payload = { text: newText, username: newUsername || null };
    await fetch(`/api/generated-logos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setNewText("");
    setNewUsername("");
    load();
  }

  return (
    <div style={{ minHeight: "100vh", backgroundColor: "#0a0e27", color: "#00ff00", fontFamily: "monospace", padding: 16 }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <h1 style={{ fontSize: 20, marginBottom: 12 }}>ADMIN — Generated Logos</h1>

        <div style={{ marginBottom: 12, display: 'flex', gap: 8 }}>
          <input placeholder="Text" value={newText} onChange={(e) => setNewText(e.target.value)} style={{ flex: 1, padding: 8 }} />
          <input placeholder="Username" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} style={{ width: 160, padding: 8 }} />
          <button onClick={addNew} style={{ padding: '8px 12px' }}>Add</button>
          <button onClick={load} style={{ padding: '8px 12px', marginLeft: 'auto' }}>Refresh</button>
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : (
          <div style={{ display: 'grid', gap: 10 }}>
            {entries.map((e) => (
              <div key={e.id} style={{ border: '1px solid #00ff00', padding: 10, display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 'bold' }}>{e.text}</div>
                  <div style={{ fontSize: 11, color: '#00aa00' }}>{e.username || '—'} · {new Date(e.createdAt).toLocaleString()}</div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => setEditing(e)} style={{ padding: '6px 8px' }}>Edit</button>
                  <button onClick={() => remove(e.id)} style={{ padding: '6px 8px' }}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}

        {editing && (
          <div style={{ position: 'fixed', left: 20, right: 20, bottom: 20, backgroundColor: '#071026', border: '1px solid #00ff00', padding: 12 }}>
            <div style={{ display: 'flex', gap: 8 }}>
              <input style={{ flex: 1, padding: 8 }} value={editing.text} onChange={(ev) => setEditing({ ...editing, text: ev.target.value })} />
              <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input type="checkbox" checked={!!editing.casted} onChange={(ev) => setEditing({ ...editing, casted: ev.target.checked })} /> Casted
              </label>
              <button onClick={saveEdit} style={{ padding: '8px 12px' }}>Save</button>
              <button onClick={() => setEditing(null)} style={{ padding: '8px 12px' }}>Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
