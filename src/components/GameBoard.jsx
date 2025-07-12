import React, { useRef } from 'react';

const GameBoard = ({ players, currentPlayer, onNext }) => {
  // For now, use a hardcoded word
  const word = 'example';
  const synthRef = useRef(window.speechSynthesis);

  const handleSpeakWord = () => {
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
      <button onClick={handleSpeakWord}>Play Word</button>
      {/* TODO: Add voice input and feedback */}
      <button onClick={onNext}>Next Turn</button>
    </div>
  );
};

export default GameBoard;
