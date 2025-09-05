import { useState, useEffect, useRef } from "react";
import { apiGet, apiPost, API_BASE } from "../services/api";

export default function Contest() {
  const [allQuestions, setAllQuestions] = useState([]);
  const [remaining, setRemaining] = useState([]);
  const [qNo, setQNo] = useState("");
  const [qData, setQData] = useState(null);
  const [answer, setAnswer] = useState("");
  const [result, setResult] = useState(null);
  const [showCorrect, setShowCorrect] = useState(false);
  const [questionStarterIndex, setQuestionStarterIndex] = useState(null);
  const [loading, setLoading] = useState(false);

  // NEW: track if current question was passed
  const [passed, setPassed] = useState(false);
  const [passedTeamIndex, setPassedTeamIndex] = useState(null);

  // Points setup
  const [points, setPoints] = useState([]);
  const addPointBox = () => setPoints([...points, "10"]);
  const removePointBox = () => {
    if (points.length > 0) setPoints(points.slice(0, -1));
  };
  const updatePointBox = (index, value) => {
    const newPoints = [...points];
    newPoints[index] = value;
    setPoints(newPoints);
  };

  // Timers
  const [timers, setTimers] = useState([30]);
  const [timerIndex, setTimerIndex] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [timerStarted, setTimerStarted] = useState([]);
  const [showTimerControls, setShowTimerControls] = useState(true);





  // Teams
  const [teams, setTeams] = useState([
    { name: "Team A", score: 0 },
    { name: "Team B", score: 0 },
  ]);

  const [currentTeamIndex, setCurrentTeamIndex] = useState(0);
  const [direction, setDirection] = useState("clockwise");

  const countdownInterval = useRef(null);
  const countdownSound = useRef(null);
  const correctSound = useRef(null);
  const wrongSound = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (teams.length === 0) {
      setCurrentTeamIndex(0);
    } else if (currentTeamIndex >= teams.length) {
      setCurrentTeamIndex(teams.length - 1);
    }
  }, [teams, currentTeamIndex]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    countdownSound.current = new Audio("/sounds/countdown.mp3");
    correctSound.current = new Audio("/sounds/correct.mp3");
    wrongSound.current = new Audio("/sounds/wrong.mp3");
  }, []);

  useEffect(() => {
    setTimerStarted(new Array(timers.length).fill(false));
  }, [timers]);

  useEffect(() => {
    const loadAll = async () => {
      try {
        const res = await apiGet("/api/questions");
        setAllQuestions(res.data);
        setRemaining(res.data.map((q) => q.questionNo).sort((a, b) => a - b));
      } catch (err) {
        console.error("Failed to load questions:", err);
      }
    };
    loadAll();
  }, []);

  // ...existing code...

const loadQuestion = async (number) => {
  const numberToLoad = number || qNo;
  if (!numberToLoad) return;
  setLoading(true);
  setResult(null);
  setShowCorrect(false);
  clearCountdown();
  try {
    const res = await apiGet(`/api/questions/${numberToLoad}`);
    setQData(res.data);
    setQNo(res.data.questionNo);
    setAnswer("");
    setRemaining((prev) => prev.filter((n) => n !== res.data.questionNo));
    setTimerIndex(0);
    setTimerStarted(new Array(timers.length).fill(false));
    setPassed(false); 
    setPassedTeamIndex(null); 
    setQuestionStarterIndex(currentTeamIndex); // <-- Remember who started this question
    setTimeout(() => {
      inputRef.current?.focus();
    }, 300);
  } catch (err) {
    alert(err.message || "Error loading question");
    setQData(null);
  } finally {
    setLoading(false);
  }
};
  

  const checkAnswer = async () => {
    if (!qNo || !answer) return;
    try {
      const res = await apiPost(`/api/questions/check/${qNo}`, { answer });
      setResult(res);
      if (res.correct) correctSound.current?.play().catch(() => {});
      else wrongSound.current?.play().catch(() => {});
    } catch (err) {
      alert(err.message || "Error checking");
    }
  };

  const clearAfterAward = () => {
    setQNo("");
    setQData(null);
    setAnswer("");
    setResult(null);
    setShowCorrect(false);
    clearCountdown();
    setTimerIndex(0);
    setTimerStarted(new Array(timers.length).fill(false));
  };

  const clearCurrent = () => {
    if (qData) {
      setRemaining((prev) => [...prev, qData.questionNo].sort((a, b) => a - b));
    }
    clearAfterAward();
  };

  const restartContest = () => {
    setRemaining(allQuestions.map((q) => q.questionNo).sort((a, b) => a - b));
    clearAfterAward();
  };

  const startTimer = (seconds) => {
    clearCountdown();
    setCountdown(seconds);
    countdownInterval.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearCountdown();
          return 0;
        }
        if (prev <= 10 && countdownSound.current) {
          countdownSound.current.pause();
          countdownSound.current.currentTime = 0;
          countdownSound.current.play().catch(() => {});
        }
        return prev - 1;
      });
    }, 1000);
  };

  const clearCountdown = () => {
    if (countdownInterval.current) clearInterval(countdownInterval.current);
    if (countdownSound.current) {
      countdownSound.current.pause();
      countdownSound.current.currentTime = 0;
    }
  };

  const handleAudioPlay = () => {
    if (!qData) return;
    if (!timerStarted[timerIndex]) {
      startTimer(timers[timerIndex]);
      const updated = [...timerStarted];
      updated[timerIndex] = true;
      setTimerStarted(updated);
    }
  };

  const rotateToNextTeam = () => {
    if (teams.length === 0) return;
    if (direction === "clockwise") {
      setCurrentTeamIndex((prev) => (prev + 1) % teams.length);
    } else {
      setCurrentTeamIndex((prev) => (prev - 1 + teams.length) % teams.length);
    }
  };

const handlePass = () => {
  clearCountdown();
  setCountdown(0);
  const nextIndex = Math.min(timerIndex + 1, timers.length - 1);
  setTimerIndex(nextIndex);
  const updated = [...timerStarted];
  updated[nextIndex] = false;
  setTimerStarted(updated);

  if(!passed)setPassedTeamIndex(currentTeamIndex); // store the team that passed
  setPassed(true); // mark as passed

  rotateToNextTeam();
};



const [answerWasShown, setAnswerWasShown] = useState(false);

  const addTimer = () => setTimers([...timers, 10]);
  const removeTimer = () => {
    if (timers.length > 1) setTimers(timers.slice(0, -1));
  };
  const updateTimer = (index, value) => {
    const newTimers = [...timers];
    newTimers[index] = Number(value);
    setTimers(newTimers);
  };

  const addTeam = () => {
    const newName = `Team ${String.fromCharCode(65 + teams.length)}`;
    setTeams([...teams, { name: newName, score: 0 }]);
  };
  const removeTeam = () => {
    if (teams.length > 0) setTeams(teams.slice(0, -1));
  };
  const updateScore = (index, delta) => {
    const newTeams = [...teams];
    newTeams[index].score = Math.max(0, newTeams[index].score + delta);
    setTeams(newTeams);
  };

  // ✅ FIXED: award points and only rotate if NOT passed
const awardPointsToCurrent = (pts) => {
  const p = Number(pts) || 0;
  if (!p || p <= 0) return alert("❌ Invalid point value");

  const newTeams = [...teams];
  newTeams[currentTeamIndex].score += p;
  setTeams(newTeams);

  // If question was passed and someone else answered, go to next team after the reference team
  if (passed && passedTeamIndex !== null && passedTeamIndex !== currentTeamIndex) {
    // Move to the next team after the reference team, respecting direction
    let nextIndex;
    if (direction === "clockwise") {
      nextIndex = (passedTeamIndex + 1) % teams.length;
    } else {
      nextIndex = (passedTeamIndex - 1 + teams.length) % teams.length;
    }
    setCurrentTeamIndex(nextIndex);
  } else if (!passed) {
    rotateToNextTeam();
  }

  setPassed(false); // reset after awarding
  setPassedTeamIndex(null); // reset after awarding
  clearAfterAward();
};



useEffect(() => {
  if (answerWasShown && questionStarterIndex !== null) {
    let nextIndex;
    if (direction === "clockwise") {
      nextIndex = (questionStarterIndex + 1) % teams.length;
    } else {
      nextIndex = (questionStarterIndex - 1 + teams.length) % teams.length;
    }
    setCurrentTeamIndex(nextIndex);
    setAnswerWasShown(false); // reset for next question
    setQuestionStarterIndex(null); // reset for next question
  }
  // eslint-disable-next-line
}, [answerWasShown]);


















  return (
    <div style={{ display: "flex", gap: 24, padding: 20, flexWrap: "wrap", minHeight: "100vh" }}>
      {/* Left/Main Panel */}
      <div style={{ flex: 1, minWidth: 320 }}>
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
          <h2 style={{
            fontSize: "30px",
            fontWeight: "bold",
            textAlign: "center",
            background: "#2980b9",
            color: "#fff",
            padding: "6px 10px",
            borderRadius: "8px"
          }}>
            Spelling Contest 2082
          </h2>
        </div>

        {/* Timer Section */}
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "flex-start" }}>

          {/* Setup Panel (Timers + Points + Teams + Direction) */}
          <div
            style={{
              flex: "1 1 220px",
              minWidth: "220px",
              background: "#fff",
              padding: 12,
              borderRadius: 10,
              boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
              transition: "all 0.3s ease",
              maxHeight: showTimerControls ? "600px" : "50px", // smooth expand/collapse
            }}
          >
            <button
              onClick={() => setShowTimerControls(!showTimerControls)}
              style={{ ...styles.button, background: "#2980b9", fontSize: 14, padding: "6px 10px", width: "100%" }}
            >
              {showTimerControls ? "Hide Setup" : "Show Setup"}
            </button>

            <div
              style={{
                flex: 1,
                overflowY: "auto",
                transition: "all 0.3s ease",
                opacity: showTimerControls ? 1 : 0,
                height: showTimerControls ? "auto" : 0,
                marginTop: showTimerControls ? 10 : 0,
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              {/* Timer Inputs */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {timers.map((t, i) => (
                  <input
                    key={i}
                    type="number"
                    value={t}
                    onChange={(e) => updateTimer(i, e.target.value)}
                    style={{ ...styles.input, width: 70, height: 32, textAlign: "center", fontSize: 14 }}
                  />
                ))}
              </div>

              {/* Timer Control Buttons */}
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={addTimer} style={{ ...styles.button, flex: 1, background: "#2980b9", fontSize: 13 }}>➕ Timer</button>
                <button onClick={removeTimer} style={{ ...styles.button, flex: 1, background: "#c0392b", fontSize: 13 }}>➖ Timer</button>
              </div>

              {/* Points Setup - configure point boxes here (these are used to award points) */}
              <div style={{ background: "#f8f9fa", padding: 10, borderRadius: 8, display: "flex", flexDirection: "column", gap: 8 }}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {points.map((p, i) => (
                    <input
                      key={i}
                      type="number"
                      placeholder="Enter points"
                      value={p}
                      onChange={(e) => updatePointBox(i, e.target.value)}
                      style={{ ...styles.input, width: 80, height: 32, textAlign: "center", fontSize: 14 }}
                    />
                  ))}
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button onClick={addPointBox} style={{ ...styles.button, flex: 1, background: "#2980b9", fontSize: 13 }}>➕ Point Box</button>
                  <button onClick={removePointBox} style={{ ...styles.button, flex: 1, background: "#c0392b", fontSize: 13 }}>➖ Point Box</button>
                </div>
                <small style={{ color: "#666" }}>Use these point boxes to award points. When a contestant gets it right, click one of the point buttons that appear on the question card.</small>
              </div>

              {/* Team Control Buttons */}
              <div style={{ display: "flex", gap: 6 }}>
                <button onClick={addTeam} style={{ ...styles.button, flex: 1, background: "#2980b9", fontSize: 13 }}>➕ Team</button>
                <button onClick={removeTeam} style={{ ...styles.button, flex: 1, background: "#c0392b", fontSize: 13 }}>➖ Team</button>
              </div>

              {/* Turn Direction Control */}
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 4 }}>
                <label style={{ fontWeight: 600 }}>Turn Direction:</label>
                <select value={direction} onChange={(e) => setDirection(e.target.value)} style={{ ...styles.input, width: 200 }}>
                  <option value="clockwise">⏩ Clockwise</option>
                  <option value="anticlockwise">⏪ Anticlockwise</option>
                </select>
              </div>

              {/* Current Team indicator */}
              <div style={{ marginTop: 4 }}>
                <span style={{ fontWeight: 600 }}>Current Team:&nbsp;</span>
                <span>{teams[currentTeamIndex]?.name ?? "—"}</span>
              </div>
            </div>
          </div>

          {/* Countdown Panel */}
          <div style={{
            flex: "1 1 260px",
            minWidth: "260px",
            background: "#fff",
            padding: 12,
            borderRadius: 10,
            boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            gap: 8
          }}>
            <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
              <button onClick={() => startTimer(timers[timerIndex])} style={{ ...styles.button, background: "#27ae60", fontSize: 14, padding: "6px 14px" }}>▶ Start</button>
              <button onClick={clearCountdown} style={{ ...styles.button, background: "#e74c3c", fontSize: 14, padding: "6px 14px" }}>⏹ Stop</button>
            </div>

            <h1 style={{ color: countdown <= 5 ? "#e74c3c" : "#2980b9", fontSize: "90px", margin: 0, fontWeight: 900, textShadow: "2px 2px 8px rgba(0,0,0,0.2)", lineHeight: 1 }}>{countdown}s</h1>

            <p style={{ fontSize: 14, margin: "4px 0 0", color: "#34495e" }}>Timer {timerIndex + 1}/{timers.length} → {timers[timerIndex]}s</p>
          </div>
        </div>

        {/* Remaining Questions */}
        <div style={{ marginTop: 10, marginBottom: 20 }}>
          <h3 style={{ marginBottom: 12 }}>📋 Remaining Questions</h3>
          {remaining.length === 0 ? (
            <p style={{ fontSize: "18px", fontWeight: "600", color: "#27ae60" }}>All questions completed! 🎉</p>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, maxHeight: 250, overflowY: "auto", padding: 4 }}>
              {remaining.map((n) => (
                <div key={n} onClick={() => loadQuestion(n)} style={{ width: "50px", height: "50px", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "#3498db", color: "white", borderRadius: "50%", cursor: "pointer", fontWeight: "bold", fontSize: "18px", boxShadow: "0 4px 8px rgba(0,0,0,0.15)", transition: "0.25s" }} onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#2980b9")} onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#3498db")}>{n}</div>
              ))}
            </div>
          )}
          <p style={{ fontWeight: "bold", fontSize: "18px", marginTop: 10 }}>Remaining: {remaining.length} / {allQuestions.length}</p>
        </div>

        {/* Question Controls */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          <input type="number" placeholder="Enter Question No" value={qNo} onChange={(e) => setQNo(Number(e.target.value))} style={styles.input} />
          <button onClick={() => loadQuestion()} style={styles.button} disabled={loading}>{loading ? "Loading..." : "Load"}</button>
          <button onClick={() => startTimer(timers[timerIndex])} style={{ ...styles.button, background: "#27ae60", fontSize: 14, padding: "6px 14px" }}>▶ Start</button>
          <button onClick={clearCountdown} style={{ ...styles.button, background: "#e74c3c", fontSize: 14, padding: "6px 14px" }}>⏹ Stop</button>
          
          
        </div>

        {/* Question Data */}
        {qData && (
          <div style={styles.card}>
            <audio controls src={`${API_BASE}${qData.audioUrl}`} style={{ width: "100%", marginBottom: 12 }} onPlay={handleAudioPlay} />
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <input type="text" placeholder="Type your spelling" value={answer} ref={inputRef} autoFocus onChange={(e) => setAnswer(e.target.value)} onKeyDown={(e) => e.key === "Enter" && checkAnswer()} style={{ ...styles.input, flex: 1, fontSize: 28, padding: "18px 22px", height: "60px", fontWeight: "600" }} />
              <button onClick={checkAnswer} style={{ ...styles.button, background: "#3498db" }}>Check</button>
              <button onClick={handlePass} style={{ ...styles.button, background: "#8e44ad" }}>⏭ Pass</button>
              
            </div>

            {/* Result & Award Points */}
           {result && (
  <div style={{ marginTop: 12 }}>
    {result.correct ? (
      <div style={{ marginTop: 8 }}>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
          {/* Show only one point box based on who answered */}
          {points.length > 0 && (
            <button
              onClick={() => awardPointsToCurrent(
                currentTeamIndex === questionStarterIndex ? points[0] : points[points.length - 1]
              )}
              style={{
                padding: "10px 14px",
                borderRadius: 8,
                border: "none",
                background: "#27ae60",
                color: "#fff",
                cursor: "pointer",
                fontSize: 16,
                fontWeight: 700
              }}
            >
              {currentTeamIndex === questionStarterIndex ? points[0] : points[points.length - 1]} pts → {teams[currentTeamIndex]?.name ?? "Team"}
            </button>
          )}
        </div>
        <div style={{ marginTop: 8 }}>
          <small style={{ color: "#666" }}>
            Award points to <b>{teams[currentTeamIndex]?.name ?? "current team"}</b>.  
            After awarding, turn will rotate according to selected direction.
          </small>
        </div>
      </div>
    ) : (
      <div style={{ marginTop: 8 }}>
        <b style={{ color: "red", fontSize: 20 }}>❌ Incorrect</b>
        {!showCorrect ? (
          <button
            onClick={() => {
              setShowCorrect(true);
              setAnswerWasShown(true);
            }}
            style={{
              ...styles.button,
              background: "#e74c3c",
              fontSize: 18,
              padding: "12px 20px",
              marginTop: 10
            }}
          >
            Show Answer
          </button>
        ) : (
          <div style={{ marginTop: 10 }}>
            <h2 style={{ fontSize: 22, color: "#2c3e50" }}>
              ✅ Correct Answer: <span style={{ color: "#27ae60" }}>{result.correctAnswer}</span>
            </h2>
          </div>
        )}
      </div>
    )}
  </div>
)}


          </div>
        )}
      </div>

      {/* Right Sidebar for Teams */}
      <div style={{ width: 300, minWidth: 280, borderLeft: "2px solid #e0e0e0", padding: "12px 12px", display: "flex", flexDirection: "column", maxHeight: "100vh", overflowY: "auto", backgroundColor: "#f9fbfc", fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}>
        <h3 style={{ marginBottom: 12, textAlign: "center", color: "#2c3e50", fontSize: 20, fontWeight: 700, letterSpacing: "0.5px", borderBottom: "2px solid #2980b9", paddingBottom: 6 }}>👥 Teams & Scores</h3>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
  {teams.map((team, i) => (
    <div
      key={i}
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 16px",
        borderRadius: 12,
        backgroundColor: i === currentTeamIndex ? "#d0f0fd" : "#fff",
        boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
        transition: "0.3s",
      }}
    >
      {/* Team Name & Rename */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, flex: 1 }}>
        {team.editing ? (
          <input
            type="text"
            value={team.name}
            autoFocus
            onChange={(e) => {
              const newTeams = [...teams];
              newTeams[i].name = e.target.value;
              setTeams(newTeams);
            }}
            onBlur={() => {
              const newTeams = [...teams];
              newTeams[i].editing = false;
              setTeams(newTeams);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                const newTeams = [...teams];
                newTeams[i].editing = false;
                setTeams(newTeams);
              }
            }}
            style={{ flex: 1, padding: "3px 4px", fontSize: 16, borderRadius: 6, border: "1px solid #ced4da", outline: "none" }}
          />
        ) : (
          <>
            <span style={{ fontWeight: 700, fontSize: 20, color: "#2c3e50" }}>{team.name}</span>
            <button
              onClick={() => {
                const newTeams = [...teams];
                newTeams[i].editing = true;
                setTeams(newTeams);
              }}
              style={{ marginLeft: 4, background: "#17a2b8", color: "#fff", border: "none", borderRadius: 5, padding: "2px 6px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}
            >
              edit
            </button>
          </>
        )}
      </div>

      {/* Tick Mark & Score */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {/* Tick mark to select team */}
        <button
          onClick={() => setCurrentTeamIndex(i)}
          style={{
            background: i === currentTeamIndex ? "#27ae60" : "#bdc3c7",
            color: "#fff",
            border: "none",
            borderRadius: "50%",
            width: 28,
            height: 28,
            cursor: "pointer",
            fontSize: 18,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "0.2s",
          }}
        >
          {i === currentTeamIndex ? "✔" : ""}
        </button>

        {/* Score Controls */}
        <button
          onClick={() => updateScore(i, -1)}
          style={{ background: "#e74c3c", border: "none", color: "#fff", padding: "4px 8px", borderRadius: 6, cursor: "pointer", fontWeight: 600, fontSize: 13 }}
        >
          ➖
        </button>
        <span style={{ minWidth: 28, textAlign: "center", fontWeight: 600, fontSize: 25 }}>{team.score}</span>
        <button
          onClick={() => updateScore(i, 1)}
          style={{ background: "#2980b9", border: "none", color: "#fff", padding: "4px 8px", borderRadius: 6, cursor: "pointer", fontWeight: 600, fontSize: 13 }}
        >
          ➕
        </button>
      </div>
    </div>
  ))}
</div>

        </div>
      </div>
    </div>
  );
}

const styles = {
  input: { padding: "10px 14px", borderRadius: 8, border: "1px solid #ccc", fontSize: 16, outline: "none", transition: "0.2s" },
  button: { padding: "10px 18px", borderRadius: 8, border: "none", background: "#3498db", color: "#fff", cursor: "pointer", fontSize: 16, fontWeight: "600", transition: "0.2s" },
  card: { padding: 16, background: "#fff", borderRadius: 10, boxShadow: "0 2px 6px rgba(0,0,0,0.05)", marginBottom: 16 },
};
