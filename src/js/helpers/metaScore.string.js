/**
 * String
 *
 * @requires ../metaScore.base.js
 */
metaScore.String = metaScore.Base.extend(function(){});

/**
* Capitalize a string
* @param {string} the original string
* @returns {string} the capitalized string
*/
metaScore.String.capitalize = function(str){
  return str.replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
};

/**
* Translate a string
* @param {string} the original string
* @param {object} string replacements
* @returns {string} the translated string
*/
metaScore.String.t = function(str, args){
  return metaScore.formatString(str, args);
};

/**
* Replace placeholders with sanitized values in a string.
* @param {string} the original string
* @param {object} string replacements
* @returns {string} the formatted string
*/
metaScore.formatString = function(str, args) {
  metaScore.Object.each(args, function(key, value){
    str = str.replace(key, args[key]);
  }, this);
  
  return str;
};

/**
* Generate a random uuid (see http://www.broofa.com/2008/09/javascript-uuid-function/)
* @param {number} the desired number of characters
* @param {number} the number of allowable values for each character
* @returns {string} a random uuid
*/
metaScore.String.uuid = function (len, radix) {
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