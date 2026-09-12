import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  BrainCircuit,
  CalendarRange,
  Database,
  GitCompareArrows,
  LineChart,
  Scale,
  Sparkles,
  Wallet,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/home/HeroSection";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl space-y-3">
            <p className="text-center text-sm font-semibold uppercase tracking-widest text-sky-500 dark:text-sky-400">
              How it works
            </p>
            <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              From raw data to market insight
            </h2>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
            <StepCard
              icon={<Database className="h-5 w-5" />}
              step="01"
              title="Collect & Engineer"
              description="~2,000 real daily gold price records are combined with silver, crude oil, S&P 500 and USD index data. 35 technical and market features are engineered chronologically — no future leaks."
            />
            <StepCard
              icon={<BrainCircuit className="h-5 w-5" />}
              step="02"
              title="Train Machine-Learning Models"
              description="An XGBoost Regressor is tuned with cross-validation and trained from 2018 to 2025, while a Linear Regression baseline is trained on the identical window for fair comparison."
            />
            <StepCard
              icon={<LineChart className="h-5 w-5" />}
              step="03"
              title="Forecast & Analyze"
              description="The production model generates 3, 7 and 30-day forecasts recursively, with clear trend classification rules and honest walk-forward evaluation on hold-out data."
            />
          </div>
        </section>

        <section className="border-y border-slate-100 bg-slate-50/60 py-16 dark:border-slate-800 dark:bg-slate-900/40">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
              <div>
                <Badge variant="info" className="mb-4">
                  <Scale className="h-3 w-3" /> Honest evaluation
                </Badge>
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Every prediction is benchmarked
                </h2>
                <p className="mt-4 leading-relaxed text-slate-500 dark:text-slate-400">
                  Both models are scored on the same 2025–2026 test window using a one-day-ahead,
                  expanding-window walk-forward evaluation. The dashboard shows every metric — even
                  when the baseline beats the primary model — so you can judge the numbers yourself.
                </p>
                <Link href="/dashboard#model-comparison" className="mt-6 inline-block">
                  <Button variant="outline">
                    See the comparison <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-4 min-[420px]:grid-cols-2">
                <MetricCard label="Evaluation window" value="Walk-forward" sub="One-day-ahead, chronological" />
                <MetricCard label="Primary model" value="XGBoost" sub="Tuned via cross-validation" />
                <MetricCard label="Baseline model" value="Linear Regression" sub="Same train & test split" />
                <MetricCard label="Forecast horizons" value="3 / 7 / 30d" sub="Recursive one-day-ahead" />
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl space-y-3">
            <p className="text-center text-sm font-semibold uppercase tracking-widest text-sky-500 dark:text-sky-400">
              Interactive dashboard
            </p>
            <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Everything in one place
            </h2>
          </div>
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={<Wallet className="h-5 w-5" />}
              title="Market Overview"
              description="Live key levels, momentum and volatility stats pulled straight from the database."
            />
            <FeatureCard
              icon={<BarChart3 className="h-5 w-5" />}
              title="Gold Price History"
              description="Interactive OHLC charts with 30/90/180-day ranges and price-range selectors."
            />
            <FeatureCard
              icon={<CalendarRange className="h-5 w-5" />}
              title="Forecast Charts"
              description="3, 7 and 30-day XGBoost forecasts with confidence bands and next-day movement."
            />
            <FeatureCard
              icon={<GitCompareArrows className="h-5 w-5" />}
              title="Historical Records"
              description="Search, filter, sort and export the full 2,000-record dataset as CSV."
            />
          </div>
          <div className="mt-10 text-center">
            <Link href="/dashboard">
              <Button size="lg">
                <Sparkles className="h-4 w-4" /> Open the interactive dashboard
              </Button>
            </Link>
          </div>
        </section>

        <section className="border-t border-slate-100 py-16 dark:border-slate-800">
          <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
              Try GoldSense AI now
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-slate-500 dark:text-slate-400 sm:text-base">
              Forecasts are research tools, not financial advice. Gold is volatile — always make your
              own decisions with a clear head.
            </p>
            <Link href="/dashboard" className="mt-6 inline-block">
              <Button size="lg">
                Get started <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function StepCard({ icon, step, title, description }: { icon: React.ReactNode; step: string; title: string; description: string }) {
  return (
    <div className="relative rounded-3xl border border-slate-200/80 bg-white p-6 shadow-card transition-shadow hover:shadow-card-hover dark:border-slate-800 dark:bg-slate-900">
      <span className="absolute right-5 top-5 text-4xl font-extrabold text-slate-100 dark:text-slate-800">
        {step}
      </span>
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-brand text-white shadow-sm shadow-sky-500/25">
        {icon}
      </div>
      <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{description}</p>
    </div>
  );
}

function MetricCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs font-medium uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-1.5 text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">{value}</p>
      <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{sub}</p>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <Link href="/dashboard" className="group rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition-all hover:border-sky-200 hover:shadow-card-hover dark:border-slate-800 dark:bg-slate-900 dark:hover:border-sky-500/30">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600 transition-colors group-hover:bg-gradient-brand group-hover:text-white dark:bg-sky-500/10 dark:text-sky-400">
        {icon}
      </div>
      <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{description}</p>
    </Link>
  );
}