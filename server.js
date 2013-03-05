var express = require('express'),
    passport = require('passport'),
    app = express(),
    MemoryStore = express.session.MemoryStore,
    sessionStore = new MemoryStore,
    https = require('https');

// Consider taking a variable from command line
if (process.env.clientID) { var production = true; } // If environment variables are set we are in Nodejitsu env

if (production) {
   var keys = require('./keys.js'); // import from env variables 
} else {
   var fs = require('fs');
   var keys = require('./devkeys.js');
   var privateKey = fs.readFileSync('dummyPrivateKey.pem').toString();
   var certificate = fs.readFileSync('dummyCertificate.pem').toString();
   var options = {key: privateKey, cert: certificate};
}

if (production){
    var http = require('http');
    var server = http.createServer(app).listen(process.env.port);
} else {
    var server = https.createServer(options, app).listen(44305);
}

var io = require('socket.io').listen(server);
var users = []; 
require('./eventRoutes/eventAuth.js')(io, keys, users, sessionStore); // configure security for socketIO
io.set('log level', 1); 

require('./spPassport.js')(passport, users, keys); 

var authRoutes = require('./routes/authRoutes.js')(passport);
var routes = require('./routes/routes.js')(io);
require('./eventRoutes/eventRoutes.js')(io);

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
  app.use('/Pages', authRoutes);
  app.use('/', routes);
});

