import React, { useEffect } from 'react';
import { DIRECTION } from '../../enums/Direction';

import './Board.css'


const BOARD_SIZE = 10;

class LinkedListNode {
    constructor(value) {
        this.value = value;
        this.next = null;
    }
}

class LinkedList {
    constructor(value) {
        const node = new LinkedListNode(value);
        this.head = node;
        this.tail = node;
    }
}

const STARTING_ROW = 1;
const STARTING_COLUMN = 1;

export class Board extends React.Component {
    constructor(props) {
        super(props);

        const board = createBoard(BOARD_SIZE);
        const snake = new LinkedList({row: STARTING_ROW, column: STARTING_COLUMN, cell: board[STARTING_ROW][STARTING_COLUMN]});
        const snakeCells = new Set([snake.head.value.cell]);
        const direction = DIRECTION.RIGHT;

        this.state = {
            board: board,
            snake: snake,
            snakeCells: snakeCells,
            direction: direction
        }
    }

    isOutOfBounds(coordinates, board) {
        const { row, column } = coordinates;
        if (row < 0 || column < 0) return true;
        if (row >= board.length || column >= board[0].length) return true;
        return false;
    }

    moveSnake() {
        const snake = this.state.snake;

        const currentHeadCoordinates = {
            row: snake.head.value.row,
            column: snake.head.value.column
        };

        const nextHeadCoordinates = this.getCoordinatesInDirection(currentHeadCoordinates, this.state.direction);
        if (this.isOutOfBounds(nextHeadCoordinates, this.state.board)) {
            this.handleGameOver();
            return;
        }


        const nextHeadCell = this.state.board[nextHeadCoordinates.row][nextHeadCoordinates.column];
        const newHead = new LinkedListNode({
            row: nextHeadCoordinates.row,
            column: nextHeadCoordinates.column,
            cell: nextHeadCell
        });

        const currentHead = snake.head;
        snake.head = newHead;
        currentHead.next = newHead;

        const newSnakeCells = new Set(this.state.snakeCells);
        newSnakeCells.delete(snake.tail.value.cell);
        newSnakeCells.add(nextHeadCell);

        snake.tail = snake.tail.next || snake.head;

        this.setState({snakeCells: newSnakeCells});
    }

    handleKeydown(event) {
        const newDirection = DIRECTION[event.key.substring(5).toUpperCase()];
        console.log(newDirection)
        if (!newDirection) return;
        this.setState({direction: newDirection});
    }

    getCoordinatesInDirection(coordinates, direction) {
        if (direction === DIRECTION.UP) {
            return {
                row: coordinates.row - 1,
                column: coordinates.column
            };
        }

        if (direction === DIRECTION.RIGHT) {
            return {
                row: coordinates.row,
                column: coordinates.column + 1
            }
        }

        if (direction === DIRECTION.DOWN) {
            return {
                row: coordinates.row + 1,
                column: coordinates.column
            }
        }

        if (direction === DIRECTION.LEFT) {
            return {
                row: coordinates.row,
                column: coordinates.column - 1
            }
        }
    }

    handleGameOver() {
        const snake = new LinkedList({row: STARTING_ROW, column: STARTING_COLUMN, cell: this.state.board[STARTING_ROW][STARTING_COLUMN]});
        const snakeCells = new Set([snake.head.value.cell]);
        const direction = DIRECTION.RIGHT;

        this.setState({
            snake:  snake,
            snakeCells: snakeCells,
            direction: direction
        });
    }

    componentDidMount() {
        document.addEventListener("keydown", e => this.handleKeydown(e));

        setInterval(() => {
            this.moveSnake();
        }, 250);
    }

    render() {
        return (
            <>
                <div className="board">
                    {this.state.board.map((row, rowIndex) => (
                        <div key={rowIndex} className="row">
                            {row.map((cellValue, cellIndex) => {
                                const className = this.state.snakeCells.has(cellValue) ? "cell snake-cell" : "cell";
                                return <div key={cellIndex} className={className}></div>;
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

    for (let i = 0; i < boardSize; i++) {
        const currentRow = [];
        for (let j = 0; j < boardSize; j++) {
            currentRow.push(counter++);
        }
        board.push(currentRow);
    }
    return board;
}