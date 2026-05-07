import type { GameStats } from "../lib/stats-store";
import { cityLabel, type City } from "../lib/cities";

interface ScorecardProps {
  open: boolean;
  stats: GameStats;
  status: "playing" | "won" | "lost";
  target: City;
  lastGuessCount: number | null;
  won: boolean;
  onClose: () => void;
}

function Scorecard({
  open,
  stats,
  status,
  target,
  lastGuessCount,
  won,
  onClose,
}: ScorecardProps) {
  if (!open) return null;

  const winPct =
    stats.played > 0 ? Math.round((stats.won / stats.played) * 100) : 0;
  const maxBar = Math.max(...stats.distribution, 1);
  const targetLabel = cityLabel(target);

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="mx-4 w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-5 shadow-xl dark:border-slate-700 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-center text-base font-bold tracking-wide text-slate-900 dark:text-slate-100">
          STATISTICS
        </h2>

        {status === "won" ? (
          <p className="mt-3 text-center text-sm font-semibold text-emerald-700 dark:text-emerald-400">
            Correct! It was <strong>{targetLabel}</strong>.
          </p>
        ) : status === "lost" ? (
          <p className="mt-3 text-center text-sm font-semibold text-rose-700 dark:text-rose-400">
            The city was <strong>{targetLabel}</strong>.
          </p>
        ) : (
          <p className="mt-3 text-center text-sm font-semibold text-slate-600 dark:text-slate-300">
            Current performance across all rounds.
          </p>
        )}

        {/* Summary row */}
        <div className="mt-4 grid grid-cols-4 gap-2 text-center">
          {[
            { value: stats.played, label: "Played" },
            { value: winPct, label: "Win %" },
            { value: stats.currentStreak, label: "Current Streak" },
            { value: stats.maxStreak, label: "Max Streak" },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {s.value}
              </div>
              <div className="text-[10px] leading-tight text-slate-500 dark:text-slate-400">
                {s.label}
              </div>
            </div>
          ))}
        </div>

        {/* Distribution */}
        <h3 className="mt-5 text-center text-xs font-bold tracking-wide text-slate-700 dark:text-slate-300">
          GUESS DISTRIBUTION
        </h3>
        <div className="mt-2 flex flex-col gap-1">
          {stats.distribution.map((count, i) => {
            const isLast = won && lastGuessCount === i + 1;
            const width = Math.max((count / maxBar) * 100, 8);
            return (
              <div key={i} className="flex items-center gap-2">
                <span className="w-3 text-right text-xs font-semibold text-slate-600 dark:text-slate-400">
                  {i + 1}
                </span>
                <div
                  className={`rounded px-2 py-0.5 text-right text-xs font-bold text-white transition-all ${
                    isLast ? "bg-emerald-600" : "bg-slate-400 dark:bg-slate-600"
                  }`}
                  style={{ width: `${width}%` }}
                >
                  {count}
                </div>
              </div>
            );
          })}
        </div>

        {/* Close */}
        <div className="mt-5 flex justify-center">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-rose-600 px-6 py-2 text-sm font-bold text-white transition hover:bg-rose-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default Scorecard;
