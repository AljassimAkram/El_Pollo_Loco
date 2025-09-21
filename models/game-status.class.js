class GameStatusManager {
    /**
     * Creates an instance of GameStatusManager.
     * @param {World} world - The current game world instance.
     */
    constructor(world) {
        this.world = world;
        this.victorySoundPlayed = false;
        this.defeatSoundPlayed = false;
    }

    /**
     * Checks if the player has won the game.
     * A win occurs when the Endboss is dead.
     * @returns {boolean} True if the Endboss is dead, otherwise false.
     */
    checkWin() {
        return this.world.level.enemies.some(
            element => element instanceof Endboss && element.isDead()
        );
    }

    /**
     * Checks if the game is over.
     * A game over occurs when the character is dead.
     * @returns {boolean} True if the character is dead, otherwise false.
     */
    checkGameOver() {
        return this.world.character.isDead();
    }

    /**
  * Handles the overall game status by checking
  * for game over or victory conditions.
  */
    handleGameStatus() {
        if (this.checkGameOver()) this.handleGameOver();
        else if (this.checkWin()) this.handleVictory();
    }

    /**
     * Handles the game over state:
     * plays defeat sound, shows message, and stops the game.
     */
    handleGameOver() {
        if (!this.defeatSoundPlayed) {
            this.world.playDefeatSound();
            this.defeatSoundPlayed = true;
        }
        this.world.statusMsg.showDefeat();
        this.stopGame(760);
    }

    /**
     * Handles the victory state:
     * plays victory sound, shows win message, and stops the game.
     */
    handleVictory() {
        if (!this.victorySoundPlayed) {
            this.world.playVictorySound();
            this.victorySoundPlayed = true;
        }
        this.world.statusMsg.showVictory();
        this.stopGame(1160);
    }

    /**
     * Stops the game after a delay.
     * Clears all running intervals and animations and shows game menu buttons.
     * @param {number} time - The delay in milliseconds before stopping the game.
     */
    stopGame(time) {
        if (this.world && this.world.character && this.world.character.stopAllAudio) {
            this.world.character.stopAllAudio();
        }
        setTimeout(() => {
            this.clearAllIntervals();
            document.getElementById("game-btns").classList.remove("d-none");
            document.getElementById("play-btn").classList.remove("d-none");
            document.getElementById("menü-btn").classList.remove("d-none");
        }, time);
    }

    /**
     * Clears all active intervals and cancels the game animation frame.
     * This ensures that no animations or loops keep running after the game stops.
     */
    clearAllIntervals() {
        for (let i = 1; i < 9999; i++) window.clearInterval(i);
        cancelAnimationFrame(window.animationFrameId);
    }
}
