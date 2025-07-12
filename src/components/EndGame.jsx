import React from 'react';

const EndGame = ({ winner, onRestart }) => {
  // Placeholder UI for end game
  return (
    <div>
      <h2>Game Over</h2>
      {/* TODO: Show winner and scores */}
      <button onClick={onRestart}>Play Again</button>
    </div>
  );
};

export default EndGame;
