import React from 'react';

import { generateRandomNumberInRange } from '../../utils/Utils';
import { LinkedList } from './LinkedList';
import { Direction } from '../../enums/Direction';

import './Board.css'

const BOARD_SIZE = 12;

export class Board extends React.Component {
    constructor(props) {
        super(props);

        const board = createBoard(BOARD_SIZE);

        const startingRow = Math.floor(BOARD_SIZE / 3);
        const startingColumn = Math.floor(BOARD_SIZE / 3);
        const snake = new LinkedList({
            row: startingRow,
            column: startingColumn,
            cell: board[startingRow][startingColumn]
        });

        const snakeCells = new Set([snake.head.value.cell]);
        const foodCell = this.getNextFoodCell(snakeCells);

        const direction = Direction.RIGHT;
        const score = 0;

        this.state = {
            board,
            snake,
            snakeCells,
            direction,
            foodCell,
            score
        };
    }

    handleFoodConsumption() {
        const nextFoodCell = this.getNextFoodCell(this.state.snakeCells);
        const score = this.state.score + 1;
        this.setState({ foodCell: nextFoodCell, score });
    }

    handleGameOver() {
        const startingRow = Math.floor(BOARD_SIZE / 3);
        const startingColumn = Math.floor(BOARD_SIZE / 3);
        const snake = new LinkedList({
            row: startingRow,
            column: startingColumn,
            cell: this.state.board[startingRow][startingColumn]
        });

        const snakeCells = new Set([snake.head.value.cell]);
        const foodCell = this.getNextFoodCell(snakeCells);

        const direction = Direction.RIGHT;
        const score = 0;

        this.setState({
            snake,
            snakeCells,
            direction,
            foodCell,
            score
        });
    }

    handleKeydown(event) {
        const newDirection = this.getDirectionFromKeyboardPress(event.key);
        if (!newDirection || newDirection === this.getOppositeDirection(this.state.direction)) return;
        this.setState({ direction: newDirection });
    }

    getCellClassName(cellValue, foodCell, snakeCells) {
        let className = 'cell';
        if (cellValue === foodCell) className = 'cell food-cell';
        if (snakeCells.has(cellValue)) className = 'cell snake-cell';

        return className;
    }

    getCoordinatesInDirection(coordinates, direction) {
        if (direction === Direction.UP) {
            return {
                row: coordinates.row - 1,
                column: coordinates.column
            };
        }

        if (direction === Direction.RIGHT) {
            return {
                row: coordinates.row,
                column: coordinates.column + 1
            }
        }

        if (direction === Direction.DOWN) {
            return {
                row: coordinates.row + 1,
                column: coordinates.column
            }
        }

        if (direction === Direction.LEFT) {
            return {
                row: coordinates.row,
                column: coordinates.column - 1
            }
        }
    }

    getDirectionFromKeyboardPress(key) {
        if (key === 'ArrowUp') return Direction.UP;
        if (key === 'ArrowDown') return Direction.DOWN;
        if (key === 'ArrowLeft') return Direction.LEFT;
        if (key === 'ArrowRight') return Direction.RIGHT
    }

    getGrowthNodeCoordinates(snakeTail, currentDirection) {
        const tailNextNodeDirection = this.getNextNodeDirection(snakeTail, currentDirection);
        const growthDirection = this.getOppositeDirection(tailNextNodeDirection);

        const currentTailNodeCoordinates = {
            row: snakeTail.value.row,
            column: snakeTail.value.column
        };

        const growthNodeCoordinates = this.getCoordinatesInDirection(currentTailNodeCoordinates, growthDirection);

        return growthNodeCoordinates;
    }

    getNextFoodCell(snakeCells) {
        const maxPossibleCellValue = BOARD_SIZE * BOARD_SIZE;
        let nextFoodCell;
        while (true) {
            nextFoodCell = generateRandomNumberInRange(1, maxPossibleCellValue);
            if (snakeCells.has(nextFoodCell) || (this.state && this.state.foodCell && this.state.foodCell === nextFoodCell)) continue;
            else break;
        }
        return nextFoodCell;
    }

    getNextNodeDirection(node, currentDirection) {
        if (!node.next) return currentDirection;
        const { row: currentRow, column: currentColumn } = node.value;
        const { row: nextRow, column: nextColumn } = node.next.value;

        if (nextRow === currentRow && nextColumn === currentColumn + 1) return Direction.RIGHT;
        if (nextRow === currentRow && nextColumn === currentColumn - 1) return Direction.LEFT;
        if (nextRow === currentRow + 1 && nextColumn === currentColumn) return Direction.DOWN;
        if (nextRow === currentRow - 1 && nextColumn === currentColumn) return Direction.UP;

        return '';
    }

    getOppositeDirection(direction) {
        if (direction === Direction.UP) return Direction.DOWN;
        if (direction === Direction.RIGHT) return Direction.LEFT;
        if (direction === Direction.DOWN) return Direction.UP;
        if (direction === Direction.LEFT) return Direction.RIGHT;
    }

    growSnake(snakeCells) {
        const { snake, direction, board } = this.state;
        const growthNodeCoordinates = this.getGrowthNodeCoordinates(snake.tail, direction);

        if (this.isOutOfBounds(growthNodeCoordinates, board)) return;

        const newTailCell = board[growthNodeCoordinates.row][growthNodeCoordinates.column];
        const newTail = {
            row: growthNodeCoordinates.row,
            column: growthNodeCoordinates.column,
            cell: newTailCell
        };
        snake.insertAtTail(newTail)
        snakeCells.add(newTailCell);
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
        if (this.state.snakeCells.has(nextHeadCell)) {
            this.handleGameOver();
            return;
        }

        const newHead = {
            row: nextHeadCoordinates.row,
            column: nextHeadCoordinates.column,
            cell: nextHeadCell
        };
        snake.insertAtHead(newHead);

        const newSnakeCells = new Set(this.state.snakeCells);
        newSnakeCells.delete(snake.tail.value.cell);
        newSnakeCells.add(nextHeadCell);

        snake.tail = snake.tail.next || snake.head;

        const foodConsumed = nextHeadCell === this.state.foodCell;
        if (foodConsumed) {
            this.handleFoodConsumption(newSnakeCells);
            this.growSnake(newSnakeCells);
        }

        this.setState({ snakeCells: newSnakeCells });
    }

    componentDidMount() {
        document.addEventListener("keydown", e => this.handleKeydown(e));

        setInterval(() => {
            this.moveSnake();
        }, 100);
    }

    render() {
        return (
            <>
                <h1>Score: {this.state.score}</h1>
                <div className="board">
                    {this.state.board.map((row, rowIndex) => (
                        <div key={rowIndex} className="row">
                            {row.map((cellValue, cellIndex) => {
                                const { foodCell, snakeCells } = this.state;
                                const className = this.getCellClassName(cellValue, foodCell, snakeCells);
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