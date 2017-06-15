// For server, need to add + ":8081" to address until we figure
// out WTF is going on with socket.io
var address = window.location.origin + ":8081";

var Client = {};
Client.socket = io.connect(address);

Client.askNewPlayer = function () {
    Client.socket.emit('newplayer');
    //console.log("Sending new player");
}

Client.socket.on('newplayer', function (data) {
    mainGameState.addNewPlayer(data.id, data.color, data.size, data.x, data.y);
});


Client.socket.on('allplayers', function (data) {
    //console.log(data);
    for (var i = 0; i < data.length; i++) {
        mainGameState.addNewPlayer(data[i].id, data[i].color, data[i].size, data[i].x, data[i].y)
    }
});

Client.sendArrow = function (arrow) {
    Client.socket.emit('arrowPressed', arrow);
};

Client.socket.on('move', function (data) {
    mainGameState.movePlayer(data.id, data.x, data.y);
});
