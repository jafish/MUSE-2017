// Client File -- 3:45 pm 6/20/2017

// For server, need to add + ":8081" to address until we figure out what is going on with socket.io
// *** EDIT: Robin's version is running on port 8137.***
var address = window.location.origin + ":8137";

var Client = {};
Client.socket = io.connect(address);

//************FROM GAME******************
Client.askNewPlayer = function () {
    Client.socket.emit('newplayer');
};

Client.updatePosition = function (data) {
    Client.socket.emit('move', data);
};

Client.shrink = function (playerSize) {
    Client.socket.emit('sendSm', playerSize);
};

Client.grow = function (playerSize) {
    Client.socket.emit('sendBi', playerSize);
};

Client.askDot = function (data) {
    Client.socket.emit('askDot', data);
};

//*****************FROM SERVER******************
Client.socket.on('addDot', function (data) {
   console.log("addDot was triggered in Client.")
    mainGameState.updateAllDots(data.id, data.x, data.y); 
    console.log(data.id + " " + data.x + " " + data.y);
});

Client.socket.on('relaySm', function (otherPlayer) {
   mainGameState.updateOtherSizes(otherPlayer.size, otherPlayer.id);
});

Client.socket.on('relayBi', function (otherPlayer) {
    mainGameState.updateOtherSizes(otherPlayer.size, otherPlayer.id);
});

Client.socket.on('newplayer', function (data) {
    mainGameState.addNewPlayer(data.id, data.color, data.size, data.x, data.y);
});

Client.socket.on('allplayers', function (data) {
    for (var i = 0; i < data.length; i++) {
        mainGameState.addNewPlayer(data[i].id, data[i].color, data[i].size, data[i].x, data[i].y)
    }
});

Client.socket.on('existingDots', function (data) {
    for (var i = 0; i < data.length; i++) {
        mainGameState.addNewDot(data[i].id, data[i].x, data[i].y)
    }
}); // The above function is intended to pull dot colors and locations from the allServerDots array, which is handed off from the server.

Client.socket.on('you', function (data) {
    mainGameState.setID(data);
});

Client.socket.on('move', function (data) {
    mainGameState.updateOtherPlayer(data.id, data.x, data.y);
});

Client.socket.on('remove', function (id) {
    mainGameState.removePlayer(id);
});