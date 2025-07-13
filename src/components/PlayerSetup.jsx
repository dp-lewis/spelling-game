import React, { useState } from 'react';

const DEFAULT_WORDS = ['example', 'banana', 'computer', 'giraffe', 'umbrella'];

const PlayerSetup = ({ onStart }) => {
  const [wordsText, setWordsText] = useState(DEFAULT_WORDS.join('\n'));

  const getWords = () => {
    return wordsText
      .split(/\r?\n|,|;/)
      .map(w => w.trim())
      .filter(w => w.length > 0);
  };

  const handleStartGame = () => {
    const words = getWords();
    if (words.length > 0) {
      onStart(words);
    }
  };

  return (
    <div>
      <h2>Player Setup</h2>
      <div>
        <label htmlFor="words-textarea"><strong>Enter your word list (one per line, or separated by comma/semicolon):</strong></label>
        <br />
        <textarea
          id="words-textarea"
          value={wordsText}
          onChange={e => setWordsText(e.target.value)}
          rows={8}
          cols={40}
          style={{ fontSize: '1.1em', padding: '0.5em', resize: 'vertical' }}
        />
      </div>
      <button onClick={handleStartGame} disabled={getWords().length === 0} style={{ marginTop: '1em' }}>
        Start Game
      </button>
      <div style={{ marginTop: '1em', color: '#666', fontSize: '0.95em' }}>
        {getWords().length} word{getWords().length === 1 ? '' : 's'} entered
      </div>
    </div>
  );
};

export default PlayerSetup;
