import 'vitest-webgl-canvas-mock';
const LOAD_FAILURE_SRC = 'LOAD_FAILURE_SRC';
// mock image loading
Object.defineProperty(global.Image.prototype, 'src', {
    set(src) {
        if (src === LOAD_FAILURE_SRC) {
            setTimeout(() => this.onerror(new Error('mocked error')));
        }
        else if (src.startsWith('data')) {
            setTimeout(() => this.dispatchEvent(new Event("load")));
        }
    },
});
Object.defineProperty(global.window.HTMLMediaElement.prototype, 'play', {
    configurable: true,
    get() {
        setTimeout(() => (this.onloadeddata && this.onloadeddata()));
        return () => { };
    }
});
Object.defineProperty(global.window.HTMLMediaElement.prototype, 'load', {
    configurable: true,
    get() {
        setTimeout(() => (this.onloadeddata && this.onloadeddata()));
        return () => { };
    }
});
class WorkerMock {
    constructor() {
        this.onmessage = null;
    }
    postMessage(message, transfer) {
        // Log the message to the console
        console.log('Mock worker received message:', message);
    }
    terminate() {
        // Log the termination to the console
        console.log('Mock worker terminated.');
    }
    addEventListener(type, listener) {
        if (type === 'message') {
            this.onmessage = listener;
        }
    }
    removeEventListener(type, listener) {
        if (type === 'message') {
            this.onmessage = null;
        }
    }
    dispatchMessage(message) {
        if (this.onmessage) {
            this.onmessage({ data: message });
        }
    }
}
window.Worker = WorkerMock;
window.document.body.innerHTML = `<div id="rpg"></div>`;
//# sourceMappingURL=canvas.js.map