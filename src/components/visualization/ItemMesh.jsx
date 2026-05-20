import { useRef, useState } from 'react';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

const GAP = 0.003; // 3mm visual gap between items

export default function ItemMesh({ placement, color, containerHeight, containerLength, containerWidth }) {
  const { x, y, z, l, w, h, item } = placement;
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  // Convert from packer coords (origin at container corner) to Three.js (origin at container centre)
  const cx = x + l / 2 - containerLength / 2;
  const cy = y + h / 2 - containerHeight / 2;
  const cz = z + w / 2 - containerWidth / 2;

  const gapL = Math.max(l - GAP * 2, 0.001);
  const gapW = Math.max(w - GAP * 2, 0.001);
  const gapH = Math.max(h - GAP * 2, 0.001);

  const baseColor = new THREE.Color(color);
  const hoverColor = baseColor.clone().multiplyScalar(1.35);

  return (
    <group position={[cx, cy, cz]}>
      {/* Main box */}
      <mesh
        ref={meshRef}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); }}
        onPointerOut={() => setHovered(false)}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[gapL, gapH, gapW]} />
        <meshStandardMaterial
          color={hovered ? hoverColor : baseColor}
          roughness={0.55}
          metalness={0.12}
          transparent
          opacity={hovered ? 0.92 : 0.85}
        />
      </mesh>

      {/* Edge highlight */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(gapL, gapH, gapW)]} />
        <lineBasicMaterial
          color={hovered ? '#ffffff' : color}
          transparent
          opacity={hovered ? 0.6 : 0.25}
        />
      </lineSegments>

      {/* Hover tooltip */}
      {hovered && (
        <Html
          center
          distanceFactor={6}
          style={{ pointerEvents: 'none' }}
        >
          <div className="tooltip-animate bg-slate-900/95 border border-slate-600 rounded-lg px-3 py-2 shadow-xl min-w-[160px]">
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className="w-2 h-2 rounded-sm" style={{ background: color }} />
              <p className="text-xs font-bold text-white truncate">{item.name}</p>
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] text-slate-400">
                <span className="text-slate-300">Category:</span> {item.category}
              </p>
              <p className="text-[10px] text-slate-400">
                <span className="text-slate-300">Dims:</span>{' '}
                {Math.round(l * 100)} × {Math.round(w * 100)} × {Math.round(h * 100)} cm
              </p>
              {item.weight > 0 && (
                <p className="text-[10px] text-slate-400">
                  <span className="text-slate-300">Weight:</span> {item.weight} kg
                </p>
              )}
              <p className="text-[10px] text-slate-400">
                <span className="text-slate-300">Stackable:</span>{' '}
                {item.stackable ? '✓ Yes' : '✗ No'}
              </p>
              <p className="text-[10px] text-slate-400">
                <span className="text-slate-300">Rotation:</span>{' '}
                {{ FIXED: 'Fixed', HORIZONTAL: 'Upright', FREE: 'Free' }[item.rotationMode]}
              </p>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}
