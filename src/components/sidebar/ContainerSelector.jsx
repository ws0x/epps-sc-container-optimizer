import { useState } from 'react';
import { Truck, Info } from 'lucide-react';
import { ISO_CONTAINERS } from '../../constants/containers';

const fmt = (m) => (m * 100).toFixed(0); // metres → cm display

export default function ContainerSelector({ value, onChange }) {
  const [customDims, setCustomDims] = useState({
    length: '', width: '', height: '', maxWeight: '', cornerReduction: '10',
  });

  const isCustom = value?.id === 'custom';

  const handlePreset = (c) => {
    if (c.id === 'custom') {
      const toM = (v) => parseFloat(v) / 100 || 0;
      onChange({
        ...c,
        length:          toM(customDims.length),
        width:           toM(customDims.width),
        height:          toM(customDims.height),
        maxWeight:       parseFloat(customDims.maxWeight)       || 0,
        cornerReduction: parseFloat(customDims.cornerReduction) / 100 || 0,
      });
    } else {
      onChange(c);
    }
  };

  const handleCustomField = (field, raw) => {
    const next = { ...customDims, [field]: raw };
    setCustomDims(next);
    if (isCustom) {
      const toM = (v) => parseFloat(v) / 100 || 0;
      onChange({
        ...ISO_CONTAINERS.find((c) => c.id === 'custom'),
        length:          toM(next.length),
        width:           toM(next.width),
        height:          toM(next.height),
        maxWeight:       parseFloat(next.maxWeight)       || 0,
        cornerReduction: parseFloat(next.cornerReduction) / 100 || 0,
        doorWidth:       0,
        doorHeight:      0,
      });
    }
  };

  return (
    <div className="p-4 border-b border-slate-700/60">
      {/* Title + internal dimensions badge */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <Truck size={14} className="text-brand-400" />
          <span className="text-xs font-semibold text-slate-200 uppercase tracking-wide">Container</span>
        </div>
        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-emerald-900/60 text-emerald-400 border border-emerald-700/50">
          INTERNAL DIMS
        </span>
      </div>
      <p className="text-[10px] text-slate-500 mb-3 leading-snug">
        All dimensions shown are <strong className="text-slate-400">internal/usable</strong> — the actual space cargo can occupy (not the external container size).
      </p>

      {/* ISO presets grid */}
      <div className="grid grid-cols-2 gap-1.5 mb-2">
        {ISO_CONTAINERS.filter((c) => c.id !== 'custom').map((c) => (
          <button
            key={c.id}
            onClick={() => handlePreset(c)}
            className={`text-left px-2.5 py-2 rounded-lg border text-[11px] font-medium transition ${
              value?.id === c.id
                ? 'border-brand-500 bg-brand-900/60 text-brand-300'
                : 'border-slate-700 bg-slate-800/40 text-slate-400 hover:border-slate-500 hover:text-slate-200'
            }`}
          >
            <span className="font-bold block text-xs mb-0.5" style={{ color: c.color }}>
              {c.label}
            </span>
            <span className="text-[10px] text-slate-500 block">
              {fmt(c.length)} × {fmt(c.width)} × {fmt(c.height)} cm
            </span>
            <span className="text-[10px] text-slate-600">
              {(c.maxWeight / 1000).toFixed(1)} t max
            </span>
          </button>
        ))}
      </div>

      {/* Custom */}
      <button
        onClick={() => handlePreset(ISO_CONTAINERS.find((c) => c.id === 'custom'))}
        className={`w-full text-left px-2.5 py-2 rounded-lg border text-[11px] font-medium transition mb-2 ${
          isCustom
            ? 'border-brand-500 bg-brand-900/60 text-brand-300'
            : 'border-slate-700 bg-slate-800/40 text-slate-400 hover:border-slate-500 hover:text-slate-200'
        }`}
      >
        Custom Dimensions
      </button>

      {isCustom && (
        <div className="grid grid-cols-2 gap-2">
          {[
            { key: 'length',          label: 'Length (cm)' },
            { key: 'width',           label: 'Width (cm)' },
            { key: 'height',          label: 'Height (cm)' },
            { key: 'maxWeight',       label: 'Max Weight (kg)' },
            { key: 'cornerReduction', label: 'Corner Reduction (cm)' },
          ].map(({ key, label }) => (
            <div key={key} className={key === 'cornerReduction' ? 'col-span-2' : ''}>
              <label className="block text-[10px] text-slate-500 mb-0.5">{label}</label>
              <input
                type="number"
                min="0"
                value={customDims[key]}
                onChange={(e) => handleCustomField(key, e.target.value)}
                placeholder="0"
                className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-brand-500"
              />
            </div>
          ))}
        </div>
      )}

      {/* Selected container details */}
      {value && value.id !== 'custom' && (
        <div className="mt-2 space-y-1">
          <div className="px-2.5 py-2 bg-slate-800/40 rounded-lg border border-slate-700/50">
            <div className="flex items-center gap-1 mb-1">
              <Info size={10} className="text-slate-500" />
              <span className="text-[10px] font-semibold text-slate-400">Usable Interior</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">
              {fmt(value.length)} × {fmt(value.width)} × {fmt(value.height)} cm
              <span className="text-slate-600"> (L × W × H)</span>
            </p>
            <p className="text-[10px] text-slate-400">
              Max payload: <span className="text-slate-300">{value.maxWeight.toLocaleString()} kg</span>
            </p>
          </div>

          {value.doorWidth > 0 && (
            <div className="px-2.5 py-2 bg-amber-950/30 rounded-lg border border-amber-700/30">
              <p className="text-[10px] font-semibold text-amber-400 mb-0.5">Door Opening</p>
              <p className="text-[10px] text-amber-300/80">
                {fmt(value.doorWidth)} × {fmt(value.doorHeight)} cm (W × H)
              </p>
              <p className="text-[10px] text-amber-500/70">Items must fit through the door</p>
            </div>
          )}

          <div className="px-2.5 py-1.5 bg-orange-950/30 rounded-lg border border-orange-700/30">
            <p className="text-[10px] text-orange-400/90">
              ⚠ {fmt(value.cornerReduction)} cm corner reduction enforced at upper edges
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
