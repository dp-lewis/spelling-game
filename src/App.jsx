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
  // Add 'active' property to each player
  const [players, setPlayers] = useState([]); // [{ name, score, active }]
  const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0);
  const [winner, setWinner] = useState(null);
  const [usedWords, setUsedWords] = useState([]);
  const [currentWord, setCurrentWord] = useState(null);
  const [customWords, setCustomWords] = useState(null);
  const [customNames, setCustomNames] = useState(null);

  // Updated handleStart to accept custom words and player names
  const handleStart = (words, names) => {
    setPlayers(names.map(name => ({ name, score: 0, active: true })));
    setCustomWords(words);
    setCustomNames(names);
    const firstWord = getRandomWord([], words);
    setCurrentWord(firstWord);
    setUsedWords([firstWord]);
    setCurrentPlayerIdx(0);
    setWinner(null);
    setGameState('playing');
  };

  // Update getRandomWord to use customWords if provided
  function getRandomWord(usedWords, wordList) {
    const available = (wordList || customWords || WORDS).filter(w => !usedWords.includes(w));
    if (available.length === 0) return null;
    return available[Math.floor(Math.random() * available.length)];
  }

  // Knockout logic: handle result, skip knocked-out players, end game if one left
  const handleNextTurn = (isCorrect) => {
    setPlayers(prevPlayers => {
      const updated = [...prevPlayers];
      if (!isCorrect) {
        updated[currentPlayerIdx] = {
          ...updated[currentPlayerIdx],
          active: false
        };
      } else {
        updated[currentPlayerIdx] = {
          ...updated[currentPlayerIdx],
          score: updated[currentPlayerIdx].score + 1
        };
      }
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

    // Get next word
    const nextWord = getRandomWord(usedWords);
    if (nextWord) {
      setCurrentWord(nextWord);
      setUsedWords([...usedWords, nextWord]);
    } else {
      setGameState('end');
    }
  };

  const handleRestart = () => {
    setPlayers([]);
    setCurrentPlayerIdx(0);
    setWinner(null);
    setGameState('setup');
  };

  return (
    <div className="App">
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
