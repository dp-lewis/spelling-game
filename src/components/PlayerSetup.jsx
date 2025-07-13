import React, { useState, useEffect } from 'react';

const DEFAULT_WORDS = ['example', 'banana', 'computer', 'giraffe', 'umbrella'];
const NAMES_KEY = 'spellingbee_player_names';
const PLAYER_WORDS_KEY = 'spellingbee_player_wordlists';

const PlayerSetup = ({ onStart }) => {
  const [wordsText, setWordsText] = useState(DEFAULT_WORDS.join('\n'));
  const [playerNames, setPlayerNames] = useState(() => {
    const saved = localStorage.getItem(NAMES_KEY);
    return saved ? JSON.parse(saved) : ['', ''];
  });
  // Per-player word lists (optional)
  const [playerWordTexts, setPlayerWordTexts] = useState(() => {
    const saved = localStorage.getItem(PLAYER_WORDS_KEY);
    return saved ? JSON.parse(saved) : ['', ''];
  });

  // Save player names to localStorage
  useEffect(() => {
    localStorage.setItem(NAMES_KEY, JSON.stringify(playerNames));
  }, [playerNames]);

  // Save per-player word lists to localStorage
  useEffect(() => {
    localStorage.setItem(PLAYER_WORDS_KEY, JSON.stringify(playerWordTexts));
  }, [playerWordTexts]);

  // When players are added/removed, keep word lists in sync
  useEffect(() => {
    setPlayerWordTexts((prev) => {
      let arr = prev.slice();
      while (arr.length < playerNames.length) arr.push('');
      while (arr.length > playerNames.length) arr.pop();
      return arr;
    });
  }, [playerNames]);

  const getWords = () => {
    return wordsText
      .split(/\r?\n|,|;/)
      .map(w => w.trim())
      .filter(w => w.length > 0);
  };

  const getPlayerWords = (idx) => {
    return playerWordTexts[idx]
      ? playerWordTexts[idx]
          .split(/\r?\n|,|;/)
          .map(w => w.trim())
          .filter(w => w.length > 0)
      : [];
  };

  const handleNameChange = (idx, value) => {
    const updated = [...playerNames];
    updated[idx] = value;
    setPlayerNames(updated);
  };

  const handlePlayerWordChange = (idx, value) => {
    const updated = [...playerWordTexts];
    updated[idx] = value;
    setPlayerWordTexts(updated);
  };

  const handleAddPlayer = () => {
    if (playerNames.length < 4) {
      setPlayerNames([...playerNames, '']);
      setPlayerWordTexts([...playerWordTexts, '']);
    }
  };

  const handleRemovePlayer = (idx) => {
    if (playerNames.length > 2) {
      setPlayerNames(playerNames.filter((_, i) => i !== idx));
      setPlayerWordTexts(playerWordTexts.filter((_, i) => i !== idx));
    }
  };

  const handleStartGame = () => {
    const words = getWords();
    const names = playerNames.map(n => n.trim()).filter(n => n.length > 0);
    const perPlayerWords = playerNames.map((_, idx) => getPlayerWords(idx));
    if (words.length > 0 && names.length >= 2 && names.length <= 4) {
      onStart(words, names, perPlayerWords);
    }
  };

  return (
    <div>
      <h2>Player Setup</h2>
      <div>
        <label><strong>Player Names (2-4):</strong></label>
        {playerNames.map((name, idx) => (
          <div key={idx} style={{ marginBottom: 8, borderBottom: '1px solid #eee', paddingBottom: 8 }}>
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
            <div style={{ marginTop: 6 }}>
              <label htmlFor={`player-words-${idx}`} style={{ fontSize: '0.97em' }}>
                <span>Optional: Custom word list for {name || `Player ${idx + 1}`}</span>
              </label>
              <br />
              <textarea
                id={`player-words-${idx}`}
                value={playerWordTexts[idx] || ''}
                onChange={e => handlePlayerWordChange(idx, e.target.value)}
                rows={3}
                cols={32}
                placeholder="Leave blank to use central list"
                style={{ fontSize: '1em', padding: '0.3em', resize: 'vertical', marginTop: 2 }}
              />
              <div style={{ color: '#888', fontSize: '0.92em' }}>
                {getPlayerWords(idx).length > 0
                  ? `${getPlayerWords(idx).length} word${getPlayerWords(idx).length === 1 ? '' : 's'} entered`
                  : 'Will use central list'}
              </div>
            </div>
          </div>
        ))}
        {playerNames.length < 4 && (
          <button onClick={handleAddPlayer} style={{ marginBottom: 8 }}>Add Player</button>
        )}
      </div>
      <div style={{ marginTop: 16 }}>
        <label htmlFor="words-textarea"><strong>Central word list (one per line, or separated by comma/semicolon):</strong></label>
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
        {getWords().length} word{getWords().length === 1 ? '' : 's'} in central list
      </div>
    </div>
  );
};

export default PlayerSetup;
