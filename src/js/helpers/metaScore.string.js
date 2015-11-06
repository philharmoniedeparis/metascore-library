/**
* Description
* @class String
* @extends Class
*/

metaScore.String = (function () {

  /**
   * Description
   * @constructor
   */
  function String() {
  }

  metaScore.Class.extend(String);

  /**
   * Capitalize a string
   * @method capitalize
   * @param {} str
   * @return CallExpression
   */
  String.capitalize = function(str){
    return str.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
  };

  /**
   * Generate a random uuid (see http://www.broofa.com/2008/09/javascript-uuid-function/)
   * @method uuid
   * @param {} len
   * @param {} radix
   * @return CallExpression
   */
  String.uuid = function(len, radix) {
    var chars = ['0','1','2','3','4','5','6','7','8','9','A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z'],
      uuid = [], i;

    radix = radix || chars.length;

    if (len) {
      // Compact form
      for (i = 0; i < len; i++){
        uuid[i] = chars[0 | Math.random() * radix];
      }
    }
    else {
      // rfc4122, version 4 form
      var r;

      // rfc4122 requires these characters
      uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
      uuid[14] = '4';

      // Fill in random data.  At i==19 set the high bits of clock sequence as
      // per rfc4122, sec. 4.1.5
      for (i = 0; i < 36; i++) {
        if (!uuid[i]) {
          r = 0 | Math.random()*16;
          uuid[i] = chars[(i === 19) ? (r & 0x3) | 0x8 : r];
        }
      }
    }

    return uuid.join('');
  };

  /**
   * Description
   * @method pad
   * @param {} str
   * @param {} len
   * @param {} pad
   * @param {} dir
   * @return str
   */
  String.pad = function(str, len, pad, dir) {
    var right, left,
      padlen;

    if (typeof(len) === "undefined") { len = 0; }
    if (typeof(pad) === "undefined") { pad = ' '; }
    if (typeof(dir) === "undefined") { dir = 'right'; }

    str = str +'';

    if (len + 1 >= str.length) {
      switch (dir){
        case 'left':
          str = Array(len + 1 - str.length).join(pad) + str;
          break;

        case 'both':
          padlen = len - str.length;
          right = Math.ceil(padlen / 2);
          left = padlen - right;
          str = Array(left+1).join(pad) + str + Array(right+1).join(pad);
          break;

        default:
          str = str + Array(len + 1 - str.length).join(pad);
          break;
      }
    }
    return str;
  };

  return String;

})();