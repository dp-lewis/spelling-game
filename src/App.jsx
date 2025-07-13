import { useState } from 'react';
import PlayerSetup from './components/PlayerSetup';
import GameBoard from './components/GameBoard';
import Scoreboard from './components/Scoreboard';
import EndGame from './components/EndGame';
import { WORDS } from './words';
import './App.css';

function App() {
  // Game states: 'setup', 'playing', 'end'
  const [gameState, setGameState] = useState('setup');
  // Add per-player usedWords and wordList
  const [players, setPlayers] = useState([]); // [{ name, score, active, wordList, usedWords }]
  const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0);
  const [winner, setWinner] = useState(null);
  const [usedWords, setUsedWords] = useState([]); // global used words
  const [currentWord, setCurrentWord] = useState(null);
  const [customWords, setCustomWords] = useState(null);
  const [customNames, setCustomNames] = useState(null);

  // Updated handleStart to accept custom words, player names, and per-player word lists
  const handleStart = (words, names, perPlayerWords) => {
    setPlayers(names.map((name, idx) => ({
      name,
      score: 0,
      active: true,
      wordList: (perPlayerWords && perPlayerWords[idx] && perPlayerWords[idx].length > 0)
        ? perPlayerWords[idx]
        : words.slice(),
      usedWords: []
    })));
    setCustomWords(words);
    setCustomNames(names);
    // Draw first word for first player
    const firstWord = getNextWord(
      (perPlayerWords && perPlayerWords[0] && perPlayerWords[0].length > 0) ? perPlayerWords[0] : words,
      [],
      words,
      []
    );
    setCurrentWord(firstWord);
    setUsedWords(firstWord ? [firstWord] : []);
    setCurrentPlayerIdx(0);
    setWinner(null);
    setGameState('playing');
  };

  // Get next word for a player, fallback to central/global list if needed
  function getNextWord(playerWordList, playerUsed, globalWordList, globalUsed) {
    // Try player's own list first
    const availablePlayer = playerWordList.filter(w => !playerUsed.includes(w) && !globalUsed.includes(w));
    if (availablePlayer.length > 0) {
      return availablePlayer[Math.floor(Math.random() * availablePlayer.length)];
    }
    // Fallback to global list
    const availableGlobal = (globalWordList || WORDS).filter(w => !globalUsed.includes(w));
    if (availableGlobal.length === 0) return null;
    return availableGlobal[Math.floor(Math.random() * availableGlobal.length)];
  }

  // Knockout logic: handle result, skip knocked-out players, end game if one left
  const handleNextTurn = (isCorrect) => {
    setPlayers(prevPlayers => {
      const updated = [...prevPlayers];
      const player = updated[currentPlayerIdx];
      if (!isCorrect) {
        player.active = false;
      } else {
        player.score += 1;
      }
      // Mark current word as used for this player
      if (currentWord) {
        player.usedWords = [...(player.usedWords || []), currentWord];
      }
      updated[currentPlayerIdx] = player;
      return updated;
    });

    // Find next active player
    let nextIdx = currentPlayerIdx;
    let found = false;
    let activeCount = 0;
    let lastActiveIdx = -1;
    players.forEach((p, idx) => {
      if (p.active || (idx === currentPlayerIdx && isCorrect)) {
        activeCount++;
        lastActiveIdx = idx;
      }
    });

    // If only one active player, end game
    if (activeCount === 1) {
      setWinner(players[lastActiveIdx].name);
      setGameState('end');
      return;
    }

    // Find next active player
    for (let i = 1; i <= players.length; i++) {
      const idx = (currentPlayerIdx + i) % players.length;
      if (players[idx].active || (idx === currentPlayerIdx && isCorrect)) {
        nextIdx = idx;
        found = true;
        break;
      }
    }
    setCurrentPlayerIdx(nextIdx);

    // Get next word for the next player
    setPlayers(prevPlayers => {
      const updated = [...prevPlayers];
      const nextPlayer = updated[nextIdx];
      const nextWord = getNextWord(
        nextPlayer.wordList,
        nextPlayer.usedWords,
        customWords || WORDS,
        usedWords
      );
      if (nextWord) {
        setCurrentWord(nextWord);
        setUsedWords(prev => [...prev, nextWord]);
      } else {
        setGameState('end');
      }
      return updated;
    });
  };

  const handleRestart = () => {
    setPlayers([]);
    setCurrentPlayerIdx(0);
    setWinner(null);
    setGameState('setup');
  };

  return (
    <div className="App">
      <h1 style={{ textAlign: 'center', margin: '1.2em 0 0.5em 0', fontFamily: 'cursive', fontWeight: 700, fontSize: '2.3em', letterSpacing: '0.04em', color: '#e6b800', textShadow: '1px 2px 6px #3332' }}>
        Spelling Showdown
      </h1>
      {gameState === 'setup' && <PlayerSetup onStart={handleStart} />}
      {gameState === 'playing' && (
        <>
          <GameBoard
            players={players}
            currentPlayer={players[currentPlayerIdx]}
            word={currentWord}
            onNext={handleNextTurn}
          />
          <Scoreboard players={players} />
        </>
      )}
      {gameState === 'end' && <EndGame winner={winner} players={players} onRestart={handleRestart} />}
    </div>
  );
}

export default App;
