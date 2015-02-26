var should = require('should');
var sinon = require('sinon');
var SpotifyStrategy = require('passport-spotify/strategy');

describe('SpotifyStrategy', function() {
    var it_should_handle_errors = function() {
        it('should error', function(done) {
            strategy.userProfile('something', function(err, profile) {
                should.exist(err);
                done();
            });
        });

        it('should not load profile', function(done) {
            strategy.userProfile('something', function(err, profile) {
                should.not.exist(profile);
                done();
            });
        });
    };

    var strategy = new SpotifyStrategy(
      {
        clientID: 'ABC123',
        clientSecret: 'secret'
      },
      function() {}
    );

    it('should be named spotify', function() {
        strategy.name.should.equal('spotify');
    });

    it('should not request use of auth header for GET requests', function() {
        strategy._oauth2._useAuthorizationHeaderForGET.should.equal(false);
    });

    describe('scope', function() {
        it('should not specify scopes by default', function() {
            var scope = new SpotifyStrategy(
              {
                clientID: 'ABC123',
                clientSecret: 'secret'
              },
              function() {}
            )._scope;
            should.not.exist(scope);
        });

        describe('array option', function() {
            var strategy,
                options = {
                  clientID: 'ABC123',
                  clientSecret: 'secret',
                  scope: ['one', 'two', 'five'],
                  showDialog: true
                };

            before(function() {
                strategy = new SpotifyStrategy(options,
                  function() {}
                );
            });

            it('should enforce user-read-private scope presence', function() {
               strategy._scope.should.containEql('one');
               strategy._scope.should.containEql('two');
               strategy._scope.should.containEql('five');
            });

            it('should enforce whitespace separator', function() {
                strategy._scopeSeparator.should.equal(' ');
            });

            it('should add extra options if any', function() {
                strategy.authorizationParams(options).should.eql({show_dialog: true});
            });
        });
    });

    describe('token endpoint interaction', function() {
        describe('authorization', function() {
            before(function() {
                sinon.stub(strategy._oauth2, '_request');
            });

            after(function() {
                strategy._oauth2._request.restore();
            });

            it('should authenticate using client id and client secret pair', function() {
                strategy._oauth2.getOAuthAccessToken('code', {}, undefined);

                function parseQueryString(query) {
                    var returnObject = {};
                    var vars = query.split('&');
                    vars.forEach(function(variable) {
                        var parts = variable.split('=');
                        returnObject[parts[0]] = parts[1];
                    });
                    return returnObject;
                }

                var data = {
                    code: 'code',
                    client_id: 'ABC123',
                    client_secret: 'secret'
                };

                data.should.eql(parseQueryString(strategy._oauth2._request.firstCall.args[3]));
            });
        });

        describe('on success', function() {
            before(function() {
                sinon.stub(strategy._oauth2, '_request', function(method, url, headers, post_body, access_token, callback) {
                    headers.should.eql({
                        'Content-Type': 'application/x-www-form-urlencoded'
                    });
                    var data = JSON.stringify({
                        access_token: 'access_token',
                        refresh_token: 'refresh_token',
                        client_id: 'ABC123',
                        client_secret: 'secret',
                        something_random: 'randomness'
                    });

                    callback(null, data, null);
                });
            });

            after(function() {
                strategy._oauth2._request.restore();
            });

            it('should pass the data back', function(done) {
                strategy._oauth2.getOAuthAccessToken('code', {}, function(err, accessToken, refreshToken, params) {
                    should.not.exist(err);
                    accessToken.should.equal('access_token');
                    refreshToken.should.equal('refresh_token');
                    done();
                });
            });
        });

        describe('on error', function() {
            before(function() {
                sinon.stub(strategy._oauth2, '_request', function(method, url, headers, post_body, access_token, callback) {
                    headers.should.eql({
                        'Content-Type': 'application/x-www-form-urlencoded'
                    });
                    callback('something bad has happened');
                });
            });

            after(function() {
                strategy._oauth2._request.restore();
            });

            it('should pass callback an error', function(done) {
                strategy._oauth2.getOAuthAccessToken('code', {}, function(err) {
                    err.should.equal('something bad has happened');
                    done();
                });
            });
        });
    });

    describe('when told to load user profile', function() {
        describe('on success', function() {
            before(function() {
                sinon.stub(strategy._oauth2, '_request', function(method, url, headers, post_body, access_token, callback) {
                    headers.should.eql({'Authorization': 'Bearer something'});
                    var body = JSON.stringify({
                        'id': 'spotifier',
                        'username': 'spotifier',
                        'display_name': 'Spotifier Larsson',
                        'external_urls': {
                            'spotify': 'http://open.spotify.com/user/spotifier'
                        },
                        'email': 'example@mail.com',
                        'type': 'user',
                        'uri': 'spotify:user:spotifier',
                        'images': [
                            {
                              'url': 'http://profile-images.scdn.co/images/userprofile/default/d14sd',
                              'width': null,
                              'height': null
                            }
                        ]
                    });

                    callback(null, body, undefined);
                });
            });

            after(function() {
                strategy._oauth2._request.restore();
            });

            it('should not error', function(done) {
                strategy.userProfile('something', function(err, profile) {
                    should.not.exist(err);
                    done();
                });
            });

            it('should load profile', function(done) {
                strategy.userProfile('something', function(err, profile) {
                    profile.provider.should.equal('spotify');
                    profile.username.should.equal('spotifier');
                    profile.displayName.should.equal('Spotifier Larsson');
                    profile.profileUrl.should.equal('http://open.spotify.com/user/spotifier');
                    profile.id.should.equal('spotifier');
                    profile.emails.length.should.equal(1);
                    profile.emails[0].value.should.equal('example@mail.com');
                    profile.photos.length.should.equal(1);
                    profile.photos[0].should.equal('http://profile-images.scdn.co/images/userprofile/default/d14sd');
                    should.not.exist(err);
                    done();
                });
            });

            it('should set raw property', function(done) {
                strategy.userProfile('something', function(err, profile) {
                    profile._raw.should.have.type('string');
                    done();
                });
            });

            it('should set json property', function(done) {
                strategy.userProfile('something', function(err, profile) {
                    profile._json.should.have.type('object');
                    done();
                });
            });
        });

        describe('on incorrect JSON answer', function() {
            before(function() {
                sinon.stub(strategy._oauth2, '_request', function(method, url, headers, post_body, access_token, callback) {
                    headers.should.eql({'Authorization': 'Bearer something'});
                    var body = 'I\'m not a JSON, really!';

                    callback(null, body, undefined);
                });
            });

            after(function() {
                strategy._oauth2._request.restore();
            });

            it_should_handle_errors();
        });

        describe('on API GET error', function() {
            before(function() {
                sinon.stub(strategy._oauth2, '_request', function(method, url, headers, post_body, access_token, callback) {
                    headers.should.eql({'Authorization': 'Bearer something'});
                    callback(new Error('something-went-wrong'));
                });
            });

            after(function() {
                strategy._oauth2._request.restore();
            });

            it_should_handle_errors();

            it('should wrap error in InternalOAuthError', function(done) {
                strategy.userProfile('something', function(err, profile) {
                    err.constructor.name.should.equal('InternalOAuthError');
                    done();
                });
            });
        });
    });
});
