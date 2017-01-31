/**
 * @module Core
 */

metaScore.Number = (function () {

    /**
     * A class for number helper functions
     * 
     * @class Number
     * @constructor
     */
    function Number() {
    }

    /**
     * Get the number of decimal places
     * 
     * @method getDecimalPlaces
     * @param {Number} value The number to check against
     * @return {Number} The number of decimal places
     */
    Number.getDecimalPlaces = function(value){
        var match = (''+value).match(/(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/);
        
        if (!match) {
            return 0;
        }
        
        return Math.max(
            0,
           (match[1] ? match[1].length : 0) // Number of digits right of decimal point
           -(match[2] ? +match[2] : 0) // Adjust for scientific notation
       );
    };

    return Number;

})();