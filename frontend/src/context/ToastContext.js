import React, { createContext, useContext, useState, useCallback } from "react";
import Toast from "../components/Toast";

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = "info") => {
    setToast({ message, type });
  }, []);

  const hideToast = useCallback(() => setToast(null), []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div
          className="position-fixed bottom-0 end-0 p-3 d-flex flex-column gap-2"
          style={{ zIndex: 9999 }}
        >
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={hideToast}
          />
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
