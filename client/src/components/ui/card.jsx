import React from 'react';

export function Card({ className = '', children }) {
  return (
    <section className={`rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 ${className}`}>
      {children}
    </section>
  );
}

export function CardHeader({ className = '', children }) {
  return <div className={`flex flex-col gap-1.5 p-5 ${className}`}>{children}</div>;
}

export function CardTitle({ className = '', children }) {
  return <h2 className={`text-sm font-semibold tracking-tight text-slate-900 dark:text-white ${className}`}>{children}</h2>;
}

export function CardDescription({ className = '', children }) {
  return <p className={`text-xs text-slate-500 dark:text-slate-400 ${className}`}>{children}</p>;
}

export function CardContent({ className = '', children }) {
  return <div className={`p-5 pt-0 ${className}`}>{children}</div>;
}
