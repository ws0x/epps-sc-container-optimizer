import { useRef, useEffect, useCallback, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { RotateCcw, List } from 'lucide-react';
import ContainerMesh from './ContainerMesh';
import ItemMesh from './ItemMesh';
import { PRODUCT_COLORS } from '../../constants/colors';

function CanvasCapture({ onReady }) {
  const { gl } = useThree();
  useEffect(() => { onReady(gl.domElement); }, [gl, onReady]);
  return null;
}

function SceneContents({ container, containerData, colorMap, glRef, controlsRef }) {
  const { camera } = useThree();
  const handleReady = useCallback((el) => { if (glRef) glRef.current = el; }, [glRef]);

  // Auto-fit camera when container changes
  useEffect(() => {
    if (!container) return;
    const { length, height, width } = container;
    const diag = Math.sqrt(length ** 2 + height ** 2 + width ** 2);
    const dist = diag * 1.4;
    camera.position.set(dist * 0.7, dist * 0.5, dist * 0.7);
    camera.lookAt(0, 0, 0);
    camera.updateProjectionMatrix();
    controlsRef.current?.reset?.();
  }, [container?.id]); // eslint-disable-line

  if (!container) return null;
  const { length, width, height } = container;

  return (
    <>
      <CanvasCapture onReady={handleReady} />
      <ambientLight intensity={0.5} />
      <directionalLight position={[length * 2, height * 3, width * 2]} intensity={1.2} castShadow />
      <directionalLight position={[-length, height, -width]} intensity={0.4} color="#93c5fd" />
      <color attach="background" args={['#0f172a']} />
      <fog attach="fog" args={['#0f172a', length * 6, length * 20]} />

      <ContainerMesh
        length={length}
        width={width}
        height={height}
        cornerReduction={container.cornerReduction || 0}
      />

      {containerData?.placed.map((placement, idx) => {
        const color = colorMap?.[placement.item.id] ?? PRODUCT_COLORS[idx % PRODUCT_COLORS.length];
        return (
          <ItemMesh
            key={`${placement.item.id}-${placement.item.unitIndex}-${idx}`}
            placement={placement}
            color={color}
            containerLength={length}
            containerHeight={height}
            containerWidth={width}
          />
        );
      })}
    </>
  );
}

export default function Scene3D({ container, solution, activeContainerIdx, colorMap, glRef }) {
  const containerData  = solution?.containers?.[activeContainerIdx] ?? null;
  const controlsRef    = useRef();
  const [sceneKey, setSceneKey]     = useState(0);
  const [legendOpen, setLegendOpen] = useState(true);

  const resetCamera = () => setSceneKey((k) => k + 1);

  // Unique products visible in colorMap + solution
  const legendItems = solution && colorMap
    ? Object.entries(colorMap).reduce((acc, [id, color]) => {
        const product = solution.containers
          .flatMap((c) => c.placed)
          .find((p) => p.item.id === id)?.item;
        if (product) acc.push({ id, color, product });
        return acc;
      }, [])
    : [];

  return (
    <div className="w-full h-full relative" style={{ touchAction: 'none' }}>

      {/* ── Empty state ── */}
      {!container && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none px-6 text-center">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-slate-800/80 flex items-center justify-center mx-auto mb-3 border border-slate-700">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#475569" strokeWidth="1.5">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            </svg>
          </div>
          <p className="text-sm text-slate-400 font-medium">Select a container</p>
          <p className="text-xs text-slate-600 mt-1">
            Open the <span className="text-slate-400 font-medium">☰ menu</span> to configure
          </p>
        </div>
      )}

      {container && !solution && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-10 pointer-events-none">
          <p className="text-sm text-slate-400 font-medium">Ready to pack</p>
          <p className="text-xs text-slate-600 mt-1">Add products and click Pack Container</p>
        </div>
      )}

      {/* ── Canvas ── */}
      <Canvas
        gl={{ preserveDrawingBuffer: true, antialias: true }}
        shadows
        dpr={[1, 2]}
        style={{ background: '#0f172a' }}
      >
        <SceneContents
          key={sceneKey}
          container={container}
          containerData={containerData}
          colorMap={colorMap}
          glRef={glRef}
          controlsRef={controlsRef}
        />
        <OrbitControls
          ref={controlsRef}
          enableDamping
          dampingFactor={0.06}
          minDistance={0.5}
          maxDistance={200}
          makeDefault
        />
      </Canvas>

      {/* ── Reset camera ── */}
      {container && (
        <button
          onClick={resetCamera}
          title="Reset camera"
          className="absolute top-3 left-3 sm:top-4 sm:left-4 flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1.5 bg-slate-900/80 backdrop-blur-sm border border-slate-700/60 rounded-lg text-[10px] text-slate-400 hover:text-white hover:border-slate-500 transition"
        >
          <RotateCcw size={10} />
          <span className="hidden sm:inline">Reset view</span>
        </button>
      )}

      {/* ── Controls hint ── */}
      <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-slate-900/70 backdrop-blur-sm rounded-lg px-2 sm:px-2.5 py-1.5 pointer-events-none">
        {/* Desktop hint */}
        <p className="hidden sm:block text-[10px] text-slate-500">
          Drag · Scroll · Right-drag to pan
        </p>
        {/* Mobile hint */}
        <p className="sm:hidden text-[9px] text-slate-500">
          1 finger rotate · Pinch zoom
        </p>
      </div>

      {/* ── Legend ── */}
      {legendItems.length > 0 && (
        <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4">

          {/* Toggle button (always visible, icon changes) */}
          <button
            onClick={() => setLegendOpen((v) => !v)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900/90 backdrop-blur-sm border border-slate-700/60 rounded-lg text-[10px] font-semibold text-slate-400 hover:text-white hover:border-slate-500 transition mb-1.5"
          >
            <List size={11} />
            Legend
            <span className="text-slate-600 ml-0.5">{legendOpen ? '▲' : '▼'}</span>
          </button>

          {/* Legend panel */}
          {legendOpen && (
            <div className="bg-slate-900/90 backdrop-blur-sm border border-slate-700/60 rounded-xl px-3 py-2.5 max-w-[240px] sm:max-w-[260px] max-h-[40vh] overflow-y-auto">
              <div className="space-y-1.5">
                {legendItems.map(({ id, color, product }) => {
                  const isMachine = product.category === 'Machine';
                  return (
                    <div key={id} className="flex items-center gap-2 min-w-0">
                      {/* Swatch */}
                      <div className="w-3 h-3 rounded-sm shrink-0" style={{ background: color }} />
                      {/* Name */}
                      <span className="text-[10px] font-medium text-slate-200 truncate flex-1 min-w-0">
                        {product.name}
                      </span>
                      {/* MC / MA badge */}
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded shrink-0 border ${
                          isMachine
                            ? 'bg-amber-900/70 text-amber-300 border-amber-700/50'
                            : 'bg-blue-900/70 text-blue-300 border-blue-700/50'
                        }`}
                      >
                        {isMachine ? 'MC' : 'MA'}
                      </span>
                      {/* Quantity */}
                      <span className="text-[10px] font-semibold text-slate-400 shrink-0">
                        ×{product.quantity}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
