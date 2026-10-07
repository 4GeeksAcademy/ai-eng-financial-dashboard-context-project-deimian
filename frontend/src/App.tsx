import { lazy, Suspense, useEffect, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { KPIRow } from "@/components/dashboard/kpi-row";
import { Skeleton } from "@/components/ui/skeleton";
import { type FinancialMovement } from "@/lib/financial-types";
import { computeKPIs, computeMonthlyData } from "@/lib/financial-utils";

const IncomeOutcomeChart = lazy(() =>
  import("@/components/dashboard/income-outcome-chart").then((module) => ({
    default: module.IncomeOutcomeChart,
  })),
);
const ProfitPercentChart = lazy(() =>
  import("@/components/dashboard/profit-percent-chart").then((module) => ({
    default: module.ProfitPercentChart,
  })),
);

function ChartFallback() {
  return (
    <div
      className="min-h-[400px] rounded-xl border border-border/60 bg-card p-6"
      role="status"
      aria-live="polite"
    >
      <span className="sr-only">Loading chart.</span>
      <Skeleton className="h-5 w-52" aria-hidden="true" />
      <Skeleton className="mt-3 h-3 w-64" aria-hidden="true" />
      <Skeleton className="mt-6 h-[280px] w-full rounded-lg" aria-hidden="true" />
    </div>
  );
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

async function fetchFinancialData(): Promise<FinancialMovement[]> {
  const response = await fetch(`${API_BASE_URL}/api/metrics`);
  if (!response.ok) {
    throw new Error(`Failed to fetch financial data: ${response.status}`);
  }
  return response.json();
}

function App() {
  const [movements, setMovements] = useState<FinancialMovement[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const metrics = movements ? computeKPIs(movements) : null;
  const monthlyData = movements ? computeMonthlyData(movements) : [];

  useEffect(() => {
    fetchFinancialData()
      .then((movements) => {
        setMovements(movements);
      })
      .catch(() => {
        setError(
          "No se pudo cargar la informacion financiera. Revisa la API de backend.",
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <main className="dark min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8">
          <DashboardHeader period="2024 - Full Year" />

          {loading ? (
            <p className="sr-only" role="status" aria-live="polite">
              Loading financial dashboard data.
            </p>
          ) : null}

          {error ? (
            <div
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive-foreground"
            >
              {error}
            </div>
          ) : null}

          <section aria-labelledby="kpi-heading">
            <h2 id="kpi-heading" className="sr-only">
              Key performance indicators
            </h2>
            <KPIRow metrics={metrics} loading={loading} />
          </section>

          <section
            aria-labelledby="charts-heading"
            className="grid grid-cols-1 gap-4 xl:grid-cols-2"
          >
            <h2 id="charts-heading" className="sr-only">
              Financial charts
            </h2>
            <Suspense fallback={<ChartFallback />}>
              <IncomeOutcomeChart data={monthlyData} loading={loading} />
            </Suspense>
            <Suspense fallback={<ChartFallback />}>
              <ProfitPercentChart data={monthlyData} loading={loading} />
            </Suspense>
          </section>
        </div>
      </div>
    </main>
  );
}

export default App;
