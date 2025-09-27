import { Chessboard, chessColumnToColumnIndex, defaultPieces, type PieceDropHandlerArgs, type PieceHandlerArgs, type PieceRenderObject } from 'react-chessboard';
import './App.css'
import { Chess, DEFAULT_POSITION, type PieceSymbol, type Square } from 'chess.js';
import { useState, type CSSProperties} from 'react';

const WHITE = "white"
const BLACK = "black"

// GameState
const NOT_STARTED = "not_started"
const PLAYING = "playing"

const COLUMN: CSSProperties = {
  width: '30vw',
  display: 'flex',
  flexDirection: 'column'
}


const BOARD = new Chess(DEFAULT_POSITION)
const BOT_MOVE_DELAY = 250
function App() {

  const [gameState, setGameState] = useState<string>(NOT_STARTED)
  const [playerColor, setPlayerColor] = useState<"white" | "black">(WHITE)
  const [playerToMove, setPlayerToMove] = useState(true)
  const [promotionMove, setPromotionMove] = useState<Omit<PieceDropHandlerArgs, 'piece'> | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  function handleDeficit(): boolean {
    // Bool: if we made the move
    if (botAtMaterialDeficit()) {
      if (BOARD.inCheck()) {
        BOARD.undo()
        setMsg("Illegal move. Cannot simultaniously create material deficit and put opponent in check.")
        return false;
      } else {
        BOARD.setTurn((playerColor === WHITE ? "w" : "b"))
        setPlayerColor(playerColor === WHITE ? BLACK : WHITE)
        return true;
      }
    }
    return true;
  }
  const onPieceDrop = (
    x: PieceDropHandlerArgs
  ) => {
    setGameState(PLAYING);
    if (!playerToMove) {
      return false;
    }
    setMsg(null);
    if (_onPieceDrop(
      x
    )) {
      setPlayerToMove(false)
      return true;
    }
    return false;
  }
  const _onPieceDrop = ({
    sourceSquare,
    targetSquare,
  }: PieceDropHandlerArgs) => {
    if (targetSquare === null) {
      return false;
    }
    // target square is a promotion square, check if valid and show promotion dialog
    if (targetSquare.match(/\d+$/)?.[0] === '8') {
      // get all possible moves for the source square
      const possibleMoves = BOARD.moves({
        square: sourceSquare as Square
      });

      // check if target square is in possible moves (accounting for promotion notation)
      if (possibleMoves.some(move => move.startsWith(`${targetSquare}=`))) {
        setPromotionMove({
          sourceSquare,
          targetSquare
        });
        return true;
      }

    }
    try {
      BOARD.move({ from: sourceSquare, to: targetSquare })
    } catch {
      return false;
    }

    if (!handleDeficit()) {
      return false;
    }

    if (BOARD.isGameOver()) {
      handleGameOver()
      return true;
    }

    setTimeout(botMove, BOT_MOVE_DELAY);

    return true;
  };

  function handleGameOver() {
    setMsg("Game Over!");
  }

  function onPromotionPieceSelect(piece: PieceSymbol) {
    BOARD.move({
      from: promotionMove!.sourceSquare,
      to: promotionMove!.targetSquare as Square,
      promotion: piece
    });
    setPromotionMove(null);

    if (!handleDeficit()) {
      BOARD.undo();
      return;
    }

    setPlayerToMove(true);
  }

  // calculate the left position of the promotion square
  const squareWidth = document.querySelector(`[data-column="a"][data-row="1"]`)?.getBoundingClientRect()?.width ?? 0;
  const promotionSquareLeft = promotionMove?.targetSquare ? squareWidth * chessColumnToColumnIndex(promotionMove.targetSquare.match(/^[a-z]+/)?.[0] ?? '', 8,
    // number of columns
    'white' // board orientation
  ) : 0;

  function botAtMaterialDeficit(): boolean {
    let points = 0
    for (const char of BOARD.fen().split(" ")[0]) {
      let isWhitePiece = 1;
      const piece = char.toLowerCase()
      if (piece === char) {
        isWhitePiece = -1;
      }
      let point = 0
      switch (piece) {
        case "p":
          point = 1;
          break;
        case "r":
          point = 5;
          break;
        case "n":
          point = 3;
          break;
        case "b":
          point = 3;
          break;
        case "q":
          point = 9
          break;
      }

      if (point != 0)
        points += point * isWhitePiece
    }
    if (points === 0) {
      return false;
    }
    return (points > 0 && playerColor === WHITE)
      || (points < 0 && playerColor === BLACK);
  }

  function botMove() {
    const moves = BOARD.moves()
    const move = moves[Math.floor(Math.random() * moves.length)]
    BOARD.move(move)
    setPlayerToMove(true)

    if (BOARD.isGameOver()) {
      handleGameOver()
    }
  }

  function canDragPiece(
    {
      piece
    }: PieceHandlerArgs,
  ) {
    return playerToMove && piece.pieceType[0] == playerColor[0];
  }

  const chessboardOptions = {
    canDragPiece: canDragPiece,
    boardOrientation: playerColor,
    onPieceDrop: onPieceDrop,
    position: BOARD.fen(),
    showAnimations: true,
  };

  if (gameState === NOT_STARTED) {
    return (
      <>
        <button onClick={() => {
          setPlayerColor(WHITE)
          setGameState(PLAYING)
        }}>WHITE</button>
        <button onClick={() => {
          setPlayerToMove(false)
          setPlayerColor(BLACK)
          setGameState(PLAYING)
          setTimeout(botMove, BOT_MOVE_DELAY)
        }}>BLACK</button>
      </>
    )
  }

  return <div style={{
    display: 'flex', flexDirection: 'row', justifyContent: "space-between"
  }}>
    <div style={COLUMN}>
      <p>Debugging</p>
      <button onClick={() => console.log(BOARD.fen())}>Get Fen</button>
      <button onClick={() => {
        BOARD.reset()
        setGameState(NOT_STARTED)
        setPlayerColor("white");
        setPlayerToMove(true);
        setPromotionMove(null);
        setMsg(null);
      }}>Reset</button>
    </div>
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1rem',
      alignItems: 'center',
      width: '80vh',
    }}>
      {promotionMove ? <div onClick={() => setPromotionMove(null)} onContextMenu={e => {
        e.preventDefault();
        setPromotionMove(null);
      }} style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        zIndex: 1000
      }} /> : null}

      {promotionMove ? <div style={{
        position: 'absolute',
        top: 0,
        left: promotionSquareLeft,
        backgroundColor: 'white',
        width: squareWidth,
        zIndex: 1001,
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.5)'
      }}>
        {(['q', 'r', 'n', 'b'] as PieceSymbol[]).map(piece => <button key={piece} onClick={() => {
          onPromotionPieceSelect(piece);
        }} onContextMenu={e => {
          e.preventDefault();
        }} style={{
          width: '100%',
          aspectRatio: '1',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
          border: 'none',
          cursor: 'pointer'
        }}>
          {defaultPieces[`w${piece.toUpperCase()}` as keyof PieceRenderObject]()}
        </button>)}
      </div> : null}

      <p style={{ height: '50px' }}>{msg}</p>
      <Chessboard options={chessboardOptions} />
    </div>
    <div style={COLUMN}></div>
  </div>
}

export default App
