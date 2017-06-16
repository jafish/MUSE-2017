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
httpServer.dotArray = [];

httpServer.listen(8081, function () {
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
            size: 50,
            x: randomInt(100, 400),
            y: randomInt(100, 400)
        };
        socket.emit('allplayers', getAllPlayers());
        socket.emit('allDots', httpServer.dotArray);
        socket.emit('you', socket.player.id);
        //console.log(getAllPlayers());
        socket.broadcast.emit('newplayer', socket.player);

        socket.on('move', function (data) {
            // Update this player's recorded position in server's socket object
            socket.player.x = data.x;
            socket.player.y = data.y;
            socket.broadcast.emit('move', socket.player);
        });

        socket.on('grow', function (data) {
            socket.player.size = data;
            socket.broadcast.emit('grow', socket.player);
        });

        socket.on('shrink', function (data) {
            socket.player.size = data;
            socket.broadcast.emit('shrink', socket.player);
        });

        socket.on('spawnDot', function (data) {
            var dot = {
                x: data.x,
                y: data.y,
                color: data.color
            }
            httpServer.dotArray.push(dot);
            socket.broadcast.emit('spawnDot', data)
        });

        //server will compare the x y and color with each member of the dotArray. When the dot is found it removes it from the array, sends the data back to client. 

        socket.on('disconnect', function () {
            io.emit('remove', socket.player.id);
            for (var i = 0; i < httpServer.dotArray.length; i++) {
                if (httpServer.dotArray.length[i]) {
                    if (httpServer.dotArray[i].color == socket.player.color) {
                        httpServer.dotArray.splice(httpServer.dotArray[i], 1);
                    };
                };
            };
            io.emit('removeDots', socket.player.color);
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