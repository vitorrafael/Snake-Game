const Direction = {
    UP: undefined,
    RIGHT: undefined,
    DOWN: undefined,
    LEFT: undefined
}

for (let key in Direction) {
    Direction[key] = key;
}

Object.freeze(Direction);

export { Direction };