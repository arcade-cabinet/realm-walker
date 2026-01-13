import { MapControls, OrthographicCamera } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { ECS } from '../ecs';

const IsometricCamera = () => {
    return (
        <OrthographicCamera
            makeDefault
            position={[20, 20, 20]}
            zoom={40}
            near={-50}
            far={200}
            onUpdate={(c) => c.lookAt(0, 0, 0)}
        />
    );
};

const EntityMesh = ({ entity }: { entity: any }) => {
    // Simple visual representation based on type
    // In future, this will use spriteId to load assets
    const color = entity.type === 'hero' ? 'cyan' : entity.type === 'enemy' ? 'red' : 'gold';

    return (
        <mesh position={[entity.position?.x || 0, 1, entity.position?.y || 0]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color={color} />
        </mesh>
    );
};

const RenderSystem = () => {
    // Reactive query for entities with position
    const entities = ECS.useEntities(e => !!e.position);

    return (
        <group>
            {entities.map(entity => (
                <EntityMesh key={entity.id} entity={entity} />
            ))}
        </group>
    );
}

export const DioramaRenderer = () => {
    return (
        <div className="w-full h-full bg-slate-900 border-4 border-slate-700 rounded-lg overflow-hidden shadow-2xl">
            <Canvas shadows>
                <IsometricCamera />
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 20, 10]} intensity={1} castShadow />

                {/* The Game World Floor */}
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
                    <planeGeometry args={[100, 100]} />
                    <meshStandardMaterial color="#334155" />
                    <gridHelper args={[100, 100, '#1e293b', '#1e293b']} rotation={[-Math.PI / 2, 0, 0]} />
                </mesh>

                <RenderSystem />

                <MapControls />
            </Canvas>
        </div>
    );
};
