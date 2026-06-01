"use client";

import { useEffect } from "react";
import { playClick, playBonk } from "@/lib/sounds";

/**
 * Global click sound: every button + link + [role="button"] plays a click
 * on press. Add `data-sound="bonk"` to an element to swap in the heavier
 * thock instead.
 *
 * The Web Audio context is created lazily on first user gesture, so the
 * very first click both unlocks the context and emits the sound.
 */
export function SoundLayer() {
  useEffect(() => {
    function onClick(e: MouseEvent) {
      const target = e.target as Element | null;
      if (!target) return;
      const hit = target.closest(
        'button, a[href], [role="button"]',
      ) as HTMLElement | null;
      if (!hit) return;
      const variant = hit.closest("[data-sound]") as HTMLElement | null;
      if (variant?.dataset.sound === "bonk") playBonk();
      else playClick();
    }
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  return null;
}
