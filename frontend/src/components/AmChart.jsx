import { useLayoutEffect, useRef } from "react";
import * as am5 from "@amcharts/amcharts5";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

export default function AmChart({ data, build }) {
  const containerRef = useRef(null);
  const buildRef = useRef(build);
  buildRef.current = build;

  useLayoutEffect(() => {
    const root = am5.Root.new(containerRef.current);
    root.setThemes([am5themes_Animated.new(root)]);
    root.numberFormatter.set("numberFormat", "#.#a");
    buildRef.current(root, data);
    return () => root.dispose();
  }, [data]);

  return <div ref={containerRef} className="chart-canvas" />;
}
