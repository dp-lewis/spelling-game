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
  const [players, setPlayers] = useState([]); // [{ name, score }]
  const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0);
  const [winner, setWinner] = useState(null);
  const [usedWords, setUsedWords] = useState([]);
  const [currentWord, setCurrentWord] = useState(null);
  const [customWords, setCustomWords] = useState(null);
  const [customNames, setCustomNames] = useState(null);

  // Updated handleStart to accept custom words and player names
  const handleStart = (words, names) => {
    setPlayers(names.map(name => ({ name, score: 0 })));
    setCustomWords(words);
    setCustomNames(names);
    const firstWord = getRandomWord([], words);
    setCurrentWord(firstWord);
    setUsedWords([firstWord]);
    setGameState('playing');
  };

  // Update getRandomWord to use customWords if provided
  function getRandomWord(usedWords, wordList) {
    const available = (wordList || customWords || WORDS).filter(w => !usedWords.includes(w));
    if (available.length === 0) return null;
    return available[Math.floor(Math.random() * available.length)];
  }

  const handleNextTurn = () => {
    const nextIdx = (currentPlayerIdx + 1) % players.length;
    setCurrentPlayerIdx(nextIdx);
    const nextWord = getRandomWord(usedWords);
    if (nextWord) {
      setCurrentWord(nextWord);
      setUsedWords([...usedWords, nextWord]);
    } else {
      setGameState('end');
    }
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
