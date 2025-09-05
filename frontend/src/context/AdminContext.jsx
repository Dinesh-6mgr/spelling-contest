import { useState } from "react";
import { apiPost } from "../services/api";
import { useAdmin } from "../context/AdminContext.jsx";

const ADMIN_PASSWORD = "1234";

export default function Upload() {
  const { isAdmin, setIsAdmin } = useAdmin();
  const [passwordInput, setPasswordInput] = useState("");
  const [questionNo, setQuestionNo] = useState("");
  const [answer, setAnswer] = useState("");
  const [audio, setAudio] = useState(null);
  const [msg, setMsg] = useState("");

  const tryPassword = () => {
    if (passwordInput === ADMIN_PASSWORD) setIsAdmin(true);
    else {
      alert("Incorrect password ❌");
      setPasswordInput("");
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      const form = new FormData();
      form.append("questionNo", questionNo);
      form.append("answer", answer);
      form.append("audio", audio);

      const res = await apiPost("/api/questions/upload", form, true);
      setMsg(res.message || "✅ Uploaded successfully!");
      setQuestionNo("");
      setAnswer("");
      setAudio(null);
      e.target.reset();
    } catch (err) {
      setMsg("❌ " + (err.message || "Upload failed"));
    }
  };

  if (!isAdmin)
    return (
      <div style={styles.centered}>
        <h2>🔒 Admin Access Required</h2>
        <input
          type="password"
          placeholder="Enter admin password"
          value={passwordInput}
          onChange={(e) => setPasswordInput(e.target.value)}
          style={styles.input}
        />
        <button onClick={tryPassword} style={styles.button}>
          Enter
        </button>
      </div>
    );

  return (
    <div style={styles.container}>
      <h2>📤 Upload Question (Admin)</h2>
      <form onSubmit={submit} style={styles.form}>
        <input type="number" placeholder="Question No" required value={questionNo} onChange={e => setQuestionNo(e.target.value)} />
        <input type="text" placeholder="Correct Spelling" required value={answer} onChange={e => setAnswer(e.target.value)} />
        <input type="file" accept="audio/*" required onChange={e => setAudio(e.target.files[0])} />
        <button type="submit">Upload</button>
      </form>
      {msg && <p>{msg}</p>}
    </div>
  );
}

// Add your styles (similar to before)
