// File: src/components/Navbar.jsx
import { Link } from "react-router-dom";

export default function Navbar({ onLogout }) {
  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.link}>
        Upload
      </Link>
      <Link to="/all-questions" style={styles.link}>
        All Questions
      </Link>
      <button onClick={onLogout} style={styles.logoutBtn}>
        Logout
      </button>
    </nav>
  );
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 20px",
    background: "#3498db",
    color: "#fff",
  },
  link: {
    color: "#fff",
    textDecoration: "none",
    marginRight: 15,
    fontWeight: "bold",
  },
  logoutBtn: {
    background: "#e74c3c",
    color: "#fff",
    border: "none",
    padding: "6px 12px",
    borderRadius: 6,
    cursor: "pointer",
  },
};
