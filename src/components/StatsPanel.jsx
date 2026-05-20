import { Box, Weight, LayoutGrid, AlertTriangle, Info } from 'lucide-react';

function UtilBar({ value, color }) {
  return (
    <div className="w-full bg-slate-700 rounded-full h-1 sm:h-1.5 overflow-hidden mt-1 sm:mt-0">
      <div
        className="h-full rounded-full bar-fill transition-all duration-700"
        style={{ width: `${Math.min(100, value * 100).toFixed(1)}%`, background: color }}
      />
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color, barValue, warning }) {
  return (
    <div className="bg-slate-800/70 border border-slate-700/60 rounded-lg px-2.5 sm:px-3 py-2 sm:py-2.5 min-w-0">
      <div className="flex items-center gap-1 sm:gap-1.5 mb-1">
        <Icon size={11} style={{ color }} className="sm:w-[13px] sm:h-[13px]" />
        <span className="text-[9px] sm:text-[10px] font-medium text-slate-400 uppercase tracking-wide leading-none truncate">
          {label}
        </span>
        {warning && (
          <AlertTriangle size={9} className="text-amber-400 ml-auto shrink-0" title={warning} />
        )}
      </div>
      <p className="text-base sm:text-lg font-bold leading-none mb-0.5 sm:mb-1 truncate" style={{ color }}>
        {value}
      </p>
      {sub && (
        <p className="text-[9px] sm:text-[10px] text-slate-500 leading-snug truncate">{sub}</p>
      )}
      {barValue !== undefined && <UtilBar value={barValue} color={color} />}
    </div>
  );
}

export default function StatsPanel({
  solution, containerConfig, activeContainerIdx, onContainerTabChange, products,
}) {
  if (!solution) {
    return (
      <div className="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 bg-slate-900/80 border-t border-slate-700/60 text-slate-500 text-[10px] sm:text-xs">
        <LayoutGrid size={13} />
        <span>
          Add products and click{' '}
          <span className="font-bold text-slate-300">Pack Container</span>
          {' '}to see stats
        </span>
      </div>
    );
  }

  const cData          = solution.containers[activeContainerIdx];
  if (!cData) return null;

  const totalContainers = solution.containers.length;
  const spaceRemainingL = ((cData.volumeTotal - cData.volumeUsed) * 1e6).toFixed(0);

  const productsWithWeight    = (products || []).filter((p) => p.weight > 0).length;
  const productsWithoutWeight = (products || []).length - productsWithWeight;
  const weightIncomplete      = productsWithoutWeight > 0 && productsWithWeight > 0;
  const weightMissing         = productsWithWeight === 0;

  const weightWarning = weightMissing
    ? 'No weights entered'
    : weightIncomplete
    ? `${productsWithoutWeight} product(s) missing weight`
    : undefined;

  return (
    <div className="shrink-0 bg-slate-900/90 border-t border-slate-700/60">

      {/* Container tabs — scrollable on mobile */}
      {totalContainers > 1 && (
        <div className="flex items-center gap-1 px-3 sm:px-5 pt-1.5 overflow-x-auto border-b border-slate-700/40 scrollbar-none">
          {solution.containers.map((c, i) => (
            <button
              key={i}
              onClick={() => onContainerTabChange(i)}
              className={`px-2.5 sm:px-3 py-1 text-[9px] sm:text-[10px] font-semibold rounded-t-md border border-b-0 whitespace-nowrap transition ${
                i === activeContainerIdx
                  ? 'bg-slate-800 border-slate-600 text-white'
                  : 'bg-transparent border-transparent text-slate-500 hover:text-slate-300'
              }`}
            >
              Cont. {i + 1}
              <span className="ml-1 font-normal opacity-70">
                ({(c.utilization * 100).toFixed(0)}%)
              </span>
            </button>
          ))}
          <span className="ml-auto pl-2 text-[9px] text-slate-500 whitespace-nowrap shrink-0">
            {totalContainers} containers
          </span>
        </div>
      )}

      {/* ── Stat cards ────────────────────────────────────────────────────────
          Mobile:  2 × 2 grid
          Desktop: single flex row
      ── */}
      <div className="grid grid-cols-2 gap-2 px-3 py-3 sm:flex sm:flex-row sm:gap-3 sm:px-5 sm:py-3">
        <StatCard
          icon={Box}
          label="Volume"
          value={`${(cData.utilization * 100).toFixed(1)}%`}
          sub={`${(cData.volumeUsed * 1e6).toFixed(0)} L / ${(cData.volumeTotal * 1e6).toFixed(0)} L`}
          color="#3b82f6"
          barValue={cData.utilization}
        />
        <StatCard
          icon={Weight}
          label="Weight"
          value={weightMissing ? '—' : `${(cData.weightUtilization * 100).toFixed(1)}%`}
          sub={
            weightMissing
              ? 'No data'
              : `${cData.totalWeight.toLocaleString()} / ${containerConfig?.maxWeight?.toLocaleString()} kg`
          }
          color={weightIncomplete || weightMissing ? '#f59e0b' : '#10b981'}
          barValue={weightMissing ? 0 : cData.weightUtilization}
          warning={weightWarning}
        />
        <StatCard
          icon={LayoutGrid}
          label="Items"
          value={`${cData.placed.length}`}
          sub={
            totalContainers > 1
              ? `${solution.totalPlaced} total / ${totalContainers} cont.`
              : 'items packed'
          }
          color="#10b981"
        />
        <StatCard
          icon={Box}
          label="Space Left"
          value={`${spaceRemainingL} L`}
          sub={`${((1 - cData.utilization) * 100).toFixed(1)}% empty`}
          color="#8b5cf6"
        />

        {/* Overflow — spans full width in grid, shrinks in flex */}
        {solution.totalUnplaced > 0 && (
          <div className="col-span-2 sm:col-span-1 flex items-center gap-2 px-2.5 py-2 bg-red-950/60 border border-red-700/60 rounded-lg sm:shrink-0">
            <AlertTriangle size={13} className="text-red-400 shrink-0" />
            <div className="min-w-0">
              <p className="text-[9px] sm:text-[10px] font-semibold text-red-300">Oversized</p>
              <p className="text-[9px] sm:text-[10px] text-red-400 truncate">
                {solution.totalUnplaced} unit(s) too large
              </p>
            </div>
          </div>
        )}

        {/* Weight incomplete — spans full width in grid */}
        {weightIncomplete && (
          <div className="col-span-2 sm:col-span-1 flex items-center gap-2 px-2.5 py-2 bg-amber-950/40 border border-amber-700/40 rounded-lg sm:shrink-0">
            <Info size={12} className="text-amber-400 shrink-0" />
            <p className="text-[9px] sm:text-[10px] text-amber-400 leading-snug">
              Partial weight data
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
