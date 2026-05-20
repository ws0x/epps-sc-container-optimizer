import { Trash2, Layers, Lock } from 'lucide-react';
import { PRODUCT_COLORS } from '../../constants/colors';

function RotationBadge({ mode }) {
  const labels = { FIXED: 'Fixed', HORIZONTAL: 'Upright', FREE: 'Free' };
  return (
    <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-400">
      {labels[mode] ?? mode}
    </span>
  );
}

export default function ProductList({ products, onRemove, colorMap }) {
  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
        <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center mb-2">
          <Layers size={18} className="text-slate-600" />
        </div>
        <p className="text-xs text-slate-500">No products added yet</p>
        <p className="text-[10px] text-slate-600 mt-0.5">Use the form above to add items</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1.5 p-3">
      {products.map((p, i) => {
        const color = colorMap?.[p.id] ?? PRODUCT_COLORS[i % PRODUCT_COLORS.length];
        return (
          <div
            key={p.id}
            className="flex items-start gap-2.5 px-2.5 py-2 bg-slate-800/50 rounded-lg border border-slate-700/60 group hover:border-slate-600 transition"
          >
            {/* Color swatch */}
            <div
              className="w-2.5 h-2.5 rounded-sm shrink-0 mt-1"
              style={{ background: color }}
            />

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-semibold text-slate-200 truncate max-w-[120px]">
                  {p.name}
                </span>
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded font-medium ${
                    p.category === 'Machine'
                      ? 'bg-amber-900/50 text-amber-400'
                      : 'bg-blue-900/50 text-blue-400'
                  }`}
                >
                  {p.category}
                </span>
                <RotationBadge mode={p.rotationMode} />
              </div>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {p.length} × {p.width} × {p.height} cm
                {p.weight > 0 && ` · ${p.weight} kg`}
                {' · '}
                <span className="text-slate-400">×{p.quantity}</span>
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                {p.stackable ? (
                  <span className="flex items-center gap-1 text-[9px] text-emerald-500">
                    <Layers size={9} /> Stackable
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[9px] text-orange-500">
                    <Lock size={9} /> No stacking
                  </span>
                )}
              </div>
            </div>

            {/* Remove */}
            <button
              onClick={() => onRemove(p.id)}
              className="shrink-0 p-1 rounded text-slate-600 hover:text-red-400 hover:bg-red-950/40 opacity-0 group-hover:opacity-100 transition"
            >
              <Trash2 size={12} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
