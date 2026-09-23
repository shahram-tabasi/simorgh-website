'use client';

import React from 'react';

const inputCls =
'h-11 w-full border border-line bg-space-0 px-3.5 text-[14px] text-ink outline-none transition-colors duration-150 ease-sim placeholder:text-ink-faint/70 focus:border-cyan/60';

interface BaseProps {
  label: string;
  name: string;
  required?: boolean;
  error?: string;
  className?: string;
}

export function TextField({
  label,
  name,
  required,
  error,
  type = 'text',
  value,
  onChange,
  placeholder,
  className = ''





}: BaseProps & {type?: string;value: string;onChange: (v: string) => void;placeholder?: string;}) {
  return (
    <div className={className}>
      <label htmlFor={name} className="mb-2 block font-mono text-[10px] tracking-label text-ink-faint">
        {label.toUpperCase()}
        {required && <span className="ml-1 text-cyan">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${name}-error` : undefined}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputCls} ${error ? 'border-gold/70' : ''}`} />
      
      {error &&
      <p id={`${name}-error`} className="mt-1.5 text-[11.5px] text-gold">
          {error}
        </p>
      }
    </div>);

}

export function SelectField({
  label,
  name,
  required,
  error,
  value,
  onChange,
  options,
  className = ''




}: BaseProps & {value: string;onChange: (v: string) => void;options: string[];}) {
  return (
    <div className={className}>
      <label htmlFor={name} className="mb-2 block font-mono text-[10px] tracking-label text-ink-faint">
        {label.toUpperCase()}
        {required && <span className="ml-1 text-cyan">*</span>}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        aria-invalid={Boolean(error)}
        onChange={(e) => onChange(e.target.value)}
        className={`${inputCls} ${error ? 'border-gold/70' : ''}`}>
        
        <option value="">Select…</option>
        {options.map((o) =>
        <option key={o} value={o}>
            {o}
          </option>
        )}
      </select>
      {error && <p className="mt-1.5 text-[11.5px] text-gold">{error}</p>}
    </div>);

}

export function TextArea({
  label,
  name,
  required,
  error,
  value,
  onChange,
  rows = 5,
  className = ''




}: BaseProps & {value: string;onChange: (v: string) => void;rows?: number;}) {
  return (
    <div className={className}>
      <label htmlFor={name} className="mb-2 block font-mono text-[10px] tracking-label text-ink-faint">
        {label.toUpperCase()}
        {required && <span className="ml-1 text-cyan">*</span>}
      </label>
      <textarea
        id={name}
        name={name}
        rows={rows}
        value={value}
        aria-invalid={Boolean(error)}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full border border-line bg-space-0 px-3.5 py-3 text-[14px] leading-relaxed text-ink outline-none transition-colors duration-150 ease-sim placeholder:text-ink-faint/70 focus:border-cyan/60 ${
        error ? 'border-gold/70' : ''}`
        } />
      
      {error && <p className="mt-1.5 text-[11.5px] text-gold">{error}</p>}
    </div>);

}