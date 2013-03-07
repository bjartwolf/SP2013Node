var express = require('express');
var request = require('request');
var ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;
var spintegration = require('../spintegration.js');
var app = express();

module.exports = function (io, passport) {

    app.configure(function () {
      app.set('views', __dirname + '/../template');
    });

    app.get('/', ensureLoggedIn('/authenticate/login'), function (req, res) {
        var token = req.user.id;
        res.render('index.jade', {token: token, pageTitle: "authorized", siteUrl: req.user.host, appWeb: req.user.spAppWebUrl});
    });
    
    app.get('/lists', ensureLoggedIn('/authenticate/login'), function (req, res) {
        
        /*var headers = { 'Accept': 'application/json;odata=verbose', 'Authorization' : 'Bearer ' + req.user.accessToken };
        var options = { url: req.user.host+'/_api/lists/getbytitle(\'Tasks\')?$select=ListItemEntityTypeFullName',
            headers : headers };
        request.get(options, function(error, response, body) { 
          res.send(body); 
        });*/
        
        var headers = {
            'Accept': 'application/json;odata=verbose',
            'Authorization' : 'Bearer ' + req.user.accessToken
        };
        var options = {
            url: req.user.host + '/_api/contextinfo', 
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
                  '__metadata': { 'type': 'SP.Data.TasksListItem'},
                  'Title': 'awesome task created '+new Date().getSeconds(),
                  'Body': 'Awesome desc'

            };
    
            var options2 = {
              url: req.user.host + "/_api/lists/GetByTitle('Tasks')/items", 
              body: JSON.stringify(item),
              headers : headers2,
              method: 'POST',
            };
            request.post(options2, function (e, r, b) {
              io.of('/SPio').emit('newTask', b);
              res.send(b);
            });
         });
    });
  
    //*** SP API Routes
    app.get('/_api/:entitytype', function (req,res) {
      var options = {
        entitytype: req.params.entitytype,
        request: req,
        response: res
      };
      spintegration("GetAll", options);      
    });

    app.post('/_api/:entitytype', function (req,res) {
      var options = {
        entitytype: req.params.entitytype,
        body: req.body,
        request: req,
        response: res
      };
      spintegration("Create", options, io);      
    });

    app.get('/_api/:entitytype/:id', function (req,res) {
      var options = {
        entitytype: req.params.entitytype,
        id: req.params.id,
        request: req,
        response: res
      };
      spintegration("Get", options);      
    });

    app.put('/_api/:entitytype/:id', function (req,res) {
      var options = {
        entitytype: req.params.entitytype,
        id: req.params.id,
        body: req.body,
        request: req,
        response: res
      };
      spintegration("Update", options);      
    });

    app.delete('/_api/:entitytype/:id', function (req,res) {
      var options = {
        entitytype: req.params.entitytype,
        id: req.params.id,
        request: req,
        response: res
      };
      spintegration("Delete", options);      
    });
    //***

    return app;
}
