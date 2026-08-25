import React, { useEffect } from 'react';
import Lenis from 'lenis';
import '@/App.css';
import { Toaster } from 'sonner';
import { StoreProvider, useStore } from '@/ilumos/store';
import SetupScreen, { ConfirmChartModal } from '@/ilumos/components/SetupScreen';
import Workspace from '@/ilumos/components/Workspace';
import SupervisorView from '@/ilumos/components/SupervisorView';
import ChartReview, { ResolveModal } from '@/ilumos/components/ChartReview';
import ImpactModal, { WhyModal } from '@/ilumos/components/ImpactModal';
import ReplayModal from '@/ilumos/components/ReplayModal';
import ExportModal from '@/ilumos/components/ExportModal';
import AboutModal from '@/ilumos/components/AboutModal';
import { SourceModal } from '@/ilumos/components/bits';

const Shell = () => {
  const { state, api } = useStore();
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (state.modal) return; // open modals handle their own Escape
      if (state.reviewOpen) { api.set({ reviewOpen: false }); return; }
      if (state.screen === 'setup') {
        if (state.analysisExists) api.continueAnalysis();
      } else {
        api.goToSetup();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [state, api]);
  const m = state.modal;
  return (
    <div className="min-h-screen bg-slate-100 font-sans text-ink antialiased">
      {state.screen === 'setup' && <SetupScreen />}
      {state.screen === 'workspace' && <Workspace />}
      {state.screen === 'supervisor' && <SupervisorView />}
      {state.reviewOpen && <ChartReview />}
      {m?.type === 'source' && <SourceModal evidenceId={m.evidenceId} />}
      {m?.type === 'impact' && <ImpactModal />}
      {m?.type === 'why' && <WhyModal elementId={m.elementId} />}
      {m?.type === 'replay' && <ReplayModal decisionId={m.decisionId} />}
      {m?.type === 'export' && <ExportModal />}
      {m?.type === 'about' && <AboutModal />}
      {m?.type === 'resolve' && <ResolveModal issueId={m.issueId} />}
      {m?.type === 'confirmChart' && <ConfirmChartModal />}
      <Toaster
        position="bottom-left"
        toastOptions={{
          duration: 2600,
          style: { background: '#0B2239', color: '#fff', border: '1px solid #16406B', fontSize: '13px' },
        }}
      />
    </div>
  );
};

export default function App() {
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.05, smoothWheel: true });
    let raf;
    const loop = (t) => { lenis.raf(t); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); lenis.destroy(); };
  }, []);
  return (
    <StoreProvider>
      <Shell />
    </StoreProvider>
  );
}
