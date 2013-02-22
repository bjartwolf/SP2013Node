var SharePointStrategy = require('./strategy.js');

module.exports = function (passport, users, keys) {
    passport.serializeUser(function(user, done) {
      users[user.id] = user;
      // this should just set userid in cookie. cookie is signed and secret
      // not sure where this number is from, though, probably need to make
      // a smarter id based on url and id or something... or a guid
      // cookies should be https-only
      // expires when browser session ends
      done(null, user.id);
    });
    passport.deserializeUser(function(id, done) {
        var user = users[id];
        if (user) {
            done(null, users[id]);
        } else {
            done('User not found', null);
        }
    });
    
    passport.use(new SharePointStrategy({
        clientID: keys.clientID, 
        clientSecret: keys.clientSecret
      },
      function(accessToken, refreshToken, profile, done) {
            // Adds the tokens to the user
            // It is later stored by the serialize/deserializeuser functions
            profile.accessToken = accessToken;
            profile.refreshToken = refreshToken;
            return done(null, profile); 
      }
    ));
}
