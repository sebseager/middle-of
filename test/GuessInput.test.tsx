import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";
import GuessInput from "../src/lib/GuessInput";

describe("GuessInput", () => {
  it("submits via callback and clears input on success", () => {
    const submitGuess = vi.fn(() => ({ accepted: true as const }));

    render(
      <GuessInput
        labels={["Phoenix, Arizona", "Tucson, Arizona"]}
        status="playing"
        submitGuess={submitGuess}
        roundKey="round-1"
      />,
    );

    const input = screen.getByRole("combobox");
    const button = screen.getByRole("button", { name: "Guess" });

    fireEvent.change(input, { target: { value: "Phoenix, Arizona" } });
    fireEvent.click(button);

    expect(submitGuess).toHaveBeenCalledWith("Phoenix, Arizona");
    expect(input).toHaveValue("");
    expect(screen.queryByText("Already guessed.")).not.toBeInTheDocument();
  });

  it("shows duplicate error and keeps value", () => {
    const submitGuess = vi.fn(() => ({
      accepted: false as const,
      reason: "duplicate" as const,
    }));

    render(
      <GuessInput
        labels={["Phoenix, Arizona"]}
        status="playing"
        submitGuess={submitGuess}
        roundKey="round-1"
      />,
    );

    const input = screen.getByRole("combobox");

    fireEvent.change(input, { target: { value: "Phoenix, Arizona" } });
    fireEvent.submit(
      screen
        .getByRole("button", { name: "Guess" })
        .closest("form") as HTMLFormElement,
    );

    expect(screen.getByText("Already guessed.")).toBeInTheDocument();
    expect(input).toHaveValue("Phoenix, Arizona");
  });

  it("disables controls when game is not playing", () => {
    const submitGuess = vi.fn(() => ({ accepted: true as const }));

    render(
      <GuessInput
        labels={["Phoenix, Arizona"]}
        status="won"
        submitGuess={submitGuess}
        roundKey="round-1"
      />,
    );

    expect(screen.getByRole("combobox")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Guess" })).toBeDisabled();
  });

  it("shows suggestions only after three characters and does not cap results", () => {
    const submitGuess = vi.fn(() => ({ accepted: true as const }));
    const labels = [
      "Belfast, Northern Ireland",
      "Belgrade, Serbia",
      "Belmopan, Belize",
      "Belo Horizonte, Brazil",
    ];

    render(
      <GuessInput
        labels={labels}
        status="playing"
        submitGuess={submitGuess}
        roundKey="round-1"
      />,
    );

    const input = screen.getByRole("combobox");

    fireEvent.change(input, { target: { value: "be" } });
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();

    fireEvent.change(input, { target: { value: "bel" } });
    expect(screen.getByRole("listbox")).toBeInTheDocument();
    expect(screen.getAllByRole("option")).toHaveLength(labels.length);
  });
});
