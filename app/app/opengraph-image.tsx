// Edge-rendered Open Graph image for the L5 app.
// Returns a 1200×630 PNG that every link share (LinkedIn, Twitter,
// iMessage, Slack) previews. Next.js auto-wires it to /opengraph-image
// and emits matching meta tags on every page that doesn't override.

import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "1PRIDE — Lions Analytics, Campbell Era";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const LIONS_BLUE = "#0076B6";
const LIONS_BLUE_DEEP = "#002a47";
const SILVER = "#B0B7BC";
const SILVER_LIGHT = "#d8dde0";
const SILVER_DARK = "#6a7178";
const INK = "#0a1929";

export default async function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "column",
          backgroundColor: LIONS_BLUE,
          color: "#ffffff",
          fontFamily: "system-ui, -apple-system, Helvetica, Arial, sans-serif",
        }}
      >
        {/* ─── Header strip (fixed 70px) ─────────────────────────────── */}
        <div
          style={{
            display: "flex",
            height: 70,
            flexShrink: 0,
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 48px",
            backgroundColor: LIONS_BLUE_DEEP,
            color: SILVER,
            fontSize: 16,
            fontWeight: 700,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            borderBottom: `2px solid ${SILVER}`,
          }}
        >
          <span style={{ display: "flex" }}>1PRIDE · LIONS ANALYTICS</span>
          <span
            style={{
              display: "flex",
              color: SILVER_LIGHT,
              fontFamily: "monospace",
              fontSize: 13,
            }}
          >
            EST. 2021 · CAMPBELL ERA
          </span>
        </div>

        {/* ─── Body (fixed 410px) ────────────────────────────────────── */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            height: 410,
            flexShrink: 0,
            padding: "0 60px",
            // Subtle vertical stripes for field-feel
            backgroundImage:
              "repeating-linear-gradient(90deg, rgba(255,255,255,0.04) 0 1px, transparent 1px 80px)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 14,
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: SILVER_LIGHT,
              marginBottom: 14,
            }}
          >
            <span style={{ display: "flex", width: 34, height: 4, background: "#ffffff" }} />
            <span style={{ display: "flex" }}>Season 2025 · Regular Season</span>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 124,
              fontWeight: 900,
              letterSpacing: "-0.03em",
              textTransform: "uppercase",
              lineHeight: 0.92,
              color: "#ffffff",
            }}
          >
            <span style={{ display: "flex" }}>Don't blink.</span>
            <span style={{ display: "flex", color: SILVER }}>Bite the kneecap.</span>
          </div>
        </div>

        {/* ─── Bottom stat strip (fixed 150px) ───────────────────────── */}
        <div
          style={{
            display: "flex",
            height: 150,
            flexShrink: 0,
            backgroundColor: "#ffffff",
            color: INK,
            padding: "20px 48px",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: `4px solid ${LIONS_BLUE}`,
          }}
        >
          <div style={{ display: "flex", gap: 56 }}>
            <StatBlock label="Record" value="9–8" />
            <StatBlock label="PPG" value="29.6" />
            <StatBlock label="Plays Tracked" value="248K" />
            <StatBlock label="Seasons" value="2021–25" />
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              fontFamily: "monospace",
              fontSize: 13,
              letterSpacing: "0.2em",
              color: SILVER_DARK,
            }}
          >
            <span
              style={{
                display: "flex",
                fontSize: 22,
                fontWeight: 900,
                color: LIONS_BLUE,
                letterSpacing: 0,
                fontFamily: "system-ui, sans-serif",
              }}
            >
              1pride.app
            </span>
            <span style={{ display: "flex", marginTop: 6 }}>L5 CAPSTONE</span>
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}

function StatBlock({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
      <span
        style={{
          display: "flex",
          fontSize: 12,
          fontWeight: 700,
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: SILVER_DARK,
        }}
      >
        {label}
      </span>
      <span
        style={{
          display: "flex",
          fontSize: 56,
          fontWeight: 900,
          letterSpacing: "-0.02em",
          lineHeight: 1,
          color: INK,
          fontVariantNumeric: "tabular-nums",
          marginTop: 4,
        }}
      >
        {value}
      </span>
    </div>
  );
}
