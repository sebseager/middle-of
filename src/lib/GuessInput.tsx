import { useEffect, useRef, useState, type FormEvent } from "react";
import PrimaryButton from "../components/PrimaryButton";
import CityDropdown, { type CityDropdownHandle } from "./CityDropdown";
import type { SubmitResult } from "./game-store";

interface GuessInputProps {
  labels: string[];
  status: "playing" | "won" | "lost";
  submitGuess: (input: string) => SubmitResult;
  roundKey: string;
}

function GuessInput({
  labels,
  status,
  submitGuess,
  roundKey,
}: GuessInputProps) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const dropdownRef = useRef<CityDropdownHandle | null>(null);

  useEffect(() => {
    setValue("");
    setError("");
    dropdownRef.current?.focus();
  }, [roundKey]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (status !== "playing") {
      return;
    }

    const result = submitGuess(value);
    if (!result.accepted) {
      setError(
        result.reason === "duplicate"
          ? "Already guessed."
          : "Please choose a city from the list.",
      );
      return;
    }

    setError("");
    setValue("");
    dropdownRef.current?.blur();
  };

  return (
    <>
      <form
        className="relative z-40 flex w-full min-w-0 items-stretch gap-4"
        onSubmit={onSubmit}
      >
        <CityDropdown
          ref={dropdownRef}
          labels={labels}
          value={value}
          onChange={setValue}
          disabled={status !== "playing"}
        />
        <PrimaryButton
          className="py-2.5"
          type="submit"
          disabled={status !== "playing"}
        >
          Guess
        </PrimaryButton>
      </form>
      {error && (
        <p className="mt-1 text-center text-xs font-semibold text-rose-600 dark:text-rose-400">
          {error}
        </p>
      )}
    </>
  );
}

export default GuessInput;
