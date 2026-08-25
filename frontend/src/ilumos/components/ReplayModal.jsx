import React from 'react';
import { motion } from 'framer-motion';
import { History } from 'lucide-react';
import { useStore } from '../store';
import { Modal, StatusChip, EvidenceChip, Avatar } from './bits';

const fmtTime = (ts) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export default function ReplayModal({ decisionId }) {
  const { state, api } = useStore();
  const decision = state.decisions.find((d) => d.id === decisionId);
  if (!decision) return null;
  const element = state.elements.find((e) => e.id === decision.elementId);
  const group = state.decisions.filter((d) => d.groupId && d.groupId === decision.groupId);
  const proposal =
    group.find((d) => d.type === 'reasoning_proposal') ||
    state.decisions.filter((d) => d.type === 'reasoning_proposal' && d.elementId === decision.elementId).slice(-1)[0];
  const impact = group.find((d) => d.type === 'impact_detected');
  const resolution = group.find((d) => d.type === 'review_resolution');
  const openSource = (id) => api.openModal({ type: 'source', evidenceId: id });

  const steps = [
    {
      label: 'Original', actor: 'Analyst authored', time: proposal?.timestamp || decision.timestamp,
      body: <p className="text-[13px] leading-relaxed text-ink">{decision.before || 'Original chart reasoning.'}</p>,
    },
    {
      label: decision.edited ? 'Analyst edit' : 'AI proposal', actor: decision.edited ? 'Rohit · analyst edited AI draft' : 'AI draft', time: proposal?.timestamp || decision.timestamp,
      body: <p className="text-[13px] leading-relaxed text-ink">{decision.edited || decision.proposed}</p>,
    },
    {
      label: 'Evidence added', actor: 'System · citation link', time: decision.timestamp,
      body: (
        <div className="space-y-1.5">
          {(decision.evidenceAdded || []).map((id) => (
            <div key={id} className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1.5">
              <EvidenceChip id={id} onOpen={openSource} />
              <p className="mt-1 text-[12px] italic text-steel">“{state.evidence[id]?.quote}”</p>
            </div>
          ))}
        </div>
      ),
    },
    {
      label: 'Impact detected', actor: 'System · dependency model', time: impact?.timestamp || decision.timestamp,
      body: (
        <p className="text-[13px] leading-relaxed text-ink">
          {(decision.affectedElements || []).map((id) => `Element ${state.elements.find((e) => e.id === id)?.num}`).join(' and ')} flagged for review — {impact?.reason || 'shared concept and evidence chain'}.
        </p>
      ),
    },
    {
      label: 'Analyst resolution', actor: resolution ? 'Rohit · analyst' : 'Pending', time: resolution?.timestamp,
      body: resolution ? (
        <p className="rounded-md border border-ok-border bg-ok-bg/60 px-3 py-2 text-[13px] italic leading-relaxed text-ink">“{resolution.reason}”</p>
      ) : (
        <p className="text-[13px] text-warn-text">Open — awaiting analyst resolution of affected elements.</p>
      ),
    },
    {
      label: 'Current state', actor: 'Element record', time: null,
      body: (
        <div className="space-y-1.5">
          <StatusChip status={element.status} reasonTag={element.reasonTag} testid="replay-current-status" />
          <p className="text-[13px] leading-relaxed text-ink">{element.reasoning}</p>
          <p className="text-[11px] text-slate-400">Version {element.version}</p>
        </div>
      ),
    },
  ];

  return (
    <Modal
      title={`Decision Replay · Element ${element.num} ${element.name}`}
      subtitle="Read-only provenance — why this sentence looks like this now."
      onClose={api.closeModal}
      wide
      testid="decision-replay-modal"
    >
      <div className="mb-4 flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-steel">
        <History size={12} /> Generated from stored decision objects · {decision.label}
      </div>
      <ol className="relative ml-2 space-y-5 border-l-2 border-slate-200 pl-5" data-testid="replay-timeline">
        {steps.map((s, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12 + i * 0.11, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="relative"
            data-testid={`replay-step-${i + 1}`}
          >
            <span className={`absolute -left-[27px] top-0.5 h-3 w-3 rounded-full border-2 ${i === steps.length - 1 ? 'border-ok-text bg-ok-bg' : 'border-brand bg-white'}`} aria-hidden="true" />
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-ink">{i + 1}. {s.label}</span>
              <span className="text-[10px] text-slate-400">{s.actor}{s.time ? ` · ${fmtTime(s.time)}` : ''}</span>
            </div>
            <div className="mt-1.5">{s.body}</div>
          </motion.li>
        ))}
      </ol>
    </Modal>
  );
}

export const ActivityIcon = ({ actor }) => (
  <Avatar label={actor === 'ai' ? 'iL' : actor === 'system' ? 'S' : 'R'} tone={actor === 'ai' ? 'ai' : actor === 'system' ? 'system' : 'user'} />
);

export { fmtTime };
