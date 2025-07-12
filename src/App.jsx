import { useState } from 'react';
import PlayerSetup from './components/PlayerSetup';
import GameBoard from './components/GameBoard';
import Scoreboard from './components/Scoreboard';
import EndGame from './components/EndGame';
import { WORDS } from './words';
import './App.css';

function getRandomWord(usedWords) {
  const available = WORDS.filter(w => !usedWords.includes(w));
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
}

function App() {
  // Game states: 'setup', 'playing', 'end'
  const [gameState, setGameState] = useState('setup');
  const [players, setPlayers] = useState([]); // [{ name, score }]
  const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0);
  const [winner, setWinner] = useState(null);
  const [usedWords, setUsedWords] = useState([]);
  const [currentWord, setCurrentWord] = useState(null);

  // Placeholder handlers for navigation
  const handleStart = () => {
    // TODO: collect player names from PlayerSetup
    setPlayers([
      { name: 'Player 1', score: 0 },
      { name: 'Player 2', score: 0 },
    ]);
    const firstWord = getRandomWord([]);
    setCurrentWord(firstWord);
    setUsedWords([firstWord]);
    setGameState('playing');
  };

  const handleNextTurn = () => {
    // TODO: implement turn logic and end condition
    const nextIdx = (currentPlayerIdx + 1) % players.length;
    setCurrentPlayerIdx(nextIdx);
    // Pick a new word for the next turn
    const nextWord = getRandomWord(usedWords);
    if (nextWord) {
      setCurrentWord(nextWord);
      setUsedWords([...usedWords, nextWord]);
    } else {
      setGameState('end');
    }
    // Example: end after 4 turns
    if (nextIdx === 0) setGameState('end');
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
      {gameState === 'end' && <EndGame winner={winner} onRestart={handleRestart} />}
    </div>
  );
}

export default App;
