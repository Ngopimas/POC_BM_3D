import chroma from "chroma-js";
import _ from "lodash";
import { getMinMaxFromArrow } from "~/utils/arrow";
import { ArrowTable } from "~/types/ArrowTable";
import { useMappingContext } from "~/context/MappingContext";

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
 * A component that displays a color gradient legend with evenly spaced markers
 * for the selected property in the data.
 * @param {ColorLegendProps} props - The component props
 * @param {ArrowTable} props.arrow - The Arrow table containing the data
 * @returns {React.ReactElement|null} The color legend component or null if no property is selected
 */
const ColorLegend: React.FC<ColorLegendProps> = ({ arrow }) => {
  const { selectedProperty, colorScale } = useMappingContext();

  if (!selectedProperty || !colorScale) return null;

  const { min, max, range } = getMinMaxFromArrow(arrow, selectedProperty);

  if (_.isNil(min) || _.isNil(max)) return null;

  const gradientStops = chroma
    .scale(colorScale)
    .mode("lrgb")
    .colors(5)
    .map((color, index) => {
      const percentage = (index / 4) * 100;
      return `${color} ${percentage}%`;
    })
    .join(", ");

  return (
    <div
      id="color-legend"
      style={{
        background: "white",
        padding: "10px",
        borderRadius: "6px",
        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
        userSelect: "none",
        touchAction: "none",
      }}
    >
      <div style={{ marginBottom: "5px", fontWeight: "bold" }}>
        {selectedProperty}
      </div>
      <div
        style={{
          height: "20px",
          background: `linear-gradient(to right, ${gradientStops})`,
          borderRadius: "2px",
          marginBottom: "5px",
        }}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "10px",
        }}
      >
        <span>{min.toFixed(2)}</span>
        <span>{getStep(range, 0.25)}</span>
        <span>{getStep(range, 0.5)}</span>
        <span>{getStep(range, 0.75)}</span>
        <span>{max.toFixed(2)}</span>
      </div>
    </div>
  );
};

export default ColorLegend;
