import React from 'react';
import { Scale, Info, Download, ClipboardList, ArrowLeft } from 'lucide-react';
import { useStore } from '../store';

export default function Header({ mode }) {
  const { state, api } = useStore();
  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white" data-testid="app-header">
      <div className="mx-auto flex max-w-[1700px] flex-wrap items-center gap-x-4 gap-y-1 px-4 py-2.5">
        <button
          data-testid="case-setup-back-btn"
          onClick={api.goToSetup}
          title="Return to Case Setup (Esc)"
          className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium text-steel hover:bg-slate-100 hover:text-ink transition-colors"
          aria-label="Return to Case Setup"
        >
          <ArrowLeft size={13} /> Case Setup
        </button>
        <div className="h-6 w-px bg-slate-200" aria-hidden="true" />
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-navy-900 text-white" aria-hidden="true">
            <Scale size={16} strokeWidth={2} />
          </span>
          <div className="leading-tight">
            <div className="text-sm font-semibold text-ink">iLumos</div>
            <div className="text-[10px] uppercase tracking-[0.12em] text-steel">Claim Review Intelligence</div>
          </div>
        </div>
        <div className="hidden md:block h-6 w-px bg-slate-200" aria-hidden="true" />
        <div className="hidden md:block leading-tight">
          <div className="text-xs font-medium text-ink" data-testid="header-case-title">{state.caseInfo.title}</div>
          <div className="text-[11px] text-steel">Analyst · {state.caseInfo.analyst}</div>
        </div>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <div className="flex rounded-md border border-slate-300 p-0.5" role="group" aria-label="View mode">
            <button
              data-testid="analyst-view-btn"
              aria-pressed={mode === 'analyst'}
              onClick={() => api.set({ screen: 'workspace' })}
              className={`rounded px-3 py-1.5 text-xs font-medium transition-colors ${mode === 'analyst' ? 'bg-navy-900 text-white' : 'text-steel hover:bg-slate-100'}`}
            >
              Analyst
            </button>
            <button
              data-testid="supervisor-view-btn"
              aria-pressed={mode === 'supervisor'}
              onClick={() => api.set({ screen: 'supervisor' })}
              className={`rounded px-3 py-1.5 text-xs font-medium transition-colors ${mode === 'supervisor' ? 'bg-navy-900 text-white' : 'text-steel hover:bg-slate-100'}`}
            >
              Supervisor View
            </button>
          </div>
          <button
            data-testid="run-chart-review-btn"
            onClick={() => api.set({ reviewOpen: true })}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-ink hover:bg-slate-50 transition-colors"
          >
            <ClipboardList size={14} /> Run Chart Review
          </button>
          <button
            data-testid="export-btn"
            onClick={() => api.openModal({ type: 'export' })}
            className="inline-flex items-center gap-1.5 rounded-md bg-navy-900 px-3 py-2 text-xs font-medium text-white hover:bg-navy-800 transition-colors"
          >
            <Download size={14} /> Export
          </button>
          <button
            data-testid="about-btn"
            onClick={() => api.openModal({ type: 'about' })}
            aria-label="About iLumos"
            className="rounded-md p-2 text-steel hover:bg-slate-100 transition-colors"
          >
            <Info size={16} />
          </button>
        </div>
      </div>
    </header>
  );
}
