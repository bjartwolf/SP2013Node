/**
 * Module dependencies.
 */
var passport = require('passport')
  , url = require('url')
  , https = require('https')
  , util = require('util')
  , utils = require('./utils')
  , jwt = require('jwt-simple')
  , OAuth2 = require('oauth').OAuth2
  , InternalOAuthError = require('./internaloautherror');

var SP_AUTH_PREFIX = '/_layouts/15/OAuthAuthorize.aspx';

/**
 * `Strategy` constructor.
 *
 * @param {Object} options
 * @param {Function} verify
 * @api public
 */
function Strategy(options, verify) {
  options = options || {}
  passport.Strategy.call(this);
  this.name = 'sharepoint';
  this._verify = verify;
  
  if (!options.clientID) throw new Error('SharePointStrategy requires a clientID option');
  if (!options.clientSecret) throw new Error('SharePointStrategy requires a clientSecret option');
  
  this._clientID = options.clientID;
  this._clientSecret = options.clientSecret;
  this._scope = options.scope;
  this._scopeSeparator = options.scopeSeparator || ' ';
  this._skipUserProfile = (options.skipUserProfile === undefined) ? false : options.skipUserProfile;
}

/**
 * Inherit from `passport.Strategy`.
 */
util.inherits(Strategy, passport.Strategy);


/**
 * Authenticate request by delegating to the SharePoint OAuth 2.0 provider.
 *
 * @param {Object} req
 * @api protected
 */
Strategy.prototype.authenticate = function(req, options) {
  options = options || {};
  var self = this;
  
  if (req.query && req.query.error) {
    // TODO: Error information pertaining to OAuth 2.0 flows is encoded in the
    //       query parameters, and should be propagated to the application.
    return this.fail();
  }
  spAppToken = undefined;
  spHostUrl = undefined;
  // load token from request
  if (req.body && req.body.SPAppToken)
  	spAppToken = req.body.SPAppToken;
  if(req.query && req.query.SPHostUrl)
  	spHostUrl = req.query.SPHostUrl;
    spAppWebUrl = req.query.SPAppWebUrl;
  //fallback to optional values
  if (spAppToken == undefined || spHostUrl == undefined) {
      spAppToken = options.SPAppToken;
      spHostUrl = options.SPHostUrl;
  }
  // App token is sent to client from sharepoint, after sharepoint has talked to acs
  if (spAppToken && spHostUrl) {
    token = jwt.decode(spAppToken, '', true); // no need to eval here
    //console.log('token: ' + token.refreshtoken);// Have refreshtoken here? Why? Ah, it is sent and encrypted in spapptoken
    splitApptxSender = token.appctxsender.split("@");
    sharepointServer = url.parse(spHostUrl);
    resource = splitApptxSender[0]+"/"+sharepointServer.host+"@"+splitApptxSender[1];
    spClientID = this._clientID+"@"+splitApptxSender[1];
    appctx = JSON.parse(token.appctx);
    tokenServiceUri = url.parse(appctx.SecurityTokenServiceUri);
    authorizationURL = spHostUrl + SP_AUTH_PREFIX;
    tokenURL = tokenServiceUri.protocol+'//'+tokenServiceUri.host+'/'+splitApptxSender[1]+tokenServiceUri.path;

    this._oauth2 = new OAuth2(spClientID,  this._clientSecret, '', authorizationURL, tokenURL);
    // Gets accesstoken, using the refreshtoken
    this._oauth2.getOAuthAccessToken(
        token.refreshtoken,
        {grant_type: 'refresh_token', refresh_token: token.refreshtoken, resource: resource},
        function (err, accessToken, refreshToken, params) {
           if (err) { return self.error(new InternalOAuthError('failed to obtain access token', err)); }
            if (!refreshToken)
              refreshToken = token.refreshtoken;
            // Has the accesstoken, loads the userprofile
            self._loadUserProfile(accessToken, spHostUrl, function(err, profile) {
                    if (err) { return self.error(err); };
                    function verified(err, user, info) {
                      if (err) { return self.error(err); }
                      if (!user) { return self.fail(info); }
                      self.success(user, info);
                    }
                    profile.spAppWebUrl = spAppWebUrl; 
                    self._verify(accessToken, refreshToken, profile, verified);
                });  
        });
  } else
    return self.error(new InternalOAuthError('failed to obtain access token')); 
}

/**
 * Retrieve user profile from SharePoint.
 *
 * @param {String} accessToken
 * @param {Function} done
 * @api protected
 */
Strategy.prototype.userProfile = function(accessToken, SPHostURL, done) {
  //console.log('userprofile');
  if (SPHostURL)
    sharepointServer = url.parse(SPHostURL)
  else
    return done(null, {});
    
  var headers = {
    'Accept': 'application/json;odata=verbose',
    'Authorization' : 'Bearer ' + accessToken
  };
  var options = {
    host : sharepointServer.hostname, 
    port : sharepointServer.port,
    path : sharepointServer.path + '/_api/web/currentuser', // Did not append slash correctly
    method : 'GET',
    headers : headers
  };
  var req = https.get(options, function(res) {
    var userData = "";
    res.on('data', function(data) {
        userData += data;
    });
    
    res.on('end', function() {
      var json = JSON.parse(userData);
      if (json.d) {
        var profile = { provider: 'sharepoint' };
        profile.id = json.d.Id;
        profile.username = json.d.LoginName;
        profile.displayName = json.d.Title;
        profile.emails = [{ value: json.d.Email }];
        profile.host = SPHostURL;
        profile._raw = userData;
        profile._json = json;
        done(null, profile);
      }
      else
        return done(null, {});
    });
  }).on('error', function(e) {
    return done(null, {});
  });
}

/**
 * Return extra parameters to be included in the authorization request.
 *
 * @param {Object} options
 * @return {Object}
 * @api protected
 */
Strategy.prototype.authorizationParams = function(options) {
  return {};
}

/**
 * Load user profile, contingent upon options.
 *
 * @param {String} accessToken
 * @param {Function} done
 * @api private
 */
Strategy.prototype._loadUserProfile = function(accessToken, SPHostURL, done) {
  var self = this;
  //console.log('loading userprofile');
  
  function loadIt() {
    return self.userProfile(accessToken, SPHostURL, done);
  }
  function skipIt() {
    return done(null);
  }
  
  if (typeof this._skipUserProfile == 'function' && this._skipUserProfile.length > 1) {
    // async
    this._skipUserProfile(accessToken, function(err, skip) {
      if (err) { return done(err); }
      if (!skip) { return loadIt(); }
      return skipIt();
    });
  } else {
    var skip = (typeof this._skipUserProfile == 'function') ? this._skipUserProfile() : this._skipUserProfile;
    if (!skip) { return loadIt(); }
    return skipIt();
  }
}

/**
 * Expose `Strategy`.
 */ 
module.exports = Strategy;

