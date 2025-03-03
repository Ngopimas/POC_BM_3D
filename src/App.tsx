import React, { DragEventHandler, useMemo, useState, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { tableFromJSON } from "apache-arrow";
import _ from "lodash";

import { Leva } from "leva";
import ColorLegend from "./components/ColorLegend";
import Loader from "./components/Loader";
import Scene from "./components/Scene";
import { MappingProvider } from "./context/MappingContext";
import { ParseResult } from "./types/ParseResult";
import {
  getDataFromArrow,
  getDataFromCSV,
  getFilesFromZIP,
} from "./utils/loaders";
import ErrorBoundary from "./components/ErrorBoundary";

function App() {
  const [dropTargetStyle, setDropTargetStyle] = useState(false);
  const [parsedData, setParsedData] = useState<ParseResult | null>(null);
  const [isLoading, setLoading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleParsedData = (data: { [key: string]: string }[]) => {
    const arrowTable = tableFromJSON(data);
    const fields = arrowTable.schema.fields.map((f) => f.name);
    setParsedData({
      data,
      meta: {
        arrow: arrowTable,
        fields,
      },
    });
  };

  const handleFile = async (file: File) => {
    setLoading(true);
    setParsedData(null);
    const fileType = file?.type;
    try {
      if (fileType === "text/csv" || file instanceof ArrayBuffer) {
        const data = await getDataFromCSV(file);
        handleFile(data);
      } else if (
        ["application/zip", "application/x-7z-compressed"].includes(fileType)
      ) {
        const data = await getFilesFromZIP(file);
        const csvKey = Object.keys(data).find((name) => name.endsWith(".csv"));
        if (!csvKey) {
          throw "No CSV file found in the ZIP.";
        }
        handleFile(data[csvKey]);
      } else if (file?.name?.endsWith(".arrow")) {
        const data = await getDataFromArrow(file);
        throw "The Arrow loader is still under development.";
        handleFile(data);
      } else if (_.isArray(file) && file.length) {
        handleParsedData(file);
      } else {
        console.log(file);
        throw "Can't load any data.";
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const changeHandler = async (event: React.BaseSyntheticEvent) => {
    if (event.target.value) {
      handleFile(event.target.files[0]);
    } else {
      // setParsedData(null);
    }
  };

  const handleClear = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    location.reload();
  };

  const addStyleToDropTarget: DragEventHandler = (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (!dropTargetStyle) setDropTargetStyle(true);
    return false;
  };

  const removeStyleFromDropTarget = (e?: any) => {
    setDropTargetStyle(false);
  };

  const handleDrop: DragEventHandler = (e) => {
    e.preventDefault();
    e.stopPropagation();
    removeStyleFromDropTarget();

    const files = (e.dataTransfer as DataTransfer).files;

    if (files.length > 1) {
      console.error("only 1 file can be handled.");
    } else if (files.length) {
      // process file being dropped
      handleFile(files[0]);
    } else {
      // process non-file (e.g. text or html) content being dropped
      // grab the plain text version of the data
      const plainText = (e.dataTransfer as DataTransfer)?.getData("text/plain");
      console.log(plainText);
    }

    // prevent drag event from bubbling further
    return false;
  };

  const dropTarget = useMemo(() => {
    if (dropTargetStyle) {
      return {
        opacity: "0.5",
        backgroundColor: "rgba(100, 100, 100, 0.5)",
      };
    }

    return {};
  }, [dropTargetStyle]);

  return (
    <ErrorBoundary>
      <MappingProvider>
        <div
          style={{ height: "100vh", ...dropTarget }}
          onDragEnter={addStyleToDropTarget}
          onDragOver={addStyleToDropTarget}
          onDrop={handleDrop}
          onDragLeave={removeStyleFromDropTarget}
        >
          <div className="top-panel">
            <label htmlFor="bm-file">Choose a Block Model file:</label>
            <input
              ref={fileInputRef}
              type="file"
              name="bm-file"
              accept="text/csv, application/zip"
              onChange={changeHandler}
            />
            <button onClick={handleClear}>Clear</button>
            {parsedData?.meta?.arrow && (
              <ColorLegend arrow={parsedData.meta.arrow} />
            )}
          </div>
          <Leva hideCopyButton />
          <Canvas onCreated={(state) => (state.gl.localClippingEnabled = true)}>
            <Scene parsedData={parsedData} />
          </Canvas>
          <Loader isLoading={isLoading} />
        </div>
      </MappingProvider>
    </ErrorBoundary>
  );
}

export default App;
