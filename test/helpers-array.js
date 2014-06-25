module("metaScore.Array");

test("copy", function() {

  var orig = [1, 2, 3],
    copy = metaScore.Array.copy(orig);
    
  equal(
    orig.length, copy.length,
    'copy should have same length as the original'
  );
  
  deepEqual(
    orig, copy,
    'copy should be equal to the original'
  );
  
  orig[0] = 5;
  
  notDeepEqual(
    orig, copy,
    'copy should not be equal to the original after the original has been changed'
  );

});