import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, CheckCircle2, AlertTriangle, CircleDot, FileText, Copy, ExternalLink, Plus, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useStore } from '../store';

export const Btn = ({ variant = 'primary', className = '', ...props }) => {
  const base =
    'inline-flex items-center justify-center gap-1.5 rounded-md text-sm font-medium transition-colors px-3.5 py-2 disabled:opacity-45 disabled:cursor-not-allowed';
  const styles = {
    primary: 'bg-navy-900 text-white hover:bg-navy-800',
    accent: 'bg-brand text-white hover:bg-brand-dark',
    secondary: 'bg-white text-ink border border-slate-300 hover:bg-slate-50',
    ghost: 'text-steel hover:bg-slate-100',
    danger: 'bg-white text-danger-text border border-danger-border hover:bg-danger-bg',
  };
  return <button className={`${base} ${styles[variant]} ${className}`} {...props} />;
};

const STATUS_META = {
  ready: { label: 'Ready', Icon: CheckCircle2, cls: 'text-ok-text bg-ok-bg border-ok-border' },
  needs_review: { label: 'Needs Review', Icon: AlertTriangle, cls: 'text-warn-text bg-warn-bg border-warn-border' },
  review: { label: 'Review', Icon: CircleDot, cls: 'text-navy-700 bg-navy-50 border-navy-100' },
};

export const StatusChip = ({ status, reasonTag, testid }) => {
  const meta = STATUS_META[status] || STATUS_META.review;
  return (
    <span data-testid={testid} className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[11px] font-medium ${meta.cls}`}>
      <meta.Icon size={11} strokeWidth={2.2} aria-hidden="true" />
      {meta.label}
      {reasonTag ? <span className="opacity-75">· {reasonTag}</span> : null}
    </span>
  );
};

export const SectionLabel = ({ children }) => (
  <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-steel">{children}</div>
);

export const EvidenceChip = ({ id, onOpen }) => {
  const { state } = useStore();
  const ev = state.evidence ? state.evidence[id] : null;
  const label = ev ? ev.label : id;
  return (
    <button
      data-testid={`citation-${id}`}
      onClick={(e) => { e.stopPropagation(); onOpen(id); }}
      className="inline-flex items-center gap-1 rounded border border-brand/30 bg-brand-soft px-1.5 py-0.5 text-[11px] font-medium text-brand-dark hover:bg-brand/15 transition-colors"
      aria-label={`Open source preview for ${label}`}
    >
      <FileText size={11} aria-hidden="true" />
      {label}
    </button>
  );
};

export const Modal = ({ title, subtitle, onClose, children, wide, testid }) => {
  const { api } = useStore();
  const closeRef = useRef(null);
  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label={title} data-testid={testid}>
      <motion.div
        className="absolute inset-0 bg-navy-950/45"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25 }}
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: 14, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 28 }}
        className={`relative bg-white rounded-lg shadow-2xl border border-slate-200 max-h-[88vh] flex flex-col ${wide ? 'w-full max-w-4xl' : 'w-full max-w-xl'}`}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-base font-semibold text-ink">{title}</h2>
            {subtitle ? <p className="mt-0.5 text-xs text-steel">{subtitle}</p> : null}
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              data-testid="modal-case-setup-btn"
              onClick={api.goToSetup}
              aria-label="Close and return to Case Setup"
              className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-[11px] font-medium text-steel hover:bg-slate-100 hover:text-ink transition-colors"
            >
              <ArrowLeft size={12} /> Case Setup
            </button>
            <button
              ref={closeRef}
              data-testid={`${testid || 'modal'}-close-btn`}
              onClick={onClose}
              aria-label="Close dialog"
              className="rounded-md p-1.5 text-steel hover:bg-slate-100 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
        <div className="overflow-y-auto ilumos-scroll px-5 py-4">{children}</div>
      </motion.div>
    </div>
  );
};

export const SourceModal = ({ evidenceId }) => {
  const { state, api } = useStore();
  const ev = state.evidence[evidenceId];
  if (!ev) return null;
  return (
    <Modal
      title={ev.title}
      subtitle={`${ev.docType} · ${ev.totalPages} pages`}
      onClose={api.closeModal}
      testid="source-preview-modal"
    >
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-xs">
          <span className="rounded-full bg-navy-50 border border-navy-100 px-2 py-0.5 font-medium text-navy-700">{ev.evidenceType}</span>
          <span className="text-steel">Page {ev.page} of {ev.totalPages}</span>
        </div>
        <div>
          <SectionLabel>Relevant passage</SectionLabel>
          <blockquote className="mt-2 rounded-md border-l-2 border-brand bg-slate-50 px-4 py-3 text-sm leading-relaxed text-ink">
            “{ev.quote}”
          </blockquote>
          <p className="mt-1.5 text-[11px] text-steel">Exact quotation · {ev.label}</p>
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          <Btn variant="secondary" data-testid="copy-citation-btn" onClick={() => api.copyCitation(evidenceId)}>
            <Copy size={13} /> Copy citation
          </Btn>
          <Btn
            variant="secondary"
            data-testid="open-source-btn"
            onClick={() => toast('Source files are local to this prototype session.', { description: 'No external document store is connected in the demo.' })}
          >
            <ExternalLink size={13} /> Open source
          </Btn>
          <Btn variant="accent" data-testid="add-to-analysis-btn" onClick={() => api.addToAnalysis(evidenceId)}>
            <Plus size={13} /> Add to analysis
          </Btn>
        </div>
        <p className="text-[11px] text-slate-400">
          Source files are local to this prototype session. This is fictional demonstration material, not legal evidence.
        </p>
      </div>
    </Modal>
  );
};

export const Avatar = ({ label, tone }) => (
  <span
    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold ${
      tone === 'ai' ? 'bg-navy-900 text-white' : tone === 'system' ? 'bg-slate-200 text-steel' : 'bg-brand text-white'
    }`}
    aria-hidden="true"
  >
    {label}
  </span>
);
