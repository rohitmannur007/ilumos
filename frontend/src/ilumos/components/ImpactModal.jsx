import React, { useState } from 'react';
import { GitBranch, ListChecks, PencilLine, CheckCheck, ArrowLeft, ArrowDown } from 'lucide-react';
import { useStore } from '../store';
import { Modal, Btn, EvidenceChip, StatusChip } from './bits';

const NODE_W = 150;
const NODE_H = 56;

export const ImpactGraph = ({ center, targets }) => (
  <div
    className="relative mx-auto w-[560px] max-w-full"
    style={{ height: 240 }}
    role="img"
    aria-label={`Element ${center.num} connected to ${targets.map((t) => 'Element ' + t.element.num).join(' and ')}`}
    data-testid="impact-graph"
  >
    <svg viewBox="0 0 560 240" className="absolute inset-0 h-full w-full" aria-hidden="true">
      {targets.map((t, i) => {
        const endY = (i === 0 ? 18 : 166) + NODE_H / 2;
        return (
          <path
            key={t.dep.id}
            d={`M ${20 + NODE_W} ${92 + NODE_H / 2} C 290 ${92 + NODE_H / 2}, 290 ${endY}, 390 ${endY}`}
            fill="none"
            stroke="#94A3B8"
            strokeWidth={1.4}
            className="anim-edge"
            style={{ animationDelay: '350ms' }}
          />
        );
      })}
    </svg>
    <div
      className="anim-node absolute flex flex-col justify-center rounded-lg bg-navy-900 px-3"
      style={{ left: 20, top: 92, width: NODE_W, height: NODE_H }}
    >
      <span className="text-[11px] font-bold text-white">Element {center.num}</span>
      <span className="text-[11px] text-[#A9BED4]">{center.name}</span>
    </div>
    {targets.map((t, i) => (
      <div
        key={t.dep.id}
        className="anim-node absolute flex flex-col justify-center rounded-lg border-[1.6px] border-warn-text bg-warn-bg px-3"
        style={{ left: 390, top: i === 0 ? 18 : 166, width: NODE_W, height: NODE_H, animationDelay: `${250 + i * 180}ms` }}
      >
        <span className="text-[11px] font-bold text-ink">Element {t.element.num}</span>
        <span className="text-[11px] text-warn-text">{t.element.name}</span>
      </div>
    ))}
    {targets.map((t, i) => (
      <div
        key={`label-${t.dep.id}`}
        className="anim-fade-in absolute"
        style={{ left: 210, top: i === 0 ? 6 : 148, animationDelay: `${700 + i * 100}ms` }}
      >
        <div className="text-[10px] font-semibold text-steel">{t.dep.relationship}</div>
        <div className="text-[10px] text-slate-400">shared concept: {t.dep.sharedConcept}</div>
      </div>
    ))}
  </div>
);

export const WhyPanel = ({ dep, fromElement, toElement, before, after, onReview, onBack }) => {
  const { api } = useStore();
  const openSource = (id) => api.openModal({ type: 'source', evidenceId: id });
  return (
    <div className="space-y-4 anim-fade-up" data-testid={`why-panel-${toElement.id}`}>
      {onBack && (
        <button data-testid="why-back-btn" onClick={onBack} className="inline-flex items-center gap-1 text-xs font-medium text-brand-dark hover:underline">
          <ArrowLeft size={12} /> Back to impact overview
        </button>
      )}
      <h3 className="text-sm font-semibold uppercase tracking-[0.06em] text-ink">Why is Element {toElement.num} affected?</h3>
      <div className="grid gap-3 text-[13px] sm:grid-cols-2">
        <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-steel">Triggered by</div>
          <p className="mt-1 font-medium text-ink">Element {fromElement.num} · {fromElement.name}</p>
        </div>
        <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-steel">Relationship</div>
          <p className="mt-1 font-medium text-ink">{dep.relationship}</p>
        </div>
        <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-steel">Shared concept</div>
          <p className="mt-1 font-medium text-ink">{dep.sharedConcept}</p>
        </div>
        <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-steel">Shared evidence</div>
          <div className="mt-1 flex flex-wrap gap-1">{dep.sharedEvidence.map((id) => <EvidenceChip key={id} id={id} onOpen={openSource} />)}</div>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-md border border-slate-200 px-3 py-2">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-steel">Element {fromElement.num} · current reasoning</div>
          <p className="mt-1 text-[12px] leading-relaxed text-ink">{fromElement.reasoning}</p>
        </div>
        <div className="rounded-md border border-slate-200 px-3 py-2">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-steel">Element {toElement.num} · current reasoning</div>
          <p className="mt-1 text-[12px] leading-relaxed text-ink">{toElement.reasoning}</p>
        </div>
      </div>
      {before && after && (
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wide text-steel">What changed</div>
          <div className="mt-1.5 space-y-1.5">
            <div className="rounded-md border border-danger-border bg-danger-bg/60 px-3 py-2 text-[12px] text-slate-600">{before}</div>
            <div className="flex justify-center" aria-hidden="true"><ArrowDown size={12} className="text-slate-400" /></div>
            <div className="rounded-md border border-ok-border bg-ok-bg/70 px-3 py-2 text-[12px] font-medium text-ink">{after}</div>
          </div>
        </div>
      )}
      <div className="rounded-md border border-warn-border bg-warn-bg/60 px-3 py-2">
        <div className="text-[10px] font-semibold uppercase tracking-wide text-warn-text">Reason for flag</div>
        <p className="mt-1 text-[12px] leading-relaxed text-ink">{dep.reason}</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <span className="rounded-full border border-navy-100 bg-navy-50 px-2 py-0.5 text-[10px] font-medium text-navy-700">Potential relationship</span>
          <span className="rounded-full border border-warn-border bg-warn-bg px-2 py-0.5 text-[10px] font-medium text-warn-text">Analyst judgment required</span>
        </div>
        <p className="mt-2 text-[11px] text-steel">Potential reasoning dependency — this is not a determination that the positions are contradictory.</p>
      </div>
      {onReview && (
        <Btn variant="accent" data-testid={`review-element-btn-${toElement.id}`} onClick={onReview}>
          Review Element {toElement.num}
        </Btn>
      )}
    </div>
  );
};

export const WhyModal = ({ elementId }) => {
  const { state, api } = useStore();
  const toElement = state.elements.find((e) => e.id === elementId);
  const dep = state.dependencies.find((d) => d.to === elementId);
  const decision = state.decisions
    .filter((d) => d.type === 'reasoning_change' && (d.affectedElements || []).includes(elementId))
    .slice(-1)[0];
  if (!toElement || !dep) return null;
  const fromElement = state.elements.find((e) => e.id === dep.from);
  const after = decision ? decision.edited || decision.proposed : null;
  return (
    <Modal title={`Element ${toElement.num} · impact explanation`} subtitle="Derived from the chart dependency model and recorded decision history." onClose={api.closeModal} wide testid="why-modal">
      <WhyPanel
        dep={dep}
        fromElement={fromElement}
        toElement={toElement}
        before={decision?.before}
        after={after}
        onReview={() => { api.closeModal(); api.selectElement(elementId); }}
      />
    </Modal>
  );
};

export default function ImpactModal() {
  const { state, api } = useStore();
  const p = state.pendingProposal;
  const [view, setView] = useState('main');
  const [showAffected, setShowAffected] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  if (!p)
    return (
      <Modal title="Reasoning Impact" onClose={api.closeModal} testid="impact-modal">
        <p className="text-sm text-steel">No pending proposal to preview.</p>
      </Modal>
    );
  const center = state.elements.find((e) => e.id === p.elementId);
  const deps = state.dependencies.filter((d) => d.from === p.elementId);
  const targets = deps.map((d) => ({ dep: d, element: state.elements.find((e) => e.id === d.to) }));
  const after = p.edited || p.after;

  if (view !== 'main') {
    const t = targets.find((x) => x.element.id === view);
    return (
      <Modal title="Reasoning Impact" subtitle="iLumos calculated related decisions from the dependency model." onClose={api.closeModal} wide testid="impact-modal">
        <WhyPanel dep={t.dep} fromElement={center} toElement={t.element} before={p.before} after={after} onBack={() => setView('main')}
          onReview={() => { api.closeModal(); api.selectElement(t.element.id); }} />
      </Modal>
    );
  }

  return (
    <Modal title="Reasoning Impact" subtitle="iLumos calculated related decisions from the dependency model." onClose={api.closeModal} wide testid="impact-modal">
      <div className="space-y-5">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-md border border-warn-border bg-warn-bg px-2 py-2">
            <div className="text-sm font-bold text-warn-text" data-testid="impact-level">HIGH</div>
            <div className="text-[10px] text-steel">Impact level</div>
          </div>
          <div className="rounded-md bg-slate-50 px-2 py-2">
            <div className="text-sm font-bold text-ink" data-testid="affected-count">{targets.length}</div>
            <div className="text-[10px] text-steel">Affected decisions</div>
          </div>
          <div className="rounded-md bg-slate-50 px-2 py-2">
            <div className="text-sm font-bold text-ink" data-testid="shared-chains-count">{targets.length}</div>
            <div className="text-[10px] text-steel">Shared evidence chains</div>
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-steel">
            <GitBranch size={12} /> Dependency model
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-3">
            <div className="overflow-x-auto ilumos-scroll">
              <ImpactGraph center={center} targets={targets} />
            </div>
          </div>
          <ul className="mt-2 space-y-1">
            {targets.map((t) => (
              <li key={t.dep.id} className="flex flex-wrap items-center gap-1.5 text-[11px] text-steel">
                <span className="font-medium text-ink">E{center.num} → E{t.element.num}</span>
                <span>·</span><span>{t.dep.relationship}</span>
                <span>·</span><span>shared evidence:</span>
                {t.dep.sharedEvidence.map((id) => <EvidenceChip key={id} id={id} onOpen={(id2) => api.openModal({ type: 'source', evidenceId: id2 })} />)}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-1.5">
          <div className="text-[10px] font-semibold uppercase tracking-wide text-steel">Proposed reasoning change</div>
          <div className="rounded-md border border-danger-border bg-danger-bg/60 px-3 py-2 text-[12px] text-slate-600">{p.before}</div>
          <div className="flex justify-center" aria-hidden="true"><ArrowDown size={12} className="text-slate-400" /></div>
          <div className="rounded-md border border-ok-border bg-ok-bg/70 px-3 py-2 text-[12px] font-medium text-ink">{after}</div>
        </div>

        {showAffected && (
          <div className="space-y-2 anim-fade-up" data-testid="affected-decisions-list">
            {targets.map((t) => (
              <div key={t.dep.id} className="flex items-center justify-between gap-3 rounded-md border border-slate-200 px-3 py-2.5">
                <div>
                  <div className="text-[13px] font-medium text-ink">Element {t.element.num} · {t.element.name}</div>
                  <div className="mt-0.5 text-[11px] text-steel">{t.dep.relationship} · shared concept: {t.dep.sharedConcept}</div>
                  <div className="mt-1"><StatusChip status={t.element.status} reasonTag={t.element.reasonTag} /></div>
                </div>
                <Btn variant="secondary" className="shrink-0 px-2.5 py-1.5 text-xs" data-testid={`explain-btn-${t.element.id}`} onClick={() => setView(t.element.id)}>
                  Explain
                </Btn>
              </div>
            ))}
          </div>
        )}

        {editing && (
          <div className="space-y-2 anim-fade-up">
            <textarea
              data-testid="impact-edit-textarea"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-slate-300 px-2.5 py-2 text-[13px] text-ink focus:border-brand"
              aria-label="Edit proposal"
            />
            <div className="flex gap-2">
              <Btn variant="accent" data-testid="impact-save-edit-btn" onClick={() => { api.saveProposalEdit(p.elementId, draft); setEditing(false); }}>Save edit</Btn>
              <Btn variant="ghost" data-testid="impact-cancel-edit-btn" onClick={() => setEditing(false)}>Cancel</Btn>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2 border-t border-slate-200 pt-4">
          <Btn variant="secondary" data-testid="show-affected-btn" onClick={() => setShowAffected((v) => !v)}>
            <ListChecks size={13} /> {showAffected ? 'Hide affected decisions' : 'Show affected decisions'}
          </Btn>
          <Btn variant="secondary" data-testid="impact-edit-btn" onClick={() => { setDraft(after); setEditing(true); }}>
            <PencilLine size={13} /> Edit proposal
          </Btn>
          <Btn variant="primary" className="ml-auto" data-testid="apply-change-btn" onClick={api.applyProposal}>
            <CheckCheck size={13} /> Apply change & review affected elements
          </Btn>
        </div>
      </div>
    </Modal>
  );
}
