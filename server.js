// how the f should this application be split up...
// should probably hide a lot of the passport/connect/cookieparseing/socketsetup into one
// login-module
// and then have app-routes and socket.emits here
// Overwrite keys with devkeys

// Just to be able to git deploy without checking in files
if (!process.env.clientID) {
   var keys = require('./devkeys.js');// importing secret keys,
} else {
   var keys = require('./keys.js');// import from env variables 
}

var SharePointStrategy = require('./strategy.js'),
    express = require('express'),
    passport = require('passport'),
    app = express(),
    qs = require('querystring'),
    http = require('http'),
    expressCookies = require('express/node_modules/cookie'),
    connectUtils = require('express/node_modules/connect/lib/utils'),
    MemoryStore = express.session.MemoryStore,
    sessionStore = new MemoryStore;

app.configure(function () {
  app.use(express.bodyParser());
  app.set('views', __dirname + '/template');
  app.use(express.cookieParser());
  app.use(express.session({ secret: keys.cookieSecret,
                            store: sessionStore,
                            key: 'express.sid'
  }));
  app.use(passport.initialize());
  app.use(passport.session());
});

// serialize and deseriazlie is used by passport to store users in sessions based on user.id, sessions provided by express.session
var users = [];
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

//TODO: memorystore in session should be replaced with memcached or something
//Mongo is free. 
app.post('/authenticate/sharepoint',
  passport.authenticate('sharepoint'),
  function(req, res){
    res.redirect('/'); 
  });

app.get('/', function (req, res) {
  // should be restored by deserializer
  // managed to get the users refreshtoken
  if (req.user) {
//    var refreshToken = req.user.refreshToken;
    var token = req.user.id;
    res.render('index.jade', {token: token, pageTitle: "authorized"});
  } else {
    res.render('index.jade', {token: 'NO TOKEn', pageTitle: "no allows.."});
  }
});

var server = app.listen(process.env.port || 1337);
var io = require('socket.io').listen(server);
io.set('log level', 1);
// of creates a namespace or room 
// should create one pr. sharepoint-server?
var SPio= io.of('/SPio');
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
 
SPio.on('connection', function (client) {
  var username = client.handshake.session.user.username;
  setTimeout(function () { client.emit('sendTimer', 'do it');}, 1000);
  client.on('timerSent', function (data) {
        client.emit('timerPingback', data);
  });
});
