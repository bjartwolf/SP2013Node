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

app.configure(function () {
  app.use(express.bodyParser());
  app.set('views', __dirname + '/template');
  app.use(express.cookieParser());
  app.use(express.session({ secret: keys.cookieSecret,
                            store: sessionStore,
                            key: 'express.sid'
  }));
  app.use('/public', express.static(__dirname + '/static'));
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

app.get('/lists', function (req, res) {
  if (req.user) {
    /*
    var headers = {
        'Accept': 'application/json;odata=verbose',
        'Authorization' : 'Bearer ' + req.user.accessToken
    };
    var options = {
        url: 'https://bjartwolf.sharepoint.com/_api/lists/getbytitle(\'AppList\')?$select=ListItemEntityTypeFullName',
        url: 'https://bjartwolf.sharepoint.com/_api/web/title', 
        headers : headers
    };
    request.get(options, function(error, response, body) {
        res.send(body);
    });
    */

    var headers = {
        'Accept': 'application/json;odata=verbose',
        'Authorization' : 'Bearer ' + req.user.accessToken
    };
    var options = {
        url: 'https://bjartwolf.sharepoint.com/_api/contextinfo', 
        headers : headers
    };
    request.post(options, function(error, response, body) {
        var b = JSON.parse(body);
        var formdigest = b.d.GetContextWebInformation.FormDigestValue;
        var headers2 = {
            'Accept': 'application/json;odata=verbose',
            'content-type': 'application/json;odata=verbose',
            'X-RequestDigest': formdigest,
            'Authorization' : 'Bearer ' + req.user.accessToken
        };
        var item = {
              '__metadata': { 'type': 'SP.Data.AppListListItem'},
              'Title': 'awesome beb' 
        };

        var options2 = {
          url: "https://bjartwolf.sharepoint.com/_api/lists/GetByTitle('AppList')/items", 
          body: JSON.stringify(item),
          headers : headers2,
          method: 'POST',
        };
        request(options2, function (e, r, b) {
          io.of('/SPio').emit('yo2', b);
          console.log(e); 
          console.log(r); 
          res.send(b);
        });
     });
  } else {
    res.send('fuck oof');
  }
});
