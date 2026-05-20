import * as THREE from 'three';

/**
 * Renders a shipping container in 3D.
 * NOTE: Real container doors are two full-height panels that swing
 * outward externally — no door shape is modelled inside the container.
 *
 * Visuals:
 *  – Wireframe edges + semi-transparent shell
 *  – Corner reduction zones (orange) at all 4 upper edges
 *  – Floor grid + floor plane
 */
export default function ContainerMesh({ length, width, height, cornerReduction = 0 }) {
  const l  = length;
  const w  = width;
  const h  = height;
  const cr = cornerReduction;

  return (
    <group>
      {/* ── Semi-transparent inner shell ── */}
      <mesh>
        <boxGeometry args={[l, h, w]} />
        <meshStandardMaterial
          color="#1e40af"
          transparent
          opacity={0.04}
          side={THREE.BackSide}
          depthWrite={false}
        />
      </mesh>

      {/* ── Wireframe edges ── */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(l, h, w)]} />
        <lineBasicMaterial color="#3b82f6" transparent opacity={0.65} />
      </lineSegments>

      {/* ── Corner reduction zones (upper 4 edges, orange) ── */}
      {cr > 0 && (
        <group>
          {/* Along-length edges (z = ±w/2) */}
          <mesh position={[0, h / 2 - cr / 2, -w / 2 + cr / 2]}>
            <boxGeometry args={[l, cr, cr]} />
            <meshStandardMaterial color="#f97316" transparent opacity={0.18} depthWrite={false} />
          </mesh>
          <mesh position={[0, h / 2 - cr / 2, w / 2 - cr / 2]}>
            <boxGeometry args={[l, cr, cr]} />
            <meshStandardMaterial color="#f97316" transparent opacity={0.18} depthWrite={false} />
          </mesh>
          {/* Along-width edges (x = ±l/2) */}
          <mesh position={[-l / 2 + cr / 2, h / 2 - cr / 2, 0]}>
            <boxGeometry args={[cr, cr, w]} />
            <meshStandardMaterial color="#f97316" transparent opacity={0.18} depthWrite={false} />
          </mesh>
          <mesh position={[l / 2 - cr / 2, h / 2 - cr / 2, 0]}>
            <boxGeometry args={[cr, cr, w]} />
            <meshStandardMaterial color="#f97316" transparent opacity={0.18} depthWrite={false} />
          </mesh>
        </group>
      )}

      {/* ── Floor grid ── */}
      <gridHelper
        args={[Math.max(l, w) * 1.01, 12, '#1e3a5f', '#1e3a5f']}
        position={[0, -h / 2, 0]}
      />

      {/* ── Floor plane ── */}
      <mesh position={[0, -h / 2 + 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[l, w]} />
        <meshStandardMaterial color="#0f172a" transparent opacity={0.6} />
      </mesh>

      {/* ── Corner spheres (floor) ── */}
      {[
        [-l / 2, -h / 2, -w / 2],
        [ l / 2, -h / 2, -w / 2],
        [-l / 2, -h / 2,  w / 2],
        [ l / 2, -h / 2,  w / 2],
      ].map(([cx, cy, cz], i) => (
        <mesh key={i} position={[cx, cy, cz]}>
          <sphereGeometry args={[0.025, 8, 8]} />
          <meshStandardMaterial color="#3b82f6" />
        </mesh>
      ))}
    </group>
  );
}
