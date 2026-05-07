import { render, screen } from "@testing-library/react";
import GuessList from "../src/lib/GuessList";

describe("GuessList", () => {
  it("renders inline distance content and a remaining-guesses placeholder", () => {
    render(
      <GuessList
        status="playing"
        distanceUnit="mi"
        guesses={[
          {
            input: "Phoenix, Arizona",
            correct: false,
            milesAway: 1200,
            lat: 33.4484,
            lng: -112.074,
          },
          {
            input: "Tucson, Arizona",
            correct: true,
            milesAway: 0,
            lat: 32.2226,
            lng: -110.9747,
          },
        ]}
      />,
    );

    expect(screen.getByLabelText("Guess history")).toBeInTheDocument();
    expect(screen.getByText("Phoenix, Arizona (1200 mi)")).toBeInTheDocument();
    expect(screen.getByText("Tucson, Arizona")).toBeInTheDocument();
    const placeholderLabel = screen.getByText("4 guesses to go");
    expect(placeholderLabel).toBeInTheDocument();

    const placeholderMarker = placeholderLabel.previousElementSibling;
    expect(placeholderMarker).toBeInTheDocument();
    expect(placeholderMarker?.nodeName.toLowerCase()).toBe("svg");

    const placeholderRing = placeholderMarker?.querySelector("circle");
    expect(placeholderRing).toBeInTheDocument();
    expect(placeholderRing).toHaveAttribute("stroke-dasharray");
  });

  it("shows final placeholder copy when one guess remains", () => {
    render(
      <GuessList
        status="playing"
        distanceUnit="mi"
        guesses={[
          {
            input: "A",
            correct: false,
            milesAway: 1,
            lat: 0,
            lng: 0,
          },
          {
            input: "B",
            correct: false,
            milesAway: 2,
            lat: 0,
            lng: 0,
          },
          {
            input: "C",
            correct: false,
            milesAway: 3,
            lat: 0,
            lng: 0,
          },
          {
            input: "D",
            correct: false,
            milesAway: 4,
            lat: 0,
            lng: 0,
          },
          {
            input: "E",
            correct: false,
            milesAway: 5,
            lat: 0,
            lng: 0,
          },
        ]}
      />,
    );

    expect(screen.getByText("Last guess, make it count!")).toBeInTheDocument();
  });
});
