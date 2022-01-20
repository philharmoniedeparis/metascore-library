import { isString, isPlainObject, padStart } from "lodash";

/**
 * @type {object}
 * A list of CSS color names and their corresponding rgba values
 * See http://www.w3.org/TR/css3-color/
 */
const COLOR_NAMES = {
  transparent: [0, 0, 0, 0],
  aliceblue: [240, 248, 255, 1],
  antiquewhite: [250, 235, 215, 1],
  aqua: [0, 255, 255, 1],
  aquamarine: [127, 255, 212, 1],
  azure: [240, 255, 255, 1],
  beige: [245, 245, 220, 1],
  bisque: [255, 228, 196, 1],
  black: [0, 0, 0, 1],
  blanchedalmond: [255, 235, 205, 1],
  blue: [0, 0, 255, 1],
  blueviolet: [138, 43, 226, 1],
  brown: [165, 42, 42, 1],
  burlywood: [222, 184, 135, 1],
  cadetblue: [95, 158, 160, 1],
  chartreuse: [127, 255, 0, 1],
  chocolate: [210, 105, 30, 1],
  coral: [255, 127, 80, 1],
  cornflowerblue: [100, 149, 237, 1],
  cornsilk: [255, 248, 220, 1],
  crimson: [220, 20, 60, 1],
  cyan: [0, 255, 255, 1],
  darkblue: [0, 0, 139, 1],
  darkcyan: [0, 139, 139, 1],
  darkgoldenrod: [184, 134, 11, 1],
  darkgray: [169, 169, 169, 1],
  darkgreen: [0, 100, 0, 1],
  darkgrey: [169, 169, 169, 1],
  darkkhaki: [189, 183, 107, 1],
  darkmagenta: [139, 0, 139, 1],
  darkolivegreen: [85, 107, 47, 1],
  darkorange: [255, 140, 0, 1],
  darkorchid: [153, 50, 204, 1],
  darkred: [139, 0, 0, 1],
  darksalmon: [233, 150, 122, 1],
  darkseagreen: [143, 188, 143, 1],
  darkslateblue: [72, 61, 139, 1],
  darkslategray: [47, 79, 79, 1],
  darkslategrey: [47, 79, 79, 1],
  darkturquoise: [0, 206, 209, 1],
  darkviolet: [148, 0, 211, 1],
  deeppink: [255, 20, 147, 1],
  deepskyblue: [0, 191, 255, 1],
  dimgray: [105, 105, 105, 1],
  dimgrey: [105, 105, 105, 1],
  dodgerblue: [30, 144, 255, 1],
  firebrick: [178, 34, 34, 1],
  floralwhite: [255, 250, 240, 1],
  forestgreen: [34, 139, 34, 1],
  fuchsia: [255, 0, 255, 1],
  gainsboro: [220, 220, 220, 1],
  ghostwhite: [248, 248, 255, 1],
  gold: [255, 215, 0, 1],
  goldenrod: [218, 165, 32, 1],
  gray: [128, 128, 128, 1],
  green: [0, 128, 0, 1],
  greenyellow: [173, 255, 47, 1],
  grey: [128, 128, 128, 1],
  honeydew: [240, 255, 240, 1],
  hotpink: [255, 105, 180, 1],
  indianred: [205, 92, 92, 1],
  indigo: [75, 0, 130, 1],
  ivory: [255, 255, 240, 1],
  khaki: [240, 230, 140, 1],
  lavender: [230, 230, 250, 1],
  lavenderblush: [255, 240, 245, 1],
  lawngreen: [124, 252, 0, 1],
  lemonchiffon: [255, 250, 205, 1],
  lightblue: [173, 216, 230, 1],
  lightcoral: [240, 128, 128, 1],
  lightcyan: [224, 255, 255, 1],
  lightgoldenrodyellow: [250, 250, 210, 1],
  lightgray: [211, 211, 211, 1],
  lightgreen: [144, 238, 144, 1],
  lightgrey: [211, 211, 211, 1],
  lightpink: [255, 182, 193, 1],
  lightsalmon: [255, 160, 122, 1],
  lightseagreen: [32, 178, 170, 1],
  lightskyblue: [135, 206, 250, 1],
  lightslategray: [119, 136, 153, 1],
  lightslategrey: [119, 136, 153, 1],
  lightsteelblue: [176, 196, 222, 1],
  lightyellow: [255, 255, 224, 1],
  lime: [0, 255, 0, 1],
  limegreen: [50, 205, 50, 1],
  linen: [250, 240, 230, 1],
  magenta: [255, 0, 255, 1],
  maroon: [128, 0, 0, 1],
  mediumaquamarine: [102, 205, 170, 1],
  mediumblue: [0, 0, 205, 1],
  mediumorchid: [186, 85, 211, 1],
  mediumpurple: [147, 112, 219, 1],
  mediumseagreen: [60, 179, 113, 1],
  mediumslateblue: [123, 104, 238, 1],
  mediumspringgreen: [0, 250, 154, 1],
  mediumturquoise: [72, 209, 204, 1],
  mediumvioletred: [199, 21, 133, 1],
  midnightblue: [25, 25, 112, 1],
  mintcream: [245, 255, 250, 1],
  mistyrose: [255, 228, 225, 1],
  moccasin: [255, 228, 181, 1],
  navajowhite: [255, 222, 173, 1],
  navy: [0, 0, 128, 1],
  oldlace: [253, 245, 230, 1],
  olive: [128, 128, 0, 1],
  olivedrab: [107, 142, 35, 1],
  orange: [255, 165, 0, 1],
  orangered: [255, 69, 0, 1],
  orchid: [218, 112, 214, 1],
  palegoldenrod: [238, 232, 170, 1],
  palegreen: [152, 251, 152, 1],
  paleturquoise: [175, 238, 238, 1],
  palevioletred: [219, 112, 147, 1],
  papayawhip: [255, 239, 213, 1],
  peachpuff: [255, 218, 185, 1],
  peru: [205, 133, 63, 1],
  pink: [255, 192, 203, 1],
  plum: [221, 160, 221, 1],
  powderblue: [176, 224, 230, 1],
  purple: [128, 0, 128, 1],
  rebeccapurple: [102, 51, 153, 1],
  red: [255, 0, 0, 1],
  rosybrown: [188, 143, 143, 1],
  royalblue: [65, 105, 225, 1],
  saddlebrown: [139, 69, 19, 1],
  salmon: [250, 128, 114, 1],
  sandybrown: [244, 164, 96, 1],
  seagreen: [46, 139, 87, 1],
  seashell: [255, 245, 238, 1],
  sienna: [160, 82, 45, 1],
  silver: [192, 192, 192, 1],
  skyblue: [135, 206, 235, 1],
  slateblue: [106, 90, 205, 1],
  slategray: [112, 128, 144, 1],
  slategrey: [112, 128, 144, 1],
  snow: [255, 250, 250, 1],
  springgreen: [0, 255, 127, 1],
  steelblue: [70, 130, 180, 1],
  tan: [210, 180, 140, 1],
  teal: [0, 128, 128, 1],
  thistle: [216, 191, 216, 1],
  tomato: [255, 99, 71, 1],
  turquoise: [64, 224, 208, 1],
  violet: [238, 130, 238, 1],
  wheat: [245, 222, 179, 1],
  white: [255, 255, 255, 1],
  whitesmoke: [245, 245, 245, 1],
  yellow: [255, 255, 0, 1],
  yellowgreen: [154, 205, 50, 1],
};

/**
 * Convert an RGB value to HSV
 *
 * @param {number} r The red contained in the set [0, 255]
 * @param {number} g The green contained in the set [0, 255]
 * @param {number} b The blue contained in the set [0, 255]
 * @returns {object} The hsv value as an object with 'h', 's', and 'v' keys with values contained in the set [0, 1]
 */
export function rgb2hsv(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const d = max - min;

  let h = 0;
  const s = max === 0 ? 0 : d / max;
  const v = max / 255;

  if (max !== min) {
    // chromatic
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0); // eslint-disable-line no-magic-numbers
        break;

      case g:
        h = (b - r) / d + 2; // eslint-disable-line no-magic-numbers
        break;

      case b:
        h = (r - g) / d + 4; // eslint-disable-line no-magic-numbers
        break;
    }

    h /= 6; // eslint-disable-line no-magic-numbers
  }

  return { h, s, v };
}

/**
 * Convert an HSV value to RGB
 *
 * @param {number} h The hue contained in the set [0, 1]
 * @param {number} s The saturation contained in the set [0, 1]
 * @param {number} v The value contained in the set [0, 1]
 * @returns {object} The rgb value as an object with 'r', 'g', and 'b' keys with values contained in the set [0, 255]
 */
export function hsv2rgb(h, s, v) {
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  let r = 0;
  let g = 0;
  let b = 0;

  switch (i % 6) {
    case 0:
      r = v;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = v;
      b = p;
      break;
    case 2:
      r = p;
      g = v;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = v;
      break;
    case 4:
      r = t;
      g = p;
      b = v;
      break;
    case 5:
      r = v;
      g = p;
      b = q;
      break;
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

/**
 * Convert an RGB value to HEX
 *
 * @param {number} r The red contained in the set [0, 255]
 * @param {number} g The green contained in the set [0, 255]
 * @param {number} b The blue contained in the set [0, 255]
 * @returns {string} The hex value
 */
export function rgb2hex(r, g, b) {
  const _r = padStart(r.toString(16), 2, "0");
  const _g = padStart(g.toString(16), 2, "0");
  const _b = padStart(b.toString(16), 2, "0");

  return `#${_r}${_g}${_b}`;
}

/**
 * Convert an RGB value to HEX
 *
 * @param {number} r The red contained in the set [0, 255]
 * @param {number} g The green contained in the set [0, 255]
 * @param {number} b The blue contained in the set [0, 255]
 * @param {number} a The alpha contained in the set [0, 1]
 * @returns {string} The hex value
 */
export function rgba2hex(r, g, b, a) {
  const hex = rgb2hex(r, g, b);
  const _a = padStart(Math.round(a * 255).toString(16), 2, "0");

  return hex + _a;
}

/**
 * Parse a CSS color value into an object with 'r', 'g', 'b', and 'a' keys
 *
 * @param {*} color The CSS value to parse
 * @returns {object} The color object with 'r', 'g', 'b', and 'a' keys
 */
export function toRGBA(color) {
  if (isPlainObject(color)) {
    return {
      r: "r" in color ? color.r : 0,
      g: "g" in color ? color.g : 0,
      b: "b" in color ? color.b : 0,
      a: "a" in color ? color.a : 1,
    };
  }

  if (isString(color)) {
    if (color in COLOR_NAMES) {
      return {
        r: COLOR_NAMES[color][0],
        g: COLOR_NAMES[color][1],
        b: COLOR_NAMES[color][2],
        a: COLOR_NAMES[color][3],
      };
    }

    const _color = color.replace(/\s\s*/g, ""); // Remove all spaces

    // Checks for 8 digit hex and converts string to integer
    let matches =
      /^#([\da-fA-F]{2})([\da-fA-F]{2})([\da-fA-F]{2})([\da-fA-F]{2})/.exec(
        _color
      );
    if (matches) {
      return {
        r: parseInt(matches[1], 16),
        g: parseInt(matches[2], 16),
        b: parseInt(matches[3], 16),
        a: parseInt(matches[4], 16) / 255,
      };
    }

    // Checks for 6 digit hex and converts string to integer
    matches = /^#([\da-fA-F]{2})([\da-fA-F]{2})([\da-fA-F]{2})/.exec(_color);
    if (matches) {
      return {
        r: parseInt(matches[1], 16),
        g: parseInt(matches[2], 16),
        b: parseInt(matches[3], 16),
        a: 1,
      };
    }

    // Checks for 3 digit hex and converts string to integer
    matches = /^#([\da-fA-F])([\da-fA-F])([\da-fA-F])/.exec(_color);
    if (matches) {
      const multiplier = 17;

      return {
        r: parseInt(matches[1], 16) * multiplier,
        g: parseInt(matches[2], 16) * multiplier,
        b: parseInt(matches[3], 16) * multiplier,
        a: 1,
      };
    }

    // Checks for rgba and converts string to
    // integer/float using unary + operator to save bytes
    matches = /^rgba\(([\d]+),([\d]+),([\d]+),([\d]+|[\d]*.[\d]+)\)/.exec(
      _color
    );
    if (matches) {
      return {
        r: +matches[1],
        g: +matches[2],
        b: +matches[3],
        a: +matches[4],
      };
    }

    // Checks for rgb and converts string to
    // integer/float using unary + operator to save bytes
    matches = /^rgb\(([\d]+),([\d]+),([\d]+)\)/.exec(_color);
    if (matches) {
      return {
        r: +matches[1],
        g: +matches[2],
        b: +matches[3],
        a: 1,
      };
    }
  }

  return null;
}

/**
 * Parse a color value into a CSS string.
 *
 * @param {*} color The CSS value to parse
 * @returns {string} The CSS value in HEX if no alpha, in rgba otherwise.
 */
export function toCSS(color) {
  const rgba = toRGBA(color);

  if (rgba) {
    if (rgba.a === 1) {
      return rgb2hex(rgba.r, rgba.g, rgba.b);
    }

    return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`;
  }

  return null;
}
