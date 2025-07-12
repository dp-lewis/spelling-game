import React, { useRef, useState, useEffect } from 'react';

const normalize = (str) => str.replace(/[^a-zA-Z]/g, '').toLowerCase();

// Chrome-compatible speech synthesis workaround: cancel before speak
function speak(text) {
  const synth = window.speechSynthesis;
  const utter = new window.SpeechSynthesisUtterance(text);
  utter.lang = 'en-US';
  // Chrome workaround: cancel before speak
  synth.cancel();
  setTimeout(() => {
    synth.speak(utter);
  }, 100);
}

const GameBoard = ({ players, currentPlayer, word, onNext }) => {
  const [isListening, setIsListening] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [hasSpoken, setHasSpoken] = useState(false);
  const [countdown, setCountdown] = useState(null);

  // Speak the word automatically when the component is first shown (word changes)
  useEffect(() => {
    if (word && !hasSpoken) {
      speak(word);
      setHasSpoken(true);
    }
  }, [word, hasSpoken]);

  // Reset hasSpoken when moving to the next word
  useEffect(() => {
    setHasSpoken(false);
  }, [word]);

  // Clear spokenText and feedback when moving to the next word/turn
  useEffect(() => {
    setSpokenText('');
    setFeedback(null);
  }, [word]);

  // Start a 5-second countdown after a spelling attempt
  useEffect(() => {
    if (feedback) {
      setCountdown(5);
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev === 1) {
            clearInterval(interval);
            setCountdown(null);
            onNext();
            return null;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [feedback, onNext]);

  const handleSpeakWord = () => {
    if (!word) return;
    speak(word);
  };

  // Speech Recognition
  const handleStartListening = () => {
    setError(null);
    setSpokenText('');
    setFeedback(null);
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
      // Check spelling
      let resultText;
      if (normalize(transcript) === normalize(word)) {
        resultText = 'Correct!';
        setFeedback('✅ Correct!');
      } else {
        resultText = `Incorrect. The correct spelling is ${word}.`;
        setFeedback(
          <span>
            ❌ Incorrect.<br />
            <span style={{ fontWeight: 'bold', fontSize: '1.2em' }}>{word}</span><br />
            <span style={{ letterSpacing: '0.5em', fontFamily: 'monospace' }}>{word.toUpperCase().split('').join(' ')}</span>
          </span>
        );
      }
      // Speak the result
      speak(resultText);
      // If incorrect, spell out the word letter by letter
      if (normalize(transcript) !== normalize(word)) {
        setTimeout(() => {
          speak(word.split('').join(' '));
        }, 1200);
      }
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
        {feedback && (
          <div style={{ fontWeight: 'bold', marginTop: '0.5em' }}>{feedback}</div>
        )}
        {error && <div style={{ color: 'red' }}>{error}</div>}
        {countdown !== null && (
          <div style={{ color: 'gray', marginTop: '1em' }}>
            Next player in {countdown} second{countdown === 1 ? '' : 's'}...
          </div>
        )}
      </div>
      <button onClick={onNext} disabled={countdown !== null}>Next Turn</button>
    </div>
  );
};

export default GameBoard;
