import { useState, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Icon from "@/components/ui/icon";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { getUtmFromCookies } from "@/utils/utm";

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────
type PackMode = "hand" | "machine" | "prestretch";

interface FormState {
  thickness: string;
  length: string;
  width: string;
  turns: string;
  p_day: string;
  days: string;
  film_price: string;
}

interface ColResult {
  stretch: number;
  consumption: number;
  cost_per_pallet: number;
  total_consumption_year: number;
  total_cost_year: number;
}

// ─────────────────────────────────────────────
// DEFAULTS
// ─────────────────────────────────────────────
const DEFAULT_FORM: FormState = {
  thickness: "23",
  length: "1200",
  width: "800",
  turns: "16",
  p_day: "50",
  days: "220",
  film_price: "300",
};

const STRETCH: Record<PackMode, number> = {
  hand: 0,
  machine: 50,
  prestretch: 250,
};

const MODE_LABELS: Record<PackMode, string> = {
  hand: "Ручная обмотка",
  machine: "Машина без престрейча",
  prestretch: "Машина с престрейчем",
};

const MODES: PackMode[] = ["hand", "machine", "prestretch"];

const CALC_CONTACT_KEY = "calc_contact_submitted";

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
function n(s: string, fallback = 0): number {
  const v = parseFloat(s.replace(",", "."));
  return isNaN(v) || v < 0 ? fallback : v;
}

function fmt(v: number, digits = 0): string {
  return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: digits }).format(v);
}

function calcCol(f: FormState, mode: PackMode): ColResult {
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

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────
export default function Calc() {
  const [form, setForm] = useState<FormState>(DEFAULT_FORM);
  const [results, setResults] = useState<Record<PackMode, ColResult> | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const [contactSubmitted, setContactSubmitted] = useState(
    () => localStorage.getItem(CALC_CONTACT_KEY) === "true"
  );
  const [phoneDialogOpen, setPhoneDialogOpen] = useState(false);
  const [dialogPhone, setDialogPhone] = useState("");
  const [dialogLoading, setDialogLoading] = useState(false);
  const [dialogError, setDialogError] = useState("");

  const [pendingResults, setPendingResults] = useState<Record<PackMode, ColResult> | null>(null);

  const [leadName, setLeadName] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadEmail, setLeadEmail] = useState("");
  const [leadLoading, setLeadLoading] = useState(false);
  const [leadSent, setLeadSent] = useState(false);
  const [leadErrors, setLeadErrors] = useState<Record<string, string>>({});

  function set(key: keyof FormState) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((prev) => ({ ...prev, [key]: e.target.value }));
  }

  function showResults(res: Record<PackMode, ColResult>) {
    setResults(res);
    setTimeout(() => {
      resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  }

  function handleCalc() {
    const res: Record<PackMode, ColResult> = {
      hand: calcCol(form, "hand"),
      machine: calcCol(form, "machine"),
      prestretch: calcCol(form, "prestretch"),
    };

    if (contactSubmitted) {
      showResults(res);
    } else {
      setPendingResults(res);
      setPhoneDialogOpen(true);
    }
  }

  function handlePhoneSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!dialogPhone.trim()) {
      setDialogError("Укажите номер телефона");
      return;
    }
    setDialogError("");
    setDialogLoading(true);

    const utmData = getUtmFromCookies();

    fetch("/api/b24-send-lead.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        name: "",
        phone: dialogPhone,
        email: "",
        comment: "",
        source: "Калькулятор расхода плёнки",
        productType: "Паллетообмотчик",
        url: window.location.href,
        calc_params: form,
        calc_result: pendingResults,
        ...utmData,
      }),
    })
      .then(() => {
        if (typeof window !== "undefined" && (window as any).ym) {
          (window as any).ym(106348259, "reachGoal", "form_sent");
        }
      })
      .catch(() => {})
      .finally(() => {
        setDialogLoading(false);
        setContactSubmitted(true);
        localStorage.setItem(CALC_CONTACT_KEY, "true");
        setPhoneDialogOpen(false);
        if (pendingResults) {
          showResults(pendingResults);
          setPendingResults(null);
        }
      });
  }

  function handleLead(e: React.FormEvent) {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!leadName.trim()) errors.name = "Обязательное поле";
    if (!leadPhone.trim()) errors.phone = "Обязательное поле";
    if (!leadEmail.trim() || !leadEmail.includes("@")) errors.email = "Укажите корректный email";
    setLeadErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const utmData = getUtmFromCookies();

    setLeadLoading(true);
    fetch("/api/b24-send-lead.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        name: leadName,
        phone: leadPhone,
        email: leadEmail,
        comment: "",
        source: "Калькулятор расхода плёнки — КП",
        productType: "Паллетообмотчик",
        url: window.location.href,
        calc_params: form,
        calc_result: results,
        ...utmData,
      }),
    })
      .then(() => {
        if (typeof window !== "undefined" && (window as any).ym) {
          (window as any).ym(106348259, "reachGoal", "form_sent");
        }
      })
      .catch(() => {})
      .finally(() => {
        setLeadLoading(false);
        setLeadSent(true);
      });
  }

  const saving_no_prestretch = results
    ? results.hand.total_cost_year - results.machine.total_cost_year
    : null;
  const saving_prestretch = results
    ? results.hand.total_cost_year - results.prestretch.total_cost_year
    : null;

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Калькулятор расхода стрейч-плёнки
          </h1>
          <p className="text-gray-500 text-base mt-2">
            Сравните расход и затраты для трёх способов упаковки
          </p>
        </div>

        {/* FORM */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6">
          <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">
            Параметры паллеты и плёнки
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <Field label="Толщина плёнки, мкм">
              <Input
                type="number"
                min={1}
                value={form.thickness}
                onChange={set("thickness")}
              />
            </Field>
            <Field label="Длина паллеты, мм">
              <Input
                type="number"
                min={1}
                value={form.length}
                onChange={set("length")}
              />
            </Field>
            <Field label="Ширина паллеты, мм">
              <Input
                type="number"
                min={1}
                value={form.width}
                onChange={set("width")}
              />
            </Field>
            <Field label="Количество оборотов">
              <Input
                type="number"
                min={1}
                value={form.turns}
                onChange={set("turns")}
              />
            </Field>
            <Field label="Паллет в сутки, шт">
              <Input
                type="number"
                min={1}
                value={form.p_day}
                onChange={set("p_day")}
              />
            </Field>
            <Field label="Рабочих дней в году">
              <Input
                type="number"
                min={1}
                value={form.days}
                onChange={set("days")}
              />
            </Field>
            <Field label="Цена плёнки, руб/кг">
              <Input
                type="number"
                min={1}
                value={form.film_price}
                onChange={set("film_price")}
              />
            </Field>
          </div>

          <Button
            onClick={handleCalc}
            className="mt-6 w-full py-5 text-base font-bold bg-orange-500 hover:bg-orange-600 text-white"
          >
            Рассчитать
          </Button>
        </div>

        {/* PHONE DIALOG */}
        <Dialog open={phoneDialogOpen} onOpenChange={setPhoneDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="text-xl">
                Посмотрите расчёт экономии
              </DialogTitle>
              <DialogDescription className="text-base mt-2">
                Оставьте свой номер телефона и сразу же посмотрите расчёт экономии стрейч-плёнки
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handlePhoneSubmit} className="space-y-4 mt-2">
              <div className="space-y-1">
                <Label className="text-sm text-gray-600">Телефон *</Label>
                <Input
                  placeholder="+7 (___) ___-__-__"
                  value={dialogPhone}
                  onChange={(e) => setDialogPhone(e.target.value)}
                  className={dialogError ? "border-red-400" : ""}
                  autoFocus
                />
                {dialogError && <p className="text-sm text-red-500">{dialogError}</p>}
              </div>
              <Button
                type="submit"
                disabled={dialogLoading}
                className="w-full py-5 text-base font-bold bg-orange-500 hover:bg-orange-600 text-white"
              >
                {dialogLoading ? (
                  <span className="flex items-center gap-2">
                    <Icon name="Loader2" size={18} className="animate-spin" />
                    Отправляем...
                  </span>
                ) : (
                  "Показать расчёт"
                )}
              </Button>
              <p className="text-xs text-gray-400 text-center">
                Нажимая кнопку, вы соглашаетесь на обработку персональных данных
              </p>
            </form>
          </DialogContent>
        </Dialog>

        {/* RESULTS */}
        <div ref={resultRef}>
          {results && (
            <div className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="text-left px-5 py-4 text-sm font-semibold text-gray-500 uppercase tracking-wide w-1/4">
                          Показатель
                        </th>
                        {MODES.map((mode) => (
                          <th
                            key={mode}
                            className={`text-right px-5 py-4 text-sm font-semibold uppercase tracking-wide ${
                              mode === "hand"
                                ? "text-gray-500"
                                : mode === "machine"
                                ? "text-blue-600"
                                : "text-orange-600"
                            }`}
                          >
                            {MODE_LABELS[mode]}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      <ResultRow
                        label="Предварительное натяжение"
                        values={MODES.map((m) => `${results[m].stretch}%`)}
                        isString
                      />
                      <ResultRow
                        label="Расход плёнки на 1 паллет, г"
                        values={MODES.map((m) => fmt(results[m].consumption, 1))}
                        isString
                      />
                      <ResultRow
                        label="Стоимость плёнки на 1 паллет, руб"
                        values={MODES.map((m) => `${fmt(results[m].cost_per_pallet, 2)} ₽`)}
                        isString
                      />
                      <ResultRow
                        label="Суммарный расход плёнки в год, кг"
                        values={MODES.map((m) => fmt(results[m].total_consumption_year, 1))}
                        isString
                      />
                      <ResultRow
                        label="Суммарные затраты на плёнку в год, руб"
                        values={MODES.map((m) => `${fmt(results[m].total_cost_year)} ₽`)}
                        isString
                        highlight
                      />
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <SavingCard
                  label="Относительная экономия"
                  subtitle="Машина без пристрейча vs Ручная"
                  value={saving_no_prestretch!}
                />
                <SavingCard
                  label="Относительная экономия"
                  subtitle="Машина с пристрейчем vs Ручная"
                  value={saving_prestretch!}
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">
                    Машина без пристрейча
                  </p>
                  <ul className="space-y-2">
                    {[
                      { label: "TS3000MR-H",     anchor: "ts3000mr-h" },
                      { label: "TS3000MR-TP",    anchor: "ts3000mr-tp" },
                      { label: "TS3000MR-MT",    anchor: "ts3000mr-mt" },
                      { label: "TS3000MR-MT-TP", anchor: "ts3000mr-mt-tp" },
                    ].map(({ label, anchor }) => (
                      <li key={label}>
                        <a
                          href={`/#${anchor}`}
                          className="flex items-center gap-2 text-base font-medium text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          <Icon name="ExternalLink" size={14} className="shrink-0" />
                          {label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">
                    Машина с пристрейчем
                  </p>
                  <ul className="space-y-2">
                    {[
                      { label: "TS3000SPS-H",     anchor: "ts3000sps-h" },
                      { label: "TS3000SPS-TP",    anchor: "ts3000sps-tp" },
                      { label: "TS3000SPS-MT",    anchor: "ts3000sps-mt" },
                      { label: "TS3000SPS-MT-TP", anchor: "ts3000sps-mt-tp" },
                      { label: "ROBO-MS",         anchor: "robo-ms" },
                    ].map(({ label, anchor }) => (
                      <li key={label}>
                        <a
                          href={`/#${anchor}`}
                          className="flex items-center gap-2 text-base font-medium text-blue-600 hover:text-blue-800 hover:underline"
                        >
                          <Icon name="ExternalLink" size={14} className="shrink-0" />
                          {label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* LEAD FORM */}
        <div className="mt-10">
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
                  Получить коммерческое предложение
                </h2>
                <p className="text-sm text-gray-500 mb-5">
                  Отправим расчёт и подберём оборудование под ваши задачи.
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
                      "Отправить и запросить КП"
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
function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-sm text-gray-600">{label}</Label>
      {children}
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}

function ResultRow({
  label,
  values,
  isString,
  highlight,
}: {
  label: string;
  values: string[];
  isString?: boolean;
  highlight?: boolean;
}) {
  return (
    <tr className={highlight ? "bg-orange-50 font-semibold" : "hover:bg-gray-50/50"}>
      <td className={`px-5 py-4 text-base text-gray-700 ${highlight ? "font-semibold" : ""}`}>
        {label}
      </td>
      {values.map((v, i) => (
        <td
          key={i}
          className={`px-5 py-4 text-right text-base ${
            highlight ? "text-orange-700 font-bold text-lg" : "text-gray-700"
          }`}
        >
          {v}
        </td>
      ))}
    </tr>
  );
}

function SavingCard({
  label,
  subtitle,
  value,
}: {
  label: string;
  subtitle: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl p-6 border-2 bg-green-50 border-green-300">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">
        {label}
      </p>
      <p className="text-sm text-gray-500 mb-3">{subtitle}</p>
      <p className="text-4xl font-black leading-none text-green-600">
        {fmt(value)} ₽
      </p>
      <p className="text-xs text-gray-400 mt-2">в год</p>
    </div>
  );
}