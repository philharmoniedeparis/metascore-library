module("metaScore.String");

test("capitalize", function() {
  
  equal(
    metaScore.String.capitalize('test'), 'Test',
    'Capitalized "test" should be equal to "Test"'
  );
  
  equal(
    metaScore.String.capitalize('test test2'), 'Test Test2',
    'Capitalized "test test2" should be equal to "Test Test2"'
  );
  
  equal(
    metaScore.String.capitalize('test-test2'), 'Test-test2',
    'Capitalized "test-test2" should be equal to "Test-test2"'
  );

});