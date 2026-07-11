"use client";

interface FormErrorProps {
  error?: string;
  className?: string;
}

export function FormError({ error, className }: FormErrorProps) {
  if (!error) return null;
  return (
    <div
      role="alert"
      className={`text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3.5 py-2.5 ${className ?? ""}`}
    >
      {error}
    </div>
  );
}
