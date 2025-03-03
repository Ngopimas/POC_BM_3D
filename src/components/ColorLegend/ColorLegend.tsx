import chroma from "chroma-js";
import _ from "lodash";
import { getMinMaxFromArrow } from "~/utils/arrow";
import { ArrowTable } from "~/types/ArrowTable";
import { useMappingContext } from "~/context/MappingContext";
import { useState } from "react";

interface ColorLegendProps {
  arrow: ArrowTable;
}

/**
 * Calculates a step value based on a range and multiplier
 * @param {number|null} range - The total range of values
 * @param {number} n - The multiplier to calculate the step (between 0 and 1)
 * @returns {string|undefined} The calculated step value formatted to 2 decimal places or undefined if range is null
 */
const getStep = (range: number | null, n: number) => {
  if (!range) {
    return;
  }
  const step = range * n;
  return step.toFixed(2);
};

/**
 * Format a number with appropriate units and precision
 * @param {number} value - The value to format
 * @returns {string} The formatted value
 */
const formatValue = (value: number): string => {
  // For very small values
  if (Math.abs(value) < 0.01 && value !== 0) {
    return value.toExponential(2);
  }

  // For values between 0.01 and 1000
  if (Math.abs(value) < 1000) {
    return value.toFixed(2);
  }

  // For large values, use K, M, G suffixes
  const units = ["", "K", "M", "G", "T"];
  const order = Math.floor(Math.log10(Math.abs(value)) / 3);
  const unitValue = value / Math.pow(1000, order);
  return `${unitValue.toFixed(2)}${units[order]}`;
};

/**
 * A component that displays a color gradient legend with evenly spaced markers
 * for the selected property in the data.
 * @param {ColorLegendProps} props - The component props
 * @param {ArrowTable} props.arrow - The Arrow table containing the data
 * @returns {React.ReactElement|null} The color legend component or null if no property is selected
 */
const ColorLegend: React.FC<ColorLegendProps> = ({ arrow }) => {
  const { selectedProperty, colorScale } = useMappingContext();
  const [expanded, setExpanded] = useState(false);

  if (!selectedProperty || !colorScale) return null;

  const stats = getMinMaxFromArrow(arrow, selectedProperty);
  const { min, max, range, count, sum, mean, median, stdDev } = stats;

  if (_.isNil(min) || _.isNil(max)) return null;

  const gradientStops = chroma
    .scale(colorScale)
    .mode("lrgb")
    .colors(10)
    .map((color, index) => {
      const percentage = (index / 9) * 100;
      return `${color} ${percentage}%`;
    })
    .join(", ");

  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  // Calculate step values safely
  const step25 = range !== null ? min + range * 0.25 : min;
  const step50 = range !== null ? min + range * 0.5 : min;
  const step75 = range !== null ? min + range * 0.75 : min;

  return (
    <div
      id="color-legend"
      style={{
        background: "white",
        padding: "12px",
        borderRadius: "8px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
        userSelect: "none",
        touchAction: "none",
        maxWidth: "300px",
        transition: "all 0.3s ease",
      }}
    >
      <div
        style={{
          cursor: "pointer",
        }}
        onClick={toggleExpanded}
        title="Click to toggle stats"
      >
        <div
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <div style={{ fontSize: "12px" }}>{expanded ? "▼" : "▶"}</div>
          <div style={{ fontWeight: "bold", fontSize: "14px" }}>
            {selectedProperty}
          </div>
        </div>

        <div
          style={{
            height: "24px",
            background: `linear-gradient(to right, ${gradientStops})`,
            borderRadius: "4px",
            marginBottom: "8px",
          }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "12px",
            marginBottom: expanded ? "12px" : "0",
          }}
        >
          <span>{formatValue(min)}</span>
          <span>{formatValue(step25)}</span>
          <span>{formatValue(step50)}</span>
          <span>{formatValue(step75)}</span>
          <span>{formatValue(max)}</span>
        </div>
      </div>

      {expanded && (
        <div
          style={{
            fontSize: "12px",
            marginTop: "12px",
            borderTop: "1px solid #eee",
            paddingTop: "8px",
          }}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <tbody>
              <tr>
                <td style={{ padding: "4px 0", fontWeight: "bold" }}>Count:</td>
                <td style={{ padding: "4px 0", textAlign: "right" }}>
                  {count?.toLocaleString()}
                </td>
              </tr>
              <tr>
                <td style={{ padding: "4px 0", fontWeight: "bold" }}>Min:</td>
                <td style={{ padding: "4px 0", textAlign: "right" }}>
                  {formatValue(min)}
                </td>
              </tr>
              <tr>
                <td style={{ padding: "4px 0", fontWeight: "bold" }}>Max:</td>
                <td style={{ padding: "4px 0", textAlign: "right" }}>
                  {formatValue(max)}
                </td>
              </tr>
              <tr>
                <td style={{ padding: "4px 0", fontWeight: "bold" }}>Range:</td>
                <td style={{ padding: "4px 0", textAlign: "right" }}>
                  {range !== null ? formatValue(range) : "N/A"}
                </td>
              </tr>
              <tr>
                <td style={{ padding: "4px 0", fontWeight: "bold" }}>Mean:</td>
                <td style={{ padding: "4px 0", textAlign: "right" }}>
                  {formatValue(mean || 0)}
                </td>
              </tr>
              <tr>
                <td style={{ padding: "4px 0", fontWeight: "bold" }}>
                  Median:
                </td>
                <td style={{ padding: "4px 0", textAlign: "right" }}>
                  {formatValue(median || 0)}
                </td>
              </tr>
              <tr>
                <td style={{ padding: "4px 0", fontWeight: "bold" }}>
                  Std Dev:
                </td>
                <td style={{ padding: "4px 0", textAlign: "right" }}>
                  {formatValue(stdDev || 0)}
                </td>
              </tr>
              <tr>
                <td style={{ padding: "4px 0", fontWeight: "bold" }}>Sum:</td>
                <td style={{ padding: "4px 0", textAlign: "right" }}>
                  {formatValue(sum || 0)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ColorLegend;
