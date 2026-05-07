import { COLOR_PALETTE } from "./color-palette";
import type { GuessResult } from "./game-store";

interface GuessListProps {
  guesses: GuessResult[];
  status: "playing" | "won" | "lost";
  distanceUnit: "mi" | "km";
}

const MAX_GUESSES = 6;

function getCircleColor(guess: GuessResult): string {
  if (guess.correct) {
    return COLOR_PALETTE.correctGuessGreen;
  }

  return guess.milesAway < 1000
    ? COLOR_PALETTE.nearGuessOrange
    : COLOR_PALETTE.farGuessRed;
}

const formatDistance = (miles: number, unit: "mi" | "km"): number =>
  unit === "mi" ? miles : Math.round(miles * 1.60934);

function GuessList({ guesses, status, distanceUnit }: GuessListProps) {
  const visibleGuesses = guesses.slice(0, MAX_GUESSES);
  const remainingGuesses = Math.max(MAX_GUESSES - visibleGuesses.length, 0);
  const showPlaceholder = status === "playing" && remainingGuesses > 0;

  const placeholderLabel =
    remainingGuesses === 1
      ? "Last guess, make it count!"
      : `${remainingGuesses} guesses to go`;

  return (
    <div
      className="w-full overflow-hidden rounded-2xl border border-stone-300 bg-white/85 dark:border-slate-700 dark:bg-slate-900/70"
      aria-label="Guess history"
    >
      <ol className="divide-y divide-stone-200 dark:divide-slate-700">
        {visibleGuesses.map((guess, index) => {
          const slotNumber = index + 1;
          const rowText = guess.correct
            ? guess.input
            : `${guess.input} (${formatDistance(guess.milesAway, distanceUnit)} ${distanceUnit})`;
          const circleColor = getCircleColor(guess);

          return (
            <li
              key={slotNumber}
              className="flex min-h-12 min-w-0 items-center gap-3 px-3 py-2"
            >
              <span
                className="inline-flex h-6 w-6 items-center justify-center rounded-full border text-xs font-bold text-white"
                style={{
                  backgroundColor: circleColor,
                  borderColor: circleColor,
                }}
              >
                {slotNumber}
              </span>
              <span className="min-w-0 break-words text-sm font-semibold text-slate-800 dark:text-slate-100">
                {rowText}
              </span>
            </li>
          );
        })}

        {showPlaceholder ? (
          <li className="flex min-h-12 items-center gap-3 px-3 py-2">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-6 w-6 text-stone-400 dark:text-slate-500"
              focusable="false"
            >
              <circle
                cx="12"
                cy="11"
                r="10"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeDasharray="3 4"
                strokeLinecap="round"
              />
            </svg>
            <span className="text-sm font-semibold text-stone-400 dark:text-slate-500">
              {placeholderLabel}
            </span>
          </li>
        ) : null}
      </ol>
    </div>
  );
}

export default GuessList;
