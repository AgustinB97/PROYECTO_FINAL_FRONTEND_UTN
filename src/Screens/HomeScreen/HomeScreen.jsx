/* import { useState, useRef } from "react";

import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";

const HomeScreen = () => {
    // 🔒 Mantiene la instancia del juego entre renders
    const chess = useRef(new Chess());
    const [position, setPosition] = useState(chess.current.fen());

    const onDrop = (sourceSquare, targetSquare) => {
        console.log("onDrop:", sourceSquare, "->", targetSquare);
        const move = chess.current.move({
            from: sourceSquare,
            to: targetSquare,
            promotion: "q",
        });

        if (move === null) {
            console.log("❌ Movimiento inválido");
            return false;
        }

        console.log("✅ Movimiento válido:", move);
        setPosition(chess.current.fen());
        return true;
    };

    const resetGame = () => {
        chess.current = new Chess();
        setPosition(chess.current.fen());
    };

    console.log("♟️ Render HomeScreen - FEN:", position);

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
                    position={position}
                    onDrop={onDrop}
                    boardWidth={window.innerWidth < 600 ? 320 : 500}
                />
            </div>

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
 */

