import { Chessboard, type PieceDropHandlerArgs, type PieceHandlerArgs } from 'react-chessboard';
import './App.css'
import { Chess, DEFAULT_POSITION } from 'chess.js';
import { useState } from 'react';

const WHITE = "white"
const BLACK = "black"

const BOARD = new Chess(DEFAULT_POSITION)
function App() {

const [playerColor, setPlayerColor] = useState<"white"|"black">(WHITE)
const [playerToMove, setPlayerToMove] = useState(true)

const onPieceDrop = ({
      sourceSquare,
      targetSquare,
      piece, 
    }: PieceDropHandlerArgs) => {
      if (!playerToMove) {
        return false;
      }
      if (targetSquare === null) {
        return false;
      }
      try {
        BOARD.move({ from: sourceSquare, to: targetSquare})
      } catch {
        console.log("Invalid Move")
        return false;
      }
      setPlayerToMove(false)
      // TODO: Check point differential and swap teams if so
      // Remember BOARD.setTurn("w"||"b")

      if (BOARD.isGameOver()) {
        handleGameOver()
        return true;
      }

      setTimeout(botMove, 2000);

      return true; 
    };

  function handleGameOver() {
    console.log("game over")

  }

  function botMove() {
    console.log("HEllo world");
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

  return <>
  <div style={{'width': '50vw'}}>
  <Chessboard options={chessboardOptions} />
  </div>
  <button
  onClick={() => {setPlayerToMove(!playerToMove)}}>
    set move
  </button>
  <button
  onClick={() => {setPlayerColor(playerColor === WHITE ? BLACK: WHITE)}}>
    set color
  </button>
  </>;
}

export default App
