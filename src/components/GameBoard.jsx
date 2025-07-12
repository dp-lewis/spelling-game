import React, { useRef } from 'react';

const GameBoard = ({ players, currentPlayer, word, onNext }) => {
  const synthRef = useRef(window.speechSynthesis);

  const handleSpeakWord = () => {
    if (!word) return;
    if (synthRef.current.speaking) {
      synthRef.current.cancel();
    }
    const utter = new window.SpeechSynthesisUtterance(word);
    utter.lang = 'en-US';
    synthRef.current.speak(utter);
  };

  return (
    <div>
      <h2>Game Board</h2>
      <p>Current Player: {currentPlayer?.name}</p>
      <button onClick={handleSpeakWord} disabled={!word}>Play Word</button>
      {/* TODO: Add voice input and feedback */}
      <button onClick={onNext}>Next Turn</button>
    </div>
  );
};

export default GameBoard;
