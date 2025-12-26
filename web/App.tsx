import React from 'react';
import { R3FGameCompositor } from '../src/runtime/systems/R3FGameCompositor';
import { ComposedScene, SlotContent } from '../src/types';
import * as THREE from 'three';
import { GridSystemImpl } from '../src/runtime/systems/GridSystemImpl';
import { KeyboardControls, VirtualJoystick } from '@jbcom/strata';

const keyMap = [
    { name: 'forward', keys: ['ArrowUp', 'w', 'W'] },
    { name: 'backward', keys: ['ArrowDown', 's', 'S'] },
    { name: 'left', keys: ['ArrowLeft', 'a', 'A'] },
    { name: 'right', keys: ['ArrowRight', 'd', 'D'] },
    { name: 'jump', keys: ['Space'] },
];

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

    // Add a placeholder cube since the model is missing
    const cube = new THREE.Mesh(
        new THREE.BoxGeometry(1, 1, 1),
        new THREE.MeshStandardMaterial({ color: 'orange' })
    );
    cube.position.set(8, 0.5, 8);
    mockScene.scene.add(cube);


    const activeContent: SlotContent[] = [];

    return (
        <KeyboardControls map={keyMap}>
            <div style={{ width: '100vw', height: '100vh' }}>
                {gameCompositor.compose(mockScene, activeContent, { enableOrbitControls: true })}
                <VirtualJoystick
                    onMove={(state) => console.log('Joystick:', state)}
                />
            </div>
        </KeyboardControls>
    );
};

export default App;