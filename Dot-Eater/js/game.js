// Game File -- 12:41 pm 6/19/2017

const DOT_SIZE = 10;
const UP_ARROW = 0;
const RIGHT_ARROW = 1;
const DOWN_ARROW = 2;
const LEFT_ARROW = 3;
const MOVEMENT = 7;

var myPlayerID = -1;

var game = new Phaser.Game(
    24 * 32,
    17 * 32,
    Phaser.AUTO,
    document.getElementById("game"),
    this,
    false,
    false
);

var mainGameState = {};

mainGameState.preload = function () {
    game.load.image('player', 'assets/sprites/circle.png');
    game.load.audio('drop', ['assets/dropAudio.mp3', 'assets/dropAudio.ogg']);
};

mainGameState.create = function () {
    game.renderer.renderSession.roundPixels = true;
    game.stage.disableVisibilityChange = true;
    this.timeCheck = 0;

    this.playerList = {};

    //Start the physics
    game.physics.startSystem(Phaser.Physics.ARCADE);

    // Dots
    this.dotGroup = game.add.group();
    this.otherDotGroup = game.add.group();

    this.dropSound = game.add.audio('drop');

    //Nice dusty lavender background, instead of black.
    game.stage.backgroundColor = "#6d5f77";

    // Arrow keys and spacebar only affect game.
    game.input.keyboard.addKeyCapture(
      [Phaser.Keyboard.UP, Phaser.Keyboard.DOWN,
      Phaser.Keyboard.LEFT, Phaser.Keyboard.RIGHT,
      Phaser.Keyboard.SPACEBAR]);

    //Allow arrow key inputs
    this.cursor = game.input.keyboard.createCursorKeys();
    //Allow WASD inputs
    this.wasd = {
        up: game.input.keyboard.addKey(Phaser.Keyboard.W),
        left: game.input.keyboard.addKey(Phaser.Keyboard.A),
        right: game.input.keyboard.addKey(Phaser.Keyboard.D),
        down: game.input.keyboard.addKey(Phaser.Keyboard.S)
    };
    this.dotButton = {
        dropDot: game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR)
    };

    Client.askNewPlayer();
};

mainGameState.addNewPlayer = function (id, color, size, x, y) {
    // --- Player Initialization ---
    mainGameState.playerList[id] = game.add.sprite(x, y, 'player');
    mainGameState.playerList[id].anchor.setTo(0.5, 0.5);
    mainGameState.playerList[id].width = mainGameState.playerList[id].height = size;
    mainGameState.playerList[id].tint = color;
    mainGameState.playerList[id].smoothed = false;
    mainGameState.playerList[id].alpha = 0.85;
    game.physics.arcade.enable(mainGameState.playerList[id]);
    // DONT FORGET: setCircle expects a radius sized relative to the sprite's texture (i.e. the original image file)
    // Since our circle is 400x400 px, the radius given to setCircle should be 200

    mainGameState.playerList[id].body.setCircle(200);
    // --- End Player Initialization ---
};

mainGameState.update = function () {
    this.movePlayer();
    this.growCircle();

    if (1000 < game.time.now - this.timeCheck) {
        this.dropDotFn();
    }

    this.updateOtherDot();
    this.updateOtherSizes();
};

mainGameState.growCircle = function () {
    if (myPlayerID >= 0) {
        if (this.playerList[myPlayerID].width < 250) {
            this.playerList[myPlayerID].width += 0.35;
            this.playerList[myPlayerID].height += 0.35;
            console.log("Game is sending " + this.playerList[myPlayerID].width); // What is the player width?
            Client.grow(this.playerList[myPlayerID].width);
        } else {
            this.playerList[myPlayerID].width = 250;
            this.playerList[myPlayerID].height = 250;
        }
    }
};

mainGameState.dropDotFn = function () {

    if (this.dotButton.dropDot.isDown && this.playerList[myPlayerID].width > 60) {
        if (myPlayerID >= 0) {
            // Perform a timeCheck for the delay.
            this.timeCheck = game.time.now;
            var dropped = false;

            //Get YOUR ID and use it to represent your color.
            var playerColor = this.playerList[myPlayerID].tint;
            //console.log(playerColor);

            // Drop a dot and add it to the group
            var newdot = game.add.sprite(this.playerList[myPlayerID].x, this.playerList[myPlayerID].y, 'player', 0, this.dotGroup);
            newdot.width = newdot.height = DOT_SIZE;
            newdot.anchor.setTo(0.5, 0.5);
            newdot.tint = playerColor;
            this.dropSound.play();
            dropped = true;

            // modeled after the move function
            if (dropped) {
                Client.sendDot({
                    id: playerColor,
                    x: newdot.x,
                    y: newdot.y
                });
            } //closes: if dropped = true

            //Change player size
            this.playerList[myPlayerID].width -= 30;
            this.playerList[myPlayerID].height -= 30;
            //Send new size to the client
            Client.shrink(this.playerList[myPlayerID].height);

        } //closes: if myPlayerID
    } //closes: if the dotButton is pressed
}; //closes dropDotFn

mainGameState.updateOtherSizes = function (size, id) {
    console.log("updateOtherSizes is running");
    var player = id;
    // Update that player's size
    if (player != null) {
        console.log("The player in question exists");
        player.width = player.height = size;
        console.log("The new size of the player is " + size);
    }
};

// Other's dots are coming in from the Client
mainGameState.updateOtherDot = function (id, x, y) {
    // all the normal dot dropping stuff, with the exception of making the tint based on the id, and the x and y coordinates are sent from the dot-dropper. 
    var newOtherDot = game.add.sprite(x, y, 'player', 0, this.otherDotGroup);
    newOtherDot.width = newOtherDot.height = DOT_SIZE;
    newOtherDot.anchor.setTo(0.5, 0.5);
    newOtherDot.tint = id;
};

//This function moves our circle player
mainGameState.movePlayer = function () {

    // If the id is not received by the client, then do nothing
    if (myPlayerID >= 0) {
        var player = this.playerList[myPlayerID];
        var moved = false;

        if (this.cursor.right.isDown || this.wasd.right.isDown) {
            player.x += MOVEMENT;
            moved = true;
        } else if (this.cursor.left.isDown || this.wasd.left.isDown) {
            player.x -= MOVEMENT;
            moved = true;
        }

        if (this.cursor.up.isDown || this.wasd.up.isDown) {
            player.y -= MOVEMENT;
            moved = true;
        } else if (this.cursor.down.isDown || this.wasd.down.isDown) {
            player.y += MOVEMENT;
            moved = true;
        }

        if (moved) {
            // Send the id and position of the player
            Client.updatePosition({
                x: player.x,
                y: player.y
            });
        }
    }
    // TODO: Fix diagonal too-fast-ness

};

mainGameState.updateOtherPlayer = function (id, x, y) {
    // Get the player with incoming id from the list
    var player = this.playerList[id];
    //console.log(player);

    // Update its local position
    if (player != null) {
        player.x = x;
        player.y = y;
    }
};

// --- Set myPlayerID from server's newly generated number
mainGameState.setID = function (id) {
    myPlayerID = id;
};

mainGameState.removePlayer = function (id) {
    this.playerList[id].destroy();
    delete this.playerList[id];
};

mainGameState.render = function () {
    //game.debug.body(this.player);
};

game.state.add("Game", mainGameState);
game.state.start("Game");
