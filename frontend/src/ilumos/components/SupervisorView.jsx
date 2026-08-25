import React, { useState } from 'react';
import { Eye, History } from 'lucide-react';
import { useStore, deriveMetrics } from '../store';
import Header from './Header';
import { Btn, SectionLabel } from './bits';
import { ActivityIcon, fmtTime } from './ReplayModal';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'ai', label: 'AI' },
  { id: 'analyst', label: 'Analyst' },
  { id: 'review', label: 'Review' },
];

const matchFilter = (d, f) => {
  if (f === 'all') return true;
  if (f === 'ai') return d.actor === 'ai';
  if (f === 'analyst') return d.actor === 'analyst';
  return ['impact_detected', 'review', 'review_resolution', 'ai_refusal'].includes(d.type);
};

const decisionScore = (d) =>
  (d.affectedElements?.length || 0) * 2 + (d.dependencySnapshot?.length || 0) + (d.evidenceAdded?.length || 0);

export default function SupervisorView() {
  const { state, api } = useStore();
  const [filter, setFilter] = useState('all');
  const m = deriveMetrics(state);
  const highImpact = state.decisions
    .filter((d) => d.type === 'reasoning_change' && d.status === 'accepted' && (d.affectedElements || []).length > 0)
    .sort((a, b) => decisionScore(b) - decisionScore(a));
  const activity = state.decisions.slice().reverse().filter((d) => matchFilter(d, filter));

  return (
    <div className="min-h-screen bg-slate-100" data-testid="supervisor-view">
      <Header mode="supervisor" />
      <main className="mx-auto max-w-6xl px-6 py-6">
        <div className="flex flex-wrap items-center gap-3">
          <div>
            <h1 className="text-xl font-semibold text-ink">Review Center</h1>
            <p className="mt-0.5 text-sm text-steel">
              {state.caseInfo.title} · Reviewer: <span className="font-medium text-ink">{state.caseInfo.supervisor}</span>
            </p>
          </div>
          <span className="ml-auto inline-flex items-center gap-1.5 rounded-full border border-navy-100 bg-navy-50 px-2.5 py-1 text-[11px] font-medium text-navy-700">
            <Eye size={12} /> Read-only in this prototype
          </span>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Claim elements', value: m.total },
            { label: 'Ready', value: m.ready },
            { label: 'Needs review', value: m.needsReview + m.review },
            { label: 'High-impact decisions', value: highImpact.length },
          ].map((c) => (
            <div key={c.label} className="rounded-lg border border-slate-200 bg-white px-4 py-3">
              <div className="text-2xl font-bold text-ink" data-testid={`supervisor-stat-${c.label.toLowerCase().replace(/\s+/g, '-')}`}>{c.value}</div>
              <div className="mt-0.5 text-[11px] text-steel">{c.label}</div>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <section className="rounded-lg border border-slate-200 bg-white p-4" data-testid="high-impact-decisions">
            <SectionLabel>High-Impact Decisions</SectionLabel>
            <div className="mt-3 space-y-3">
              {highImpact.length === 0 && (
                <p className="rounded-md border border-dashed border-slate-300 px-3 py-4 text-center text-xs text-steel">
                  No high-impact decisions yet. They appear when an analyst applies a reasoning change with downstream effects.
                </p>
              )}
              {highImpact.map((d, i) => {
                const el = state.elements.find((e) => e.id === d.elementId);
                const open = state.issues.filter((x) => x.decisionId === d.id && x.status === 'open').length;
                const hasProposal = state.decisions.some((p) => p.type === 'reasoning_proposal' && p.elementId === d.elementId);
                return (
                  <article key={d.id} className="rounded-lg border border-slate-200 px-4 py-3 anim-fade-up" data-testid={`high-impact-card-${d.id}`}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-full border border-warn-border bg-warn-bg px-2 py-0.5 text-[10px] font-bold text-warn-text">
                        Priority {i + 1} · HIGH
                      </span>
                      <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${open ? 'border-warn-border bg-warn-bg text-warn-text' : 'border-ok-border bg-ok-bg text-ok-text'}`}>
                        {open ? `${open} open issue${open > 1 ? 's' : ''}` : 'Resolved'}
                      </span>
                    </div>
                    <h3 className="mt-2 text-sm font-semibold text-ink">{el?.name} interpretation</h3>
                    <ul className="mt-1.5 space-y-0.5 text-[11px] text-steel">
                      <li>Affects {d.affectedElements.length} downstream element{d.affectedElements.length > 1 ? 's' : ''} ({d.affectedElements.map((id) => `E${state.elements.find((e) => e.id === id)?.num}`).join(', ')})</li>
                      <li>{d.dependencySnapshot?.length || 0} evidence chains · {d.dependencySnapshot?.length || 0} dependency relationships</li>
                      <li>Actor: {hasProposal ? 'AI + Analyst' : 'Analyst'} · {fmtTime(d.timestamp)}</li>
                    </ul>
                    <Btn variant="secondary" className="mt-2.5 px-2.5 py-1.5 text-xs" data-testid={`replay-btn-${d.id}`} onClick={() => api.openModal({ type: 'replay', decisionId: d.id })}>
                      <History size={12} /> View reasoning replay
                    </Btn>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-4" data-testid="supervisor-activity">
            <div className="flex items-center justify-between gap-2">
              <SectionLabel>Recent decision activity</SectionLabel>
              <div className="flex gap-1" role="group" aria-label="Activity filter">
                {FILTERS.map((f) => (
                  <button
                    key={f.id}
                    data-testid={`activity-filter-${f.id}`}
                    aria-pressed={filter === f.id}
                    onClick={() => setFilter(f.id)}
                    className={`rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors ${filter === f.id ? 'bg-navy-900 text-white' : 'bg-slate-100 text-steel hover:bg-slate-200'}`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            <ul className="mt-3 space-y-2">
              {activity.length === 0 && <li className="text-xs text-slate-400">No activity recorded yet for this filter.</li>}
              {activity.slice(0, 14).map((d) => (
                <li key={d.id} className="flex items-start gap-2.5 rounded-md border border-slate-100 bg-slate-50 px-3 py-2 anim-fade-up" data-testid={`activity-item-${d.id}`}>
                  <ActivityIcon actor={d.actor} />
                  <div className="min-w-0">
                    <p className="text-[12px] leading-snug text-ink">{d.label}</p>
                    <p className="mt-0.5 text-[10px] text-slate-400">
                      {d.elementId ? `Element ${state.elements.find((e) => e.id === d.elementId)?.num} · ` : ''}
                      <span className="capitalize">{d.status}</span> · {fmtTime(d.timestamp)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </main>
    </div>
  );
}
