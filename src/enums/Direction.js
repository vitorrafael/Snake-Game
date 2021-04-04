const DIRECTION = {
    UP: undefined,
    RIGHT: undefined,
    DOWN: undefined,
    LEFT: undefined
}

for (let key in DIRECTION) {
    DIRECTION[key] = key;
}

Object.freeze(DIRECTION);

export { DIRECTION };