export const changeBase = (number, currentBase, targetBase) => {
    const map = {
        'binary': 2,
        'octal': 8,
        'hexadecimal': 16
    }
    return parseInt(number, map[currentBase]).toString(map[targetBase])
}