import { useApi } from "../hooks/useApi";
import AmChart from "./AmChart";


export default function ChartCard({ title, subtitle, endpoint, build, height = 320, className = "" }) {
  const { status, data, error, reload } = useApi(endpoint);

  return (
    <section className={`chart-card ${className}`}>
      <header className="chart-card__head">
        <h3>{title}</h3>
        {subtitle && <p>{subtitle}</p>}
      </header>

      <div className="chart-card__body" style={{ height }}>
        {status === "loading" && (
          <div className="chart-state" role="status">
            <span className="spinner" aria-hidden="true" />
            <p>Loading data</p>
          </div>
        )}

        {status === "error" && (
          <div className="chart-state chart-state--error" role="alert">
            <p><strong>Couldn’t load this chart.</strong></p>
            <p>{error}. Check that the Flask API is running, then try again.</p>
            <button type="button" onClick={reload}>Try again</button>
          </div>
        )}

        {status === "empty" && (
          <div className="chart-state">
            <p><strong>No data available.</strong></p>
            <p>{endpoint} returned no records.</p>
          </div>
        )}

        {status === "success" && <AmChart data={data} build={build} />}
      </div>
    </section>
  );
}
