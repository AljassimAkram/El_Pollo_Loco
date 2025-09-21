class GameStatusMsg extends MovebaleObject {
    x = 0;
    y = 480;
    width = 720;
    height = 480;

    static IMAGE_PATHS = {
        defeat: "./assets/img/9_intro_outro_screens/game_over/oh no you lost!.png",
        victory: "./assets/img/9_intro_outro_screens/win/win_2.png",
    };

    constructor() {
        super().loadImage(GameStatusMsg.IMAGE_PATHS.defeat);
    }

    showDefeat() {
        this.show("defeat");
    }

    showVictory() {
        this.show("victory");
    }

    show(type) {
        const imagePath = GameStatusMsg.IMAGE_PATHS[type];
        if (!imagePath) return;
        this.loadImage(imagePath);
        this.y = 0;
    }

    hide() {
        this.y = 480;
    }
}