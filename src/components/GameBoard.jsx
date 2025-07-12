import React, { useRef, useState } from 'react';

const GameBoard = ({ players, currentPlayer, word, onNext }) => {
  const synthRef = useRef(window.speechSynthesis);
  const [isListening, setIsListening] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  const [error, setError] = useState(null);

  // Speech Synthesis
  const handleSpeakWord = () => {
    if (!word) return;
    if (synthRef.current.speaking) {
      synthRef.current.cancel();
    }
    const utter = new window.SpeechSynthesisUtterance(word);
    utter.lang = 'en-US';
    synthRef.current.speak(utter);
  };

  // Speech Recognition
  const handleStartListening = () => {
    setError(null);
    setSpokenText('');
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    setIsListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSpokenText(transcript);
      setIsListening(false);
    };
    recognition.onerror = (event) => {
      setError('Error: ' + event.error);
      setIsListening(false);
    };
    recognition.onend = () => {
      setIsListening(false);
    };
    recognition.start();
  };

  return (
    <div>
      <h2>Game Board</h2>
      <p>Current Player: {currentPlayer?.name}</p>
      <button onClick={handleSpeakWord} disabled={!word}>Play Word</button>
      <div style={{ margin: '1em 0' }}>
        <button onClick={handleStartListening} disabled={isListening || !word}>
          {isListening ? 'Listening...' : 'Spell the Word (Voice)'}
        </button>
        {spokenText && (
          <div>
            <strong>Your spelling:</strong> {spokenText}
          </div>
        )}
        {error && <div style={{ color: 'red' }}>{error}</div>}
      </div>
      {/* TODO: Add feedback and scoring */}
      <button onClick={onNext}>Next Turn</button>
    </div>
  );
};

export default GameBoard;
