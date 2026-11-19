import ChartCard from "./ChartCard";
import { barChart, donutChart, lineChart, PALETTE } from "./chartBuilders";
import "./TransactionAnalysis.css";

const buildTypes = (root, rows) => donutChart(root, rows);
const buildPayments = (root, rows) => barChart(root, rows, { horizontal: true, color: PALETTE[2] });
const buildSizes = (root, rows) => barChart(root, rows, { color: PALETTE[4] });
const buildMonthly = (root, rows) => lineChart(root, rows);
const buildCategories = (root, rows) => barChart(root, rows, { color: PALETTE[1] });
const buildProducts = (root, rows) => barChart(root, rows, { horizontal: true, limit: 10, color: PALETTE[3] });
const buildSubCategories = (root, rows) => barChart(root, rows, { horizontal: true, limit: 15, color: PALETTE[0] });

export default function TransactionAnalysis() {
  return (
    <div className="ta-grid">
      <ChartCard className="span-4" title="Transaction types" subtitle="Number of transactions by type"
        endpoint="/api/transaction-types" build={buildTypes} />
      <ChartCard className="span-4" title="Payment methods" subtitle="Number of transactions by method"
        endpoint="/api/payment-methods" build={buildPayments} />
      <ChartCard className="span-4" title="Sizes" subtitle="Items sold by size"
        endpoint="/api/sizes" build={buildSizes} />

      <ChartCard className="span-12" title="Monthly revenue" subtitle="Revenue over time"
        endpoint="/api/monthly-revenue" build={buildMonthly} height={360} />

      <ChartCard className="span-6" title="Top-selling categories" subtitle="Revenue by category"
        endpoint="/api/top-selling-categories" build={buildCategories} height={380} />
      <ChartCard className="span-6" title="Top-selling products" subtitle="Top 10 products by revenue"
        endpoint="/api/top-selling-products" build={buildProducts} height={380} />

      <ChartCard className="span-12" title="Best sub-categories" subtitle="Top 15 sub-categories by revenue"
        endpoint="/api/best-sub-categories" build={buildSubCategories} height={520} />
    </div>
  );
}
