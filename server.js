var express = require('express'),
    passport = require('passport'),
    request = require('request'),
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

var routes = require('./routes/routes.js');
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
  app.use('/', routes);
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
    var server = https.createServer(options, app).listen(1337);
}


var io = require('socket.io').listen(server);
var SPio = require('./sessionIO.js').startListen(server, keys, sessionStore, users,io);

SPio.on('connection', function (client) {
  console.log('connected socket io');
//  setInterval(function () { 
//      io.of('/SPio').emit('sendTimer', 'do it');
//    }, 1000);
  client.on('timerSent', function (data) {
//      var username = client.handshake.session.user.username;
      client.emit('timerPingback', data);
  });
});
