/**
* Core
*/
var metaScore = {

  version: "[[VERSION]]",
  
  locale: {},
  
  loadLocale: function(url, callback, scope){
    
    metaScore.Ajax.get(url, {
      'success': function(xhr){
        //metaScore.locale = xhr.data;
        console.log(xhr);
        callback.call(scope);
      },
      'error': function(){
        callback.call(scope);
      }
    });
  
  }
  
};