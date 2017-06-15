var Client = {};
Client.socket = io.connect(window.location.origin + ":8081");

Client.askNewPlayer = function () {
    Client.socket.emit('newplayer');
}

Client.socket.on('newplayer', function (data) {
    mainGameState.addNewPlayer(data.id, data.x, data.y);
});

Client.socket.on('allplayers', function (data) {
    console.log(data);
    for (var i = 0; i < data.length; i++) {
        mainGameState.addNewPlayer(data[i].id, data[i].x, data[i].y)
    }
});
