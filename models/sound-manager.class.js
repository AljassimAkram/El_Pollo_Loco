class SoundManager {
    /**
     * Creates an instance of SoundManager.
     * @param {World} world - The current game world instance.
     */
    constructor(world) {
        this.world = world;
        this.audioTimeoutId = null;
    }

    /**
     * Gets the mute status from localStorage.
     * @returns {boolean} True if muted, false otherwise.
     */
    getMuteStatus() {
        let muteStatus = localStorage.getItem("isMuted");
        return JSON.parse(muteStatus);
    }

    /**
     * Checks the current mute status and applies
     * mute or unmute accordingly.
     */
    checkMuteStatus() {
        if (this.getMuteStatus()) this.muteSound();
        else if (!this.getMuteStatus()) this.unMuteSound();
    }

    /**
  * Mutes all game sounds.
  */
    muteSound() {
        this.muteGlobalSounds();
        this.muteWorldSounds();
    }

    /**
     * Mutes global sounds such as background audio and music.
     */
    muteGlobalSounds() {
        backgroundAudio.forEach(bgAudio => bgAudio.muted = true);
        backgroundMusic.muted = true;
    }

    /**
     * Mutes all sounds that belong to world objects
     * (enemies, throwable objects, character, status).
     */
    muteWorldSounds() {
        this.world.level.enemies.forEach(enemy => {
            enemy.chickenSound.muted = true;
            if (enemy.hitSound) enemy.hitSound.muted = true;
            if (enemy.attackSound) enemy.attackSound.muted = true;
            if (enemy.roarSound) enemy.roarSound.muted = true;
        });

        this.world.level.throwableObjects.forEach(obj => {
            if (obj instanceof ThrowableObject) obj.splashSound.muted = true;
        });

        this.world.characterSounds.forEach(s => s.muted = true);
        this.world.statusSounds.forEach(s => s.muted = true);
    }

    /**
     * Unmutes all game sounds.
    */
    unMuteSound() {
        this.unMuteGlobalSounds();
        this.unMuteWorldSounds();
    }

    /**
     * Unmutes global sounds such as background audio and music.
     */
    unMuteGlobalSounds() {
        backgroundAudio.forEach(bgAudio => bgAudio.muted = false);
        backgroundMusic.muted = false;
    }

    /**
     * Unmutes all sounds that belong to world objects
     * (enemies, throwable objects, character, status).
     */
    unMuteWorldSounds() {
        this.world.level.enemies.forEach(enemy => {
            enemy.chickenSound.muted = false;
            if (enemy.hitSound) enemy.hitSound.muted = false;
            if (enemy.attackSound) enemy.attackSound.muted = false;
            if (enemy.roarSound) enemy.roarSound.muted = false;
        });
        this.world.level.throwableObjects.forEach(obj => {
            if (obj instanceof ThrowableObject) obj.splashSound.muted = false;
        });
        this.world.characterSounds.forEach(s => s.muted = false);
        this.world.statusSounds.forEach(s => s.muted = false);
    }

    /**
    * Stops all audio playback and clears scheduled background audio.
    */
    stopAudio() {
        this.clearAudioTimeout();
        this.stopGlobalSounds();
        this.stopWorldSounds();
    }

    /**
     * Stops global background audio and music.
     */
    stopGlobalSounds() {
        backgroundAudio.forEach((bgAudio) => this.resetAudioClip(bgAudio));
        this.resetAudioClip(backgroundMusic);
    }

    /**
     * Stops all sounds related to the current world.
     * Delegates character/status sounds and level sounds to helper methods.
    */
    stopWorldSounds() {
        if (!this.world) return;
        this.stopCharacterAndStatusSounds();
        if (this.world.level) {
            this.stopLevelSounds(this.world.level);
        }
    }

    /**
     * Stops all character-related and status-related sounds in the world.
     */
    stopCharacterAndStatusSounds() {
        if (!this.world) return;
        if (this.world.character) {
            this.world.character.stopSnoring();
        }
        if (this.world.characterSounds) {
            this.world.characterSounds.forEach((sound) =>
                this.resetAudioClip(sound)
            );
        }
        if (this.world.statusSounds) {
            this.world.statusSounds.forEach((sound) =>
                this.resetAudioClip(sound)
            );
        }
    }

    /**
     * Stops all sounds associated with a given level,
     * including enemies and throwable objects.
     *
     * @param {Object} level - The level containing enemies and objects.
     */
    stopLevelSounds(level) {
        if (level.enemies) {
            level.enemies.forEach((enemy) => this.resetEnemySounds(enemy));
        }
        if (level.throwableObjects) {
            level.throwableObjects.forEach((obj) => {
                if (obj instanceof ThrowableObject) {
                    this.resetAudioClip(obj.splashSound);
                }
            });
        }
    }

    /**
     * Resets a given audio clip by pausing it and rewinding to the start.
     * @param {HTMLAudioElement} audio - The audio clip to reset.
     */
    resetAudioClip(audio) {
        if (audio) {
            audio.pause();
            audio.currentTime = 0;
        }
    }

    /**
     * Stops all audio clips that belong to a specific enemy.
     * @param {Enemy} enemy - The enemy whose sounds should be stopped.
     */
    resetEnemySounds(enemy) {
        if (!enemy) return;
        this.resetAudioClip(enemy.chickenSound);
        this.resetAudioClip(enemy.hitSound);
        this.resetAudioClip(enemy.attackSound);
        this.resetAudioClip(enemy.roarSound);
    }

    /**
     * Clears the scheduled timeout for background audio playback.
     */
    clearAudioTimeout() {
        if (this.audioTimeoutId) {
            clearTimeout(this.audioTimeoutId);
            this.audioTimeoutId = null;
        }
    }

    /**
     * Plays background audio and music:
     *  Randomly selects one of the background audio tracks
     *  Sets volumes for audio and music
     *  Repeats playback at random intervals (1s–5s)
     */
    playAudio() {
        this.clearAudioTimeout();
        let randomNumber = Math.round(Math.random() * 2);
        backgroundAudio[randomNumber].volume = 0.02;
        backgroundMusic.volume = 0.04;
        backgroundAudio[randomNumber].play();
        backgroundMusic.play();
        let randomInterval = Math.floor(Math.random() * (5000 - 1000 + 1)) + 1000;
        this.audioTimeoutId = setTimeout(() => this.playAudio(), randomInterval);
    }
}
