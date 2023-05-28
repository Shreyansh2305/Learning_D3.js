import React, { useState, useEffect, useRef } from "react";
import { DataGrid } from "@mui/x-data-grid";
import * as d3 from "d3";

const PlotWithTable = () => {
  const [dots, setDots] = useState([]);
  const [draggedDot, setDraggedDot] = useState(null);
  const svgRef = useRef(null);

  useEffect(() => {
    const margin = { top: 20, right: 20, bottom: 50, left: 50 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    const svg = d3
      .select(svgRef.current)
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const xScale = d3.scaleLinear().domain([0, 10]).range([0, width]);
    const yScale = d3.scaleLinear().domain([0, 10]).range([height, 0]);

    const xAxis = d3.axisBottom(xScale);
    svg.append("g").attr("transform", `translate(0, ${height})`).call(xAxis);

    const yAxis = d3.axisLeft(yScale);
    svg.append("g").call(yAxis);

    const drag = d3
      .drag()
      .on("start", handleDragStart)
      .on("drag", handleDrag)
      .on("end", handleDragEnd);

    function handleDragStart(event, d) {
      d3.select(this).raise().classed("active", true);
      setDraggedDot(d);
    }

    function handleDrag(event, d) {
      const [x, y] = d3.pointer(event);
      const newX = xScale.invert(x - margin.left);
      const newY = yScale.invert(y - margin.top);
      const updatedDot = { ...d, x: newX, y: newY };
      setDraggedDot(updatedDot);
      // setDots((prevDots) => prevDots.map((dot) => (dot.id === updatedDot.id ? updatedDot : dot)));
      d.x = newX;
      d.y = newY;
      d3.select(this).attr("cx", xScale(newX)).attr("cy", yScale(newY));
    }

    function handleDragEnd(event, d) {
      d3.select(this).classed("active", false);
      if (draggedDot) {
        setDots((prevDots) =>
          prevDots.map((dot) => (dot.id === draggedDot.id ? draggedDot : dot))
        );
        setDraggedDot(null);
      }
    }

    svg
      .selectAll("circle")
      .data(dots)
      .join("circle")
      .attr("cx", (d) => xScale(d.x))
      .attr("cy", (d) => yScale(d.y))
      .attr("r", 5)
      .attr("fill", "red")
      .attr("stroke", "black")
      .call(drag);
  }, [dots]);

  function handlePlotDoubleClick(event) {
    const svgContainer = d3.select(svgRef.current);
    const [x, y] = d3.pointer(event, svgContainer.node());

    const margin = { top: 20, right: 20, bottom: 50, left: 50 };
    const width = svgContainer.node().clientWidth - margin.left - margin.right;
    const height =
      svgContainer.node().clientHeight - margin.top - margin.bottom;

    const xScale = d3.scaleLinear().domain([0, width]).range([0, 10]);
    const yScale = d3.scaleLinear().domain([height, 0]).range([0, 10]);

    const scaledX = xScale(x - margin.left);
    const scaledY = yScale(y - margin.top);

    const newDot = { id: dots.length + 1, x: scaledX, y: scaledY };
    setDots((prevDots) => [...prevDots, newDot]);
  }

  const columns = [
    { field: "id", headerName: "ID", width: 70 },
    { field: "x", headerName: "X-Axis", width: 120 },
    { field: "y", headerName: "Y-Axis", width: 120 }
  ];

  return (
    <div>
      <svg
        ref={svgRef}
        id="plot"
        width={600}
        height={400}
        onDoubleClick={(e) => handlePlotDoubleClick(e)}
      />
      <div style={{ height: 400, width: "400px", padding: "20px 100px" }}>
        <DataGrid rows={dots} columns={columns} autoPageSize />
      </div>
    </div>
  );
};

export default PlotWithTable;
