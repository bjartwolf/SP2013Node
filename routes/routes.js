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
        /*
        var headers = { 'Accept': 'application/json;odata=verbose', 'Authorization' : 'Bearer ' + req.user.accessToken };
        var options = { url: 'https://bjartwolf.sharepoint.com/_api/lists/getbytitle(\'AppList\')?$select=ListItemEntityTypeFullName',
            url: 'https://bjartwolf.sharepoint.com/_api/web/title', 
            headers : headers };
        request.get(options, function(error, response, body) { res.send(body); });
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
            request.post(options2, function (e, r, b) {
              io.of('/SPio').emit('yo2', b);
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
      spintegration("Create", options);      
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
