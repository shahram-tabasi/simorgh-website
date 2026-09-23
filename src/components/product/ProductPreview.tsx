'use client';

import React from 'react';
import { PlayIcon } from 'lucide-react';

interface Props {
  name: string;
  caption: string;
  rows: {label: string;value: string;state?: 'ok' | 'warn' | 'alert';}[];
  video?: boolean;
}

const stateColor = {
  ok: 'text-cyan',
  warn: 'text-gold',
  alert: 'text-violet-soft'
} as const;

/** A synthetic product surface — a real interface sketch rather than a stock screenshot. */
export function ProductPreview({ name, caption, rows, video = false }: Props) {
  return (
    <figure className="border border-line bg-space-1">
      <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-blue" />
          <span className="font-mono text-[10px] tracking-label text-ink-faint">{name}</span>
        </div>
        {video ?
        <span className="inline-flex items-center gap-1.5 font-mono text-[9.5px] tracking-label text-cyan">
            <PlayIcon className="h-3 w-3" strokeWidth={1.8} aria-hidden="true" /> WALKTHROUGH
          </span> :

        <span className="font-mono text-[9.5px] tracking-label text-ink-faint">LIVE MODEL</span>
        }
      </div>

      <div className="relative">
        <div className="absolute inset-0 sim-grid-lines opacity-50" aria-hidden="true" />
        <table className="relative w-full border-collapse text-left">
          <tbody>
            {rows.map((row) =>
            <tr key={row.label} className="border-b border-line/70 last:border-b-0">
                <th scope="row" className="w-1/2 px-4 py-3.5 text-[12.5px] font-normal text-ink-faint">
                  {row.label}
                </th>
                <td className={`px-4 py-3.5 font-mono text-[12px] ${row.state ? stateColor[row.state] : 'text-ink'}`}>
                  {row.value}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <figcaption className="border-t border-line px-4 py-3 text-[12px] text-ink-faint">{caption}</figcaption>
    </figure>);

}