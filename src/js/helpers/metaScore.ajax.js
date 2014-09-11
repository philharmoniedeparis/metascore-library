/**
 * Ajax
 *
 * @requires ../metaScore.class.js
 * @requires metaScore.object.js
 * @requires metaScore.var.js
 */
 
metaScore.Ajax = (function () {
  
  function Ajax() {
  }
  
  metaScore.Class.extend(Ajax);

  /**
  * Create an XMLHttp object
  * @returns {object} the XMLHttp object
  */
  Ajax.createXHR = function() {

    var xhr, i, l,
      activeX = [
        "MSXML2.XMLHttp.5.0",
        "MSXML2.XMLHttp.4.0",
        "MSXML2.XMLHttp.3.0",
        "MSXML2.XMLHttp",
        "Microsoft.XMLHttp"
      ];

    if (typeof XMLHttpRequest !== "undefined") {
      xhr = new XMLHttpRequest();
      return xhr;
    }
    else if (window.ActiveXObject) {
      for (i = 0, l = activeX.length; i < l; i++) {
        try {
          xhr = new ActiveXObject(activeX[i]);
          return xhr;
        }
        catch (e) {}
      }
    }
    
    throw new Error("XMLHttp object could be created.");
    
  };

  /**
  * Send an XMLHttp request
  * @param {string} the url of the request
  * @param {object} options to set for the request; see the defaults variable
  * @returns {object} the XMLHttp object
  */
  Ajax.send = function(url, options) {

    var key,
      xhr = Ajax.createXHR(),
      data, query = [],
      defaults = {
        'method': 'GET',
        'headers': [],
        'async': true,
        'data': {},
        'complete': null,
        'success': null,
        'error': null,
        'scope': this
      };
    
    options = metaScore.Object.extend(function(){}, defaults, options);
    
    metaScore.Object.each(options.data, function(key, value){
      query.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
    });
    
    if(query.length > 0){
      if(options.method === 'POST'){
        data = query.join('&');
        options.headers['Content-type'] = 'application/x-www-form-urlencoded';
      }
      else{
        url += '?'+ query.join('&');
      }
    }
    
    xhr.open(options.method, url, options.async);
    
    metaScore.Object.each(options.headers, function(key, value){
      xhr.setRequestHeader(key, value);
    });
    
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
    
    xhr.send(data);
    
    return xhr;
    
  };

  /**
  * Send an XMLHttp GET request
  * @param {string} the url of the request
  * @param {object} options to set for the request; see the defaults variable
  * @returns {object} the XMLHttp object
  */
  Ajax.get = function(url, options) {
    
    metaScore.Object.extend(options, {'method': 'GET'});
    
    return Ajax.send(url, options);
    
  };

  /**
  * Send an XMLHttp POST request
  * @param {string} the url of the request
  * @param {object} options to set for the request; see the defaults variable
  * @returns {object} the XMLHttp object
  */
  Ajax.post = function(url, options) {
    
    metaScore.Object.extend(options, {'method': 'POST'});
    
    return Ajax.send(url, options);
    
  };
    
  return Ajax;
  
})();