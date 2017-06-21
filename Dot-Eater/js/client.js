// For server, need to add + ":8081" to address until we figure
// out WTF is going on with socket.io
var address = window.location.origin + ":8082";
//var address = "";

var Client = {};
Client.socket = io.connect(address);

Client.askNewPlayer = function () {
    Client.socket.emit('newplayer');
}

Client.updatePosition = function (data) {
    Client.socket.emit('move', data);
}

Client.updateSize = function (data) {
    Client.socket.emit('resize', data);
}

Client.sendDot = function (data) {
    Client.socket.emit('newdot', data);
}

Client.consumeDot = function (data) {
    Client.socket.emit('consumedot', data);
}

Client.socket.on('newplayer', function (data) {
    mainGameState.addNewPlayer(data.id, data.color, data.size, data.x, data.y);
});


Client.socket.on('allplayers', function (data) {
    for (var i = 0; i < data.length; i++) {
        var playerData = data[i].player;
        var playerDots = data[i].dots;
        console.log("Player Data is " + data[i].player);
        console.log("Dots Data is " + data[i].dots);
        mainGameState.addNewPlayer(playerData.id, playerData.color, playerData.size, playerData.x, playerData.y, playerDots)
    }
});

Client.socket.on('you', function (data) {
    mainGameState.setID(data);
});

Client.socket.on('move', function (data) {
    mainGameState.updateOtherPlayerPosition(data.id, data.x, data.y);
});

Client.socket.on('resize', function (data) {
    mainGameState.updateOtherPlayerSize(data.id, data.size);
});

// TODO: Create receive update dot message(s) - either add or consume
Client.socket.on('newdot', function (data) {
    mainGameState.addDot(data);
});

Client.socket.on('consumedot', function (data) {
    mainGameState.consumeDot();
});

Client.socket.on('remove', function (id) {
    mainGameState.removePlayer(id);
});
