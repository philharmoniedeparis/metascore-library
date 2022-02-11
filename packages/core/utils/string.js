/**
 * Replace all occurences of a sub-string in a string
 *
 * @param {string} str The string being searched and replaced on
 * @param {string} search The value being searched for
 * @param {string} replacement The value that replaces found search values
 * @returns {string} The replaced string
 *
 * @example
 *    var str = "abc test test abc test test test abc test test abc";
 *    var replaced = String.replaceAll(str, "abc", "xyz");
 *    // "xyz test test xyz test test test xyz test test xyz"
 */
export function replaceAll(str, search, replacement) {
  const escaped_search = search.replace(/([.*+?^=!:${}()|[\]/\\])/g, "\\$1");
  const regex = new RegExp(escaped_search, "g");

  return str.replace(regex, replacement);
}

/**
 * A natural comparision function
 *
 * @author Jim Palmer (http://www.overset.com/2008/09/01/javascript-natural-sort-algorithm-with-unicode-support/) - version 0.7
 * @param {string} a The original string
 * @param {string} b The string to compare with
 * @param {boolean} [insensitive=false] Whether the sort should not be case-sensitive
 * @returns {number} 0 if a and b are considered equal, 1 if b should go before a, -1 if a should go before b
 */
export function naturalCompare(a, b, insensitive) {
  // eslint-disable-line complexity
  const re = /(^-?[0-9]+(\.?[0-9]*)[df]?e?[0-9]?$|^0x[0-9a-f]+$|[0-9]+)/gi;
  const sre = /(^[ ]*|[ ]*$)/g;
  const dre =
    /(^([\w ]+,?[\w ]+)?[\w ]+,?[\w ]+\d+:\d+(:\d+)?[\w ]?|^\d{1,4}[/-]\d{1,4}[/-]\d{1,4}|^\w+, \w+ \d+, \d{4})/;
  const hre = /^0x[0-9a-f]+$/i;
  const ore = /^0/;
  const i = (s) => {
    return (insensitive && `${s}`.toLowerCase()) || `${s}`;
  };

  // convert all to strings strip whitespace
  const x = i(a).replace(sre, "") || "";
  const y = i(b).replace(sre, "") || "";

  // chunk/tokenize
  const xN = x
    .replace(re, "\0$1\0")
    .replace(/\0$/, "")
    .replace(/^\0/, "")
    .split("\0");
  const yN = y
    .replace(re, "\0$1\0")
    .replace(/\0$/, "")
    .replace(/^\0/, "")
    .split("\0");

  // numeric, hex or date detection
  const xD =
    parseInt(x.match(hre), 10) ||
    (xN.length !== 1 && x.match(dre) && Date.parse(x));
  const yD =
    parseInt(y.match(hre), 10) || (xD && y.match(dre) && Date.parse(y)) || null;

  // first try and sort Hex codes or Dates
  if (yD) {
    if (xD < yD) {
      return -1;
    } else if (xD > yD) {
      return 1;
    }
  }

  // natural sorting through split numeric strings and default strings
  for (
    let cLoc = 0, numS = Math.max(xN.length, yN.length);
    cLoc < numS;
    cLoc++
  ) {
    // find floats not starting with '0', string or 0 if not defined (Clint Priest)
    let oFxNcL =
      (!(xN[cLoc] || "").match(ore) && parseFloat(xN[cLoc])) || xN[cLoc] || 0;
    let oFyNcL =
      (!(yN[cLoc] || "").match(ore) && parseFloat(yN[cLoc])) || yN[cLoc] || 0;

    // handle numeric vs string comparison - number < string - (Kyle Adams)
    if (isNaN(oFxNcL) !== isNaN(oFyNcL)) {
      return isNaN(oFxNcL) ? 1 : -1;
    }
    // rely on string comparison if different types - i.e. '02' < 2 != '02' < '2'
    else if (typeof oFxNcL !== typeof oFyNcL) {
      oFxNcL += "";
      oFyNcL += "";
    }

    if (oFxNcL < oFyNcL) {
      return -1;
    }

    if (oFxNcL > oFyNcL) {
      return 1;
    }
  }

  return 0;
}
