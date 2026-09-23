'use client';

import React, { useState } from 'react';

type Stage = 'New' | 'Contacted' | 'Qualified' | 'Demo Scheduled' | 'Completed' | 'Closed';

const stages: Stage[] = ['New', 'Contacted', 'Qualified', 'Demo Scheduled', 'Completed', 'Closed'];

interface Request {
  id: string;
  name: string;
  company: string;
  country: string;
  product: string;
  industry: string;
  received: string;
  stage: Stage;
}

const seed: Request[] = [
{ id: 'DR-2041', name: 'Elif Demir', company: 'Anadolu Enerji', country: 'Turkey', product: 'SIMORGH GRID', industry: 'Electricity & Energy', received: '2026-09-20', stage: 'New' },
{ id: 'DR-2040', name: 'Lukas Braun', company: 'Rheinwerk Schaltanlagen', country: 'Germany', product: 'SIMORGH DESIGN SUITE', industry: 'Switchgear', received: '2026-09-19', stage: 'Contacted' },
{ id: 'DR-2039', name: 'Fatima Al-Nuaimi', company: 'Gulf Infrastructure Authority', country: 'UAE', product: 'SIMORGH DIGITAL TWIN', industry: 'Smart Cities', received: '2026-09-18', stage: 'Qualified' },
{ id: 'DR-2038', name: 'Reza Hosseini', company: 'Pars Switch', country: 'Iran', product: 'SIMORGH DRAW', industry: 'Switchgear', received: '2026-09-17', stage: 'Demo Scheduled' },
{ id: 'DR-2037', name: 'Marta Ruiz', company: 'Iberia Minerales', country: 'Spain', product: 'SIMORGH KARA', industry: 'Mining', received: '2026-09-15', stage: 'Completed' },
{ id: 'DR-2036', name: 'Chen Wei', company: 'Hanzhou Grid Services', country: 'China', product: 'SIMORGH GRID', industry: 'Utilities', received: '2026-09-12', stage: 'Closed' }];


const stageTone: Record<Stage, string> = {
  New: 'text-cyan border-cyan/50',
  Contacted: 'text-blue-soft border-blue/50',
  Qualified: 'text-violet-soft border-violet/50',
  'Demo Scheduled': 'text-gold border-gold/50',
  Completed: 'text-ink border-line',
  Closed: 'text-ink-faint border-line'
};

export function DemoRequests() {
  const [rows, setRows] = useState(seed);
  const [filter, setFilter] = useState<Stage | 'All'>('All');

  const visible = filter === 'All' ? rows : rows.filter((r) => r.stage === filter);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">Demo Requests</h1>
        <p className="mt-2 text-[13.5px] text-ink-faint">Sales workflow · {rows.length} open records</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {(['All', ...stages] as const).map((s) =>
        <button
          key={s}
          onClick={() => setFilter(s as Stage | 'All')}
          aria-pressed={filter === s}
          className={`border px-3 py-1.5 font-mono text-[10px] tracking-label transition-colors duration-150 ease-sim ${
          filter === s ? 'border-cyan/60 text-cyan' : 'border-line text-ink-faint hover:text-ink-muted'}`
          }>
          
            {s.toUpperCase()}
            <span className="ml-2 text-ink-faint">
              {s === 'All' ? rows.length : rows.filter((r) => r.stage === s).length}
            </span>
          </button>
        )}
      </div>

      <div className="overflow-x-auto border border-line">
        <table className="w-full min-w-[900px] border-collapse text-left">
          <thead>
            <tr className="bg-space-2">
              {['ID', 'Contact', 'Company', 'Country', 'Product', 'Received', 'Stage'].map((h) =>
              <th key={h} className="px-5 py-3 font-mono text-[10px] tracking-label text-ink-faint">
                  {h.toUpperCase()}
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {visible.map((r) =>
            <tr key={r.id} className="border-t border-line bg-space-1">
                <td className="px-5 py-3.5 font-mono text-[11px] text-cyan">{r.id}</td>
                <td className="px-5 py-3.5 text-[13.5px] text-ink">{r.name}</td>
                <td className="px-5 py-3.5 text-[13px] text-ink-muted">{r.company}</td>
                <td className="px-5 py-3.5 text-[13px] text-ink-muted">{r.country}</td>
                <td className="px-5 py-3.5 font-mono text-[11px] text-ink-muted">{r.product}</td>
                <td className="px-5 py-3.5 font-mono text-[11px] text-ink-faint">{r.received}</td>
                <td className="px-5 py-3.5">
                  <select
                  value={r.stage}
                  aria-label={`Stage for ${r.id}`}
                  onChange={(e) =>
                  setRows((prev) => prev.map((x) => x.id === r.id ? { ...x, stage: e.target.value as Stage } : x))
                  }
                  className={`border bg-space-0 px-2 py-1.5 font-mono text-[10.5px] outline-none ${stageTone[r.stage]}`}>
                  
                    {stages.map((s) =>
                  <option key={s} value={s} className="text-ink">
                        {s}
                      </option>
                  )}
                  </select>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>);

}