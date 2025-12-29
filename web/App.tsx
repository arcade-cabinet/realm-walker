import React from 'react';
import { R3FGameCompositor } from '../src/runtime/systems/R3FGameCompositor';
import { ComposedScene, SlotContent } from '../src/types';
import * as THREE from 'three';
import { GridSystemImpl } from '../src/runtime/systems/GridSystemImpl';

const App: React.FC = () => {
    const gameCompositor = new R3FGameCompositor();

    const mockScene: ComposedScene = {
        scene: new THREE.Scene(),
        gridSystem: new GridSystemImpl(16, 16),
        slots: {
            npcs: new Map(),
            props: new Map(),
            doors: new Map(),
        },
    };

    mockScene.scene.background = new THREE.Color('lightblue');
    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(16, 16),
        new THREE.MeshStandardMaterial({ color: 'gray' })
    );
    floor.rotation.x = -Math.PI / 2;
    mockScene.scene.add(floor);

    // Add a placeholder cube
    const cube = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshStandardMaterial({ color: 'orange' })
    );
    cube.position.set(8, 0.5, 8);
    mockScene.scene.add(cube);


    const activeContent: SlotContent[] = [];

    return (
        <div style={{ width: '100vw', height: '100vh' }}>
            {gameCompositor.compose(mockScene, activeContent, { enableOrbitControls: true })}
        </div>
    );
};

export default App;
