"use client";

import { useEffect, useState } from "react";

interface Feedback {
  id: string;
  userId?: string;
  username?: string;
  type: string;
  message: string;
  rating?: number;
  status: string;
  createdAt: string;
}

const FEEDBACK_TYPES = {
  bug: { emoji: "🐛", label: "Bug Report" },
  feature: { emoji: "💡", label: "Feature Request" },
  ux: { emoji: "🎨", label: "UX Improvement" },
  praise: { emoji: "❤️", label: "Praise" },
  other: { emoji: "💬", label: "Other" },
};

export default function AdminFeedbackPage() {
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("new");
  const [sortBy, setSortBy] = useState<"date" | "rating">("date");
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    byType: {} as Record<string, number>,
    avgRating: 0,
    ratings: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
  });

  useEffect(() => {
    loadFeedback();
  }, []);

  const loadFeedback = async () => {
    try {
      const response = await fetch(`/api/feedback?status=all&limit=100`);
      if (!response.ok) throw new Error("Failed to load feedback");

      const data = await response.json();
      const allFeedbacks = data.feedbacks || [];
      setFeedbacks(allFeedbacks);

      // Calculate stats
      const unread = allFeedbacks.filter(
        (f: Feedback) => f.status === "new",
      ).length;
      const byType: Record<string, number> = {};
      let totalRating = 0;
      let ratingCount = 0;
      const ratings = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

      allFeedbacks.forEach((f: Feedback) => {
        byType[f.type] = (byType[f.type] || 0) + 1;
        if (f.rating) {
          totalRating += f.rating;
          ratingCount += 1;
          ratings[f.rating as keyof typeof ratings]++;
        }
      });

      setStats({
        total: allFeedbacks.length,
        unread,
        byType,
        avgRating: ratingCount > 0 ? totalRating / ratingCount : 0,
        ratings,
      });
    } catch (error) {
      console.error("Failed to load feedback:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/feedback/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setFeedbacks(
          feedbacks.map((f) => (f.id === id ? { ...f, status: newStatus } : f)),
        );
      }
    } catch (error) {
      console.error("Failed to update feedback:", error);
    }
  };

  const filteredFeedbacks = feedbacks
    .filter((f) => (statusFilter === "all" ? true : f.status === statusFilter))
    .sort((a, b) => {
      if (sortBy === "date") {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      } else {
        return (b.rating || 0) - (a.rating || 0);
      }
    });

  const getTypeEmoji = (type: string) => {
    return FEEDBACK_TYPES[type as keyof typeof FEEDBACK_TYPES]?.emoji || "💬";
  };

  const getTypeLabel = (type: string) => {
    return FEEDBACK_TYPES[type as keyof typeof FEEDBACK_TYPES]?.label || "Other";
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#0a0e27",
        color: "#00ff00",
        fontFamily: "monospace",
        padding: "16px",
        fontSize: "11px",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            borderBottom: "1px solid #00ff00",
            paddingBottom: "12px",
            marginBottom: "16px",
          }}
        >
          <h1 style={{ fontSize: "20px", margin: "0 0 4px 0", letterSpacing: "2px" }}>
            ADMIN FEEDBACK
          </h1>
          <div style={{ color: "#00aa00", fontSize: "10px" }}>
            Total submissions: {stats.total} | Unread: {stats.unread}
          </div>
        </div>

        {/* Statistics Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "12px",
            marginBottom: "24px",
          }}
        >
          {/* Unread Count */}
          <div
            style={{
              border: "1px solid #00ff00",
              padding: "12px",
              backgroundColor: "#050a15",
            }}
          >
            <div style={{ color: "#00aa00", fontSize: "10px" }}>UNREAD</div>
            <div style={{ fontSize: "24px", fontWeight: "bold", margin: "8px 0" }}>
              {stats.unread}
            </div>
            <div style={{ fontSize: "10px", color: "#008800" }}>new feedback</div>
          </div>

          {/* Average Rating */}
          <div
            style={{
              border: "1px solid #00ff00",
              padding: "12px",
              backgroundColor: "#050a15",
            }}
          >
            <div style={{ color: "#00aa00", fontSize: "10px" }}>AVG RATING</div>
            <div style={{ fontSize: "24px", fontWeight: "bold", margin: "8px 0" }}>
              {stats.avgRating.toFixed(1)}★
            </div>
            <div style={{ fontSize: "10px", color: "#008800" }}>
              {Object.values(stats.ratings).reduce((a, b) => a + b, 0)} rated
            </div>
          </div>

          {/* Most Common Type */}
          <div
            style={{
              border: "1px solid #00ff00",
              padding: "12px",
              backgroundColor: "#050a15",
            }}
          >
            <div style={{ color: "#00aa00", fontSize: "10px" }}>TOP TYPE</div>
            <div style={{ fontSize: "18px", margin: "8px 0" }}>
              {Object.entries(stats.byType).length > 0 ? (
                <>
                  {
                    getTypeEmoji(
                      Object.entries(stats.byType).reduce((a, b) =>
                        b[1] > a[1] ? b : a,
                      )[0],
                    )
                  }{" "}
                  {
                    getTypeLabel(
                      Object.entries(stats.byType).reduce((a, b) =>
                        b[1] > a[1] ? b : a,
                      )[0],
                    )
                  }
                </>
              ) : (
                "-"
              )}
            </div>
          </div>
        </div>

        {/* Type Distribution Chart */}
        <div
          style={{
            border: "1px solid #00ff00",
            padding: "12px",
            marginBottom: "24px",
            backgroundColor: "#050a15",
          }}
        >
          <div style={{ color: "#00aa00", fontSize: "10px", marginBottom: "12px" }}>
            TYPE DISTRIBUTION
          </div>
          {Object.entries(stats.byType).length > 0 ? (
            <div>
              {Object.entries(stats.byType)
                .sort((a, b) => b[1] - a[1])
                .map(([type, count]) => {
                  const percentage =
                    (count / stats.total) * 100 || 0;
                  return (
                    <div key={type} style={{ marginBottom: "8px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2px" }}>
                        <span>
                          {getTypeEmoji(type)} {getTypeLabel(type)}
                        </span>
                        <span>{count}</span>
                      </div>
                      <div
                        style={{
                          height: "8px",
                          backgroundColor: "#0a0e27",
                          border: "1px solid #00ff00",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${percentage}%`,
                            backgroundColor: "#00ff00",
                            transition: "width 0.3s",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          ) : (
            <div style={{ color: "#00aa00" }}>No feedback yet</div>
          )}
        </div>

        {/* Rating Distribution */}
        <div
          style={{
            border: "1px solid #00ff00",
            padding: "12px",
            marginBottom: "24px",
            backgroundColor: "#050a15",
          }}
        >
          <div style={{ color: "#00aa00", fontSize: "10px", marginBottom: "12px" }}>
            RATING DISTRIBUTION
          </div>
          <div style={{ display: "flex", gap: "8px", alignItems: "flex-end", height: "80px" }}>
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = stats.ratings[rating as keyof typeof stats.ratings];
              const maxCount = Math.max(...Object.values(stats.ratings));
              const height = maxCount > 0 ? (count / maxCount) * 100 : 0;

              return (
                <div key={rating} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div
                    style={{
                      width: "100%",
                      height: `${height}px`,
                      backgroundColor: "#00ff00",
                      marginBottom: "4px",
                      minHeight: "4px",
                    }}
                  />
                  <div style={{ fontSize: "10px" }}>{rating}★</div>
                  <div style={{ fontSize: "9px", color: "#00aa00" }}>{count}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Controls */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginBottom: "16px",
            flexWrap: "wrap",
          }}
        >
          <div>
            <label style={{ fontSize: "10px", color: "#00aa00" }}>Status: </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                padding: "4px 6px",
                fontSize: "11px",
                border: "1px solid #00ff00",
                backgroundColor: "#0a0e27",
                color: "#00ff00",
                marginLeft: "4px",
              }}
            >
              <option value="all">All</option>
              <option value="new">New</option>
              <option value="read">Read</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: "10px", color: "#00aa00" }}>Sort: </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "date" | "rating")}
              style={{
                padding: "4px 6px",
                fontSize: "11px",
                border: "1px solid #00ff00",
                backgroundColor: "#0a0e27",
                color: "#00ff00",
                marginLeft: "4px",
              }}
            >
              <option value="date">Date (Newest)</option>
              <option value="rating">Rating (Highest)</option>
            </select>
          </div>

          <button
            onClick={loadFeedback}
            style={{
              padding: "4px 8px",
              fontSize: "11px",
              border: "1px solid #00ff00",
              backgroundColor: "transparent",
              color: "#00ff00",
              cursor: "pointer",
              marginLeft: "auto",
            }}
          >
            🔄 Refresh
          </button>
        </div>

        {/* Feedback Cards */}
        <div style={{ marginTop: "20px" }}>
          <div style={{ color: "#00aa00", fontSize: "10px", marginBottom: "12px" }}>
            FEEDBACK LIST ({filteredFeedbacks.length})
          </div>

          {loading ? (
            <div style={{ color: "#00aa00" }}>Loading feedback...</div>
          ) : filteredFeedbacks.length === 0 ? (
            <div style={{ color: "#00aa00" }}>No feedback found</div>
          ) : (
            <div style={{ display: "grid", gap: "12px" }}>
              {filteredFeedbacks.map((feedback) => (
                <div
                  key={feedback.id}
                  style={{
                    border: feedback.status === "new" ? "1px solid #ffaa00" : "1px solid #00ff00",
                    padding: "12px",
                    backgroundColor:
                      feedback.status === "new" ? "#0f0a05" : "#050a15",
                  }}
                >
                  {/* Card Header */}
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "8px",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "4px" }}>
                        <span style={{ fontSize: "14px" }}>
                          {getTypeEmoji(feedback.type)}
                        </span>
                        <span style={{ color: "#00aa00", fontWeight: "bold" }}>
                          {getTypeLabel(feedback.type)}
                        </span>
                        {feedback.rating && (
                          <span style={{ color: "#ffaa00" }}>
                            {"⭐".repeat(feedback.rating)}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: "9px", color: "#00aa00" }}>
                        {feedback.username ? `@${feedback.username}` : feedback.userId ? `FID: ${feedback.userId}` : "Anonymous"}
                        {" · "}
                        {new Date(feedback.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: "6px" }}>
                      <select
                        value={feedback.status}
                        onChange={(e) =>
                          updateStatus(feedback.id, e.target.value)
                        }
                        style={{
                          padding: "2px 4px",
                          fontSize: "9px",
                          border: "1px solid #00ff00",
                          backgroundColor: "#0a0e27",
                          color: "#00ff00",
                        }}
                      >
                        <option value="new">New</option>
                        <option value="read">Read</option>
                        <option value="resolved">Resolved</option>
                      </select>
                    </div>
                  </div>

                  {/* Message */}
                  <div
                    style={{
                      backgroundColor: "#0a0e27",
                      padding: "8px",
                      border: "1px solid #003300",
                      marginTop: "8px",
                      lineHeight: "1.4",
                      wordBreak: "break-word",
                    }}
                  >
                    {feedback.message}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
