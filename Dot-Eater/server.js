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

app.use('/css', express.static(__dirname + '/css'));
app.use('/js', express.static(__dirname + '/js'));
app.use('/assets', express.static(__dirname + '/assets'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

httpServer.lastPlayerID = 0;

httpServer.listen(8082, function () {
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

        // Initialize player
        socket.player = {
            id: httpServer.lastPlayerID++,
            color: hexColor,
            size: 50,
            x: randomInt(100, 400),
            y: randomInt(100, 400)
        };

        // Is there a way to get other sockets? And look through their dot arrays?

        // Initialize dots
        socket.dots = [];


        socket.emit('allplayers', getAllPlayers());
        socket.emit('you', socket.player.id);
        //console.log(getAllPlayers());
        socket.broadcast.emit('newplayer', socket.player);

        socket.on('move', function (data) {
            // Update this player's recorded position in server's socket object
            // Then, send a message to all clients to update their copies of this player
            socket.player.x = data.x;
            socket.player.y = data.y;
            socket.broadcast.emit('move', socket.player);
        });

        socket.on('resize', function (data) {
            // Update this player's recorded size in server's socket object
            // Then, send a message to all clients to update their copies of this player
            socket.player.size = data;
            // TODO - Do I really need to send the whole player here?
            socket.broadcast.emit('resize', socket.player);
        });

        socket.on('newdot', function (data) {
            // 1. Add the dot to my socket's dot list
            socket.dots.push(data);
            // 2. Broadcast the new dot to the other clients
            socket.broadcast.emit('newdot', data);
        })

        socket.on('disconnect', function () {
            io.emit('remove', socket.player.id);
        });
    });
});

function getAllPlayers() {
    var collectedPlayers = [];
    Object.keys(io.sockets.connected).forEach(function (socketID) {
        var currentPlayer = io.sockets.connected[socketID].player;
        var currentDots = io.sockets.connected[socketID].dots;
        if (currentPlayer != null) {
            collectedPlayers.push({
                player: currentPlayer,
                dots: currentDots
            })
        }
    });
    return collectedPlayers;
}

function randomInt(low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}
