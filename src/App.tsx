import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Moon, Settings, Sun } from "lucide-react";
import ControlPillButton from "./components/ControlPillButton";
import InlineRegionSelector from "./components/InlineRegionSelector";
import Popup from "./components/Popup";
import Scorecard from "./components/Scorecard";
import SettingsModal from "./components/SettingsModal";
import { loadStats, recordGame, type GameStats } from "./lib/stats-store";
import GuessInput from "./lib/GuessInput";
import GuessList from "./lib/GuessList";
import Map from "./lib/Map";
import ResultOverlay from "./lib/ResultOverlay";
import {
  cityLabel,
  filterCities,
  cityLabels,
  POP_THRESHOLDS,
  type Region,
  type PopulationFilter,
} from "./lib/cities";
import {
  ZOOM_STEPS,
  createInitialState,
  submitGuess,
  type GameState,
  type SubmitResult,
} from "./lib/game-store";

const REGION_OPTIONS: { label: string; value: Region }[] = [
  { label: "U.S.", value: "US" },
  { label: "Americas", value: "Americas" },
  { label: "Europe", value: "EU" },
  { label: "Asia", value: "Asia" },
  { label: "World", value: "World" },
];

const POP_FILTER_ORDER: PopulationFilter[] = ["easy", "normal", "hard"];

const formatPopulationLabel = (population: number): string =>
  `${Math.round(population / 1000)}K`;

const POP_OPTIONS: { label: string; value: PopulationFilter }[] =
  POP_FILTER_ORDER.map((value) => ({
    label: formatPopulationLabel(POP_THRESHOLDS[value]),
    value,
  }));

const ACTIVE_GAME_STORAGE_KEY = "activeGame";

interface ActiveGameSnapshot {
  version: 1;
  region: Region;
  popFilter: PopulationFilter;
  game: GameState;
}

const isRegion = (value: unknown): value is Region =>
  value === "US" ||
  value === "Americas" ||
  value === "EU" ||
  value === "Asia" ||
  value === "World";

const isPopulationFilter = (value: unknown): value is PopulationFilter =>
  value === "easy" || value === "normal" || value === "hard";

const isGameStatus = (value: unknown): value is GameState["status"] =>
  value === "playing" || value === "won" || value === "lost";

const loadActiveGame = (): ActiveGameSnapshot | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(ACTIVE_GAME_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<ActiveGameSnapshot>;
    if (
      parsed.version !== 1 ||
      !isRegion(parsed.region) ||
      !isPopulationFilter(parsed.popFilter) ||
      !parsed.game
    ) {
      return null;
    }

    const game = parsed.game;
    if (
      !isGameStatus(game.status) ||
      !Array.isArray(game.guesses) ||
      typeof game.currentZoomLevel !== "number" ||
      !game.target
    ) {
      return null;
    }

    if (game.status !== "playing") {
      return null;
    }

    return {
      version: 1,
      region: parsed.region,
      popFilter: parsed.popFilter,
      game,
    };
  } catch {
    return null;
  }
};

function App() {
  const [initialActiveGame] = useState<ActiveGameSnapshot | null>(
    loadActiveGame,
  );

  const [region, setRegion] = useState<Region>(
    initialActiveGame?.region ?? "US",
  );
  const [popFilter, setPopFilter] = useState<PopulationFilter>(
    initialActiveGame?.popFilter ?? "normal",
  );

  const cities = useMemo(
    () => filterCities(region, popFilter),
    [region, popFilter],
  );
  const labels = useMemo(() => cityLabels(cities), [cities]);

  const [game, setGame] = useState<GameState>(
    () => initialActiveGame?.game ?? createInitialState(cities),
  );
  const [roundCounter, setRoundCounter] = useState(0);

  const [pendingRegion, setPendingRegion] = useState<Region | null>(null);
  const [pendingPopFilter, setPendingPopFilter] =
    useState<PopulationFilter | null>(null);

  const [stats, setStats] = useState<GameStats>(loadStats);
  const [showScorecard, setShowScorecard] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const prevStatusRef = useRef(game.status);

  const [distanceUnit, setDistanceUnit] = useState<"mi" | "km">(() => {
    if (typeof window === "undefined") return "mi";
    const saved = window.localStorage.getItem("distanceUnit");
    return saved === "km" ? "km" : "mi";
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    const saved = window.localStorage.getItem("theme");
    if (saved === "dark") return true;
    if (saved === "light") return false;
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", darkMode);
    window.localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  useEffect(() => {
    window.localStorage.setItem("distanceUnit", distanceUnit);
  }, [distanceUnit]);

  useEffect(() => {
    if (prevStatusRef.current === "playing" && game.status !== "playing") {
      const updated = recordGame(game.status === "won", game.guesses.length);
      setStats(updated);
      setShowScorecard(true);
    }
    prevStatusRef.current = game.status;
  }, [game.status, game.guesses.length]);

  useEffect(() => {
    if (game.status !== "playing") {
      window.localStorage.removeItem(ACTIVE_GAME_STORAGE_KEY);
      return;
    }

    const snapshot: ActiveGameSnapshot = {
      version: 1,
      region,
      popFilter,
      game,
    };

    window.localStorage.setItem(
      ACTIVE_GAME_STORAGE_KEY,
      JSON.stringify(snapshot),
    );
  }, [game, popFilter, region]);

  const isPlaying = game.status === "playing" && game.guesses.length > 0;

  const startNewRound = useCallback(
    (overrideCities?: typeof cities) => {
      const pool = overrideCities ?? cities;
      setGame(createInitialState(pool));
      setRoundCounter((prev) => prev + 1);
    },
    [cities],
  );

  const handleRegionChange = useCallback(
    (next: Region) => {
      if (next === region) return;
      if (isPlaying) {
        setPendingRegion(next);
      } else {
        setRegion(next);
        const newCities = filterCities(next, popFilter);
        startNewRound(newCities);
      }
    },
    [region, isPlaying, popFilter, startNewRound],
  );

  const handlePopFilterChange = useCallback(
    (next: PopulationFilter) => {
      if (next === popFilter) return;
      if (isPlaying) {
        setPendingPopFilter(next);
      } else {
        setPopFilter(next);
        const newCities = filterCities(region, next);
        startNewRound(newCities);
      }
    },
    [popFilter, isPlaying, region, startNewRound],
  );

  const confirmPending = useCallback(() => {
    const nextRegion = pendingRegion ?? region;
    const nextPop = pendingPopFilter ?? popFilter;
    if (pendingRegion) setRegion(pendingRegion);
    if (pendingPopFilter) setPopFilter(pendingPopFilter);
    setPendingRegion(null);
    setPendingPopFilter(null);
    const newCities = filterCities(nextRegion, nextPop);
    startNewRound(newCities);
  }, [pendingRegion, pendingPopFilter, region, popFilter, startNewRound]);

  const cancelPending = useCallback(() => {
    setPendingRegion(null);
    setPendingPopFilter(null);
  }, []);

  const handleSubmitGuess = useCallback((input: string): SubmitResult => {
    let submitResult: SubmitResult = { accepted: false, reason: "invalid" };
    setGame((prev) => {
      const { state, result } = submitGuess(prev, input);
      submitResult = result;
      return state;
    });
    return submitResult;
  }, []);

  const handleGiveUpRound = useCallback(() => {
    window.localStorage.removeItem(ACTIVE_GAME_STORAGE_KEY);
    setShowScorecard(false);
    startNewRound();
    setShowSettings(false);
  }, [startNewRound]);

  const handleViewScorecard = useCallback(() => {
    setShowSettings(false);
    setShowScorecard(true);
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <Popup
        open={pendingRegion !== null || pendingPopFilter !== null}
        title="Leave current game?"
        message="You have an active game in progress. Changing settings will start a new round."
        confirmLabel="New Round"
        cancelLabel="Stay"
        onConfirm={confirmPending}
        onCancel={cancelPending}
      />

      <SettingsModal
        open={showSettings}
        popFilter={popFilter}
        popOptions={POP_OPTIONS}
        distanceUnit={distanceUnit}
        onPopFilterChange={handlePopFilterChange}
        onDistanceUnitChange={setDistanceUnit}
        canGiveUp={game.status === "playing"}
        onGiveUp={handleGiveUpRound}
        onViewScorecard={handleViewScorecard}
        onClose={() => setShowSettings(false)}
      />

      <header className="relative z-[1200] border-b border-stone-300 bg-stone-50/90 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
        <div className="mx-auto flex w-full items-center justify-between gap-3 px-4 py-3 md:px-6">
          <div className="flex min-w-0 items-center gap-2 md:gap-3">
            <h1 className="text-base tracking-wider text-slate-900 dark:text-slate-100 md:text-lg">
              MIDDLE OF
            </h1>
            <InlineRegionSelector
              options={REGION_OPTIONS}
              value={region}
              onChange={handleRegionChange}
            />
          </div>
          <div className="flex items-center gap-2">
            <a
              href="https://github.com/sebseager/middle-of-somewhere"
              target="_blank"
              rel="noreferrer"
              aria-label="View project on GitHub"
              className="inline-flex h-8 w-8 items-center justify-center text-slate-600 transition hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-[18px] w-[18px]"
                fill="currentColor"
              >
                <path d="M12 0.5C5.373 0.5 0 5.873 0 12.5c0 5.302 3.438 9.8 8.205 11.387 0.6 0.11 0.82-0.26 0.82-0.577 0-0.285-0.01-1.04-0.016-2.043-3.338 0.726-4.042-1.609-4.042-1.609-0.546-1.386-1.333-1.755-1.333-1.755-1.09-0.745 0.083-0.73 0.083-0.73 1.205 0.085 1.84 1.237 1.84 1.237 1.07 1.834 2.807 1.304 3.492 0.997 0.108-0.775 0.418-1.304 0.762-1.604-2.665-0.303-5.467-1.333-5.467-5.933 0-1.31 0.468-2.382 1.235-3.222-0.124-0.303-0.535-1.524 0.117-3.176 0 0 1.008-0.323 3.3 1.23a11.48 11.48 0 0 1 3.004-0.404c1.018 0.005 2.043 0.138 3.004 0.404 2.29-1.553 3.296-1.23 3.296-1.23 0.654 1.652 0.243 2.873 0.12 3.176 0.77 0.84 1.233 1.912 1.233 3.222 0 4.61-2.807 5.627-5.48 5.922 0.43 0.37 0.823 1.103 0.823 2.223 0 1.606-0.015 2.902-0.015 3.296 0 0.32 0.216 0.694 0.825 0.576C20.565 22.296 24 17.8 24 12.5 24 5.873 18.627 0.5 12 0.5z" />
              </svg>
            </a>
            <ControlPillButton
              aria-label="Toggle light and dark mode"
              onClick={() => setDarkMode((prev) => !prev)}
              className="w-8 gap-1.5"
            >
              {darkMode ? (
                <Moon size={14} strokeWidth={2} aria-hidden="true" />
              ) : (
                <Sun size={14} strokeWidth={2} aria-hidden="true" />
              )}
            </ControlPillButton>
            <ControlPillButton
              aria-label="Open settings"
              onClick={() => setShowSettings(true)}
              className="w-8 gap-1.5"
            >
              <Settings size={14} strokeWidth={2} aria-hidden="true" />
            </ControlPillButton>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-4 md:px-6">
        <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-[minmax(280px,420px)_minmax(0,1fr)]">
          <section className="w-full min-w-0">
            <div className="relative z-0 mx-auto aspect-square w-full max-w-[420px] overflow-hidden rounded-2xl border border-stone-300 dark:border-slate-700 dark:shadow-black/35">
              <Map
                target={game.target}
                guesses={game.guesses}
                minZoom={ZOOM_STEPS[game.currentZoomLevel]}
                showResult={game.status !== "playing"}
                resultLabel={cityLabel(game.target)}
              />
              <ResultOverlay
                status={game.status}
                target={game.target}
                startNewRound={() => startNewRound()}
              />
            </div>
          </section>

          <section className="mx-auto mt-2 flex w-full min-w-0 max-w-[420px] flex-col gap-4 md:mx-0 md:max-w-none">
            <GuessInput
              labels={labels}
              status={game.status}
              submitGuess={handleSubmitGuess}
              roundKey={`${game.target.city}-${game.target.abbr}-${roundCounter}`}
            />
            <GuessList
              guesses={game.guesses}
              status={game.status}
              distanceUnit={distanceUnit}
            />
          </section>
        </div>
      </main>

      <footer className="mx-auto w-full max-w-5xl px-4 pb-5 text-center text-xs text-stone-600 md:px-6 dark:text-slate-400">
        Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics,
        and the GIS User Community
      </footer>

      <Scorecard
        open={showScorecard}
        stats={stats}
        status={game.status}
        target={game.target}
        lastGuessCount={game.status === "won" ? game.guesses.length : null}
        won={game.status === "won"}
        onClose={() => setShowScorecard(false)}
      />
    </div>
  );
}

export default App;
