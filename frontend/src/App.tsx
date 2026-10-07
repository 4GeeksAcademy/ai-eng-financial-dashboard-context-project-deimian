import { useEffect, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { KPIRow } from "@/components/dashboard/kpi-row";
import { IncomeOutcomeChart } from "@/components/dashboard/income-outcome-chart";
import { ProfitPercentChart } from "@/components/dashboard/profit-percent-chart";
import { type FinancialMovement } from "@/lib/financial-types";
import { computeKPIs, computeMonthlyData } from "@/lib/financial-utils";

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
            <IncomeOutcomeChart data={monthlyData} loading={loading} />
            <ProfitPercentChart data={monthlyData} loading={loading} />
          </section>
        </div>
      </div>
    </main>
  );
}

export default App;
