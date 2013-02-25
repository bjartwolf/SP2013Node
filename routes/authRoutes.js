var express = require('express');
var app = express();

module.exports = function (passport) {
    app.post('/sharepoint',
      passport.authenticate('sharepoint'),
      function(req, res){
        res.redirect('/'); 
    });

    // redundant, remove when fixed app
    app.post('/sharepoint/Pages/Default.aspx',
      passport.authenticate('sharepoint'),
      function(req, res){
        res.redirect('/'); 
    });
    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });
    app.get('/login', function (req, res) {
        res.send('Go to SharePoint and start the app from there');
    });
    return app; 
};
