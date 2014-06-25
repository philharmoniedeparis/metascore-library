module("metaScore.Var");

test("type", function() {

  var types = {
    "boolean": [true, false],
    "number": [10, 1.5, 0],
    "string": ['string', "string 2", ""],
    "function": [function(){}],
    "array": [[1, 2, 3], []],
    "date": [new Date()],
    "regexp": [/is/g],
    "object": [{'test': false}]
  };
  
  $.each(types, function(type, variables){
    $.each(variables, function(index, variable){
      equal(
        metaScore.Var.type(variable), type,
        variable +' should be of type '+ type
      );
    });
  });

});

test("is", function() {

  var types = {
    "boolean": [true, false],
    "number": [10, 1.5, 0],
    "string": ['string', "string 2", ""],
    "function": [function(){}],
    "array": [[1, 2, 3], []],
    "date": [new Date()],
    "regexp": [/is/g],
    "object": [{'test': false}]
  };
  
  $.each(types, function(type, variables){
    $.each(variables, function(index, variable){
      ok(
        metaScore.Var.is(variable, type),
        variable +' should be of type '+ type
      );
    });
  });

});