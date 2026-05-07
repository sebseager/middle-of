import { vi } from "vitest";
import {
  createCheckedTileLayer,
  latLngToTileCoords,
  probeMaxZoom,
  NO_DATA_SIZE_THRESHOLD,
} from "../src/lib/checked-tile-layer";

type FetchMock = (
  input: RequestInfo | URL,
  init?: RequestInit,
) => Promise<Response>;

const mockResponse = (blob: Blob): Response =>
  ({
    ok: true,
    status: 200,
    blob: async () => blob,
  }) as Response;

const failedResponse = (): Response =>
  ({
    ok: false,
    status: 404,
    blob: async () => new Blob(),
  }) as Response;

describe("latLngToTileCoords", () => {
  it("returns (0, 0) at zoom 0 for any location", () => {
    expect(latLngToTileCoords(40, -74, 0)).toEqual({ x: 0, y: 0 });
  });

  it("computes correct tile coords at zoom 2", () => {
    // New York City: lat 40.7128, lng -74.0060
    const { x, y } = latLngToTileCoords(40.7128, -74.006, 2);
    expect(x).toBe(1);
    expect(y).toBe(1);
  });

  it("handles negative longitude (western hemisphere)", () => {
    const { x } = latLngToTileCoords(0, -90, 2);
    expect(x).toBe(1);
  });

  it("handles southern hemisphere", () => {
    // Sydney: lat -33.87, lng 151.21
    const { x, y } = latLngToTileCoords(-33.87, 151.21, 4);
    expect(x).toBeGreaterThan(0);
    expect(y).toBeGreaterThan(0);
  });
});

describe("probeMaxZoom", () => {
  const tileUrl = "https://tiles.example.com/{z}/{y}/{x}.png";

  it("returns maxZoom when the top zoom has large tiles", async () => {
    const largeBlob = new Blob(
      [new Uint8Array(NO_DATA_SIZE_THRESHOLD + 1000)],
      { type: "image/jpeg" },
    );

    const fetchMock = vi.fn<FetchMock>(() =>
      Promise.resolve(mockResponse(largeBlob)),
    );

    const result = await probeMaxZoom(40.7, -74.0, tileUrl, 20, 1, {
      fetchImpl: fetchMock,
    });

    expect(result).toBe(20);
    // Should only fetch once - found data at maxZoom.
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("walks down zoom levels until it finds real data", async () => {
    const tinyBlob = new Blob([new Uint8Array(100)], { type: "image/png" });
    const largeBlob = new Blob([new Uint8Array(NO_DATA_SIZE_THRESHOLD + 500)], {
      type: "image/jpeg",
    });

    let callCount = 0;
    const fetchMock = vi.fn<FetchMock>(() => {
      callCount++;
      // First 3 calls (z=20,19,18) return tiny, z=17 returns large
      const blob = callCount <= 3 ? tinyBlob : largeBlob;
      return Promise.resolve(mockResponse(blob));
    });

    const result = await probeMaxZoom(40.7, -74.0, tileUrl, 20, 10, {
      fetchImpl: fetchMock,
    });

    expect(result).toBe(17);
    expect(fetchMock).toHaveBeenCalledTimes(4);
  });

  it("returns minZoom when no zoom level has data", async () => {
    const tinyBlob = new Blob([new Uint8Array(50)], { type: "image/png" });

    const fetchMock = vi.fn<FetchMock>(() =>
      Promise.resolve(mockResponse(tinyBlob)),
    );

    const result = await probeMaxZoom(40.7, -74.0, tileUrl, 5, 3, {
      fetchImpl: fetchMock,
    });

    expect(result).toBe(3);
    // Should have tried z=5, 4, 3
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it("skips zoom levels where fetch fails", async () => {
    const largeBlob = new Blob([new Uint8Array(NO_DATA_SIZE_THRESHOLD + 100)], {
      type: "image/jpeg",
    });

    let callCount = 0;
    const fetchMock = vi.fn<FetchMock>(() => {
      callCount++;
      if (callCount === 1) return Promise.reject(new Error("network error"));
      return Promise.resolve(mockResponse(largeBlob));
    });

    const result = await probeMaxZoom(40.7, -74.0, tileUrl, 20, 1, {
      fetchImpl: fetchMock,
    });

    // z=20 fails, z=19 succeeds
    expect(result).toBe(19);
  });

  it("skips zoom levels where server returns non-ok status", async () => {
    const largeBlob = new Blob([new Uint8Array(NO_DATA_SIZE_THRESHOLD + 100)], {
      type: "image/jpeg",
    });

    let callCount = 0;
    const fetchMock = vi.fn<FetchMock>(() => {
      callCount++;
      if (callCount === 1) return Promise.resolve(failedResponse());
      return Promise.resolve(mockResponse(largeBlob));
    });

    const result = await probeMaxZoom(40.7, -74.0, tileUrl, 20, 1, {
      fetchImpl: fetchMock,
    });

    expect(result).toBe(19);
  });

  it("constructs correct tile URLs from the template", async () => {
    const largeBlob = new Blob([new Uint8Array(NO_DATA_SIZE_THRESHOLD + 100)], {
      type: "image/jpeg",
    });

    const fetchMock = vi.fn<FetchMock>(() =>
      Promise.resolve(mockResponse(largeBlob)),
    );

    await probeMaxZoom(0, 0, tileUrl, 5, 5, { fetchImpl: fetchMock });

    const calledUrl = String(fetchMock.mock.calls[0][0]);
    expect(calledUrl).toMatch(
      /^https:\/\/tiles\.example\.com\/5\/\d+\/\d+\.png$/,
    );
  });
});

describe("createCheckedTileLayer", () => {
  it("creates a TileLayer with the given options", () => {
    const { layer } = createCheckedTileLayer(
      "https://tiles.example.com/{z}/{y}/{x}.png",
      { maxZoom: 18, attribution: "test" },
    );

    expect(layer).toBeDefined();
    expect(layer.options.maxZoom).toBe(18);
    expect(layer.options.attribution).toBe("test");
  });
});
