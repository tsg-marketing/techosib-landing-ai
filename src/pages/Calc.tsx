import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────
interface FormState {
  p_day: string;
  days: string;
  pack_mode: "hand" | "semi" | "auto";
  film_price: string;
  film_hand: string;
  film_machine: string;
  t_hand: string;
  t_machine: string;
  w_hour: string;
  n_hand: string;
  n_machine: string;
  damage_rate_hand: string;
  damage_rate_machine: string;
  loss_cost: string;
  kwh_price: string;
  kwh_per_pallet: string;
  maint_month: string;
  spare_month: string;
  capex: string;
  training: string;
}

interface CalcResult {
  P: number;
  labor_hand_month: number;
  labor_machine_month: number;
  labor_saving_month: number;
  film_cost_hand_month: number;
  film_cost_machine_month: number;
  film_saving_month: number;
  loss_hand_month: number;
  loss_machine_month: number;
  loss_saving_month: number;
  energy_month: number;
  total_hand_month: number;
  total_machine_month: number;
  saving_month: number;
  capex_total: number;
  payback_months: number | null;
  saving_year: number;
  roi_year: number | null;
  machine_type: { label: string; reasons: string[] };
  t_machine_estimated: boolean;
  damage_machine_estimated: boolean;
}

interface ScenarioRow {
  label: string;
  saving_month: number;
  payback_months: number | null;
  roi_year: number | null;
}

// ─────────────────────────────────────────────
// DEFAULTS
// ─────────────────────────────────────────────
const DEFAULT_FORM: FormState = {
  p_day: "",
  days: "",
  pack_mode: "hand",
  film_price: "",
  film_hand: "",
  film_machine: "",
  t_hand: "",
  t_machine: "",
  w_hour: "",
  n_hand: "1",
  n_machine: "1",
  damage_rate_hand: "",
  damage_rate_machine: "",
  loss_cost: "",
  kwh_price: "",
  kwh_per_pallet: "",
  maint_month: "0",
  spare_month: "0",
  capex: "",
  training: "0",
};

const STORAGE_KEY = "calc_roi_form_v1";

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
function n(s: string, fallback = 0): number {
  const v = parseFloat(s.replace(",", "."));
  return isNaN(v) || v < 0 ? fallback : v;
}

function fmt(v: number): string {
  return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(v);
}

function fmtDec(v: number, digits = 1): string {
  return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: digits }).format(v);
}

function getMachineType(
  p_day: number,
  pack_mode: string
): { label: string; reasons: string[] } {
  if (p_day === 0) return { label: "—", reasons: [] };
  if (pack_mode === "auto" || p_day >= 150)
    return {
      label: "Автоматическая линия",
      reasons: [
        `Высокий поток паллет: ${p_day} шт/день`,
        "Интеграция в производственную линию",
        "Минимальное участие оператора",
      ],
    };
  if (p_day >= 60)
    return {
      label: "Паллетообмотчик с вращающейся рукой",
      reasons: [
        `Средний/высокий поток: ${p_day} шт/день`,
        "Подходит для нестабильных и тяжёлых грузов",
        "Паллет не перемещается в процессе обмотки",
      ],
    };
  if (p_day >= 20)
    return {
      label: "Полуавтоматический паллетообмотчик (поворотный стол)",
      reasons: [
        `Средний поток: ${p_day} шт/день`,
        "Оптимальный баланс цены и производительности",
        "Простое обслуживание и обучение",
      ],
    };
  return {
    label: "Мобильный паллетообмотчик (робот)",
    reasons: [
      `Низкий или нерегулярный поток: ${p_day} шт/день`,
      "Нет необходимости в фиксированном месте установки",
      "Гибкость перемещения по складу",
    ],
  };
}

function calcCore(
  f: FormState,
  overrides?: Partial<{
    film_machine: number;
    t_machine: number;
    damage_rate_machine: number;
  }>
): CalcResult {
  const p_day = n(f.p_day);
  const days = n(f.days);
  const P = p_day * days;

  const film_price = n(f.film_price);
  const film_hand = n(f.film_hand);
  const film_machine_raw =
    overrides?.film_machine ?? n(f.film_machine, n(f.film_hand) * 0.8);

  const t_hand = n(f.t_hand);
  const t_machine_entered = n(f.t_machine, 0);
  const t_machine_estimated = f.t_machine.trim() === "";
  const t_machine_raw =
    overrides?.t_machine ??
    (t_machine_estimated ? t_hand * 0.6 : t_machine_entered);

  const w_hour = n(f.w_hour);
  const n_hand = n(f.n_hand, 1);
  const n_machine_val = n(f.n_machine, 1);

  const damage_rate_hand = n(f.damage_rate_hand, 0);
  const damage_machine_estimated = f.damage_rate_machine.trim() === "";
  const damage_rate_machine_raw =
    overrides?.damage_rate_machine ??
    (damage_machine_estimated
      ? damage_rate_hand * 0.5
      : n(f.damage_rate_machine, 0));

  const loss_cost = n(f.loss_cost, 0);
  const kwh_price = n(f.kwh_price, 0);
  const kwh_per_pallet = n(f.kwh_per_pallet, 0);
  const maint_month = n(f.maint_month, 0);
  const spare_month = n(f.spare_month, 0);
  const capex = n(f.capex, 0);
  const training = n(f.training, 0);

  const t_hand_h = t_hand / 60;
  const t_machine_h = t_machine_raw / 60;

  const labor_hand_month = P * t_hand_h * w_hour * n_hand;
  const labor_machine_month = P * t_machine_h * w_hour * n_machine_val;
  const labor_saving_month = labor_hand_month - labor_machine_month;

  const film_cost_hand_month = P * film_hand * film_price;
  const film_cost_machine_month = P * film_machine_raw * film_price;
  const film_saving_month = film_cost_hand_month - film_cost_machine_month;

  const loss_hand_month = P * (damage_rate_hand / 100) * loss_cost;
  const loss_machine_month = P * (damage_rate_machine_raw / 100) * loss_cost;
  const loss_saving_month = loss_hand_month - loss_machine_month;

  const energy_month =
    kwh_price > 0 && kwh_per_pallet > 0 ? P * kwh_per_pallet * kwh_price : 0;

  const total_hand_month = labor_hand_month + film_cost_hand_month + loss_hand_month;
  const total_machine_month =
    labor_machine_month +
    film_cost_machine_month +
    loss_machine_month +
    energy_month +
    maint_month +
    spare_month;

  const saving_month = total_hand_month - total_machine_month;
  const capex_total = capex + training;
  const payback_months =
    saving_month > 0 && capex_total > 0 ? capex_total / saving_month : null;
  const saving_year = saving_month * 12;
  const roi_year =
    saving_month > 0 && capex_total > 0
      ? (saving_year / capex_total) * 100
      : null;

  return {
    P,
    labor_hand_month,
    labor_machine_month,
    labor_saving_month,
    film_cost_hand_month,
    film_cost_machine_month,
    film_saving_month,
    loss_hand_month,
    loss_machine_month,
    loss_saving_month,
    energy_month,
    total_hand_month,
    total_machine_month,
    saving_month,
    capex_total,
    payback_months,
    saving_year,
    roi_year,
    machine_type: getMachineType(p_day, f.pack_mode),
    t_machine_estimated,
    damage_machine_estimated,
  };
}

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────
export default function Calc() {
  const [form, setForm] = useState<FormState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return { ...DEFAULT_FORM, ...JSON.parse(saved) };
    } catch (_e) {
      return DEFAULT_FORM;
    }
    return DEFAULT_FORM;
  });

  const [result, setResult] = useState<CalcResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showScenarios, setShowScenarios] = useState(false);
  const [scenarios, setScenarios] = useState<ScenarioRow[]>([]);
  const [qualityOpen, setQualityOpen] = useState(false);
  const [ownerOpen, setOwnerOpen] = useState(false);
  const [filmWarning, setFilmWarning] = useState(false);

  // Лид-форма
  const [leadName, setLeadName] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadComment, setLeadComment] = useState("");
  const [leadSent, setLeadSent] = useState(false);
  const [leadLoading, setLeadLoading] = useState(false);
  const [leadErrors, setLeadErrors] = useState<Record<string, string>>({});

  const resultRef = useRef<HTMLDivElement>(null);

  // Сохранение в localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(form));
    } catch (_e) {
      // ignore
    }
    // Проверка film warning
    const fm = n(form.film_machine, 0);
    const fh = n(form.film_hand, 0);
    setFilmWarning(fm > 0 && fh > 0 && fm > fh);
  }, [form]);

  const set = (key: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  // Проверка обязательных полей
  const requiredFilled =
    n(form.p_day) > 0 &&
    n(form.days) > 0 &&
    n(form.film_price) > 0 &&
    n(form.film_hand) > 0 &&
    n(form.film_machine) > 0 &&
    n(form.w_hour) > 0 &&
    n(form.t_hand) > 0 &&
    n(form.capex) > 0;

  const P_preview =
    n(form.p_day) > 0 && n(form.days) > 0
      ? n(form.p_day) * n(form.days)
      : null;

  function handleCalc() {
    setLoading(true);
    setShowScenarios(false);
    setTimeout(() => {
      const r = calcCore(form);
      setResult(r);
      setLoading(false);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    }, 800);
  }

  function handleScenarios() {
    if (!result) return;
    const fm = n(form.film_machine);
    const tm = n(form.t_machine, n(form.t_hand) * 0.6);
    const dm = n(form.damage_rate_machine, n(form.damage_rate_hand) * 0.5);

    const base = calcCore(form);
    const min = calcCore(form, {
      film_machine: fm * 1.1,
      t_machine: tm * 1.1,
      damage_rate_machine: Math.min(100, dm * 1.2),
    });
    const max = calcCore(form, {
      film_machine: fm * 0.9,
      t_machine: tm * 0.9,
      damage_rate_machine: dm * 0.8,
    });

    setScenarios([
      { label: "Пессимистичный (MIN)", ...min },
      { label: "Базовый (BASE)", ...base },
      { label: "Оптимистичный (MAX)", ...max },
    ]);
    setShowScenarios(true);
  }

  // График накопленной экономии
  function buildChartData(r: CalcResult) {
    if (r.saving_month <= 0 || !r.payback_months) return [];
    const months = Math.min(Math.ceil(r.payback_months) + 6, 60);
    return Array.from({ length: months + 1 }, (_, i) => ({
      month: i,
      cumulative: Math.round(i * r.saving_month - r.capex_total),
    }));
  }

  // Лид-форма
  async function handleLead(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!leadName.trim()) errs.name = "Укажите компанию";
    if (!leadPhone.trim()) errs.phone = "Укажите телефон";
    if (!leadEmail.trim()) errs.email = "Укажите почту";
    setLeadErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLeadLoading(true);
    try {
      await fetch("/api/b24-send-lead.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: leadName,
          phone: leadPhone,
          email: leadEmail,
          comment: leadComment,
          source: "Калькулятор ROI",
          calc_params: form,
          calc_result: result
            ? {
                saving_month: result.saving_month,
                payback_months: result.payback_months,
                roi_year: result.roi_year,
                machine_type: result.machine_type.label,
              }
            : null,
        }),
      });
      setLeadSent(true);
    } catch {
      setLeadSent(true);
    }
    setLeadLoading(false);
  }

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* HEADER */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors">
            <Icon name="ArrowLeft" size={16} />
            На главную
          </Link>
          <span className="text-xs text-gray-400 hidden sm:block">Техно-Сиб — Паллетообмотчики</span>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* TITLE */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">
            Калькулятор окупаемости паллетоупаковщика
          </h1>
          <p className="text-gray-500 text-sm md:text-base max-w-2xl">
            Рассчитайте экономию пленки, времени и потерь. Получите срок окупаемости и рекомендацию типа оборудования.
          </p>
        </div>

        {/* MAIN GRID */}
        <div className="grid lg:grid-cols-2 gap-6 items-start">
          {/* ─── LEFT: FORM ─── */}
          <div className="space-y-4">
            {/* Раздел A */}
            <FormSection title="А. Объёмы производства">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Паллет в день" required>
                  <Input
                    type="number"
                    min={0}
                    placeholder="80"
                    value={form.p_day}
                    onChange={set("p_day")}
                  />
                </Field>
                <Field label="Рабочих дней в месяц" required>
                  <Input
                    type="number"
                    min={0}
                    placeholder="22"
                    value={form.days}
                    onChange={set("days")}
                  />
                </Field>
              </div>
              {P_preview !== null && (
                <p className="text-xs text-blue-600 font-medium mt-1">
                  Итого: {fmt(P_preview)} паллет/мес
                </p>
              )}
            </FormSection>

            {/* Раздел B */}
            <FormSection title="Б. Текущий способ упаковки">
              <div className="flex gap-2 flex-wrap">
                {(
                  [
                    { v: "hand", l: "Ручная" },
                    { v: "semi", l: "Полуавтомат" },
                    { v: "auto", l: "Автомат (линия)" },
                  ] as const
                ).map(({ v, l }) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, pack_mode: v }))}
                    className={`px-4 py-2 rounded border text-sm font-medium transition-colors ${
                      form.pack_mode === v
                        ? "bg-orange-500 text-white border-orange-500"
                        : "bg-white text-gray-700 border-gray-300 hover:border-orange-400"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
              {form.pack_mode !== "hand" && (
                <p className="text-xs text-amber-600 mt-2 bg-amber-50 px-3 py-2 rounded border border-amber-200">
                  Калькулятор считает сравнительно: текущий режим vs новая машина
                </p>
              )}
            </FormSection>

            {/* Раздел C */}
            <FormSection title="В. Расход плёнки">
              <div className="grid grid-cols-3 gap-3">
                <Field label="Цена плёнки, ₽/кг" required>
                  <Input
                    type="number"
                    min={0}
                    placeholder="150"
                    value={form.film_price}
                    onChange={set("film_price")}
                  />
                </Field>
                <Field label="Расход сейчас, кг/пал." required>
                  <Input
                    type="number"
                    min={0}
                    placeholder="0.35"
                    value={form.film_hand}
                    onChange={set("film_hand")}
                  />
                </Field>
                <Field label="Расход на машине, кг/пал." required>
                  <Input
                    type="number"
                    min={0}
                    placeholder="0.20"
                    value={form.film_machine}
                    onChange={set("film_machine")}
                  />
                </Field>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Учитывайте предрастяжение и стабильность натяжения
              </p>
              {filmWarning && (
                <p className="text-xs text-red-600 mt-1 bg-red-50 px-3 py-2 rounded border border-red-200">
                  Расход на машине выше текущего — проверьте предрастяжение/настройки
                </p>
              )}
            </FormSection>

            {/* Раздел D */}
            <FormSection title="Г. Время и ФОТ">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Время упаковки сейчас, мин/пал." required>
                  <Input
                    type="number"
                    min={0}
                    placeholder="8"
                    value={form.t_hand}
                    onChange={set("t_hand")}
                  />
                </Field>
                <Field label="Время на машине, мин/пал.">
                  <div className="relative">
                    <Input
                      type="number"
                      min={0}
                      placeholder={
                        form.t_hand
                          ? `≈ ${fmtDec(n(form.t_hand) * 0.6)} (оценка)`
                          : "авто"
                      }
                      value={form.t_machine}
                      onChange={set("t_machine")}
                    />
                  </div>
                  {form.t_machine === "" && form.t_hand !== "" && (
                    <p className="text-xs text-blue-500 mt-0.5">
                      Оценка: {fmtDec(n(form.t_hand) * 0.6)} мин (−40%)
                    </p>
                  )}
                </Field>
                <Field label="ФОТ+налоги, ₽/час" required>
                  <Input
                    type="number"
                    min={0}
                    placeholder="350"
                    value={form.w_hour}
                    onChange={set("w_hour")}
                  />
                </Field>
                <Field label="Сотрудников на упаковке">
                  <Input
                    type="number"
                    min={1}
                    placeholder="1"
                    value={form.n_hand}
                    onChange={set("n_hand")}
                  />
                </Field>
                <Field label="Операторов на машине">
                  <Input
                    type="number"
                    min={1}
                    placeholder="1"
                    value={form.n_machine}
                    onChange={set("n_machine")}
                  />
                </Field>
              </div>
            </FormSection>

            {/* Раздел E — сворачиваемый */}
            <CollapsibleSection
              title="Д. Качество / потери (необязательно)"
              open={qualityOpen}
              onToggle={() => setQualityOpen((v) => !v)}
            >
              <div className="grid grid-cols-3 gap-3">
                <Field label="Повреждения сейчас, %">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    placeholder="5"
                    value={form.damage_rate_hand}
                    onChange={set("damage_rate_hand")}
                  />
                </Field>
                <Field label="После внедрения, %">
                  <Input
                    type="number"
                    min={0}
                    max={100}
                    placeholder={
                      form.damage_rate_hand
                        ? fmtDec(n(form.damage_rate_hand) * 0.5)
                        : "авто"
                    }
                    value={form.damage_rate_machine}
                    onChange={set("damage_rate_machine")}
                  />
                  {form.damage_rate_machine === "" &&
                    form.damage_rate_hand !== "" && (
                      <p className="text-xs text-blue-500 mt-0.5">
                        Оценка: −50% от текущего
                      </p>
                    )}
                </Field>
                <Field label="Стоимость 1 случая, ₽">
                  <Input
                    type="number"
                    min={0}
                    placeholder="3000"
                    value={form.loss_cost}
                    onChange={set("loss_cost")}
                  />
                </Field>
              </div>
            </CollapsibleSection>

            {/* Раздел F — сворачиваемый */}
            <CollapsibleSection
              title="Е. Затраты на владение машиной"
              open={ownerOpen}
              onToggle={() => setOwnerOpen((v) => !v)}
            >
              <div className="grid grid-cols-2 gap-3">
                <Field label="Цена электроэнергии, ₽/кВт·ч">
                  <Input
                    type="number"
                    min={0}
                    placeholder="7.5"
                    value={form.kwh_price}
                    onChange={set("kwh_price")}
                  />
                </Field>
                <Field label="Энергия, кВт·ч/паллет">
                  <Input
                    type="number"
                    min={0}
                    placeholder="0.15"
                    value={form.kwh_per_pallet}
                    onChange={set("kwh_per_pallet")}
                  />
                </Field>
                <Field label="ТО и расходники, ₽/мес">
                  <Input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={form.maint_month}
                    onChange={set("maint_month")}
                  />
                </Field>
                <Field label="Ремонт/запчасти (план), ₽/мес">
                  <Input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={form.spare_month}
                    onChange={set("spare_month")}
                  />
                </Field>
              </div>
            </CollapsibleSection>

            {/* Раздел G */}
            <FormSection title="Ж. Стоимость проекта">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Стоимость оборудования, ₽" required>
                  <Input
                    type="number"
                    min={0}
                    placeholder="350000"
                    value={form.capex}
                    onChange={set("capex")}
                  />
                </Field>
                <Field label="Ввод в эксплуатацию, ₽">
                  <Input
                    type="number"
                    min={0}
                    placeholder="0"
                    value={form.training}
                    onChange={set("training")}
                  />
                </Field>
              </div>
            </FormSection>

            {/* CTA */}
            <Button
              onClick={handleCalc}
              disabled={!requiredFilled || loading}
              className="w-full py-5 text-base font-bold bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Icon name="Loader2" size={18} className="animate-spin" />
                  Считаем…
                </span>
              ) : (
                "Рассчитать экономику"
              )}
            </Button>
            {!requiredFilled && (
              <p className="text-xs text-gray-400 text-center -mt-2">
                Заполните все обязательные поля (отмечены *)
              </p>
            )}
          </div>

          {/* ─── RIGHT: RESULTS ─── */}
          <div ref={resultRef}>
            {!result ? (
              <div className="bg-white border border-dashed border-gray-300 rounded-xl p-10 text-center text-gray-400 min-h-64 flex flex-col items-center justify-center gap-3">
                <Icon name="Calculator" size={40} className="text-gray-300" />
                <p className="text-sm">
                  Заполните поля и нажмите «Рассчитать экономику»
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* KPI CARDS */}
                <div
                  className={`grid grid-cols-3 gap-3 ${
                    result.saving_month <= 0 ? "opacity-60" : ""
                  }`}
                >
                  <KPICard
                    label="Экономия в месяц"
                    value={`${fmt(result.saving_month)} ₽`}
                    sub="мес"
                    bad={result.saving_month <= 0}
                  />
                  <KPICard
                    label="Окупаемость"
                    value={
                      result.payback_months
                        ? `${fmtDec(result.payback_months)} мес`
                        : "—"
                    }
                    sub={result.payback_months ? `≈ ${fmtDec(result.payback_months / 12)} лет` : "не достигнута"}
                    bad={!result.payback_months}
                  />
                  <KPICard
                    label="ROI"
                    value={result.roi_year ? `${fmt(result.roi_year)}%` : "—"}
                    sub="в год"
                    bad={!result.roi_year}
                  />
                </div>

                {/* NEGATIVE WARNING */}
                {result.saving_month <= 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
                    <p className="font-semibold mb-1">
                      Окупаемость не достигнута при текущих вводных
                    </p>
                    <p className="text-xs text-red-600">
                      Пересмотрите: расход плёнки на машине, время упаковки, ФОТ или стоимость оборудования.
                    </p>
                  </div>
                )}

                {/* BREAKDOWN TABLE */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="text-left px-4 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wide">
                          Статья
                        </th>
                        <th className="text-right px-4 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wide">
                          Сейчас
                        </th>
                        <th className="text-right px-4 py-3 text-xs text-gray-500 font-semibold uppercase tracking-wide">
                          На машине
                        </th>
                        <th className="text-right px-4 py-3 text-xs text-green-600 font-semibold uppercase tracking-wide">
                          Экономия
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      <TableRow
                        label="Плёнка"
                        a={result.film_cost_hand_month}
                        b={result.film_cost_machine_month}
                        diff={result.film_saving_month}
                      />
                      <TableRow
                        label="Труд (ФОТ)"
                        a={result.labor_hand_month}
                        b={result.labor_machine_month}
                        diff={result.labor_saving_month}
                      />
                      {(result.loss_hand_month > 0 ||
                        result.loss_machine_month > 0) && (
                        <TableRow
                          label="Потери/повреждения"
                          a={result.loss_hand_month}
                          b={result.loss_machine_month}
                          diff={result.loss_saving_month}
                        />
                      )}
                      {result.energy_month > 0 && (
                        <TableRow
                          label="Электроэнергия"
                          a={0}
                          b={result.energy_month}
                          diff={-result.energy_month}
                          cost
                        />
                      )}
                      {(n(form.maint_month) > 0 || n(form.spare_month) > 0) && (
                        <TableRow
                          label="ТО и ремонт"
                          a={0}
                          b={n(form.maint_month) + n(form.spare_month)}
                          diff={-(n(form.maint_month) + n(form.spare_month))}
                          cost
                        />
                      )}
                    </tbody>
                    <tfoot>
                      <tr className="bg-gray-50 border-t-2 border-gray-200 font-bold">
                        <td className="px-4 py-3 text-sm">Итого в месяц</td>
                        <td className="px-4 py-3 text-right text-sm">
                          {fmt(result.total_hand_month)} ₽
                        </td>
                        <td className="px-4 py-3 text-right text-sm">
                          {fmt(result.total_machine_month)} ₽
                        </td>
                        <td
                          className={`px-4 py-3 text-right text-sm ${
                            result.saving_month > 0
                              ? "text-green-600"
                              : "text-red-500"
                          }`}
                        >
                          {result.saving_month > 0 ? "+" : ""}
                          {fmt(result.saving_month)} ₽
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* CHART */}
                {result.saving_month > 0 && result.payback_months && (
                  <div className="bg-white border border-gray-200 rounded-xl p-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                      Накопленная экономия, ₽
                    </p>
                    <ResponsiveContainer width="100%" height={180}>
                      <LineChart
                        data={buildChartData(result)}
                        margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                          dataKey="month"
                          tick={{ fontSize: 11 }}
                          tickFormatter={(v) => `${v} мес`}
                        />
                        <YAxis
                          tick={{ fontSize: 11 }}
                          tickFormatter={(v) =>
                            v >= 1000000
                              ? `${(v / 1000000).toFixed(1)}M`
                              : v >= 1000
                              ? `${(v / 1000).toFixed(0)}K`
                              : `${v}`
                          }
                          width={50}
                        />
                        <Tooltip
                          formatter={(v: number) => [`${fmt(v)} ₽`, "Накоплено"]}
                          labelFormatter={(l) => `Месяц ${l}`}
                        />
                        <ReferenceLine
                          y={0}
                          stroke="#ef4444"
                          strokeDasharray="4 2"
                          label={{
                            value: "Точка окупаемости",
                            position: "insideTopLeft",
                            fontSize: 10,
                            fill: "#ef4444",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="cumulative"
                          stroke="#f97316"
                          strokeWidth={2}
                          dot={false}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* MACHINE RECOMMENDATION */}
                {result.machine_type.label !== "—" && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                        <Icon name="Cpu" size={18} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-xs text-blue-500 font-semibold uppercase tracking-wide mb-0.5">
                          Рекомендуемый класс оборудования
                        </p>
                        <p className="font-bold text-blue-900 text-sm mb-2">
                          {result.machine_type.label}
                        </p>
                        <ul className="space-y-1">
                          {result.machine_type.reasons.map((r, i) => (
                            <li
                              key={i}
                              className="text-xs text-blue-700 flex items-start gap-1.5"
                            >
                              <span className="mt-0.5">•</span>
                              {r}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}

                {/* ESTIMATED NOTES */}
                {(result.t_machine_estimated ||
                  result.damage_machine_estimated) && (
                  <p className="text-xs text-gray-400 italic">
                    * Значения, помеченные как «оценка», рассчитаны автоматически
                    на основе введённых данных. Уточните их для повышения точности.
                  </p>
                )}

                {/* SCENARIO BUTTON */}
                <Button
                  variant="outline"
                  className="w-full border-gray-300 text-gray-700 hover:bg-gray-50"
                  onClick={handleScenarios}
                >
                  <Icon name="BarChart2" size={16} className="mr-2" />
                  Сравнить сценарии (min / base / max)
                </Button>

                {/* SCENARIO TABLE */}
                {showScenarios && scenarios.length > 0 && (
                  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <p className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
                      Анализ чувствительности
                    </p>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100">
                          <th className="text-left px-4 py-2 text-xs text-gray-400 font-medium">Сценарий</th>
                          <th className="text-right px-4 py-2 text-xs text-gray-400 font-medium">Экономия/мес</th>
                          <th className="text-right px-4 py-2 text-xs text-gray-400 font-medium">Окупаемость</th>
                          <th className="text-right px-4 py-2 text-xs text-gray-400 font-medium">ROI/год</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {scenarios.map((s, i) => (
                          <tr
                            key={i}
                            className={i === 1 ? "bg-orange-50 font-semibold" : ""}
                          >
                            <td className="px-4 py-2.5 text-sm">{s.label}</td>
                            <td
                              className={`px-4 py-2.5 text-right text-sm ${
                                s.saving_month > 0
                                  ? "text-green-600"
                                  : "text-red-500"
                              }`}
                            >
                              {fmt(s.saving_month)} ₽
                            </td>
                            <td className="px-4 py-2.5 text-right text-sm">
                              {s.payback_months
                                ? `${fmtDec(s.payback_months)} мес`
                                : "—"}
                            </td>
                            <td className="px-4 py-2.5 text-right text-sm">
                              {s.roi_year ? `${fmt(s.roi_year)}%` : "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ─── LEAD FORM ─── */}
        <div className="mt-10 max-w-2xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-2xl p-6 md:p-8">
            {leadSent ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="CheckCircle" size={28} className="text-green-500" />
                </div>
                <p className="font-bold text-gray-900 text-lg mb-1">
                  Спасибо! Расчёт получен
                </p>
                <p className="text-gray-500 text-sm">
                  Мы свяжемся с вами в рабочее время и подготовим коммерческое предложение.
                </p>
              </div>
            ) : (
              <>
                <h2 className="text-xl font-bold text-gray-900 mb-1">
                  Отправим расчёт и подготовим КП
                </h2>
                <p className="text-sm text-gray-500 mb-5">
                  Приложим все введённые параметры и рассчитанную экономику.
                </p>
                <form onSubmit={handleLead} className="space-y-3">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Field label="Компания *" error={leadErrors.name}>
                      <Input
                        placeholder="ООО «Логистика»"
                        value={leadName}
                        onChange={(e) => setLeadName(e.target.value)}
                        className={leadErrors.name ? "border-red-400" : ""}
                      />
                    </Field>
                    <Field label="Телефон *" error={leadErrors.phone}>
                      <Input
                        placeholder="+7 (___) ___-__-__"
                        value={leadPhone}
                        onChange={(e) => setLeadPhone(e.target.value)}
                        className={leadErrors.phone ? "border-red-400" : ""}
                      />
                    </Field>
                  </div>
                  <Field label="Email *" error={leadErrors.email}>
                    <Input
                      type="email"
                      placeholder="manager@company.ru"
                      value={leadEmail}
                      onChange={(e) => setLeadEmail(e.target.value)}
                      className={leadErrors.email ? "border-red-400" : ""}
                    />
                  </Field>
                  <Field label="Комментарий (тип груза, высота паллет, условия склада)">
                    <Input
                      placeholder="Продукты питания, паллет 1400 мм, склад −18°C"
                      value={leadComment}
                      onChange={(e) => setLeadComment(e.target.value)}
                    />
                  </Field>
                  <Button
                    type="submit"
                    disabled={leadLoading}
                    className="w-full py-5 text-base font-bold bg-orange-500 hover:bg-orange-600 text-white"
                  >
                    {leadLoading ? (
                      <span className="flex items-center gap-2">
                        <Icon name="Loader2" size={18} className="animate-spin" />
                        Отправляем…
                      </span>
                    ) : (
                      "Отправить расчёт и запросить КП"
                    )}
                  </Button>
                </form>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────
function FormSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
        {title}
      </p>
      {children}
    </div>
  );
}

function CollapsibleSection({
  title,
  open,
  onToggle,
  children,
}: {
  title: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
          {title}
        </span>
        <Icon
          name={open ? "ChevronUp" : "ChevronDown"}
          size={16}
          className="text-gray-400"
        />
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

function Field({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-gray-600">
        {label}
        {required && <span className="text-orange-500 ml-0.5">*</span>}
      </Label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

function KPICard({
  label,
  value,
  sub,
  bad,
}: {
  label: string;
  value: string;
  sub: string;
  bad?: boolean;
}) {
  return (
    <div
      className={`rounded-xl p-3 text-center border ${
        bad
          ? "bg-gray-50 border-gray-200"
          : "bg-orange-50 border-orange-200"
      }`}
    >
      <p className="text-xs text-gray-400 mb-1 leading-tight">{label}</p>
      <p
        className={`text-lg font-black leading-tight ${
          bad ? "text-gray-400" : "text-orange-600"
        }`}
      >
        {value}
      </p>
      <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
    </div>
  );
}

function TableRow({
  label,
  a,
  b,
  diff,
  cost,
}: {
  label: string;
  a: number;
  b: number;
  diff: number;
  cost?: boolean;
}) {
  return (
    <tr className="hover:bg-gray-50/50">
      <td className="px-4 py-2.5 text-gray-700">{label}</td>
      <td className="px-4 py-2.5 text-right text-gray-500">
        {a > 0 ? `${fmt(a)} ₽` : "—"}
      </td>
      <td className="px-4 py-2.5 text-right text-gray-500">
        {b > 0 ? `${fmt(b)} ₽` : "—"}
      </td>
      <td
        className={`px-4 py-2.5 text-right font-medium ${
          diff > 0
            ? "text-green-600"
            : diff < 0
            ? "text-red-500"
            : "text-gray-400"
        }`}
      >
        {diff > 0 ? "+" : ""}
        {fmt(diff)} ₽
      </td>
    </tr>
  );
}