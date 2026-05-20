import { useState, useRef, useCallback, useEffect } from 'react';
import { PackageOpen, Loader2, AlertTriangle, X } from 'lucide-react';
import Header from './components/Header';
import ContainerSelector from './components/sidebar/ContainerSelector';
import ProductForm from './components/sidebar/ProductForm';
import ProductList from './components/sidebar/ProductList';
import StatsPanel from './components/StatsPanel';
import Scene3D from './components/visualization/Scene3D';
import { computeSolutions, validateProductFit, validateDoorClearance } from './algorithms/binPacking3D';
import { assignProductColors } from './constants/colors';
import { exportToPDF } from './utils/exportToPDF';

export default function App() {
  const [container, setContainer]     = useState(null);
  const [products, setProducts]       = useState([]);
  const [solutions, setSolutions]     = useState([]);
  const [solutionIdx, setSolutionIdx] = useState(0);
  const [activeContainerIdx, setActiveContainerIdx] = useState(0);
  const [colorMap, setColorMap]       = useState({});
  const [packing, setPacking]         = useState(false);
  const [warnings, setWarnings]       = useState([]);
  const [isDirty, setIsDirty]         = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile drawer state

  const glRef = useRef(null);

  // Mark dirty when inputs change after a pack
  useEffect(() => {
    if (solutions.length > 0) setIsDirty(true);
  }, [products, container]); // eslint-disable-line

  // Close drawer on desktop resize (lg+)
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)');
    const handler = (e) => { if (e.matches) setSidebarOpen(false); };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // ── Product management ───────────────────────────────────────────────────────
  const addProduct = useCallback((product) => {
    setProducts((prev) => {
      const next = [...prev, product];
      setColorMap(assignProductColors(next));
      return next;
    });
  }, []);

  const removeProduct = useCallback((id) => {
    setProducts((prev) => {
      const next = prev.filter((p) => p.id !== id);
      setColorMap(assignProductColors(next));
      return next;
    });
  }, []);

  // ── Packing ──────────────────────────────────────────────────────────────────
  const handlePack = useCallback(() => {
    if (!container || products.length === 0) return;

    const fitWarnings  = validateProductFit(container, products);
    const doorWarnings = validateDoorClearance(container, products);
    setWarnings([...fitWarnings, ...doorWarnings]);

    setPacking(true);
    setTimeout(() => {
      const sols = computeSolutions(container, products);
      setSolutions(sols);
      setSolutionIdx(0);
      setActiveContainerIdx(0);
      setIsDirty(false);
      setPacking(false);
      // Auto-close drawer on mobile after packing
      if (window.innerWidth < 1024) setSidebarOpen(false);
    }, 50);
  }, [container, products]);

  // ── Export ───────────────────────────────────────────────────────────────────
  const handleExport = useCallback(async () => {
    if (!glRef.current || !currentSolution) return;
    await exportToPDF({
      glCanvas:      glRef.current,
      solution:      currentSolution,
      container,
      products,
      solutionIndex: solutionIdx,
    });
  }, [glRef, solutions, solutionIdx, container, products]); // eslint-disable-line

  const currentSolution = solutions[solutionIdx] ?? null;
  const canPack         = !!container && products.length > 0 && !packing;

  const handleContainerChange = useCallback((c) => {
    setContainer(c);
    setWarnings([]);
  }, []);

  return (
    <div className="flex flex-col h-screen bg-slate-950 overflow-hidden">

      {/* ── Header ────────────────────────────────────────────────────────── */}
      <Header
        onExport={handleExport}
        onNextArrangement={() => { setSolutionIdx((i) => Math.min(i + 1, solutions.length - 1)); setActiveContainerIdx(0); }}
        onPrevArrangement={() => { setSolutionIdx((i) => Math.max(i - 1, 0)); setActiveContainerIdx(0); }}
        solutionIndex={solutionIdx}
        totalSolutions={solutions.length}
        currentSolution={currentSolution}
        canExport={!!currentSolution && !isDirty}
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
      />

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0 relative overflow-hidden">

        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* ── Sidebar / Drawer ───────────────────────────────────────────── */}
        <aside
          className={`
            fixed inset-y-0 left-0 z-50 w-[300px] flex flex-col
            border-r border-slate-700/60 bg-slate-900
            transform transition-transform duration-300 ease-in-out
            lg:relative lg:inset-auto lg:z-auto lg:translate-x-0 lg:shrink-0
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
        >
          {/* Mobile drawer header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/60 lg:hidden shrink-0">
            <span className="text-xs font-semibold text-slate-200 tracking-wide">Configure Load</span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition"
            >
              <X size={16} />
            </button>
          </div>

          {/* Scrollable content */}
          <div className="flex-1 overflow-y-auto">
            <ContainerSelector value={container} onChange={handleContainerChange} />
            <ProductForm onAdd={addProduct} />

            {/* Product list header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-700/60">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">
                Products ({products.length})
              </span>
              {products.length > 0 && (
                <button
                  onClick={() => { setProducts([]); setColorMap({}); setSolutions([]); setWarnings([]); setIsDirty(false); }}
                  className="text-[10px] text-red-500 hover:text-red-400 transition"
                >
                  Clear all
                </button>
              )}
            </div>
            <ProductList products={products} onRemove={removeProduct} colorMap={colorMap} />
          </div>

          {/* Warnings */}
          {warnings.length > 0 && (
            <div className="mx-3 mb-2 p-2 bg-red-950/60 border border-red-700/60 rounded-lg shrink-0">
              <div className="flex items-center gap-1.5 mb-1">
                <AlertTriangle size={12} className="text-red-400" />
                <span className="text-[10px] font-semibold text-red-300">Warnings</span>
              </div>
              {warnings.map((w, i) => (
                <p key={i} className="text-[10px] text-red-400 leading-snug">
                  <span className="font-medium text-red-300">{w.name}:</span> {w.reason}
                </p>
              ))}
            </div>
          )}

          {/* Dirty banner */}
          {isDirty && solutions.length > 0 && (
            <div className="mx-3 mb-2 px-2.5 py-2 bg-amber-950/50 border border-amber-700/50 rounded-lg shrink-0">
              <p className="text-[10px] text-amber-400">
                Inputs changed — re-pack to update.
              </p>
            </div>
          )}

          {/* Pack button */}
          <div className="p-4 border-t border-slate-700/60 shrink-0">
            <button
              onClick={handlePack}
              disabled={!canPack}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition shadow-xl disabled:opacity-40 disabled:cursor-not-allowed
                bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 shadow-blue-900/40"
            >
              {packing
                ? <><Loader2 size={15} className="animate-spin" />Computing…</>
                : <><PackageOpen size={15} />Pack Container</>
              }
            </button>
            {!container && (
              <p className="text-[10px] text-slate-600 text-center mt-1.5">Select a container first</p>
            )}
            {container && products.length === 0 && (
              <p className="text-[10px] text-slate-600 text-center mt-1.5">Add at least one product</p>
            )}
          </div>
        </aside>

        {/* ── Main: visualization + stats ───────────────────────────────── */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <div className="flex-1 min-h-0">
            <Scene3D
              container={container}
              solution={isDirty ? null : currentSolution}
              activeContainerIdx={activeContainerIdx}
              colorMap={colorMap}
              glRef={glRef}
            />
          </div>
          <StatsPanel
            solution={isDirty ? null : currentSolution}
            containerConfig={container}
            activeContainerIdx={activeContainerIdx}
            onContainerTabChange={setActiveContainerIdx}
            products={products}
          />
        </main>
      </div>
    </div>
  );
}
