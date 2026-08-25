import React, { useState } from 'react';
import { X, CheckCircle2, AlertTriangle, GitCompareArrows, Info, ArrowLeft } from 'lucide-react';
import { useStore, deriveMetrics, DEFAULT_RATIONALE } from '../store';
import { Btn, StatusChip, EvidenceChip, Modal, SectionLabel } from './bits';

const numOf = (state, id) => state.elements.find((e) => e.id === id)?.num;

const IssueCard = ({ issue }) => {
  const { state, api } = useStore();
  const [fromId, toId] = issue.elementIds;
  const openSource = (id) => api.openModal({ type: 'source', evidenceId: id });
  const resolved = issue.status === 'resolved';
  return (
    <div className={`rounded-lg border px-4 py-3 ${resolved ? 'border-ok-border bg-ok-bg/40' : 'border-warn-border bg-warn-bg/40'}`} data-testid={`issue-card-${issue.id}`}>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {resolved ? <CheckCircle2 size={15} className="text-ok-text" /> : <AlertTriangle size={15} className="text-warn-text" />}
          <span className="text-sm font-semibold text-ink">
            Element {numOf(state, fromId)} ↔ Element {numOf(state, toId)} — {issue.relationship}
          </span>
          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${resolved ? 'border-ok-border bg-ok-bg text-ok-text' : 'border-warn-border bg-warn-bg text-warn-text'}`}>
            {resolved ? 'Resolved' : 'Open · Priority HIGH'}
          </span>
        </div>
        {!resolved && (
          <div className="flex gap-2">
            <Btn variant="secondary" className="px-2.5 py-1.5 text-xs" data-testid={`open-comparison-btn-${issue.id}`} onClick={() => api.openModal({ type: 'resolve', issueId: issue.id })}>
              <GitCompareArrows size={13} /> Open comparison
            </Btn>
            <Btn variant="ghost" className="px-2.5 py-1.5 text-xs" data-testid={`review-issue-element-btn-${issue.id}`}
              onClick={() => { api.set({ reviewOpen: false, screen: 'workspace' }); api.selectElement(toId); }}>
              Review element
            </Btn>
          </div>
        )}
      </div>
      <p className="mt-1.5 text-[12px] leading-relaxed text-steel">{issue.reason}</p>
      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-steel">
        <span>Shared concept: <span className="font-medium text-ink">{issue.sharedConcept}</span></span>
        <span>·</span>
        {issue.sharedEvidence.map((id) => <EvidenceChip key={id} id={id} onOpen={openSource} />)}
      </div>
      {resolved && issue.rationale && (
        <p className="mt-2 rounded-md border border-ok-border bg-white px-3 py-2 text-[12px] italic text-ink">“{issue.rationale}”</p>
      )}
    </div>
  );
};

export default function ChartReview() {
  const { state, api } = useStore();
  const m = deriveMetrics(state);
  const openIssues = state.issues.filter((i) => i.status === 'open');
  const resolvedIssues = state.issues.filter((i) => i.status === 'resolved');
  const openReviewEvents = state.decisions.filter((d) => d.type === 'review' && d.status === 'open');
  const cards = [
    { label: 'Ready', value: m.ready, tone: 'text-ok-text' },
    { label: 'Needs Review', value: m.needsReview, tone: 'text-warn-text' },
    { label: 'Open Dependency', value: m.openDependencies, tone: 'text-navy-700' },
    { label: 'Unsupported AI Assertions', value: m.unsupported, tone: m.unsupported ? 'text-danger-text' : 'text-ok-text' },
  ];
  return (
    <div className="fixed inset-0 z-40 overflow-y-auto bg-slate-100 ilumos-scroll anim-fade-in" data-testid="chart-review-screen">
      <div className="mx-auto max-w-4xl px-6 py-6">
        <button
          data-testid="case-setup-back-btn"
          onClick={api.goToSetup}
          aria-label="Return to Case Setup"
          className="mb-3 inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-medium text-steel hover:bg-slate-50 hover:text-ink transition-colors"
        >
          <ArrowLeft size={13} /> Case Setup
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-semibold text-ink">Claim Chart Review</h1>
            <p className="mt-1 text-sm text-steel">Review relationships and unresolved issues across the full chart.</p>
          </div>
          <button data-testid="close-chart-review-btn" onClick={() => api.set({ reviewOpen: false })} aria-label="Close chart review"
            className="rounded-md border border-slate-300 bg-white p-2 text-steel hover:bg-slate-50 transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {cards.map((c) => (
            <div key={c.label} className="rounded-lg border border-slate-200 bg-white px-4 py-3">
              <div className={`text-2xl font-bold ${c.tone}`} data-testid={`review-summary-${c.label.toLowerCase().replace(/\s+/g, '-')}`}>{c.value}</div>
              <div className="mt-0.5 text-[11px] text-steel">{c.label}</div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <SectionLabel>Review Priorities</SectionLabel>
          <div className="mt-2 space-y-3">
            {openIssues.map((i) => <IssueCard key={i.id} issue={i} />)}
            {openIssues.length === 0 && (
              <div className="rounded-lg border border-ok-border bg-ok-bg/50 px-4 py-4 text-center anim-fade-up" data-testid="no-open-issues">
                <CheckCircle2 size={18} className="mx-auto text-ok-text" />
                <p className="mt-1.5 text-sm font-medium text-ink">No open chart-level review issues.</p>
                <p className="mt-0.5 text-xs text-steel">
                  Run the golden path refinement to create a dependency, or continue reviewing evidence.
                </p>
              </div>
            )}
          </div>
        </div>

        {openReviewEvents.length > 0 && (
          <div className="mt-6">
            <SectionLabel>Evidence limitations</SectionLabel>
            <div className="mt-2 space-y-2">
              {openReviewEvents.map((d) => (
                <div key={d.id} className="flex items-start gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3" data-testid={`review-event-${d.id}`}>
                  <Info size={14} className="mt-0.5 shrink-0 text-navy-700" />
                  <div>
                    <p className="text-[13px] font-medium text-ink">{d.label}</p>
                    <p className="mt-0.5 text-[11px] text-steel">{d.reason} · Recorded as a review event — not an unsupported AI assertion.</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {resolvedIssues.length > 0 && (
          <div className="mt-6">
            <SectionLabel>Resolved</SectionLabel>
            <div className="mt-2 space-y-3">
              {resolvedIssues.map((i) => <IssueCard key={i.id} issue={i} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export const ResolveModal = ({ issueId }) => {
  const { state, api } = useStore();
  const issue = state.issues.find((i) => i.id === issueId);
  const [stage, setStage] = useState(null);
  const [rationale, setRationale] = useState('');
  if (!issue) return null;
  const [fromId, toId] = issue.elementIds;
  const a = state.elements.find((e) => e.id === fromId);
  const b = state.elements.find((e) => e.id === toId);
  const openSource = (id) => api.openModal({ type: 'source', evidenceId: id });
  const elCard = (el) => (
    <div className="rounded-md border border-slate-200 bg-slate-50/60 px-3 py-2.5" data-testid={`compare-${el.id}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[13px] font-semibold text-ink">Element {el.num} · {el.name}</span>
        <StatusChip status={el.status} reasonTag={el.reasonTag} />
      </div>
      <p className="mt-1.5 text-[11px] text-steel">{el.claim}</p>
      <p className="mt-2 text-[12px] leading-relaxed text-ink">{el.reasoning}</p>
      <div className="mt-1.5 flex flex-wrap gap-1">{el.evidenceIds.map((id) => <EvidenceChip key={id} id={id} onOpen={openSource} />)}</div>
    </div>
  );
  return (
    <Modal title={`Element ${a.num} ↔ Element ${b.num} · Review resolution`} subtitle="Side-by-side comparison of the affected analytical positions." onClose={api.closeModal} wide testid="resolve-modal">
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">{elCard(a)}{elCard(b)}</div>
        <div className="rounded-md border border-slate-200 px-3 py-2 text-[12px] text-steel">
          <span className="font-medium text-ink">Shared concept: {issue.sharedConcept}</span> · {issue.reason}
        </div>
        {stage ? (
          <div className="space-y-2 anim-fade-up">
            <SectionLabel>Rationale {stage === 'reconcile' ? '(required to reconcile)' : ''}</SectionLabel>
            <textarea
              data-testid="rationale-textarea"
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-[13px] text-ink focus:border-brand"
              aria-label="Resolution rationale"
            />
            <div className="flex gap-2">
              <Btn variant="primary" data-testid="save-resolution-btn" disabled={!rationale.trim()} onClick={() => api.resolveIssue(issueId, rationale.trim())}>
                Save resolution
              </Btn>
              <Btn variant="ghost" data-testid="cancel-resolution-btn" onClick={() => setStage(null)}>Cancel</Btn>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            <Btn variant="secondary" data-testid="reconcile-btn" onClick={() => { setRationale(''); setStage('reconcile'); }}>Reconcile</Btn>
            <Btn variant="accent" data-testid="accept-with-rationale-btn" onClick={() => { setRationale(DEFAULT_RATIONALE); setStage('accept'); }}>
              Accept with rationale
            </Btn>
            <Btn variant="ghost" data-testid="reopen-element-btn" onClick={() => api.reopenElement(issueId)}>Reopen element</Btn>
          </div>
        )}
      </div>
    </Modal>
  );
};
