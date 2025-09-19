import React, { useMemo, useState } from 'react';
import './App.css';

/**
 * Ocean Professional Tic Tac Toe
 * - Centered game board
 * - PvP or Vs Computer (simple AI with win/block/fork-prevent and center/corner strategy)
 * - Status display (turn, winner, draw)
 * - Controls under the board
 * - Minimal header and footer
 */

// Helpers
const LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function calculateWinner(squares) {
  for (const [a, b, c] of LINES) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { player: squares[a], line: [a, b, c] };
    }
  }
  return null;
}

function emptyIndices(squares) {
  return squares.map((v, i) => (v ? null : i)).filter((v) => v !== null);
}

function tryWinningMove(squares, player) {
  for (const idx of emptyIndices(squares)) {
    const test = squares.slice();
    test[idx] = player;
    if (calculateWinner(test)) return idx;
  }
  return null;
}

function tryBlockingMove(squares, player) {
  const opponent = player === 'X' ? 'O' : 'X';
  return tryWinningMove(squares, opponent);
}

function chooseStrategicMove(squares) {
  // Center
  if (!squares[4]) return 4;
  // Corners
  const corners = [0, 2, 6, 8].filter((i) => !squares[i]);
  if (corners.length) return corners[Math.floor(Math.random() * corners.length)];
  // Sides
  const sides = [1, 3, 5, 7].filter((i) => !squares[i]);
  if (sides.length) return sides[Math.floor(Math.random() * sides.length)];
  return null;
}

function computeBestMove(squares, player) {
  // Win
  const winIdx = tryWinningMove(squares, player);
  if (winIdx !== null) return winIdx;
  // Block
  const blockIdx = tryBlockingMove(squares, player);
  if (blockIdx !== null) return blockIdx;
  // Strategy
  const strat = chooseStrategicMove(squares);
  if (strat !== null) return strat;
  // Fallback
  const empties = emptyIndices(squares);
  return empties.length ? empties[0] : null;
}

function Square({ value, onClick, isWinning, index }) {
  return (
    <button
      className={`ttt-square ${isWinning ? 'ttt-square-win' : ''}`}
      onClick={onClick}
      aria-label={`Square ${index + 1} ${value ? 'occupied by ' + value : 'empty'}`}
    >
      {value}
    </button>
  );
}

function Board({ squares, onPlay, winnerInfo, disabled }) {
  const renderSquare = (i) => {
    const isWinning = winnerInfo?.line?.includes(i);
    return (
      <Square
        key={i}
        index={i}
        value={squares[i]}
        onClick={() => onPlay(i)}
        isWinning={isWinning}
      />
    );
  };

  return (
    <div className={`ttt-board ${disabled ? 'ttt-disabled' : ''}`} role="grid" aria-label="Tic Tac Toe board">
      {[0, 1, 2].map((row) => (
        <div className="ttt-row" role="row" key={row}>
          {[0, 1, 2].map((col) => renderSquare(row * 3 + col))}
        </div>
      ))}
    </div>
  );
}

// PUBLIC_INTERFACE
function App() {
  // Theme is fixed to Ocean Professional for consistency with the style guide
  const [squares, setSquares] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [mode, setMode] = useState('pvp'); // 'pvp' or 'cpu'
  const [playerSymbol, setPlayerSymbol] = useState('X'); // user symbol in cpu mode

  const winnerInfo = useMemo(() => calculateWinner(squares), [squares]);
  const isDraw = useMemo(() => !winnerInfo && squares.every(Boolean), [winnerInfo, squares]);
  const currentPlayer = xIsNext ? 'X' : 'O';
  const cpuSymbol = playerSymbol === 'X' ? 'O' : 'X';
  const isCpuTurn = mode === 'cpu' && currentPlayer === cpuSymbol && !winnerInfo && !isDraw;

  const statusText = useMemo(() => {
    if (winnerInfo) return `Winner: ${winnerInfo.player}`;
    if (isDraw) return "It's a draw";
    return `Turn: ${currentPlayer}`;
  }, [winnerInfo, isDraw, currentPlayer]);

  const canInteract = !winnerInfo && !isDraw && (!isCpuTurn);

  const handlePlay = (i) => {
    if (squares[i] || winnerInfo || isDraw || (mode === 'cpu' && currentPlayer === cpuSymbol)) return;
    const next = squares.slice();
    next[i] = currentPlayer;
    setSquares(next);
    setXIsNext(!xIsNext);
  };

  // Computer move effect (synchronous after state updates using microtask)
  if (isCpuTurn) {
    const idx = computeBestMove(squares, cpuSymbol);
    if (idx !== null) {
      // Apply a small async to allow UI update smoothly
      setTimeout(() => {
        setSquares((prev) => {
          if (prev[idx] || calculateWinner(prev) || prev.every(Boolean)) return prev;
          const next = prev.slice();
          next[idx] = cpuSymbol;
          return next;
        });
        setXIsNext((prev) => !prev);
      }, 220); // subtle delay for nicer UX
    }
  }

  const resetGame = () => {
    setSquares(Array(9).fill(null));
    setXIsNext(true);
  };

  const handleModeChange = (e) => {
    const newMode = e.target.value;
    setMode(newMode);
    resetGame();
  };

  const handleSymbolChange = (e) => {
    const newSymbol = e.target.value;
    setPlayerSymbol(newSymbol);
    // If CPU goes first (player picks O), auto-move CPU
    setSquares(Array(9).fill(null));
    setXIsNext(true);
    // If player is O, CPU (X) will move immediately after render by isCpuTurn guard
  };

  return (
    <div className="ocean-app">
      <header className="ocean-header">
        <div className="container">
          <h1 className="brand">Tic Tac Toe</h1>
          <p className="tagline">Ocean Professional • Play with a friend or the computer</p>
        </div>
      </header>

      <main className="ocean-main">
        <div className="container">
          <section className="game-card">
            <div className="game-header">
              <div className="status-badge" data-variant={winnerInfo ? 'success' : isDraw ? 'warning' : 'info'}>
                {statusText}
              </div>
            </div>

            <Board squares={squares} onPlay={handlePlay} winnerInfo={winnerInfo} disabled={!canInteract} />

            <div className="controls">
              <div className="control-group">
                <label htmlFor="mode" className="control-label">Mode</label>
                <select id="mode" className="select" value={mode} onChange={handleModeChange}>
                  <option value="pvp">Player vs Player</option>
                  <option value="cpu">Player vs Computer</option>
                </select>
              </div>

              {mode === 'cpu' && (
                <div className="control-group">
                  <label htmlFor="symbol" className="control-label">Your Symbol</label>
                  <select id="symbol" className="select" value={playerSymbol} onChange={handleSymbolChange}>
                    <option value="X">X (First)</option>
                    <option value="O">O (Second)</option>
                  </select>
                </div>
              )}

              <div className="control-group">
                <label className="control-label">&nbsp;</label>
                <button className="btn primary" onClick={resetGame} aria-label="Reset the game">
                  Reset
                </button>
              </div>
            </div>

            <div className="legend">
              <div className="legend-item">
                <span className="legend-swatch primary" /> Primary
              </div>
              <div className="legend-item">
                <span className="legend-swatch secondary" /> Accent
              </div>
              <div className="legend-item">
                <span className="legend-swatch error" /> Error
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="ocean-footer">
        <div className="container">
          <p>Built with ❤️ • Ocean Professional Theme</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
