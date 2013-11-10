var io = require('socket.io').listen(3001);


var PORT = 8888;
var HOST = '172.16.101.122';

var dgram = require('dgram');
var message = new Buffer('VERSE');

var client = dgram.createSocket('udp4');

io.sockets.on('connection', function (socket) {
  socket.on('TEST', function (name) {
    console.log("Got Packet");
	client.send(message, 0, message.length, PORT, HOST);
  });
});