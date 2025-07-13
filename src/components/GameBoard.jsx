import React, { useRef, useState, useEffect } from 'react';

// Normalize: remove non-letters, lowercase
const normalize = (str) => str.replace(/[^a-zA-Z]/g, '').toLowerCase();

// Convert a spoken string like "C A T" or "c a t" to "cat"
function spokenToLetters(str) {
  // Remove punctuation, split by spaces, join letters
  return str
    .replace(/[^a-zA-Z ]/g, '')
    .split(' ')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean)
    .join('');
}

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
  const [attempts, setAttempts] = useState(0);
  const firstRender = useRef(true);

  // Speak the player's name and the word automatically when the component is first shown (word changes)
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (word && !hasSpoken && !spokenText) {
      if (currentPlayer?.name) {
        speak(`It's ${currentPlayer.name}'s go. The word is ${word}`);
      } else {
        speak(word);
      }
      setHasSpoken(true);
    }
  }, [word, hasSpoken, spokenText, currentPlayer]);

  // Reset hasSpoken when moving to the next word
  useEffect(() => {
    setHasSpoken(false);
  }, [word]);

  // Clear spokenText and feedback when moving to the next word/turn
  useEffect(() => {
    setSpokenText('');
    setFeedback(null);
  }, [word]);

  // Reset attempts on new word
  useEffect(() => {
    setAttempts(0);
  }, [word]);

  // Start a 5-second countdown and advance only if correct or after 2nd incorrect
  useEffect(() => {
    // Only start countdown if correct, or after 2nd failed attempt
    if (feedback === '✅ Correct!') {
      setCountdown(5);
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev === 1) {
            clearInterval(interval);
            setCountdown(null);
            onNext(true);
            return null;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
    // If feedback is a React element (incorrect) and attempts === 2, start countdown
    if (feedback && typeof feedback !== 'string' && attempts === 2) {
      setCountdown(3);
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev === 1) {
            clearInterval(interval);
            setCountdown(null);
            onNext(false);
            return null;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [feedback, onNext, attempts]);

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
      // Strict letter-by-letter enforcement
      const correct = normalize(word);
      // Split transcript into tokens (by space)
      const tokens = transcript.replace(/[^a-zA-Z ]/g, '').split(' ').map(s => s.trim().toLowerCase()).filter(Boolean);
      // If only one token and it matches the word, reject
      if (tokens.length === 1 && tokens[0] === correct) {
        setFeedback(
          <span>
            ❌ Please spell the word <b>letter by letter</b> (e.g., "C A T"), not as a whole word.<br />
            Try again!
          </span>
        );
        speak('Please spell the word letter by letter, not as a whole word. Try again.');
        return;
      }
      // If number of tokens doesn't match word length, reject
      if (tokens.length !== correct.length) {
        setFeedback(
          <span>
            ❌ Please spell out <b>each letter</b> of the word, one at a time. You said {tokens.length} letter{tokens.length === 1 ? '' : 's'}, but the word has {correct.length}.<br />
            Try again!
          </span>
        );
        speak('Please spell out each letter of the word, one at a time. Try again.');
        return;
      }
      // If any token is not a single letter, reject
      if (!tokens.every(t => t.length === 1 && /^[a-z]$/.test(t))) {
        setFeedback(
          <span>
            ❌ Each part must be a single letter (A-Z).<br />
            Try again!
          </span>
        );
        speak('Each part must be a single letter. Try again.');
        return;
      }
      // Join tokens and compare
      const spelled = tokens.join('');
      if (spelled === correct) {
        setFeedback('✅ Correct!');
        speak('Correct!');
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        if (newAttempts < 2) {
          setFeedback(
            <span>
              ❌ Incorrect.<br />
              <span style={{ fontWeight: 'bold', fontSize: '1.2em' }}>{word}</span><br />
              <span style={{ letterSpacing: '0.5em', fontFamily: 'monospace' }}>{word.toUpperCase().split('').join(' ')}</span>
              <br />Try again! (Attempt {newAttempts} of 2)
            </span>
          );
          speak(`Incorrect. The correct spelling is ${word}. Try again.`);
        } else {
          setFeedback(
            <span>
              ❌ Incorrect.<br />
              <span style={{ fontWeight: 'bold', fontSize: '1.2em' }}>{word}</span><br />
              <span style={{ letterSpacing: '0.5em', fontFamily: 'monospace' }}>{word.toUpperCase().split('').join(' ')}</span>
              <br />No more attempts!
            </span>
          );
          speak(`Incorrect. The correct spelling is ${word}. No more attempts.`);
        }
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
      {/* Change Next Turn button to call onNext with null (manual advance) */}
      <button onClick={() => onNext(false)} disabled={countdown !== null}>Next Turn</button>
    </div>
  );
};

export default GameBoard;
