// For server, need to add + ":8081" to address until we figure
// out WTF is going on with socket.io
var address = window.location.origin + ":8081";

var Client = {};
Client.socket = io.connect(address);

Client.askNewPlayer = function () {
    Client.socket.emit('newplayer');
    //console.log("Sending new player");
}

Client.updatePosition = function (data) {
    Client.socket.emit('move', data);
}

Client.updateSize = function (data) {
    Client.socket.emit('grow', data);

}
Client.shrinkPlayer = function (data) {
    Client.socket.emit('shrink', data);
}

Client.sentDotLocation = function (data) {
    Client.socket.emit('spawnDot', data);
}

Client.eatDot = function (data) {
    Client.socket.emit('eatDot', data);
}

//The client will receive the data, send the data to the server

Client.socket.on('newplayer', function (data) {
    mainGameState.addNewPlayer(data.id, data.color, data.size, data.x, data.y);
});


Client.socket.on('allplayers', function (data) {
    for (var i = 0; i < data.length; i++) {
        mainGameState.addNewPlayer(data[i].id, data[i].color, data[i].size, data[i].x, data[i].y)
    }
});

Client.socket.on('allDots', function (data) {
    for (var i = 0; i < data.length; i++) {
        mainGameState.spawnOtherDots(data[i].x, data[i].y, data[i].color);
    };
});

Client.socket.on('you', function (data) {
    mainGameState.setID(data);
});

Client.socket.on('move', function (data) {
    mainGameState.updateOtherPlayer(data.id, data.x, data.y);
});

Client.socket.on('grow', function (data) {
    mainGameState.updateOtherSizes(data.id, data.size);
});

Client.socket.on('shrink', function (data) {
    mainGameState.updateOtherSizes(data.id, data.size);
});

Client.socket.on('spawnDot', function (data) {
    mainGameState.spawnOtherDots(data.x, data.y, data.color);

});

Client.socket.on('removeDot', function (data) {
    console.log("data received " + data);
    mainGameState.removeDot(data.x, data.y, data.color);
});

//On receiving removed dot data from server the client will send the data back to the game 

Client.socket.on('remove', function (id) {
    mainGameState.removePlayer(id);
});

Client.socket.on('removeDots', function (color) {
    mainGameState.removeDots(color);
});