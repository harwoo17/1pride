"use client";

import { useCallback, useEffect, useState } from "react";
import { PixelFootball, PixelLion } from "./pixel-sprites";
import {
  isMuted,
  playBonk,
  playCheer,
  playClick,
  playDing,
  playWhoosh,
  setMuted,
} from "@/lib/sounds";

type Phase =
  | "gate"      // big PRESS START button, before user gesture
  | "warmup"    // 2 lions stand idle, balls visible up top
  | "drop"      // footballs whoosh in from above
  | "bonked"    // impact: X eyes, screen shake
  | "recover"   // hard hats appear, lions stand up
  | "stamp"     // "1PRIDE" stamps in, ding
  | "exit"      // fade out
  | "done";     // unmounted

const SESSION_KEY = "1pride-intro-seen";

export function Intro() {
  const [phase, setPhase] = useState<Phase>("gate");
  const [muted, setMutedState] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.sessionStorage.getItem(SESSION_KEY) === "1") {
      setPhase("done");
    }
  }, []);

  const finish = useCallback(() => {
    setPhase("exit");
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(SESSION_KEY, "1");
    }
    setTimeout(() => setPhase("done"), 500);
  }, []);

  const begin = useCallback(() => {
    playClick();
    setPhase("warmup");

    // Sequence the rest. Times in ms, sound effects delayed in Web Audio
    // to stay locked to the visual beats.
    setTimeout(() => {
      setPhase("drop");
      playWhoosh(0, 0.5);
    }, 400);
    setTimeout(() => {
      setPhase("bonked");
      playBonk(0);
      playBonk(0.08); // second ball, slightly offset
    }, 900);
    setTimeout(() => {
      setPhase("recover");
      playCheer(0, 0.7);
    }, 1700);
    setTimeout(() => {
      setPhase("stamp");
      playDing(0);
    }, 2500);
    setTimeout(() => {
      finish();
    }, 4000);
  }, [finish]);

  const skip = useCallback(() => {
    playClick();
    finish();
  }, [finish]);

  const toggleMute = useCallback(() => {
    const next = !isMuted();
    setMuted(next);
    setMutedState(next);
  }, []);

  // Esc key to skip
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (phase === "done" || phase === "exit") return;
      if (phase === "gate" && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        begin();
      } else if (e.key === "Escape") {
        skip();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [phase, begin, skip]);

  if (phase === "done") return null;

  const showSprites = phase !== "gate";
  const showHats = phase === "recover" || phase === "stamp";
  const lionsState: "normal" | "bonked" | "hardhat" = showHats
    ? "hardhat"
    : phase === "bonked"
      ? "bonked"
      : "normal";

  return (
    <div
      role="dialog"
      aria-label="1PRIDE intro animation"
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#ffcb05] text-[var(--lions-charcoal)] transition-opacity duration-500 ${
        phase === "exit" ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
    >
      {/* Stadium-stripe background, very subtle */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, rgba(15,19,24,0.04) 0 1px, transparent 1px 80px)",
        }}
      />

      {/* Header strip */}
      <div className="absolute left-0 right-0 top-0 border-b-2 border-[var(--lions-charcoal)] bg-[var(--lions-charcoal)] px-6 py-2 font-display text-xs font-bold uppercase tracking-[0.25em] text-[#ffcb05] flex items-center justify-between">
        <span>1PRIDE · Pregame</span>
        <span className="font-mono text-[10px] tracking-wider text-[#ffcb05]/70">
          PRESS ENTER · ESC TO SKIP
        </span>
      </div>

      {/* Mute toggle (bottom-right) */}
      <button
        onClick={toggleMute}
        className="absolute bottom-4 right-4 border-2 border-[var(--lions-charcoal)] bg-white px-3 py-1 font-display text-xs font-bold uppercase tracking-wider hover:bg-[var(--lions-charcoal)] hover:text-[#ffcb05]"
      >
        {muted ? "Sound Off" : "Sound On"}
      </button>

      {/* Skip button */}
      {phase !== "gate" && phase !== "exit" && (
        <button
          onClick={skip}
          className="absolute bottom-4 left-4 border-2 border-[var(--lions-charcoal)] bg-white px-3 py-1 font-display text-xs font-bold uppercase tracking-wider hover:bg-[var(--lions-charcoal)] hover:text-[#ffcb05]"
        >
          Skip ⏵
        </button>
      )}

      {/* Hero */}
      <div className="relative flex flex-col items-center gap-8">
        {phase === "gate" && (
          <>
            <h1 className="font-display text-7xl font-black uppercase tracking-tight sm:text-8xl">
              1PRIDE
            </h1>
            <p className="max-w-md text-center font-display text-base font-bold uppercase tracking-wider">
              Lions Analytics · Campbell Era
            </p>
            <button
              onClick={begin}
              className="group relative flex items-center gap-3 border-4 border-[var(--lions-charcoal)] bg-[var(--lions-charcoal)] px-8 py-4 font-display text-2xl font-black uppercase tracking-wider text-[#ffcb05] shadow-[6px_6px_0_var(--lions-blue)] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_var(--lions-blue)]"
            >
              <span className="inline-block h-3 w-3 animate-pulse rounded-full bg-[#ffcb05]" />
              Press Start
            </button>
            <p className="font-mono text-[10px] tracking-[0.25em] text-[var(--lions-charcoal)]/60">
              SOUND ON · CLICK / ENTER TO BEGIN
            </p>
          </>
        )}

        {showSprites && (
          <>
            {/* Title (visible after stamp) */}
            <div className="flex flex-col items-center gap-2">
              <div
                className={`font-display text-7xl font-black uppercase tracking-tight transition-all duration-300 sm:text-8xl ${
                  phase === "stamp"
                    ? "scale-100 opacity-100"
                    : "scale-50 opacity-0"
                }`}
              >
                1PRIDE
              </div>
              {phase === "stamp" && (
                <div className="border-2 border-[var(--lions-charcoal)] bg-white px-3 py-0.5 font-display text-xs font-bold uppercase tracking-[0.2em]">
                  Ready
                </div>
              )}
            </div>

            {/* Two lions */}
            <div
              className={`relative flex items-end gap-12 ${
                phase === "bonked" ? "animate-[shake_0.25s_linear]" : ""
              }`}
            >
              <div className="relative">
                <FallingBall
                  visible={phase === "drop"}
                  hidden={phase !== "drop"}
                />
                <PixelLion state={lionsState} accent="blue" />
              </div>
              <div className="relative">
                <FallingBall
                  visible={phase === "drop"}
                  hidden={phase !== "drop"}
                  delayMs={120}
                />
                <PixelLion state={lionsState} accent="silver" />
              </div>
            </div>

            {/* Caption */}
            <div className="h-6 font-display text-sm font-bold uppercase tracking-[0.2em] text-[var(--lions-charcoal)]/80">
              {phase === "warmup" && "Lions, ready up..."}
              {phase === "drop" && "Incoming…"}
              {phase === "bonked" && "Ow."}
              {phase === "recover" && "Hard hats on."}
              {phase === "stamp" && "Let's roll."}
            </div>
          </>
        )}
      </div>

      {/* Animations — defined inline so the component is self-contained */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translate(0, 0); }
          20% { transform: translate(-4px, 2px); }
          40% { transform: translate(4px, -2px); }
          60% { transform: translate(-3px, 3px); }
          80% { transform: translate(3px, -1px); }
        }
        @keyframes ball-fall {
          0%   { transform: translate(-50%, -260px) rotate(-20deg); opacity: 0; }
          15%  { opacity: 1; }
          90%  { transform: translate(-50%, -10px) rotate(15deg); opacity: 1; }
          100% { transform: translate(-50%, 0)   rotate(20deg); opacity: 1; }
        }
        .ball-fall {
          animation: ball-fall 0.5s cubic-bezier(.5,.1,.9,1) forwards;
        }
      `}</style>
    </div>
  );
}

function FallingBall({
  visible,
  hidden,
  delayMs = 0,
}: {
  visible: boolean;
  hidden?: boolean;
  delayMs?: number;
}) {
  if (hidden) return null;
  return (
    <div
      aria-hidden="true"
      className={`absolute left-1/2 -top-2 ${
        visible ? "ball-fall" : "invisible"
      }`}
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <PixelFootball />
    </div>
  );
}
