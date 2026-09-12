import Link from "next/link";
import {
  ArrowRight,
  Calculator,
  Database,
  FileJson,
  GitCompareArrows,
  LineChart,
  Radio,
  Table2,
  Workflow,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { SiteFooter } from "@/components/SiteFooter";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main>
        <section className="border-b border-slate-100 bg-gradient-hero dark:border-slate-800">
          <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6 sm:py-20">
            <Badge variant="info" className="mb-5">About GoldSense AI</Badge>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
              Machine learning for precious metals
            </h1>
            <p className="mx-auto mt-5 max-w-2xl leading-relaxed text-slate-500 dark:text-slate-400 sm:text-lg">
              GoldSense AI is a full-stack exercise in applied data science. It collects real daily
              gold market data, engineers a rich feature set, trains two machine-learning models, and
              serves honest, walk-forward evaluation results through a polished interactive dashboard.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">The models</h2>
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
            <ModelCard
              badge="Production"
              badgeTone="sky"
              icon={<Workflow className="h-5 w-5" />}
              title="XGBoost Regressor"
              description="A gradient-boosted decision tree ensemble tuned with 5-fold time-series-aware cross-validation (best CV RMSE 176.98). It is the designated production model but is always compared against the baseline below."
            />
            <ModelCard
              badge="Baseline"
              badgeTone="violet"
              icon={<Calculator className="h-5 w-5" />}
              title="Linear Regression"
              description="A transparent linear baseline trained on the identical data split. On the hold-out window it performed strongly — the dashboard shows this honestly rather than hiding it."
            />
          </div>
        </section>

        <section className="border-y border-slate-100 bg-slate-50/60 py-16 dark:border-slate-800 dark:bg-slate-900/40">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Methodology</h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
              Every step is designed to avoid data leakage and to be auditable.
            </p>
            <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              <MethodCard
                icon={<Database className="h-5 w-5" />}
                title="Real data only"
                description="Daily OHLCV records for gold, silver, crude oil, S&P 500 and the USD index are pulled from Yahoo Finance — no fabricated or back-filled values."
              />
              <MethodCard
                icon={<Table2 className="h-5 w-5" />}
                title="35 engineered features"
                description="Lagged closes, moving averages, volatility, RSI, MACD, Bollinger Bands and market indicators — all computed chronologically from observed history."
              />
              <MethodCard
                icon={<GitCompareArrows className="h-5 w-5" />}
                title="Walk-forward evaluation"
                description="One-day-ahead, expanding-window evaluation on a 2025–2026 hold-out. The same window is used to score both models."
              />
              <MethodCard
                icon={<Radio className="h-5 w-5" />}
                title="Recursive forecasting"
                description="3, 7 and 30-day forecasts reuse the previous prediction as the next feature input, skipping weekends while external indicators are held at their last value."
              />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Tech stack</h2>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <StackCard
              icon={<FileJson className="h-5 w-5" />}
              title="Frontend"
              items={["Next.js 15", "React 19 & TypeScript", "Tailwind CSS", "Recharts"]}
            />
            <StackCard
              icon={<Workflow className="h-5 w-5" />}
              title="AI Engine"
              items={["Python 3.14", "scikit-learn", "XGBoost", "pandas & NumPy"]}
            />
            <StackCard
              icon={<Radio className="h-5 w-5" />}
              title="API Layer"
              items={["FastAPI", "SQLAlchemy", "Pydantic schemas", "10 REST endpoints"]}
            />
            <StackCard
              icon={<Database className="h-5 w-5" />}
              title="Storage"
              items={["PostgreSQL (primary)", "SQLite fallback", "Model artifacts", "Prediction store"]}
            />
          </div>
          <div className="mt-12 flex flex-wrap items-center gap-4 rounded-3xl border border-slate-200/80 bg-gradient-soft px-8 py-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Want to see the numbers yourself?
              </h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Open the dashboard to explore forecasts, model metrics and the full dataset.
              </p>
            </div>
            <Link href="/dashboard">
              <Button>
                Explore the dashboard <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
          <p className="mt-10 rounded-2xl bg-amber-50 px-5 py-4 text-sm leading-relaxed text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
            <strong>Disclaimer:</strong> GoldSense AI is an educational data-science project. Its
            forecasts are model outputs, not financial advice. Gold prices are influenced by many
            factors that models cannot fully capture.
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}

function ModelCard({
  badge,
  badgeTone,
  icon,
  title,
  description,
}: {
  badge: string;
  badgeTone: "sky" | "violet";
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-card dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <Badge variant={badgeTone === "sky" ? "info" : "warning"}>{badge}</Badge>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-brand text-white">
          {icon}
        </div>
      </div>
      <h3 className="mt-4 text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{description}</p>
    </div>
  );
}

function MethodCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm transition-shadow hover:shadow-card-hover dark:border-slate-800 dark:bg-slate-900">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400">
        {icon}
      </div>
      <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">{description}</p>
    </div>
  );
}

function StackCard({ icon, title, items }: { icon: React.ReactNode; title: string; items: string[] }) {
  return (
    <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-400">
        {icon}
      </div>
      <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">{title}</h3>
      <ul className="mt-3 space-y-1.5">
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <LineChart className="h-3 w-3 text-sky-400" /> {item}
          </li>
        ))}
      </ul>
    </div>
  );
}