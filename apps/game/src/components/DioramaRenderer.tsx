import { Environment, OrthographicCamera } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import React, { useRef } from 'react';
import * as THREE from 'three';
import { useEntities } from '../ecs'; // We need to ensure ecs.ts exposes this
import { generatePlaceholderTexture } from '../utils/SpriteGenerator';

const EntityView: React.FC<{ entity: any }> = ({ entity }) => {
    const meshRef = useRef<THREE.Mesh>(null);

    useFrame(() => {
        if (meshRef.current && entity.position) {
            // Direct update for now, interpolation later
            meshRef.current.position.set(entity.position.x, entity.position.y, entity.position.z);
        }
    });

    // Memoize texture to avoid regeneration every frame (simplified for now, ideally useMemo aligned with entity)
    const label = entity.type === 'enemy' ? 'E' : 'H';
    const color = entity.type === 'enemy' ? '#e74c3c' : '#3498db';

    const texture = React.useMemo(() => generatePlaceholderTexture(label, color), [label, color]);

    return (
        <sprite ref={meshRef as any} position={[entity.position.x, entity.position.y, entity.position.z]} scale={[1, 1, 1]}>
            <spriteMaterial map={texture} />
        </sprite>
    );
};

export const DioramaRenderer: React.FC = () => {
    // Query entities that have a position component
    const entities = useEntities((e: any) => !!e.position);

    return (
        <div style={{ width: '100%', height: '100vh', background: '#111' }}>
            <Canvas shadows>
                <OrthographicCamera makeDefault position={[20, 20, 20]} zoom={40} near={-50} far={200} />
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
                <group rotation={[-Math.PI / 4, Math.PI / 4, 0]}> {/* Isometric Angle */}
                    {entities.map((e: any) => (
                        <EntityView key={e.id} entity={e} />
                    ))}
                    {/* Ground Plane */}
                    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
                        <planeGeometry args={[100, 100]} />
                        <meshStandardMaterial color="#222" />
                    </mesh>
                </group>
                <Environment preset="city" />
            </Canvas>
        </div>
    );
};
