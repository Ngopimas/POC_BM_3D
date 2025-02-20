import chroma from "chroma-js";
import _ from "lodash";
import { ColorsScales } from "~/interfaces/ColorsScales";
import { getMinMaxFromArrow } from "~/utils/arrow";
import { ArrowTable } from "~/interfaces/ArrowTable";
import { useMappingContext } from "~/context/MappingContext";

interface ColorLegendProps {
  arrow: ArrowTable;
}

const ColorLegend: React.FC<ColorLegendProps> = ({ arrow }) => {
  const { selectedProperty, colorScale } = useMappingContext();

  if (!selectedProperty || !colorScale) return null;

  const { min, max } = getMinMaxFromArrow(arrow, selectedProperty);
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
        borderRadius: "4px",
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
          fontSize: "12px",
        }}
      >
        <span>{min.toFixed(2)}</span>
        <span>{max.toFixed(2)}</span>
      </div>
    </div>
  );
};

export default ColorLegend;
