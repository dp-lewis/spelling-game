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
function speak(text, onEnd) {
  const synth = window.speechSynthesis;
  const utter = new window.SpeechSynthesisUtterance(text);
  utter.lang = 'en-US';
  if (onEnd) utter.onend = onEnd;
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
  const recognitionRef = useRef(null);

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

  // Reset all state when moving to the next word/turn
  useEffect(() => {
    setSpokenText('');
    setFeedback(null);
    setHasSpoken(false);
    setCountdown(null);
    setAttempts(0);
  }, [word]);

  // Start a 5-second countdown and advance only if correct or after 2nd incorrect
  useEffect(() => {
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
    recognition.continuous = false; // Only process one result per click
    recognitionRef.current = recognition;
    setIsListening(true);
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSpokenText(transcript);
      setIsListening(false);
      recognition.stop();
      const correct = normalize(word);
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
      // At this point, input is all single letters (any length)
      const spelled = tokens.join('');
      if (spelled === correct) {
        setFeedback('✅ Correct!');
        setTimeout(() => speak('Correct!'), 100);
      } else {
        setAttempts(prev => {
          const newAttempts = prev + 1;
          if (newAttempts < 2) {
            setFeedback(
              <span>
                ❌ Incorrect.<br />
                Try again! (Attempt {newAttempts} of 2)
              </span>
            );
            setTimeout(() => speak('Incorrect. Try again.'), 100);
          } else {
            setFeedback(
              <span>
                ❌ Incorrect.<br />
                <span style={{ fontWeight: 'bold', fontSize: '1.2em' }}>{word}</span><br />
                <span style={{ letterSpacing: '0.5em', fontFamily: 'monospace' }}>{word.toUpperCase().split('').join(' ')}</span>
                <br />No more attempts!
              </span>
            );
            // Wait for both messages to finish before advancing
            speak(`Incorrect. The correct spelling is ${word}. No more attempts.`, () => {
              speak(word.split('').join(' ... '), () => {
                // Now start the countdown and advance
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
              });
            });
          }
          return newAttempts;
        });
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

  const handleStopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
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
        {isListening && (
          <button onClick={handleStopListening} style={{ marginLeft: 8 }}>
            Stop Listening
          </button>
        )}
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
