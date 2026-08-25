import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Scale, Info, Upload, FileSpreadsheet, FileText, X, CheckCircle2, Loader2, ChevronDown, ShieldCheck, ArrowRight } from 'lucide-react';
import { useStore } from '../store';
import { AI_INSTRUCTIONS } from '../data';
import { Btn, Modal } from './bits';

export const ConfirmChartModal = () => {
  const { state, api } = useStore();
  const name = state.pendingChart?.kind === 'demo' ? 'US123456_claim_chart_demo.xlsx' : state.pendingChart?.file?.name;
  return (
    <Modal title="Replace claim chart?" onClose={() => api.confirmReplaceChart(false)} testid="confirm-chart-modal">
      <p className="text-[13px] leading-relaxed text-ink">
        This will change the claim-element source for this case. Existing analysis decisions may no longer match the new chart.
      </p>
      {name && (
        <p className="mt-2 text-xs text-steel">
          New chart: <span className="font-medium text-ink">{name}</span>
        </p>
      )}
      <p className="mt-2 text-[11px] text-slate-400">Supporting documents and the overall session are preserved.</p>
      <div className="mt-4 flex gap-2">
        <Btn variant="secondary" data-testid="cancel-replace-chart-btn" onClick={() => api.confirmReplaceChart(false)}>Cancel</Btn>
        <Btn variant="primary" data-testid="confirm-replace-chart-btn" onClick={() => api.confirmReplaceChart(true)}>Replace</Btn>
      </div>
    </Modal>
  );
};

const FileRow = ({ file, kind }) => {
  const { api } = useStore();
  return (
    <div data-testid={`file-row-${file.id}`} className="flex items-center gap-3 rounded-md border border-slate-200 bg-white px-3 py-2.5 anim-fade-up">
      {file.ext === 'XLSX' || file.ext === 'CSV' ? <FileSpreadsheet size={16} className="text-navy-700" /> : <FileText size={16} className="text-navy-700" />}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-xs font-medium text-ink">{file.name}</span>
          <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-steel">{file.ext}</span>
          <span className="text-[10px] text-slate-400">{file.size}</span>
        </div>
        {file.status === 'uploading' && (
          <div className="mt-1.5" data-testid={`upload-progress-${file.id}`}>
            <div className="h-1 w-full overflow-hidden rounded bg-slate-100">
              <div className="h-full rounded bg-brand transition-all duration-500" style={{ width: `${file.progress}%` }} />
            </div>
            <p className="mt-1 text-[10px] text-steel">Uploading…</p>
          </div>
        )}
        {file.status === 'indexing' && (
          <p className="mt-1 flex items-center gap-1 text-[10px] text-steel anim-pulse-soft" data-testid={`indexing-${file.id}`}>
            <Loader2 size={10} className="animate-spin" /> Indexing for evidence search…
          </p>
        )}
        {file.status === 'ready' && (
          <p className="mt-1 flex items-center gap-1 text-[10px] font-medium text-ok-text" data-testid={`ready-${file.id}`}>
            <CheckCircle2 size={10} /> Ready for evidence search
          </p>
        )}
      </div>
      <button
        data-testid={`remove-file-${file.id}`}
        onClick={() => api.removeFile(file.id, kind)}
        aria-label={`Remove ${file.name}`}
        className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-danger-text transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  );
};

const UploadCard = ({ kind, title, accept, acceptLabel, testid, children }) => {
  const { state, api } = useStore();
  const inputRef = useRef(null);
  const files = kind === 'chart' ? (state.files.claimChart ? [state.files.claimChart] : []) : state.files.supporting;
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-ink">{title}</h3>
        <span className="text-[10px] uppercase tracking-wide text-steel">Accepts {acceptLabel}</span>
      </div>
      <input
        ref={inputRef}
        type="file"
        hidden
        accept={accept}
        multiple={kind === 'supporting'}
        data-testid={testid + '-input'}
        onChange={(e) => {
          Array.from(e.target.files || []).forEach((f) => api.addFile(kind, f));
          e.target.value = '';
        }}
      />
      <div className="mt-3 flex flex-wrap gap-2">
        <Btn variant="secondary" data-testid={testid} onClick={() => inputRef.current?.click()}>
          <Upload size={13} /> {kind === 'chart' ? 'Upload claim chart' : 'Upload supporting documents'}
        </Btn>
        {children}
      </div>
      <div className="mt-3 space-y-2">
        {files.map((f) => (
          <FileRow key={f.id} file={f} kind={kind} />
        ))}
        {files.length === 0 && <p className="text-xs text-slate-400">No files added yet.</p>}
      </div>
    </div>
  );
};

const MaskedLine = ({ children, delay = 0 }) => (
  <span className="block overflow-hidden pb-1.5 -mb-1.5">
    <motion.span
      className="block"
      initial={{ y: '112%' }}
      animate={{ y: '0%' }}
      transition={{ delay, duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.span>
  </span>
);

const ThermostatSVG = () => (
  <svg viewBox="0 0 260 190" className="mx-auto w-full max-w-[260px]" role="img" aria-label="Fictional Acme Thermostat product visualization">
    <defs>
      <linearGradient id="dev-body" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="#FBFCFE" />
        <stop offset="100%" stopColor="#DDE5EE" />
      </linearGradient>
    </defs>
    <rect x="55" y="30" width="150" height="128" rx="26" fill="url(#dev-body)" stroke="#9DB2C8" strokeWidth="1.2" />
    <circle cx="130" cy="88" r="40" fill="#0B2239" />
    {Array.from({ length: 24 }).map((_, i) => {
      const a = (i / 24) * Math.PI * 2;
      const inner = 46, outer = i % 6 === 0 ? 54 : 51;
      return (
        <line
          key={i}
          x1={130 + Math.cos(a) * inner} y1={88 + Math.sin(a) * inner}
          x2={130 + Math.cos(a) * outer} y2={88 + Math.sin(a) * outer}
          stroke="#5B7186" strokeWidth={i % 6 === 0 ? 1.6 : 0.8} opacity={0.75}
        />
      );
    })}
    <circle cx="130" cy="88" r="46" fill="none" stroke="#22364C" strokeWidth="2" />
    <circle
      cx="130" cy="88" r="46" fill="none" stroke="#C98A2D" strokeWidth="2.5" strokeLinecap="round"
      strokeDasharray="289" strokeDashoffset="87" transform="rotate(-90 130 88)"
    />
    <text x="130" y="92" textAnchor="middle" fontSize="21" fontWeight="700" fill="#FFFFFF" fontFamily="Inter, sans-serif">21.5°</text>
    <text x="130" y="107" textAnchor="middle" fontSize="6.5" letterSpacing="1.6" fill="#8FA6BD" fontFamily="Inter, sans-serif">AUTO-SCHEDULE</text>
    <g stroke="#C98A2D" strokeWidth="1.6" fill="none" strokeLinecap="round">
      <path d="M 176 46 a 10 10 0 0 1 9 5" />
      <path d="M 179 41 a 16 16 0 0 1 14 8" />
      <circle cx="173" cy="53" r="1.8" fill="#C98A2D" stroke="none" />
    </g>
    <circle cx="84" cy="141" r="2.2" fill="#2F7D5B" />
    <text x="92" y="144.5" fontSize="6.5" letterSpacing="1.2" fill="#5B7186" fontFamily="Inter, sans-serif">OCCUPANCY · PIR</text>
    <text x="130" y="176" textAnchor="middle" fontSize="8" letterSpacing="3.2" fill="#8FA6BD" fontFamily="Inter, sans-serif">ACME</text>
  </svg>
);

const ThermostatCard = () => {
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(my, [0, 1], [5, -5]), { stiffness: 120, damping: 18 });
  const rotateY = useSpring(useTransform(mx, [0, 1], [-7, 7]), { stiffness: 120, damping: 18 });
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4, duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      style={{ perspective: 900 }}
      onMouseMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set((e.clientX - r.left) / r.width);
        my.set((e.clientY - r.top) / r.height);
      }}
      onMouseLeave={() => { mx.set(0.5); my.set(0.5); }}
      className="relative hidden lg:block"
      data-testid="product-visual"
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="relative overflow-hidden rounded-xl border border-navy-700 bg-navy-900 px-6 pb-5 pt-8 shadow-2xl"
      >
        <div className="pointer-events-none absolute -top-28 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(37,99,235,0.32),transparent_70%)]" aria-hidden="true" />
        <div style={{ transform: 'translateZ(34px)' }}>
          <ThermostatSVG />
        </div>
        <p className="relative mt-2 border-t border-navy-700 pt-3 text-[10px] leading-relaxed tracking-wide text-[#8FA6BD]">
          ACME THERMOSTAT — fictional product visualization for the demo evidence context. Not a real product.
        </p>
      </motion.div>
    </motion.div>
  );
};

export default function SetupScreen() {
  const { state, api } = useStore();
  const ready = state.files.claimChart?.status === 'ready';
  return (
    <div className="min-h-screen bg-slate-100" data-testid="case-setup-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-navy-900 text-white" aria-hidden="true">
              <Scale size={16} />
            </span>
            <div className="leading-tight">
              <div className="text-sm font-semibold text-ink">iLumos</div>
              <div className="text-[10px] uppercase tracking-[0.12em] text-steel">Claim Review Intelligence</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {state.analysisExists && (
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-ok-border bg-ok-bg px-2.5 py-1 text-[11px] font-medium text-ok-text" data-testid="session-active-badge">
                <span className="h-1.5 w-1.5 rounded-full bg-ok-text" aria-hidden="true" /> Session active
              </span>
            )}
            <span className="hidden sm:block text-xs text-steel">New Claim Analysis</span>
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

      <main className="mx-auto max-w-6xl px-6 py-10 sm:py-14">
        <div className="grid items-center gap-10 lg:grid-cols-[1.25fr_1fr]">
          <div>
            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.5 }}
              className="text-[11px] font-semibold uppercase tracking-[0.16em] text-steel"
            >
              {state.caseInfo.title} · fictional demo case
            </motion.p>
            <h1 className="mt-3 text-4xl font-semibold leading-[1.04] tracking-tight text-ink sm:text-6xl">
              <MaskedLine delay={0.16}>Start a Claim</MaskedLine>
              <MaskedLine delay={0.3}><span className="text-navy-700">Analysis.</span></MaskedLine>
            </h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.55 }}
              className="mt-4 max-w-xl text-sm leading-relaxed text-steel sm:text-base"
            >
              Upload your claim chart and supporting technical material to begin evidence-backed review.
            </motion.p>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.68, duration: 0.6 }}
              className="mt-3 text-[11px] font-medium uppercase tracking-[0.12em] text-navy-700"
            >
              Evidence-aware refinement · Cross-element reasoning impact · Supervisor provenance
            </motion.p>
          </div>
          <ThermostatCard />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.62, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className="mt-10 grid gap-4 md:grid-cols-2"
        >
          <UploadCard kind="chart" title="Claim chart" accept=".xlsx,.csv" acceptLabel=".xlsx · .csv" testid="upload-claim-chart-btn">
            <Btn variant="accent" data-testid="use-demo-chart-btn" onClick={api.useDemo}>
              Use demo claim chart
            </Btn>
          </UploadCard>
          <UploadCard kind="supporting" title="Supporting documents" accept=".pdf,.docx,.txt" acceptLabel=".pdf · .docx · .txt" testid="upload-supporting-btn" />
        </motion.div>

        {state.files.error && (
          <p data-testid="file-error" className="mt-3 rounded-md border border-danger-border bg-danger-bg px-3 py-2 text-xs font-medium text-danger-text anim-fade-up">
            {state.files.error}
          </p>
        )}

        <div className="mt-6 rounded-lg border border-slate-200 bg-white">
          <button
            data-testid="ai-instructions-toggle"
            onClick={() => api.set({ instructionsOpen: !state.instructionsOpen })}
            aria-expanded={state.instructionsOpen}
            className="flex w-full items-center justify-between px-4 py-3 text-left"
          >
            <span className="flex items-center gap-2 text-sm font-medium text-ink">
              <ShieldCheck size={15} className="text-navy-700" /> AI Instructions
              <span className="rounded-full bg-navy-50 border border-navy-100 px-2 py-0.5 text-[10px] font-medium text-navy-700">Editable instructions</span>
            </span>
            <ChevronDown size={15} className={`text-steel transition-transform ${state.instructionsOpen ? 'rotate-180' : ''}`} />
          </button>
          {state.instructionsOpen && (
            <div className="border-t border-slate-200 px-4 py-3 anim-fade-in" data-testid="ai-instructions-panel">
              <ul className="space-y-1.5">
                {AI_INSTRUCTIONS.map((line, i) => (
                  <li key={i} className="flex items-start gap-2 text-[13px] text-ink">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-brand" aria-hidden="true" />
                    {line}
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-[11px] text-slate-400">
                Runtime behavior is deterministic in this prototype; these instructions describe the governing review policy.
              </p>
            </div>
          )}
        </div>

        <div className="mt-8 flex items-center gap-4">
          {state.analysisExists ? (
            <>
              <Btn
                variant="primary"
                data-testid="continue-analysis-btn"
                title="Continue analysis (Esc)"
                onClick={api.continueAnalysis}
                className="px-5 py-2.5 text-sm"
              >
                Continue analysis <ArrowRight size={14} />
              </Btn>
              <span className="text-xs text-steel">
                Returns to your existing workspace — decisions, chat, review state and files are preserved.
              </span>
            </>
          ) : (
            <>
              <Btn
                variant="primary"
                data-testid="start-analysis-btn"
                disabled={!ready}
                onClick={api.startAnalysis}
                className="px-5 py-2.5 text-sm"
              >
                Start analysis
              </Btn>
              {!ready && <span className="text-xs text-steel">Load a claim chart to begin — the demo chart is one click.</span>}
            </>
          )}
        </div>

        <p className="mt-10 border-t border-slate-200 pt-4 text-[11px] leading-relaxed text-slate-400">
          Demonstration case <span className="font-medium text-steel">US123456 vs Acme Thermostat</span> uses entirely fictional
          data. Acme Thermostat is not a real product and nothing here constitutes legal evidence or legal advice.
        </p>
      </main>
    </div>
  );
}
