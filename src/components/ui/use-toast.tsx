import * as React from "react";

type ToastType = {
  title?: string;
  description?: string;
};

type ToastContextType = {
  toast: (options: ToastType) => void;
};

const ToastContext = React.createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastType[]>([]);

  function toast(options: ToastType) {
    setToasts((prev) => [...prev, options]);

    // Auto-remove after 3 sec
    setTimeout(() => {
      setToasts((prev) => prev.slice(1));
    }, 3000);
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {toasts.map((t, i) => (
        <div
          key={i}
          className="fixed bottom-5 right-5 bg-gray-900 text-white px-4 py-3 rounded-xl shadow-lg mb-2"
        >
          <p className="font-bold">{t.title}</p>
          {t.description && (
            <p className="text-sm text-gray-300">{t.description}</p>
          )}
        </div>
      ))}
    </ToastContext.Provider>
  );
}

// Hook to access toast()
export function useToast() {
  const ctx = React.useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

// ✔️ EXPORT THE REAL EXPECTED FUNCTION
export const toast = (options: ToastType) => {
  console.warn("toast() used outside provider; wrap your app in <ToastProvider>");
};
