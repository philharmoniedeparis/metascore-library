/**
 * @module Core
 */

metaScore.Color = (function () {

    /**
     * A class for color helper functions
     * 
     * @class Color
     * @constructor
     */
    function Color() {
    }

    /**
     * Convert an RGB value to HSV
     * 
     * @method rgb2hsv
     * @static
     * @param {Object} rgb The rgb value as an object with 'r', 'g', and 'b' keys
     * @return {Object} The hsv value as an object with 'h', 's', and 'v' keys
     */
    Color.rgb2hsv = function (rgb){
        var r = rgb.r, g = rgb.g, b = rgb.b,
            max = Math.max(r, g, b),
            min = Math.min(r, g, b),
            d = max - min,
            h, s, v;

        s = max === 0 ? 0 : d / max;
        v = max;

        if(max === min) {
            h = 0; // achromatic
        }
        else {
            switch(max) {
                case r:
                    h = (g - b) / d + (g < b ? 6 : 0);
                    break;

                case g:
                    h = (b - r) / d + 2;
                    break;

                case b:
                    h = (r - g) / d + 4;
                    break;
            }

            h /= 6;
        }

        return {
            'h': h,
            's': s,
            'v': v
        };
    };

    /**
     * Parse a CSS color value into an object with 'r', 'g', 'b', and 'a' keys
     * 
     * @method parse
     * @static
     * @param {Mixed} color The CSS value to parse
     * @return {Object} The color object with 'r', 'g', 'b', and 'a' keys
     */
    Color.parse = function(color){
        var rgba, matches;

        rgba = {
            r: 0,
            g: 0,
            b: 0,
            a: 0,
        };

        if(metaScore.Var.is(color, 'object')){
            rgba.r = 'r' in color ? color.r : 0;
            rgba.g = 'g' in color ? color.g : 0;
            rgba.b = 'b' in color ? color.b : 0;
            rgba.a = 'a' in color ? color.a : 1;
        }
        else if(metaScore.Var.is(color, 'string')){
            color = color.replace(/\s\s*/g,''); // Remove all spaces

            // Checks for 6 digit hex and converts string to integer
            if (matches = /^#([\da-fA-F]{2})([\da-fA-F]{2})([\da-fA-F]{2})/.exec(color)){
                rgba.r = parseInt(matches[1], 16);
                rgba.g = parseInt(matches[2], 16);
                rgba.b = parseInt(matches[3], 16);
                rgba.a = 1;
            }

            // Checks for 3 digit hex and converts string to integer
            else if (matches = /^#([\da-fA-F])([\da-fA-F])([\da-fA-F])/.exec(color)){
                rgba.r = parseInt(matches[1], 16) * 17;
                rgba.g = parseInt(matches[2], 16) * 17;
                rgba.b = parseInt(matches[3], 16) * 17;
                rgba.a = 1;
            }

            // Checks for rgba and converts string to
            // integer/float using unary + operator to save bytes
            else if (matches = /^rgba\(([\d]+),([\d]+),([\d]+),([\d]+|[\d]*.[\d]+)\)/.exec(color)){
                rgba.r = +matches[1];
                rgba.g = +matches[2];
                rgba.b = +matches[3];
                rgba.a = +matches[4];
            }

            // Checks for rgb and converts string to
            // integer/float using unary + operator to save bytes
            else if (matches = /^rgb\(([\d]+),([\d]+),([\d]+)\)/.exec(color)){
                rgba.r = +matches[1];
                rgba.g = +matches[2];
                rgba.b = +matches[3];
                rgba.a = 1;
            }
        }

        return rgba;
    };

    return Color;

})();