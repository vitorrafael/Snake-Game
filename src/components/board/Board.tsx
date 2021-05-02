import React, { FunctionComponent, useEffect, useState, useRef } from 'react';

import { generateRandomNumberInRange } from '../../utils/Utils';
import { LinkedList, LinkedListNode } from './LinkedList';

import './Board.css'
import useInterval from '../../utils/useInterval';

const BOARD_SIZE = 12;

type SnakePart = {
    row: number;
    column: number;
    cell: number;
};

type SnakeCellsType = Set<SnakePart["cell"]>;

type BoardType = Array<Array<number>>;

type Coordinates = {
    row: number;
    column: number;
}

enum CellClassName {
    Food = "cell food-cell",
    Snake = "cell snake-cell",
    Board = "cell"
};

enum Direction {
    Up = "Up",
    Left = "Left",
    Right = "Right",
    Down = "Down"
};

export const Board: FunctionComponent = () => {

    const board: BoardType = createBoard(BOARD_SIZE);
    const [score, setScore] = useState(0);

    const snakeStartingRow: number = Math.floor(BOARD_SIZE / 3);
    const snakeStartingColumn: number = Math.floor(BOARD_SIZE / 3);
    const [snake, setSnake] = useState(new LinkedList<SnakePart>({
        row: snakeStartingRow,
        column: snakeStartingRow,
        cell: board[snakeStartingRow][snakeStartingColumn]
    }));

    const [snakeCells, _setSnakeCells] = useState<SnakeCellsType>(new Set([snake.head.value.cell]));
    const snakeCellsRef = useRef(snakeCells);

    const setSnakeCells = (newSnakeCells: SnakeCellsType) => {
        snakeCellsRef.current = newSnakeCells;
        _setSnakeCells(newSnakeCells);
    }

    const [foodCell, setFoodCell] = useState(getNextFoodCell());

    const [direction, _setDirection] = useState(Direction.Right);
    const directionRef = useRef(direction);
    const setDirection = (newDirection: Direction) => {
        directionRef.current = newDirection;
        _setDirection(newDirection);
    }

    useEffect(() => {
        document.addEventListener("keydown", e => handleKeydown(e));
        return () => document.removeEventListener("keydown", e => handleKeydown(e));
    });

    useInterval(() => moveSnake(), 100);

    function getCellClassName(cellValue: number): string {
        if (cellValue === foodCell) return CellClassName.Food;
        if (snakeCells.has(cellValue)) return CellClassName.Snake;
        return CellClassName.Board;
    }

    function getNextFoodCell(): number {
        const maxPossibleCellValue = BOARD_SIZE * BOARD_SIZE;
        let nextFoodCell: number;
        do {
            nextFoodCell = generateRandomNumberInRange(1, maxPossibleCellValue);
        } while (snakeCells.has(nextFoodCell) || foodCell === nextFoodCell);
        return nextFoodCell;
    }

    function getCoordinatesInDirection(coordinates: Coordinates, direction: Direction): Coordinates {
        if (direction === Direction.Up) {
            return {
                row: coordinates.row - 1,
                column: coordinates.column
            };
        } else if (direction === Direction.Right) {
            return {
                row: coordinates.row,
                column: coordinates.column + 1
            }
        } else if (direction === Direction.Down) {
            return {
                row: coordinates.row + 1,
                column: coordinates.column
            }
        } else {
            return {
                row: coordinates.row,
                column: coordinates.column - 1
            }
        }
    }

    function getDirectionFromKeyboardPress(key: string): Direction | undefined {
        if (key === 'ArrowUp') return Direction.Up;
        if (key === 'ArrowDown') return Direction.Down;
        if (key === 'ArrowLeft') return Direction.Left;
        if (key === 'ArrowRight') return Direction.Right
    }

    function getOppositeDirection(direction: Direction): Direction {
        if (direction === Direction.Up) return Direction.Down;
        else if (direction === Direction.Right) return Direction.Left;
        else if (direction === Direction.Down) return Direction.Up;
        else return Direction.Right;
    }

    function getNextNodeDirection(node: LinkedListNode<SnakePart>) {
        if (!node.next) return direction;
        const { row: currentRow, column: currentColumn } = node.value;
        const { row: nextRow, column: nextColumn } = node.next.value;

        if (nextRow === currentRow && nextColumn === currentColumn + 1) return Direction.Right;
        if (nextRow === currentRow && nextColumn === currentColumn - 1) return Direction.Left;
        if (nextRow === currentRow + 1 && nextColumn === currentColumn) return Direction.Down;
        if (nextRow === currentRow - 1 && nextColumn === currentColumn) return Direction.Up;

        return direction;
    }


    function getGrowthNodeCoordinates() {
        const tailNextNodeDirection = getNextNodeDirection(snake.tail);
        const growthDirection = getOppositeDirection(tailNextNodeDirection);

        const currentTailNodeCoordinates = {
            row: snake.tail.value.row,
            column: snake.tail.value.column
        };

        const growthNodeCoordinates = getCoordinatesInDirection(currentTailNodeCoordinates, growthDirection);

        return growthNodeCoordinates;
    }

    function growSnake() {
        const growthNodeCoordinates = getGrowthNodeCoordinates();

        if (isOutOfBounds(growthNodeCoordinates)) return;

        const newTailCell = board[growthNodeCoordinates.row][growthNodeCoordinates.column];
        const newTail = {
            row: growthNodeCoordinates.row,
            column: growthNodeCoordinates.column,
            cell: newTailCell
        };

        snake.insertAtTail(newTail)
        snakeCells.add(newTailCell);
    }

    function handleFoodConsumption() {
        const nextFoodCell = getNextFoodCell();
        setScore(score + 1);
        setFoodCell(nextFoodCell)
    }

    function handleGameOver() {
        const snake = new LinkedList({
            row: snakeStartingRow,
            column: snakeStartingColumn,
            cell: board[snakeStartingRow][snakeStartingColumn]
        });

        setSnake(snake);
        setSnakeCells(new Set([snake.head.value.cell]));
        setFoodCell(getNextFoodCell());
        setDirection(Direction.Right);
        setScore(0);
    }

    function handleKeydown(event: KeyboardEvent) {
        debugger;
        const newDirection = getDirectionFromKeyboardPress(event.key);
        if (newDirection !== undefined && newDirection !== getOppositeDirection(directionRef.current))
            setDirection(newDirection);
    }

    function isOutOfBounds(coordinates: Coordinates) {
        const { row, column } = coordinates;
        if (row < 0 || column < 0) return true;
        if (row >= board.length || column >= board[0].length) return true;
        return false;
    }

    function moveSnake() {
        const currentHeadCoordinates = {
            row: snake.head.value.row,
            column: snake.head.value.column
        };

        const nextHeadCoordinates = getCoordinatesInDirection(currentHeadCoordinates, direction);
        if (isOutOfBounds(nextHeadCoordinates)) {
            handleGameOver();
            return;
        }

        const nextHeadCell = board[nextHeadCoordinates.row][nextHeadCoordinates.column];
        if (snakeCells.has(nextHeadCell)) {
            handleGameOver();
            return;
        }

        const newHead: SnakePart = {
            row: nextHeadCoordinates.row,
            column: nextHeadCoordinates.column,
            cell: nextHeadCell
        };
        snake.insertAtHead(newHead);

        const newSnakeCells = new Set(snakeCells);
        newSnakeCells.delete(snake.tail.value.cell);
        newSnakeCells.add(nextHeadCell);

        snake.tail = snake.tail.next || snake.head;

        const foodConsumed = nextHeadCell === foodCell;
        if (foodConsumed) {
            handleFoodConsumption();
            growSnake();
        }

        setSnakeCells(newSnakeCells);
    }

    return (
        <>
            <h1>Score: {score}</h1>
            <div className="board">
                {board.map((row, rowIndex) => (
                    <div key={rowIndex} className="row">
                        {row.map((cellValue, cellIndex) => {
                            return <div key={cellIndex} className={getCellClassName(cellValue)}></div>;
                        })}
                    </div>
                ))}
            </div>
        </>
    )
}

function createBoard(boardSize: number): BoardType {
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