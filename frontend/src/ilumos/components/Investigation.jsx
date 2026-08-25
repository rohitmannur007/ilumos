import React, { useEffect, useRef, useState } from 'react';
import { Send, Undo2, MousePointerClick, ArrowDown, CheckCircle2, XCircle, Sparkles } from 'lucide-react';
import { useStore } from '../store';
import { StatusChip, EvidenceChip, SectionLabel, Btn, Avatar } from './bits';

const SectionRow = ({ label, children }) => (
  <div className="grid grid-cols-[104px_1fr] gap-2 border-b border-slate-100 py-1.5 last:border-0">
    <span className="pt-0.5 text-[10px] font-semibold uppercase tracking-wide text-steel">{label}</span>
    <div className="text-[13px] leading-relaxed text-ink">{children}</div>
  </div>
);

const QUICK_ACTIONS = {
  e3: [
    { label: 'Strengthen reasoning', fill: 'The AI reasoning for the ML algorithm element is weak. Add more technical details.', testid: 'strengthen-reasoning-btn' },
    { label: 'Find ML implementation evidence', send: 'Find technical evidence proving the ML implementation.', testid: 'find-ml-evidence-btn' },
  ],
  e2: [{ label: 'This evidence is wrong', send: 'This evidence is about the temperature sensor, not the motion sensor.', testid: 'wrong-evidence-btn' }],
};
const DEFAULT_ACTIONS = [
  { label: 'Summarize evidence', send: 'Summarize the evidence for this element.', testid: 'summarize-evidence-btn' },
  { label: 'Check downstream impact', send: 'Check downstream impact of this element.', testid: 'check-impact-btn' },
];

const ProcessingCard = ({ stages, index }) => (
  <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 anim-fade-in" data-testid="ai-processing">
    <div className="flex items-center gap-2">
      <Avatar label="iL" tone="ai" />
      <span className="text-[11px] font-medium text-steel">iLumos is working</span>
      <span className="flex gap-0.5" aria-hidden="true">
        <span className="typing-dot h-1 w-1 rounded-full bg-steel" />
        <span className="typing-dot h-1 w-1 rounded-full bg-steel" />
        <span className="typing-dot h-1 w-1 rounded-full bg-steel" />
      </span>
    </div>
    <ul className="mt-2 space-y-1">
      {stages.map((s, i) => (
        <li key={i} className={`flex items-center gap-1.5 text-[11px] ${i < index ? 'text-ok-text' : i === index ? 'font-medium text-ink anim-pulse-soft' : 'text-slate-400'}`}>
          {i < index ? <CheckCircle2 size={11} /> : <span className={`h-1.5 w-1.5 rounded-full ${i === index ? 'bg-brand' : 'bg-slate-300'}`} />}
          {s}
        </li>
      ))}
    </ul>
  </div>
);

const ProposalActions = ({ msg, element }) => {
  const { state, api } = useStore();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(msg.proposal.after);
  const isPending = state.pendingProposal?.messageId === msg.id;
  if (msg.proposalState === 'applied')
    return <p className="mt-2 inline-flex items-center gap-1 rounded-full border border-ok-border bg-ok-bg px-2 py-0.5 text-[11px] font-medium text-ok-text"><CheckCircle2 size={11} /> Applied · v{element.version}</p>;
  if (msg.proposalState === 'rejected')
    return <p className="mt-2 inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-steel"><XCircle size={11} /> Rejected · original reasoning preserved</p>;
  if (!isPending) return null;
  if (editing)
    return (
      <div className="mt-2 space-y-2" data-testid="edit-proposal-panel">
        <textarea
          data-testid="edit-proposal-textarea"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={3}
          className="w-full rounded-md border border-slate-300 px-2.5 py-2 text-[13px] text-ink focus:border-brand"
          aria-label="Edit proposed reasoning"
        />
        <div className="flex gap-2">
          <Btn variant="accent" data-testid="save-edit-btn" onClick={() => { setEditing(false); api.saveProposalEdit(element.id, draft); }}>Save edit & preview impact</Btn>
          <Btn variant="ghost" data-testid="cancel-edit-btn" onClick={() => setEditing(false)}>Cancel</Btn>
        </div>
      </div>
    );
  return (
    <div className="mt-3 flex flex-wrap gap-1.5">
      <Btn variant="accent" className="px-2.5 py-1.5 text-xs" data-testid="preview-impact-btn" onClick={() => api.openModal({ type: 'impact' })}>Preview impact</Btn>
      <Btn variant="secondary" className="px-2.5 py-1.5 text-xs" data-testid="accept-proposal-btn" onClick={() => api.openModal({ type: 'impact' })}>Accept</Btn>
      <Btn variant="secondary" className="px-2.5 py-1.5 text-xs" data-testid="edit-proposal-btn" onClick={() => setEditing(true)}>Edit</Btn>
      <Btn variant="danger" className="px-2.5 py-1.5 text-xs" data-testid="reject-proposal-btn" onClick={() => api.rejectProposal(element.id)}>Reject</Btn>
    </div>
  );
};

const AiMessage = ({ msg, element }) => {
  const { api } = useStore();
  const openSource = (id) => api.openModal({ type: 'source', evidenceId: id });
  if (msg.kind === 'refusal')
    return (
      <div className="space-y-2" data-testid="ai-refusal-message">
        {msg.lines.map((l, i) => (
          <p key={i} className="text-[13px] leading-relaxed text-ink">{l}</p>
        ))}
        {msg.handled ? (
          <p className="text-[11px] font-medium text-steel">Handled · {msg.handled}</p>
        ) : (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {msg.options.map((o) => (
              <Btn key={o} variant="secondary" className="px-2.5 py-1.5 text-xs" data-testid={`refusal-option-${o.toLowerCase().replace(/\s+/g, '-')}`} onClick={() => api.handleRefusalOption(element.id, o)}>
                {o}
              </Btn>
            ))}
          </div>
        )}
        <p className="text-[10px] text-slate-400">Recorded as an evidence limitation — not an unsupported AI assertion.</p>
      </div>
    );
  if (msg.kind === 'correction')
    return (
      <div className="space-y-2" data-testid="ai-correction-message">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-warn-text">Correcting Element {element.num} · {element.name}</p>
        <p className="text-[13px] leading-relaxed text-ink">{msg.intro}</p>
        {msg.evidenceIds.map((id) => (
          <div key={id} className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
            <EvidenceChip id={id} onOpen={openSource} />
            <p className="mt-1.5 text-[13px] italic leading-relaxed text-ink">“<EvidenceQuote id={id} />”</p>
          </div>
        ))}
        {msg.resolved ? (
          <p className="text-[11px] font-medium text-steel">{msg.resolved === 'used' ? 'Source updated to Technical Architecture · p.12' : 'Original source kept'}</p>
        ) : (
          <div className="flex gap-1.5">
            <Btn variant="accent" className="px-2.5 py-1.5 text-xs" data-testid="use-source-btn" onClick={() => api.handleCorrection(element.id, true)}>Use source</Btn>
            <Btn variant="secondary" className="px-2.5 py-1.5 text-xs" data-testid="keep-original-btn" onClick={() => api.handleCorrection(element.id, false)}>Keep original</Btn>
          </div>
        )}
      </div>
    );
  const s = msg.structured;
  return (
    <div data-testid="ai-structured-message">
      <SectionRow label="Finding">{s.finding}</SectionRow>
      {s.evidenceIds?.length > 0 && (
        <SectionRow label="Evidence">
          <div className="flex flex-wrap gap-1">{s.evidenceIds.map((id) => <EvidenceChip key={id} id={id} onOpen={openSource} />)}</div>
          <div className="mt-1 space-y-1">
            {s.evidenceIds.map((id) => (
              <p key={id} className="text-[12px] italic text-steel">“<EvidenceQuote id={id} />”</p>
            ))}
          </div>
        </SectionRow>
      )}
      <SectionRow label="Interpretation">{s.interpretation}</SectionRow>
      {s.limitation && <SectionRow label="Limitation"><span className="text-warn-text">{s.limitation}</span></SectionRow>}
      {s.proposedAction && <SectionRow label="Proposed action">{s.proposedAction}</SectionRow>}
      {s.impact && <SectionRow label="Impact"><span className="font-medium text-navy-700">{s.impact}</span></SectionRow>}
      {s.strength && <SectionRow label="Strength">{s.strength}</SectionRow>}
      {msg.kind === 'proposal' && msg.proposal && (
        <div className="mt-2 space-y-1.5" data-testid="before-after-diff">
          <div className="rounded-md border border-danger-border bg-danger-bg/60 px-3 py-2">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-danger-text">Before</div>
            <p className="mt-0.5 text-[13px] leading-relaxed text-slate-600">{msg.proposal.before}</p>
          </div>
          <div className="flex justify-center" aria-hidden="true"><ArrowDown size={13} className="text-slate-400" /></div>
          <div className="rounded-md border border-ok-border bg-ok-bg/70 px-3 py-2">
            <div className="text-[10px] font-semibold uppercase tracking-wide text-ok-text">After</div>
            <p className="mt-0.5 text-[13px] font-medium leading-relaxed text-ink">{msg.proposal.after}</p>
          </div>
          <ProposalActions msg={msg} element={element} />
        </div>
      )}
    </div>
  );
};

// hook-safe helper rendered inside components that already provide store context
const EvidenceQuote = ({ id }) => {
  const { state } = useStore();
  return <>{state.evidence[id]?.quote}</>;
};

const EvidenceChain = ({ el }) => {
  const { state, api } = useStore();
  const openSource = (id) => api.openModal({ type: 'source', evidenceId: id });
  const firstEv = el.evidenceIds[0] ? state.evidence[el.evidenceIds[0]] : null;
  const impacting = state.dependencies.filter((d) => d.from === el.id).map((d) => d.to);
  const steps = [
    { label: 'Claim', body: el.claim },
    { label: 'Product feature', body: el.mapping },
    { label: 'Source', chips: el.evidenceIds },
    { label: 'Exact excerpt', body: firstEv ? `“${firstEv.quote}”` : 'No excerpt linked — evidence gap.' },
    { label: 'AI interpretation', body: el.reasoning },
    { label: 'Analyst decision', body: `${el.status === 'ready' ? 'Ready' : el.status === 'review' ? 'Review' : 'Needs Review'} · ${el.reasonTag} · v${el.version}` },
    {
      label: 'Affected elements',
      body: el.impactedBy
        ? `Impacted by Element ${state.elements.find((x) => x.id === el.impactedBy.from)?.num} — review recommended.`
        : impacting.length
          ? `May affect ${impacting.map((id) => `Element ${state.elements.find((x) => x.id === id)?.num}`).join(', ')} if reasoning changes.`
          : 'None modeled.',
    },
  ];
  return (
    <ol className="relative ml-1.5 space-y-3 border-l border-slate-200 pl-4" data-testid="evidence-chain">
      {steps.map((s, i) => (
        <li key={i} className="relative">
          <span className="absolute -left-[21px] top-1 h-2 w-2 rounded-full border border-slate-300 bg-white" aria-hidden="true" />
          <div className="text-[10px] font-semibold uppercase tracking-wide text-steel">{s.label}</div>
          {s.chips ? (
            <div className="mt-1 flex flex-wrap gap-1">
              {s.chips.length ? s.chips.map((id) => <EvidenceChip key={id} id={id} onOpen={openSource} />) : <span className="text-[11px] text-warn-text">No source linked</span>}
            </div>
          ) : (
            <p className="mt-0.5 text-[12px] leading-relaxed text-ink">{s.body}</p>
          )}
        </li>
      ))}
    </ol>
  );
};

const RelatedDecisions = ({ el }) => {
  const { state, api } = useStore();
  const related = state.decisions.filter((d) => d.elementId === el.id).slice().reverse();
  if (!related.length) return <p className="text-[11px] text-slate-400">No decisions recorded for this element yet.</p>;
  return (
    <ul className="space-y-1.5" data-testid="related-decisions">
      {related.slice(0, 5).map((d) => (
        <li key={d.id} className="flex items-center justify-between gap-2 rounded-md border border-slate-100 bg-slate-50 px-2.5 py-1.5">
          <span className="text-[11px] text-ink">{d.label}</span>
          {d.type === 'reasoning_change' && d.status === 'accepted' ? (
            <button data-testid={`replay-link-${d.id}`} onClick={() => api.openModal({ type: 'replay', decisionId: d.id })} className="shrink-0 text-[10px] font-medium text-brand-dark hover:underline">
              Replay
            </button>
          ) : (
            <span className="shrink-0 text-[10px] capitalize text-slate-400">{d.status}</span>
          )}
        </li>
      ))}
    </ul>
  );
};

const Chat = ({ el }) => {
  const { state, api } = useStore();
  const [input, setInput] = useState('');
  const scrollRef = useRef(null);
  const messages = state.messagesByElement[el.id] || [];
  const processing = state.processing?.elementId === el.id ? state.processing : null;
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages.length, processing?.index]);
  const actions = [...(QUICK_ACTIONS[el.id] || []), ...DEFAULT_ACTIONS];
  const send = (text) => {
    const t = (text ?? input).trim();
    if (!t || state.processing) return;
    setInput('');
    api.sendMessage(el.id, t);
  };
  return (
    <div className="flex min-h-[320px] flex-1 flex-col" data-testid="element-chat">
      <div ref={scrollRef} className="ilumos-scroll flex-1 space-y-3 overflow-y-auto pr-1" style={{ maxHeight: 420 }}>
        {messages.length === 0 && (
          <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 px-3 py-4 text-center">
            <Sparkles size={14} className="mx-auto text-navy-700" />
            <p className="mt-1.5 text-[12px] font-medium text-ink">Element-scoped assistant</p>
            <p className="mt-0.5 text-[11px] leading-relaxed text-steel">
              This conversation belongs to Element {el.num}. It uses only the uploaded demo sources and never invents citations.
            </p>
          </div>
        )}
        {messages.map((m) =>
          m.role === 'user' ? (
            <div key={m.id} className="flex justify-end anim-fade-up">
              <div className="max-w-[85%] rounded-lg rounded-br-sm bg-navy-900 px-3 py-2 text-[13px] leading-relaxed text-white">{m.text}</div>
            </div>
          ) : m.role === 'note' ? (
            <p key={m.id} className="rounded bg-slate-50 px-2 py-1 text-center text-[10px] text-steel anim-fade-in">{m.text}</p>
          ) : (
            <div key={m.id} className="flex gap-2 anim-fade-up">
              <Avatar label="iL" tone="ai" />
              <div className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-3 py-2.5">
                <div className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-steel">iLumos · Element {el.num}</div>
                <AiMessage msg={m} element={el} />
              </div>
            </div>
          )
        )}
        {processing && <ProcessingCard stages={processing.stages} index={processing.index} />}
      </div>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {actions.map((a) => (
          <button
            key={a.label}
            data-testid={a.testid}
            onClick={() => (a.send ? send(a.send) : setInput(a.fill))}
            className="rounded-full border border-slate-300 bg-white px-2.5 py-1 text-[11px] font-medium text-steel hover:border-brand hover:text-brand-dark transition-colors"
          >
            {a.label}
          </button>
        ))}
      </div>
      <div className="mt-2 flex items-end gap-2">
        <textarea
          data-testid="chat-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
          rows={2}
          placeholder={`Ask about Element ${el.num} — reasoning, evidence, downstream impact…`}
          aria-label={`Message about Element ${el.num}`}
          className="flex-1 resize-none rounded-md border border-slate-300 px-3 py-2 text-[13px] text-ink placeholder:text-slate-400 focus:border-brand"
        />
        <Btn variant="primary" data-testid="chat-send-btn" onClick={() => send()} disabled={!input.trim() || !!state.processing} aria-label="Send message">
          <Send size={14} />
        </Btn>
      </div>
    </div>
  );
};

export default function Investigation() {
  const { state, api } = useStore();
  const el = state.elements.find((e) => e.id === state.selectedElement);
  if (!el)
    return (
      <section className="flex min-h-[400px] items-center justify-center rounded-lg border border-slate-200 bg-white p-8" data-testid="investigation-empty">
        <div className="text-center">
          <MousePointerClick size={18} className="mx-auto text-slate-400" />
          <p className="mt-2 text-sm font-medium text-ink">Select a claim element</p>
          <p className="mt-1 max-w-[260px] text-xs leading-relaxed text-steel">
            Open an element to inspect its evidence chain, ask the assistant, and see what a change would affect downstream.
          </p>
        </div>
      </section>
    );
  return (
    <section className="rounded-lg border border-slate-200 bg-white" data-testid="investigation-panel">
      <div className="border-b border-slate-200 px-4 py-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-ink" data-testid="investigation-title">Element {el.num} · {el.name}</h2>
            <div className="mt-1.5"><StatusChip status={el.status} reasonTag={el.reasonTag} testid={`investigation-status-${el.id}`} /></div>
          </div>
          {state.undoStack.length > 0 && (
            <Btn variant="secondary" className="px-2.5 py-1.5 text-xs" data-testid="undo-btn" onClick={api.undoLast}>
              <Undo2 size={12} /> Undo last refinement
            </Btn>
          )}
        </div>
      </div>
      <div className="space-y-5 px-4 py-4">
        <div>
          <SectionLabel>Claim requirement</SectionLabel>
          <p className="mt-1 text-[13px] leading-relaxed text-ink">{el.claim}</p>
        </div>
        <div>
          <SectionLabel>Current mapping</SectionLabel>
          <p className="mt-1 text-[13px] text-ink">{el.mapping}</p>
        </div>
        <div>
          <SectionLabel>Current reasoning · v{el.version}</SectionLabel>
          <p className="mt-1 text-[13px] leading-relaxed text-ink" data-testid="current-reasoning">{el.reasoning}</p>
        </div>
        <div className="rounded-md border border-warn-border bg-warn-bg/60 px-3 py-2">
          <SectionLabel><span className="text-warn-text">Why this needs attention</span></SectionLabel>
          <p className="mt-1 text-[12px] leading-relaxed text-ink">{el.weakness}</p>
        </div>
        <div>
          <SectionLabel>Evidence chain</SectionLabel>
          <div className="mt-2"><EvidenceChain el={el} /></div>
        </div>
        <div>
          <SectionLabel>Relevant related decisions</SectionLabel>
          <div className="mt-2"><RelatedDecisions el={el} /></div>
        </div>
        <div className="border-t border-slate-200 pt-4">
          <SectionLabel>Element-scoped chat</SectionLabel>
          <div className="mt-2 flex"><Chat el={el} /></div>
        </div>
      </div>
    </section>
  );
}
