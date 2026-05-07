import { useEffect, useRef, useState } from "react";
import { cityLabel, type City } from "./cities";
import PrimaryButton from "../components/PrimaryButton";

interface ResultOverlayProps {
  status: "playing" | "won" | "lost";
  target: City;
  startNewRound: () => void;
}

function ResultOverlay({ status, target, startNewRound }: ResultOverlayProps) {
  const messageRef = useRef<HTMLParagraphElement | null>(null);
  const [messageWraps, setMessageWraps] = useState(false);
  const targetLabel = cityLabel(target);

  useEffect(() => {
    if (status === "playing") {
      setMessageWraps(false);
      return;
    }

    const message = messageRef.current;
    if (!message) {
      return;
    }

    const updateWrapState = () => {
      const lineHeight = Number.parseFloat(
        window.getComputedStyle(message).lineHeight,
      );

      if (!Number.isFinite(lineHeight) || lineHeight <= 0) {
        setMessageWraps(false);
        return;
      }

      setMessageWraps(message.scrollHeight > lineHeight * 1.45);
    };

    updateWrapState();

    window.addEventListener("resize", updateWrapState);

    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(updateWrapState);
      resizeObserver.observe(message);
    }

    return () => {
      window.removeEventListener("resize", updateWrapState);
      resizeObserver?.disconnect();
    };
  }, [status, targetLabel]);

  if (status === "playing") {
    return null;
  }

  return (
    <div
      className={`absolute inset-x-3 bottom-3 z-[500] flex flex-col gap-2 rounded-2xl border border-stone-300 bg-white/95 p-3 shadow-lg shadow-black/20 backdrop-blur dark:border-slate-700 dark:bg-slate-900/95 ${
        messageWraps
          ? "md:items-start"
          : "md:flex-row md:items-center md:justify-between"
      }`}
    >
      {status === "won" ? (
        <p
          ref={messageRef}
          className="text-sm font-semibold text-emerald-700 dark:text-emerald-400"
        >
          Correct! It was <strong>{targetLabel}</strong>.
        </p>
      ) : (
        <p
          ref={messageRef}
          className="text-sm font-semibold text-rose-700 dark:text-rose-400"
        >
          The city was <strong>{targetLabel}</strong>.
        </p>
      )}
      <PrimaryButton
        onClick={startNewRound}
        className={`w-full h-6 ${messageWraps ? "md:w-full" : "md:w-auto"}`}
      >
        Again
      </PrimaryButton>
    </div>
  );
}

export default ResultOverlay;
