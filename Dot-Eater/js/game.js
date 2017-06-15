// Client File

// Game File

const DOT_SIZE = 10;

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

mainGameState.init = function () {
    game.stage.disableVisibilityChange = true;
    this.timeCheck = 0;
};

mainGameState.preload = function () {
    game.load.image('player', 'assets/sprites/circle.png');
}

mainGameState.create = function () {
    game.renderer.renderSession.roundPixels = true;

    //When new player enters the game the server generates a random hex color according to this formula. This hex color is then linked to the new player object and applied as its color once said player enters the game. This same hex is also applied to the players dots.
    var rhexString = Math.floor(Math.random() * 256).toString(16);
    var ghexString = Math.floor(Math.random() * 256).toString(16);
    var bhexString = Math.floor(Math.random() * 256).toString(16);

    this.hexColor = ("0x" + rhexString + ghexString + bhexString);
    console.log(this.hexColor);

    //Start the physics
    game.physics.startSystem(Phaser.Physics.ARCADE);

    // --- Player Initialization ---
    this.player = game.add.sprite(game.width / 2, game.height / 2, 'player');
    this.player.anchor.setTo(0.5, 0.5);
    this.player.width = this.player.height = 50;
    this.player.tint = this.hexColor;
    this.player.smoothed = false;
    this.player.alpha = 0.85;
    game.physics.arcade.enable(this.player);
    // DONT FORGET THE TEXTURE setCircle expects a radius sized relative to the sprite's texture (i.e. the original image file)
    // Since our circle is 400x400 px, the radius given to setCircle should be 200

    this.player.body.setCircle(200);
    // --- End Player Initialization ---

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

mainGameState.update = function () {
    this.moveCircle();
    this.growCircle();

    if (1000 < game.time.now - this.timeCheck) {
        // allow dropDotFn to run
        this.dropDotFn();
    }
};

mainGameState.growCircle = function () {
    if (this.player.width < 400) {
        this.player.width += 01;
        this.player.height += 01;
    } else {
        this.player.width = 400;
        this.player.height = 400;
    }
};

mainGameState.dropDotFn = function () {
    if (
        this.dotButton.dropDot.isDown &&
        this.player.width > 40
    ) {
        this.player.width = this.player.width - 75;
        this.player.height = this.player.height - 75;
        this.timeCheck = game.time.now;

        // Drop a dot and add it to the group
        var newdot = game.add.sprite(this.player.x, this.player.y, 'player', 0, this.dotGroup);
        newdot.width = newdot.height = DOT_SIZE;
        newdot.anchor.setTo(0.5, 0.5);
        newdot.tint = this.hexColor;
    }
};

//This function is intended to be able to move our circle.
mainGameState.moveCircle = function () {
    // TODO: Fix diagonal too-fast-ness
    if (this.cursor.right.isDown || this.wasd.right.isDown) {
        this.player.position.x += 7;
    } else if (this.cursor.left.isDown || this.wasd.left.isDown) {
        this.player.position.x += -7;
    }

    if (this.cursor.up.isDown || this.wasd.up.isDown) {
        this.player.position.y += -7;
    } else if (this.cursor.down.isDown || this.wasd.down.isDown) {
        this.player.position.y += 7;
    }
};

mainGameState.render = function () {
    //game.debug.body(this.player);
}

game.state.add("Game", mainGameState);
game.state.start("Game");

// Server File
