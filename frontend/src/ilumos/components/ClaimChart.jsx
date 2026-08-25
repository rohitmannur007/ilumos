import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useStore, deriveMetrics } from '../store';
import { StatusChip, EvidenceChip, SectionLabel } from './bits';

const Readiness = () => {
  const { state, api } = useStore();
  const m = deriveMetrics(state);
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4" data-testid="readiness-panel">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <SectionLabel>Review Readiness</SectionLabel>
        <span className="text-xs font-semibold text-ink" data-testid="readiness-count">{m.ready}/{m.total} elements ready</span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded bg-slate-100">
        <div
          className="h-full rounded bg-ok-text transition-all duration-500"
          style={{ width: `${(m.ready / m.total) * 100}%` }}
          role="progressbar"
          aria-valuenow={m.ready}
          aria-valuemax={m.total}
          data-testid="readiness-progress"
        />
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-md bg-slate-50 px-2 py-1.5">
          <div className="text-sm font-semibold text-ink" data-testid="open-dependencies-count">{m.openDependencies}</div>
          <div className="text-[10px] text-steel">Open dependencies</div>
        </div>
        <div className="rounded-md bg-slate-50 px-2 py-1.5">
          <div className="text-sm font-semibold text-ink" data-testid="evidence-gaps-count">{m.evidenceGaps}</div>
          <div className="text-[10px] text-steel">Evidence gaps</div>
        </div>
        <div className="rounded-md bg-slate-50 px-2 py-1.5">
          <div className="text-sm font-semibold text-ink" data-testid="unsupported-count">{m.unsupported}</div>
          <div className="text-[10px] text-steel">Unsupported AI assertions</div>
        </div>
      </div>
      <button
        data-testid="next-action-btn"
        onClick={api.runNextAction}
        className="mt-3 flex w-full items-center justify-between rounded-md border border-brand/30 bg-brand-soft px-3 py-2 text-left text-xs font-medium text-brand-dark hover:bg-brand/15 transition-colors"
      >
        <span>Next recommended action · <span className="font-semibold">{m.nextAction.label}</span></span>
        <ArrowRight size={13} />
      </button>
    </div>
  );
};

export default function ClaimChart() {
  const { state, api } = useStore();
  const openSource = (id) => api.openModal({ type: 'source', evidenceId: id });
  return (
    <section className="min-w-0 space-y-4" data-testid="claim-chart-section">
      <Readiness />
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-ink">Claim Chart · {state.caseInfo.patent} vs {state.caseInfo.accusedProduct}</h2>
          <p className="mt-0.5 text-[11px] text-steel">Element-level mapping with evidence-backed AI reasoning. Select a row to investigate.</p>
        </div>
        <div className="overflow-x-auto ilumos-scroll">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-[10px] font-semibold uppercase tracking-[0.08em] text-steel">
                <th className="px-4 py-2.5 w-[30%]">Claim Element</th>
                <th className="px-3 py-2.5 w-[20%]">Mapped Product Feature</th>
                <th className="px-3 py-2.5 w-[32%]">AI Reasoning / Evidence</th>
                <th className="px-4 py-2.5 w-[18%]">Status</th>
              </tr>
            </thead>
            <tbody>
              {state.elements.map((el, i) => (
                <motion.tr
                  key={el.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.04 + i * 0.035, duration: 0.35, ease: 'easeOut' }}
                  data-testid={`chart-row-${el.id}`}
                  tabIndex={0}
                  onClick={() => api.selectElement(el.id)}
                  onKeyDown={(e) => { if (e.key === 'Enter') api.selectElement(el.id); }}
                  className={`cursor-pointer border-b border-slate-100 align-top transition-colors ${
                    state.selectedElement === el.id ? 'bg-navy-50/70' : 'hover:bg-slate-50'
                  }`}
                >
                  <td className="px-4 py-3">
                    <div className="text-xs font-semibold text-ink">Element {el.num} · {el.name}</div>
                    <p className="mt-1 text-[11px] leading-relaxed text-steel">{el.claim}</p>
                  </td>
                  <td className="px-3 py-3 text-xs text-ink">{el.mapping}</td>
                  <td className="px-3 py-3">
                    <p className="text-[11px] leading-relaxed text-ink">{el.reasoning}</p>
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {el.evidenceIds.length
                        ? el.evidenceIds.map((id) => <EvidenceChip key={id} id={id} onOpen={openSource} />)
                        : <span className="text-[10px] font-medium text-warn-text">No source linked</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusChip status={el.status} reasonTag={el.reasonTag} testid={`status-chip-${el.id}`} />
                    {el.impactedBy && (
                      <button
                        data-testid={`impacted-indicator-${el.id}`}
                        onClick={(e) => { e.stopPropagation(); api.openModal({ type: 'why', elementId: el.id }); }}
                        className="mt-1.5 block rounded border border-warn-border bg-warn-bg px-1.5 py-0.5 text-[10px] font-medium text-warn-text hover:bg-warn-border/40 transition-colors"
                      >
                        Impacted by E{state.elements.find((x) => x.id === el.impactedBy.from)?.num} · Why?
                      </button>
                    )}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
