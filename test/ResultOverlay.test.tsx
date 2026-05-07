import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { CITIES, cityLabel } from "../src/lib/cities";
import ResultOverlay from "../src/lib/ResultOverlay";

const target = CITIES[0];

describe("ResultOverlay", () => {
  it("is hidden while playing", () => {
    render(
      <ResultOverlay
        status="playing"
        target={target}
        startNewRound={vi.fn()}
      />,
    );

    expect(screen.queryByText("Again")).not.toBeInTheDocument();
  });

  it("shows winner state and can start a new round", () => {
    const startNewRound = vi.fn();

    render(
      <ResultOverlay
        status="won"
        target={target}
        startNewRound={startNewRound}
      />,
    );

    expect(
      screen.getByText(
        (_, element) =>
          element?.textContent === `Correct! It was ${cityLabel(target)}.`,
      ),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Again" }));
    expect(startNewRound).toHaveBeenCalledTimes(1);
  });
});
