// how the f should this application be split up...
// should probably hide a lot of the passport/connect/cookieparseing/socketsetup into one
// login-module
// and then have app-routes and socket.emits here
// Overwrite keys with devkeys

var express = require('express'),
    passport = require('passport'),
    app = express(),
    MemoryStore = express.session.MemoryStore,
    sessionStore = new MemoryStore;
    
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

require('./spPassport.js')(passport, users, keys); 

//TODO: memorystore in session should be replaced with memcached or something
//Mongo is free. 
// this is bullshit... but just forgot something in the one app
app.post('/authenticate/sharepoint',
  passport.authenticate('sharepoint'),
  function(req, res){
    res.redirect('/'); 
  });

// redundant, remove when fixed app
app.post('/authenticate/sharepoint/Pages/Default.aspx',
  passport.authenticate('sharepoint'),
  function(req, res){
    res.redirect('/'); 
  });

// Starting server
if (production){
    var http = require('http');
    var server = http.createServer(app).listen(process.env.port);
} else {
    var https = require('https');
    var server = https.createServer(options, app).listen(1337);
}


var SPio = require('./sessionIO.js').startListen(server, keys, sessionStore, users);

SPio.on('connection', function (client) {
  setInterval(function () { client.emit('sendTimer', 'do it');}, 1000);
  client.on('timerSent', function (data) {
      var username = client.handshake.session.user.username;
      console.log(username);
      client.emit('timerPingback', data);
  });
});

app.get('/', function (req, res) {
  if (req.user) {
//    console.log(req.user.refreshToken);
//    console.log(req.user.accessToken);
    var token = req.user.id;
    res.render('index.jade', {token: token, pageTitle: "authorized"});
  } else {
    res.render('index.jade', {token: 'NO TOKEn', pageTitle: "no allows.."});
  }
});


