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

/**
 * Format a file size in bytes to a human-readable format
 *
 * @method formatFileSize
 * @param {Number} bytes The file size in bytes
 * @return {String} The file size in a human-readable format
 */
export function formatFileSize(bytes){
    const mega = 1024;
    const decimals = 2;
    const e = (Math.log(bytes) / Math.log(mega)) | 0;

    return `${+(bytes / Math.pow(mega, e)).toFixed(decimals)} ${('kMGTPEZY'[e - 1] || '')}B`;
}
