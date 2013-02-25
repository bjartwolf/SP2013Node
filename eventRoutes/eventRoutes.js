module.exports = function (io) {
    //SPio.on('connection', function (client) {
    io.of('/SPio').on('connection', function (client) {
      console.log('connected socket io with user ' + client.handshake.session.user.username );
      setInterval(function () { 
          io.of('/SPio').emit('sendTimer', 'do it');
        }, 1000);
      client.on('timerSent', function (data) {
    //      var username = client.handshake.session.user.username;
          client.emit('timerPingback', data);
      });
    });
}
