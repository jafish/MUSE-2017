// Server File -- 10:15 am 6/21/2017
const UP_ARROW = 0;
const RIGHT_ARROW = 1;
const DOWN_ARROW = 2;
const LEFT_ARROW = 3;
const MOVEMENT = 7;

var express = require('express');
var app = express();
var httpServer = require('http').Server(app);
var io = require('socket.io').listen(httpServer);

var allServerDots = []; // create server-side array called allServerDots. This needs to be at the current level in order to be used by askDot. I am moving this above existingDots to see if it can access the array as well.

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
        socket.emit('existingPlayers', getAllPlayers()); // all online users are collected into an array by getAllPlayers function and are shown to the newest player

        socket.emit('existingDots', allServerDots); // Based on allplayers, I assume that arrays can be relayed to the Client. 
        console.log(allServerDots);

        socket.emit('you', socket.player.id); // assign your id to yourself
        socket.broadcast.emit('newplayer', socket.player); // existing players will receive {id, color, size, x, y} of new player

        socket.on('move', function (data) {
            // Update this player's recorded position in server's socket object
            socket.player.x = data.x;
            socket.player.y = data.y;
            socket.broadcast.emit('move', socket.player);
        });

        socket.on('askDot', function (data) {
            //This needs to be revised so that the server adds the dot to its array, and then sends the array (not the new dot). 

            var serverDot = data;
            allServerDots[allServerDots.length] = serverDot;

            //console.log(allServerDots[0]); // --> {id, x, y} 
            io.emit('addDot', serverDot); // tell clients to add the dot. 
            console.log(allServerDots); // --> [ { serverDot1}, {serverDot2} ] 
        });

        socket.on('sendSm', function (playerHeight) {
            socket.player.height = playerHeight.size;
            socket.broadcast.emit('relaySm', socket.player);
        });

        socket.on('sendBi', function (playerWidth) {
            socket.player.size = playerWidth;
            socket.broadcast.emit('relayBi', socket.player);
        });

        socket.on('disconnect', function () {
            io.emit('remove', socket.player.id);
            console.log("Player disconnected.");
            console.log(socket.player.id);
            
            // Upon disconnect, check disconnecting player's tint.
            var disconnectedColor = socket.player.color;
            console.log(disconnectedColor);
            
            var n = 1;
            // Find all dots of that tint and delete them from allServerDots array.
            for (i = allServerDots.length - n; i >= 0; i--) { // Go through the whole allServerDots array, where i is the index number.
                if (allServerDots[i].id == disconnectedColor) { // If the tint of the tint of allServerDots at this index number is the same as the disconnected color, ...
                    console.log(allServerDots[i].id);
                    allServerDots.splice(allServerDots.length - n, 1); // ...splice just that index.
                } else { // otherwise, increase n and check the next part of the index.
                    n++;
                }
            }
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
};

function randomInt(low, high) {
    return Math.floor(Math.random() * (high - low) + low);
};
