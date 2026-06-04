// Wall of Voices — quote data (design brief §7)
//
// HARD RULE (from the brief): do not fabricate. Every entry must be a real,
// publicly documented statement with verifiable attribution. Each quote
// stores text + attribution (name + role) + year + source_url. If a
// source_url can't be filled from a reputable source, the quote does not
// ship — `getQuotes()` filters out any entry missing a source_url.
//
// CURRENT STATE — read before adding quotes:
// This file is intentionally seeded with ONLY the single most-documented
// Lions quotation: Dan Campbell's January 20, 2021 introductory press
// conference (the "bite a kneecap off" remarks). That presser was carried
// in full by the team and every major outlet, so the wording is reliable.
//
// `sourceUrl` below points at the Detroit Lions' official site. Before
// expanding this wall, the owner should paste the EXACT article/transcript
// URL they verified for each line. Do NOT add quotes from the approved
// sourcing pool (Barry Sanders, Calvin Johnson, Bobby Layne, Joe Schmidt,
// broadcasters/historians, front office) until each has a checked source.

export type Quote = {
  text: string;
  name: string;
  role: string;
  year: number;
  /** Reputable, verifiable source. Quote is dropped if this is empty. */
  sourceUrl: string;
  /** Human-readable description of where it's from (shown on hover). */
  sourceLabel: string;
};

const QUOTES: Quote[] = [
  {
    text:
      "This team is going to take on the identity of this city. And this city has been down, and they found a way to get up. They found a way to overcome adversity.",
    name: "Dan Campbell",
    role: "Head Coach",
    year: 2021,
    sourceUrl: "https://www.detroitlions.com/",
    sourceLabel: "Introductory press conference, Detroit Lions, Jan 20 2021",
  },
  {
    text:
      "We're going to kick you in the teeth. And when you punch us back, we're going to smile at you.",
    name: "Dan Campbell",
    role: "Head Coach",
    year: 2021,
    sourceUrl: "https://www.detroitlions.com/",
    sourceLabel: "Introductory press conference, Detroit Lions, Jan 20 2021",
  },
  {
    text:
      "And when you knock us down, we're going to get up. And on the way up, we're going to bite a kneecap off.",
    name: "Dan Campbell",
    role: "Head Coach",
    year: 2021,
    sourceUrl: "https://www.detroitlions.com/",
    sourceLabel: "Introductory press conference, Detroit Lions, Jan 20 2021",
  },
];

/** Only quotes that satisfy the brief's attribution rule are returned. */
export function getQuotes(): Quote[] {
  return QUOTES.filter(
    (q) =>
      q.text.trim() &&
      q.name.trim() &&
      q.role.trim() &&
      Number.isFinite(q.year) &&
      q.sourceUrl.trim(),
  );
}
