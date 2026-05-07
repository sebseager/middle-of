import { useEffect } from "react";
import SegmentedPicker from "./SegmentedPicker";
import type { PopulationFilter } from "../lib/cities";

interface SettingsModalProps {
  open: boolean;
  popFilter: PopulationFilter;
  popOptions: { label: string; value: PopulationFilter }[];
  distanceUnit: "mi" | "km";
  onPopFilterChange: (value: PopulationFilter) => void;
  onDistanceUnitChange: (value: "mi" | "km") => void;
  canGiveUp: boolean;
  onGiveUp: () => void;
  onViewScorecard: () => void;
  onClose: () => void;
}

const UNIT_OPTIONS: { label: string; value: "mi" | "km" }[] = [
  { label: "MI", value: "mi" },
  { label: "KM", value: "km" },
];

function SettingsModal({
  open,
  popFilter,
  popOptions,
  distanceUnit,
  onPopFilterChange,
  onDistanceUnitChange,
  canGiveUp,
  onGiveUp,
  onViewScorecard,
  onClose,
}: SettingsModalProps) {
  useEffect(() => {
    if (!open) return;

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[950] flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="mx-4 w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-5 shadow-xl dark:border-slate-700 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-center text-base font-bold tracking-wide text-slate-900 dark:text-slate-100">
          SETTINGS
        </h2>

        <div className="mt-4 space-y-4">
          <div>
            <p className="text-xs font-bold tracking-wide text-slate-700 dark:text-slate-300">
              POPULATION
            </p>
            <div className="mt-2">
              <SegmentedPicker
                options={popOptions}
                value={popFilter}
                onChange={onPopFilterChange}
                size="sm"
              />
            </div>
          </div>

          <div>
            <p className="text-xs font-bold tracking-wide text-slate-700 dark:text-slate-300">
              DISTANCE UNIT
            </p>
            <div className="mt-2">
              <SegmentedPicker
                options={UNIT_OPTIONS}
                value={distanceUnit}
                onChange={onDistanceUnitChange}
                size="sm"
              />
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-col gap-2">
          <button
            type="button"
            onClick={onViewScorecard}
            className="rounded-xl bg-slate-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-600 dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-white"
          >
            View Scorecard
          </button>

          {canGiveUp ? (
            <button
              type="button"
              onClick={onGiveUp}
              className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-rose-500"
            >
              Give Up
            </button>
          ) : null}
        </div>

        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-stone-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;
