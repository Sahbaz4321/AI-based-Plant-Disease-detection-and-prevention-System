import React, { createContext, useContext, useState, useEffect } from "react";

const ScanContext = createContext();

export function useScan() {
  return useContext(ScanContext);
}

export function ScanProvider({ children }) {
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [results, setResults] = useState([]);
  
  // Cleanup object URLs when provider unmounts or previews change entirely
  useEffect(() => {
    return () => {
      previews.forEach(p => URL.revokeObjectURL(p));
    };
  }, [previews]);

  const clearScanData = () => {
    previews.forEach(p => URL.revokeObjectURL(p));
    setPreviews([]);
    setFiles([]);
    setResults([]);
  };

  const value = {
    files,
    setFiles,
    previews,
    setPreviews,
    results,
    setResults,
    clearScanData
  };

  return <ScanContext.Provider value={value}>{children}</ScanContext.Provider>;
}
