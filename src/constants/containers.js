/**
 * ISO shipping container specifications.
 * ALL dimensions are INTERNAL (usable) in metres — NOT external.
 * External dimensions are larger by ~15–20 cm on each axis due to wall/roof thickness.
 * cornerReduction: the upper-edge zone (in metres) where corner rails/castings
 *   reduce usable space — items near any wall cannot reach this close to the ceiling.
 * doorWidth / doorHeight: the actual door-opening clear dimensions (items must fit
 *   through the door even if they fit inside the container).
 */
export const ISO_CONTAINERS = [
  {
    id: '20ft',
    name: '20ft Standard',
    label: "20' Standard",
    // Internal usable dimensions (ISO 668 / industry standard)
    length:    5.898,  // cm: 589.8
    width:     2.352,  // cm: 235.2
    height:    2.393,  // cm: 239.3
    maxWeight: 28200,  // kg payload
    cornerReduction: 0.10,   // 10 cm — upper corner rail/casting zone
    doorWidth:  2.340,        // cm: 234.0 — door clear width
    doorHeight: 2.280,        // cm: 228.0 — door clear height
    color: '#3b82f6',
  },
  {
    id: '40ft',
    name: '40ft Standard',
    label: "40' Standard",
    length:    12.032,
    width:      2.352,
    height:     2.393,
    maxWeight: 26680,
    cornerReduction: 0.10,
    doorWidth:  2.340,
    doorHeight: 2.280,
    color: '#10b981',
  },
  {
    id: '40ft-hc',
    name: '40ft High Cube',
    label: "40' High Cube",
    length:    12.032,
    width:      2.352,
    height:     2.698,
    maxWeight: 26460,
    cornerReduction: 0.10,
    doorWidth:  2.340,
    doorHeight: 2.585,
    color: '#f59e0b',
  },
  {
    id: '20ft-hc',
    name: '20ft High Cube',
    label: "20' High Cube",
    length:    5.898,
    width:     2.352,
    height:    2.698,
    maxWeight: 27400,
    cornerReduction: 0.10,
    doorWidth:  2.340,
    doorHeight: 2.585,
    color: '#8b5cf6',
  },
  {
    id: '45ft-hc',
    name: '45ft High Cube',
    label: "45' High Cube",
    length:    13.556,
    width:      2.352,
    height:     2.698,
    maxWeight: 27040,
    cornerReduction: 0.10,
    doorWidth:  2.340,
    doorHeight: 2.585,
    color: '#ef4444',
  },
  {
    id: 'custom',
    name: 'Custom',
    label: 'Custom Dimensions',
    length:    0,
    width:     0,
    height:    0,
    maxWeight: 0,
    cornerReduction: 0,
    doorWidth:  0,
    doorHeight: 0,
    color: '#64748b',
  },
];

export const ROTATION_MODES = [
  { value: 'FIXED',      label: 'Fixed (no rotation)' },
  { value: 'HORIZONTAL', label: 'Upright (horizontal spin)' },
  { value: 'FREE',       label: 'Free (any orientation)' },
];

export const CATEGORIES = ['Machine', 'Material'];
