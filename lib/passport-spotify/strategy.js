/**
 * Module dependencies.
 */
var util = require('util'),
    querystring = require('querystring'),
    OAuth2Strategy = require('passport-oauth').OAuth2Strategy,
    InternalOAuthError = require('passport-oauth').InternalOAuthError;

/**
 * `Strategy` constructor.
 *
 * The Spotify authentication strategy authenticates requests by delegating to
 * Spotify using the OAuth 2.0 protocol.
 *
 * Applications must supply a `verify` callback which accepts an `accessToken`,
 * `refreshToken` and service-specific `profile`, and then calls the `done`
 * callback supplying a `user`, which should be set to `false` if the
 * credentials are not valid.  If an exception occured, `err` should be set.
 *
 * Options:
 *   - `clientID`      your Spotify application's app key
 *   - `clientSecret`  your Spotify application's app secret
 *   - `callbackURL`   URL to which Spotify will redirect the user
 *                     after granting authorization
 *   - `scope`         [Optional] An array of named scopes containing:
 *                     "user-read-private" if you want to request user's private
 *                     information such as display name and display picture url
 *                     "user-read-email" if you want to request user's email
 *
 * Examples:
 *
 *     passport.use(new SpotifyStrategy({
 *         clientID: 'app key',
 *         clientSecret: 'app secret'
 *         callbackURL: 'https://www.example.net/auth/spotify/callback'
 *       },
 *       function(accessToken, refreshToken, profile, done) {
 *         User.findOrCreate(..., function (err, user) {
 *           done(err, user);
 *         });
 *       }
 *     ));
 *
 * @param {Object} options
 * @param {Function} verify
 * @api public
 */
 function Strategy(options, verify) {
  options = options || {};
  options.authorizationURL = options.authorizationURL || 'https://accounts.spotify.com/authorize';
  options.tokenURL = options.tokenURL || 'https://accounts.spotify.com/api/token';
  options.scopeSeparator = options.scopeSeparator || ' ';

  OAuth2Strategy.call(this, options, verify);
  this.name = 'spotify';
  this._userProfileURL = options.userProfileURL || 'https://api.spotify.com/v1/me';

  this._oauth2.getOAuthAccessToken = function(code, params, callback) {
    params = params || {};
    var codeParam = (params.grant_type === 'refresh_token') ? 'refresh_token' : 'code';
    params[codeParam] = code;
    params['client_id'] = this._clientId;
    params['client_secret'] = this._clientSecret;

    var post_data = querystring.stringify(params);
    var post_headers = {
        'Content-Type': 'application/x-www-form-urlencoded'
    };

    this._request('POST', this._getAccessTokenUrl(), post_headers, post_data, null, function(error, data, response) {
        if (error) callback(error);
        else {
            var results = JSON.parse(data);
            var access_token = results.access_token;
            var refresh_token = results.refresh_token;
            delete results.refresh_token;
            callback(null, access_token, refresh_token, results); // callback results =-=
        }
    });
  };
}

/**
 * Inherit from `OAuth2Strategy`.
 */
 util.inherits(Strategy, OAuth2Strategy);

/**
 * Return extra Spotify-specific parameters to be included in the authorization
 * request.
 *
 * Options:
 *  - `showDialog` Whether or not to force the user to approve the app again if
 *     they’ve already done so. If false (default), a user who has already
 *     approved the application may be automatically redirected to the URI
 *     specified by redirect_uri. If true, the user will not be automatically
 *     redirected and will have to approve the app again..
 *
 * @param {Object} options
 * @return {Object}
 * @api protected
 */
Strategy.prototype.authorizationParams = function (options) {
  var params = {};

  if (options.showDialog) {
    params.show_dialog = options.showDialog;
  }

  return params;
};

/**
 * Retrieve user profile from Spotify.
 *
 * This function constructs a normalized profile, with the following properties:
 *
 *   - `provider`         always set to `spotify`
 *   - `id`               the user's Spotify ID
 *   - `username`         the user's Spotify username
 *   - `displayName`      the user's full name
 *   - `profileUrl`       the URL of the profile for the user on Spotify
 *
 * @param {String} accessToken
 * @param {Function} done
 * @api protected
 */
Strategy.prototype.userProfile = function(accessToken, done) {

  var authorization = 'Bearer ' + accessToken;
  var headers = {
      'Authorization' : authorization
  };
  this._oauth2._request('GET', this._userProfileURL, headers, '', '', function(err, body, res) {
    if (err) { return done(new InternalOAuthError('failed to fetch user profile', err)); }

    try {

      var json = JSON.parse(body);

      var profile = {
        provider: 'spotify',
        id: json.id,
        username: json.id,
        displayName: json.display_name,
        profileUrl: json.external_urls ? json.external_urls.spotify : null,
        photos: json.images ? json.images.map(function(image) { return image.url; }) : null,
        country: json.country || null,
        followers: json.followers ? json.followers.total : null,
        product: json.product || null,
        _raw: body,
        _json: json
      };

      if (json.email) {
        profile.emails = [{
          value: json.email,
          type: null
        }];
      }

      done(null, profile);
    } catch (e) {
      done(e);
    }
  });
};

/**
 * Expose `Strategy`.
 */
 module.exports = Strategy;
