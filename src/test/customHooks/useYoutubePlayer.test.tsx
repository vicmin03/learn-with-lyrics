import { renderHook, act } from "@testing-library/react";
import { describe, expect, test, vi } from "vitest";
import type { YouTubeEvent } from "react-youtube";

import useYouTubePlayer from "../../hooks/useYoutubePlayer";

describe("useYouTubePlayer", () => {
  test("starts as not ready", () => {
    const { result } = renderHook(() => useYouTubePlayer());

    expect(result.current.ready).toBe(false);
  });

  test("becomes ready when YouTube is ready", () => {
    const { result } = renderHook(() => useYouTubePlayer());

    const player = {
      playVideo: vi.fn(),
      pauseVideo: vi.fn(),
      seekTo: vi.fn(),
    };

    act(() => {
      result.current.onReady({
        target: player,
      } as unknown as YouTubeEvent);
    });

    expect(result.current.ready).toBe(true);
  });

  test("plays the video", () => {
    const { result } = renderHook(() => useYouTubePlayer());

    const player = {
      playVideo: vi.fn(),
      pauseVideo: vi.fn(),
      seekTo: vi.fn(),
    };

    act(() => {
      result.current.onReady({
        target: player,
      } as unknown as YouTubeEvent);
    });

    act(() => {
      result.current.play();
    });

    expect(player.playVideo).toHaveBeenCalledOnce();
  });

  test("updates isPlaying when the video is played and paused", () => {
    const { result } = renderHook(() => useYouTubePlayer());

    const player = {
      playVideo: vi.fn(),
      pauseVideo: vi.fn(),
      seekTo: vi.fn(),
    };

    act(() => {
      result.current.onReady({
        target: player,
      } as unknown as YouTubeEvent);
    });

    expect(result.current.isPlaying).toBe(false);

    act(() => {
      result.current.play();
    });

    expect(result.current.isPlaying).toBe(true);

    act(() => {
      result.current.pause();
    });

    expect(result.current.isPlaying).toBe(false);
  });

  test("pauses the video", () => {
    const { result } = renderHook(() => useYouTubePlayer());

    const player = {
      playVideo: vi.fn(),
      pauseVideo: vi.fn(),
      seekTo: vi.fn()
    };

    act(() => {
      result.current.onReady({
        target: player,
      } as unknown as YouTubeEvent);
    });

    act(() => {
      result.current.pause();
    });

    expect(player.pauseVideo).toHaveBeenCalledOnce();
  });

  test("seeks to a specific time", () => {
    const { result } = renderHook(() => useYouTubePlayer());

    const player = {
      playVideo: vi.fn(),
      pauseVideo: vi.fn(),
      seekTo: vi.fn(),
    };

    act(() => {
      result.current.onReady({
        target: player,
      } as unknown as YouTubeEvent);
    });

    act(() => {
      result.current.seek(42);
    });

    expect(player.seekTo).toHaveBeenCalledWith(42, true);
  });
});
