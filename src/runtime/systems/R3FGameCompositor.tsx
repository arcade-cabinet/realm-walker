/**
 * R3FGameCompositor - React Three Fiber implementation of GameCompositor
 * Provides declarative rendering alternative to vanilla Three.js
 */

import React, { useRef, useEffect, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Html } from '@react-three/drei';
import * as THREE from 'three';
import { ComposedScene, ComposedStory, SlotContent, GameViewport } from '../../types';
import { GLBLoader } from '../loaders/GLBLoader';
import { ProceduralSky, VolumetricEffects } from '@jbcom/strata';

/**
 * Placeholder constants for loading state
 */
const PLACEHOLDER_BOX_SIZE = 1;
const PLACEHOLDER_BOX_COLOR = 'gray';

/**
 * Props for R3F Game Scene
 */
export interface R3FGameSceneProps {
  composedScene: ComposedScene;
  activeContent: SlotContent[];
  enableOrbitControls?: boolean;
  onObjectClick?: (slotId: string) => void;
}

/**
 * Slot Model Component - Loads and displays a single slot's content
 */
interface SlotModelProps {
  content: SlotContent;
  gridPosition: [number, number];
  composedScene: ComposedScene;
  onObjectClick?: (slotId: string) => void;
  // key is handled by React automatically
}

function SlotModel({ 
  content, 
  gridPosition, 
  composedScene,
  onObjectClick 
}: SlotModelProps) {
  const meshRef = useRef<THREE.Group>(null);
  const [model, setModel] = React.useState<THREE.Object3D | null>(null);
  const [hovered, setHovered] = React.useState(false);

  // Load GLB model
  useEffect(() => {
    const loader = new GLBLoader();
    loader.load(content.modelPath)
      .then(loadedModel => {
        setModel(loadedModel);
      })
      .catch(error => {
        console.error(`Failed to load model for slot ${content.slotId}:`, error);
      });
  }, [content.modelPath, content.slotId]);

  // Calculate position
  const position = useMemo(() => {
    if (content.position) {
      return content.position;
    }
    return composedScene.gridSystem.gridToWorld(gridPosition);
  }, [content.position, gridPosition, composedScene]);

  const rotation = content.rotation || [0, 0, 0];
  const scale = content.scale || [1, 1, 1];

  // Add hover effect
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          if (hovered) {
            if (child.material instanceof THREE.MeshStandardMaterial) {
              child.material.emissive.setHex(0x444444);
              child.material.emissiveIntensity = 0.3;
            }
          } else {
            if (child.material instanceof THREE.MeshStandardMaterial) {
              child.material.emissive.setHex(0x000000);
              child.material.emissiveIntensity = 0;
            }
          }
        }
      });
    }
  }, [hovered]);

  if (!model) {
    // Show placeholder while loading
    return (
      <mesh position={position}>
        <boxGeometry args={[PLACEHOLDER_BOX_SIZE, PLACEHOLDER_BOX_SIZE, PLACEHOLDER_BOX_SIZE]} />
        <meshStandardMaterial color={PLACEHOLDER_BOX_COLOR} wireframe />
      </mesh>
    );
  }

  return (
    <group
      ref={meshRef}
      position={position}
      rotation={rotation}
      scale={scale}
      onClick={() => onObjectClick?.(content.slotId)}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      userData={{ slotId: content.slotId }}
    >
      <primitive object={model.clone()} />
    </group>
  );
}

/**
 * Scene Geometry Component - Renders the composed scene's geometry
 */
function SceneGeometry({ composedScene }: { composedScene: ComposedScene }) {
  return (
    <primitive object={composedScene.scene} />
  );
}

/**
 * Diorama Camera Component - Positions camera for optimal room view
 */
function DioramaCamera({ composedScene }: { composedScene: ComposedScene }) {
  const { width, height } = composedScene.gridSystem;
  
  const position = useMemo(() => {
    const centerX = width / 2;
    const centerZ = height / 2;
    const distance = Math.max(width, height) * 1.5;
    const heightPos = distance * 0.7;
    
    return [
      centerX + distance * 0.6,
      heightPos,
      centerZ + distance * 0.8
    ] as [number, number, number];
  }, [width, height]);

  const target = useMemo(() => {
    return [width / 2, 0, height / 2] as [number, number, number];
  }, [width, height]);

  return (
    <PerspectiveCamera
      makeDefault
      position={position}
      fov={75}
      near={0.1}
      far={1000}
    >
      <Html position={[0, 0, 0]} center style={{ pointerEvents: 'none' }}>
        {/* Camera target marker for debugging */}
      </Html>
    </PerspectiveCamera>
  );
}

/**
 * Main R3F Game Scene Component
 */
export function R3FGameScene({
  composedScene,
  activeContent,
  enableOrbitControls = false,
  onObjectClick
}: R3FGameSceneProps) {
  
  return (
    <>
      {/* Camera */}
      <DioramaCamera composedScene={composedScene} />
      
      {/* Lighting and Sky */}
      <ProceduralSky />
      <VolumetricEffects />
      
      {/* Scene Geometry */}
      <SceneGeometry composedScene={composedScene} />
      
      {/* Active Content (NPCs, Props, Doors) */}
      {activeContent.map(content => {
        const gridPos = composedScene.slots.npcs.get(content.slotId) ||
                       composedScene.slots.props.get(content.slotId) ||
                       composedScene.slots.doors.get(content.slotId);
        
        if (!gridPos) {
          console.warn(`Slot ${content.slotId} not found in scene`);
          return null;
        }
        
        return (
          <SlotModel
            key={content.slotId}
            content={content}
            gridPosition={gridPos}
            composedScene={composedScene}
            onObjectClick={onObjectClick}
          />
        );
      })}
      
      {/* Optional orbit controls for development */}
      {enableOrbitControls && <OrbitControls />}
    </>
  );
}

/**
 * R3FGameCompositor - Wraps R3FGameScene in Canvas
 * Provides similar interface to GameCompositor but uses React Three Fiber
 */
export class R3FGameCompositor {
  private canvasRef?: HTMLCanvasElement;
  private containerRef?: HTMLDivElement;

  /**
   * Compose the game viewport using React Three Fiber
   * Returns a React component instead of Three.js objects
   */
  compose(
    composedScene: ComposedScene, 
    activeContent: SlotContent[],
    options?: {
      enableOrbitControls?: boolean;
      onObjectClick?: (slotId: string) => void;
    }
  ): React.ReactElement {
    return (
      <Canvas
        shadows
        camera={{ position: [0, 0, 0] }} // DioramaCamera will override
        gl={{ 
          antialias: true,
          alpha: false,
          powerPreference: 'high-performance'
        }}
        style={{ width: '100%', height: '100%' }}
      >
        <R3FGameScene
          composedScene={composedScene}
          activeContent={activeContent}
          enableOrbitControls={options?.enableOrbitControls}
          onObjectClick={options?.onObjectClick}
        />
      </Canvas>
    );
  }

  /**
   * Mount to DOM element
   */
  mountToDom(element: HTMLElement): void {
    this.containerRef = element as HTMLDivElement;
  }

  /**
   * Cleanup
   */
  dispose(): void {
    // R3F handles cleanup automatically
    this.canvasRef = undefined;
    this.containerRef = undefined;
  }
}

/**
 * Hook for using R3F Game Compositor in React apps
 */
export function useR3FGameCompositor() {
  const compositor = useRef(new R3FGameCompositor());
  
  useEffect(() => {
    return () => {
      compositor.current.dispose();
    };
  }, []);
  
  return compositor.current;
}
