// Game File -- 3:45 pm 6/20/2017

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

    //Start the physics
    game.physics.startSystem(Phaser.Physics.ARCADE);

    //Nice dusty lavender background, instead of black.
    game.stage.backgroundColor = "#6d5f77";

    // Dots
    this.dotGroup = game.add.group();
    this.allDotGroup = game.add.group();

    this.dropSound = game.add.audio('drop');

    // Players
    this.playerList = {};

    // Dot Array
    this.allDots = [];

    // KEY INPUTS
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

mainGameState.addNewDot = function (id, x, y) {
    var newDot = game.add.sprite(x, y, 'player', 0, this.allDotGroup); // all (existing) dots belong to the allDotGroup
    newDot.width = newDot.height = DOT_SIZE;
    newDot.anchor.setTo(0.5, 0.5);
    newDot.tint = id;
    //this.dropSound.play(); // play a sound when a dot is dropped

    this.allDots[this.allDots.length] = newDot; // add the newDot to the end of an array called allDots
};

mainGameState.updateAllDots = function (id, x, y) {
    // all the normal dot dropping stuff, with the exception of making the tint based on the id, and the x and y coordinates are sent from the dot-dropper. 
    var newDot = game.add.sprite(x, y, 'player', 0, this.allDotGroup); // define this newDot as belonging to the allDotGroup
    newDot.width = newDot.height = DOT_SIZE; // size is based on the constant at the top of game.js
    newDot.anchor.setTo(0.5, 0.5); // set anchor to the center of the dot
    newDot.tint = id; // tint is based on player id that sent the dot
}; 

mainGameState.update = function () {
    this.movePlayer();
    this.growCircle();

    if (1000 < game.time.now - this.timeCheck) {
        this.dropDotFn();
    }

    this.addNewDot();
    this.updateAllDots();
    this.updateOtherSizes();
};

mainGameState.growCircle = function () {
    if (myPlayerID >= 0) {
        if (this.playerList[myPlayerID].width < 250) {
            this.playerList[myPlayerID].width += 0.35;
            this.playerList[myPlayerID].height += 0.35;
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

            console.log("The dropDot button is down, and the player is large enough to drop a dot.")

            // Perform a timeCheck for the delay.
            this.timeCheck = game.time.now;
            var dropped = false; // set initial value of dropped to false
            //var playerColor = myPlayerID; // let the id in Client.askDot inform the player color (id)
            var playerColor = this.playerList[myPlayerID].tint;

            //Change and send player size
            this.playerList[myPlayerID].width -= 30;
            this.playerList[myPlayerID].height -= 30;
            Client.shrink(this.playerList[myPlayerID].height);

            dropped = true; // change dropped to true

            console.log(dropped);

            // Send an object containing the player color and x/y positions.
            if (dropped) {

                console.log("Preparing to ask server to add dot where I am.");

                Client.askDot( //recursion error
                    {
                        id: playerColor,
                        x: this.playerList[myPlayerID].x,
                        y: this.playerList[myPlayerID].y
                    }); //closes: askDot function
                console.log("Successfully executed askDot."); // Unexpected identifier
            } //closes: if dropped
        } //closes: if myPlayerID
    } //closes: if the dotButton is pressed
}; //closes dropDotFn

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

    // Update its local position
    if (player != null) {
        player.x = x;
        player.y = y;
    }
};

mainGameState.updateOtherSizes = function (size, id) {
    // Update that player's size
    if (id >= 0) {
        this.playerList[id].width = size;
        this.playerList[id].height = size;
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
