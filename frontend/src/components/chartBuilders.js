import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import * as am5percent from "@amcharts/amcharts5/percent";

// Standard dashboard palette
export const PALETTE = [
  "#3B82F6",
  "#10B981",
  "#F59E0B",
  "#F87171",
  "#8B5CF6",
  "#06B6D4",
];

const TEXT = am5.color("#1F2937");
const GRID = am5.color("#E5E7EB");
const BACKGROUND = am5.color("#FFFFFF");

export function inferKeys(rows) {
  const sample = rows[0] ?? {};
  const keys = Object.keys(sample);

  const valKey =
    ["count", "revenue", "value"].find((k) => k in sample) ??
    keys.find((k) => typeof sample[k] === "number");

  const catKey = keys.find((k) => k !== valKey);

  return { catKey, valKey };
}

function applyBackground(root) {
  root.container.set(
    "background",
    am5.Rectangle.new(root, {
      fill: BACKGROUND,
      fillOpacity: 1,
    })
  );
}

function makeTooltip(root, labelText) {
  const tooltip = am5.Tooltip.new(root, {
    labelText,
  });

  tooltip.get("background").setAll({
    fill: BACKGROUND,
    fillOpacity: 1,
    stroke: GRID,
    strokeOpacity: 1,
  });

  tooltip.label.setAll({
    fill: TEXT,
  });

  return tooltip;
}

function styleAxis(renderer, { grid = true } = {}) {
  renderer.labels.template.setAll({
    fill: TEXT,
    fontSize: 12,
    fontWeight: "500",
  });

  renderer.grid.template.setAll({
    stroke: GRID,
    strokeOpacity: grid ? 1 : 0,
    strokeDasharray: [4, 4],
  });

  renderer.ticks.template.setAll({
    visible: false,
  });
}

function addCursor(root, chart) {
  const cursor = chart.set(
    "cursor",
    am5xy.XYCursor.new(root, {
      behavior: "none",
    })
  );

  cursor.lineX.setAll({
    visible: false,
  });

  cursor.lineY.setAll({
    visible: false,
  });
}

function createGradient(root, color, horizontal) {
  return am5.LinearGradient.new(root, {
    rotation: horizontal ? 0 : 90,

    stops: [
      {
        color: am5.color(color),
        opacity: 1,
      },
      {
        color: am5.color(color),
        opacity: 0.75,
      },
    ],
  });
}

// TOP SELLING PRODUCTS PIE CHART
export function pieChart(root, rows, { limit = 10 } = {}) {
  applyBackground(root);

  const { catKey, valKey } = inferKeys(rows);

  let data = [...rows].sort(
    (a, b) => b[valKey] - a[valKey]
  );

  // Keep only the top 10 products
  data = data.slice(0, limit);

  const chart = root.container.children.push(
    am5percent.PieChart.new(root, {
      layout: root.verticalLayout,

      paddingTop: 10,
      paddingBottom: 10,
      paddingLeft: 10,
      paddingRight: 10,
    })
  );

  const series = chart.series.push(
    am5percent.PieSeries.new(root, {
      valueField: valKey,
      categoryField: catKey,
    })
  );

  series.set(
    "colors",
    am5.ColorSet.new(root, {
      colors: PALETTE.map((c) => am5.color(c)),
    })
  );

  series.slices.template.setAll({
    stroke: BACKGROUND,
    strokeWidth: 2,
    cornerRadius: 5,

    tooltip: makeTooltip(
      root,
      "{category}: {value.formatNumber('#,###')} ({valuePercentTotal.formatNumber('0.0')}%)"
    ),
  });

  series.slices.template.states.create("hover", {
    scale: 1.04,
  });

  series.labels.template.setAll({
    fill: TEXT,
    fontSize: 12,
    fontWeight: "500",

    text: "{category}: {valuePercentTotal.formatNumber('0.0')}%",
  });

  series.ticks.template.setAll({
    stroke: TEXT,
    strokeOpacity: 0.5,
  });

  series.data.setAll(data);

  const legend = chart.children.push(
    am5.Legend.new(root, {
      centerX: am5.percent(50),
      x: am5.percent(50),

      marginTop: 15,

      layout: root.verticalLayout,
    })
  );

  legend.labels.template.setAll({
    fill: TEXT,
    fontSize: 12,
    fontWeight: "500",
  });

  legend.valueLabels.template.setAll({
    fill: TEXT,
    fontSize: 12,
  });

  legend.markers.template.setAll({
    width: 10,
    height: 10,
  });

  legend.data.setAll(series.dataItems);

  series.appear(800);

  return chart;
}

// DONUT CHART
export function donutChart(root, rows) {
  applyBackground(root);

  const { catKey, valKey } = inferKeys(rows);

  const chart = root.container.children.push(
    am5percent.PieChart.new(root, {
      innerRadius: am5.percent(65),
      layout: root.verticalLayout,
    })
  );

  const series = chart.series.push(
    am5percent.PieSeries.new(root, {
      valueField: valKey,
      categoryField: catKey,
    })
  );

  series.set(
    "colors",
    am5.ColorSet.new(root, {
      colors: PALETTE.map((c) => am5.color(c)),
    })
  );

  series.slices.template.setAll({
    stroke: BACKGROUND,
    strokeWidth: 2,
    cornerRadius: 4,

    tooltip: makeTooltip(
      root,
      "{category}: {value.formatNumber('#,###')} ({valuePercentTotal.formatNumber('0.0')}%)"
    ),
  });

  series.slices.template.states.create("hover", {
    scale: 1.04,
  });

  series.labels.template.set("visible", false);

  series.ticks.template.set("visible", false);

  series.data.setAll(rows);

  const legend = chart.children.push(
    am5.Legend.new(root, {
      centerX: am5.percent(50),
      x: am5.percent(50),

      marginTop: 15,

      layout: root.horizontalLayout,
    })
  );

  legend.labels.template.setAll({
    fill: TEXT,
    fontSize: 12,
    fontWeight: "500",
  });

  legend.markers.template.setAll({
    width: 10,
    height: 10,
  });

  legend.data.setAll(series.dataItems);

  return chart;
}

// BAR CHART
export function barChart(
  root,
  rows,
  {
    horizontal = false,
    limit,
    color = PALETTE[0],
  } = {}
) {
  applyBackground(root);

  const { catKey, valKey } = inferKeys(rows);

  let data = [...rows].sort(
    (a, b) => b[valKey] - a[valKey]
  );

  if (limit) {
    data = data.slice(0, limit);
  }

  const chart = root.container.children.push(
    am5xy.XYChart.new(root, {
      panX: false,
      panY: false,

      layout: root.verticalLayout,

      paddingTop: 10,
      paddingBottom: 10,
      paddingLeft: 5,
      paddingRight: 10,
    })
  );

  const catRenderer = horizontal
    ? am5xy.AxisRendererY.new(root, {
        inversed: true,

        minGridDistance: 18,

        cellStartLocation: 0.15,
        cellEndLocation: 0.85,
      })
    : am5xy.AxisRendererX.new(root, {
        minGridDistance: 30,

        cellStartLocation: 0.2,
        cellEndLocation: 0.8,
      });

  const valRenderer = horizontal
    ? am5xy.AxisRendererX.new(root, {})
    : am5xy.AxisRendererY.new(root, {});

  styleAxis(catRenderer, {
    grid: false,
  });

  styleAxis(valRenderer);

  catRenderer.labels.template.setAll({
    maxWidth: 190,
    oversizedBehavior: "truncate",
  });

  const catAxis = (
    horizontal
      ? chart.yAxes
      : chart.xAxes
  ).push(
    am5xy.CategoryAxis.new(root, {
      categoryField: catKey,
      renderer: catRenderer,
    })
  );

  const valAxis = (
    horizontal
      ? chart.xAxes
      : chart.yAxes
  ).push(
    am5xy.ValueAxis.new(root, {
      renderer: valRenderer,
      min: 0,
    })
  );

  const series = chart.series.push(
    am5xy.ColumnSeries.new(root, {
      xAxis: horizontal
        ? valAxis
        : catAxis,

      yAxis: horizontal
        ? catAxis
        : valAxis,

      ...(horizontal
        ? {
            valueXField: valKey,
            categoryYField: catKey,
          }
        : {
            valueYField: valKey,
            categoryXField: catKey,
          }),

      fill: am5.color(color),
      stroke: am5.color(color),

      tooltip: makeTooltip(
        root,
        horizontal
          ? "{categoryY}: {valueX.formatNumber('#,###')}"
          : "{categoryX}: {valueY.formatNumber('#,###')}"
      ),
    })
  );

  series.columns.template.setAll({
    cornerRadiusTL: 4,
    cornerRadiusTR: 4,
    cornerRadiusBL: 4,
    cornerRadiusBR: 4,

    strokeOpacity: 0,
  });

  series.columns.template.adapters.add(
    "fillGradient",
    () =>
      createGradient(
        root,
        color,
        horizontal
      )
  );

  series.columns.template.states.create(
    "hover",
    {
      scaleY: horizontal ? 1 : 1.03,
      scaleX: horizontal ? 1.03 : 1,
    }
  );

  catAxis.data.setAll(data);

  series.data.setAll(data);

  addCursor(root, chart);

  series.appear(800);

  return chart;
}

// LINE CHART
export function lineChart(root, rows) {
  applyBackground(root);

  root.utc = true;

  const color = PALETTE[0];

  const data = rows
    .map((r) => ({
      ts: new Date(
        /^\d{4}-\d{2}$/.test(r.date)
          ? `${r.date}-01`
          : r.date
      ).getTime(),

      revenue: r.revenue,
    }))
    .sort(
      (a, b) => a.ts - b.ts
    );

  const chart = root.container.children.push(
    am5xy.XYChart.new(root, {
      panX: true,

      wheelX: "panX",
      wheelY: "zoomX",

      pinchZoomX: true,

      paddingTop: 10,
      paddingBottom: 10,
      paddingLeft: 5,
      paddingRight: 10,
    })
  );

  const xRenderer =
    am5xy.AxisRendererX.new(root, {
      minGridDistance: 70,
    });

  const yRenderer =
    am5xy.AxisRendererY.new(root, {});

  styleAxis(
    xRenderer,
    {
      grid: false,
    }
  );

  styleAxis(yRenderer);

  const xAxis = chart.xAxes.push(
    am5xy.DateAxis.new(root, {
      baseInterval: {
        timeUnit: "month",
        count: 1,
      },

      renderer: xRenderer,
    })
  );

  const yAxis = chart.yAxes.push(
    am5xy.ValueAxis.new(root, {
      renderer: yRenderer,
      min: 0,
    })
  );

  const series = chart.series.push(
    am5xy.LineSeries.new(root, {
      xAxis,
      yAxis,

      valueXField: "ts",
      valueYField: "revenue",

      fill: am5.color(color),
      stroke: am5.color(color),

      tooltip: makeTooltip(
        root,
        "{valueX.formatDate('MMM yyyy')}: {valueY.formatNumber('#,###')}"
      ),
    })
  );

  series.strokes.template.setAll({
    strokeWidth: 3,
    stroke: am5.color(color),
  });

  series.fills.template.setAll({
    visible: true,

    fillGradient:
      am5.LinearGradient.new(root, {
        rotation: 90,

        stops: [
          {
            color: am5.color(color),
            opacity: 0.3,
          },
          {
            color: am5.color(color),
            opacity: 0,
          },
        ],
      }),
  });

  series.bullets.push(() =>
    am5.Bullet.new(root, {
      sprite:
        am5.Circle.new(root, {
          radius: 4,

          fill: BACKGROUND,

          stroke: am5.color(color),

          strokeWidth: 2,
        }),
    })
  );

  series.data.setAll(data);

  addCursor(root, chart);

  series.appear(800);

  return chart;
}