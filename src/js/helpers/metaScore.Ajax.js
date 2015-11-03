/**
* Description
* @class Ajax
* @extends metaScore.Class
*/

metaScore.Ajax = (function () {

  /**
   * Description
   * @constructor
   */
  function Ajax() {
  }

  metaScore.Class.extend(Ajax);

  /**
   * Send an XMLHttp request
   * @method send
   * @param {} url
   * @param {object} options to set for the request; see the defaults variable
   * @return xhr
   */
  Ajax.send = function(url, options) {

    var key,
      xhr = new XMLHttpRequest(),
      defaults = {
        'method': 'GET',
        'headers': {},
        'async': true,
        'data': {},
        'dataType': 'json', // xml, json, script, text or html
        'complete': null,
        'success': null,
        'error': null,
        'scope': this
      };

    options = metaScore.Object.extend({}, defaults, options);

    xhr.open(options.method, url, options.async);

    metaScore.Object.each(options.headers, function(key, value){
      xhr.setRequestHeader(key, value);
    });

    /**
     * Description
     * @method onreadystatechange
     * @return 
     */
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if(metaScore.Var.is(options.complete, 'function')){
          options.complete.call(options.scope, xhr);
        }
        if((xhr.status >= 200 && xhr.status < 300) || xhr.status === 304){
          if(metaScore.Var.is(options.success, 'function')){
            options.success.call(options.scope, xhr);
          }
        }
        else if(metaScore.Var.is(options.error, 'function')){
          options.error.call(options.scope, xhr);
        }
      }
    };

    xhr.send(options.data);

    return xhr;

  };

  /**
   * Send an XMLHttp GET request
   * @method get
   * @param {} url
   * @param {object} options to set for the request; see the defaults variable
   * @return CallExpression
   */
  Ajax.get = function(url, options) {

    metaScore.Object.extend(options, {'method': 'GET'});

    return Ajax.send(url, options);

  };

  /**
   * Send an XMLHttp POST request
   * @method post
   * @param {} url
   * @param {object} options to set for the request; see the defaults variable
   * @return CallExpression
   */
  Ajax.post = function(url, options) {

    metaScore.Object.extend(options, {'method': 'POST'});

    return Ajax.send(url, options);

  };

  /**
   * Send an XMLHttp PUT request
   * @method put
   * @param {} url
   * @param {object} options to set for the request; see the defaults variable
   * @return CallExpression
   */
  Ajax.put = function(url, options) {

    metaScore.Object.extend(options, {'method': 'PUT'});

    return Ajax.send(url, options);

  };

  return Ajax;

})();