// how the f should this application be split up...
// should probably hide a lot of the passport/connect/cookieparseing/socketsetup into one
// login-module
// and then have app-routes and socket.emits here
// Overwrite keys with devkeys

var SharePointStrategy = require('./strategy.js'),
    express = require('express'),
    passport = require('passport'),
    app = express(),
    http = require('http'),
    https = require('https'),
    MemoryStore = express.session.MemoryStore,
    sessionStore = new MemoryStore;

// Just to be able to git deploy without checking in files
if (!process.env.clientID) {
   var fs = require('fs');
   var keys = require('./devkeys.js');// importing secret keys,
   var privateKey = fs.readFileSync('dummyPrivateKey.pem').toString();
   var certificate = fs.readFileSync('dummyCertificate.pem').toString();
   var options = {key: privateKey, cert: certificate};
} else {
   var keys = require('./keys.js');// import from env variables 
}
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
// this is bullshit... but just forgot something in the one app
app.post('/authenticate/sharepoint',
  passport.authenticate('sharepoint'),
  function(req, res){
    res.redirect('/'); 
  });

app.post('/authenticate/sharepoint/Pages/Default.aspx',
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

if (process.env.port) {
    var server = http.createServer(app).listen(process.env.port);
} else {
    var server = https.createServer(options, app).listen(1337);
}
require('./sessionIO.js').startListen(server, keys, sessionStore, users);
