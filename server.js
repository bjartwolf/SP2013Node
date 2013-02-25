var expressCookies = require('express/node_modules/cookie'),
    connectUtils = require('express/node_modules/connect/lib/utils'),
    express = require('express'),
    passport = require('passport'),
    app = express(),
    MemoryStore = express.session.MemoryStore,
    sessionStore = new MemoryStore,
    https = require('https');

if (process.env.clientID) { var production = true; }

// Just to be able to git deploy without checking in files
if (production) {
   var keys = require('./keys.js');// import from env variables 
} else {
   var fs = require('fs');
   var keys = require('./devkeys.js');// importing secret keys,
   var privateKey = fs.readFileSync('dummyPrivateKey.pem').toString();
   var certificate = fs.readFileSync('dummyCertificate.pem').toString();
   var options = {key: privateKey, cert: certificate};
}


// Starting server
if (production){
    var http = require('http');
    var server = http.createServer(app).listen(process.env.port);
} else {
    var server = https.createServer(options, app).listen(1337);
}

var io = require('socket.io').listen(server);
io.set('log level', 1);
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

// serialize and deseriazlie is used by passport to store users in sessions based on user.id, sessions provided by express.session
var users = [];

require('./spPassport.js')(passport, users, keys); 
var authRoutes = require('./routes/authRoutes.js')(passport);
var routes = require('./routes/routes.js')(SPio);

var eventRoutes = require('./eventRoutes/eventRoutes.js')(io, SPio);

app.configure(function () {
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({ secret: keys.cookieSecret,
                            store: sessionStore,
                            key: 'express.sid'
  }));
  app.use('/public', express.static(__dirname + '/static'));
  app.use(passport.initialize());
  app.use(passport.session());
  app.use('/authenticate', authRoutes);
//  app.use('/', eventRoutes);
  app.use('/', routes);
});

