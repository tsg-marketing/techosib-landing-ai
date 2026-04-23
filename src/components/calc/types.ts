export type PackMode = "hand" | "machine" | "prestretch";

export interface FormState {
  thickness: string;
  length: string;
  width: string;
  turns: string;
  p_day: string;
  days: string;
  film_price: string;
}

export interface ColResult {
  stretch: number;
  consumption: number;
  cost_per_pallet: number;
  total_consumption_year: number;
  total_cost_year: number;
}

export const DEFAULT_FORM: FormState = {
  thickness: "23",
  length: "1200",
  width: "800",
  turns: "16",
  p_day: "50",
  days: "220",
  film_price: "300",
};

export const STRETCH: Record<PackMode, number> = {
  hand: 0,
  machine: 50,
  prestretch: 250,
};

export const MODE_LABELS: Record<PackMode, string> = {
  hand: "Ручная обмотка",
  machine: "Машина без престрейча",
  prestretch: "Машина с престрейчем",
};

export const MODES: PackMode[] = ["hand", "machine", "prestretch"];

export const CALC_CONTACT_KEY = "calc_contact_submitted";

export function n(s: string, fallback = 0): number {
  const v = parseFloat(s.replace(",", "."));
  return isNaN(v) || v < 0 ? fallback : v;
}

export function fmt(v: number, digits = 0): string {
  return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: digits }).format(v);
}

export function calcCol(f: FormState, mode: PackMode): ColResult {
  const thickness = n(f.thickness, 23);
  const length = n(f.length, 1200);
  const width = n(f.width, 800);
  const turns = n(f.turns, 16);
  const p_day = n(f.p_day, 10);
  const days = n(f.days, 220);
  const film_price = n(f.film_price, 300);
  const stretch = STRETCH[mode];

  const perim_m = (length + width) * 2 / 1000;
  const film_width_m = 500 / 1000;
  const thickness_m = thickness / 1000000;
  const stretch_coef = 100 / (100 + stretch);
  const volume_m3 = perim_m * film_width_m * thickness_m * turns * stretch_coef;
  const baseConsumption = volume_m3 * 920 * 1000;
  const extraGrams = mode === "machine" ? 40 : mode === "prestretch" ? 10 : 0;
  const consumption = baseConsumption + extraGrams;

  const cost_per_pallet = film_price * consumption * 0.001;
  const total_consumption_year = (consumption / 1000) * p_day * days;
  const total_cost_year = total_consumption_year * film_price;

  return { stretch, consumption, cost_per_pallet, total_consumption_year, total_cost_year };
}

