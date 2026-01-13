import * as THREE from 'three';

export const generatePlaceholderTexture = (label: string, colorStr: string): THREE.CanvasTexture => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    if (ctx) {
        // Background
        ctx.fillStyle = colorStr;
        ctx.fillRect(0, 0, 64, 64);

        // Border
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 4;
        ctx.strokeRect(2, 2, 60, 60);

        // Text
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 32px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(label.substring(0, 1).toUpperCase(), 32, 32);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.NearestFilter; // Sharp pixel art look
    texture.minFilter = THREE.NearestFilter;
    return texture;
};
