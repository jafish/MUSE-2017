// Client File

// Game File

const DOT_SIZE = 10;
const UP_ARROW = 0;
const RIGHT_ARROW = 1;
const DOWN_ARROW = 2;
const LEFT_ARROW = 3;

var MOVEMENT = 7;

var myPlayerID = -1;

var mydotIDs = 0;
var otherdotIDs = 0;

var score = 0;
var scoreText;

var radius = 29.5;

var flip = false;

var game = new Phaser.Game(
    1000,
    1000,
    Phaser.AUTO,
    document.getElementById("game"),
    this,
    false,
    false
);

var mainGameState = {};

mainGameState.preload = function () {
    game.load.image('player', 'assets/sprites/circle4.png');
}

mainGameState.create = function () {
    game.renderer.renderSession.roundPixels = true;
    game.stage.disableVisibilityChange = true;
    this.timeCheck = 0;

    this.playerList = {};

    this.myDotObjects = {};

    this.myDotGroup = game.add.group();

    this.otherDotObjects = {};
    this.otherDotGroup = game.add.group();
    this.otherDotGroup.enableBody = true;
    this.otherDotGroup.physicsBodyType = Phaser.Physics.ARCADE;

    //Start the physics
    game.physics.startSystem(Phaser.Physics.ARCADE);

    // Player Initialization has moved to addNewPlayer

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

    scoreText = game.add.text(16, 16, 'score: 0', {
        fontSize: '32px',
        fill: '#000'
    });

    Client.askNewPlayer();
};

mainGameState.addNewPlayer = function (id, color, size, x, y) {
    // --- Player Initialization ---
    mainGameState.playerList[id] = game.add.sprite(x, y, 'player');
    mainGameState.playerList[id].anchor.setTo(.5, .5);
    mainGameState.playerList[id].width = mainGameState.playerList[id].height = size;
    mainGameState.playerList[id].tint = color;
    mainGameState.playerList[id].smoothed = false;
    mainGameState.playerList[id].alpha = 0.85;
    game.physics.arcade.enable(mainGameState.playerList[id]);
    // DONT FORGET THE TEXTURE setCircle expects a radius sized relative to the sprite's texture (i.e. the original image file)
    // Since our circle is 400x400 px, the radius given to setCircle should be 200

    mainGameState.playerList[id].body.setCircle(radius);

    // --- End Player Initialization ---
};

mainGameState.update = function () {
    scoreText.text = 'Score: ' + score;

    if (myPlayerID > -1) {
        // if (flip) {
        game.physics.arcade.overlap(this.playerList[myPlayerID], this.otherDotGroup, this.eatDot);

    }
    // } else if (!game.physics.arcade.overlap(this.playerList[myPlayerID], this.otherDotGroup)) {
    //  flip = true;
    // }


    this.movePlayer();
    this.growCircle();

    if (750 < game.time.now - this.timeCheck) {
        // allow dropDotFn to run
        this.shrinkDotFn();
    }
};

mainGameState.growCircle = function () {
    if (myPlayerID >= 0) {
        var player = this.playerList[myPlayerID];
        if (player.width < 400) {
            player.width += .25;
            player.height += .25;
            Client.updateSize(player.width);
        } else {
            player.width = 400;
            player.height = 400;
        }
    };
};

mainGameState.updateOtherSizes = function (id, size) {
    var player = this.playerList[id];
    if (player != null) {
        player.width = player.height = size;
    }
};

mainGameState.shrinkDotFn = function () {
    if (myPlayerID >= 0) {
        var player = this.playerList[myPlayerID];
        var playercolor = player.tint;
        if (player.width <= 60) {
            player.width = 60
            player.height = 60;
        }
        if (
            this.dotButton.dropDot.isDown &&
            player.width > 60
        ) {

            //Shrink Player
            player.width = player.width - 20;
            player.height = player.height - 20;
            this.timeCheck = game.time.now;
            Client.shrinkPlayer(player.width);


            //Spawn Dot

            this.myDotObjects[mydotIDs] = game.add.sprite(player.x, player.y, 'player');
            if (this.myDotObjects[mydotIDs]) {
                this.myDotObjects[mydotIDs].anchor.setTo(0.5, 0.5);
                this.myDotObjects[mydotIDs].width = this.myDotObjects[mydotIDs].height = 25;
                this.myDotObjects[mydotIDs].tint = playercolor;
                this.myDotObjects[mydotIDs].smoothed = false;
                game.physics.arcade.enable(this.myDotObjects[mydotIDs]);
                this.myDotObjects[mydotIDs].body.setCircle(radius);
                this.myDotGroup.add(this.myDotObjects[mydotIDs]);
                console.log(this.myDotGroup.children);
                Client.sentDotLocation({
                    x: this.myDotGroup.children[this.myDotGroup.children.length - 1].x,
                    y: this.myDotGroup.children[this.myDotGroup.children.length - 1].y,
                    color: playercolor
                });
                mydotIDs++;
            };
        };

    };
};

mainGameState.spawnOtherDots = function (x, y, color) {
    this.otherDotObjects[otherdotIDs] = game.add.sprite(x, y, 'player');
    this.otherDotObjects[otherdotIDs].anchor.setTo(0.5, 0.5);
    this.otherDotObjects[otherdotIDs].width = this.otherDotObjects[otherdotIDs].height = 25;
    this.otherDotObjects[otherdotIDs].tint = color;
    this.otherDotObjects[otherdotIDs].smoothed = false;
    game.physics.arcade.enable(this.otherDotObjects[otherdotIDs]);
    this.otherDotObjects[otherdotIDs].body.setCircle(radius);
    this.otherDotGroup.add(this.otherDotObjects[otherdotIDs]);
    otherdotIDs++;
};

mainGameState.eatDot = function (player, dot) {
    Client.eatDot({
        x: dot.x,
        y: dot.y,
        color: dot.tint
    });
    flip = true;
};

//This function removes a dot when a player grabs it
mainGameState.removeDot = function (x, y, color) {
    if (this.playerList[myPlayerID].tint == color) {
        console.log("the collected dot matches my color");
        n = 0;
        for (i = this.myDotGroup.children.length - 1; i >= 0; i--) {
            if (this.myDotGroup.children[i]) {
                if (this.myDotGroup.children[i].x == x && this.myDotGroup.children[i].y == y && this.myDotGroup.children[i].tint == color) {

                    // this.myDotGroup.children[i].destroy();

                    console.log("array before " + this.myDotGroup.children);
                    this.myDotGroup.children[i].destroy();
                    //this.myDotGroup.children.splice(this.myDotGroup.children.length - n, 1);
                    console.log("array after " + this.myDotGroup.children);
                } else {
                    n++
                }
            };
        };

    } else {

        var n = 1;
        for (i = this.otherDotGroup.children.length - 1; i >= 0; i--) {
            if (this.otherDotGroup.children[i]) {
                if (this.otherDotGroup.children[i].x == x && this.otherDotGroup.children[i].y == y && this.otherDotGroup.children[i].tint == color) {
                    //this.otherDotGroup.children[this.otherDotGroup.children.length - n].destroy();
                    console.log("other array before " + this.otherDotGroup.children);

                    this.otherDotGroup.children[i].destroy();
                    //this.otherDotGroup.children.splice(this.otherDotGroup.children.length - n, 1)

                    console.log("other array after " + this.otherDotGroup.children);
                    if (flip) {
                        score++
                        flip = false;
                    }
                } else {
                    n++
                }
            };

        };
    }
};


//This function is intended to be able to move our circle.
mainGameState.movePlayer = function () {

    // If the id is not received by the client, then do nothing
    if (myPlayerID >= 0) {
        var player = this.playerList[myPlayerID];
        var moved = false;
        var speed = 480 / player.width;

        game.world.wrap(player, 0, true);

        if (this.cursor.right.isDown || this.wasd.right.isDown) {
            player.x += speed;
            moved = true;
        } else if (this.cursor.left.isDown || this.wasd.left.isDown) {
            player.x -= speed;
            moved = true;
        }

        if (this.cursor.up.isDown || this.wasd.up.isDown) {
            player.y -= speed;
            moved = true;
        } else if (this.cursor.down.isDown || this.wasd.down.isDown) {
            player.y += speed;
            moved = true;
        }

        if (moved) {
            // Send the id and position of the player
            Client.updatePosition({
                x: player.x,
                y: player.y,
                size: player.width
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
}

mainGameState.setID = function (id) {
    myPlayerID = id;
}

//When receiving data of dot ot be received the group will be looped through finding the matching dot. then that dot will be destroyed

mainGameState.removePlayer = function (id) {
    this.playerList[id].destroy();
    delete this.playerList[id];
};


mainGameState.removeDots = function (color) {
    var n = 1;
    for (i = this.otherDotGroup.children.length - 1; i >= 0; i--) {
        if (this.otherDotGroup.children[i]) {
            if (this.otherDotGroup.children[i].tint == color) {
                this.otherDotGroup.children[i].destroy();
                this.otherDotGroup.children.splice(this.otherDotGroup.children.length - n, 1);
            } else if (this.otherDotGroup.children[i].tint != color) {
                n++;
            };
        };
    };
};

mainGameState.render = function () {
    //    if (myPlayerID > -1) {
    //        var player = this.playerList[myPlayerID];
    //        game.debug.body(player);
    //    };
};

game.state.add("Game", mainGameState);
game.state.start("Game");

// Server File