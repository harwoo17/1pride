"use client";

import { useEffect } from "react";
import { playClick, playBonk, playDing, playRoar } from "@/lib/sounds";

/**
 * Global click sound + first-interaction roar.
 *
 *  - First click anywhere fires a soft Lion roar (the same audio identity
 *    as the Intro splash, but quieter and one-shot).
 *  - Subsequent clicks pick a sound by element type:
 *      * `data-sound="bonk"|"ding"|"roar"|"click"` → explicit override
 *      * Big display-font buttons (primary CTAs) → `playBonk`
 *      * `.level-icon` containers (depth-chart cards) → `playDing`
 *      * Everything else → `playClick`
 */
export function SoundLayer() {
  useEffect(() => {
    let firstInteractionPassed = false;

    function onClick(e: MouseEvent) {
      const target = e.target as Element | null;
      if (!target) return;
      const hit = target.closest(
        'button, a[href], [role="button"]',
      ) as HTMLElement | null;
      if (!hit) return;

      // First-interaction roar — soft, sits underneath the click sound
      if (!firstInteractionPassed) {
        firstInteractionPassed = true;
        playRoar(0.04, 0.35);
      }

      // Explicit override via data-sound on the element or any ancestor
      const variant = hit.closest("[data-sound]") as HTMLElement | null;
      switch (variant?.dataset.sound) {
        case "bonk":
          return playBonk();
        case "ding":
          return playDing();
        case "roar":
          return playRoar(0.04, 0.55);
        case "click":
          return playClick();
      }

      // Heuristics
      if (hit.closest(".level-icon")) return playDing();
      const isPrimaryCta =
        hit.classList.contains("font-display") &&
        (hit.classList.contains("font-black") ||
          hit.classList.contains("font-bold"));
      if (isPrimaryCta) return playBonk();
      playClick();
    }

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);
  return null;
}
