import jsPDF from 'jspdf';

const A4_W  = 297; // mm landscape
const A4_H  = 210;
const MAR   = 12;
const STATS_X = MAR + 185 + 6; // left of stats column
const STATS_W = A4_W - STATS_X - MAR;

function fmt(n, d = 1) { return Number(n).toFixed(d); }

function drawHeader(pdf, title, now) {
  pdf.setFillColor(15, 32, 64);
  pdf.rect(0, 0, A4_W, 18, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(13);
  pdf.setFont('helvetica', 'bold');
  pdf.text(title, MAR, 12);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'normal');
  pdf.text(`Generated: ${now}`, A4_W - MAR, 12, { align: 'right' });
}

function drawFooter(pdf, page, total) {
  pdf.setFillColor(243, 244, 246);
  pdf.rect(0, A4_H - 8, A4_W, 8, 'F');
  pdf.setTextColor(107, 114, 128);
  pdf.setFontSize(6);
  pdf.setFont('helvetica', 'normal');
  pdf.text('EPPS Supply Chain — Container Optimizer  |  Confidential', MAR, A4_H - 2.5);
  pdf.text(`Page ${page} of ${total}`, A4_W - MAR, A4_H - 2.5, { align: 'right' });
}

function sectionTitle(pdf, x, w, cursor, text) {
  pdf.setFillColor(15, 32, 64);
  pdf.rect(x, cursor, w, 6.5, 'F');
  pdf.setTextColor(255, 255, 255);
  pdf.setFontSize(7);
  pdf.setFont('helvetica', 'bold');
  pdf.text(text, x + 2, cursor + 4.5);
  return cursor + 8;
}

function row(pdf, x, w, cursor, label, value, highlight = false) {
  if (highlight) { pdf.setFillColor(239, 246, 255); pdf.rect(x, cursor, w, 6, 'F'); }
  pdf.setTextColor(55, 65, 81);
  pdf.setFontSize(6.5);
  pdf.setFont('helvetica', 'normal');
  pdf.text(label, x + 2, cursor + 4);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(15, 32, 64);
  pdf.text(String(value), x + w - 2, cursor + 4, { align: 'right' });
  return cursor + 6.5;
}

function divider(pdf, x, w, cursor) {
  pdf.setDrawColor(229, 231, 235);
  pdf.setLineWidth(0.2);
  pdf.line(x, cursor, x + w, cursor);
  return cursor + 2;
}

export async function exportToPDF({ glCanvas, solution, container, products, solutionIndex }) {
  const pdf  = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const now  = new Date().toLocaleString('en-GB');
  const totalPages = solution.containers.length; // 1 page per container

  solution.containers.forEach((cData, containerIdx) => {
    if (containerIdx > 0) pdf.addPage();

    // ── Header ──────────────────────────────────────────────────────────────
    drawHeader(
      pdf,
      `EPPS Supply Chain  |  Container Load Optimizer  ${
        totalPages > 1 ? `— Container ${containerIdx + 1} of ${totalPages}` : ''
      }`,
      now,
    );

    // ── 3D scene screenshot (only captured from active canvas) ───────────────
    const sceneX = MAR;
    const sceneY = 22;
    const sceneW = 183;
    const sceneH = A4_H - sceneY - 20; // leave room for footer

    pdf.setDrawColor(55, 65, 81);
    pdf.setLineWidth(0.3);
    pdf.rect(sceneX - 0.5, sceneY - 0.5, sceneW + 1, sceneH + 1);

    if (containerIdx === 0) {
      // Use live canvas for the first/active container
      const imgData = glCanvas.toDataURL('image/png', 1.0);
      pdf.addImage(imgData, 'PNG', sceneX, sceneY, sceneW, sceneH);
    } else {
      // Subsequent containers: placeholder + info text
      pdf.setFillColor(15, 23, 42);
      pdf.rect(sceneX, sceneY, sceneW, sceneH, 'F');
      pdf.setTextColor(100, 116, 139);
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'italic');
      pdf.text(
        `Container ${containerIdx + 1} — 3D view available in the app`,
        sceneX + sceneW / 2,
        sceneY + sceneH / 2,
        { align: 'center' },
      );
    }

    // ── Stats column ──────────────────────────────────────────────────────────
    let cur = 22;

    // Container spec
    cur = sectionTitle(pdf, STATS_X, STATS_W, cur, 'CONTAINER');
    cur = row(pdf, STATS_X, STATS_W, cur, 'Type', container.name);
    cur = row(pdf, STATS_X, STATS_W, cur, 'Internal L × W × H',
      `${fmt(container.length * 100)} × ${fmt(container.width * 100)} × ${fmt(container.height * 100)} cm`);
    cur = row(pdf, STATS_X, STATS_W, cur, 'Door opening',
      container.doorWidth
        ? `${fmt(container.doorWidth * 100)} × ${fmt(container.doorHeight * 100)} cm`
        : 'N/A');
    cur = row(pdf, STATS_X, STATS_W, cur, 'Max payload', `${container.maxWeight.toLocaleString()} kg`);
    if (container.cornerReduction > 0) {
      cur = row(pdf, STATS_X, STATS_W, cur, 'Corner reduction', `${fmt(container.cornerReduction * 100, 0)} cm`);
    }
    cur = divider(pdf, STATS_X, STATS_W, cur);

    // This container's load stats
    cur = sectionTitle(pdf, STATS_X, STATS_W, cur,
      totalPages > 1 ? `CONTAINER ${containerIdx + 1} LOAD` : 'LOAD STATS');
    cur = row(pdf, STATS_X, STATS_W, cur, 'Items loaded', cData.placed.length, true);
    cur = row(pdf, STATS_X, STATS_W, cur, 'Volume utilization', `${(cData.utilization * 100).toFixed(1)}%`, true);
    cur = row(pdf, STATS_X, STATS_W, cur, 'Space remaining', `${fmt((cData.volumeTotal - cData.volumeUsed) * 1e6, 0)} L`);
    cur = row(pdf, STATS_X, STATS_W, cur, 'Weight loaded',
      cData.totalWeight > 0
        ? `${cData.totalWeight.toLocaleString()} kg (${(cData.weightUtilization * 100).toFixed(1)}%)`
        : 'Not specified');
    cur = divider(pdf, STATS_X, STATS_W, cur);

    // All-containers summary (if multiple)
    if (totalPages > 1) {
      cur = sectionTitle(pdf, STATS_X, STATS_W, cur, 'ALL CONTAINERS SUMMARY');
      solution.containers.forEach((c, i) => {
        cur = row(pdf, STATS_X, STATS_W, cur,
          `Container ${i + 1}`,
          `${c.placed.length} items · ${(c.utilization * 100).toFixed(0)}% vol`,
          i === containerIdx,
        );
      });
      cur = divider(pdf, STATS_X, STATS_W, cur);
    }

    // Product list (compact)
    cur = sectionTitle(pdf, STATS_X, STATS_W, cur, 'PRODUCTS');
    const maxRows = Math.floor((A4_H - cur - 14) / 6);
    const shown   = products.slice(0, maxRows);
    shown.forEach((p) => {
      cur = row(pdf, STATS_X, STATS_W, cur,
        `${p.name} [${p.category[0]}]`,
        `×${p.quantity}  ${p.length}×${p.width}×${p.height} cm${p.weight > 0 ? ` · ${p.weight}kg` : ''}`,
      );
    });
    if (products.length > shown.length) {
      pdf.setTextColor(100, 116, 139);
      pdf.setFontSize(6);
      pdf.setFont('helvetica', 'italic');
      cur += 2;
      pdf.text(`… and ${products.length - shown.length} more`, STATS_X + 2, cur + 3);
      cur += 6;
    }
    cur = divider(pdf, STATS_X, STATS_W, cur);

    // Strategy note
    pdf.setTextColor(100, 116, 139);
    pdf.setFontSize(6);
    pdf.setFont('helvetica', 'italic');
    pdf.text(`Arrangement #${solutionIndex + 1} — ${solution.strategy}`, STATS_X, cur + 3.5);

    // ── Footer ──────────────────────────────────────────────────────────────
    drawFooter(pdf, containerIdx + 1, totalPages);
  });

  pdf.save(`EPPS_Container_Load_${new Date().toISOString().slice(0, 10)}.pdf`);
}
