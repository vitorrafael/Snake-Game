import { useState } from "react";
import { LinkedList } from "../board/LinkedList";

type SnakeUnit = number;

type SnakeMember = {
  row: number;
  column: number;
  cell: SnakeUnit;
};

export function useSnake(props: SnakeMember) {
  const [snake, setSnake] = useState(new LinkedList<SnakeMember>(props));
  const [snakeUnits, setSnakeUnits] = useState<Set<SnakeUnit>>(
    new Set<SnakeUnit>([snake.head.value.cell])
  );

  function moveSnake(nextRow: number, newColumn: number, nextCell: number) {
    const newSnakeHead: SnakeMember = {
      row: nextRow,
      column: newColumn,
      cell: nextCell,
    };

    snake.insertAtHead(newSnakeHead);

    setSnakeUnits((currentSnakeUnits) => {
      const newSnakeUnits = new Set(currentSnakeUnits);
      newSnakeUnits.delete(snake.tail.value.cell);
      newSnakeUnits.add(nextCell);
      return newSnakeUnits;
    });
    
    snake.tail = snake.tail.next || snake.head;
  }

  function growSnake(
    growthRow: number,
    growthColumn: number,
    growthCell: number
  ) {
    const newSnakeTail: SnakeMember = {
      row: growthRow,
      column: growthColumn,
      cell: growthCell,
    };

    snake.insertAtTail(newSnakeTail)

    setSnakeUnits((currentSnakeUnits) => {
      const newSnakeUnits = new Set(currentSnakeUnits);
      newSnakeUnits.add(growthCell);
      return newSnakeUnits;
    });
  }

  return {
    snake,
    setSnake,
    snakeUnits,
    setSnakeUnits,
    moveSnake,
    growSnake,
  };
}
