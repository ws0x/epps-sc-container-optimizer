// 16 visually distinct product colors (professional palette)
export const PRODUCT_COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // emerald
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#06b6d4', // cyan
  '#f97316', // orange
  '#84cc16', // lime
  '#ec4899', // pink
  '#14b8a6', // teal
  '#a855f7', // purple
  '#eab308', // yellow
  '#6366f1', // indigo
  '#22c55e', // green
  '#fb7185', // rose
  '#0ea5e9', // sky
];

export const getCategoryColor = (category) =>
  category === 'Machine' ? '#f59e0b' : '#3b82f6';

export const assignProductColors = (products) => {
  const colorMap = {};
  products.forEach((p, i) => {
    colorMap[p.id] = PRODUCT_COLORS[i % PRODUCT_COLORS.length];
  });
  return colorMap;
};
