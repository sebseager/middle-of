import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { ChevronDown } from "lucide-react";
import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

interface InlineRegionSelectorProps<T extends string> {
  options: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
}

function InlineRegionSelector<T extends string>({
  options,
  value,
  onChange,
}: InlineRegionSelectorProps<T>) {
  const [open, setOpen] = useState(false);
  const [anchorWidth, setAnchorWidth] = useState<number | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const listboxId = useId();
  const motionId = useId();
  const shellLayoutId = `${motionId}-selector-shell`;
  const labelLayoutId = `${motionId}-selector-label`;
  const iconLayoutId = `${motionId}-selector-icon`;
  const shellTransition = {
    type: "spring" as const,
    stiffness: 640,
    damping: 40,
    mass: 0.5,
  };

  const activeOption = useMemo(
    () => options.find((option) => option.value === value) ?? options[0],
    [options, value],
  );

  const updateAnchorWidth = useCallback(() => {
    const nextWidth = triggerRef.current?.offsetWidth;
    if (!nextWidth) {
      return;
    }

    setAnchorWidth((currentWidth) =>
      currentWidth === nextWidth ? currentWidth : nextWidth,
    );
  }, []);

  useLayoutEffect(() => {
    if (!open) {
      updateAnchorWidth();
    }
  }, [open, activeOption?.label, updateAnchorWidth]);

  useEffect(() => {
    const handleResize = () => {
      if (!open) {
        updateAnchorWidth();
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [open, updateAnchorWidth]);

  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!rootRef.current?.contains(target)) {
        setOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleDocumentClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  if (!activeOption) {
    return null;
  }

  return (
    <div
      ref={rootRef}
      className="relative z-[2000] h-9 -ml-1"
      style={anchorWidth ? { width: `${anchorWidth}px` } : undefined}
    >
      <LayoutGroup>
        <AnimatePresence initial={false}>
          {!open ? (
            <motion.button
              key="pill"
              ref={triggerRef}
              layoutId={shellLayoutId}
              type="button"
              aria-haspopup="listbox"
              aria-label="Select region"
              aria-expanded={false}
              aria-controls={listboxId}
              onClick={() => setOpen(true)}
              transition={shellTransition}
              className="flex h-9 items-center justify-between gap-2 rounded-full border border-stone-300 bg-white pl-4 pr-3 text-slate-900 shadow-sm shadow-black/5 transition-colors hover:bg-stone-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
            >
              <motion.span
                layoutId={labelLayoutId}
                className="whitespace-nowrap text-base font-medium uppercase tracking-wider"
              >
                {activeOption.label}
              </motion.span>
              <motion.span layoutId={iconLayoutId} className="shrink-0">
                <ChevronDown size={14} strokeWidth={2.25} aria-hidden="true" />
              </motion.span>
            </motion.button>
          ) : (
            <motion.div
              key="dropdown"
              layoutId={shellLayoutId}
              transition={shellTransition}
              className="absolute left-0 top-0 w-[15rem] origin-top-left overflow-hidden rounded-2xl border border-stone-300 bg-white text-slate-900 shadow-2xl shadow-black/25 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              <button
                type="button"
                aria-haspopup="listbox"
                aria-label="Close region selector"
                aria-expanded={true}
                aria-controls={listboxId}
                onClick={() => setOpen(false)}
                className="flex h-9 w-full items-center justify-between gap-2 pl-4 pr-3"
              >
                <motion.span
                  layoutId={labelLayoutId}
                  className="text-sm font-medium italic normal-case tracking-normal text-stone-500 dark:text-slate-400"
                >
                  SOMEWHERE
                </motion.span>
                <motion.span layoutId={iconLayoutId} className="shrink-0">
                  <ChevronDown
                    size={14}
                    strokeWidth={2.25}
                    aria-hidden="true"
                    className="rotate-180"
                  />
                </motion.span>
              </button>

              <motion.ul
                id={listboxId}
                role="listbox"
                aria-label="Region options"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -2 }}
                transition={{ duration: 0.12, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-1 px-1.5 pb-1.5"
              >
                {options.map((option) => {
                  const selected = option.value === value;

                  return (
                    <li key={option.value}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={selected}
                        onClick={() => {
                          onChange(option.value);
                          setOpen(false);
                        }}
                        className={`w-full rounded-xl px-3 py-2 text-left text-sm font-semibold uppercase tracking-wide transition ${
                          selected
                            ? "bg-rose-600 text-white"
                            : "text-slate-700 hover:bg-stone-100 dark:text-slate-200 dark:hover:bg-slate-700"
                        }`}
                      >
                        {option.label}
                      </button>
                    </li>
                  );
                })}
              </motion.ul>
            </motion.div>
          )}
        </AnimatePresence>
      </LayoutGroup>
    </div>
  );
}

export default InlineRegionSelector;
