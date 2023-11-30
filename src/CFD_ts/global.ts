export const mobile: boolean = navigator.userAgent.match(/iPhone|iPad|iPod|Android|BlackBerry|Opera Mini|IEMobile/i).length > 0;

export function componentToHex(c: number) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

/**
 * Functions to convert rgb to hex color string 
 * (from stackoverflow)
*/
export function rgbToHex(r: number, g: number, b: number) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

export interface IrequestAnimFrame {
    (callback: () => void): void;
}

/**
 * Mysterious gymnastics that are apparently useful 
 * for better cross-browser animation timing:
*/
export const requestAnimFrame: IrequestAnimFrame = (function (callback) {
    const win: any = window;

    return window.requestAnimationFrame ||
        win.webkitRequestAnimationFrame ||
        win.mozRequestAnimationFrame ||
        win.oRequestAnimationFrame ||
        win.msRequestAnimationFrame ||

        function (callback) {
            window.setTimeout(callback, 1);		// second parameter is time in ms
        };
})();