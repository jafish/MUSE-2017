// For server, need to add + ":8081" to address until we figure
// out WTF is going on with socket.io
// *** EDIT: Robin's version is running on port 8137.***
var address = window.location.origin + ":8137";

var Client = {};
Client.socket = io.connect(address);

//************FROM GAME******************
Client.askNewPlayer = function () {
    Client.socket.emit('newplayer');
    //console.log("Sending new player");
};

Client.updatePosition = function (data) {
    Client.socket.emit('move', data);
};

//Hear "shrink" from the game, send "sendSm" to the server
Client.shrink = function (data) {
    Client.socket.emit('sendSm', data);
};

Client.grow = function (data) {
    Client.socket.emit('sendBi', data);
};

//Hear "sendDot" from the game, send "addDot" to the server
Client.sendDot = function (data) {
    Client.socket.emit('addDot', data);
};

//*****************FROM SERVER****************************
//Hear "addDot" from the server, tell game to "updateOtherDot"
Client.socket.on('addDot', function (data) {
   mainGameState.updateOtherDot(data.id, data.x, data.y); 
});

//Hear "relaySm" from the server, tell game to update that player's height/width
Client.socket.on('relaySm', function (data) {
   mainGameState.updateSmall(data.height);
});

//Hear "relayBi" from the server, tell game to update that player's height/width
Client.socket.on('relayBi', function (data) {
   mainGameState.updateBig(data.width);
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