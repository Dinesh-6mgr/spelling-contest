import React, { useEffect, useState } from "react";

const rulesList = [
  "Participants must spell the words correctly to score points.",
  "Each participant will have a limited time per word.",
  "No electronic devices or help allowed during the contest.",
  "Judges’ decisions are final and binding.",
  "Participants should respect other contestants and maintain decorum.",
];

export default function Rules() {
  const [visibleRules, setVisibleRules] = useState([]);

  // Animate rules one by one
  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      if (index < rulesList.length) {
        setVisibleRules((prev) => [...prev, rulesList[index]]);
        index++;
      } else {
        clearInterval(interval);
      }
    }, 400); // delay between rules
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        maxWidth: "800px",
        margin: "40px auto",
        padding: "20px",
        backgroundColor: "#fff",
        borderRadius: "15px",
        boxShadow: "0 8px 20px rgba(0,0,0,0.1)",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: "20px", color: "#F97316" }}>
        📜 Spelling Contest Rules
      </h2>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {visibleRules.map((rule, i) => (
          <li
            key={i}
            style={{
              marginBottom: "12px",
              padding: "10px 16px",
              borderLeft: "4px solid #FFB400",
              opacity: 0,
              animation: "fadeSlide 0.5s forwards",
              animationDelay: `${i * 0.4}s`,
            }}
          >
            {rule}
          </li>
        ))}
      </ul>

      <style>
        {`
          @keyframes fadeSlide {
            from { opacity: 0; transform: translateX(-20px); }
            to { opacity: 1; transform: translateX(0); }
          }
        `}
      </style>
    </div>
  );
}
