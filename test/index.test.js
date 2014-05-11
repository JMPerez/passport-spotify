require('should');
var spotify = require('passport-spotify');

describe('passport-spotify', function() {
  describe('module', function() {
    it('should report a version', function() {
      spotify.version.should.have.type('string');
    });
  });
});
