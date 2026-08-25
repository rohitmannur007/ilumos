import React from 'react';
import { Building2, FileText, FileSpreadsheet, CheckCircle2, Loader2 } from 'lucide-react';
import { useStore } from '../store';
import { SectionLabel } from './bits';

const STATUS_DOT = {
  ready: 'bg-ok-text',
  needs_review: 'bg-warn-text',
  review: 'bg-navy-700',
};

export default function LeftPanel() {
  const { state, api } = useStore();
  const docs = state.files.supporting;
  return (
    <aside className="space-y-4" data-testid="left-panel">
      <section className="rounded-lg border border-slate-200 bg-white p-4">
        <SectionLabel>Case</SectionLabel>
        <h2 className="mt-2 flex items-center gap-2 text-sm font-semibold text-ink">
          <Building2 size={14} className="text-navy-700" /> {state.caseInfo.title}
        </h2>
        <dl className="mt-3 space-y-1.5 text-xs">
          <div className="flex justify-between"><dt className="text-steel">Patent</dt><dd className="font-medium text-ink">{state.caseInfo.patent}</dd></div>
          <div className="flex justify-between"><dt className="text-steel">Accused product</dt><dd className="font-medium text-ink">{state.caseInfo.accusedProduct}</dd></div>
          <div className="flex justify-between"><dt className="text-steel">Analyst</dt><dd className="font-medium text-ink">{state.caseInfo.analyst}</dd></div>
          <div className="flex justify-between"><dt className="text-steel">Supervisor</dt><dd className="font-medium text-ink">{state.caseInfo.supervisor}</dd></div>
        </dl>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4" data-testid="documents-panel">
        <SectionLabel>Documents</SectionLabel>
        <ul className="mt-2 space-y-2">
          {state.files.claimChart && (
            <li className="flex items-center gap-2 text-xs text-ink">
              <FileSpreadsheet size={13} className="shrink-0 text-navy-700" />
              <span className="truncate">{state.files.claimChart.name}</span>
              <span className="ml-auto text-[10px] text-slate-400">Claim chart</span>
            </li>
          )}
          {docs.map((d) => (
            <li key={d.id} className="flex items-center gap-2 text-xs text-ink">
              <FileText size={13} className="shrink-0 text-navy-700" />
              <span className="truncate">{d.name}</span>
              {d.status === 'ready' ? (
                <CheckCircle2 size={12} className="ml-auto shrink-0 text-ok-text" aria-label="Indexed" />
              ) : (
                <Loader2 size={12} className="ml-auto shrink-0 animate-spin text-steel" aria-label="Indexing" />
              )}
            </li>
          ))}
          {docs.length === 0 && !state.files.claimChart && <li className="text-xs text-slate-400">No documents loaded.</li>}
        </ul>
        <p className="mt-3 text-[10px] leading-relaxed text-slate-400">Indexed sources are searchable from element investigation. Fictional demo content.</p>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4" data-testid="element-list">
        <SectionLabel>Claim elements · 10</SectionLabel>
        <ul className="mt-2 space-y-0.5">
          {state.elements.map((el) => (
            <li key={el.id}>
              <button
                data-testid={`element-list-item-${el.id}`}
                onClick={() => api.selectElement(el.id)}
                aria-current={state.selectedElement === el.id}
                className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors ${
                  state.selectedElement === el.id ? 'bg-navy-50 text-navy-900 font-medium' : 'text-ink hover:bg-slate-50'
                }`}
              >
                <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${STATUS_DOT[el.status]}`} aria-hidden="true" />
                <span className="w-6 shrink-0 text-[10px] font-semibold text-slate-400">E{el.num}</span>
                <span className="truncate">{el.name}</span>
                {el.impactedBy && <span className="ml-auto rounded bg-warn-bg px-1 text-[9px] font-semibold text-warn-text">E{state.elements.find((x) => x.id === el.impactedBy.from)?.num}</span>}
              </button>
            </li>
          ))}
        </ul>
      </section>
    </aside>
  );
}
