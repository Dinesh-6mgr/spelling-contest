// File: src/pages/AllQuestions.jsx
import { useState, useEffect, useMemo } from "react";
import { apiGet, API_BASE } from "../services/api";
import { Document, Packer, Paragraph, TextRun } from "docx";
import { saveAs } from "file-saver";

const ADMIN_PASSWORD = "1234"; // change as needed

export default function AllQuestions() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(
    localStorage.getItem("adminLoggedIn") === "true"
  );
  const [passwordInput, setPasswordInput] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editAnswer, setEditAnswer] = useState("");
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Load questions
  const loadQuestions = async () => {
    setLoading(true);
    try {
      const res = await apiGet("/api/questions");
      // Your apiGet previously returned { data: [...] } directly.
      setQuestions(res.data || []);
    } catch (err) {
      alert("Failed to load questions: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Try login
  const tryPassword = () => {
    if (passwordInput === ADMIN_PASSWORD) {
      setAuthorized(true);
      localStorage.setItem("adminLoggedIn", "true");
      loadQuestions();
    } else {
      alert("Incorrect password ❌");
    }
  };

  // Logout
  const logout = () => {
    setAuthorized(false);
    localStorage.removeItem("adminLoggedIn");
  };

  // Delete single question
  const deleteQuestion = async (id) => {
    if (!window.confirm("Delete this question?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/questions/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      setQuestions((prev) => prev.filter((q) => q._id !== id));
    } catch (err) {
      alert("Failed to delete: " + err.message);
    }
  };

  // Delete ALL questions
  const deleteAllQuestions = async () => {
    if (!window.confirm("⚠️ This will remove ALL questions and audio files. Continue?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/questions`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete all");
      setQuestions([]);
      alert("All questions deleted ✅");
    } catch (err) {
      alert("Failed to delete all: " + err.message);
    }
  };

  // Start editing
  const startEditing = (id, currentAnswer) => {
    setEditingId(id);
    setEditAnswer(currentAnswer ?? "");
  };

  // Save edit
  const saveEdit = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/api/questions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ originalAnswer: editAnswer }),
      });
      if (!res.ok) throw new Error("Failed to update");

      setQuestions((prev) =>
        prev.map((q) =>
          q._id === id ? { ...q, originalAnswer: editAnswer } : q
        )
      );
      setEditingId(null);
    } catch (err) {
      alert("Update failed: " + err.message);
    }
  };

  // Export to Word
  const exportToWord = () => {
    if (questions.length === 0) return alert("No data to export");
    const doc = new Document({
      sections: [
        {
          children: [
            new Paragraph({
              spacing: { after: 200 },
              children: [
                new TextRun({ text: "All Uploaded Questions", bold: true, size: 32 }),
              ],
            }),
            ...questions.map((q, i) =>
              new Paragraph({
                spacing: { after: 100 },
                children: [
                  new TextRun({ text: `Q${q.questionNo ?? i + 1}: `, bold: true }),
                  new TextRun({ text: q.originalAnswer || "N/A" }),
                ],
              })
            ),
          ],
        },
      ],
    });

    Packer.toBlob(doc).then((blob) => {
      saveAs(blob, "questions.docx");
    });
  };

  // Refresh button
  const refresh = async () => {
    setRefreshing(true);
    await loadQuestions();
    setRefreshing(false);
  };

  // Filter
  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return questions;
    return questions.filter((q) => {
      const no = String(q.questionNo ?? "");
      const ans = String(q.originalAnswer ?? "").toLowerCase();
      return no.includes(s) || ans.includes(s);
    });
  }, [search, questions]);

  useEffect(() => {
    if (authorized) loadQuestions();
  }, [authorized]);

  // --- UI ---
  if (!authorized)
    return (
      <div style={styles.centered}>
        <h2 style={{ marginBottom: 12 }}>🔒 Admin Access Required</h2>
        <input
          type="password"
          placeholder="Enter admin password"
          value={passwordInput}
          onChange={(e) => setPasswordInput(e.target.value)}
          style={styles.input}
        />
        <button onClick={tryPassword} style={styles.primaryBtn}>Enter</button>
      </div>
    );

  if (loading)
    return <p style={styles.centered}>Loading…</p>;

  return (
    <div style={{ padding: 20, maxWidth: 1100, margin: "0 auto" }}>
      {/* Toolbar */}
      <div style={styles.toolbar}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <h2 style={{ margin: 0 }}>📄 All Questions</h2>
          <span style={styles.countBadge}>{questions.length}</span>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input
            placeholder="Search by SN or answer…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ ...styles.input, minWidth: 220 }}
          />
          <button onClick={exportToWord} style={styles.primaryBtn}>📥 Export</button>
          <button onClick={refresh} style={styles.outlineBtn}>
            {refreshing ? "Refreshing…" : "↻ Refresh"}
          </button>
          <button onClick={deleteAllQuestions} style={styles.warningBtn}>🗑️ Delete All</button>
          <button onClick={logout} style={styles.dangerBtn}>Logout</button>
        </div>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <p style={{ textAlign: "center", color: "#777", marginTop: 30 }}>
          No questions found.
        </p>
      ) : (
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>SN</th>
                <th style={styles.th}>Answer</th>
                <th style={styles.th}>Audio</th>
                <th style={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((q) => (
                <tr key={q._id} style={styles.tr}>
                  <td style={styles.td}>
                    <span style={styles.snPill}>{q.questionNo}</span>
                  </td>
                  <td style={styles.td}>
                    {editingId === q._id ? (
                      <div style={{ display: "flex", gap: 8 }}>
                        <input
                          type="text"
                          value={editAnswer}
                          onChange={(e) => setEditAnswer(e.target.value)}
                          style={{ ...styles.input, width: "100%" }}
                        />
                        <button onClick={() => saveEdit(q._id)} style={styles.successBtn}>
                          Save
                        </button>
                      </div>
                    ) : (
                      <span style={{ color: "#0a7c2f", fontWeight: 600 }}>
                        {q.originalAnswer}
                      </span>
                    )}
                  </td>
                  <td style={styles.td}>
                    {q.audioUrl ? (
                      <audio
                        controls
                        src={`${API_BASE}${q.audioUrl}`}
                        style={{ width: 220 }}
                      />
                    ) : (
                      <span style={{ color: "#999" }}>No audio</span>
                    )}
                  </td>
                  <td style={styles.td}>
                    {editingId !== q._id && (
                      <button
                        onClick={() => startEditing(q._id, q.originalAnswer)}
                        style={styles.outlineBtn}
                      >
                        ✏️ Edit
                      </button>
                    )}
                    <button
                      onClick={() => deleteQuestion(q._id)}
                      style={styles.dangerBtn}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ---- Styles (no extra libs) ---- */
const styles = {
  centered: {
    display: "flex", flexDirection: "column", alignItems: "center",
    justifyContent: "center", height: "70vh", gap: 12, color: "#333",
  },
  input: {
    padding: "8px 12px", borderRadius: 8, border: "1px solid #cfd4dc",
    outline: "none", fontSize: 14,
  },
  primaryBtn: {
    padding: "8px 14px", borderRadius: 10, border: "none",
    background: "#2563eb", color: "#fff", cursor: "pointer", fontWeight: 600,
    boxShadow: "0 2px 8px rgba(37,99,235,0.3)",
  },
  outlineBtn: {
    padding: "8px 14px", borderRadius: 10, border: "1px solid #cfd4dc",
    background: "#fff", color: "#333", cursor: "pointer", fontWeight: 600,
  },
  successBtn: {
    padding: "8px 12px", borderRadius: 10, border: "none",
    background: "#16a34a", color: "#fff", cursor: "pointer", fontWeight: 600,
  },
  warningBtn: {
    padding: "8px 14px", borderRadius: 10, border: "none",
    background: "#f59e0b", color: "#fff", cursor: "pointer", fontWeight: 700,
  },
  dangerBtn: {
    padding: "8px 12px", borderRadius: 10, border: "none",
    background: "#dc2626", color: "#fff", cursor: "pointer", fontWeight: 700,
    marginLeft: 8,
  },
  toolbar: {
    position: "sticky", top: 0, zIndex: 5, background: "#fff",
    padding: "12px 0", marginBottom: 16, display: "flex",
    justifyContent: "space-between", alignItems: "center", gap: 12,
    borderBottom: "1px solid #eee",
  },
  countBadge: {
    background: "#eef2ff", color: "#4338ca", padding: "2px 8px",
    borderRadius: 999, fontSize: 12, fontWeight: 700,
  },
  tableWrap: {
    border: "1px solid #eee", borderRadius: 14, overflow: "hidden",
    boxShadow: "0 8px 24px rgba(0,0,0,0.06)",
  },
  table: {
    width: "100%", borderCollapse: "separate", borderSpacing: 0, background: "#fff",
  },
  th: {
    textAlign: "left", fontWeight: 700, fontSize: 13, color: "#475569",
    background: "#f8fafc", padding: "12px 14px", borderBottom: "1px solid #eee",
    position: "sticky", top: 56, // sit under toolbar if scrolling
    zIndex: 1,
  },
  tr: { borderBottom: "1px solid #f1f5f9" },
  td: { padding: "12px 14px", fontSize: 14, verticalAlign: "middle" },
  snPill: {
    display: "inline-block", background: "#f1f5f9", borderRadius: 999,
    padding: "4px 10px", fontWeight: 700, color: "#334155",
  },
};
