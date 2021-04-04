export function generateRandomNumberInRange(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}