// Client File -- 3:20 pm 6/19/2017

// For server, need to add + ":8081" to address until we figure
// out WTF is going on with socket.io
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
    console.log("The client has received " + playerSize + " from the game.");
    Client.socket.emit('sendBi', playerSize);
    console.log("The client is sending " + playerSize + " to the server.");
};

Client.sendDot = function (data) {
    Client.socket.emit('addDot', data);
};

//*****************FROM SERVER****************************
Client.socket.on('addDot', function (data) {
   mainGameState.updateOtherDot(data.id, data.x, data.y); 
});

Client.socket.on('relaySm', function (otherPlayer) {
   mainGameState.updateOtherSizes(otherPlayer.size, otherPlayer.id);
});

Client.socket.on('relayBi', function (otherPlayer) {
    console.log("The client has received data from the server about another player.")
    mainGameState.updateOtherSizes(otherPlayer.size, otherPlayer.id);
    console.log("The client is telling the game about " + otherPlayer.size + " and " + otherPlayer.id);
});

Client.socket.on('newplayer', function (data) {
    mainGameState.addNewPlayer(data.id, data.color, data.size, data.x, data.y);
});

Client.socket.on('allplayers', function (data) {
    //console.log(data);
    for (var i = 0; i < data.length; i++) {
        mainGameState.addNewPlayer(data[i].id, data[i].color, data[i].size, data[i].x, data[i].y)
    }
});

Client.socket.on('you', function (data) {
    mainGameState.setID(data);
});

Client.socket.on('move', function (data) {
    mainGameState.updateOtherPlayer(data.id, data.x, data.y);
});

Client.socket.on('remove', function (id) {
    mainGameState.removePlayer(id);
});