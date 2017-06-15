var express = require('express');
var app = express();
var httpServer = require('http').Server(app);
var io = require('socket.io')(httpServer);
//var io = require('socket.io').listen(httpServer);
//console.log(io);

//io.set('log level', 1);

app.use('/css', express.static(__dirname + '/css'));
app.use('/js', express.static(__dirname + '/js'));
app.use('/assets', express.static(__dirname + '/assets'));

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

httpServer.lastPlayerID = 0;

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
        //console.log(getAllPlayers());
        socket.broadcast.emit('newplayer', socket.player);
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
