import { useEffect, useState } from "react";
import ChartCard from "./ChartCard";
import {
  barChart,
  donutChart,
  PALETTE,
  storeCoordinatesChart,
} from "../chartBuilders";
import "./TransactionAnalysis.css";
import "./StoresAnalysis.css";

const buildEmployeesByCountry = (root, rows) =>
  barChart(root, rows, { color: PALETTE[2] });

const buildEmployeeDistribution = (root, rows) =>
  barChart(root, rows, {
    horizontal: true,
    color: PALETTE[1],
  });

const BASE_URL = import.meta.env?.VITE_API_URL ?? "";

function StoreSummary() {
  const [state, setState] = useState({
    status: "loading",
    data: null,
    error: null,
  });

  useEffect(() => {
    const controller = new AbortController();

    fetch(`${BASE_URL}/api/stores/summary`, {
      signal: controller.signal,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Request failed (${response.status})`);
        }

        return response.json();
      })
      .then((data) => {
        setState({
          status: "success",
          data,
          error: null,
        });
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          setState({
            status: "error",
            data: null,
            error: error.message,
          });
        }
      });

    return () => controller.abort();
  }, []);

  if (state.status === "loading") {
    return (
      <div className="stores-summary-message">
        Loading store summary...
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="stores-summary-message stores-summary-error">
        Could not load store summary: {state.error}
      </div>
    );
  }

  const metrics = [
    ["Total stores", state.data.total_stores, "store-icon"],
    ["Countries", state.data.total_countries, "globe-icon"],
    ["Total employees", state.data.total_employees, "team-icon"],
    [
      "Avg. employees / store",
      Number(state.data.average_employees_per_store).toFixed(2),
      "average-icon",
    ],
  ];

  return (
    <>
      <div className="stores-kpi-grid">
        {metrics.map(([label, value, icon]) => (
          <article className="stores-kpi-card" key={label}>
            <span
              className={`stores-kpi-icon ${icon}`}
              aria-hidden="true"
            />

            <div className="stores-kpi-copy">
              <span>{label}</span>

              <strong>
                {Number(value).toLocaleString()}
              </strong>
            </div>
          </article>
        ))}
      </div>

      <div
        className="stores-insights"
        aria-label="Key store insights"
      >
        <div>
          <strong>
            {state.data.stores_per_country ?? "—"}
          </strong>

          <span>stores in each country</span>
        </div>

        <div>
          <strong>
            {state.data.min_employees_per_store}–
            {state.data.max_employees_per_store}
          </strong>

          <span>employees per store</span>
        </div>

        <div>
          <strong>
            {state.data.top_employee_country_total}
          </strong>

          <span>
            employees in {state.data.top_employee_country}
          </span>
        </div>
      </div>
    </>
  );
}

export default function StoresAnalysis() {
  return (
    <div className="ta-grid stores-grid">
      <div className="span-12">
        <StoreSummary />
      </div>

      <ChartCard
        className="span-6"
        title="Employees by country"
        subtitle="Compare the total number of store employees in each country"
        endpoint="/api/stores/employees-by-country"
        build={buildEmployeesByCountry}
        height={330}
      />

      <ChartCard
        className="span-6"
        title="Employee share by country"
        subtitle="Each slice shows a country's share of all 299 store employees"
        endpoint="/api/stores/employees-by-country"
        build={(root, rows) =>
          donutChart(
            root,
            rows.map(({ country, employees }) => ({
              country,
              count: employees,
            }))
          )
        }
        height={330}
      />

      <ChartCard
        className="span-6"
        title="Stores by team size"
        subtitle="How many stores have 7, 8, 9 or 10 employees?"
        endpoint="/api/stores/employee-distribution"
        build={buildEmployeeDistribution}
        height={330}
      />

      <ChartCard
        className="span-6"
        title="Store locations (latitude & longitude)"
        subtitle="Each dot is one store, plotted from the exact coordinates in stores.csv"
        endpoint="/api/stores/locations"
        build={storeCoordinatesChart}
        height={330}
      />  
    </div>
  );
}