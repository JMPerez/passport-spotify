# Passport-Spotify

[Passport](http://passportjs.org/) strategy for authenticating with [Spotify](http://www.spotify.com/)
using the OAuth 2.0 API.

This module lets you authenticate using Spotify in your Node.js applications.
By plugging into Passport, Spotify authentication can be easily and
unobtrusively integrated into any application or framework that supports
[Connect](http://www.senchalabs.org/connect/)-style middleware, including
[Express](http://expressjs.com/).

For more information about Spotify's OAuth 2.0 implementation, check their 
[Web API Authorization Guide](https://developer.spotify.com/web-api/authorization-guide/).

## Installation

    $ npm install passport-spotify

## Usage

### Configure Strategy

The Spotify authentication strategy authenticates users using a Spotify account
and OAuth 2.0 tokens.  The strategy requires a `verify` callback, which accepts
these credentials and calls `done` providing a user, as well as `options`
specifying a client ID, client secret, and callback URL.

```javascript
passport.use(new SpotifyStrategy({
    clientID: client_id,
    clientSecret: client_secret,
    callbackURL: "http://localhost:8888/auth/spotify/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    User.findOrCreate({ spotifyId: profile.id }, function (err, user) {
      return done(err, user);
    });
  }
));
```

### Authenticate Requests

Use `passport.authenticate()`, specifying the `'spotify'` strategy, to
authenticate requests.

For example, as route middleware in an [Express](http://expressjs.com/)
application:

```javascript
app.get('/auth/spotify',
  passport.authenticate('spotify'),
  function(req, res){
    // The request will be redirected to spotify for authentication, so this
    // function will not be called.
  });

app.get('/auth/spotify/callback',
  passport.authenticate('spotify', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });
```

### Using scopes

Depending on the data you want to fetch, you may want to specify custom scopes. For more information about scopes in the Spotify Web API check [their developer site](https://developer.spotify.com/web-api/using-scopes/).

By default, no scope is passed. That means that you won't fetch information such as display name, picture or email. You can get those by using these scopes:

 - `user-read-email`: Returns the email address of the user on Spotify, if it exists.
 - `user-read-private`: Returns private information about the user such as display name and picture, if they are set.

You can specify the parameters in the `authenticate` call:

```javascript
app.get('/auth/spotify',
  passport.authenticate('spotify', {scope: ['user-read-email', 'user-read-private'] }),
  function(req, res){
   // The request will be redirected to spotify for authentication, so this
   // function will not be called.
});
```

### Forcing login dialog

You can force the login dialog using the `showDialog` parameter when authenticating:

```javascript
app.get('/auth/spotify',
  passport.authenticate(
    'spotify',
    {scope: ['user-read-email', 'user-read-private'], showDialog: true}
  ),
  function(req, res){
   // The request will be redirected to spotify for authentication, so this
   // function will not be called.
});
```

## Examples

For a complete, working example, refer to the [login example](https://github.com/jmperez/passport-spotify/tree/master/examples/login).

You can get your keys on [Spotify -  My Applications](https://developer.spotify.com/my-applications).

## Tests

    $ npm install --dev
    $ make test
    
## Build and Coverage Status

[![Build Status](https://travis-ci.org/JMPerez/passport-spotify.svg?branch=master)](https://travis-ci.org/JMPerez/passport-spotify) [![Coverage Status](https://coveralls.io/repos/JMPerez/passport-spotify/badge.png?branch=master)](https://coveralls.io/r/JMPerez/passport-spotify?branch=master)

## License

[The MIT License](http://opensource.org/licenses/MIT)
