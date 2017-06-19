// Game File

const DOT_SIZE = 10;
const UP_ARROW = 0;
const RIGHT_ARROW = 1;
const DOWN_ARROW = 2;
const LEFT_ARROW = 3;
const MOVEMENT = 7;
const GROWTH_RATE = 1;
const MAX_SIZE = 400;
const MAX_SIZE_TO_DROP = 75;

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
}

mainGameState.create = function () {
    game.renderer.renderSession.roundPixels = true;
    game.stage.disableVisibilityChange = true;
    this.timeCheck = 0;

    this.playerList = {};

    //Start the physics
    game.physics.startSystem(Phaser.Physics.ARCADE);

    // Player Initialization has moved to addNewPlayer

    // Dots
    this.dotGroup = game.add.group();

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
    // DONT FORGET THE TEXTURE setCircle expects a radius sized relative to the sprite's texture (i.e. the original image file)
    // Since our circle is 400x400 px, the radius given to setCircle should be 200

    mainGameState.playerList[id].body.setCircle(200);
    // --- End Player Initialization ---
};

mainGameState.update = function () {
    this.movePlayer();
    this.growCircle();

    if (1000 < game.time.now - this.timeCheck) {
        // allow dropDotFn to run
        this.dropDotFn();
    }
};

mainGameState.growCircle = function () {
    // Ensure that we have a valid player, then grow if below max size
    if (myPlayerID >= 0) {
        var player = this.playerList[myPlayerID];
        if (player.width < MAX_SIZE) {
            player.width += GROWTH_RATE;
            player.height += GROWTH_RATE;
        } else {
            player.width = MAX_SIZE;
            player.height = MAX_SIZE;
        }
    }
};

mainGameState.dropDotFn = function () {
    // Ensure that we have a valid player, then drop the dots!
    if (myPlayerID >= 0) {
        var player = this.playerList[myPlayerID];
        if (
            this.dotButton.dropDot.isDown &&
            player.width > MAX_SIZE_TO_DROP
        ) {
            player.width = player.width - MAX_SIZE_TO_DROP;
            player.height = player.height - MAX_SIZE_TO_DROP;
            this.timeCheck = game.time.now;

            // Drop a dot and add it to the group
            var newdot = game.add.sprite(player.x, player.y, 'player', 0, this.dotGroup);
            newdot.width = newdot.height = DOT_SIZE;
            newdot.anchor.setTo(0.5, 0.5);
            newdot.tint = player.tint;
        }
    }
};

//This function is intended to be able to move our circle.
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
    console.log(player);

    // Update its local position
    if (player != null) {
        player.x = x;
        player.y = y;
    }
}

mainGameState.setID = function (id) {
    myPlayerID = id;
}

mainGameState.removePlayer = function (id) {
    this.playerList[id].destroy();
    delete this.playerList[id];
};

mainGameState.render = function () {
    //game.debug.body(this.player);
}

game.state.add("Game", mainGameState);
game.state.start("Game");
