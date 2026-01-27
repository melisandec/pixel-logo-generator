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
  updatedAt?: string | null;
  casted?: boolean;
  castUrl?: string | null;
  likes?: number;
  recasts?: number;
  pfpUrl?: string | null;
};

const RARITY_COLORS = {
  LEGENDARY: "#FFD700",
  EPIC: "#9933FF",
  RARE: "#3366FF",
  COMMON: "#00FF00",
};

export default function AdminGeneratedLogos() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"table" | "gallery">("table");
  const [filterUsername, setFilterUsername] = useState("");
  const [filterRarity, setFilterRarity] = useState("");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "rarest">(
    "newest",
  );
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null);
  const [showStats, setShowStats] = useState(false);
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);
  const [editData, setEditData] = useState<Partial<Entry>>({});

  // Advanced filtering
  const [searchSeed, setSearchSeed] = useState("");
  const [searchText, setSearchText] = useState("");
  const [filterCasted, setFilterCasted] = useState<
    "all" | "casted" | "pending"
  >("all");
  const [minLikes, setMinLikes] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // Bulk actions
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkRarityUpdate, setBulkRarityUpdate] = useState("");

  // User insights
  const [userInsightsOpen, setUserInsightsOpen] = useState(false);
  const [insightsUsername, setInsightsUsername] = useState("");

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  // Analytics & Completeness
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [showCompleteness, setShowCompleteness] = useState(false);
  const [showDuplicates, setShowDuplicates] = useState(false);

  // Audit trail
  const [showAuditTrail, setShowAuditTrail] = useState(false);

  // Generate card image & edit casted
  const [generatingCardId, setGeneratingCardId] = useState<string | null>(null);
  const [editingCastedId, setEditingCastedId] = useState<string | null>(null);
  const [editingCastedValue, setEditingCastedValue] = useState(false);
  const [editingCastUrl, setEditingCastUrl] = useState("");

  // Blob audit
  const [showBlobAudit, setShowBlobAudit] = useState(false);
  const [blobAuditData, setBlobAuditData] = useState<any>(null);
  const [loadingBlobAudit, setLoadingBlobAudit] = useState(false);

  // Create new entry
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createText, setCreateText] = useState("");
  const [createUsername, setCreateUsername] = useState("");
  const [createSeed, setCreateSeed] = useState("");
  const [generatedLogoPreview, setGeneratedLogoPreview] = useState<any>(null);
  const [creatingEntry, setCreatingEntry] = useState(false);

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

    // Basic filters
    if (filterUsername) {
      filtered = filtered.filter((e) =>
        (e.username || "").toLowerCase().includes(filterUsername.toLowerCase()),
      );
    }

    if (filterRarity) {
      filtered = filtered.filter((e) => e.rarity === filterRarity);
    }

    // Advanced filters
    if (searchSeed) {
      filtered = filtered.filter((e) => e.seed.toString().includes(searchSeed));
    }

    if (searchText) {
      filtered = filtered.filter((e) =>
        (e.text || "").toLowerCase().includes(searchText.toLowerCase()),
      );
    }

    if (filterCasted === "casted") {
      filtered = filtered.filter((e) => e.casted);
    } else if (filterCasted === "pending") {
      filtered = filtered.filter((e) => !e.casted);
    }

    if (minLikes) {
      const min = parseInt(minLikes, 10);
      filtered = filtered.filter((e) => (e.likes || 0) >= min);
    }

    if (startDate) {
      const start = new Date(startDate).getTime();
      filtered = filtered.filter(
        (e) => new Date(e.createdAt).getTime() >= start,
      );
    }

    if (endDate) {
      const end = new Date(endDate).getTime();
      filtered = filtered.filter((e) => new Date(e.createdAt).getTime() <= end);
    }

    // Sort
    if (sortBy === "newest") {
      filtered.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      );
    } else if (sortBy === "oldest") {
      filtered.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
      );
    } else if (sortBy === "rarest") {
      const rarityOrder = { LEGENDARY: 0, EPIC: 1, RARE: 2, COMMON: 3 };
      filtered.sort((a, b) => {
        const aOrder = rarityOrder[a.rarity as keyof typeof rarityOrder] ?? 999;
        const bOrder = rarityOrder[b.rarity as keyof typeof rarityOrder] ?? 999;
        return aOrder - bOrder;
      });
    }

    return filtered;
  }, [
    entries,
    filterUsername,
    filterRarity,
    sortBy,
    searchSeed,
    searchText,
    filterCasted,
    minLikes,
    startDate,
    endDate,
  ]);

  // Pagination
  const paginatedEntries = useMemo(() => {
    setCurrentPage(1);
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredEntries.slice(start, end);
  }, [filteredEntries, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredEntries.length / itemsPerPage);

  const stats = useMemo(() => {
    const totalEntries = entries.length;
    const uniqueUsers = new Set(entries.map((e) => e.username)).size;
    const rarityCount = {
      LEGENDARY: entries.filter((e) => e.rarity === "LEGENDARY").length,
      EPIC: entries.filter((e) => e.rarity === "EPIC").length,
      RARE: entries.filter((e) => e.rarity === "RARE").length,
      COMMON: entries.filter((e) => e.rarity === "COMMON").length,
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
    await fetch(`/api/generated-logos?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
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
        alert(`Failed to update: ${error.error || "Unknown error"}`);
        return;
      }

      const data = await res.json();
      setEntries((s) => s.map((e) => (e.id === id ? { ...e, ...updates } : e)));
      setSelectedEntry((s) => (s?.id === id ? { ...s, ...updates } : s));
      setEditingEntry(null);
      alert("✅ Entry updated successfully!");
    } catch (e) {
      console.error(e);
      alert(
        `Error: ${e instanceof Error ? e.message : "Failed to update entry"}`,
      );
    }
  }

  async function generateCardImage(entry: Entry) {
    if (!entry.logoImageUrl && !entry.imageUrl) {
      alert("❌ Cannot generate card: No logo image URL found");
      return;
    }

    setGeneratingCardId(entry.id);
    try {
      const logoUrl = entry.logoImageUrl || entry.imageUrl;
      await updateEntry(entry.id, {
        cardImageUrl: logoUrl,
      });
      alert("✅ Card image generated!");
    } catch (error) {
      console.error("Error generating card:", error);
      alert("❌ Failed to generate card image");
    } finally {
      setGeneratingCardId(null);
    }
  }

  async function updateCastedStatus(
    id: string,
    casted: boolean,
    castUrl: string,
  ) {
    if (casted && !castUrl.trim()) {
      alert("⚠️ Cannot mark as casted without a cast URL");
      return;
    }

    try {
      const updates: any = { casted };
      if (castUrl.trim()) {
        updates.castUrl = castUrl;
      }

      await updateEntry(id, updates);

      if (casted) {
        alert("✅ Marked as casted!");
      } else {
        alert("✅ Status updated to pending!");
      }

      setEditingCastedId(null);
      setEditingCastedValue(false);
      setEditingCastUrl("");
    } catch (error) {
      console.error("Error updating casted status:", error);
      alert("❌ Failed to update status");
    }
  }

  async function loadBlobAudit() {
    setLoadingBlobAudit(true);
    try {
      const res = await fetch(`/api/admin/blob-audit`);
      if (!res.ok) throw new Error("Failed to load blob audit");
      const data = await res.json();
      setBlobAuditData(data);
    } catch (error) {
      console.error("Error loading blob audit:", error);
      alert("❌ Failed to load blob audit data");
    } finally {
      setLoadingBlobAudit(false);
    }
  }

  async function generatePreviewLogo() {
    if (!createText.trim()) {
      alert("⚠️ Please enter text for the logo");
      return;
    }

    try {
      const { generateLogo } = await import("@/lib/logoGenerator");
      const seed = createSeed ? parseInt(createSeed, 10) : undefined;
      const result = generateLogo({
        text: createText,
        seed,
      });

      setGeneratedLogoPreview(result);
    } catch (error) {
      console.error("Error generating logo:", error);
      alert("❌ Failed to generate logo preview");
    }
  }

  async function createNewEntry() {
    if (!createText.trim()) {
      alert("⚠️ Please enter text for the logo");
      return;
    }

    if (!generatedLogoPreview) {
      alert("⚠️ Please generate a preview first");
      return;
    }

    setCreatingEntry(true);
    try {
      const dataUrl = generatedLogoPreview.dataUrl;
      const seed = generatedLogoPreview.seed;

      // Upload to blob
      const uploadRes = await fetch("/api/logo-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dataUrl }),
      });

      if (!uploadRes.ok) throw new Error("Failed to upload image");
      const uploadData = await uploadRes.json();

      // Create database entry
      const createRes = await fetch("/api/generated-logos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: createText,
          seed,
          rarity: generatedLogoPreview.rarity,
          username: createUsername || "admin-created",
          logoImageUrl: uploadData.logoImageUrl,
          imageUrl: uploadData.logoImageUrl,
          casted: false,
        }),
      });

      if (!createRes.ok) throw new Error("Failed to create entry");
      const newEntry = await createRes.json();

      setEntries((s) => [newEntry.entry || newEntry, ...s]);
      alert(`✅ Entry created successfully! Seed: ${seed}`);
      setShowCreateModal(false);
      setCreateText("");
      setCreateUsername("");
      setCreateSeed("");
      setGeneratedLogoPreview(null);
    } catch (error) {
      console.error("Error creating entry:", error);
      alert(
        `❌ Failed to create entry: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setCreatingEntry(false);
    }
  }

  // Data quality indicators
  function getDataQualityIssues(entry: Entry) {
    const issues: string[] = [];
    if (!entry.logoImageUrl && !entry.cardImageUrl && !entry.imageUrl)
      issues.push("🖼️");
    if (!entry.rarity) issues.push("⚠️");
    if (!entry.castUrl) issues.push("🔗");
    if (!entry.casted) issues.push("⏱️");
    return issues;
  }

  // Bulk actions
  async function bulkDelete() {
    if (selectedIds.size === 0) return;
    if (!confirm(`Delete ${selectedIds.size} entries? Cannot be undone.`))
      return;

    for (const id of selectedIds) {
      await fetch(`/api/generated-logos?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
    }
    setEntries((s) => s.filter((e) => !selectedIds.has(e.id)));
    setSelectedIds(new Set());
    alert(`✅ Deleted ${selectedIds.size} entries`);
  }

  async function bulkUpdateRarity(newRarity: string) {
    if (selectedIds.size === 0 || !newRarity) return;
    if (
      !confirm(`Update rarity to ${newRarity} for ${selectedIds.size} entries?`)
    )
      return;

    for (const id of selectedIds) {
      await fetch(`/api/generated-logos`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, rarity: newRarity }),
      });
    }
    setEntries((s) =>
      s.map((e) => (selectedIds.has(e.id) ? { ...e, rarity: newRarity } : e)),
    );
    setSelectedIds(new Set());
    setBulkRarityUpdate("");
    alert(`✅ Updated ${selectedIds.size} entries to ${newRarity}`);
  }

  async function bulkMarkCasted() {
    if (selectedIds.size === 0) return;
    if (!confirm(`Mark ${selectedIds.size} entries as casted?`)) return;

    for (const id of selectedIds) {
      await fetch(`/api/generated-logos`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, casted: true }),
      });
    }
    setEntries((s) =>
      s.map((e) => (selectedIds.has(e.id) ? { ...e, casted: true } : e)),
    );
    setSelectedIds(new Set());
    alert(`✅ Marked ${selectedIds.size} entries as casted`);
  }

  // Engagement analytics
  const getTopLogos = () => {
    return [...entries]
      .map((e) => ({ ...e, engagement: (e.likes || 0) + (e.recasts || 0) }))
      .sort((a, b) => b.engagement - a.engagement)
      .slice(0, 10);
  };

  const getEngagementByRarity = () => {
    const rarityGroups: { [key: string]: number[] } = {
      LEGENDARY: [],
      EPIC: [],
      RARE: [],
      COMMON: [],
      UNKNOWN: [],
    };
    entries.forEach((e) => {
      const rarity = e.rarity || "UNKNOWN";
      rarityGroups[rarity].push((e.likes || 0) + (e.recasts || 0));
    });
    return Object.entries(rarityGroups).map(([rarity, engagements]) => ({
      rarity,
      count: engagements.length,
      avg:
        engagements.length > 0
          ? (engagements.reduce((a, b) => a + b) / engagements.length).toFixed(
              1,
            )
          : 0,
    }));
  };

  // Data completeness checker
  const getIncompleteEntries = () => {
    return entries.filter((e) => {
      const issues = getDataQualityIssues(e);
      return issues.length > 0;
    });
  };

  // Duplicate detection
  const getDuplicates = () => {
    const seedMap: { [key: number]: Entry[] } = {};
    const textSimilarity = (a: string, b: string) => {
      const aLower = a.toLowerCase();
      const bLower = b.toLowerCase();
      if (aLower === bLower) return 100;
      if (aLower.includes(bLower) || bLower.includes(aLower)) return 80;
      const aWords = new Set(aLower.split(/\s+/));
      const bWords = new Set(bLower.split(/\s+/));
      const common = [...aWords].filter((w) => bWords.has(w)).length;
      return Math.round((common / Math.max(aWords.size, bWords.size)) * 100);
    };

    // Find seed duplicates
    entries.forEach((e) => {
      const seedKey = Math.floor(e.seed / 100) * 100; // Group by 100
      if (!seedMap[seedKey]) seedMap[seedKey] = [];
      seedMap[seedKey].push(e);
    });

    const potentialDupes: Array<{
      entries: Entry[];
      type: string;
      similarity: number;
    }> = [];

    Object.values(seedMap).forEach((group) => {
      if (group.length > 1) {
        potentialDupes.push({
          entries: group,
          type: "seed_proximity",
          similarity: 95,
        });
      }
    });

    // Find similar text
    for (let i = 0; i < entries.length; i++) {
      for (let j = i + 1; j < entries.length; j++) {
        const similarity = textSimilarity(entries[i].text, entries[j].text);
        if (similarity > 70) {
          potentialDupes.push({
            entries: [entries[i], entries[j]],
            type: "similar_text",
            similarity,
          });
        }
      }
    }

    return potentialDupes.slice(0, 10); // Limit to 10 for performance
  };

  const getAuditTrail = () => {
    // Return entries sorted by updatedAt or createdAt, showing most recent edits first
    return [...entries]
      .filter((e) => e.updatedAt) // Only show entries that have been edited
      .sort((a, b) => {
        const dateA = new Date(a.updatedAt || 0).getTime();
        const dateB = new Date(b.updatedAt || 0).getTime();
        return dateB - dateA; // Most recent first
      })
      .slice(0, 20); // Show last 20 edits
  };

  const getTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
  };

  const downloadCSV = () => {
    const headers = [
      "ID",
      "Username",
      "Text",
      "Seed",
      "Rarity",
      "Logo Image URL",
      "Card Image URL",
      "Created At",
      "Likes",
      "Recasts",
      "Casted",
    ];
    const rows = filteredEntries.map((e) => [
      e.id,
      e.username || "",
      e.text || "",
      e.seed || "",
      e.rarity || "UNKNOWN",
      e.logoImageUrl || "",
      e.cardImageUrl || "",
      new Date(e.createdAt).toISOString(),
      e.likes || 0,
      e.recasts || 0,
      e.casted ? "Yes" : "No",
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `logos-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0a0e27",
        color: "#00ff00",
        fontFamily: "monospace",
        padding: 20,
      }}
    >
      <div style={{ maxWidth: 1400, margin: "0 auto" }}>
        {/* Header */}
        <div style={{ marginBottom: 30 }}>
          <h1 style={{ fontSize: 28, marginBottom: 4, fontWeight: "bold" }}>
            🎨 ADMIN DASHBOARD — Logo Gallery
          </h1>
          <p style={{ fontSize: 12, color: "#00aa00", margin: 0 }}>
            Monitor all generated logos, detect data issues, and manage gallery
            content
          </p>
        </div>

        {/* Stats Panel */}
        <div
          style={{
            backgroundColor: "#071026",
            border: "1px solid #00ff00",
            padding: 16,
            marginBottom: 20,
            borderRadius: 4,
            cursor: "pointer",
          }}
          onClick={() => setShowStats(!showStats)}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 12,
            }}
          >
            <h2 style={{ margin: 0, fontSize: 14 }}>📊 Database Statistics</h2>
            <span style={{ fontSize: 12 }}>{showStats ? "▼" : "▶"}</span>
          </div>

          {showStats && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 12,
              }}
            >
              <div
                style={{
                  backgroundColor: "#0a0e27",
                  padding: 12,
                  border: "1px solid #00aa00",
                }}
              >
                <div
                  style={{ fontSize: 10, color: "#00aa00", marginBottom: 4 }}
                >
                  TOTAL ENTRIES
                </div>
                <div style={{ fontSize: 24, fontWeight: "bold" }}>
                  {stats.totalEntries}
                </div>
              </div>
              <div
                style={{
                  backgroundColor: "#0a0e27",
                  padding: 12,
                  border: "1px solid #00aa00",
                }}
              >
                <div
                  style={{ fontSize: 10, color: "#00aa00", marginBottom: 4 }}
                >
                  UNIQUE USERS
                </div>
                <div style={{ fontSize: 24, fontWeight: "bold" }}>
                  {stats.uniqueUsers}
                </div>
              </div>
              <div
                style={{
                  backgroundColor: "#0a0e27",
                  padding: 12,
                  border: "1px solid #FFD700",
                }}
              >
                <div
                  style={{ fontSize: 10, color: "#FFD700", marginBottom: 4 }}
                >
                  LEGENDARY 🌟
                </div>
                <div
                  style={{ fontSize: 24, fontWeight: "bold", color: "#FFD700" }}
                >
                  {stats.rarityCount.LEGENDARY}
                </div>
              </div>
              <div
                style={{
                  backgroundColor: "#0a0e27",
                  padding: 12,
                  border: "1px solid #9933FF",
                }}
              >
                <div
                  style={{ fontSize: 10, color: "#9933FF", marginBottom: 4 }}
                >
                  EPIC ✨
                </div>
                <div
                  style={{ fontSize: 24, fontWeight: "bold", color: "#9933FF" }}
                >
                  {stats.rarityCount.EPIC}
                </div>
              </div>
              <div
                style={{
                  backgroundColor: "#0a0e27",
                  padding: 12,
                  border: "1px solid #3366FF",
                }}
              >
                <div
                  style={{ fontSize: 10, color: "#3366FF", marginBottom: 4 }}
                >
                  RARE 💎
                </div>
                <div
                  style={{ fontSize: 24, fontWeight: "bold", color: "#3366FF" }}
                >
                  {stats.rarityCount.RARE}
                </div>
              </div>
              <div
                style={{
                  backgroundColor: "#0a0e27",
                  padding: 12,
                  border: "1px solid #00ff00",
                }}
              >
                <div
                  style={{ fontSize: 10, color: "#00aa00", marginBottom: 4 }}
                >
                  COMMON ✓
                </div>
                <div style={{ fontSize: 24, fontWeight: "bold" }}>
                  {stats.rarityCount.COMMON}
                </div>
              </div>
              <div
                style={{
                  backgroundColor: "#0a0e27",
                  padding: 12,
                  border: "1px solid #ff6600",
                }}
              >
                <div
                  style={{ fontSize: 10, color: "#ff6600", marginBottom: 4 }}
                >
                  UNKNOWN ⚠️
                </div>
                <div
                  style={{ fontSize: 24, fontWeight: "bold", color: "#ff6600" }}
                >
                  {stats.rarityCount.UNKNOWN}
                </div>
              </div>
              <div
                style={{
                  backgroundColor: "#0a0e27",
                  padding: 12,
                  border: "1px solid #00aa00",
                }}
              >
                <div
                  style={{ fontSize: 10, color: "#00aa00", marginBottom: 4 }}
                >
                  CASTED 📢
                </div>
                <div style={{ fontSize: 24, fontWeight: "bold" }}>
                  {stats.castedCount}
                </div>
              </div>
              <div
                style={{
                  backgroundColor: "#0a0e27",
                  padding: 12,
                  border: "1px solid #00aa00",
                }}
              >
                <div
                  style={{ fontSize: 10, color: "#00aa00", marginBottom: 4 }}
                >
                  TOTAL LIKES ❤️
                </div>
                <div style={{ fontSize: 24, fontWeight: "bold" }}>
                  {stats.totalLikes}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Controls */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 12,
            marginBottom: 20,
          }}
        >
          <input
            placeholder="Filter by username..."
            value={filterUsername}
            onChange={(e) => setFilterUsername(e.target.value)}
            style={{
              padding: 10,
              backgroundColor: "#071026",
              border: "1px solid #00ff00",
              color: "#00ff00",
              fontFamily: "monospace",
              fontSize: 12,
            }}
          />

          <select
            value={filterRarity}
            onChange={(e) => setFilterRarity(e.target.value)}
            style={{
              padding: 10,
              backgroundColor: "#071026",
              border: "1px solid #00ff00",
              color: "#00ff00",
              fontFamily: "monospace",
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
              backgroundColor: "#071026",
              border: "1px solid #00ff00",
              color: "#00ff00",
              fontFamily: "monospace",
              fontSize: 12,
            }}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="rarest">Rarest First</option>
          </select>
        </div>

        {/* Advanced Filters */}
        <details
          style={{
            backgroundColor: "#071026",
            border: "1px solid #00aa00",
            padding: 12,
            marginBottom: 20,
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          <summary
            style={{ color: "#00ff00", fontWeight: "bold", marginBottom: 12 }}
          >
            🔍 Advanced Filters
          </summary>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
              gap: 12,
            }}
          >
            <input
              type="text"
              placeholder="Search by seed..."
              value={searchSeed}
              onChange={(e) => setSearchSeed(e.target.value)}
              style={{
                padding: 8,
                backgroundColor: "#0a0e27",
                border: "1px solid #00aa00",
                color: "#00ff00",
                fontFamily: "monospace",
                fontSize: 11,
              }}
            />
            <input
              type="text"
              placeholder="Search by text..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{
                padding: 8,
                backgroundColor: "#0a0e27",
                border: "1px solid #00aa00",
                color: "#00ff00",
                fontFamily: "monospace",
                fontSize: 11,
              }}
            />
            <select
              value={filterCasted}
              onChange={(e) => setFilterCasted(e.target.value as any)}
              style={{
                padding: 8,
                backgroundColor: "#0a0e27",
                border: "1px solid #00aa00",
                color: "#00ff00",
                fontFamily: "monospace",
                fontSize: 11,
              }}
            >
              <option value="all">All Status</option>
              <option value="casted">Casted Only</option>
              <option value="pending">Pending Only</option>
            </select>
            <input
              type="number"
              placeholder="Min likes..."
              value={minLikes}
              onChange={(e) => setMinLikes(e.target.value)}
              style={{
                padding: 8,
                backgroundColor: "#0a0e27",
                border: "1px solid #00aa00",
                color: "#00ff00",
                fontFamily: "monospace",
                fontSize: 11,
              }}
            />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{
                padding: 8,
                backgroundColor: "#0a0e27",
                border: "1px solid #00aa00",
                color: "#00ff00",
                fontFamily: "monospace",
                fontSize: 11,
              }}
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{
                padding: 8,
                backgroundColor: "#0a0e27",
                border: "1px solid #00aa00",
                color: "#00ff00",
                fontFamily: "monospace",
                fontSize: 11,
              }}
            />
            <button
              onClick={() => {
                setSearchSeed("");
                setSearchText("");
                setFilterCasted("all");
                setMinLikes("");
                setStartDate("");
                setEndDate("");
              }}
              style={{
                padding: 8,
                backgroundColor: "#0a0e27",
                border: "1px solid #ff6600",
                color: "#ff6600",
                fontFamily: "monospace",
                cursor: "pointer",
              }}
            >
              Clear Filters
            </button>
          </div>
        </details>

        {/* Bulk Actions */}
        {selectedIds.size > 0 && (
          <div
            style={{
              backgroundColor: "#1a0a0a",
              border: "2px solid #ff0000",
              padding: 12,
              marginBottom: 20,
              borderRadius: 4,
              display: "flex",
              gap: 12,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <span style={{ color: "#ff6600", fontWeight: "bold" }}>
              📌 {selectedIds.size} selected
            </span>
            <select
              value={bulkRarityUpdate}
              onChange={(e) => setBulkRarityUpdate(e.target.value)}
              style={{
                padding: 8,
                backgroundColor: "#0a0e27",
                border: "1px solid #00aa00",
                color: "#00ff00",
                fontFamily: "monospace",
                fontSize: 11,
              }}
            >
              <option value="">Update Rarity...</option>
              <option value="LEGENDARY">LEGENDARY</option>
              <option value="EPIC">EPIC</option>
              <option value="RARE">RARE</option>
              <option value="COMMON">COMMON</option>
            </select>
            <button
              onClick={() => bulkUpdateRarity(bulkRarityUpdate)}
              disabled={!bulkRarityUpdate}
              style={{
                padding: "8px 12px",
                backgroundColor: bulkRarityUpdate ? "#0066cc" : "#333",
                color: "#fff",
                border: "1px solid #00aaff",
                fontFamily: "monospace",
                cursor: bulkRarityUpdate ? "pointer" : "not-allowed",
              }}
            >
              Update Rarity
            </button>
            <button
              onClick={bulkMarkCasted}
              style={{
                padding: "8px 12px",
                backgroundColor: "#006600",
                color: "#00ff00",
                border: "1px solid #00ff00",
                fontFamily: "monospace",
                cursor: "pointer",
              }}
            >
              Mark Casted
            </button>
            <button
              onClick={bulkDelete}
              style={{
                padding: "8px 12px",
                backgroundColor: "#cc0000",
                color: "#fff",
                border: "1px solid #ff0000",
                fontFamily: "monospace",
                cursor: "pointer",
                marginLeft: "auto",
              }}
            >
              Delete Selected
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              style={{
                padding: "8px 12px",
                backgroundColor: "#071026",
                color: "#ff6600",
                border: "1px solid #ff6600",
                fontFamily: "monospace",
                cursor: "pointer",
              }}
            >
              Deselect All
            </button>
          </div>
        )}

        {/* View Mode & Actions */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 20,
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => setViewMode("table")}
            style={{
              padding: "8px 12px",
              backgroundColor: viewMode === "table" ? "#00ff00" : "#071026",
              color: viewMode === "table" ? "#0a0e27" : "#00ff00",
              border: "1px solid #00ff00",
              fontFamily: "monospace",
              cursor: "pointer",
              fontWeight: viewMode === "table" ? "bold" : "normal",
            }}
          >
            📋 Table View
          </button>

          <button
            onClick={() => setViewMode("gallery")}
            style={{
              padding: "8px 12px",
              backgroundColor: viewMode === "gallery" ? "#00ff00" : "#071026",
              color: viewMode === "gallery" ? "#0a0e27" : "#00ff00",
              border: "1px solid #00ff00",
              fontFamily: "monospace",
              cursor: "pointer",
              fontWeight: viewMode === "gallery" ? "bold" : "normal",
            }}
          >
            🎨 Gallery View
          </button>

          <button
            onClick={load}
            style={{
              padding: "8px 12px",
              backgroundColor: "#071026",
              color: "#00ff00",
              border: "1px solid #00ff00",
              fontFamily: "monospace",
              cursor: "pointer",
            }}
          >
            🔄 Refresh
          </button>

          <button
            onClick={downloadCSV}
            style={{
              padding: "8px 12px",
              backgroundColor: "#071026",
              color: "#00ff00",
              border: "1px solid #00ff00",
              fontFamily: "monospace",
              cursor: "pointer",
            }}
          >
            📥 Export CSV
          </button>

          <button
            onClick={() => setShowAnalytics(!showAnalytics)}
            style={{
              padding: "8px 12px",
              backgroundColor: showAnalytics ? "#00aaff" : "#071026",
              color: showAnalytics ? "#000" : "#00ff00",
              border: "1px solid #00aaff",
              fontFamily: "monospace",
              cursor: "pointer",
            }}
          >
            📊 Analytics
          </button>

          <button
            onClick={() => setShowCompleteness(!showCompleteness)}
            style={{
              padding: "8px 12px",
              backgroundColor: showCompleteness ? "#ff9900" : "#071026",
              color: showCompleteness ? "#000" : "#ff9900",
              border: "1px solid #ff9900",
              fontFamily: "monospace",
              cursor: "pointer",
            }}
          >
            ⚠️ Incomplete ({getIncompleteEntries().length})
          </button>

          <button
            onClick={() => setShowDuplicates(!showDuplicates)}
            style={{
              padding: "8px 12px",
              backgroundColor: showDuplicates ? "#ff6600" : "#071026",
              color: showDuplicates ? "#000" : "#ff6600",
              border: "1px solid #ff6600",
              fontFamily: "monospace",
              cursor: "pointer",
              marginLeft: "auto",
            }}
          >
            🔄 Duplicates ({getDuplicates().length})
          </button>
          <button
            onClick={() => setShowAuditTrail(!showAuditTrail)}
            style={{
              padding: "8px 12px",
              backgroundColor: showAuditTrail ? "#9966ff" : "#071026",
              color: showAuditTrail ? "#fff" : "#9966ff",
              border: "1px solid #9966ff",
              fontFamily: "monospace",
              cursor: "pointer",
              marginLeft: 8,
            }}
          >
            📋 Audit Trail ({getAuditTrail().length})
          </button>
          <button
            onClick={() => {
              setShowBlobAudit(!showBlobAudit);
              if (!showBlobAudit && !blobAuditData) loadBlobAudit();
            }}
            style={{
              padding: "8px 12px",
              backgroundColor: showBlobAudit ? "#ff6b35" : "#071026",
              color: showBlobAudit ? "#fff" : "#ff6b35",
              border: "1px solid #ff6b35",
              fontFamily: "monospace",
              cursor: "pointer",
              marginLeft: 8,
            }}
          >
            🔗 Blob Audit{" "}
            {loadingBlobAudit
              ? "..."
              : blobAuditData
                ? `(${blobAuditData.stats?.totalBlobs || 0})`
                : ""}
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            style={{
              padding: "8px 12px",
              backgroundColor: showCreateModal ? "#ff00ff" : "#071026",
              color: showCreateModal ? "#fff" : "#ff00ff",
              border: "1px solid #ff00ff",
              fontFamily: "monospace",
              cursor: "pointer",
              marginLeft: 8,
            }}
          >
            ✨ Create Entry
          </button>
        </div>

        {/* Blob Audit Panel */}
        {showBlobAudit && (
          <div
            style={{
              backgroundColor: "#071026",
              border: "2px solid #ff6b35",
              padding: 16,
              marginBottom: 20,
              borderRadius: 4,
            }}
          >
            <h3 style={{ margin: "0 0 12px 0", color: "#ff6b35" }}>
              🔗 Blob Storage Audit
            </h3>
            {loadingBlobAudit ? (
              <p style={{ color: "#fff" }}>Loading blob audit data...</p>
            ) : blobAuditData ? (
              <div>
                {/* Stats */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr 1fr",
                    gap: 12,
                    marginBottom: 20,
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "#0a2540",
                      padding: 12,
                      borderRadius: 4,
                    }}
                  >
                    <div style={{ fontSize: 11, color: "#999" }}>
                      Total Blobs
                    </div>
                    <div
                      style={{
                        fontSize: 18,
                        color: "#00ff00",
                        fontWeight: "bold",
                      }}
                    >
                      {blobAuditData.stats?.totalBlobs || 0}
                    </div>
                  </div>
                  <div
                    style={{
                      backgroundColor: "#0a2540",
                      padding: 12,
                      borderRadius: 4,
                    }}
                  >
                    <div style={{ fontSize: 11, color: "#999" }}>
                      Unique Logos
                    </div>
                    <div
                      style={{
                        fontSize: 18,
                        color: "#00aaff",
                        fontWeight: "bold",
                      }}
                    >
                      {blobAuditData.stats?.uniqueLogos || 0}
                    </div>
                  </div>
                  <div
                    style={{
                      backgroundColor: "#0a2540",
                      padding: 12,
                      borderRadius: 4,
                    }}
                  >
                    <div style={{ fontSize: 11, color: "#999" }}>
                      Unique Cards
                    </div>
                    <div
                      style={{
                        fontSize: 18,
                        color: "#ff6b35",
                        fontWeight: "bold",
                      }}
                    >
                      {blobAuditData.stats?.uniqueCards || 0}
                    </div>
                  </div>
                  <div
                    style={{
                      backgroundColor: "#0a2540",
                      padding: 12,
                      borderRadius: 4,
                    }}
                  >
                    <div style={{ fontSize: 11, color: "#999" }}>
                      Total Entries
                    </div>
                    <div
                      style={{
                        fontSize: 18,
                        color: "#ffaa00",
                        fontWeight: "bold",
                      }}
                    >
                      {blobAuditData.stats?.totalEntries || 0}
                    </div>
                  </div>
                </div>

                {/* Entry Distribution */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: 12,
                    marginBottom: 20,
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "#0a2540",
                      padding: 12,
                      borderRadius: 4,
                    }}
                  >
                    <div style={{ fontSize: 11, color: "#999" }}>
                      Both Images
                    </div>
                    <div style={{ fontSize: 16, color: "#00ff00" }}>
                      {blobAuditData.stats?.entriesWithBothImages || 0}
                    </div>
                  </div>
                  <div
                    style={{
                      backgroundColor: "#0a2540",
                      padding: 12,
                      borderRadius: 4,
                    }}
                  >
                    <div style={{ fontSize: 11, color: "#999" }}>Only Logo</div>
                    <div style={{ fontSize: 16, color: "#00aaff" }}>
                      {blobAuditData.stats?.entriesWithOnlyLogo || 0}
                    </div>
                  </div>
                  <div
                    style={{
                      backgroundColor: "#0a2540",
                      padding: 12,
                      borderRadius: 4,
                    }}
                  >
                    <div style={{ fontSize: 11, color: "#999" }}>Only Card</div>
                    <div style={{ fontSize: 16, color: "#ff6b35" }}>
                      {blobAuditData.stats?.entriesWithOnlyCard || 0}
                    </div>
                  </div>
                </div>

                {/* Daily Breakdown */}
                {blobAuditData.dailyBreakdown?.length > 0 && (
                  <div style={{ marginBottom: 20 }}>
                    <h4
                      style={{
                        color: "#ff6b35",
                        fontSize: 12,
                        marginBottom: 8,
                      }}
                    >
                      📅 Daily Breakdown (Last 7 days)
                    </h4>
                    <div style={{ display: "flex", gap: 8, overflowX: "auto" }}>
                      {blobAuditData.dailyBreakdown
                        ?.slice(0, 7)
                        ?.map((day: any) => (
                          <div
                            key={day.date}
                            style={{
                              backgroundColor: "#0a2540",
                              padding: 12,
                              borderRadius: 4,
                              minWidth: 120,
                            }}
                          >
                            <div style={{ fontSize: 11, color: "#999" }}>
                              {day.date}
                            </div>
                            <div style={{ fontSize: 12, color: "#00aaff" }}>
                              📸 {day.logoCount}
                            </div>
                            <div style={{ fontSize: 12, color: "#ff6b35" }}>
                              🎨 {day.cardCount}
                            </div>
                            <div
                              style={{
                                fontSize: 12,
                                color: "#00ff00",
                                fontWeight: "bold",
                              }}
                            >
                              Σ {day.totalCount}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* Recent Entries */}
                {blobAuditData.entries?.length > 0 && (
                  <div>
                    <h4
                      style={{
                        color: "#ff6b35",
                        fontSize: 12,
                        marginBottom: 8,
                      }}
                    >
                      🔗 Recent Blob References (Last 50)
                    </h4>
                    <div style={{ maxHeight: 400, overflowY: "auto" }}>
                      {blobAuditData.entries?.map((entry: any) => (
                        <div
                          key={entry.id}
                          style={{
                            backgroundColor: "#0a2540",
                            padding: 10,
                            marginBottom: 8,
                            borderLeft: `3px solid ${entry.type === "logo" ? "#00aaff" : "#ff6b35"}`,
                            cursor: "pointer",
                            borderRadius: 2,
                            fontSize: 11,
                          }}
                          onClick={() => {
                            const logoId = entry.entryId;
                            const foundEntry = entries.find(
                              (e) => e.id === logoId,
                            );
                            if (foundEntry) setSelectedEntry(foundEntry);
                          }}
                        >
                          <div style={{ color: "#fff", marginBottom: 4 }}>
                            <strong>
                              {entry.type === "logo" ? "📸" : "🎨"}{" "}
                              {entry.entryText.substring(0, 40)}
                              {entry.entryText.length > 40 ? "..." : ""}
                            </strong>{" "}
                            by{" "}
                            <span style={{ color: "#00ff00" }}>
                              {entry.username || "Unknown"}
                            </span>
                          </div>
                          <div
                            style={{
                              color: "#999",
                              fontSize: 10,
                              marginBottom: 4,
                            }}
                          >
                            Seed: {entry.seed} •{" "}
                            {new Date(entry.createdAt).toLocaleString()}
                          </div>
                          <div
                            style={{
                              color: "#00aaff",
                              fontSize: 9,
                              wordBreak: "break-all",
                              maxHeight: 30,
                              overflow: "hidden",
                            }}
                          >
                            {entry.url}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!blobAuditData?.entries?.length && !loadingBlobAudit && (
                  <p style={{ color: "#999" }}>No blob references found.</p>
                )}
              </div>
            ) : (
              <p style={{ color: "#ff6b35" }}>
                Failed to load blob audit data.
              </p>
            )}
          </div>
        )}

        {/* Analytics Panel */}
        {showAnalytics && (
          <div
            style={{
              backgroundColor: "#071026",
              border: "2px solid #00aaff",
              padding: 16,
              marginBottom: 20,
              borderRadius: 4,
            }}
          >
            <h3 style={{ margin: "0 0 12px 0", color: "#00aaff" }}>
              📊 Engagement Analytics
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 20,
              }}
            >
              <div>
                <h4
                  style={{ color: "#00ff00", marginBottom: 12, fontSize: 12 }}
                >
                  🏆 Top 10 Most Engaged
                </h4>
                {getTopLogos().map((logo, i) => (
                  <div
                    key={logo.id}
                    style={{
                      fontSize: 11,
                      padding: 8,
                      backgroundColor: "#0a0e27",
                      marginBottom: 6,
                      borderRadius: 3,
                      cursor: "pointer",
                      border: "1px solid #00aa00",
                    }}
                    onClick={() => setSelectedEntry(logo)}
                  >
                    <div>
                      {i + 1}. &quot;{logo.text.substring(0, 30)}&quot;
                    </div>
                    <div style={{ color: "#00aa00", marginTop: 2 }}>
                      ❤️ {logo.likes || 0} | 📢 {logo.recasts || 0} | 💬{" "}
                      {logo.engagement}
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <h4
                  style={{ color: "#00ff00", marginBottom: 12, fontSize: 12 }}
                >
                  📈 Rarity vs Engagement
                </h4>
                {getEngagementByRarity().map((stat) => (
                  <div
                    key={stat.rarity}
                    style={{
                      fontSize: 11,
                      padding: 8,
                      backgroundColor: "#0a0e27",
                      marginBottom: 6,
                      borderRadius: 3,
                      border: "1px solid #00aa00",
                    }}
                  >
                    <div>
                      <strong>{stat.rarity}:</strong> {stat.count} entries
                    </div>
                    <div style={{ color: "#3366FF" }}>
                      Avg engagement: {stat.avg}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Data Completeness Panel */}
        {showCompleteness && (
          <div
            style={{
              backgroundColor: "#1a0a0a",
              border: "2px solid #ff9900",
              padding: 16,
              marginBottom: 20,
              borderRadius: 4,
            }}
          >
            <h3 style={{ margin: "0 0 12px 0", color: "#ff9900" }}>
              ⚠️ Data Completeness Issues ({getIncompleteEntries().length})
            </h3>
            {getIncompleteEntries().length === 0 ? (
              <div style={{ color: "#00ff00" }}>
                ✅ All entries are complete!
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gap: 8,
                  maxHeight: 300,
                  overflowY: "auto",
                }}
              >
                {getIncompleteEntries().map((entry) => (
                  <div
                    key={entry.id}
                    style={{
                      fontSize: 11,
                      padding: 8,
                      backgroundColor: "#0a0e27",
                      borderRadius: 3,
                      border: "1px solid #ff6600",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <strong>{entry.username}</strong> - &quot;
                      {entry.text.substring(0, 30)}&quot;
                      <div style={{ color: "#ff6600", marginTop: 2 }}>
                        {getDataQualityIssues(entry).join(" ")}
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedEntry(entry);
                        setEditingEntry(entry);
                        setEditData(entry);
                      }}
                      style={{
                        padding: "4px 8px",
                        backgroundColor: "#ff9900",
                        color: "#000",
                        border: "none",
                        fontFamily: "monospace",
                        cursor: "pointer",
                        borderRadius: 3,
                        fontSize: 10,
                        fontWeight: "bold",
                      }}
                    >
                      Fix
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Duplicate Detection Panel */}
        {showDuplicates && (
          <div
            style={{
              backgroundColor: "#1a0a0a",
              border: "2px solid #ff6600",
              padding: 16,
              marginBottom: 20,
              borderRadius: 4,
            }}
          >
            <h3 style={{ margin: "0 0 12px 0", color: "#ff6600" }}>
              🔄 Potential Duplicates ({getDuplicates().length})
            </h3>
            {getDuplicates().length === 0 ? (
              <div style={{ color: "#00ff00" }}>✅ No duplicates detected!</div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gap: 12,
                  maxHeight: 400,
                  overflowY: "auto",
                }}
              >
                {getDuplicates().map((dup, i) => (
                  <div
                    key={i}
                    style={{
                      backgroundColor: "#0a0e27",
                      border: "1px solid #ff6600",
                      padding: 12,
                      borderRadius: 3,
                    }}
                  >
                    <div
                      style={{
                        color: "#ff9900",
                        fontWeight: "bold",
                        marginBottom: 8,
                      }}
                    >
                      {dup.type === "seed_proximity"
                        ? "🔢 Similar Seeds"
                        : `📝 Similar Text (${dup.similarity}%)`}
                    </div>
                    {dup.entries.map((e, j) => (
                      <div
                        key={e.id}
                        style={{
                          fontSize: 11,
                          padding: 6,
                          backgroundColor: "#071026",
                          marginBottom: 4,
                          borderRadius: 2,
                          cursor: "pointer",
                        }}
                        onClick={() => setSelectedEntry(e)}
                      >
                        {j > 0 && (
                          <div style={{ color: "#ff9900", marginBottom: 2 }}>
                            VS
                          </div>
                        )}
                        <strong>{e.username}</strong> - &quot;{e.text}&quot;
                        (Seed: {e.seed})
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Audit Trail Panel */}
        {showAuditTrail && (
          <div
            style={{
              backgroundColor: "#1a0a1a",
              border: "2px solid #9966ff",
              padding: 16,
              marginBottom: 20,
              borderRadius: 4,
            }}
          >
            <h3 style={{ margin: "0 0 12px 0", color: "#9966ff" }}>
              📋 Edit History (Last 20 Changes)
            </h3>
            {getAuditTrail().length === 0 ? (
              <div style={{ color: "#00ff00" }}>✅ No edits yet!</div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gap: 8,
                  maxHeight: 400,
                  overflowY: "auto",
                }}
              >
                {getAuditTrail().map((entry) => (
                  <div
                    key={entry.id}
                    style={{
                      fontSize: 11,
                      padding: 10,
                      backgroundColor: "#0a0e27",
                      borderRadius: 3,
                      border: "1px solid #9966ff",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      cursor: "pointer",
                    }}
                    onClick={() => setSelectedEntry(entry)}
                  >
                    <div>
                      <div style={{ fontWeight: "bold", marginBottom: 4 }}>
                        {entry.username || "—"} - &quot;
                        {entry.text.substring(0, 40)}&quot;
                      </div>
                      <div style={{ color: "#9966ff" }}>
                        ⏱️ Last edited:{" "}
                        <strong>
                          {getTimeAgo(entry.updatedAt || entry.createdAt)}
                        </strong>
                      </div>
                      <div
                        style={{ color: "#7744dd", marginTop: 2, fontSize: 10 }}
                      >
                        Created:{" "}
                        {new Date(entry.createdAt).toLocaleDateString()} | Last:{" "}
                        {entry.updatedAt
                          ? new Date(entry.updatedAt).toLocaleDateString()
                          : "—"}
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedEntry(entry);
                        setEditingEntry(entry);
                        setEditData(entry);
                      }}
                      style={{
                        padding: "4px 8px",
                        backgroundColor: "#9966ff",
                        color: "#fff",
                        border: "none",
                        fontFamily: "monospace",
                        cursor: "pointer",
                        borderRadius: 3,
                        fontSize: 10,
                        fontWeight: "bold",
                      }}
                    >
                      View
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: "#00aa00" }}>
            Loading entries... ⏳
          </div>
        ) : viewMode === "table" ? (
          // Table View
          <>
            <div
              style={{
                color: "#00aa00",
                marginBottom: 12,
                fontSize: 11,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                Showing {(currentPage - 1) * itemsPerPage + 1} -{" "}
                {Math.min(currentPage * itemsPerPage, filteredEntries.length)}{" "}
                of {filteredEntries.length} entries
              </div>
              {totalPages > 1 && (
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    style={{
                      padding: "4px 8px",
                      backgroundColor: currentPage === 1 ? "#333" : "#071026",
                      color: currentPage === 1 ? "#666" : "#00ff00",
                      border: "1px solid #00aa00",
                      fontFamily: "monospace",
                      cursor: currentPage === 1 ? "not-allowed" : "pointer",
                    }}
                  >
                    ◀ Prev
                  </button>
                  <span style={{ color: "#00ff00", padding: "4px 8px" }}>
                    {currentPage} / {totalPages}
                  </span>
                  <button
                    onClick={() =>
                      setCurrentPage(Math.min(totalPages, currentPage + 1))
                    }
                    disabled={currentPage === totalPages}
                    style={{
                      padding: "4px 8px",
                      backgroundColor:
                        currentPage === totalPages ? "#333" : "#071026",
                      color: currentPage === totalPages ? "#666" : "#00ff00",
                      border: "1px solid #00aa00",
                      fontFamily: "monospace",
                      cursor:
                        currentPage === totalPages ? "not-allowed" : "pointer",
                    }}
                  >
                    Next ▶
                  </button>
                </div>
              )}
            </div>
            <div style={{ overflowX: "auto", marginBottom: 40 }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 12,
                }}
              >
                <thead>
                  <tr
                    style={{
                      backgroundColor: "#071026",
                      borderBottom: "2px solid #00ff00",
                    }}
                  >
                    <th
                      style={{
                        padding: 10,
                        textAlign: "center",
                        borderRight: "1px solid #00aa00",
                        width: 40,
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={
                          selectedIds.size === filteredEntries.length &&
                          filteredEntries.length > 0
                        }
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedIds(
                              new Set(filteredEntries.map((en) => en.id)),
                            );
                          } else {
                            setSelectedIds(new Set());
                          }
                        }}
                        style={{ cursor: "pointer", width: 16, height: 16 }}
                      />
                    </th>
                    <th
                      style={{
                        padding: 10,
                        textAlign: "left",
                        borderRight: "1px solid #00aa00",
                      }}
                    >
                      Username
                    </th>
                    <th
                      style={{
                        padding: 10,
                        textAlign: "left",
                        borderRight: "1px solid #00aa00",
                      }}
                    >
                      Logo Text
                    </th>
                    <th
                      style={{
                        padding: 10,
                        textAlign: "left",
                        borderRight: "1px solid #00aa00",
                      }}
                    >
                      Seed
                    </th>
                    <th
                      style={{
                        padding: 10,
                        textAlign: "center",
                        borderRight: "1px solid #00aa00",
                        width: 80,
                      }}
                    >
                      Rarity
                    </th>
                    <th
                      style={{
                        padding: 10,
                        textAlign: "center",
                        borderRight: "1px solid #00aa00",
                        width: 60,
                      }}
                    >
                      Likes
                    </th>
                    <th
                      style={{
                        padding: 10,
                        textAlign: "center",
                        borderRight: "1px solid #00aa00",
                        width: 80,
                      }}
                    >
                      Quality
                    </th>
                    <th
                      style={{
                        padding: 10,
                        textAlign: "left",
                        borderRight: "1px solid #00aa00",
                      }}
                    >
                      Created
                    </th>
                    <th style={{ padding: 10, textAlign: "center" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedEntries.map((e) => (
                    <tr
                      key={e.id}
                      style={{
                        borderBottom: "1px solid #00aa00",
                        backgroundColor: "#0a0e27",
                        cursor: "pointer",
                        transition: "background-color 0.2s",
                      }}
                      onMouseEnter={(ev) =>
                        (ev.currentTarget.style.backgroundColor = "#071026")
                      }
                      onMouseLeave={(ev) =>
                        (ev.currentTarget.style.backgroundColor = "#0a0e27")
                      }
                    >
                      <td
                        style={{
                          padding: 10,
                          borderRight: "1px solid #00aa00",
                          textAlign: "center",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedIds.has(e.id)}
                          onChange={(ev) => {
                            const newIds = new Set(selectedIds);
                            if (ev.target.checked) {
                              newIds.add(e.id);
                            } else {
                              newIds.delete(e.id);
                            }
                            setSelectedIds(newIds);
                          }}
                          onClick={(ev) => ev.stopPropagation()}
                          style={{ cursor: "pointer", width: 16, height: 16 }}
                        />
                      </td>
                      <td
                        style={{
                          padding: 10,
                          borderRight: "1px solid #00aa00",
                        }}
                        onClick={() => {
                          setUserInsightsOpen(true);
                          setInsightsUsername(e.username || "");
                        }}
                        title="Click to see user insights"
                      >
                        <span
                          style={{
                            fontWeight: "bold",
                            textDecoration: "underline",
                            color: "#3366FF",
                          }}
                        >
                          {e.username || "—"}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: 10,
                          borderRight: "1px solid #00aa00",
                        }}
                      >
                        &quot;{e.text}&quot;
                      </td>
                      <td
                        style={{
                          padding: 10,
                          borderRight: "1px solid #00aa00",
                          fontFamily: "monospace",
                          fontSize: 11,
                        }}
                      >
                        {e.seed}
                      </td>
                      <td
                        style={{
                          padding: 10,
                          borderRight: "1px solid #00aa00",
                          textAlign: "center",
                          color:
                            RARITY_COLORS[
                              e.rarity as keyof typeof RARITY_COLORS
                            ] || "#ff6600",
                          fontWeight: "bold",
                        }}
                      >
                        {e.rarity || "⚠️ UNKNOWN"}
                      </td>
                      <td
                        style={{
                          padding: 10,
                          borderRight: "1px solid #00aa00",
                          textAlign: "center",
                        }}
                      >
                        ❤️ {e.likes || 0}
                      </td>
                      <td
                        style={{
                          padding: 10,
                          borderRight: "1px solid #00aa00",
                          fontSize: 14,
                          textAlign: "center",
                        }}
                        title={getDataQualityIssues(e)
                          .map(
                            (icon) =>
                              ({
                                "🖼️": "Missing images",
                                "⚠️": "Missing rarity",
                                "🔗": "Missing cast URL",
                                "⏱️": "Not casted",
                              })[icon] || "",
                          )
                          .join(", ")}
                      >
                        {getDataQualityIssues(e).length === 0 ? (
                          <span style={{ color: "#00ff00" }}>✅</span>
                        ) : (
                          getDataQualityIssues(e).join(" ")
                        )}
                      </td>
                      <td
                        style={{
                          padding: 10,
                          borderRight: "1px solid #00aa00",
                          fontSize: 11,
                          color: "#00aa00",
                        }}
                      >
                        {new Date(e.createdAt).toLocaleDateString()}{" "}
                        {new Date(e.createdAt).toLocaleTimeString()}
                      </td>
                      <td style={{ padding: 10, textAlign: "center" }}>
                        <button
                          onClick={() => setSelectedEntry(e)}
                          style={{
                            padding: "4px 8px",
                            backgroundColor: "#071026",
                            color: "#00ff00",
                            border: "1px solid #00ff00",
                            fontFamily: "monospace",
                            fontSize: 11,
                            cursor: "pointer",
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
            {totalPages > 1 && (
              <div
                style={{
                  color: "#00aa00",
                  marginTop: 12,
                  fontSize: 11,
                  textAlign: "center",
                }}
              >
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  style={{
                    padding: "4px 8px",
                    backgroundColor: currentPage === 1 ? "#333" : "#071026",
                    color: currentPage === 1 ? "#666" : "#00ff00",
                    border: "1px solid #00aa00",
                    fontFamily: "monospace",
                    cursor: currentPage === 1 ? "not-allowed" : "pointer",
                    marginRight: 8,
                  }}
                >
                  ◀ Prev
                </button>
                <span style={{ color: "#00ff00", margin: "0 8px" }}>
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  style={{
                    padding: "4px 8px",
                    backgroundColor:
                      currentPage === totalPages ? "#333" : "#071026",
                    color: currentPage === totalPages ? "#666" : "#00ff00",
                    border: "1px solid #00aa00",
                    fontFamily: "monospace",
                    cursor:
                      currentPage === totalPages ? "not-allowed" : "pointer",
                  }}
                >
                  Next ▶
                </button>
              </div>
            )}
          </>
        ) : (
          // Gallery View
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
              gap: 16,
              marginBottom: 40,
            }}
          >
            {paginatedEntries.map((e) => (
              <div
                key={e.id}
                onClick={() => setSelectedEntry(e)}
                style={{
                  backgroundColor: "#071026",
                  border: "2px solid #00aa00",
                  padding: 12,
                  cursor: "pointer",
                  transition: "all 0.2s",
                  borderRadius: 4,
                }}
                onMouseEnter={(ev) => {
                  ev.currentTarget.style.borderColor = "#00ff00";
                  ev.currentTarget.style.boxShadow = "0 0 12px #00ff00";
                }}
                onMouseLeave={(ev) => {
                  ev.currentTarget.style.borderColor = "#00aa00";
                  ev.currentTarget.style.boxShadow = "none";
                }}
              >
                {/* Logo Image */}
                {e.logoImageUrl || e.cardImageUrl || e.imageUrl ? (
                  <div
                    style={{
                      marginBottom: 12,
                      position: "relative",
                      aspectRatio: "1",
                      backgroundColor: "#0a0e27",
                      borderRadius: 4,
                      overflow: "hidden",
                    }}
                  >
                    <Image
                      src={e.logoImageUrl || e.cardImageUrl || e.imageUrl || ""}
                      alt={e.text}
                      fill
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                ) : (
                  <div
                    style={{
                      marginBottom: 12,
                      aspectRatio: "1",
                      backgroundColor: "#0a0e27",
                      borderRadius: 4,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#00aa00",
                      fontSize: 12,
                    }}
                  >
                    No Image
                  </div>
                )}

                {/* Text */}
                <div
                  style={{
                    fontSize: 14,
                    fontWeight: "bold",
                    marginBottom: 8,
                    color: "#00ff00",
                    wordBreak: "break-word",
                  }}
                >
                  &quot;{e.text}&quot;
                </div>

                {/* User Info */}
                <div
                  style={{ fontSize: 11, color: "#00aa00", marginBottom: 8 }}
                >
                  {e.username || "—"}{" "}
                  {e.displayName && e.displayName !== e.username
                    ? `(${e.displayName})`
                    : ""}
                </div>

                {/* Seed */}
                <div
                  style={{
                    fontSize: 10,
                    color: "#00aa00",
                    fontFamily: "monospace",
                    marginBottom: 8,
                    wordBreak: "break-all",
                  }}
                >
                  🎲 {e.seed}
                </div>

                {/* Rarity Badge */}
                <div style={{ marginBottom: 8 }}>
                  <span
                    style={{
                      display: "inline-block",
                      backgroundColor:
                        RARITY_COLORS[e.rarity as keyof typeof RARITY_COLORS] ||
                        "#ff6600",
                      color: "#0a0e27",
                      padding: "4px 8px",
                      borderRadius: 3,
                      fontSize: 11,
                      fontWeight: "bold",
                    }}
                  >
                    {e.rarity || "⚠️ UNKNOWN"}
                  </span>
                </div>

                {/* Stats */}
                <div
                  style={{
                    fontSize: 10,
                    color: "#00aa00",
                    display: "flex",
                    gap: 8,
                    justifyContent: "space-between",
                    borderTop: "1px solid #00aa00",
                    paddingTop: 8,
                  }}
                >
                  <span>❤️ {e.likes || 0}</span>
                  <span>📢 {e.recasts || 0}</span>
                  <span>
                    {e.casted && e.castUrl
                      ? "✅ Casted"
                      : e.castUrl && !e.casted
                        ? "⚠️ URL but Pending"
                        : "⏳ Pending"}
                  </span>
                </div>
              </div>
            ))}
            {totalPages > 1 && (
              <div
                style={{
                  color: "#00aa00",
                  marginTop: 24,
                  fontSize: 11,
                  textAlign: "center",
                }}
              >
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  style={{
                    padding: "4px 8px",
                    backgroundColor: currentPage === 1 ? "#333" : "#071026",
                    color: currentPage === 1 ? "#666" : "#00ff00",
                    border: "1px solid #00aa00",
                    fontFamily: "monospace",
                    cursor: currentPage === 1 ? "not-allowed" : "pointer",
                    marginRight: 8,
                  }}
                >
                  ◀ Prev
                </button>
                <span style={{ color: "#00ff00", margin: "0 8px" }}>
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage(Math.min(totalPages, currentPage + 1))
                  }
                  disabled={currentPage === totalPages}
                  style={{
                    padding: "4px 8px",
                    backgroundColor:
                      currentPage === totalPages ? "#333" : "#071026",
                    color: currentPage === totalPages ? "#666" : "#00ff00",
                    border: "1px solid #00aa00",
                    fontFamily: "monospace",
                    cursor:
                      currentPage === totalPages ? "not-allowed" : "pointer",
                  }}
                >
                  Next ▶
                </button>
              </div>
            )}
          </div>
        )}

        {/* Detail Modal */}
        {selectedEntry && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
            }}
            onClick={() => setSelectedEntry(null)}
          >
            <div
              style={{
                backgroundColor: "#071026",
                border: "2px solid #00ff00",
                padding: 24,
                borderRadius: 4,
                maxWidth: 600,
                maxHeight: "90vh",
                overflowY: "auto",
                color: "#00ff00",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <h2 style={{ margin: 0, fontSize: 18 }}>📋 Logo Details</h2>
                <button
                  onClick={() => setSelectedEntry(null)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#00ff00",
                    fontSize: 20,
                    cursor: "pointer",
                  }}
                >
                  ✕
                </button>
              </div>

              {/* Logo Preview */}
              {selectedEntry.logoImageUrl ||
              selectedEntry.cardImageUrl ||
              selectedEntry.imageUrl ? (
                <div
                  style={{
                    marginBottom: 16,
                    backgroundColor: "#0a0e27",
                    padding: 12,
                    borderRadius: 4,
                    border: "1px solid #00aa00",
                    position: "relative",
                    aspectRatio: "1",
                  }}
                >
                  <Image
                    src={
                      selectedEntry.logoImageUrl ||
                      selectedEntry.cardImageUrl ||
                      selectedEntry.imageUrl ||
                      ""
                    }
                    alt={selectedEntry.text}
                    fill
                    style={{ borderRadius: 4 }}
                  />
                </div>
              ) : null}

              <div style={{ display: "grid", gap: 12 }}>
                <div>
                  <div
                    style={{ fontSize: 10, color: "#00aa00", marginBottom: 4 }}
                  >
                    ID
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      fontFamily: "monospace",
                      color: "#00ff00",
                      wordBreak: "break-all",
                    }}
                  >
                    {selectedEntry.id}
                  </div>
                </div>

                <div>
                  <div
                    style={{ fontSize: 10, color: "#00aa00", marginBottom: 4 }}
                  >
                    TEXT
                  </div>
                  <div style={{ fontSize: 14, fontWeight: "bold" }}>
                    &quot;{selectedEntry.text}&quot;
                  </div>
                </div>

                <div>
                  <div
                    style={{ fontSize: 10, color: "#00aa00", marginBottom: 4 }}
                  >
                    SEED
                  </div>
                  <div style={{ fontSize: 12, fontFamily: "monospace" }}>
                    {selectedEntry.seed}
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 10,
                        color: "#00aa00",
                        marginBottom: 4,
                      }}
                    >
                      USERNAME
                    </div>
                    <div style={{ fontSize: 12, fontWeight: "bold" }}>
                      {selectedEntry.username || "—"}
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 10,
                        color: "#00aa00",
                        marginBottom: 4,
                      }}
                    >
                      RARITY
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        fontWeight: "bold",
                        color:
                          RARITY_COLORS[
                            selectedEntry.rarity as keyof typeof RARITY_COLORS
                          ] || "#ff6600",
                      }}
                    >
                      {selectedEntry.rarity || "⚠️ UNKNOWN"}
                    </div>
                  </div>
                </div>

                <div>
                  <div
                    style={{ fontSize: 10, color: "#00aa00", marginBottom: 4 }}
                  >
                    DISPLAY NAME
                  </div>
                  <div style={{ fontSize: 12 }}>
                    {selectedEntry.displayName || "—"}
                  </div>
                </div>

                <div>
                  <div
                    style={{ fontSize: 10, color: "#00aa00", marginBottom: 4 }}
                  >
                    CREATED
                  </div>
                  <div style={{ fontSize: 12 }}>
                    {new Date(selectedEntry.createdAt).toLocaleString()}
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: 8,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 10,
                        color: "#00aa00",
                        marginBottom: 4,
                      }}
                    >
                      LIKES
                    </div>
                    <div style={{ fontSize: 14, fontWeight: "bold" }}>
                      ❤️ {selectedEntry.likes || 0}
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 10,
                        color: "#00aa00",
                        marginBottom: 4,
                      }}
                    >
                      RECASTS
                    </div>
                    <div style={{ fontSize: 14, fontWeight: "bold" }}>
                      📢 {selectedEntry.recasts || 0}
                    </div>
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 10,
                        color: "#00aa00",
                        marginBottom: 4,
                      }}
                    >
                      STATUS
                    </div>
                    <div style={{ fontSize: 12, fontWeight: "bold" }}>
                      {selectedEntry.casted ? "✅ Casted" : "⏳ Pending"}
                    </div>
                  </div>
                </div>

                {selectedEntry.logoImageUrl && (
                  <div>
                    <div
                      style={{
                        fontSize: 10,
                        color: "#00aa00",
                        marginBottom: 4,
                      }}
                    >
                      LOGO IMAGE URL
                    </div>
                    <a
                      href={selectedEntry.logoImageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: 11,
                        color: "#3366FF",
                        wordBreak: "break-all",
                        textDecoration: "underline",
                      }}
                    >
                      {selectedEntry.logoImageUrl.substring(0, 60)}...
                    </a>
                  </div>
                )}

                {selectedEntry.cardImageUrl && (
                  <div>
                    <div
                      style={{
                        fontSize: 10,
                        color: "#00aa00",
                        marginBottom: 4,
                      }}
                    >
                      CARD IMAGE URL
                    </div>
                    <a
                      href={selectedEntry.cardImageUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: 11,
                        color: "#3366FF",
                        wordBreak: "break-all",
                        textDecoration: "underline",
                      }}
                    >
                      {selectedEntry.cardImageUrl.substring(0, 60)}...
                    </a>
                  </div>
                )}

                {selectedEntry.castUrl && (
                  <div>
                    <div
                      style={{
                        fontSize: 10,
                        color: "#00aa00",
                        marginBottom: 4,
                      }}
                    >
                      CAST URL
                    </div>
                    <a
                      href={selectedEntry.castUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: 11,
                        color: "#3366FF",
                        wordBreak: "break-all",
                        textDecoration: "underline",
                      }}
                    >
                      {selectedEntry.castUrl.substring(0, 60)}...
                    </a>
                  </div>
                )}

                <div
                  style={{
                    borderTop: "1px solid #00aa00",
                    paddingTop: 12,
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                  }}
                >
                  {/* Generate Card Image Button */}
                  {!selectedEntry.cardImageUrl &&
                    selectedEntry.logoImageUrl && (
                      <button
                        onClick={() => generateCardImage(selectedEntry)}
                        disabled={generatingCardId === selectedEntry.id}
                        style={{
                          flex: 1,
                          minWidth: 120,
                          padding: "8px 12px",
                          backgroundColor:
                            generatingCardId === selectedEntry.id
                              ? "#333"
                              : "#ff9900",
                          color: "#000",
                          border: "1px solid #ff9900",
                          fontFamily: "monospace",
                          cursor:
                            generatingCardId === selectedEntry.id
                              ? "not-allowed"
                              : "pointer",
                          borderRadius: 3,
                          fontWeight: "bold",
                        }}
                      >
                        {generatingCardId === selectedEntry.id
                          ? "⏳ Generating..."
                          : "🎨 Generate Card"}
                      </button>
                    )}

                  {/* Edit Casted Status Button */}
                  <button
                    onClick={() => {
                      setEditingCastedId(selectedEntry.id);
                      setEditingCastedValue(selectedEntry.casted || false);
                      setEditingCastUrl(selectedEntry.castUrl || "");
                    }}
                    style={{
                      flex: 1,
                      minWidth: 120,
                      padding: "8px 12px",
                      backgroundColor: selectedEntry.casted
                        ? "#006600"
                        : "#ff6600",
                      color: "#fff",
                      border: selectedEntry.casted
                        ? "1px solid #00ff00"
                        : "1px solid #ff6600",
                      fontFamily: "monospace",
                      cursor: "pointer",
                      borderRadius: 3,
                    }}
                  >
                    {selectedEntry.casted ? "✅ Casted" : "⏳ Edit Status"}
                  </button>

                  {/* Edit Entry Button */}
                  <button
                    onClick={() => {
                      setEditingEntry(selectedEntry);
                      setEditData(selectedEntry);
                    }}
                    style={{
                      flex: 1,
                      minWidth: 120,
                      padding: "8px 12px",
                      backgroundColor: "#0066cc",
                      color: "#fff",
                      border: "1px solid #00aaff",
                      fontFamily: "monospace",
                      cursor: "pointer",
                      borderRadius: 3,
                    }}
                  >
                    ✏️ Edit Entry
                  </button>

                  {/* Delete Button */}
                  <button
                    onClick={() => {
                      if (confirm("Delete this entry? Cannot be undone.")) {
                        remove(selectedEntry.id);
                        setSelectedEntry(null);
                      }
                    }}
                    style={{
                      flex: 1,
                      minWidth: 120,
                      padding: "8px 12px",
                      backgroundColor: "#cc0000",
                      color: "#fff",
                      border: "1px solid #ff0000",
                      fontFamily: "monospace",
                      cursor: "pointer",
                      borderRadius: 3,
                    }}
                  >
                    🗑️ Delete
                  </button>

                  {/* Close Button */}
                  <button
                    onClick={() => setSelectedEntry(null)}
                    style={{
                      flex: 1,
                      minWidth: 120,
                      padding: "8px 12px",
                      backgroundColor: "#071026",
                      color: "#00ff00",
                      border: "1px solid #00ff00",
                      fontFamily: "monospace",
                      cursor: "pointer",
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

        {/* Edit Casted Status Modal */}
        {editingCastedId && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1001,
            }}
            onClick={() => setEditingCastedId(null)}
          >
            <div
              style={{
                backgroundColor: "#071026",
                border: "2px solid #ff9900",
                padding: 24,
                borderRadius: 4,
                maxWidth: 500,
                color: "#00ff00",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{ margin: "0 0 16px 0", color: "#ff9900" }}>
                📡 Edit Cast Status
              </h2>

              <div style={{ display: "grid", gap: 16 }}>
                {/* Current Status */}
                <div>
                  <label style={{ fontSize: 12, color: "#00aa00" }}>
                    Logo: {selectedEntry?.text}
                  </label>
                  <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>
                    Current status:{" "}
                    {selectedEntry?.casted ? "✅ Casted" : "⏳ Pending"}
                  </div>
                </div>

                {/* Casted Toggle */}
                <div>
                  <label
                    style={{
                      fontSize: 12,
                      color: "#00aa00",
                      display: "block",
                      marginBottom: 8,
                    }}
                  >
                    Mark as Casted?
                  </label>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      onClick={() => setEditingCastedValue(false)}
                      style={{
                        flex: 1,
                        padding: "8px 12px",
                        backgroundColor: !editingCastedValue
                          ? "#ff6600"
                          : "#071026",
                        color: !editingCastedValue ? "#000" : "#ff6600",
                        border: "1px solid #ff6600",
                        fontFamily: "monospace",
                        cursor: "pointer",
                        borderRadius: 3,
                      }}
                    >
                      ⏳ Pending
                    </button>
                    <button
                      onClick={() => setEditingCastedValue(true)}
                      style={{
                        flex: 1,
                        padding: "8px 12px",
                        backgroundColor: editingCastedValue
                          ? "#006600"
                          : "#071026",
                        color: editingCastedValue ? "#00ff00" : "#00aa00",
                        border: "1px solid #00ff00",
                        fontFamily: "monospace",
                        cursor: "pointer",
                        borderRadius: 3,
                      }}
                    >
                      ✅ Casted
                    </button>
                  </div>
                </div>

                {/* Cast URL (shown only if marking as casted) */}
                {editingCastedValue && (
                  <div>
                    <label
                      style={{
                        fontSize: 12,
                        color: "#00aa00",
                        display: "block",
                        marginBottom: 8,
                      }}
                    >
                      Cast URL (Required for casted status)
                    </label>
                    <input
                      type="text"
                      placeholder="https://warpcast.com/..."
                      value={editingCastUrl}
                      onChange={(e) => setEditingCastUrl(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        backgroundColor: "#0a0e27",
                        border: "1px solid #00aa00",
                        color: "#00ff00",
                        fontFamily: "monospace",
                        fontSize: 11,
                        boxSizing: "border-box",
                        borderRadius: 3,
                      }}
                    />
                    <div style={{ fontSize: 10, color: "#666", marginTop: 4 }}>
                      {editingCastUrl
                        ? "✅ URL provided"
                        : "❌ URL required to mark as casted"}
                    </div>
                  </div>
                )}

                {/* Optional: URL field for pending status */}
                {!editingCastedValue && editingCastUrl && (
                  <div>
                    <label
                      style={{
                        fontSize: 12,
                        color: "#00aa00",
                        display: "block",
                        marginBottom: 8,
                      }}
                    >
                      Clear Cast URL?
                    </label>
                    <button
                      onClick={() => setEditingCastUrl("")}
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        backgroundColor: "#333",
                        color: "#ff6600",
                        border: "1px solid #ff6600",
                        fontFamily: "monospace",
                        cursor: "pointer",
                        borderRadius: 3,
                      }}
                    >
                      Clear URL
                    </button>
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                  <button
                    onClick={() => {
                      updateCastedStatus(
                        editingCastedId,
                        editingCastedValue,
                        editingCastUrl,
                      );
                    }}
                    disabled={editingCastedValue && !editingCastUrl.trim()}
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      backgroundColor:
                        editingCastedValue && !editingCastUrl.trim()
                          ? "#333"
                          : "#00ff00",
                      color:
                        editingCastedValue && !editingCastUrl.trim()
                          ? "#666"
                          : "#0a0e27",
                      border: "1px solid #00ff00",
                      fontFamily: "monospace",
                      fontWeight: "bold",
                      cursor:
                        editingCastedValue && !editingCastUrl.trim()
                          ? "not-allowed"
                          : "pointer",
                      borderRadius: 3,
                    }}
                  >
                    💾 Save Changes
                  </button>
                  <button
                    onClick={() => {
                      setEditingCastedId(null);
                      setEditingCastedValue(false);
                      setEditingCastUrl("");
                    }}
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      backgroundColor: "#071026",
                      color: "#ff6600",
                      border: "1px solid #ff6600",
                      fontFamily: "monospace",
                      cursor: "pointer",
                      borderRadius: 3,
                    }}
                  >
                    ✕ Cancel
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
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 2000,
            }}
            onClick={() => setEditingEntry(null)}
          >
            <div
              style={{
                backgroundColor: "#071026",
                border: "2px solid #00aaff",
                padding: 24,
                borderRadius: 4,
                maxWidth: 500,
                color: "#00ff00",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{ margin: 0, fontSize: 18, marginBottom: 16 }}>
                ✏️ Edit Logo Entry
              </h2>

              <div style={{ display: "grid", gap: 12 }}>
                <div>
                  <label
                    style={{
                      fontSize: 10,
                      color: "#00aa00",
                      display: "block",
                      marginBottom: 4,
                    }}
                  >
                    TEXT
                  </label>
                  <input
                    type="text"
                    value={editData.text || ""}
                    onChange={(e) =>
                      setEditData((s) => ({ ...s, text: e.target.value }))
                    }
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      backgroundColor: "#0a0e27",
                      border: "1px solid #00aa00",
                      color: "#00ff00",
                      fontFamily: "monospace",
                      borderRadius: 3,
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      fontSize: 10,
                      color: "#00aa00",
                      display: "block",
                      marginBottom: 4,
                    }}
                  >
                    RARITY
                  </label>
                  <select
                    value={editData.rarity || ""}
                    onChange={(e) =>
                      setEditData((s) => ({ ...s, rarity: e.target.value }))
                    }
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      backgroundColor: "#0a0e27",
                      border: "1px solid #00aa00",
                      color: "#00ff00",
                      fontFamily: "monospace",
                      borderRadius: 3,
                      boxSizing: "border-box",
                    }}
                  >
                    <option value="">—</option>
                    <option value="LEGENDARY">LEGENDARY</option>
                    <option value="EPIC">EPIC</option>
                    <option value="RARE">RARE</option>
                    <option value="COMMON">COMMON</option>
                  </select>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 12,
                  }}
                >
                  <div>
                    <label
                      style={{
                        fontSize: 10,
                        color: "#00aa00",
                        display: "block",
                        marginBottom: 4,
                      }}
                    >
                      USERNAME
                    </label>
                    <input
                      type="text"
                      value={editData.username || ""}
                      onChange={(e) =>
                        setEditData((s) => ({ ...s, username: e.target.value }))
                      }
                      placeholder="@username"
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        backgroundColor: "#0a0e27",
                        border: "1px solid #00aa00",
                        color: "#00ff00",
                        fontFamily: "monospace",
                        borderRadius: 3,
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        fontSize: 10,
                        color: "#00aa00",
                        display: "block",
                        marginBottom: 4,
                      }}
                    >
                      DISPLAY NAME
                    </label>
                    <input
                      type="text"
                      value={editData.displayName || ""}
                      onChange={(e) =>
                        setEditData((s) => ({
                          ...s,
                          displayName: e.target.value,
                        }))
                      }
                      placeholder="Display Name"
                      style={{
                        width: "100%",
                        padding: "8px 12px",
                        backgroundColor: "#0a0e27",
                        border: "1px solid #00aa00",
                        color: "#00ff00",
                        fontFamily: "monospace",
                        borderRadius: 3,
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label
                    style={{
                      fontSize: 10,
                      color: "#00aa00",
                      display: "block",
                      marginBottom: 4,
                    }}
                  >
                    CAST URL
                  </label>
                  <input
                    type="text"
                    value={editData.castUrl || ""}
                    onChange={(e) =>
                      setEditData((s) => ({ ...s, castUrl: e.target.value }))
                    }
                    placeholder="https://warpcast.com/..."
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      backgroundColor: "#0a0e27",
                      border: "1px solid #00aa00",
                      color: "#00ff00",
                      fontFamily: "monospace",
                      fontSize: 11,
                      borderRadius: 3,
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      fontSize: 10,
                      color: "#00aa00",
                      display: "block",
                      marginBottom: 4,
                    }}
                  >
                    LOGO IMAGE URL
                  </label>
                  <input
                    type="text"
                    value={editData.logoImageUrl || ""}
                    onChange={(e) =>
                      setEditData((s) => ({
                        ...s,
                        logoImageUrl: e.target.value,
                      }))
                    }
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      backgroundColor: "#0a0e27",
                      border: "1px solid #00aa00",
                      color: "#00ff00",
                      fontFamily: "monospace",
                      fontSize: 11,
                      borderRadius: 3,
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
                  <button
                    onClick={() => updateEntry(editingEntry.id, editData)}
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      backgroundColor: "#00aa00",
                      color: "#0a0e27",
                      border: "1px solid #00ff00",
                      fontFamily: "monospace",
                      fontWeight: "bold",
                      cursor: "pointer",
                      borderRadius: 3,
                    }}
                  >
                    💾 Save
                  </button>
                  <button
                    onClick={() => setEditingEntry(null)}
                    style={{
                      flex: 1,
                      padding: "8px 12px",
                      backgroundColor: "#071026",
                      color: "#00ff00",
                      border: "1px solid #00ff00",
                      fontFamily: "monospace",
                      cursor: "pointer",
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

        {/* User Insights Modal */}
        {userInsightsOpen && insightsUsername && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0, 0, 0, 0.7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 2001,
            }}
            onClick={() => setUserInsightsOpen(false)}
          >
            <div
              style={{
                backgroundColor: "#071026",
                border: "2px solid #00aaff",
                padding: 24,
                borderRadius: 4,
                maxWidth: 500,
                color: "#00ff00",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 16,
                }}
              >
                <h2 style={{ margin: 0, fontSize: 18 }}>
                  👤 User Insights: {insightsUsername}
                </h2>
                <button
                  onClick={() => setUserInsightsOpen(false)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#00ff00",
                    fontSize: 20,
                    cursor: "pointer",
                  }}
                >
                  ✕
                </button>
              </div>

              {(() => {
                const userLogos = entries.filter(
                  (e) => e.username === insightsUsername,
                );
                const totalLikes = userLogos.reduce(
                  (sum, e) => sum + (e.likes || 0),
                  0,
                );
                const totalEngagement = userLogos.reduce(
                  (sum, e) => sum + (e.likes || 0) + (e.recasts || 0),
                  0,
                );
                const avgLikes =
                  userLogos.length > 0
                    ? (totalLikes / userLogos.length).toFixed(1)
                    : 0;
                const castedCount = userLogos.filter((e) => e.casted).length;
                const rarityBreakdown = {
                  LEGENDARY: userLogos.filter((e) => e.rarity === "LEGENDARY")
                    .length,
                  EPIC: userLogos.filter((e) => e.rarity === "EPIC").length,
                  RARE: userLogos.filter((e) => e.rarity === "RARE").length,
                  COMMON: userLogos.filter((e) => e.rarity === "COMMON").length,
                  UNKNOWN: userLogos.filter((e) => !e.rarity).length,
                };

                return (
                  <div style={{ display: "grid", gap: 12 }}>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: 12,
                      }}
                    >
                      <div
                        style={{
                          backgroundColor: "#0a0e27",
                          padding: 12,
                          border: "1px solid #00aa00",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 10,
                            color: "#00aa00",
                            marginBottom: 4,
                          }}
                        >
                          TOTAL LOGOS
                        </div>
                        <div style={{ fontSize: 24, fontWeight: "bold" }}>
                          {userLogos.length}
                        </div>
                      </div>
                      <div
                        style={{
                          backgroundColor: "#0a0e27",
                          padding: 12,
                          border: "1px solid #00aa00",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 10,
                            color: "#00aa00",
                            marginBottom: 4,
                          }}
                        >
                          TOTAL LIKES
                        </div>
                        <div style={{ fontSize: 24, fontWeight: "bold" }}>
                          ❤️ {totalLikes}
                        </div>
                      </div>
                      <div
                        style={{
                          backgroundColor: "#0a0e27",
                          padding: 12,
                          border: "1px solid #00aa00",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 10,
                            color: "#00aa00",
                            marginBottom: 4,
                          }}
                        >
                          AVG LIKES
                        </div>
                        <div style={{ fontSize: 20, fontWeight: "bold" }}>
                          {avgLikes}
                        </div>
                      </div>
                      <div
                        style={{
                          backgroundColor: "#0a0e27",
                          padding: 12,
                          border: "1px solid #00aa00",
                        }}
                      >
                        <div
                          style={{
                            fontSize: 10,
                            color: "#00aa00",
                            marginBottom: 4,
                          }}
                        >
                          TOTAL ENGAGEMENT
                        </div>
                        <div style={{ fontSize: 24, fontWeight: "bold" }}>
                          {totalEngagement}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        backgroundColor: "#0a0e27",
                        padding: 12,
                        border: "1px solid #00aa00",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: "bold",
                          marginBottom: 8,
                          color: "#00ff00",
                        }}
                      >
                        📊 RARITY BREAKDOWN
                      </div>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: 8,
                          fontSize: 11,
                        }}
                      >
                        <div>🌟 LEGENDARY: {rarityBreakdown.LEGENDARY}</div>
                        <div>✨ EPIC: {rarityBreakdown.EPIC}</div>
                        <div>💎 RARE: {rarityBreakdown.RARE}</div>
                        <div>✓ COMMON: {rarityBreakdown.COMMON}</div>
                        <div>⚠️ UNKNOWN: {rarityBreakdown.UNKNOWN}</div>
                        <div>
                          📢 CASTED: {castedCount}/{userLogos.length}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        backgroundColor: "#0a0e27",
                        padding: 12,
                        border: "1px solid #00aa00",
                        maxHeight: 200,
                        overflowY: "auto",
                      }}
                    >
                      <div
                        style={{
                          fontSize: 12,
                          fontWeight: "bold",
                          marginBottom: 8,
                          color: "#00ff00",
                        }}
                      >
                        📝 RECENT LOGOS
                      </div>
                      {userLogos
                        .sort(
                          (a, b) =>
                            new Date(b.createdAt).getTime() -
                            new Date(a.createdAt).getTime(),
                        )
                        .slice(0, 5)
                        .map((logo) => (
                          <div
                            key={logo.id}
                            style={{
                              fontSize: 10,
                              padding: 8,
                              backgroundColor: "#071026",
                              marginBottom: 4,
                              borderRadius: 3,
                              cursor: "pointer",
                              border: "1px solid #00aa00",
                            }}
                            onClick={() => {
                              setSelectedEntry(logo);
                              setUserInsightsOpen(false);
                            }}
                          >
                            <div>
                              &quot;{logo.text}&quot; |{" "}
                              {logo.rarity || "UNKNOWN"} | ❤️ {logo.likes || 0}
                            </div>
                            <div style={{ color: "#00aa00", marginTop: 2 }}>
                              {new Date(logo.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        ))}
                    </div>

                    <button
                      onClick={() => setUserInsightsOpen(false)}
                      style={{
                        padding: "8px 12px",
                        backgroundColor: "#071026",
                        color: "#00ff00",
                        border: "1px solid #00ff00",
                        fontFamily: "monospace",
                        cursor: "pointer",
                        borderRadius: 3,
                      }}
                    >
                      Close
                    </button>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* Create New Entry Modal */}
        {showCreateModal && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1002,
            }}
            onClick={() => {
              if (!creatingEntry) setShowCreateModal(false);
            }}
          >
            <div
              style={{
                backgroundColor: "#071026",
                border: "2px solid #ff00ff",
                padding: 24,
                borderRadius: 4,
                maxWidth: 700,
                maxHeight: "90vh",
                overflowY: "auto",
                color: "#ff00ff",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{ margin: "0 0 16px 0" }}>✨ Create New Logo Entry</h2>

              <div style={{ marginBottom: 16 }}>
                <label
                  style={{ display: "block", marginBottom: 6, fontSize: 12 }}
                >
                  Logo Text:
                </label>
                <input
                  type="text"
                  value={createText}
                  onChange={(e) => setCreateText(e.target.value)}
                  placeholder="Enter text for logo"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    backgroundColor: "#0a2540",
                    border: "1px solid #ff00ff",
                    color: "#fff",
                    fontFamily: "monospace",
                    boxSizing: "border-box",
                    marginBottom: 12,
                  }}
                />

                <label
                  style={{ display: "block", marginBottom: 6, fontSize: 12 }}
                >
                  Username:
                </label>
                <input
                  type="text"
                  value={createUsername}
                  onChange={(e) => setCreateUsername(e.target.value)}
                  placeholder="Leave blank for 'admin-created'"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    backgroundColor: "#0a2540",
                    border: "1px solid #ff00ff",
                    color: "#fff",
                    fontFamily: "monospace",
                    boxSizing: "border-box",
                    marginBottom: 12,
                  }}
                />

                <label
                  style={{ display: "block", marginBottom: 6, fontSize: 12 }}
                >
                  Seed (optional):
                </label>
                <input
                  type="text"
                  value={createSeed}
                  onChange={(e) => setCreateSeed(e.target.value)}
                  placeholder="Leave blank to generate random seed"
                  style={{
                    width: "100%",
                    padding: "8px 12px",
                    backgroundColor: "#0a2540",
                    border: "1px solid #ff00ff",
                    color: "#fff",
                    fontFamily: "monospace",
                    boxSizing: "border-box",
                    marginBottom: 12,
                  }}
                />

                <button
                  onClick={generatePreviewLogo}
                  disabled={creatingEntry}
                  style={{
                    padding: "10px 16px",
                    backgroundColor: "#0a2540",
                    color: "#ff00ff",
                    border: "1px solid #ff00ff",
                    fontFamily: "monospace",
                    cursor: creatingEntry ? "not-allowed" : "pointer",
                    borderRadius: 3,
                    marginBottom: 16,
                    width: "100%",
                  }}
                >
                  🎨 Generate Preview
                </button>

                {generatedLogoPreview && (
                  <div
                    style={{
                      marginBottom: 16,
                      padding: 12,
                      backgroundColor: "#0a2540",
                      borderRadius: 4,
                    }}
                  >
                    <h4 style={{ margin: "0 0 8px 0", color: "#ff00ff" }}>
                      Preview:
                    </h4>
                    <Image
                      src={generatedLogoPreview.dataUrl}
                      alt="Logo preview"
                      width={300}
                      height={300}
                      style={{
                        maxWidth: "100%",
                        height: "auto",
                        borderRadius: 3,
                        marginBottom: 8,
                      }}
                    />
                    <div style={{ fontSize: 11, color: "#999" }}>
                      Seed: {generatedLogoPreview.seed} | Rarity:{" "}
                      {generatedLogoPreview.rarity}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={createNewEntry}
                  disabled={creatingEntry || !generatedLogoPreview}
                  style={{
                    flex: 1,
                    padding: "10px 16px",
                    backgroundColor:
                      generatedLogoPreview && !creatingEntry
                        ? "#ff00ff"
                        : "#333",
                    color: "#fff",
                    border: "1px solid #ff00ff",
                    fontFamily: "monospace",
                    cursor:
                      generatedLogoPreview && !creatingEntry
                        ? "pointer"
                        : "not-allowed",
                    borderRadius: 3,
                  }}
                >
                  {creatingEntry ? "Creating..." : "✅ Create Entry"}
                </button>
                <button
                  onClick={() => setShowCreateModal(false)}
                  disabled={creatingEntry}
                  style={{
                    flex: 1,
                    padding: "10px 16px",
                    backgroundColor: "#0a2540",
                    color: "#ff00ff",
                    border: "1px solid #ff00ff",
                    fontFamily: "monospace",
                    cursor: "pointer",
                    borderRadius: 3,
                  }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
