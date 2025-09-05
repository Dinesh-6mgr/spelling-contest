// App.jsx
import React, { useState } from "react";
import { Routes, Route, NavLink } from "react-router-dom";
import { FiMaximize, FiMinimize } from "react-icons/fi"; 
import Home from "./pages/Home.jsx";
import Upload from "./pages/Upload.jsx";
import Contest from "./pages/Contest.jsx";
import AllQuestions from "./pages/AllQuestions.jsx";
import Rules from "./pages/Rule.jsx";

const FullscreenButton = () => {
  const [isFull, setIsFull] = useState(false);
  const toggleFullscreen = () => {
    if (!isFull) document.documentElement.requestFullscreen().catch((err) => alert(err.message));
    else document.exitFullscreen();
    setIsFull(!isFull);
  };
  return (
    <button className="fullscreen-btn" onClick={toggleFullscreen} title={isFull ? "Exit Fullscreen" : "Fullscreen"}>
      {isFull ? <FiMinimize size={20} /> : <FiMaximize size={20} />}
    </button>
  );
};

const linkStyle = ({ isActive }) => ({
  textDecoration: "none",
  color: isActive ? "#FFB400" : "#fff",
  fontWeight: 600,
  padding: "10px 20px",
  borderRadius: "12px",
  backgroundColor: isActive ? "rgba(0,0,0,0.2)" : "transparent",
  transition: "all 0.3s",
});

const App = () => {
  const cards = [
    { title: "Home", desc: "Explore contest details and updates.", path: "/" },
    { title: "Rules", desc: "View contest rules and instructions.", path: "/rules" },
    { title: "Upload", desc: "Upload your contest entries quickly.", path: "/upload" },
    { title: "Contest", desc: "View contest schedule and updates.", path: "/contest" },
    { title: "All Questions", desc: "Access all past contest questions here.", path: "/all-questions" },
  ];

  return (
    <div className="app-container">
      <nav className="navbar">
        {/* ✅ Logo also highlights when active (Home) */}
        <NavLink 
          to="/" 
          style={({ isActive }) => ({
            textDecoration: "none",
            color: isActive ? "#FFD700" : "#fff", // golden highlight
            fontWeight: 800,
            fontSize: "1.8rem",
          })}
        >
          देवचुली शिक्षा शाखा
        </NavLink>

        <div className="nav-links">
          <NavLink to="/" style={linkStyle}>Home</NavLink>
          <NavLink to="/rules" style={linkStyle}>Rules</NavLink>
          <NavLink to="/contest" style={linkStyle}>Contest</NavLink>
          <NavLink to="/upload" style={linkStyle}>Upload</NavLink>
          <NavLink to="/all-questions" style={linkStyle}>All Questions</NavLink>
          <FullscreenButton />
        </div>
      </nav>

      <main className="main-content">
        <Routes>
          <Route path="/" element={
            <>
             <header className="header-section">
  <h1>नगर स्तरीय Spelling Contest 2082</h1>
  <h2>आयोजकः देवचुली नगरपालिका शिक्षा शाखा</h2>
  <h2>स्थानः श्री जनज्योति माध्यमिक विद्यालय, देवचुली-१४</h2>
</header>

              <div className="card-grid">
                {cards.map((card) => (
                  <NavLink key={card.title} to={card.path} className="card">
                    <h2>{card.title}</h2>
                    <p>{card.desc}</p>
                  </NavLink>
                ))}
              </div>
            </>
          } />
          <Route path="/rules" element={<Rules />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/contest" element={<Contest />} />
          <Route path="/all-questions" element={<AllQuestions />} />
        </Routes>
      </main>

      <footer className="footer">
        <p>© {new Date().getFullYear()} देवचुली शिक्षा शाखा | Spelling Contest 2082</p>
        <p>Organized at श्री जनज्योति माध्यमिक विद्यालय, देवचुली-१४</p>
      </footer>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        html, body, #root {
          height: 100%;
        }

        body {
          background-image: url('/image.png');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          background-attachment: fixed;
          font-family: 'Poppins', sans-serif;
        }
          .header-section h1 {
  font-size: 2.8rem;
  margin-bottom: 15px;
  font-weight: 800;
  color: #D97706; /* nice orange highlight */
}

.header-section h2 {
  font-size: 1.4rem;
  font-weight: 600;
  margin: 6px 0;
  color: #374151; /* dark gray */
}


        .app-container {
          display: flex;
          flex-direction: column;
          min-height: 100vh;
          color: #111827;
        }

        .navbar {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 40px;
          height: 70px;
          background: linear-gradient(90deg, #FFB400, #F97316);
          color: #fff;
          z-index: 1000;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          overflow-x: auto;
        }

        .nav-links { display: flex; gap: 6px; align-items: center; flex-wrap: nowrap; }

        .fullscreen-btn { padding: 6px 10px; border-radius: 12px; border: none; font-weight: 600; cursor: pointer; background-color: #fff; color: #F97316; }

        .main-content { flex: 1; padding: 80px 30px 80px; margin-top: -10px; }

        .header-section { background: rgba(255,255,255,0.85); color: #111827; padding: 60px 30px; text-align: center; border-radius: 25px; box-shadow: 0 10px 20px rgba(0,0,0,0.2); margin-bottom: 40px; }

        .header-section h1 { font-size: 3rem; margin-bottom: 15px; }
        .header-section p { font-size: 1.25rem; max-width: 800px; margin: 0 auto; }

        .card-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; }
        .card { background: rgba(255,255,255,0.9); padding: 30px; border-radius: 20px; box-shadow: 0 6px 15px rgba(0,0,0,0.1); text-align: center; text-decoration: none; color: #1F2937; }
        .card:hover { transform: translateY(-8px); box-shadow: 0 12px 24px rgba(0,0,0,0.15); }
        .card h2 { font-size: 1.5rem; margin-bottom: 10px; }
        .card p { font-size: 1rem; color: #6B7280; }

        .footer { position: fixed; bottom: 0; left: 0; width: 100%; background: linear-gradient(90deg, #FFB400, #F97316); color: #fff; text-align: center; padding: 20px 0; }
        .footer p { margin: 4px 0; font-size: 14px; }
      `}</style>
    </div>
  );
};

export default App;
