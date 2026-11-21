import { useEffect, useState } from "react";
import ChartCard from "./ChartCard";
import AmChart from "./AmChart";
import { barChart, donutChart, privacyGroupedChart, PALETTE } from "../chartBuilders";
import "./TransactionAnalysis.css";

const BASE_URL = import.meta.env?.VITE_API_URL ?? "";

const buildGender = (root, rows) => donutChart(root, rows);
const buildAgeGroups = (root, rows) => barChart(root, rows, { color: PALETTE[1] });
const buildTopCities = (root, rows) => barChart(root, rows, { horizontal: true, limit: 10, color: PALETTE[0] });
const buildTopJobs = (root, rows) => barChart(root, rows, { horizontal: true, limit: 10, color: PALETTE[2] });

function PrivacyChartCard() {
  const [status, setStatus] = useState("loading");
  const [payload, setPayload] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState("All");
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`${BASE_URL}/api/customers/privacy-stats`, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed (${res.status})`);
        return res.json();
      })
      .then((data) => {
        console.log("Privacy API Response:", data);
        setPayload(data);
        // نختار "All" لو موجودة، أو أول دولة في القائمة تلقائياً
        const availableCountries = data?.countries || Object.keys(data?.data || {});
        if (availableCountries.length > 0 && !availableCountries.includes("All")) {
          setSelectedCountry(availableCountries[0]);
        }
        setStatus("success");
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setError(err.message);
          setStatus("error");
        }
      });
    return () => controller.abort();
  }, []);

  const rawRows = payload?.data?.[selectedCountry];
  const rows = Array.isArray(rawRows) ? rawRows : [];
  const countries = Array.isArray(payload?.countries)
    ? payload.countries
    : Object.keys(payload?.data || {});

  return (
    <section className="chart-card span-12">
      <header
        className="chart-card__header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          <h2 className="chart-card__title">Data privacy & disclosure by gender</h2>
          <p className="chart-card__subtitle">
            Valid vs. fake emails and disclosed vs. undisclosed jobs
          </p>
        </div>

        {status === "success" && countries.length > 0 && (
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            aria-label="Filter by country"
            style={{
              padding: "6px 12px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              background: "#ffffff",
              color: "#16233a",
              fontSize: "13px",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            {countries.map((country) => (
              <option key={country} value={country}>
                {country === "All" ? "All Countries" : country}
              </option>
            ))}
          </select>
        )}
      </header>

      <div className="chart-card__body" style={{ height: 380 }}>
        {status === "loading" && <div className="chart-card__state">Loading...</div>}
        {status === "error" && <div className="chart-card__state is-error">{error}</div>}
        {status === "success" && rows.length === 0 && (
          <div className="chart-card__state">No privacy data available for {selectedCountry}.</div>
        )}
        {status === "success" && rows.length > 0 && (
          <AmChart
            key={selectedCountry}
            data={rows}
            build={privacyGroupedChart}
            height={380}
          />
        )}
      </div>
    </section>
  );
}
export default function CustomerAnalysis() {
  return (
    <div className="ta-grid">
      <ChartCard
        className="span-6"
        title="Gender distribution"
        subtitle="Customer breakdown by gender"
        endpoint="/api/customers/gender"
        build={buildGender}
        height={340}
      />
      <ChartCard
        className="span-6"
        title="Age groups"
        subtitle="Number of customers per age bracket"
        endpoint="/api/customers/age-groups"
        build={buildAgeGroups}
        height={340}
      />

      <ChartCard
        className="span-6"
        title="Top 10 cities"
        subtitle="Cities with the highest customer count"
        endpoint="/api/customers/top-cities"
        build={buildTopCities}
        height={380}
      />
      <ChartCard
        className="span-6"
        title="Top 10 jobs"
        subtitle="Most common disclosed professions"
        endpoint="/api/customers/top-jobs"
        build={buildTopJobs}
        height={380}
      />

      <PrivacyChartCard />
    </div>
  );
}