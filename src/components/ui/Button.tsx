'use client';

import React from 'react';
import Link from 'next/link';

type Variant = 'primary' | 'outline' | 'ghost';

const base =
'inline-flex items-center justify-center gap-2 rounded-sm font-medium tracking-tight transition-[background-color,border-color,color,transform] duration-200 ease-sim focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan focus-visible:ring-offset-2 focus-visible:ring-offset-space-0 whitespace-nowrap';

const sizes = {
  md: 'h-11 px-5 text-sm',
  lg: 'h-12 px-7 text-[15px]',
  sm: 'h-9 px-4 text-[13px]'
};

const variants: Record<Variant, string> = {
  primary: 'bg-blue text-white hover:bg-blue-soft active:translate-y-px',
  outline: 'border border-line text-ink hover:border-cyan/60 hover:text-cyan-soft active:translate-y-px',
  ghost: 'text-ink-muted hover:text-ink'
};

interface Props {
  to?: string;
  href?: string;
  children: React.ReactNode;
  variant?: Variant;
  size?: keyof typeof sizes;
  className?: string;
  type?: 'button' | 'submit';
  onClick?: () => void;
  disabled?: boolean;
}

export function Button({
  to,
  href,
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  onClick,
  disabled
}: Props) {
  const cls = `${base} ${sizes[size]} ${variants[variant]} ${className}`;
  if (to) {
    return (
      <Link href={to} className={cls} onClick={onClick}>
        {children}
      </Link>);

  }
  if (href) {
    return (
      <a href={href} className={cls}>
        {children}
      </a>);

  }
  return (
    <button type={type} className={`${cls} disabled:cursor-wait disabled:opacity-60`} onClick={onClick} disabled={disabled}>
      {children}
    </button>);

}