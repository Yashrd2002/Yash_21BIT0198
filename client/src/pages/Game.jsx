import React, { useState, useEffect } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import History from "../components/History";
import Board from "../components/Board";

const Game = () => {
  const { room } = useParams();
  const [gameState, setGameState] = useState(null);
  const location = useLocation()
  const { spectate} = location?.state ?? false
  

  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000");
    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "join", room }));
    };

    ws.onmessage = (event) => {
      const message = JSON.parse(event.data);
      if (message.type === "update") {
        setGameState(message.gameState);
      }
    };

    window.ws = ws;

    return () => {
      ws.close();
    };
  }, [room]);

  const handleReset = () => {
    window.ws.send(JSON.stringify({ type: "reset" }));
  };

  if (!gameState) {
    return <div>Loading game...</div>;
  }

  return (
    <div className="text-center p-[20px] bg-black min-h-screen text-white roboto-regular">
      <h1 className="text-[40px] roboto-medium">Board Game</h1>
      <h1 className="text-lg text-[#6f6969] mt-5">Current Room Number : {room} <Link to={"/"} className="text-blue-500 text-sm ml-4">Join another room</Link></h1>
      <Board
        board={gameState.board}
        currentPlayer={gameState.currentPlayer}
        spectate={spectate}
      />
      {gameState.gameOver && (
        <div className="mt-[20px]">
          <h2 className="text-xl">Game Over! {gameState.winner} Wins! 🎉</h2>
          <button
            onClick={handleReset}
            className="bg-[#cbe72c] px-2 p-1 mt-4 text-black roboto-medium"
          >
            Start New Game
          </button>
        </div>
      )}
      {spectate && <div className="text-[#cbe72c] mt-4 roboto-medium">You are Spectating</div>}
      <History history={gameState.moveHistory} />
      {!gameState.gameOver && !spectate && (
        <div>
          <button
            onClick={handleReset}
            className="bg-[#cbe72c] px-3 p-1 mt-4 text-black roboto-medium"
          >
            Reset
          </button>
  
        </div>
      )}

    </div>
  );
};

export default Game;
