import { useState, useEffect } from "react";
import { apiPost, apiGet } from "../services/api";

export default function Upload() {
  const [questionNo, setQuestionNo] = useState(""); // starting SN
  const [files, setFiles] = useState([]);           // multiple files
  const [msg, setMsg] = useState("");
  const [existingQuestions, setExistingQuestions] = useState([]);

  // Load existing questions and auto-detect next SN
  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await apiGet("/api/questions");
        setExistingQuestions(res.data || []);

        const numbers = res.data.map(q => Number(q.questionNo)).sort((a,b)=>a-b);
        let nextSN = 1;
        for (let i=0;i<numbers.length;i++){
          if(numbers[i] !== i+1){
            nextSN = i+1;
            break;
          }
          nextSN = numbers.length+1;
        }
        setQuestionNo(nextSN);
      } catch(err){
        console.error("Failed to load questions:", err);
      }
    }
    fetchQuestions();
  }, []);

  // When selecting files
  const handleFilesChange = (e) => {
    const selectedFiles = Array.from(e.target.files || []);
    const filesWithAnswers = selectedFiles.map((file, idx) => ({
      file,
      answer: file.name.replace(/\.[^/.]+$/, ""), // auto answer from file name
      sn: Number(questionNo) + idx               // auto SN
    }));
    setFiles(filesWithAnswers);
  };

  // Upload all files
  const submit = async (e) => {
    e.preventDefault();
    setMsg("");
    try {
      for (let f of files) {
        const form = new FormData();
        form.append("questionNo", f.sn);
        form.append("answer", f.answer);
        form.append("audio", f.file);

        await apiPost("/api/questions/upload", form, true);
      }
      setMsg(`✅ ${files.length} file(s) uploaded successfully!`);
      setFiles([]);
      setQuestionNo(prev => Number(prev) + files.length); // next SN
      e.target.reset();
    } catch (err) {
      setMsg("❌ " + (err.message || "Upload failed"));
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>📤 Upload Questions (Admin)</h2>
      <form onSubmit={submit} style={styles.form}>
        <div style={styles.field}>
          <label style={styles.label}>Starting Question No:</label>
          <input
            type="number"
            required
            value={questionNo}
            onChange={(e)=>setQuestionNo(e.target.value)}
            style={styles.input}
            min="1"
          />
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Select Audio File(s):</label>
          <input
            type="file"
            accept="audio/*"
            multiple
            required
            onChange={handleFilesChange}
            style={styles.inputFile}
          />
        </div>

        {files.map((f, idx) => (
          <div key={idx} style={styles.field}>
            <label style={styles.label}>QNo {f.sn} Answer:</label>
            <input
              type="text"
              required
              value={f.answer}
              onChange={(e)=>{
                const newFiles = [...files];
                newFiles[idx].answer = e.target.value;
                setFiles(newFiles);
              }}
              style={styles.input}
            />
          </div>
        ))}

        <button type="submit" style={styles.button}>Upload All</button>
      </form>

      {msg && <p style={styles.msg}>{msg}</p>}
    </div>
  );
}

const styles = {
  container: { maxWidth: 500, margin: "0 auto", padding: 24, background: "#f9f9f9", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.05)", fontFamily: "Arial, sans-serif" },
  heading: { marginBottom: 20, color: "#2c3e50" },
  form: { display: "flex", flexDirection: "column", gap: 12 },
  field: { display: "flex", flexDirection: "column" },
  label: { marginBottom: 4, fontWeight: "bold" },
  input: { padding: "8px 12px", borderRadius: 6, border: "1px solid #ccc", fontSize: 16 },
  inputFile: { padding: "6px 0", fontSize: 16 },
  button: { marginTop: 12, padding: "10px 16px", borderRadius: 6, border: "none", background: "#3498db", color: "#fff", fontSize: 16, cursor: "pointer" },
  msg: { marginTop: 12, fontWeight: "bold" },
};
