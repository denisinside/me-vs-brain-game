/**
 * Fullscreen utilities
 */

/**
 * Enter fullscreen mode
 */
export const enterFullscreen = () => {
    const doc = document.documentElement;

    if (doc.requestFullscreen) {
        doc.requestFullscreen();
    } else if (doc.webkitRequestFullscreen) { // Safari
        doc.webkitRequestFullscreen();
    } else if (doc.msRequestFullscreen) { // IE11
        doc.msRequestFullscreen();
    }
};

/**
 * Exit fullscreen mode
 */
export const exitFullscreen = () => {
    if (document.exitFullscreen) {
        document.exitFullscreen();
    } else if (document.webkitExitFullscreen) { // Safari
        document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) { // IE11
        document.msExitFullscreen();
    }
};

/**
 * Check if currently in fullscreen mode
 */
export const isFullscreen = () => {
    return !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.msFullscreenElement
    );
};

/**
 * Toggle fullscreen mode
 */
export const toggleFullscreen = () => {
    if (isFullscreen()) {
        exitFullscreen();
    } else {
        enterFullscreen();
    }
};
