# Spelling Bee Game: Project Plan

## 1. Game Requirements & Flow
- 2–4 players, local (same device)
- Each round: the word is spoken aloud (not shown on screen)
- Player spells the word using their voice (speech recognition)
- After the attempt, the correct spelling is revealed and feedback is given
- Scores are tracked for each player
- Game ends after a set number of rounds or when a player reaches a target score
- Winner is displayed, with an option to replay

## 2. UI/UX Structure
- Welcome/Setup screen: Enter player names, select number of players, start game
- Game screen:
  - Show current player, play word audio, voice spelling input
  - Show scores and round info
  - Feedback for correct/incorrect spelling after each attempt
- End screen: Show winner, scores, and option to restart

## 3. Core Features
- Player management (names, scores, turns)
- Word selection (randomized, no repeats)
- Turn/round logic
- Score calculation
- Game state management (start, in progress, end)
- Responsive, accessible UI

## 4. Technical Steps
1. Scaffold React project (done)
2. Design and implement components:
   - PlayerSetup
   - GameBoard
   - Scoreboard
   - EndGame
3. Implement game logic (state, turns, word selection)
4. Integrate speech synthesis (for reading words aloud)
5. Integrate speech recognition (for capturing spelling attempts)
6. Add styling for a fun, user-friendly experience
7. Test and refine gameplay

## 5. Optional Enhancements
- Word difficulty levels
- Timer for each turn
- Sound effects or animations
- Persistent high scores (localStorage)
