"use client";

import { CheckCircle, X, AlertCircle, Info } from "lucide-react";
import { useEffect, useState } from "react";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose: () => void;
}

export function Toast({ message, type = "success", duration = 3000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Mount animasyonu
    requestAnimationFrame(() => {
      setIsVisible(true);
    });

    // Otomatik kapanma
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose();
    }, 300); // Animasyon süresi
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case "info":
        return <Info className="h-5 w-5 text-blue-600" />;
      default:
        return <CheckCircle className="h-5 w-5 text-green-600" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case "success":
        return "bg-white border-green-200";
      case "error":
        return "bg-white border-red-200";
      case "info":
        return "bg-white border-blue-200";
      default:
        return "bg-white border-green-200";
    }
  };

  return (
    <div
      className={`fixed top-20 right-4 z-50 transition-all duration-300 ease-out ${
        isVisible && !isExiting
          ? "translate-x-0 opacity-100"
          : "translate-x-full opacity-0"
      }`}
      role="alert"
      aria-live="polite"
    >
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 shadow-lg ${getBackgroundColor()} min-w-[320px] max-w-md`}
      >
        <div className="flex-shrink-0">{getIcon()}</div>
        <p className="flex-1 text-sm font-medium text-gray-900">{message}</p>
        <button
          onClick={handleClose}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Bildirimi kapat"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

// Toast göstermek için yardımcı hook
export function useToast() {
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: ToastType }>>([]);

  const showToast = (message: string, type: ToastType = "success") => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const ToastContainer = () => (
    <>
      {toasts.map((toast, index) => (
        <div
          key={toast.id}
          style={{ top: `${5 + index * 5}rem` }}
          className="fixed right-4 z-50"
        >
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => removeToast(toast.id)}
          />
        </div>
      ))}
    </>
  );

  return { showToast, ToastContainer };
}
