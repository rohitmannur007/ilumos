import React, { useState } from 'react';
import { Download, CheckCircle2, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { useStore, deriveMetrics } from '../store';
import { Modal, Btn } from './bits';

// The docx UMD build is vendored at public/vendor/docx.umd.js and lazy-loaded
// only when exporting, keeping the main bundle lean.
let docxLibPromise = null;
const loadDocx = () => {
  if (window.docx?.Packer) return Promise.resolve(window.docx);
  if (!docxLibPromise) {
    docxLibPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = `${process.env.PUBLIC_URL}/vendor/docx.umd.js`;
      s.onload = () => (window.docx?.Packer ? resolve(window.docx) : reject(new Error('docx library failed to initialize')));
      s.onerror = () => reject(new Error('docx library failed to load'));
      document.head.appendChild(s);
    });
  }
  return docxLibPromise;
};

function buildDocx(state, m, dx) {
  const { Document, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell, WidthType } = dx;
  const P = (text, opts = {}) => new Paragraph({ children: [new TextRun({ text, size: 20, ...opts })] });
  const H = (text) => new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 280, after: 120 }, children: [new TextRun({ text, bold: true, color: '16406B', size: 26 })] });
  const spacer = () => new Paragraph({ children: [] });
  const colW = (n) => ({ size: Math.round(100 / n), type: WidthType.PERCENTAGE });
  const hcell = (t, n) =>
    new TableCell({ width: colW(n), shading: { fill: '0B2239' }, children: [new Paragraph({ children: [new TextRun({ text: t, bold: true, color: 'FFFFFF', size: 18 })] })] });
  const cell = (content, n) =>
    new TableCell({ width: colW(n), children: Array.isArray(content) ? content : [P(content)] });
  const evParas = (ids) =>
    ids.length
      ? ids.map((id) => { const e = state.evidence[id]; return P(`${e.title}, p.${e.page} (${e.evidenceType}): "${e.quote}"`); })
      : [P('No source linked', { italics: true })];
  const statusOf = (e) => `${e.status === 'ready' ? 'Ready' : e.status === 'review' ? 'Review' : 'Needs Review'} · ${e.reasonTag} · v${e.version}`;
  const elementsTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ tableHeader: true, children: ['Claim element', 'Mapped product feature', 'Final reasoning', 'Evidence', 'Review status'].map((c) => hcell(c, 5)) }),
      ...state.elements.map(
        (e) =>
          new TableRow({
            children: [
              cell([P(`Element ${e.num} · ${e.name}`, { bold: true }), P(e.claim)], 5),
              cell(e.mapping, 5),
              cell(e.reasoning, 5),
              cell(evParas(e.evidenceIds), 5),
              cell(statusOf(e), 5),
            ],
          })
      ),
    ],
  });
  const decisionsTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({ tableHeader: true, children: ['Time', 'Actor', 'Type', 'Decision', 'Status', 'Reason / rationale'].map((c) => hcell(c, 6)) }),
      ...state.decisions.map(
        (d) =>
          new TableRow({
            children: [
              cell(new Date(d.timestamp).toLocaleString(), 6),
              cell(d.actor, 6),
              cell(d.type.replace(/_/g, ' '), 6),
              cell(d.label, 6),
              cell(d.status, 6),
              cell(d.reason || d.rationale || '—', 6),
            ],
          })
      ),
    ],
  });
  const rationale = state.issues.filter((i) => i.status === 'resolved' && i.rationale);
  return new Document({
    creator: 'iLumos prototype',
    title: 'iLumos Final Claim Chart',
    description: 'Fictional demonstration data — not legal advice.',
    sections: [
      {
        children: [
          new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { after: 160 }, children: [new TextRun({ text: 'iLumos — Final Claim Chart', bold: true, color: '0B2239', size: 36 })] }),
          P(`Case: ${state.caseInfo.title}    Patent: ${state.caseInfo.patent}    Accused product: ${state.caseInfo.accusedProduct}`, { bold: true }),
          P(`Analyst: ${state.caseInfo.analyst}    Supervisor: ${state.caseInfo.supervisor}    Generated: ${new Date().toLocaleString()}`),
          P(`Review summary: ${m.ready}/${m.total} elements ready · ${m.openDependencies} open dependencies · ${m.unsupported} unsupported AI assertions · ${m.refusalsHandled} evidence limitation(s) handled.`),
          H('Claim elements'),
          elementsTable,
          H('Decision history (provenance)'),
          decisionsTable,
          H('Reviewer rationale / acknowledgement'),
          ...(rationale.length
            ? rationale.map((i) => P(`• Elements ${i.elementIds.map((id) => state.elements.find((e) => e.id === id)?.num).join(' ↔ ')}: "${i.rationale}"`))
            : [P('No recorded reviewer rationale.', { italics: true })]),
          spacer(),
          P('Generated by the iLumos prototype. Fictional demonstration data — US123456 vs Acme Thermostat is not a real matter. This document does not constitute legal advice or a legal conclusion.', { italics: true, color: '777777', size: 16 }),
        ],
      },
    ],
  });
}

export default function ExportModal() {
  const { state, api } = useStore();
  const m = deriveMetrics(state);
  const [phase, setPhase] = useState('idle');
  const evidenceLinked = state.elements.filter((e) => e.evidenceIds.length > 0).length;
  const reviewedHighImpact = m.highImpact.filter((d) => !state.issues.some((i) => i.decisionId === d.id && i.status === 'open')).length;

  const doExport = async (acknowledged) => {
    setPhase('working');
    try {
      const dx = await loadDocx();
      const blob = await dx.Packer.toBlob(buildDocx(state, m, dx));
      await new Promise((r) => setTimeout(r, 900));
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'iLumos_US123456_vs_Acme_Thermostat_Final_Chart.docx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setPhase('done');
      toast.success('Final claim chart exported', {
        description: `Word document (.docx) · ${m.ready}/${m.total} elements ready${acknowledged ? ' · exported with acknowledgement' : ''}.`,
      });
    } catch (err) {
      setPhase('idle');
      toast.error('Export failed', { description: String(err?.message || err) });
    }
  };

  const summary = [
    ['Claim elements', `${m.total}`],
    ['Evidence-linked', `${evidenceLinked}/${m.total}`],
    ['High-impact decisions reviewed', `${reviewedHighImpact}/${m.highImpact.length}`],
    ['Open issues', `${m.openIssues}`],
    ['Unsupported AI assertions', `${m.unsupported}`],
  ];

  return (
    <Modal title="Export Final Claim Chart" subtitle="The export reflects the current chart state, decision history and provenance." onClose={api.closeModal} testid="export-modal">
      <div className="space-y-4">
        <ul className="divide-y divide-slate-100 rounded-lg border border-slate-200">
          {summary.map(([k, v]) => (
            <li key={k} className="flex items-center justify-between px-4 py-2.5 text-[13px]">
              <span className="text-steel">{k}</span>
              <span className="font-semibold text-ink" data-testid={`export-stat-${k.toLowerCase().replace(/\s+/g, '-')}`}>{v}</span>
            </li>
          ))}
        </ul>

        {m.openIssues > 0 ? (
          <div className="rounded-md border border-warn-border bg-warn-bg px-4 py-3" data-testid="export-warning">
            <p className="flex items-center gap-1.5 text-[13px] font-medium text-warn-text">
              <AlertTriangle size={14} /> {m.openIssues} open issue{m.openIssues > 1 ? 's' : ''} remain{m.openIssues > 1 ? '' : 's'} unresolved.
            </p>
            <p className="mt-1 text-[12px] text-ink">Exporting now will include open dependencies in the final chart. Review them first, or export with acknowledgement.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Btn variant="secondary" data-testid="export-review-issue-btn" onClick={() => { api.closeModal(); api.set({ reviewOpen: true }); }}>
                Review issue
              </Btn>
              <Btn variant="primary" data-testid="export-ack-btn" disabled={phase === 'working'} onClick={() => doExport(true)}>
                Export with acknowledgement
              </Btn>
            </div>
          </div>
        ) : (
          <div className="rounded-md border border-ok-border bg-ok-bg px-4 py-3" data-testid="export-clean">
            <p className="flex items-center gap-1.5 text-[13px] font-medium text-ok-text">
              <CheckCircle2 size={14} /> No open chart-level review issues.
            </p>
            <Btn variant="primary" className="mt-3" data-testid="export-final-btn" disabled={phase === 'working'} onClick={() => doExport(false)}>
              <Download size={13} /> Export Final Claim Chart
            </Btn>
          </div>
        )}

        {phase === 'working' && (
          <div data-testid="export-progress">
            <div className="h-1.5 w-full overflow-hidden rounded bg-slate-100">
              <div className="h-full rounded bg-navy-900" style={{ animation: 'ilumos-progress 1s ease-out forwards' }} />
            </div>
            <p className="mt-1.5 text-[11px] text-steel">Compiling chart, decision history and provenance…</p>
          </div>
        )}
        {phase === 'done' && <p className="text-[12px] font-medium text-ok-text" data-testid="export-done">Download started — check your downloads folder.</p>}

        <p className="text-[11px] leading-relaxed text-slate-400">
          Format: Microsoft Word document (.docx) — a real Office Open XML file. It opens in Microsoft Word, LibreOffice and Google Docs.
        </p>
      </div>
    </Modal>
  );
}
