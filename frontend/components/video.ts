export default () => ({
    playing: false,
    started: false,
    hasControls: false,
    hasStartedPlaying: true,
    video: null,
    init() {
        this.video = this.$root.getElementsByTagName("video")[0];
        if (this.video.autoplay) {
            this.started = true;
            this.playing = true;
        } else {
            this.hasControls = true;
        }
    },
    pause() {
        if (this.started && !this.hasControls) return;
        this.video.pause();
        this.playing = false;
    },
    play(started = false) {
        if (started || this.started) {
            this.video.play();
            this.playing = true;
            this.video.muted = false;
        }
    },
    toggle() {
        if (this.playing) {
            this.pause();
        } else {
            this.play(true);
        }
    },
});