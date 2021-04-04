import React from 'react';
import './Board.css'


const BOARD_SIZE = 10;

export class Board extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            board: createBoard(BOARD_SIZE)
        }
    }

    render() {
        return (
            <>
                <div className="board">
                    {this.state.board.map((row, rowIndex) => (
                        <div key={rowIndex} className="row">
                            {row.map((cellValue, cellIndex) => {
                                return <div key={cellIndex} className="cell"></div>;
                            })}
                        </div>
                    ))}
                </div>
            </>
        )
    }
}

function createBoard(boardSize) {
    let counter = 1;
    const board = [];

    for (let i = 0; i < BOARD_SIZE; i++) {
        const currentRow = [];
        for (let j = 0; j < BOARD_SIZE; j++) {
            currentRow.push(counter++);
        }
        board.push(currentRow);
    }
    return board;
}