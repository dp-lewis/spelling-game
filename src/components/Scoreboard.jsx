import React from 'react';

const Scoreboard = ({ players }) => {
  return (
    <div>
      <h2>Scoreboard</h2>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {players.map((p, i) => (
          <li key={i} style={{
            opacity: p.active ? 1 : 0.5,
            fontWeight: p.active ? 'bold' : 'normal',
            color: p.active ? '#222' : '#888',
            marginBottom: 4
          }}>
            {p.name} — {p.score} {p.active ? '' : <span title="Knocked out">(❌ Knocked out)</span>}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Scoreboard;
