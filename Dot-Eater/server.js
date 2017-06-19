// Server File -- 3:20 pm 6/19/2017
const UP_ARROW = 0;
const RIGHT_ARROW = 1;
const DOWN_ARROW = 2;
const LEFT_ARROW = 3;
const MOVEMENT = 7;

var express = require('express');
var app = express();
var httpServer = require('http').Server(app);
//var io = require('socket.io')(httpServer);
var io = require('socket.io').listen(httpServer);
//console.log(io);

//io.set('log level', 1);

app.use('/css', express.static(__dirname + '/css'));
app.use('/js', express.static(__dirname + '/js'));
app.use('/assets', express.static(__dirname + '/assets'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

httpServer.lastPlayerID = 0;

httpServer.listen(8137, function () {
    console.log('Listening on ' + httpServer.address().port);
});

io.on('connection', function (socket) {
    console.log("Connected!");
    socket.on('newplayer', function () {
        console.log("New player received");
        var rhexString = Math.floor(Math.random() * 256).toString(16);
        var ghexString = Math.floor(Math.random() * 256).toString(16);
        var bhexString = Math.floor(Math.random() * 256).toString(16);

        var hexColor = ("0x" + rhexString + ghexString + bhexString);

        socket.player = {
            id: httpServer.lastPlayerID++,
            color: hexColor,
            size: 60,
            x: randomInt(100, 400),
            y: randomInt(100, 400)
        };
        socket.emit('allplayers', getAllPlayers());
        socket.emit('you', socket.player.id);
        //console.log(getAllPlayers());
        socket.broadcast.emit('newplayer', socket.player);

        socket.on('move', function (data) {
            // Update this player's recorded position in server's socket object
            socket.player.x = data.x;
            socket.player.y = data.y;
            socket.broadcast.emit('move', socket.player);
        });

        socket.on('addDot', function (data) {
            socket.broadcast.emit('addDot', data);
        });

        // ***** vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv        
            socket.on('sendSm', function (playerHeight) {
                socket.player.height = playerHeight.size;
                socket.broadcast.emit('relaySm', socket.player);
            });

            socket.on('sendBi', function (playerWidth) {
                console.log("The server has received " + playerWidth);
                socket.player.width = playerWidth;
                console.log("The server has determined the playerWidth of the sending player");
                socket.broadcast.emit('relayBi', socket.player);
                console.log("The server has relayed the socket.player object");
            });
        // ***** ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
        socket.on('disconnect', function () {
            io.emit('remove', socket.player.id);
            console.log("Player disconnected.");

        });
    });
});

function getAllPlayers() {
    var collectedPlayers = [];
    Object.keys(io.sockets.connected).forEach(function (socketID) {
        var currentPlayer = io.sockets.connected[socketID].player;
        if (currentPlayer != null) {
            collectedPlayers.push(currentPlayer);
        }
    });
    return collectedPlayers;
}

function randomInt(low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}
