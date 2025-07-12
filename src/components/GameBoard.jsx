import React from 'react';

const GameBoard = ({ players, currentPlayer, onNext }) => {
  // Placeholder UI for game board
  return (
    <div>
      <h2>Game Board</h2>
      {/* TODO: Add word audio, voice input, and feedback */}
      <button onClick={onNext}>Next Turn</button>
    </div>
  );
};

export default GameBoard;
