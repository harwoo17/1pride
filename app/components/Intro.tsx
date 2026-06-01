"use client";

import { useCallback, useEffect, useState } from "react";
import {
  PixelFootball,
  PixelLion,
  type LionExpression,
} from "./pixel-sprites";
import {
  isMuted,
  playBonk,
  playCheer,
  playClick,
  playDing,
  playRoar,
  playWhoosh,
  preloadRoar,
  setMuted,
} from "@/lib/sounds";

type Phase =
  | "gate"      // big PRESS START button, before user gesture
  | "warmup"    // 2 lion heads stand idle, no balls yet
  | "drop"      // footballs whoosh in from above
  | "bonked"    // impact: X eyes, screen shake
  | "recover"   // lions back to normal, "shake it off" beat
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
    // Kick off the roar download in the background so it's decoded by
    // the time the user clicks Press Start.
    preloadRoar();
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
    // Roar fires immediately on Start — the kneecap-bite calling card.
    playRoar(0.05);
    setPhase("warmup");

    setTimeout(() => {
      setPhase("drop");
      playWhoosh(0, 0.55);
    }, 600);
    setTimeout(() => {
      setPhase("bonked");
      playBonk(0);
      playBonk(0.08);
    }, 1200);
    setTimeout(() => {
      setPhase("recover");
      playCheer(0, 0.8);
    }, 2100);
    setTimeout(() => {
      setPhase("stamp");
      playDing(0);
    }, 3100);
    setTimeout(() => {
      finish();
    }, 4700);
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
  const lionExpression: LionExpression =
    phase === "drop"
      ? "alert"
      : phase === "bonked"
        ? "stunned"
        : phase === "recover"
          ? "dazed"
          : phase === "stamp"
            ? "determined"
            : "ready"; // warmup + fallback

  return (
    <div
      role="dialog"
      aria-label="1PRIDE intro animation"
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center text-white transition-opacity duration-500 ${
        phase === "exit" ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      style={{ backgroundColor: "#0076B6" }}
    >
      {/* Field-stripe overlay — subtle silver gridlines for that scoreboard feel */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, rgba(255,255,255,0.06) 0 1px, transparent 1px 80px)," +
            "repeating-linear-gradient(0deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 60px)",
        }}
      />

      {/* Header strip */}
      <div className="absolute left-0 right-0 top-0 flex items-center justify-between border-b-2 border-[#B0B7BC] bg-[#0076B6] px-6 py-2 font-display text-xs font-bold uppercase tracking-[0.25em] text-[#FFFFFF]">
        <span>1PRIDE · Pregame</span>
        <span className="font-mono text-[10px] tracking-wider text-[#B0B7BC]/70">
          PRESS ENTER · ESC TO SKIP
        </span>
      </div>

      {/* Mute toggle */}
      <button
        onClick={toggleMute}
        className="absolute bottom-4 right-4 border-2 border-white bg-transparent px-3 py-1 font-display text-xs font-bold uppercase tracking-wider text-white hover:bg-white hover:text-[#0076B6]"
      >
        {muted ? "Sound Off" : "Sound On"}
      </button>

      {phase !== "gate" && phase !== "exit" && (
        <button
          onClick={skip}
          className="absolute bottom-4 left-4 border-2 border-white bg-transparent px-3 py-1 font-display text-xs font-bold uppercase tracking-wider text-white hover:bg-white hover:text-[#0076B6]"
        >
          Skip ⏵
        </button>
      )}

      <div className="relative flex flex-col items-center gap-10">
        {phase === "gate" && (
          <>
            <h1 className="font-display text-7xl font-black uppercase tracking-tight text-white sm:text-9xl">
              1PRIDE
            </h1>
            <p className="max-w-md text-center font-display text-base font-bold uppercase tracking-[0.2em] text-[#B0B7BC]">
              Lions Analytics · Campbell Era
            </p>
            <button
              onClick={begin}
              className="group relative flex items-center gap-3 border-4 border-white bg-white px-10 py-5 font-display text-3xl font-black uppercase tracking-wider text-[#0076B6] shadow-[8px_8px_0_#0f1318] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0_#0f1318]"
            >
              <span className="inline-block h-3 w-3 animate-pulse rounded-full bg-[#0076B6]" />
              Press Start
            </button>
            <p className="font-mono text-[10px] tracking-[0.25em] text-white/70">
              SOUND ON · CLICK / ENTER TO BEGIN
            </p>
          </>
        )}

        {showSprites && (
          <>
            {/* Title (scales in at stamp) */}
            <div className="flex flex-col items-center gap-2">
              <div
                className={`font-display font-black uppercase leading-none tracking-tight text-white transition-all duration-300 ${
                  phase === "stamp"
                    ? "scale-100 text-7xl opacity-100 sm:text-9xl"
                    : "scale-50 text-7xl opacity-0 sm:text-9xl"
                }`}
              >
                1PRIDE
              </div>
              {phase === "stamp" && (
                <div className="border-2 border-white bg-transparent px-3 py-0.5 font-display text-xs font-bold uppercase tracking-[0.2em] text-white">
                  Ready
                </div>
              )}
            </div>

            {/* The two lion heads */}
            <div
              className={`relative flex items-end gap-8 sm:gap-16 ${
                phase === "bonked" ? "animate-[shake_0.3s_linear]" : ""
              }`}
            >
              <div className="relative">
                <FallingBall visible={phase === "drop"} />
                <PixelLion state={lionExpression} />
              </div>
              <div className="relative">
                <FallingBall visible={phase === "drop"} delayMs={120} />
                <PixelLion state={lionExpression} />
              </div>
            </div>

            <div className="h-6 font-display text-base font-bold uppercase tracking-[0.25em] text-white/90">
              {phase === "warmup" && "Lions, ready up…"}
              {phase === "drop" && "Incoming…"}
              {phase === "bonked" && "Ow."}
              {phase === "recover" && "Shake it off."}
              {phase === "stamp" && "Let's roll."}
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translate(0, 0); }
          15% { transform: translate(-6px, 3px); }
          30% { transform: translate(6px, -3px); }
          45% { transform: translate(-4px, 4px); }
          60% { transform: translate(4px, -2px); }
          75% { transform: translate(-3px, 2px); }
          90% { transform: translate(2px, -1px); }
        }
        @keyframes ball-fall {
          0%   { transform: translate(-50%, -380px) rotate(-30deg); opacity: 0; }
          15%  { opacity: 1; }
          90%  { transform: translate(-50%, -10px) rotate(20deg); opacity: 1; }
          100% { transform: translate(-50%, 0) rotate(25deg); opacity: 1; }
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
  delayMs = 0,
}: {
  visible: boolean;
  delayMs?: number;
}) {
  if (!visible) return null;
  return (
    <div
      aria-hidden="true"
      className="absolute left-1/2 -top-2 ball-fall"
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <PixelFootball />
    </div>
  );
}
