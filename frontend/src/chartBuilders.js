import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import * as am5percent from "@amcharts/amcharts5/percent";

// Index order is relied on by TransactionAnalysis.jsx: 0 ocean, 1 deep indigo, 2 royal blue, 3 sky, 4 indigo-violet.
export const PALETTE = [
  "#0891b2", // ocean (bluer than the old teal)
  "#3730a3", // deep indigo
  "#2563eb", // royal blue
  "#38bdf8", // sky
  "#6366f1", // indigo-violet
  "#0f766e", // deep teal
  "#475569", // slate
  "#7dd3fc", // light sky
];
const INK = am5.color("#16233a");
const TEXT = am5.color("#66748b");
const GRID = am5.color("#e3e8f0");
const WHITE = am5.color("#ffffff");

// Gradient end colour for each PALETTE slot (same index): base colour -> end colour.
const GRADIENT_END = [
  "#5eead4", // ocean   -> mint
  "#8b5cf6", // indigo  -> violet
  "#22d3ee", // blue    -> cyan
  "#818cf8", // sky     -> periwinkle
  "#a78bfa", // violet  -> lavender
  "#2dd4bf", // deep teal -> aqua
  "#94a3b8", // slate   -> light slate
  "#c7d2fe", // light sky -> pale indigo
];

/** Two-colour linear gradient for a palette colour. flip swaps which end comes first. */
function gradient(root, hex, rotation = 0, flip = false) {
  const i = PALETTE.indexOf(hex.toLowerCase());
  const from = am5.color(hex);
  const to = i >= 0 ? am5.color(GRADIENT_END[i]) : am5.Color.lighten(from, 0.35);
  const stops = flip ? [{ color: to }, { color: from }] : [{ color: from }, { color: to }];
  return am5.LinearGradient.new(root, { rotation, stops });
}

/** Chart-friendly rows have one label field and one numeric field; find them. */
export function inferKeys(rows) {
  const sample = rows[0] ?? {};
  const keys = Object.keys(sample);
  const valKey =
    ["count", "revenue", "value"].find((k) => k in sample) ??
    keys.find((k) => typeof sample[k] === "number");
  const catKey = keys.find((k) => k !== valKey);
  return { catKey, valKey };
}

function styleAxis(renderer, { grid = true, category = false } = {}) {
  renderer.labels.template.setAll({ fill: category ? INK : TEXT, fontSize: 12 });
  renderer.grid.template.setAll({
    stroke: GRID,
    strokeOpacity: grid ? 1 : 0,
    strokeDasharray: grid ? [3, 4] : undefined,
  });
}

function addCursor(root, chart) {
  const cursor = chart.set("cursor", am5xy.XYCursor.new(root, { behavior: "none" }));
  cursor.lineX.set("visible", false);
  cursor.lineY.set("visible", false);
}

export function donutChart(root, rows) {
  const { catKey, valKey } = inferKeys(rows);
  const total = rows.reduce((sum, r) => sum + (r[valKey] || 0), 0);

  const chart = root.container.children.push(
    am5percent.PieChart.new(root, { innerRadius: am5.percent(72), layout: root.verticalLayout })
  );
  const series = chart.series.push(
    am5percent.PieSeries.new(root, { valueField: valKey, categoryField: catKey })
  );
  series.get("colors").set("colors", PALETTE.map((c) => am5.color(c)));
  series.slices.template.setAll({
    stroke: WHITE,
    strokeWidth: 3,
    cornerRadius: 4,
    tooltipText: "{category}: {value.formatNumber('#,###')} ({valuePercentTotal.formatNumber('0.0')}%)",
  });
  series.slices.template.adapters.add("fillGradient", (_, target) => {
    const base = target.get("fill");
    return base ? gradient(root, base.toCSSHex(), 45) : undefined;
  });
  series.labels.template.set("visible", false);
  series.ticks.template.set("visible", false);
  series.data.setAll(rows);

  // Total in the donut's centre
  chart.seriesContainer.children.push(
    am5.Label.new(root, {
      text: `[bold fontSize:24px #16233a]${root.numberFormatter.format(total)}[/]\n[fontSize:12px]total[/]`,
      textAlign: "center",
      centerX: am5.p50,
      centerY: am5.p50,
      fill: TEXT,
    })
  );

  const legend = chart.children.push(
    am5.Legend.new(root, { centerX: am5.percent(50), x: am5.percent(50), marginTop: 12 })
  );
  legend.labels.template.setAll({ fill: INK, fontSize: 12 });
  legend.markers.template.setAll({ width: 10, height: 10 });
  legend.markerRectangles.template.setAll({ cornerRadiusTL: 5, cornerRadiusTR: 5, cornerRadiusBL: 5, cornerRadiusBR: 5 });
  legend.data.setAll(series.dataItems);
}

export function barChart(
  root,
  rows,
  { horizontal = false, limit, color = PALETTE[0], sort = true } = {}
) {
  const { catKey, valKey } = inferKeys(rows);
  // sort: true orders bars by value (largest first); sort: false keeps the order the API sent.
  let data = sort ? [...rows].sort((a, b) => b[valKey] - a[valKey]) : [...rows];
  if (limit) data = data.slice(0, limit);

  const chart = root.container.children.push(
    am5xy.XYChart.new(root, { panX: false, panY: false, layout: root.verticalLayout })
  );

  const catRenderer = horizontal
    ? am5xy.AxisRendererY.new(root, { inversed: true, minGridDistance: 18, cellStartLocation: 0.2, cellEndLocation: 0.8 })
    : am5xy.AxisRendererX.new(root, { minGridDistance: 30, cellStartLocation: 0.18, cellEndLocation: 0.82 });
  const valRenderer = horizontal ? am5xy.AxisRendererX.new(root, {}) : am5xy.AxisRendererY.new(root, {});
  styleAxis(catRenderer, { grid: false, category: true });
  styleAxis(valRenderer);
  catRenderer.labels.template.setAll({ maxWidth: 190, oversizedBehavior: "truncate" });

  const catAxis = (horizontal ? chart.yAxes : chart.xAxes).push(
    am5xy.CategoryAxis.new(root, { categoryField: catKey, renderer: catRenderer })
  );
  const valAxis = (horizontal ? chart.xAxes : chart.yAxes).push(
    am5xy.ValueAxis.new(root, { renderer: valRenderer, min: 0 })
  );

  const series = chart.series.push(
    am5xy.ColumnSeries.new(root, {
      xAxis: horizontal ? valAxis : catAxis,
      yAxis: horizontal ? catAxis : valAxis,
      ...(horizontal
        ? { valueXField: valKey, categoryYField: catKey }
        : { valueYField: valKey, categoryXField: catKey }),
      fill: am5.color(color),
      stroke: am5.color(color),
      tooltip: am5.Tooltip.new(root, {
        labelText: horizontal
          ? "{categoryY}: {valueX.formatNumber('#,###')}"
          : "{categoryX}: {valueY.formatNumber('#,###')}",
      }),
    })
  );
  // Round only the free end of each bar
  series.columns.template.setAll({
    ...(horizontal ? { cornerRadiusTR: 7, cornerRadiusBR: 7 } : { cornerRadiusTL: 8, cornerRadiusTR: 8 }),
    strokeOpacity: 0,
    // Horizontal bars blend left to right; vertical bars blend bottom to top.
    fillGradient: horizontal ? gradient(root, color, 0) : gradient(root, color, 90, true),
  });

  catAxis.data.setAll(data);
  series.data.setAll(data);
  addCursor(root, chart);
}

export function lineChart(root, rows) {
  const color = am5.color(PALETTE[0]);
  const data = rows
    .map((r) => ({
      ts: new Date(/^\d{4}-\d{2}$/.test(r.date) ? `${r.date}-01` : r.date).getTime(),
      revenue: r.revenue,
    }))
    .sort((a, b) => a.ts - b.ts);

  const chart = root.container.children.push(
    am5xy.XYChart.new(root, { panX: true, wheelX: "panX", wheelY: "zoomX", pinchZoomX: true })
  );

  const xRenderer = am5xy.AxisRendererX.new(root, { minGridDistance: 70 });
  const yRenderer = am5xy.AxisRendererY.new(root, {});
  styleAxis(xRenderer, { grid: false });
  styleAxis(yRenderer);

  const xAxis = chart.xAxes.push(
    am5xy.DateAxis.new(root, { baseInterval: { timeUnit: "month", count: 1 }, renderer: xRenderer })
  );
  const yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, { renderer: yRenderer, min: 0 }));

  const series = chart.series.push(
    am5xy.LineSeries.new(root, {
      xAxis,
      yAxis,
      valueXField: "ts",
      valueYField: "revenue",
      fill: color,
      stroke: color,
      tooltip: am5.Tooltip.new(root, { labelText: "{valueX.formatDate('MMM yyyy')}: {valueY.formatNumber('#,###')}" }),
    })
  );
  series.strokes.template.setAll({
    strokeWidth: 3,
    strokeGradient: gradient(root, PALETTE[0], 0),
  });
  series.fills.template.setAll({
    visible: true,
    fillOpacity: 1,
    fillGradient: am5.LinearGradient.new(root, {
      rotation: 90,
      stops: [
        { color, opacity: 0.32 },
        { color, opacity: 0 },
      ],
    }),
  });
  series.bullets.push(() =>
    am5.Bullet.new(root, {
      sprite: am5.Circle.new(root, { radius: 4.5, fill: WHITE, stroke: color, strokeWidth: 2.5 }),
    })
  );

  series.data.setAll(data);
  addCursor(root, chart);
  series.appear(800);
}

export function privacyGroupedChart(root, rows) {
  const chart = root.container.children.push(
    am5xy.XYChart.new(root, { panX: false, panY: false, layout: root.verticalLayout })
  );

  const xRenderer = am5xy.AxisRendererX.new(root, { minGridDistance: 30, cellStartLocation: 0.15, cellEndLocation: 0.85 });
  const yRenderer = am5xy.AxisRendererY.new(root, {});
  styleAxis(xRenderer, { grid: false, category: true });
  styleAxis(yRenderer);

  const xAxis = chart.xAxes.push(
    am5xy.CategoryAxis.new(root, { categoryField: "gender", renderer: xRenderer })
  );
  const yAxis = chart.yAxes.push(
    am5xy.ValueAxis.new(root, { renderer: yRenderer, min: 0 })
  );

  xAxis.data.setAll(rows);

  const metrics = [
    { field: "validEmails", name: "Valid Emails", color: PALETTE[0] },
    { field: "fakeEmails", name: "Fake Emails", color: PALETTE[3] },
    { field: "disclosedJobs", name: "Disclosed Jobs", color: PALETTE[1] },
    { field: "undisclosedJobs", name: "Undisclosed Jobs", color: PALETTE[4] },
  ];

  metrics.forEach(({ field, name, color }) => {
    const series = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        name,
        xAxis,
        yAxis,
        valueYField: field,
        categoryXField: "gender",
        fill: am5.color(color),
        stroke: am5.color(color),
        tooltip: am5.Tooltip.new(root, {
          labelText: "{name} ({categoryX}): {valueY.formatNumber('#,###')}",
        }),
      })
    );
    series.columns.template.setAll({
      cornerRadiusTL: 6,
      cornerRadiusTR: 6,
      strokeOpacity: 0,
      fillGradient: gradient(root, color, 90, true),
    });
    series.data.setAll(rows);
  });

  const legend = chart.children.push(
    am5.Legend.new(root, { centerX: am5.percent(50), x: am5.percent(50), marginTop: 12 })
  );
  legend.labels.template.setAll({ fill: INK, fontSize: 12 });
  legend.markers.template.setAll({ width: 10, height: 10 });
  legend.markerRectangles.template.setAll({ cornerRadiusTL: 5, cornerRadiusTR: 5, cornerRadiusBL: 5, cornerRadiusBR: 5 });
  legend.data.setAll(chart.series.values);

  addCursor(root, chart);
}

/**
 * Scatter plot of store locations: x = longitude, y = latitude, one dot per store.
 * Expects rows like { store_id, store, city, country, latitude, longitude }.
 */
export function storeCoordinatesChart(root, rows) {
  const data = rows
    .map((r) => ({
      lat: Number(r.latitude),
      lng: Number(r.longitude),
      store: r.store,
      city: r.city,
      country: r.country,
    }))
    .filter((d) => Number.isFinite(d.lat) && Number.isFinite(d.lng));

  const chart = root.container.children.push(
    am5xy.XYChart.new(root, {
      panX: true,
      panY: true,
      wheelX: "zoomX",
      wheelY: "zoomY",
      pinchZoomX: true,
      pinchZoomY: true,
      layout: root.verticalLayout,
    })
  );

  const xRenderer = am5xy.AxisRendererX.new(root, { minGridDistance: 60 });
  const yRenderer = am5xy.AxisRendererY.new(root, { minGridDistance: 40 });
  styleAxis(xRenderer);
  styleAxis(yRenderer);

  const xAxis = chart.xAxes.push(
    am5xy.ValueAxis.new(root, { renderer: xRenderer, extraMin: 0.05, extraMax: 0.05 })
  );
  const yAxis = chart.yAxes.push(
    am5xy.ValueAxis.new(root, { renderer: yRenderer, extraMin: 0.05, extraMax: 0.05 })
  );

  xAxis.children.push(
    am5.Label.new(root, { text: "Longitude", x: am5.p50, centerX: am5.p50, fill: TEXT, fontSize: 12 })
  );
  yAxis.children.unshift(
    am5.Label.new(root, { text: "Latitude", rotation: -90, y: am5.p50, centerX: am5.p50, fill: TEXT, fontSize: 12 })
  );

  const color = am5.color(PALETTE[0]);
  const series = chart.series.push(
    am5xy.LineSeries.new(root, {
      xAxis,
      yAxis,
      valueXField: "lng",
      valueYField: "lat",
      stroke: color,
      fill: color,
    })
  );
  // Dots only, no connecting line
  series.strokes.template.set("visible", false);

  series.bullets.push(() =>
    am5.Bullet.new(root, {
      sprite: am5.Circle.new(root, {
        radius: 5,
        fill: color,
        fillOpacity: 0.75,
        stroke: WHITE,
        strokeWidth: 1.5,
        tooltip: am5.Tooltip.new(root, {}),
        tooltipText:
          "{store}\n{city}, {country}\nLat: {valueY.formatNumber('0.0000')}  Lng: {valueX.formatNumber('0.0000')}",
      }),
    })
  );

  series.data.setAll(data);
  addCursor(root, chart);
  series.appear(800);
}