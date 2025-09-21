class Character extends MovebaleObject {
  width = 150;
  height = 325;
  y = 110;
  offset = {
    LEFT: 50,
    RIGHT: 50,
    UP: 140 + 45,
    DOWN: 5
  };
  baseY = this.y;
  speed = 7;
  lastMove = new Date().getTime();
  bottleBag = 0;
  coins = 0;
  energy = 100;
  damage = 100;
  walkingSound = new Audio("./assets/audio/walk.mp3");
  jumpingSound = new Audio("./assets/audio/jump.mp3");
  hurtSound = new Audio("./assets/audio/hurt.mp3");
  deathSound = new Audio("./assets/audio/death.mp3");
  snoreSound = new Audio("./assets/audio/snores.mp3");
  stompSound = new Audio("./assets/audio/roar.mp3");

  IMAGES_IDLE = [
    "./assets/img/2_character_pepe/1_idle/idle/I-1.png",
    "./assets/img/2_character_pepe/1_idle/idle/I-2.png",
    "./assets/img/2_character_pepe/1_idle/idle/I-3.png",
    "./assets/img/2_character_pepe/1_idle/idle/I-4.png",
    "./assets/img/2_character_pepe/1_idle/idle/I-5.png",
    "./assets/img/2_character_pepe/1_idle/idle/I-6.png",
    "./assets/img/2_character_pepe/1_idle/idle/I-7.png",
    "./assets/img/2_character_pepe/1_idle/idle/I-8.png",
    "./assets/img/2_character_pepe/1_idle/idle/I-9.png",
    "./assets/img/2_character_pepe/1_idle/idle/I-10.png",
  ];

  IMAGES_LONG_IDLE = [
    "./assets/img/2_character_pepe/1_idle/long_idle/I-11.png",
    "./assets/img/2_character_pepe/1_idle/long_idle/I-12.png",
    "./assets/img/2_character_pepe/1_idle/long_idle/I-13.png",
    "./assets/img/2_character_pepe/1_idle/long_idle/I-14.png",
    "./assets/img/2_character_pepe/1_idle/long_idle/I-15.png",
    "./assets/img/2_character_pepe/1_idle/long_idle/I-16.png",
    "./assets/img/2_character_pepe/1_idle/long_idle/I-17.png",
    "./assets/img/2_character_pepe/1_idle/long_idle/I-18.png",
    "./assets/img/2_character_pepe/1_idle/long_idle/I-19.png",
    "./assets/img/2_character_pepe/1_idle/long_idle/I-20.png",
  ];

  IMAGES_WALKING = [
    "./assets/img/2_character_pepe/2_walk/W-21.png",
    "./assets/img/2_character_pepe/2_walk/W-22.png",
    "./assets/img/2_character_pepe/2_walk/W-23.png",
    "./assets/img/2_character_pepe/2_walk/W-24.png",
    "./assets/img/2_character_pepe/2_walk/W-25.png",
    "./assets/img/2_character_pepe/2_walk/W-26.png",
  ];

  IMAGES_JUMPING = [
    "./assets/img/2_character_pepe/3_jump/J-31.png",
    "./assets/img/2_character_pepe/3_jump/J-32.png",
    "./assets/img/2_character_pepe/3_jump/J-33.png",
    "./assets/img/2_character_pepe/3_jump/J-34.png",
    "./assets/img/2_character_pepe/3_jump/J-35.png",
    "./assets/img/2_character_pepe/3_jump/J-36.png",
    "./assets/img/2_character_pepe/3_jump/J-37.png",
    "./assets/img/2_character_pepe/3_jump/J-38.png",
    "./assets/img/2_character_pepe/3_jump/J-39.png",
  ];

  IMAGES_HURT = [
    "./assets/img/2_character_pepe/4_hurt/H-41.png",
    "./assets/img/2_character_pepe/4_hurt/H-42.png",
    "./assets/img/2_character_pepe/4_hurt/H-43.png",
  ];

  IMAGES_DEAD = [
    "./assets/img/2_character_pepe/5_dead/D-51.png",
    "./assets/img/2_character_pepe/5_dead/D-52.png",
    "./assets/img/2_character_pepe/5_dead/D-53.png",
    "./assets/img/2_character_pepe/5_dead/D-54.png",
    "./assets/img/2_character_pepe/5_dead/D-55.png",
    "./assets/img/2_character_pepe/5_dead/D-56.png",
    "./assets/img/2_character_pepe/5_dead/D-57.png",
  ];

  constructor() {
    super().loadImage("./assets/img/2_character_pepe/2_walk/W-21.png");
    this.loadImages(this.IMAGES_IDLE);
    this.loadImages(this.IMAGES_LONG_IDLE);
    this.loadImages(this.IMAGES_WALKING);
    this.loadImages(this.IMAGES_JUMPING);
    this.loadImages(this.IMAGES_HURT);
    this.loadImages(this.IMAGES_DEAD);
    this.animate();
    this.applayGravity();
    this.initializeAudio();
    this.walkingSound.loop = true;
    this.walkingSound.volume = 1.0;
  }

  /**
   * Main animation loop that handles character movement and animation.
   * It calls movement and animation functions based on conditions.
   */
  animate() {
    this.handleMovement();
    this.handleAnimations();
  }

  /**
   * Handles the movement of the character, including walking, jumping, and interaction.
   * It is called every frame to update the character's position.
   */
  handleMovement() {
    setInterval(() => {
      this.walkingSound.playbackRate = 1.5;
      this.walkingSound.volume = 1.0;

      if (!this.isDead()) {
        this.handleDirection();
        this.handleJump();
        this.handleInteraction();
        this.updateCameraPosition();
      }
    }, 1000 / 60);
  }

  /**
   * Handles the character's movement direction (left or right).
   * It checks the keyboard input and moves the character accordingly.
   */
  handleDirection() {
    const movingRight = this.canMoveRigth();
    const movingLeft = this.canMoveLeft();

    if (movingRight) this.handleMoveRight();
    if (movingLeft) this.handleMoveLeft();

    if (movingRight || movingLeft) this.startWalkingSound();
    else this.stopWalkingSound();
  }

  /**
   * Checks if the character can move to the right based on the keyboard input and the level's boundaries.
   * @returns {boolean} - Returns true if the character can move right, false otherwise.
   */
  canMoveRigth() {
    return this.world.keyboard.RIGHT && this.x < this.world.level.levelEndX;
  }

  /**
   * Checks if the character can move to the left based on the keyboard input and the level's boundaries.
   * @returns {boolean} - Returns true if the character can move left, false otherwise.
   */
  canMoveLeft() {
    return this.world.keyboard.LEFT && this.x > -100;
  }

  /**
   * Moves the character to the right.
   */
  handleMoveRight() {
    this.walkRight(this.speed);
    this.otherDirection = false;
    this.lastMove = new Date().getTime();
  }

  /**
   * Moves the character to the left.
   */
  handleMoveLeft() {
    this.walkLeft(this.speed);
    this.otherDirection = true;
    this.lastMove = new Date().getTime();
  }

  /**
   * Handles the character's jumping logic.
   * The character can only jump if they are not currently in the air.
   */
  handleJump() {
    if (this.world.keyboard.UP && !this.isAboveGround()) {
      this.jump(110);
      this.playJumpAudio();
      this.lastMove = new Date().getTime();
    } else if (this.gravity == 0) {
      this.jumpingSound.pause();
    }
  }

  /**
   * Plays the jumping sound effect.
   */
  playJumpAudio() {
    this.jumpingSound.currentTime = 1.0;
    this.safePlay(this.jumpingSound);
  }

  /**
   * Handles interactions when certain conditions are met.
   * For example, plays a sound when interacting with a chicken.
   */
  handleInteraction() {
    if (this.world.firstInteraction) {
      this.world.level.enemies[0].chickenSound.play();
    }
  }

  /**
   * Updates the camera position to follow the character.
   */
  updateCameraPosition() {
    let maxCameraX = this.world.level.levelEndX - this.world.canvas.width + 100;
    let cameraOffset = -this.x + 100;
    this.world.camera_x = Math.max(-maxCameraX, Math.min(60, cameraOffset));
  }

  /**
   * Starts the animation logic.
  */
  handleAnimations() {
    setInterval(() => this.applyAnimationForState(), 100);
  }

  /**
  * Determines the current animation state of the character.
  * @returns {"dead"|"hurt"|"jump"|"walk"|"idle"} The current animation state.
  */
  getAnimationState() {
    if (this.isDead()) return "dead";
    if (this.allowedToAnimateHurt()) return "hurt";
    if (this.isAboveGround()) return "jump";
    if (this.allowedToAnimateWalking()) return "walk";
    return "idle";
  }

  /** Executes the appropriate animation based on the current state.*/
  applyAnimationForState() {
    switch (this.getAnimationState()) {
      case "dead": this.playDeathAnimation(); this.playDeathAudio(); this.stopSnoring(); break;
      case "hurt": this.playHurtAnimation(); this.stopSnoring(); break;
      case "jump": this.playAnimation(this.IMAGES_JUMPING); this.stopSnoring(); break;
      case "walk": this.playAnimation(this.IMAGES_WALKING); this.stopSnoring(); break;
      default: this.playIdleAnimation();
    }
  }

  /**
   * Checks if the character is allowed to animate the walking state.
   * @returns {boolean} - Returns true if the character is allowed to animate walking, false otherwise.
   */
  allowedToAnimateWalking() {
    return (
      (this.world.keyboard.RIGHT || this.world.keyboard.LEFT) &&
      !this.isHurt() &&
      !this.isDead()
    );
  }

  /**
   * Checks if the character is allowed to animate the hurt state.
   * @returns {boolean} - Returns true if the character is allowed to animate hurt, false otherwise.
   */
  allowedToAnimateHurt() {
    return this.isHurt() && !this.hasKilled;
  }

  /** Plays the hurt animation when the character gets hurt. */
  playHurtAnimation() {
    this.playAnimation(this.IMAGES_HURT);
    if (!this.hasPlayedAudio) {
      this.playHurtAudio();
    }
  }

  /** Plays the hurt sound effect. */
  playHurtAudio() {
    this.hurtSound.pause();
    this.safePlay(this.hurtSound);
    this.hasPlayedAudio = true;
  }

  /** Plays the idle animation. The character may play a long idle animation if they are tired. */
  playIdleAnimation() {
    if (this.world.keyboard.THROW) {
      this.slowAnimation(this.IMAGES_IDLE);
      this.lastMove = new Date().getTime();
      this.stopSnoring();
    } else if (this.getTired()) {
      this.slowAnimation(this.IMAGES_LONG_IDLE);
      this.startSnoring();
    } else {
      this.slowAnimation(this.IMAGES_IDLE);
      this.stopSnoring();
    }
  }

  /** Plays the death animation when the character dies. */
  playDeathAnimation() {
    this.y += 20;
    this.playAnimation(this.IMAGES_DEAD);
  }

  /** Plays the death sound effect.*/
  playDeathAudio() {
    this.safePlay(this.deathSound);
  }

  /**
   * Checks if the character is tired based on the time passed since the last movement.
   * @returns {boolean} - Returns true if the character is tired, false otherwise.
   */
  getTired() {
    let timepassed = new Date().getTime() - this.lastMove;
    timepassed = timepassed / 1000;
    return timepassed > 4;
  }

  /**
   * Collects an item, such as a bottle or coin.
   * @param {Object} item - The item to be collected.
   */
  collect(item) {
    if (item instanceof Bottle) this.bottleBag++;
    if (item instanceof Coin) this.coins++;
  }

  /** Initializes custom character audio clips. */
  initializeAudio() {
    this.snoreSound.loop = true;
    this.snoreSound.volume = 0.45;
    this.stompSound.volume = 1;
  }

  /**
  * Starts the walking sound if it is not already playing.
  * Uses safePlay() to avoid promise or autoplay errors.
  */
  startWalkingSound() {
    if (this.walkingSound.paused) {
      this.safePlay(this.walkingSound);
    }
  }

  /**
   * Stops the walking sound if it is currently playing
   * and resets the playback position to the beginning.
   */
  stopWalkingSound() {
    if (!this.walkingSound.paused) {
      this.walkingSound.pause();
      this.walkingSound.currentTime = 0;
    }
  }

  /** Starts the snoring loop when the character falls asleep.*/
  startSnoring() {
    if (this.snoreSound.paused) {
      this.snoreSound.currentTime = 0;
      this.snoreSound.play();
    }
  }

  /** Stops the snoring sound if it is currently active. */
  stopSnoring() {
    if (!this.snoreSound.paused) {
      this.snoreSound.pause();
      this.snoreSound.currentTime = 0;
    }
  }

  /** Plays the stomp sound effect after defeating an enemy by jumping on it. */
  playStompSound() {
    this.stompSound.currentTime = 0;
    this.safePlay(this.stompSound);
  }

  /**
   * Stops every active character sound and resets playback positions.
   * Ensures that no character audio keeps playing after the game ends.
   */
  stopAllAudio() {
    this.stopSnoring();
    [
      this.walkingSound,
      this.jumpingSound,
      this.hurtSound,
      this.deathSound,
      this.snoreSound,
      this.stompSound,
    ].forEach((sound) => {
      sound.pause();
      sound.currentTime = 0;
    });
  }
}