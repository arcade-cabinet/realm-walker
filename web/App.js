"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const react_1 = __importDefault(require("react"));
const R3FGameCompositor_1 = require("../src/runtime/systems/R3FGameCompositor");
const THREE = __importStar(require("three"));
const GridSystemImpl_1 = require("../src/runtime/systems/GridSystemImpl");
const strata_1 = require("@jbcom/strata");
const keyMap = [
    { name: 'forward', keys: ['ArrowUp', 'w', 'W'] },
    { name: 'backward', keys: ['ArrowDown', 's', 'S'] },
    { name: 'left', keys: ['ArrowLeft', 'a', 'A'] },
    { name: 'right', keys: ['ArrowRight', 'd', 'D'] },
    { name: 'jump', keys: ['Space'] },
];
const App = () => {
    const gameCompositor = new R3FGameCompositor_1.R3FGameCompositor();
    const mockScene = {
        scene: new THREE.Scene(),
        gridSystem: new GridSystemImpl_1.GridSystemImpl(16, 16),
        slots: {
            npcs: new Map(),
            props: new Map(),
            doors: new Map(),
        },
    };
    mockScene.scene.background = new THREE.Color('lightblue');
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(16, 16), new THREE.MeshStandardMaterial({ color: 'gray' }));
    floor.rotation.x = -Math.PI / 2;
    mockScene.scene.add(floor);
    // Add a placeholder cube since the model is missing
    const cube = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshStandardMaterial({ color: 'orange' }));
    cube.position.set(8, 0.5, 8);
    mockScene.scene.add(cube);
    const activeContent = [];
    return (react_1.default.createElement(strata_1.KeyboardControls, { map: keyMap },
        react_1.default.createElement("div", { style: { width: '100vw', height: '100vh' } },
            gameCompositor.compose(mockScene, activeContent, { enableOrbitControls: true }),
            react_1.default.createElement(strata_1.VirtualJoystick, { onMove: (state) => console.log('Joystick:', state) }))));
};
exports.default = App;
//# sourceMappingURL=App.js.map