import React, { useState, useEffect } from 'react';

const DEFAULT_WORDS = ['example', 'banana', 'computer', 'giraffe', 'umbrella'];
const NAMES_KEY = 'spellingbee_player_names';

const PlayerSetup = ({ onStart }) => {
  const [wordsText, setWordsText] = useState(DEFAULT_WORDS.join('\n'));
  const [playerNames, setPlayerNames] = useState(() => {
    const saved = localStorage.getItem(NAMES_KEY);
    return saved ? JSON.parse(saved) : ['', ''];
  });

  useEffect(() => {
    localStorage.setItem(NAMES_KEY, JSON.stringify(playerNames));
  }, [playerNames]);

  const getWords = () => {
    return wordsText
      .split(/\r?\n|,|;/)
      .map(w => w.trim())
      .filter(w => w.length > 0);
  };

  const handleNameChange = (idx, value) => {
    const updated = [...playerNames];
    updated[idx] = value;
    setPlayerNames(updated);
  };

  const handleAddPlayer = () => {
    if (playerNames.length < 4) setPlayerNames([...playerNames, '']);
  };

  const handleRemovePlayer = (idx) => {
    if (playerNames.length > 2) setPlayerNames(playerNames.filter((_, i) => i !== idx));
  };

  const handleStartGame = () => {
    const words = getWords();
    const names = playerNames.map(n => n.trim()).filter(n => n.length > 0);
    if (words.length > 0 && names.length >= 2 && names.length <= 4) {
      onStart(words, names);
    }
  };

  return (
    <div>
      <h2>Player Setup</h2>
      <div>
        <label><strong>Player Names (2-4):</strong></label>
        {playerNames.map((name, idx) => (
          <div key={idx} style={{ marginBottom: 4 }}>
            <input
              type="text"
              value={name}
              onChange={e => handleNameChange(idx, e.target.value)}
              placeholder={`Player ${idx + 1} name`}
              style={{ width: 180, marginRight: 8 }}
              maxLength={20}
            />
            {playerNames.length > 2 && (
              <button onClick={() => handleRemovePlayer(idx)} aria-label="Remove player">×</button>
            )}
          </div>
        ))}
        {playerNames.length < 4 && (
          <button onClick={handleAddPlayer} style={{ marginBottom: 8 }}>Add Player</button>
        )}
      </div>
      <div style={{ marginTop: 16 }}>
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
      <button onClick={handleStartGame} disabled={getWords().length === 0 || playerNames.some(n => !n.trim())} style={{ marginTop: '1em' }}>
        Start Game
      </button>
      <div style={{ marginTop: '1em', color: '#666', fontSize: '0.95em' }}>
        {getWords().length} word{getWords().length === 1 ? '' : 's'} entered
      </div>
    </div>
  );
};

export default PlayerSetup;
