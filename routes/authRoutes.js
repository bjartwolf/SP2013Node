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
    return app; 
};
