var expressCookies = require('express/node_modules/cookie'),
    connectUtils = require('express/node_modules/connect/lib/utils');

module.exports = function (io, keys, users, sessionStore) {
    var SPio = io.of('/SPio');
    // of creates a namespace or room 
    SPio.authorization(function(handshakeData, accept) {
      // Look up the sid from the cookie (after parsing it)
      // and connects it too  
      if (!handshakeData.headers.cookie) return accept('socket.io: no found cookie.', false);
     
      var signedCookies = expressCookies.parse(handshakeData.headers.cookie);
      handshakeData.cookies = connectUtils.parseSignedCookies(signedCookies, keys.cookieSecret); 
      sessionStore.get(handshakeData.cookies['express.sid'], function(err, session) {
        if (err || !session) {
            return accept('socket.io: no found session.', false);
        }
     
        // refactor this shit 
        handshakeData.session = session;
        handshakeData.session.user = users[session.passport.user];
        if (handshakeData.session.user) {
          return accept(null, true);
        } else {
          return accept('socket.io: no found session.user', false);
        }
      })
    });
}
