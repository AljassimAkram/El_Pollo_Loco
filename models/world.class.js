class World {
    character = new Character();
    level = level1;
    ctx;
    canvas;
    keyboard;
    camera_x = 0;
    firstInteraction = false;
    healthbar = new Healthbar();
    bottelbar = new Bottelbar();
    endbossbar = new EndbossBar();
    coinbar = new Coinbar();
    statusMsg = new GameStatusMsg();
    characterSounds = [];
    statusSounds = [];
    soundManager;
    statusManager;

    /**
     * Creates an instance of the World class.
     * @param {HTMLCanvasElement} canvas - Canvas where the game is drawn.
     * @param {Keyboard} keyboard - Keyboard input handler.
    */
    constructor(canvas, keyboard) {
        this.ctx = canvas.getContext("2d");
        this.canvas = canvas;
        this.keyboard = keyboard;
        this.initAudio();
        this.initManagers();
        this.startGame();
    }

    /**
     * Initializes all game audio (clips, volumes, sound lists).
     */
    initAudio() {
        this.victorySound = new Audio("./assets/audio/win.mp3");
        this.defeatSound = new Audio("./assets/audio/lose.mp3");
        this.victorySound.volume = 0.5;
        this.defeatSound.volume = 0.45;
        this.characterSounds = [
            this.character.walkingSound,
            this.character.jumpingSound,
            this.character.hurtSound,
            this.character.deathSound,
            this.character.stompSound,
            this.character.snoreSound,
        ];
        this.statusSounds = [this.victorySound, this.defeatSound];
    }

    /**
     * Initializes world managers and systems.
     */
    initManagers() {
        this.soundManager = new SoundManager(this);
        this.statusManager = new GameStatusManager(this);
    }

    /**
     * Starts the game by drawing the initial game state, setting up the world, and starting the game loop.
     */
    startGame() {
        this.draw();
        this.setWorld();
        this.soundManager.playAudio();
        this.run();
    }

    /**
     * Sets up the world by associating the character and enemies with the world instance.
     */
    setWorld() {
        this.character.world = this;
        this.level.enemies.forEach((enemy) => {
            enemy.world = this;
        });
    }

    /**
     * Starts the main game loop with periodic checks and updates.
     */
    run() {
        setInterval(() => {
            this.checkCollisions();
            this.checkThrowObjects();
            this.addNewBottels();
            this.statusManager.handleGameStatus();
            this.soundManager.checkMuteStatus();
        }, 1000 / 8);
    }

    /**
     * Adds new throwable bottles if the character has no bottles left.
     */
    addNewBottels() {
        if (
            this.level.throwableObjects.length === 0 &&
            this.character.bottleBag === 0
        ) {
            for (let i = 0; i <= 5; i++) {
                this.level.throwableObjects.push(new Bottle());
            }
        }
    }

    /**
     * Checks if the player is attempting to throw an object and processes the action.
     */
    checkThrowObjects() {
        if (this.keyboard.THROW) {
            if (this.checkThrowAllowed()) {
                let offsetX = this.character.otherDirection ? -20 : 130;
                let bottle = new ThrowableObject(
                    this.character.x + offsetX,
                    this.character.y + 30,
                    this.character.otherDirection
                );
                this.bottelbar.setPercentage(this.character.bottleBag - 1);
                this.character.bottleBag--;
                this.level.throwableObjects.push(bottle);
                this.removeObject(bottle);
            }
        }
    }

    /**
     * Verifies if throwing a bottle is allowed (there are bottles available and no other thrown objects).
     * @returns {boolean} True if throwing is allowed, false otherwise.
     */
    checkThrowAllowed() {
        return (
            this.character.bottleBag > 0 &&
            this.level.throwableObjects.every((element) => !(element instanceof ThrowableObject))
        );
    }

    /**
     * Periodically checks for collisions between the character, enemies, throwable objects, coins, and the endboss.
     */
    checkCollisions() {
        setInterval(() => {
            this.checkEnemyCollisions();
            this.checkThrowableObjectCollisions();
            this.checkCoinCollisions();
            this.checkEndbossCollisions();
        }, 1000 / 100);
    }

    /**
     * Checks for collisions between the character and enemies.
     */
    checkEnemyCollisions() {
        this.level.enemies.forEach((enemy) => {
            if (this.character.isColliding(enemy)) { this.handleCollision(enemy); }
        });
    }

    /**
     * Handles the collision between the character and an enemy.
     * @param {Enemy} enemy - The enemy that the character collides with.
     */
    handleCollision(enemy) {
        if (this.character.gravity < 0 && enemy instanceof Endboss)
            this.handleJumpOnEndboss(enemy);
        else if (this.isFallingOnEnemy(enemy))
            this.handleFallingOnEnemy(enemy);
        else this.handleDamageFromEnemy(enemy);
    }

    /**
    * Handles the case when the character jumps on the endboss, dealing only minor damage.
    * @param {Endboss} enemy - The endboss that is being jumped on.
    */
    handleJumpOnEndboss(enemy) {
        this.character.hasKilled = false;
        this.character.gravity = this.character.force;
    }

    /**
     * Determines if the character is falling on an enemy.
     * @param {Enemy} enemy - The enemy being checked.
     * @returns {boolean} True if the character is falling on the enemy, false otherwise.
     */
    isFallingOnEnemy(enemy) {
        return this.character.gravity < 0;
    }

    /**
     * Handles the case when the character falls on an enemy, dealing damage to the enemy.
     * @param {Enemy} enemy - The enemy that is being fallen on.
     */
    handleFallingOnEnemy(enemy) {
        enemy.hit(this.character.damage);
        this.character.playStompSound();
        if (enemy.isDead()) this.character.hasKilled = true;
    }

    /**
     * Handles the case when the character takes damage from an enemy.
     * @param {Enemy} enemy - The enemy dealing damage to the character.
    */
    handleDamageFromEnemy(enemy) {
        if (!enemy.isDead()) {
            let damage = enemy instanceof Endboss ? 10 : enemy.damage;
            this.character.hit(damage);
            this.healthbar.setPercentage(this.character.energy);
            this.character.hasKilled = false;
        }
    }

    /**
     * Checks for collisions between the character and throwable objects (e.g., bottles).
    */
    checkThrowableObjectCollisions() {
        this.level.throwableObjects.forEach((bottle, i) => {
            if (this.character.isColliding(bottle)) {
                this.level.throwableObjects.splice(i, 1);
                this.character.collect(bottle);
                this.bottelbar.setPercentage(this.character.bottleBag);
            }
        });
    }

    /**
     * Checks for collisions between the character and coins.
     */
    checkCoinCollisions() {
        this.level.coins.forEach((coin, i) => {
            if (this.character.isColliding(coin)) {
                this.level.coins.splice(i, 1);
                this.character.collect(coin);
            }
        });
    }

    /**
     * Checks for collisions between throwable objects and enemies.
     * Calls the appropriate handler if a collision occurs.
    */
    checkEndbossCollisions() {
        this.level.throwableObjects.forEach((bottle) => {
            this.level.enemies.forEach((enemy) => {
                if (bottle instanceof ThrowableObject && enemy.isColliding(bottle)) {
                    this.handleBottleHitEnemy(bottle, enemy);
                }
            });
        });
    }

    /**
     * Handles the logic when a bottle collides with an enemy.
     * Updates energy, triggers death/animations, and adjusts the endboss bar.
     * @param {ThrowableObject} bottle - The thrown bottle object.
     * @param {Enemy|Endboss} enemy - The enemy that was hit.
     */
    handleBottleHitEnemy(bottle, enemy) {
        bottle.hit(bottle.damage);
        if (enemy instanceof Endboss) {
            enemy.hit(bottle.damage);
            this.endbossbar.setPercentage(enemy.energy);
        } else {
            enemy.hit(bottle.damage);
            if (enemy.isDead()) enemy.handleDeath();
        }
    }

    /**
     * Draws the game world, including the background, enemies, character, and status bars.
     */
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.translate(this.camera_x, 0);
        this.addAllElements();
        this.ctx.translate(-this.camera_x, 0);
        this.drawStatusBars();
        this.addToMap(this.statusMsg);
        this.ctx.translate(this.camera_x, 0);
        this.ctx.translate(-this.camera_x, 0);
        requestAnimationFrame(() => this.draw());
    }

    /** Plays the victory jingle when the player defeats the Endboss. */
    playVictorySound() {
        this.soundManager.stopAudio();
        this.defeatSound.pause();
        this.victorySound.currentTime = 0;
        this.victorySound.play();
    }

    /** Plays the defeat jingle when the player loses the game. */
    playDefeatSound() {
        this.soundManager.stopAudio();
        this.victorySound.pause();
        this.defeatSound.currentTime = 0;
        this.defeatSound.play();
    }

    /** Adds all game elements (background, clouds, enemies, etc.) to the canvas. */
    addAllElements() {
        this.addObjectsToMap(this.level.backgroundObjects);
        this.addToMap(this.level.clouds);
        this.addObjectsToMap(this.level.throwableObjects);
        this.addObjectsToMap(this.level.coins);
        this.addObjectsToMap(this.level.enemies);
        this.addToMap(this.character);
    }

    /** Draws the status bars (health, bottles, coins, etc.) on the canvas. */
    drawStatusBars() {
        this.addToMap(this.healthbar);
        this.addToMap(this.bottelbar);
        let endboss = this.level.enemies.find((enemy) => enemy instanceof Endboss);
        if (endboss && endboss.isOnScreen()) this.addToMap(this.endbossbar);
        this.addToMap(this.coinbar);
        this.addCoinCount();
    }

    /** Draws the current coin count on the canvas. */
    addCoinCount() {
        this.ctx.font = "24px 'Boogaloo', sans-serif";
        this.ctx.fillStyle = "white";
        this.ctx.fillText(
            this.character.coins,
            this.coinbar.width,
            this.coinbar.y + 32
        );
    }

    /**
     * Adds a list of objects to the game world.
     * @param {Array} objects - An array of objects to be added to the world.
     */
    addObjectsToMap(objects) {
        objects.forEach((object) => this.addToMap(object));
    }

    /**
     * Adds a single object to the game world.
     * @param {Object} mo - The object to be added to the world.
     */
    addToMap(mo) {
        if (mo) {
            if (mo.otherDirection) {
                this.flipImage(mo);
            }
            mo.draw(this.ctx);
            if (mo.otherDirection) {
                this.resetflipImage(mo);
            }
        } else return;
    }

    /**
     * Flips an image horizontally to simulate a character facing the other direction.
     * @param {Object} mo - The object whose image will be flipped.
     */
    flipImage(mo) {
        this.ctx.save();
        this.ctx.translate(mo.width, 0);
        this.ctx.scale(-1, 1);
        mo.x = mo.x * -1;
    }

    /**
     * Resets the image flip to the original state after drawing.
     * @param {Object} mo - The object whose image flip will be reset.
     */
    resetflipImage(mo) {
        this.ctx.restore();
        mo.x = mo.x * -1;
    }

    /**
     * Removes an object (e.g., a bottle) from the world when it goes off-screen or is no longer needed.
     * @param {Object} object - The object to be removed from the world.
     */
    removeObject(object) {
        setInterval(() => {
            if (object.y > 380) {
                object.hit(object.damage);
                this.level.throwableObjects =
                    this.level.throwableObjects.filter((obj) => obj !== object);
            }
        }, 1000 / 60);
        setInterval(() => {
            if (object.isDead()) {
                object.hit(object.damage);
                this.level.throwableObjects =
                    this.level.throwableObjects.filter((obj) => obj !== object);
            }
        }, 1500);
    }
}
