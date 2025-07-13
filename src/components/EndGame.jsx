import React from 'react';

const EndGame = ({ winner, players, onRestart }) => {
  return (
    <div>
      <h2>Game Over</h2>
      {winner ? (
        <h3>🏆 Winner: {winner}!</h3>
      ) : (
        <h3>No winner this time.</h3>
      )}
      <h4>Final Scores:</h4>
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
      <button onClick={onRestart}>Play Again</button>
    </div>
  );
};

export default EndGame;
