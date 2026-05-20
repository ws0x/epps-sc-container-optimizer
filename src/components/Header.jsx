import { Package, Download, ChevronLeft, ChevronRight, Menu } from 'lucide-react';

export default function Header({
  onExport,
  onNextArrangement,
  onPrevArrangement,
  solutionIndex,
  totalSolutions,
  currentSolution,
  canExport,
  onToggleSidebar,
}) {
  const score   = currentSolution ? (currentSolution.score * 100).toFixed(1) : null;
  const strategy = currentSolution?.strategy ?? '';
  const isFirst  = solutionIndex === 0;
  const isLast   = solutionIndex === totalSolutions - 1;

  const scoreColor =
    !score ? 'text-slate-400'
    : parseFloat(score) >= 70 ? 'text-emerald-400'
    : parseFloat(score) >= 45 ? 'text-amber-400'
    : 'text-red-400';

  return (
    <header className="flex items-center justify-between px-3 sm:px-5 py-2.5 sm:py-3 border-b border-slate-700/60 bg-brand-900 shrink-0 z-10 gap-2">

      {/* ── Left: hamburger (mobile) + logo ── */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* Hamburger — visible only below lg */}
        <button
          onClick={onToggleSidebar}
          className="lg:hidden flex items-center justify-center w-8 h-8 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition shrink-0"
          aria-label="Open configuration panel"
        >
          <Menu size={18} />
        </button>

        {/* Logo icon */}
        <div className="flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-brand-600 shadow-lg shadow-blue-900/40 shrink-0">
          <Package size={16} className="text-white sm:hidden" />
          <Package size={18} className="text-white hidden sm:block" />
        </div>

        {/* Title — truncate on small screens */}
        <div className="min-w-0">
          <p className="text-[9px] sm:text-[10px] font-semibold tracking-[0.15em] sm:tracking-[0.18em] text-brand-300 uppercase leading-none mb-0.5 truncate">
            EPPS Supply Chain
          </p>
          <h1 className="text-xs sm:text-sm font-bold text-white leading-none truncate">
            Container Optimizer
          </h1>
        </div>
      </div>

      {/* ── Centre: arrangement navigator ── */}
      {totalSolutions > 0 && (
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Prev */}
          <button
            onClick={onPrevArrangement}
            disabled={isFirst}
            title={isFirst ? 'Best arrangement' : 'Previous'}
            className="flex items-center justify-center w-7 h-7 sm:w-auto sm:h-auto sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition"
          >
            <ChevronLeft size={14} />
            <span className="hidden sm:inline ml-0.5">Prev</span>
          </button>

          {/* Counter */}
          <div className="text-center px-2.5 sm:px-3 py-1 bg-slate-800/80 rounded-lg border border-slate-700">
            <p className="text-[9px] sm:text-[10px] text-slate-400 leading-none mb-0.5">Arrangement</p>
            <p className="text-xs font-bold text-white">{solutionIndex + 1}/{totalSolutions}</p>
          </div>

          {/* Score — hidden on xs */}
          {score !== null && (
            <div className="hidden sm:block text-center px-2.5 sm:px-3 py-1 bg-slate-800/80 rounded-lg border border-slate-700">
              <p className="text-[9px] sm:text-[10px] text-slate-400 leading-none mb-0.5">Score</p>
              <p className={`text-xs font-bold ${scoreColor}`}>{score}%</p>
            </div>
          )}

          {/* Strategy — hidden below lg */}
          {strategy && (
            <div className="hidden lg:block text-center px-3 py-1 bg-slate-800/80 rounded-lg border border-slate-700 max-w-[170px]">
              <p className="text-[10px] text-slate-400 leading-none mb-0.5">Strategy</p>
              <p className="text-[10px] font-medium text-slate-200 truncate">{strategy}</p>
            </div>
          )}

          {/* Next */}
          <button
            onClick={onNextArrangement}
            disabled={isLast}
            title={isLast ? 'Last arrangement' : 'Next best'}
            className={`flex items-center gap-1 px-2 sm:px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              isLast
                ? 'text-slate-500 bg-slate-800 cursor-not-allowed opacity-50'
                : 'text-white bg-brand-600 hover:bg-brand-500 shadow-md shadow-blue-900/30'
            }`}
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight size={13} />
          </button>

          {/* End label — hidden on mobile */}
          {isLast && totalSolutions > 1 && (
            <span className="hidden md:inline text-[10px] text-slate-500 italic">All shown</span>
          )}
        </div>
      )}

      {/* ── Right: export ── */}
      <button
        onClick={onExport}
        disabled={!canExport}
        title={!canExport ? 'Pack first, then export' : 'Export A4 PDF'}
        className="flex items-center justify-center gap-1.5 px-2.5 sm:px-4 py-2 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-30 disabled:cursor-not-allowed transition shadow-md shadow-emerald-900/30 shrink-0"
      >
        <Download size={14} />
        <span className="hidden sm:inline">Export PDF</span>
      </button>
    </header>
  );
}
