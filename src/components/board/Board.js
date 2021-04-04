import React from 'react';
import { generateRandomNumberInRange } from '../../utils/Utils';
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
        const snake = new LinkedList({ row: STARTING_ROW, column: STARTING_COLUMN, cell: board[STARTING_ROW][STARTING_COLUMN] });
        const snakeCells = new Set([snake.head.value.cell]);
        const foodCell = snake.head.value.cell + 5;
        const direction = DIRECTION.RIGHT;

        this.state = {
            board: board,
            snake: snake,
            snakeCells: snakeCells,
            direction: direction,
            foodCell: foodCell
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

        const foodConsumed = nextHeadCell === this.state.foodCell;
        if (foodConsumed) {
            this.handleFoodConsumption(newSnakeCells);
            this.growSnake(newSnakeCells);
        }

        this.setState({ snakeCells: newSnakeCells });
    }

    growSnake(snakeCells) {
        const { snake, direction, board } = this.state;
        const growthNodeCoordinates = this.getGrowthNodeCoordinates(snake.tail, direction);

        if (this.isOutOfBounds(growthNodeCoordinates, board)) return;

        const newTailCell = board[growthNodeCoordinates.row][growthNodeCoordinates.column];
        const newTail = new LinkedListNode({
            row: growthNodeCoordinates.row,
            column: growthNodeCoordinates.column,
            cell: newTailCell
        });

        const currentTail = snake.tail;
        snake.tail = newTail;
        snake.tail.next = currentTail;

        snakeCells.add(newTailCell);
    }

    handleFoodConsumption(snakeCells) {
        const maxPossibleCellValue = BOARD_SIZE * BOARD_SIZE;

        let nextFoodCell;
        while (true) {
            nextFoodCell = generateRandomNumberInRange(1, maxPossibleCellValue);
            if (snakeCells.has(nextFoodCell) || this.state.foodCell === nextFoodCell) continue;
            else break;
        }

        this.setState({ foodCell: nextFoodCell });
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


    getGrowthNodeCoordinates(snakeTail, currentDirection) {
        const tailNextNodeDirection = getNextNodeDirection(snakeTail, currentDirection);
        const growthDirection = getOppositeDirection(tailNextNodeDirection);

        const currentTailNodeCoordinates = {
            row: snakeTail.value.row,
            column: snakeTail.value.column
        };

        const growthNodeCoordinates = this.getCoordinatesInDirection(currentTailNodeCoordinates, growthDirection);

        return growthNodeCoordinates;
    }

    handleGameOver() {
        const snake = new LinkedList({ row: STARTING_ROW, column: STARTING_COLUMN, cell: this.state.board[STARTING_ROW][STARTING_COLUMN] });
        const snakeCells = new Set([snake.head.value.cell]);
        const direction = DIRECTION.RIGHT;
        const foodCell = snake.head.value.cell + 5;

        this.setState({
            snake,
            snakeCells,
            direction,
            foodCell
        });
    }

    getCellClassName(cellValue, foodCell, snakeCells) {
        let className = 'cell';
        if (cellValue === foodCell) className = 'cell food-cell';
        if (snakeCells.has(cellValue)) className = 'cell snake-cell';

        return className;
    }

    componentDidMount() {
        document.addEventListener("keydown", e => this.handleKeydown(e));

        setInterval(() => {
            this.moveSnake();
        }, 150);
    }

    render() {
        return (
            <>
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


function getOppositeDirection(direction) {
    if (direction === DIRECTION.UP) return DIRECTION.DOWN;
    if (direction === DIRECTION.RIGHT) return DIRECTION.LEFT;
    if (direction === DIRECTION.DOWN) return DIRECTION.UP;
    if (direction === DIRECTION.LEFT) return DIRECTION.RIGHT;
}

function getNextNodeDirection(node, currentDirection) {
    if (!node.next) return currentDirection;
    const { row: currentRow, column: currentColumn } = node.value;
    const { row: nextRow, column: nextColumn } = node.next.value;

    if (nextRow === currentRow && nextColumn === currentColumn + 1) return DIRECTION.RIGHT;
    if (nextRow === currentRow && nextColumn === currentColumn - 1) return DIRECTION.LEFT;
    if (nextRow === currentRow + 1 && nextColumn === currentColumn) return DIRECTION.DOWN;
    if (nextRow === currentRow - 1 && nextColumn === currentColumn) return DIRECTION.UP;

    return '';
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