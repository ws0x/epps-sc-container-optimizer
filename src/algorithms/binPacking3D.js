const EPS = 1e-4; // 0.1 mm tolerance

// ─── Geometry helpers ──────────────────────────────────────────────────────────

function getRotations(l, w, h, rotationMode) {
  if (rotationMode === 'FIXED') return [[l, w, h]];
  if (rotationMode === 'HORIZONTAL') {
    const r = [[l, w, h]];
    if (Math.abs(l - w) > EPS) r.push([w, l, h]);
    return r;
  }
  // FREE — all 6 unique permutations of (l, w, h)
  const perms = [];
  const seen  = new Set();
  const dims  = [l, w, h];
  for (const [a, b, c] of [[0,1,2],[0,2,1],[1,0,2],[1,2,0],[2,0,1],[2,1,0]]) {
    const key = `${dims[a].toFixed(4)}_${dims[b].toFixed(4)}_${dims[c].toFixed(4)}`;
    if (!seen.has(key)) { seen.add(key); perms.push([dims[a], dims[b], dims[c]]); }
  }
  return perms;
}

/** AABB overlap (strict: touching faces do NOT count as overlap) */
function overlaps(ax, ay, az, al, ah, aw, bx, by, bz, bl, bh, bw) {
  return (
    ax + al > bx + EPS && bx + bl > ax + EPS &&
    ay + ah > by + EPS && by + bh > ay + EPS &&
    az + aw > bz + EPS && bz + bw > az + EPS
  );
}

/** True if the bottom face at (x,y,z) size (l×w) is supported by the floor or a stackable item */
function isSupported(x, y, z, l, w, placed) {
  if (y < EPS) return true;
  for (const p of placed) {
    if (!p.item.stackable) continue;
    if (Math.abs(p.y + p.h - y) > EPS) continue;
    if (p.x < x + l - EPS && p.x + p.l > x + EPS &&
        p.z < z + w - EPS && p.z + p.w > z + EPS) return true;
  }
  return false;
}

/** True if placing here would rest on a non-stackable item */
function violatesStackable(x, y, z, l, w, placed) {
  for (const p of placed) {
    if (p.item.stackable) continue;
    if (Math.abs(p.y + p.h - y) > EPS) continue;
    if (p.x < x + l - EPS && p.x + p.l > x + EPS &&
        p.z < z + w - EPS && p.z + p.w > z + EPS) return true;
  }
  return false;
}

/**
 * Upper-corner rail constraint.
 * Real ISO containers have corner castings / top-side rails that reduce the
 * usable space in the upper zone near every wall by `cornerReduction` metres.
 * Rule: if an item's top face is within cornerReduction of the ceiling, it must
 *       NOT be within cornerReduction of any wall (side or end wall).
 */
function violatesCornerReduction(x, y, z, rl, rw, rh, container) {
  const cr = container.cornerReduction || 0;
  if (cr <= EPS) return false;
  if (y + rh <= container.height - cr) return false; // doesn't reach corner zone
  // Item top is inside the upper corner zone → must clear all walls
  const nearSide = z < cr || (z + rw) > container.width  - cr;
  const nearEnd  = x < cr || (x + rl) > container.length - cr;
  return nearSide || nearEnd;
}

// ─── Core single-container packer ─────────────────────────────────────────────

function emptyContainerResult(container) {
  const vol = container.length * container.width * container.height;
  return { placed: [], unplaced: [], totalWeight: 0, volumeUsed: 0, volumeTotal: vol, utilization: 0, weightUtilization: 0 };
}

function packIntoContainer(container, items) {
  if (!items || items.length === 0) return emptyContainerResult(container);

  const placed      = [];
  let   totalWeight = 0;
  let   eps         = [{ x: 0, y: 0, z: 0 }];

  const addEPs = (p) => {
    eps.push({ x: p.x + p.l, y: p.y,       z: p.z       });
    eps.push({ x: p.x,       y: p.y + p.h,  z: p.z       });
    eps.push({ x: p.x,       y: p.y,        z: p.z + p.w });
  };

  const pruneEPs = () => {
    eps = eps.filter((ep) => {
      if (ep.x >= container.length - EPS) return false;
      if (ep.y >= container.height - EPS) return false;
      if (ep.z >= container.width  - EPS) return false;
      for (const p of placed) {
        if (ep.x >= p.x - EPS && ep.x < p.x + p.l - EPS &&
            ep.y >= p.y - EPS && ep.y < p.y + p.h - EPS &&
            ep.z >= p.z - EPS && ep.z < p.z + p.w - EPS) return false;
      }
      return true;
    });
    const seen = new Set();
    eps = eps.filter((ep) => {
      const key = `${Math.round(ep.x * 1e4)},${Math.round(ep.y * 1e4)},${Math.round(ep.z * 1e4)}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
    // Gravity-aware ordering: floor first, then back, then left
    eps.sort((a, b) => a.y - b.y || a.z - b.z || a.x - b.x);
  };

  const unplaced = [];

  for (const item of items) {
    const rotations = getRotations(item.l, item.w, item.h, item.rotationMode);
    let   didPlace  = false;

    outer: for (const ep of eps) {
      for (const [rl, rw, rh] of rotations) {
        // ── Bounds ──────────────────────────────────────────────────────────
        if (ep.x + rl > container.length + EPS) continue;
        if (ep.y + rh > container.height + EPS) continue;
        if (ep.z + rw > container.width  + EPS) continue;

        // ── Weight ──────────────────────────────────────────────────────────
        if (item.weight > 0 && totalWeight + item.weight > container.maxWeight) continue;

        // ── Overlap ──────────────────────────────────────────────────────────
        let blocked = false;
        for (const p of placed) {
          if (overlaps(ep.x, ep.y, ep.z, rl, rh, rw, p.x, p.y, p.z, p.l, p.h, p.w)) {
            blocked = true; break;
          }
        }
        if (blocked) continue;

        // ── Support ──────────────────────────────────────────────────────────
        if (!isSupported(ep.x, ep.y, ep.z, rl, rw, placed)) continue;

        // ── Non-stackable below ───────────────────────────────────────────────
        if (violatesStackable(ep.x, ep.y, ep.z, rl, rw, placed)) continue;

        // ── Corner reduction ─────────────────────────────────────────────────
        if (violatesCornerReduction(ep.x, ep.y, ep.z, rl, rw, rh, container)) continue;

        // ── Place ──────────────────────────────────────────────────────────
        const placement = { x: ep.x, y: ep.y, z: ep.z, l: rl, w: rw, h: rh, item };
        placed.push(placement);
        totalWeight += item.weight || 0;
        addEPs(placement);
        pruneEPs();
        didPlace = true;
        break outer;
      }
    }

    if (!didPlace) unplaced.push(item);
  }

  const containerVol = container.length * container.width * container.height;
  const usedVol      = placed.reduce((s, p) => s + p.l * p.w * p.h, 0);

  return {
    placed,
    unplaced,
    totalWeight,
    volumeUsed:        usedVol,
    volumeTotal:       containerVol,
    utilization:       containerVol > 0 ? usedVol / containerVol : 0,
    weightUtilization: container.maxWeight > 0 ? totalWeight / container.maxWeight : 0,
  };
}

// ─── Product expansion ────────────────────────────────────────────────────────

/** Expand a single product definition into N individual item units (metres). */
function expandProduct(product) {
  const lm = product.length / 100;
  const wm = product.width  / 100;
  const hm = product.height / 100;
  const units = [];
  for (let i = 0; i < product.quantity; i++) {
    units.push({ ...product, l: lm, w: wm, h: hm, unitIndex: i, volume: lm * wm * hm });
  }
  return units;
}

// ─── Grouped multi-container strategy ────────────────────────────────────────
/**
 * Packs products one-by-one in sorted order.
 * KEY RULE: Never split a product's units across containers if it can be avoided.
 *   – If all units of a product fit alongside what's already queued → keep accumulating.
 *   – If they don't fit together but DO fit in a fresh container → close current, start new.
 *   – Only if even a single fresh container can't hold all units (product too large) → split.
 */
function runStrategyGrouped(container, sortedProducts) {
  const allResults  = [];
  let   pendingUnits = [];

  const flush = () => {
    if (pendingUnits.length === 0) return;
    allResults.push(packIntoContainer(container, pendingUnits));
    pendingUnits = [];
  };

  for (const product of sortedProducts) {
    const productUnits = expandProduct(product);

    // Test: can everything (pending + this product) fit in one container?
    const combined  = [...pendingUnits, ...productUnits];
    const testResult = packIntoContainer(container, combined);

    if (testResult.unplaced.length === 0) {
      // ✅ Everything fits — keep accumulating
      pendingUnits = combined;
      continue;
    }

    // Some items don't fit. Check if this product alone fits in a fresh container.
    const freshResult = packIntoContainer(container, productUnits);

    if (freshResult.unplaced.length === 0) {
      // 🔄 Product fits in its own container → close current, start fresh
      flush();
      pendingUnits = productUnits;
      continue;
    }

    // ⚠️ Product itself spans multiple containers — unavoidable split
    flush();
    let remaining = productUnits;
    while (remaining.length > 0) {
      const r = packIntoContainer(container, remaining);
      if (r.placed.length === 0) {
        // Items are genuinely oversized for this container
        allResults.push({ ...r, oversized: true });
        break;
      }
      allResults.push(r);
      remaining = r.unplaced;
    }
  }

  flush(); // pack whatever is left in the pending queue
  return allResults;
}

// ─── Score & ranking ──────────────────────────────────────────────────────────

function scoreSolution(containers) {
  if (containers.length === 0) return 0;
  const avgUtil       = containers.reduce((s, c) => s + c.utilization, 0) / containers.length;
  const overflowPenalty = Math.max(0, (containers.length - 1) * 0.05);
  return Math.max(0, avgUtil - overflowPenalty);
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function computeSolutions(containerConfig, products) {
  if (!containerConfig || products.length === 0) return [];

  const container = {
    length:          containerConfig.length,
    width:           containerConfig.width,
    height:          containerConfig.height,
    maxWeight:       containerConfig.maxWeight,
    cornerReduction: containerConfig.cornerReduction || 0,
  };

  /**
   * Strategies sort PRODUCTS (not individual units).
   * Dimensions in products are in cm; weight in kg.
   */
  const strategies = [
    {
      name:   'Insertion Order (as entered)',
      sortFn: () => 0,   // preserve user's entry order — stable sort
    },
    {
      name:   'Volume — Largest First',
      sortFn: (a, b) => (b.length * b.width * b.height) - (a.length * a.width * a.height),
    },
    {
      name:   'Height — Tallest First',
      sortFn: (a, b) => b.height - a.height,
    },
    {
      name:   'Weight — Heaviest First',
      sortFn: (a, b) => (b.weight || 0) - (a.weight || 0),
    },
    {
      name:   'Footprint — Widest First',
      sortFn: (a, b) => (b.length * b.width) - (a.length * a.width),
    },
    {
      name:   'Density — Densest First',
      sortFn: (a, b) => {
        const va = a.length * a.width * a.height || 1;
        const vb = b.length * b.width * b.height || 1;
        return ((b.weight || 0) / vb) - ((a.weight || 0) / va);
      },
    },
  ];

  const solutions = strategies.map(({ name, sortFn }) => {
    const sorted     = [...products].sort(sortFn);
    const containers = runStrategyGrouped(container, sorted);
    const totalPlaced   = containers.reduce((s, c) => s + c.placed.length, 0);
    const totalUnplaced = containers.reduce((s, c) => s + (c.oversized ? c.unplaced.length : 0), 0);
    return {
      strategy:       name,
      containers,
      score:          scoreSolution(containers),
      totalContainers: containers.length,
      totalPlaced,
      totalUnplaced,
    };
  });

  // Best score first; stable order preserves strategy priority on ties
  solutions.sort((a, b) => b.score - a.score);
  return solutions;
}

/**
 * Validate whether each product fits through the container's door opening.
 * Returns an array of product names that exceed the door dimensions.
 */
export function validateDoorClearance(containerConfig, products) {
  const dw = containerConfig.doorWidth  || 0;
  const dh = containerConfig.doorHeight || 0;
  if (dw <= 0 && dh <= 0) return [];

  const warnings = [];
  for (const p of products) {
    const lm = p.length / 100;
    const wm = p.width  / 100;
    const hm = p.height / 100;

    // Check all upright rotations (HORIZONTAL) — the item enters the door
    // oriented with its height ≤ doorHeight and its cross-section ≤ doorWidth
    const dims     = [lm, wm, hm].sort((a, b) => a - b);  // [small, mid, large]
    // Best case: lay the item with its shortest dimension as height if rotation allows;
    // but for FIXED items, orientation is as-entered.
    // Conservative check: does ANY valid orientation fit through the door?
    const rotations = getRotations(lm, wm, hm, p.rotationMode);
    const canFit = rotations.some(([rl, rw, rh]) => {
      // Through the door: item cross-section is (rw × rh) with rw ≤ doorWidth, rh ≤ doorHeight
      // OR (rl × rh) with rl ≤ doorWidth, rh ≤ doorHeight
      return (rw <= dw + EPS && rh <= dh + EPS) ||
             (rl <= dw + EPS && rh <= dh + EPS);
    });

    if (!canFit) {
      warnings.push({ id: p.id, name: p.name, reason: `Exceeds door opening (${(dw*100).toFixed(0)}×${(dh*100).toFixed(0)} cm)` });
    }
  }
  return warnings;
}

/**
 * Validate whether each product fits at all inside the container (brute-force dimension check).
 * Returns products that are simply too large in at least one dimension.
 */
export function validateProductFit(containerConfig, products) {
  const warnings = [];
  for (const p of products) {
    const lm = p.length / 100;
    const wm = p.width  / 100;
    const hm = p.height / 100;
    const rotations = getRotations(lm, wm, hm, p.rotationMode);
    const canFit = rotations.some(([rl, rw, rh]) =>
      rl <= containerConfig.length + EPS &&
      rw <= containerConfig.width  + EPS &&
      rh <= containerConfig.height + EPS
    );
    if (!canFit) {
      warnings.push({ id: p.id, name: p.name, reason: 'Larger than container interior in all orientations' });
    }
  }
  return warnings;
}
