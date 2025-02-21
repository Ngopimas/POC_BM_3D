import React, { createContext, useContext, useState } from "react";
import { ColorsScales } from "~/types/ColorsScales";

interface MappingContextType {
  selectedProperty: string;
  colorScale: ColorsScales;
  setSelectedProperty: (property: string) => void;
  setColorScale: (scale: ColorsScales) => void;
}

const MappingContext = createContext<MappingContextType | undefined>(undefined);

export const MappingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [selectedProperty, setSelectedProperty] = useState<string>("");
  const [colorScale, setColorScale] = useState<ColorsScales>("Viridis");

  return (
    <MappingContext.Provider
      value={{
        selectedProperty,
        colorScale,
        setSelectedProperty,
        setColorScale,
      }}
    >
      {children}
    </MappingContext.Provider>
  );
};

export const useMappingContext = () => {
  const context = useContext(MappingContext);
  if (context === undefined) {
    throw new Error("useMappingContext must be used within a MappingProvider");
  }
  return context;
};
