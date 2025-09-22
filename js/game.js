let canvas;
let ctx;
let world;
let keyboard = new Keyboard();
let portrait = window.matchMedia("(orientation: portrait)").matches;
let game;
let gameActive = false;
let backgroundAudio = [
    new Audio("./assets/audio/eagle-squawking-type-1.mp3"),
    new Audio("./assets/audio/eagle-squawking-type-2.mp3"),
    new Audio("./assets/audio/eagle-squawking-type-3.mp3"),
];
let homeMusic = new Audio("./assets/audio/bg-music.mp3");
let backgroundMusic = new Audio("./assets/audio/bg-music-2.mp3");
homeMusic.loop = true;
backgroundMusic.loop = true;

/**
 * Sets up music and game status.
 */
function setupGameStatus() {
    if (world && world.soundManager) { world.soundManager.stopAudio(); }
    if (world && world.stopStatusSounds) { world.stopStatusSounds(); }
    backgroundAudio.forEach((audio) => {
        audio.pause();
        audio.currentTime = 0;
    });
    gameActive = false;
    backgroundMusic.pause();
    backgroundMusic.currentTime = 0;
    homeMusic.muted = getMuteStatus();
    homeMusic.volume = 0.2;
    homeMusic.play().catch(() => { });
    checkGameActive();
    checkMuteStatus();
}

/**
 * Sets up canvas, game elements, orientation and UI.
 */
function setupGameEnvironment() {
    canvas = document.getElementById("canvas");
    game = document.getElementById("game");

    checkOrientation(portrait);
    checkMobileMode();
    handleUIElements();

    window.addEventListener("resize", () => {
        portrait = window.innerHeight > window.innerWidth;
        checkOrientation(portrait);
    });
}

/**
 * Initializes the game by setting up both status and environment.
 */
function init() {
    setupGameStatus();
    setupGameEnvironment();
    const game = document.getElementById('game');
    if (game) game.classList.remove('playing');
}

/**
 * Shows and hides specific UI elements.
*/
function handleUIElements() {
    document.getElementById("menü-btn").classList.add("d-none");
    document.getElementById("game-overlay").classList.remove("d-none");
    document.getElementById("game-btns").classList.remove("d-none");
    document.getElementById("play-btn").classList.remove("d-none");
    document.getElementById("info-btn").classList.remove("d-none");
    document.getElementById("help-bar").classList.add("d-none");
    document.getElementById("mobile-action-btns").classList.add("d-none");
    document.getElementById("exit-btn").classList.add("d-none");
}

/**
 * Checks if the current device is considered "mobile"
 * based on a maximum screen width of 800px.
 * @returns {boolean} True if width <= 800px, false otherwise.
 */
function isMobile() {
    return window.innerWidth <= 800;
}

/**
 * Displays mobile-specific buttons and hides screen buttons if the device is mobile.
 */
function checkMobileMode() {

    if (isMobile() && gameActive) {
        document
            .getElementById("mobile-action-btns")
            .classList.remove("d-none");
        document.getElementById("screen-btns").classList.add("d-none");
    } else {
        document.getElementById("mobile-action-btns").classList.add("d-none");
        document.getElementById("screen-btns").classList.remove("d-none");
    }
}

/**
 * Initializes the game environment, hides the play button and help-bar, and starts the game.
 */
function gameInit() {
    gameActive = true;
    homeMusic.pause();
    homeMusic.currentTime = 0;
    backgroundMusic.muted = getMuteStatus();
    backgroundMusic.currentTime = 0;
    checkMobileMode();
    setLevel();
    hideUIElements();
    document.getElementById("exit-btn").classList.remove("d-none");
    world = new World(canvas, keyboard);
    const game = document.getElementById('game');
    if (game) game.classList.add('playing');
}

/**
 * Checks the current mute status and updates the visibility of mute/unmute UI elements accordingly.
 */
function checkMuteStatus() {
    if (!getMuteStatus()) {
        document.getElementById("disable-mute").classList.add("d-none");
        homeMusic.muted = false;
        backgroundMusic.muted = false;
    } else if (getMuteStatus()) {
        document.getElementById("disable-mute").classList.remove("d-none");
        document.getElementById("enable-mute").classList.add("d-none");
        homeMusic.muted = true;
        backgroundMusic.muted = true;
    }

}

/**
 * Saves the mute status in localStorage.
 *
 * @param {string} status - The status to be saved, either "enable" to mute or "disable" to unmute.
 *                          If "enable", the mute status is set to "true".
 *                          If "disable", the mute status is set to "false".
 */
function saveMuteStatus(status) {
    if (status == "enable") {
        localStorage.setItem("isMuted", "true");
        document.getElementById("enable-mute").classList.toggle("d-none");
        document.getElementById("disable-mute").classList.toggle("d-none");
        homeMusic.muted = true;
        backgroundMusic.muted = true;
    } else if (status == "disable") {
        localStorage.setItem("isMuted", "false");
        document.getElementById("enable-mute").classList.toggle("d-none");
        document.getElementById("disable-mute").classList.toggle("d-none");
        homeMusic.muted = false;
        backgroundMusic.muted = false;
    }
}

/**
 * Retrieves the mute status from localStorage and parses it to a boolean.
 * @returns {boolean} The mute status (true for muted, false for unmuted).
 */
function getMuteStatus() {
    let muteStatus = localStorage.getItem("isMuted");
    return JSON.parse(muteStatus);
}

/**
 * Exits the game by clearing intervals and reinitializing.
*/
function exitGame() {
    if (world) {
        if (world.soundManager) {
            world.soundManager.stopAudio();
        }
        if (world.statusManager) {
            world.statusManager.clearAllIntervals();
        }
    }
    const game = document.getElementById('game');
    if (game) game.classList.remove('playing');
    init();
}

/**
 * Hides UI elements related to the game setup, such as the play button, overlay, and help-bar.
 */
function hideUIElements() {
    document.getElementById("game-btns").classList.add("d-none");
    document.getElementById("game-overlay").classList.add("d-none");
    document.getElementById("canvas").classList.remove("d-none");
    document.getElementById("help-bar").classList.add("d-none");
    document.getElementById("info-btn").classList.add("d-none");
}

/**
 * Periodically checks if the game is active and shows/hides the canvas.
 */

function checkGameActive() {
    setInterval(() => {
        if (!gameActive) {
            document.getElementById("canvas").classList.add("d-none");
        } else {
            document.getElementById("canvas").classList.remove("d-none");
        }
    }, 1000 / 20);
}

/**
 * Adjusts the view based on the device orientation and width.
 * Shows the turn overlay only in portrait AND below TURN_MIN_WIDTH.
 * @param {boolean} isPortrait - True if the orientation is portrait.
 */
function checkOrientation(isPortrait) {
  portrait = isPortrait;
  const overlay = document.getElementById("turn-msg-overlay");
  const gameEl = document.getElementById("game");
  const showOverlay = portrait && isMobile();
  if (overlay) overlay.classList.toggle("hide", !showOverlay);
  if (gameEl) {
    if (!showOverlay && gameActive) {
      gameEl.classList.add("fill-viewport");
    } else {
      gameEl.classList.remove("fill-viewport");
    }
  }
  if (showOverlay && document.fullscreenElement) document.exitFullscreen().catch(() => {});
}

/**
 * Toggles the visibility of the help bar.
*/
function toggleInfo() {
    document.getElementById("help-bar").classList.toggle("d-none");
}

/**
* Toggles the visibility of the impressum overlay.
*/
function toggleImpressum() {
    document.getElementById("impressum-overlay").classList.toggle("d-none");
}

/**
 * Attempts to request fullscreen mode for the given element.
 * Supports standard, WebKit, and MS-specific implementations.
 *
 * @param {HTMLElement} game - The game element to display in fullscreen.
 * @returns {Promise<void>} A promise that resolves if fullscreen is activated,
 *                          or rejects if not supported.
 */
function requestFullscreen(game) {
    if (game.requestFullscreen) {
        return game.requestFullscreen();
    } else if (game.webkitRequestFullscreen) {
        game.webkitRequestFullscreen();
        return Promise.resolve();
    } else if (game.msRequestFullscreen) {
        game.msRequestFullscreen();
        return Promise.resolve();
    }
    return Promise.reject();
}

/**
 * Enables fullscreen mode for the game element.
 * Falls back to applying the "fill-viewport" class if fullscreen fails.
 */
function fullscreen() {
    const game = document.getElementById("game");
    if (document.fullscreenElement) return;

    requestFullscreen(game)
        .then(() => game.classList.remove("fill-viewport"))
        .catch(() => game.classList.add("fill-viewport")); // Fallback
}

/**
 * Exits fullscreen mode if it is active.
 */
function closeFullscreen() {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
    }
}

/**
 * Event listener for keydown events to set corresponding keyboard controls to true.
 * @param {KeyboardEvent} event - The keyboard event.
 */
window.addEventListener("keydown", (event) => {
    if (event.keyCode === 37) {
        keyboard.LEFT = true;
    }
    if (event.keyCode === 39) {
        keyboard.RIGHT = true;
    }
    if (event.keyCode === 38 || event.keyCode === 32) {
        keyboard.UP = true;
    }
    if (event.keyCode === 68) {
        keyboard.THROW = true;
    }
});

/**
 * Event listener for keyup events to set corresponding keyboard controls to false.
 * @param {KeyboardEvent} event - The keyboard event.
 */
window.addEventListener("keyup", (event) => {
    if (event.keyCode === 37) {
        keyboard.LEFT = false;
    }
    if (event.keyCode === 39) {
        keyboard.RIGHT = false;
    }
    if (event.keyCode === 38 || event.keyCode === 32) {
        keyboard.UP = false;
    }
    if (event.keyCode === 68) {
        keyboard.THROW = false;
    }
    if (event.keyCode === 27) {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        }
    }
});

/**
 * Starts user action based on the button pressed.
 * @param {string} userAction - The action being performed (e.g., "left", "right").
 * @param {Event} event - The event object triggered by the action.
 */
function startUserAction(userAction, event) {
    event.preventDefault();

    document.getElementById(userAction + "-btn").style.scale = "1.1";
    if (userAction == "left") {
        keyboard.LEFT = true;
    }
    if (userAction == "right") {
        keyboard.RIGHT = true;
    }
    if (userAction == "jump") {
        keyboard.UP = true;
    }
    if (userAction == "throw") {
        keyboard.THROW = true;
    }
}

/**
 * Ends user action based on the button pressed.
 * @param {string} userAction - The action being performed (e.g., "left", "right").
 */

function endUserAction(userAction) {
    document.getElementById(userAction + "-btn").style.scale = "1";
    if (userAction == "left") {
        keyboard.LEFT = false;
    }
    if (userAction == "right") {
        keyboard.RIGHT = false;
    }
    if (userAction == "jump") {
        keyboard.UP = false;
    }
    if (userAction == "throw") {
        keyboard.THROW = false;
    }
}
