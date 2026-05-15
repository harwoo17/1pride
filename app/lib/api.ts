// Fetcher for the 1PRIDE FastAPI backend.
//
// In dev: API_BASE points at http://localhost:8000.
// In Vercel: set API_BASE to the production FastAPI URL.

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "http://localhost:8000";

export interface WeeklyGame {
  week: number;
  opp: string;
  scored: number;
  allowed: number;
  gameday: string;
}

export interface Receiver {
  name: string;
  position: string;
  games: number;
  targets: number;
  catches: number;
  yards: number;
  tds: number;
}

export interface FourthDownDecision {
  play_type: string;
  plays: number;
  avg_ydstogo: string;
  avg_yardline: string;
  avg_epa: string;
}

export interface SeasonRow {
  season: number;
  weeks_played: number;
}

export interface ReceiverWeek {
  name: string;
  week: number;
  yards: number;
}

export interface StandingsRow {
  team: string;
  wins: number;
  losses: number;
  ties: number;
  points_for: number;
  points_against: number;
  diff: number;
}

async function get<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      next: { revalidate: 3600 }, // cache for 1h
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function getWeeklyScoring(
  season: number,
): Promise<{ season: number; games: WeeklyGame[] } | null> {
  return get(`/api/lions/weekly-scoring?season=${season}`);
}

export async function getTopReceivers(
  season: number,
  limit = 8,
): Promise<{ season: number; receivers: Receiver[] } | null> {
  return get(`/api/lions/top-receivers?season=${season}&limit=${limit}`);
}

export async function getFourthDownDecisions(
  seasonMin = 2022,
  seasonMax = 2024,
): Promise<{
  season_range: [number, number];
  decisions: FourthDownDecision[];
} | null> {
  return get(
    `/api/lions/4th-down-decisions?season_min=${seasonMin}&season_max=${seasonMax}`,
  );
}

export async function getSeasons(): Promise<{
  seasons: SeasonRow[];
} | null> {
  return get(`/api/lions/seasons`);
}

export async function getReceiverWeeks(
  season: number,
  limit = 8,
): Promise<{ season: number; rows: ReceiverWeek[] } | null> {
  return get(`/api/lions/receiver-weeks?season=${season}&limit=${limit}`);
}

export async function getNfcNorth(
  season: number,
): Promise<{ season: number; standings: StandingsRow[] } | null> {
  return get(`/api/standings/nfc-north?season=${season}`);
}
