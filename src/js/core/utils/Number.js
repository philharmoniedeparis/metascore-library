/**
 * Get the number of decimal places
 *
 * @method getDecimalPlaces
 * @param {Number} value The number to check against
 * @return {Number} The number of decimal places
 */
export function getDecimalPlaces(value){
    const match = (`${value}`).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);

    if (!match) {
        return 0;
    }

    return Math.max(
        0,
        (match[1] ? match[1].length : 0) // Number of digits right of decimal point
        -(match[2] ? +match[2] : 0) // Adjust for scientific notation
    );
}
