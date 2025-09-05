import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div>
      {/* Navbar */}
     
      {/* Main content */}
      <div style={styles.container}>
        <h2 style={styles.heading}>👋 Welcome!</h2>
        <p style={styles.paragraph}>
          Use <b>Upload</b> to add an audio file and the correct spelling for a question number.
          Contestants go to <b>Contest</b> to listen and type the spelling.
        </p>

        <div style={styles.card}>
          <h3 style={styles.subHeading}>Guidelines</h3>
          <ul style={styles.list}>
            <li>Each question has a unique <b>Question Number</b>.</li>
            <li>Re-uploading the same number will <b>update</b> the question.</li>
            <li>Checking is case/space/hyphen/accents insensitive.</li>
            <li>See <b>All Questions</b> to review everything uploaded.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

const styles = {
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 28px",
    backgroundColor: "#ffffff",
    color: "#2c3e50",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  logo: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  navLinks: {
    listStyle: "none",
    display: "flex",
    gap: 24,
    margin: 0,
    padding: 0,
  },
  link: {
    color: "#2c3e50",
    textDecoration: "none",
    fontWeight: 500,
    fontSize: 16,
    padding: "6px 12px",
    borderRadius: 8,
    transition: "all 0.3s ease",
  },
  container: {
    padding: 24,
    maxWidth: 800,
    margin: "0 auto",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  heading: {
    fontSize: 32,
    marginBottom: 16,
    color: "#2c3e50",
  },
  paragraph: {
    fontSize: 18,
    marginBottom: 24,
    lineHeight: 1.8,
    color: "#34495e",
  },
  card: {
    background: "#fefefe",
    padding: 24,
    borderRadius: 12,
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  },
  subHeading: {
    marginBottom: 16,
    color: "#34495e",
    fontSize: 22,
  },
  list: {
    paddingLeft: 20,
    lineHeight: 1.6,
    color: "#2c3e50",
  },
};

// Hover effect added via inline style
styles.link[":hover"] = {
  backgroundColor: "#f1f3f5",
  color: "#0077ff",
};
