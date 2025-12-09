import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { COLORS } from '../constants';

interface DataPoint {
  time: number;
  value: number;
}

interface OscilloscopeProps {
  data: DataPoint[];
  title: string;
  color: string;
  yDomain: [number, number];
  height?: number;
  showGrid?: boolean;
  isDigital?: boolean;
}

export const Oscilloscope: React.FC<OscilloscopeProps> = ({
  data,
  title,
  color,
  yDomain,
  height = 200,
  showGrid = true,
  isDigital = false,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || data.length === 0) return;

    const margin = { top: 20, right: 20, bottom: 20, left: 40 };
    const width = containerRef.current.clientWidth - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous render

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const now = data[data.length - 1].time;
    // Show last 5 seconds window, or fit data if less
    const xMin = Math.max(0, now - 5); 
    
    const x = d3.scaleLinear()
      .domain([xMin, now])
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain(yDomain)
      .range([innerHeight, 0]);

    // Grid
    if (showGrid) {
      const xAxisGrid = d3.axisBottom(x).tickSize(-innerHeight).tickFormat(() => "").ticks(10);
      const yAxisGrid = d3.axisLeft(y).tickSize(-width).tickFormat(() => "").ticks(5);

      g.append("g")
        .attr("class", "grid x-grid")
        .attr("transform", `translate(0,${innerHeight})`)
        .call(xAxisGrid)
        .style("stroke-opacity", 0.1)
        .style("color", COLORS.grid);

      g.append("g")
        .attr("class", "grid y-grid")
        .call(yAxisGrid)
        .style("stroke-opacity", 0.1)
        .style("color", COLORS.grid);
    }

    // Axes
    const xAxis = d3.axisBottom(x).ticks(5).tickFormat(d => d.valueOf().toFixed(1) + "s");
    const yAxis = d3.axisLeft(y).ticks(5);

    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(xAxis)
      .style("color", "#94a3b8");

    g.append("g")
      .call(yAxis)
      .style("color", "#94a3b8");

    // Line Generator
    const line = d3.line<DataPoint>()
      .x(d => x(d.time))
      .y(d => y(d.value));
      
    // Use step curve for digital signals, smooth for analog
    if (isDigital) {
        line.curve(d3.curveStepAfter);
    } else {
        line.curve(d3.curveMonotoneX);
    }

    // Path
    g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", color)
      .attr("stroke-width", 2)
      .attr("d", line);
      
    // Title
    g.append("text")
      .attr("x", 10)
      .attr("y", -5)
      .attr("fill", color)
      .attr("font-size", "12px")
      .attr("font-weight", "bold")
      .text(title.toUpperCase());

  }, [data, height, title, color, yDomain, showGrid, isDigital]);

  return (
    <div ref={containerRef} className="w-full bg-slate-900/50 rounded-lg border border-slate-800 overflow-hidden shadow-sm">
      <svg ref={svgRef} width="100%" height={height} className="block"></svg>
    </div>
  );
};