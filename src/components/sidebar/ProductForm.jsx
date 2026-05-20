import { useState } from 'react';
import { Plus } from 'lucide-react';
import { ROTATION_MODES, CATEGORIES } from '../../constants/containers';

const EMPTY = {
  name: '',
  length: '',
  width: '',
  height: '',
  weight: '',
  quantity: 1,
  category: 'Machine',
  stackable: false,
  rotationMode: 'HORIZONTAL',
};

export default function ProductForm({ onAdd }) {
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});

  const set = (field, val) => {
    setForm((f) => ({ ...f, [field]: val }));
    setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())          e.name = 'Required';
    if (!form.length || form.length <= 0) e.length = 'Required';
    if (!form.width  || form.width  <= 0) e.width  = 'Required';
    if (!form.height || form.height <= 0) e.height = 'Required';
    if (!form.quantity || form.quantity < 1) e.quantity = 'Min 1';
    return e;
  };

  const handleAdd = () => {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    onAdd({
      id: crypto.randomUUID(),
      name:       form.name.trim(),
      length:     parseFloat(form.length),
      width:      parseFloat(form.width),
      height:     parseFloat(form.height),
      weight:     parseFloat(form.weight) || 0,
      quantity:   parseInt(form.quantity, 10),
      category:   form.category,
      stackable:  form.stackable,
      rotationMode: form.rotationMode,
    });
    setForm(EMPTY);
    setErrors({});
  };

  const field = (label, key, type = 'number', extra = {}) => (
    <div>
      <label className="block text-[10px] text-slate-500 mb-0.5">{label}</label>
      <input
        type={type}
        min={type === 'number' ? 0 : undefined}
        value={form[key]}
        onChange={(e) => set(key, type === 'number' ? e.target.value : e.target.value)}
        className={`w-full bg-slate-800 border rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-brand-500 ${
          errors[key] ? 'border-red-500' : 'border-slate-600'
        }`}
        {...extra}
      />
      {errors[key] && <p className="text-[10px] text-red-400 mt-0.5">{errors[key]}</p>}
    </div>
  );

  return (
    <div className="p-4 border-b border-slate-700/60">
      <div className="flex items-center gap-2 mb-3">
        <Plus size={14} className="text-brand-400" />
        <span className="text-xs font-semibold text-slate-200 uppercase tracking-wide">Add Product</span>
      </div>

      <div className="space-y-2.5">
        {/* Name */}
        {field('Product Name', 'name', 'text', { placeholder: 'e.g. Hydraulic Press X1' })}

        {/* Dimensions row */}
        <div>
          <label className="block text-[10px] text-slate-500 mb-1">Dimensions (cm) — L × W × H</label>
          <div className="grid grid-cols-3 gap-1.5">
            {['length', 'width', 'height'].map((k) => (
              <div key={k}>
                <input
                  type="number"
                  min="0"
                  value={form[k]}
                  onChange={(e) => set(k, e.target.value)}
                  placeholder={k[0].toUpperCase()}
                  className={`w-full bg-slate-800 border rounded px-2 py-1.5 text-xs text-white text-center focus:outline-none focus:border-brand-500 ${
                    errors[k] ? 'border-red-500' : 'border-slate-600'
                  }`}
                />
              </div>
            ))}
          </div>
          {(errors.length || errors.width || errors.height) && (
            <p className="text-[10px] text-red-400 mt-0.5">All dimensions required</p>
          )}
        </div>

        {/* Weight & Quantity */}
        <div className="grid grid-cols-2 gap-1.5">
          {field('Weight (kg)', 'weight', 'number', { placeholder: 'Optional' })}
          {field('Qty', 'quantity', 'number', { min: 1 })}
        </div>

        {/* Category */}
        <div>
          <label className="block text-[10px] text-slate-500 mb-1">Category</label>
          <div className="grid grid-cols-2 gap-1.5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => set('category', cat)}
                className={`py-1.5 rounded-lg text-xs font-medium border transition ${
                  form.category === cat
                    ? cat === 'Machine'
                      ? 'bg-amber-900/50 border-amber-500 text-amber-300'
                      : 'bg-blue-900/50 border-blue-500 text-blue-300'
                    : 'border-slate-600 text-slate-400 hover:border-slate-500'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Rotation Mode */}
        <div>
          <label className="block text-[10px] text-slate-500 mb-1">Rotation</label>
          <select
            value={form.rotationMode}
            onChange={(e) => set('rotationMode', e.target.value)}
            className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1.5 text-xs text-white focus:outline-none focus:border-brand-500"
          >
            {ROTATION_MODES.map((m) => (
              <option key={m.value} value={m.value}>{m.label}</option>
            ))}
          </select>
        </div>

        {/* Stackable toggle */}
        <div className="flex items-center justify-between px-2.5 py-2 bg-slate-800/40 rounded-lg border border-slate-700">
          <div>
            <p className="text-xs text-slate-300 font-medium">Stackable</p>
            <p className="text-[10px] text-slate-500">Allow items on top</p>
          </div>
          <button
            type="button"
            onClick={() => set('stackable', !form.stackable)}
            className={`relative w-9 h-5 rounded-full transition-colors ${
              form.stackable ? 'bg-brand-500' : 'bg-slate-600'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${
                form.stackable ? 'translate-x-4' : ''
              }`}
            />
          </button>
        </div>

        {/* Add button */}
        <button
          onClick={handleAdd}
          className="w-full flex items-center justify-center gap-2 py-2 bg-brand-600 hover:bg-brand-500 text-white text-xs font-semibold rounded-lg transition shadow-lg shadow-blue-900/30"
        >
          <Plus size={13} />
          Add Product
        </button>
      </div>
    </div>
  );
}
