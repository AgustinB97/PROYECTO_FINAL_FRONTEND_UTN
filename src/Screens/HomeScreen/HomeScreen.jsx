import { useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";

const HomeScreen = () => {
    const [game, setGame] = useState(new Chess());

    const onDrop = (sourceSquare, targetSquare) => {
        const newGame = new Chess(game.fen());
        const move = newGame.move({
            from: sourceSquare,
            to: targetSquare,
            promotion: "q", // siempre promover a reina
        });

        if (move === null) return false;
        setGame(newGame);
        return true;
    };

    const resetGame = () => setGame(new Chess());

    return (
        <div
            style={{
                backgroundColor: "#1e1e1e",
                color: "white",
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "20px",
            }}
        >
            <h1 style={{ fontSize: "2rem", marginBottom: "20px", textAlign: "center" }}>
                Ajedrez Online ♟️
            </h1>

            <div
                style={{
                    backgroundColor: "#2c2c2c",
                    padding: "10px",
                    borderRadius: "10px",
                    boxShadow: "0 0 10px rgba(0,0,0,0.5)",
                }}
            >
                <Chessboard
                    position={game.fen()}
                    onPieceDrop={onDrop}
                    boardWidth={window.innerWidth < 600 ? 300 : 500}
                    arePiecesDraggable={true}
                />
            </div>

            {game.isGameOver() && (
                <p style={{ marginTop: "15px", color: "#ff7676", fontWeight: "bold" }}>
                    {game.isCheckmate() ? "¡Jaque Mate!" : "Partida terminada."}
                </p>
            )}

            <button
                onClick={resetGame}
                style={{
                    marginTop: "20px",
                    backgroundColor: "#4CAF50",
                    color: "white",
                    border: "none",
                    padding: "10px 20px",
                    borderRadius: "5px",
                    fontSize: "1rem",
                    cursor: "pointer",
                }}
            >
                Reiniciar partida
            </button>
        </div>
    );
};

export default HomeScreen;
