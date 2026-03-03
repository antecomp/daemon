export function toggleFullscreen() {
    const elem = document.documentElement;
    if (!document.fullscreenElement) {
        elem.requestFullscreen?.();
    } else {
        document.exitFullscreen?.();
    }
}