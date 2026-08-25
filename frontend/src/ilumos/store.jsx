import React, { createContext, useContext, useEffect, useMemo, useReducer, useRef } from 'react';
import { toast } from 'sonner';
import { CASE_INFO, ELEMENTS, DEPENDENCIES, EVIDENCE, HERO_PROPOSAL, DEFAULT_RATIONALE, DEMO_DOCUMENTS } from './data';

const Ctx = createContext(null);
export const useStore = () => useContext(Ctx);

export const uid = () => (crypto.randomUUID ? crypto.randomUUID() : 'id-' + Math.random().toString(36).slice(2));
export const now = () => new Date().toISOString();

const cloneElements = () => ELEMENTS.map((e) => ({ ...e, evidenceIds: [...e.evidenceIds] }));

const initialState = {
  screen: 'setup', // setup | workspace | supervisor
  caseInfo: CASE_INFO,
  files: { claimChart: null, supporting: [], error: null },
  elements: cloneElements(),
  evidence: EVIDENCE,
  dependencies: DEPENDENCIES,
  messagesByElement: {},
  decisions: [],
  issues: [],
  pendingProposal: null, // {elementId, messageId, before, after, edited, evidenceIds, source}
  undoStack: [],
  processing: null, // {elementId, stages, index}
  selectedElement: null,
  modal: null, // {type, ...}
  reviewOpen: false,
  instructionsOpen: false,
  analysisExists: false,
  pendingChart: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET':
      return { ...state, ...action.patch };
    case 'TRANSFORM':
      return action.fn(state);
    default:
      return state;
  }
}

const elNum = (state, id) => state.elements.find((e) => e.id === id)?.num;

function detectIntent(text, element) {
  const t = text.toLowerCase();
  if (element.id === 'e2' && (t.includes('wrong') || t.includes('temperature sensor'))) return 'wrongevidence';
  if ((t.includes('prove') || t.includes('proving') || t.includes('establish')) && (t.includes('ml') || t.includes('machine learning'))) return 'noevidence';
  if (element.id === 'e3' && (t.includes('weak') || t.includes('strengthen') || t.includes('technical detail'))) return 'hero';
  if (t.includes('downstream') || t.includes('impact')) return 'impactinfo';
  return 'generic';
}

export function deriveMetrics(state) {
  const ready = state.elements.filter((e) => e.status === 'ready').length;
  const needsReview = state.elements.filter((e) => e.status === 'needs_review').length;
  const review = state.elements.filter((e) => e.status === 'review').length;
  const openIssues = state.issues.filter((i) => i.status === 'open');
  const openReviewEvents = state.decisions.filter((d) => d.type === 'review' && d.status === 'open');
  const evidenceGaps = state.elements.filter((e) => e.reasonTag === 'Evidence gap').length;
  const unsupported = state.decisions.filter((d) => d.type === 'unsupported_assertion' && d.status !== 'resolved').length;
  const refusalsHandled = state.decisions.filter((d) => d.type === 'ai_refusal' && d.status === 'handled').length;
  const highImpact = state.decisions.filter(
    (d) => d.type === 'reasoning_change' && d.status === 'accepted' && (d.affectedElements || []).length > 0
  );
  let nextAction;
  if (openIssues.length > 0) {
    const target = openIssues[0].elementIds[1];
    nextAction = { label: `Resolve Element ${elNum(state, target)}`, kind: 'resolve', issueId: openIssues[0].id };
  } else if (state.elements.some((e) => e.reasonTag === 'Evidence gap' && e.status !== 'ready')) {
    const gap = state.elements.find((e) => e.reasonTag === 'Evidence gap' && e.status !== 'ready');
    nextAction = { label: `Investigate Element ${gap.num}`, kind: 'investigate', elementId: gap.id };
  } else if (review > 0 || needsReview > 0) {
    const el = state.elements.find((e) => e.status !== 'ready');
    nextAction = { label: `Review Element ${el.num}`, kind: 'investigate', elementId: el.id };
  } else if (evidenceGaps > 0) {
    nextAction = { label: 'Review chart for remaining evidence gaps', kind: 'review' };
  } else {
    nextAction = { label: 'Chart ready for export', kind: 'export' };
  }
  return {
    ready, needsReview, review, total: state.elements.length,
    openDependencies: openIssues.length + review,
    openIssues: openIssues.length,
    openReviewEvents: openReviewEvents.length,
    evidenceGaps, unsupported, refusalsHandled, highImpact, nextAction,
  };
}

export function StoreProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const stateRef = useRef(state);
  stateRef.current = state;
  const timersRef = useRef([]);

  const clearTimers = () => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
  };
  const later = (fn, ms) => {
    const t = setTimeout(fn, ms);
    timersRef.current.push(t);
  };

  const api = useMemo(() => {
    const set = (patch) => dispatch({ type: 'SET', patch });
    const transform = (fn) => dispatch({ type: 'TRANSFORM', fn });

    const addDecision = (d) => ({ id: uid(), uuid: uid(), timestamp: now(), ...d });

    const openModal = (modal) => set({ modal });
    const closeModal = () => set({ modal: null });

    const addFileNow = (kind, file) => {
      const name = file.name;
      const ext = name.split('.').pop().toLowerCase();
      const size = file.size > 1024 * 1024 ? `${(file.size / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(file.size / 1024))} KB`;
      const meta = { id: uid(), name, size, ext: ext.toUpperCase(), status: 'uploading', progress: 10 };
      const files = { ...stateRef.current.files, error: null };
      if (kind === 'chart') files.claimChart = meta;
      else files.supporting = [...files.supporting, meta];
      set({ files });
      later(() => updateFile(meta.id, kind, { progress: 55 }), 400);
      later(() => updateFile(meta.id, kind, { progress: 100, status: 'indexing' }), 850);
      later(() => updateFile(meta.id, kind, { status: 'ready', progress: 100 }), 1700);
    };

    const addFile = (kind, file) => {
      const name = file.name;
      const ext = name.split('.').pop().toLowerCase();
      const allowed = kind === 'chart' ? ['xlsx', 'csv'] : ['pdf', 'docx', 'txt'];
      if (!allowed.includes(ext)) {
        set({ files: { ...stateRef.current.files, error: `"${name}" is not supported. Accepted: ${allowed.map((a) => '.' + a).join(', ')}.` } });
        toast.error('Unsupported file type', { description: `Accepted formats: ${allowed.map((a) => '.' + a).join(', ')}` });
        return;
      }
      if (kind === 'supporting' && stateRef.current.files.supporting.some((f) => f.name === name)) {
        toast('File already added.', { description: `"${name}" is already in the document set — keeping the existing file.` });
        return;
      }
      if (kind === 'chart' && stateRef.current.analysisExists) {
        set({ pendingChart: { kind: 'file', file }, modal: { type: 'confirmChart' } });
        return;
      }
      addFileNow(kind, file);
    };

    const confirmReplaceChart = (accept) => {
      const pending = stateRef.current.pendingChart;
      set({ pendingChart: null, modal: null });
      if (!accept || !pending) return;
      set({
        elements: cloneElements(), decisions: [], issues: [], messagesByElement: {},
        pendingProposal: null, undoStack: [], selectedElement: null, analysisExists: false,
      });
      if (pending.kind === 'demo') loadDemo();
      else addFileNow('chart', pending.file);
      toast('Claim chart replaced', { description: 'Chart-dependent analysis was reset. Supporting documents and the session were preserved.' });
    };

    const updateFile = (id, kind, patch) => {
      const files = { ...stateRef.current.files };
      if (kind === 'chart') {
        if (files.claimChart?.id === id) files.claimChart = { ...files.claimChart, ...patch };
      } else {
        files.supporting = files.supporting.map((f) => (f.id === id ? { ...f, ...patch } : f));
      }
      set({ files });
    };

    const removeFile = (id, kind) => {
      const files = { ...stateRef.current.files };
      if (kind === 'chart') files.claimChart = null;
      else files.supporting = files.supporting.filter((f) => f.id !== id);
      set({ files });
    };

    const loadDemo = () => {
      const chart = { id: uid(), name: 'US123456_claim_chart_demo.xlsx', size: '48 KB', ext: 'XLSX', status: 'uploading', progress: 10 };
      const docs = DEMO_DOCUMENTS.map((d, i) => ({
        id: uid(), name: d.name, size: `${220 + i * 87} KB`, ext: 'PDF', status: 'uploading', progress: 10, docType: d.type,
      }));
      set({ files: { claimChart: chart, supporting: docs, error: null } });
      later(() => {
        const files = { ...stateRef.current.files };
        if (files.claimChart) files.claimChart = { ...files.claimChart, progress: 100, status: 'indexing' };
        files.supporting = files.supporting.map((f) => ({ ...f, progress: 100, status: 'indexing' }));
        set({ files });
      }, 700);
      later(() => {
        const files = { ...stateRef.current.files };
        if (files.claimChart) files.claimChart = { ...files.claimChart, status: 'ready' };
        files.supporting = files.supporting.map((f) => ({ ...f, status: 'ready' }));
        set({ files });
      }, 1600);
      toast.success('Demo claim chart loaded', { description: '4 fictional Acme documents indexed for evidence search.' });
    };

    const useDemo = () => {
      if (stateRef.current.analysisExists) {
        set({ pendingChart: { kind: 'demo' }, modal: { type: 'confirmChart' } });
        return;
      }
      loadDemo();
    };

    const goToSetup = () => set({ screen: 'setup', modal: null, reviewOpen: false });
    const continueAnalysis = () => set({ screen: 'workspace', modal: null, reviewOpen: false });

    const startAnalysis = () => {
      set({ screen: 'workspace', analysisExists: true });
      toast.success('Analysis started', { description: '10 claim elements loaded from the claim chart.' });
    };

    const selectElement = (id) => set({ selectedElement: id, screen: stateRef.current.screen === 'supervisor' ? 'supervisor' : 'workspace' });

    const appendMsg = (elementId, msg) => {
      const map = { ...stateRef.current.messagesByElement };
      map[elementId] = [...(map[elementId] || []), { id: uid(), ts: now(), ...msg }];
      set({ messagesByElement: map });
    };
    const patchMsg = (elementId, id, patch) => {
      const map = { ...stateRef.current.messagesByElement };
      map[elementId] = (map[elementId] || []).map((m) => (m.id === id ? { ...m, ...patch } : m));
      set({ messagesByElement: map });
    };

    const sendMessage = (elementId, text) => {
      const s = stateRef.current;
      const element = s.elements.find((e) => e.id === elementId);
      if (!element || s.processing) return;
      appendMsg(elementId, { role: 'user', text });
      const intent = detectIntent(text, element);
      const stages =
        intent === 'wrongevidence'
          ? [`Correcting Element ${element.num} · ${element.name}`, 'Searching remaining uploaded documents…']
          : [`Reviewing Element ${element.num}`, 'Searching uploaded sources', 'Comparing evidence chains', 'Checking downstream impact'];
      clearTimers();
      set({ processing: { elementId, stages, index: 0 } });
      stages.forEach((_, i) => later(() => set({ processing: { elementId, stages, index: i } }), 650 * (i + 1)));
      later(() => {
        set({ processing: null });
        respond(intent, element, text);
      }, 650 * (stages.length + 1));
    };

    const respond = (intent, element) => {
      const s = stateRef.current;
      const eid = element.id;
      if (intent === 'hero') {
        const affected = s.dependencies.filter((d) => d.from === eid).map((d) => d.to);
        const msgId = uid();
        const map = { ...s.messagesByElement };
        map[eid] = [...(map[eid] || []), {
          id: msgId, ts: now(), role: 'ai', kind: 'proposal',
          structured: {
            finding: 'The available evidence supports learning behavior, not the specific implementation as machine learning.',
            evidenceIds: ['guide14', 'arch27'],
            interpretation: 'The product learns user temperature preferences over time and uses historical behavior in its adaptive prediction behavior.',
            limitation: 'No available source explicitly identifies the implementation as machine learning.',
            proposedAction: 'Replace the unsupported ML assertion with evidence-backed adaptive-learning language.',
            impact: 'Potential downstream effect on Elements 7 and 9.',
            strength: 'Medium',
          },
          proposal: { before: HERO_PROPOSAL.before, after: HERO_PROPOSAL.after, evidenceIds: [...HERO_PROPOSAL.evidenceIds] },
        }];
        const proposalDecision = addDecision({
          actor: 'ai', type: 'reasoning_proposal', elementId: eid,
          label: `Element ${element.num} · AI proposed refinement`,
          before: HERO_PROPOSAL.before, proposed: HERO_PROPOSAL.after,
          evidenceAdded: [...HERO_PROPOSAL.evidenceIds], affectedElements: affected, status: 'draft',
          reason: 'Evidence gap — ML implementation not disclosed in sources',
        });
        set({
          messagesByElement: map,
          pendingProposal: { elementId: eid, messageId: msgId, before: HERO_PROPOSAL.before, after: HERO_PROPOSAL.after, edited: null, evidenceIds: [...HERO_PROPOSAL.evidenceIds], source: 'ai' },
          decisions: [...s.decisions, proposalDecision],
        });
      } else if (intent === 'noevidence') {
        appendMsg(eid, {
          role: 'ai', kind: 'refusal',
          lines: [
            "I couldn't find sufficient evidence in the available documents to establish the requested technical detail. I won't infer an implementation that the sources do not disclose.",
            "I can't support 'the product definitely uses machine learning' from these sources.",
          ],
          options: ['Upload technical documentation', 'Provide product URL', 'Leave unresolved'],
        });
        const refusal = addDecision({
          actor: 'ai', type: 'ai_refusal', elementId: eid,
          label: `Element ${element.num} · AI declined to infer ML implementation`,
          status: 'open', reason: 'Insufficient evidence in uploaded sources',
        });
        set({ decisions: [...stateRef.current.decisions, refusal] });
      } else if (intent === 'wrongevidence') {
        appendMsg(eid, {
          role: 'ai', kind: 'correction',
          intro: "You're right. I removed that citation from the suggestion rather than relying on unsupported evidence.",
          evidenceIds: ['arch12'],
          correctionFor: eid,
        });
      } else if (intent === 'impactinfo') {
        const deps = s.dependencies.filter((d) => d.from === eid || d.to === eid);
        appendMsg(eid, {
          role: 'ai', kind: 'generic',
          structured: deps.length
            ? {
                finding: `Element ${element.num} participates in ${deps.length} modeled relationship${deps.length > 1 ? 's' : ''}.`,
                interpretation: deps.map((d) => `Element ${elNum(s, d.from)} → Element ${elNum(s, d.to)} · ${d.relationship} · shared concept: ${d.sharedConcept}`).join(' '),
                limitation: 'Relationships come from the chart dependency model, not an autonomous infringement analysis.',
              }
            : {
                finding: `No downstream dependencies are modeled for Element ${element.num}.`,
                interpretation: 'Reasoning changes here are not expected to affect other elements in the current chart.',
                limitation: 'The dependency model covers material reasoning relationships identified for this case.',
              },
        });
      } else {
        appendMsg(eid, {
          role: 'ai', kind: 'generic',
          structured: {
            finding: `Element ${element.num} (${element.name}) is mapped to ${element.mapping}. Current status: ${element.status === 'ready' ? 'Ready' : element.status === 'review' ? 'Review' : 'Needs Review'} · ${element.reasonTag}.`,
            evidenceIds: element.evidenceIds,
            interpretation: element.reasoning,
            limitation: 'Responses are deterministic prototype simulations scoped to the uploaded demo document set.',
          },
        });
      }
    };

    const saveProposalEdit = (elementId, text) => {
      const p = stateRef.current.pendingProposal;
      if (!p || p.elementId !== elementId) return;
      transform((s) => ({
        ...s,
        pendingProposal: { ...p, edited: text, source: 'analyst' },
        decisions: s.decisions.map((d) =>
          d.type === 'reasoning_proposal' && d.elementId === elementId && d.status === 'draft'
            ? { ...d, edited: text, label: d.label + ' · analyst edited' }
            : d
        ),
      }));
      openModal({ type: 'impact' });
    };

    const rejectProposal = (elementId) => {
      const p = stateRef.current.pendingProposal;
      if (!p || p.elementId !== elementId) return;
      patchMsg(elementId, p.messageId, { proposalState: 'rejected' });
      transform((s) => ({
        ...s,
        pendingProposal: null,
        decisions: s.decisions.map((d) =>
          d.type === 'reasoning_proposal' && d.elementId === elementId && d.status === 'draft'
            ? { ...d, status: 'rejected', label: d.label.replace('proposed refinement', 'proposal rejected by analyst') }
            : d
        ),
      }));
      toast('Proposal rejected', { description: 'Original reasoning preserved. The rejection is logged in decision history.' });
    };

    const applyProposal = () => {
      const p = stateRef.current.pendingProposal;
      if (!p) return;
      transform((s) => {
        const target = s.elements.find((e) => e.id === p.elementId);
        const deps = s.dependencies.filter((d) => d.from === p.elementId);
        const affected = deps.map((d) => d.to);
        const groupId = uid();
        const changeId = uid();
        const ts = now();
        const finalText = p.edited || p.after;
        const snapshot = {
          elements: s.elements.filter((e) => e.id === p.elementId || affected.includes(e.id)).map((e) => ({ ...e, evidenceIds: [...e.evidenceIds] })),
          decisionIds: [changeId], issueIds: [], label: `Element ${target.num} refinement`,
        };
        const issues = deps.map((d) => ({
          id: uid(), uuid: uid(), groupId, decisionId: changeId, timestamp: ts,
          elementIds: [p.elementId, d.to], sharedConcept: d.sharedConcept, sharedEvidence: [...d.sharedEvidence],
          relationship: d.relationship, reason: d.reason, status: 'open', rationale: null,
        }));
        snapshot.issueIds = issues.map((i) => i.id);
        const changeDecision = {
          id: changeId, uuid: uid(), groupId, timestamp: ts, actor: 'analyst', type: 'reasoning_change',
          elementId: p.elementId,
          label: `Element ${target.num} · Analyst ${p.source === 'analyst' ? 'edited' : 'accepted'} refinement`,
          before: p.before, proposed: p.after, edited: p.edited, evidenceAdded: [...p.evidenceIds],
          affectedElements: affected, dependencySnapshot: deps.map((d) => ({ ...d })),
          openIssues: issues.map((i) => i.id), status: 'accepted',
          reason: 'Unsupported assertion replaced with evidence-backed language',
        };
        const impactDecision = {
          id: uid(), uuid: uid(), groupId, timestamp: ts, actor: 'system', type: 'impact_detected',
          elementId: p.elementId,
          label: `Potential reasoning dependency detected · Elements ${affected.map((a) => elNum(s, a)).join(', ')} flagged`,
          affectedElements: affected, dependencySnapshot: deps.map((d) => ({ ...d })),
          openIssues: issues.map((i) => i.id), status: 'open',
          reason: 'Dependency model match on shared concept and shared evidence chain',
        };
        snapshot.decisionIds.push(impactDecision.id);
        const elements = s.elements.map((e) => {
          if (e.id === p.elementId) {
            return { ...e, reasoning: finalText, evidenceIds: [...p.evidenceIds], version: e.version + 1, status: 'ready', reasonTag: p.source === 'analyst' ? 'Analyst edited' : 'Evidence-backed', impactedBy: null };
          }
          if (affected.includes(e.id)) {
            return { ...e, status: 'needs_review', reasonTag: 'Review dependency', impactedBy: { from: p.elementId, decisionId: changeId } };
          }
          return e;
        });
        const map = { ...s.messagesByElement };
        map[p.elementId] = (map[p.elementId] || []).map((m) => (m.id === p.messageId ? { ...m, proposalState: 'applied' } : m));
        const decisions = s.decisions.map((d) =>
          d.type === 'reasoning_proposal' && d.elementId === p.elementId && d.status === 'draft' ? { ...d, status: 'accepted' } : d
        );
        return {
          ...s, elements, messagesByElement: map,
          decisions: [...decisions, changeDecision, impactDecision],
          issues: [...s.issues, ...issues],
          undoStack: [...s.undoStack, snapshot],
          pendingProposal: null, modal: null,
        };
      });
      const s = stateRef.current;
      toast.success(`Element ${elNum(s, p.elementId)} refined`, {
        description: 'Reasoning updated to v2 · 2 elements flagged for review · decision history recorded.',
      });
    };

    const undoLast = () => {
      const stack = stateRef.current.undoStack;
      if (!stack.length) return;
      const snap = stack[stack.length - 1];
      transform((s) => {
        const restore = new Map(snap.elements.map((e) => [e.id, e]));
        const elements = s.elements.map((e) => (restore.has(e.id) ? { ...restore.get(e.id), evidenceIds: [...restore.get(e.id).evidenceIds] } : e));
        const decisions = s.decisions.map((d) => (snap.decisionIds.includes(d.id) ? { ...d, status: 'undone' } : d));
        const undoDecision = {
          id: uid(), uuid: uid(), timestamp: now(), actor: 'analyst', type: 'reasoning_change',
          elementId: snap.elements[0].id, label: `Undo performed · ${snap.label} reverted`,
          before: null, proposed: null, evidenceAdded: [], affectedElements: snap.elements.slice(1).map((e) => e.id),
          status: 'undone', reason: 'Analyst restored previous reasoning, evidence, status and reason tag',
        };
        const issues = s.issues.filter((i) => !snap.issueIds.includes(i.id));
        return { ...s, elements, decisions: [...decisions, undoDecision], issues, undoStack: s.undoStack.slice(0, -1) };
      });
      toast.success('Undo performed', { description: 'Previous reasoning, evidence and status restored. Dependencies recalculated.' });
    };

    const resolveIssue = (issueId, rationale) => {
      transform((s) => {
        const issue = s.issues.find((i) => i.id === issueId);
        if (!issue) return s;
        const [fromId, toId] = issue.elementIds;
        const ts = now();
        const resolution = {
          id: uid(), uuid: uid(), groupId: issue.groupId, timestamp: ts, actor: 'analyst', type: 'review_resolution',
          elementId: toId,
          label: `Element ${elNum(s, fromId)} ↔ Element ${elNum(s, toId)} reconciled with rationale`,
          affectedElements: [fromId, toId], status: 'resolved', reason: rationale,
        };
        const siblingIssues = s.issues.filter((i) => i.groupId === issue.groupId && i.id !== issueId && i.status === 'open');
        const resolvedIds = [toId, ...siblingIssues.map((i) => i.elementIds[1])];
        const elements = s.elements.map((e) =>
          resolvedIds.includes(e.id) ? { ...e, status: 'ready', reasonTag: 'Evidence-backed', impactedBy: null } : e
        );
        const issues = s.issues.map((i) =>
          i.groupId === issue.groupId
            ? { ...i, status: 'resolved', rationale: i.id === issueId ? rationale : i.rationale || 'Resolved together with the primary dependency.' }
            : i
        );
        const decisions = s.decisions.map((d) =>
          d.groupId === issue.groupId && d.type === 'impact_detected' ? { ...d, status: 'resolved', openIssues: [] } : d
        );
        return { ...s, elements, issues, decisions: [...decisions, resolution], modal: null };
      });
      const m = deriveMetrics(stateRef.current);
      toast.success('Issue resolved', {
        description: `${m.ready}/${m.total} elements ready · ${m.openDependencies} open dependencies.`,
      });
    };

    const reopenElement = (issueId) => {
      transform((s) => {
        const issue = s.issues.find((i) => i.id === issueId);
        if (!issue) return s;
        const toId = issue.elementIds[1];
        const elements = s.elements.map((e) => (e.id === toId ? { ...e, status: 'review', reasonTag: 'Review dependency' } : e));
        const reopen = {
          id: uid(), uuid: uid(), groupId: issue.groupId, timestamp: now(), actor: 'analyst', type: 'review',
          elementId: toId, label: `Element ${elNum(s, toId)} reopened for review`, status: 'open',
          reason: 'Analyst requested deeper review before reconciliation',
        };
        return { ...s, elements, decisions: [...s.decisions, reopen], modal: null };
      });
      toast('Element reopened', { description: 'The element is back in review state. The dependency issue remains open.' });
    };

    const handleCorrection = (elementId, useSource) => {
      transform((s) => {
        const elements = s.elements.map((e) =>
          e.id === elementId && useSource ? { ...e, evidenceIds: ['arch12'], reasonTag: 'Evidence-backed', version: e.version + 1 } : e
        );
        const map = { ...s.messagesByElement };
        map[elementId] = (map[elementId] || []).map((m) =>
          m.kind === 'correction' && !m.resolved ? { ...m, resolved: useSource ? 'used' : 'kept' } : m
        );
        const correction = {
          id: uid(), uuid: uid(), timestamp: now(), actor: 'analyst', type: 'evidence_correction', elementId,
          label: useSource
            ? `Element ${elNum(s, elementId)} citation corrected → Technical Architecture p.12`
            : `Element ${elNum(s, elementId)} correction declined · original source kept`,
          evidenceAdded: useSource ? ['arch12'] : [], status: 'handled',
          reason: 'Analyst flagged that the prior citation described the temperature sensor, not the motion sensor',
        };
        return { ...s, elements, messagesByElement: map, decisions: [...s.decisions, correction] };
      });
      if (useSource) toast.success('Source updated', { description: 'Element 2 now cites Acme Technical Architecture · p.12. Correction logged.' });
      else toast('Original source kept', { description: 'The correction suggestion was declined. Decision logged.' });
    };

    const handleRefusalOption = (elementId, option) => {
      if (option === 'Upload technical documentation') {
        toast('Upload from the Documents panel', { description: 'Add technical documentation to expand the searchable evidence set.' });
      } else if (option === 'Provide product URL') {
        toast('Not available in this prototype', { description: 'URL ingestion is out of scope for the demo. Upload documents instead.' });
      }
      transform((s) => {
        const decisions = s.decisions.map((d) => (d.type === 'ai_refusal' && d.elementId === elementId && d.status === 'open' ? { ...d, status: 'handled' } : d));
        const map = { ...s.messagesByElement };
        map[elementId] = (map[elementId] || []).map((m) =>
          m.kind === 'refusal' && !m.handled ? { ...m, handled: option } : m
        );
        if (option === 'Leave unresolved') {
          const reviewEvent = {
            id: uid(), uuid: uid(), timestamp: now(), actor: 'analyst', type: 'review', elementId,
            label: `Element ${elNum(s, elementId)} · insufficient evidence left unresolved`, status: 'open',
            reason: 'No available source establishes the requested technical detail',
          };
          return { ...s, decisions: [...decisions, reviewEvent], messagesByElement: map };
        }
        return { ...s, decisions, messagesByElement: map };
      });
      if (option === 'Leave unresolved') toast('Marked as unresolved', { description: 'An open review event was recorded. This is not an unsupported AI assertion.' });
    };

    const addToAnalysis = (evidenceId, elementId) => {
      const ev = EVIDENCE[evidenceId];
      const target = elementId || stateRef.current.selectedElement || 'e3';
      appendMsg(target, { role: 'note', text: `Citation added to analysis notes · ${ev.label} — “${ev.quote}”` });
      closeModal();
      toast.success('Added to analysis', { description: `${ev.label} attached to Element ${elNum(stateRef.current, target)} notes.` });
    };

    const copyCitation = (evidenceId) => {
      const ev = EVIDENCE[evidenceId];
      const text = `${ev.title}, p. ${ev.page} — “${ev.quote}” (iLumos demo citation, fictional data)`;
      if (navigator.clipboard) navigator.clipboard.writeText(text).catch(() => {});
      toast.success('Citation copied', { description: ev.label });
    };

    const runNextAction = () => {
      const m = deriveMetrics(stateRef.current);
      const na = m.nextAction;
      if (na.kind === 'resolve') {
        set({ reviewOpen: true });
      } else if (na.kind === 'investigate') {
        set({ selectedElement: na.elementId, screen: 'workspace' });
      } else if (na.kind === 'review') {
        set({ reviewOpen: true });
      } else {
        openModal({ type: 'export' });
      }
    };

    return {
      set, openModal, closeModal, addFile, removeFile, useDemo, startAnalysis, selectElement,
      sendMessage, saveProposalEdit, rejectProposal, applyProposal, undoLast,
      resolveIssue, reopenElement, handleCorrection, handleRefusalOption,
      addToAnalysis, copyCitation, runNextAction,
      goToSetup, continueAnalysis, confirmReplaceChart,
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const h = state.reviewOpen ? '#review' : state.screen === 'workspace' ? '#workspace' : state.screen === 'supervisor' ? '#supervisor' : '#setup';
    if (window.location.hash !== h) window.location.hash = h;
  }, [state.screen, state.reviewOpen]);

  useEffect(() => {
    const onHash = () => {
      const h = window.location.hash;
      const reviewOpen = h === '#review';
      let screen = h === '#workspace' || reviewOpen ? 'workspace' : h === '#supervisor' ? 'supervisor' : 'setup';
      const cur = stateRef.current;
      if ((screen === 'workspace' || screen === 'supervisor') && !cur.analysisExists) screen = 'setup';
      if (cur.screen !== screen || cur.reviewOpen !== reviewOpen || cur.modal) {
        dispatch({ type: 'SET', patch: { screen, reviewOpen, modal: null } });
      }
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  const value = useMemo(() => ({ state, api }), [state, api]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export { DEFAULT_RATIONALE };
