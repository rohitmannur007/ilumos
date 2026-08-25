import React from 'react';
import { Scale } from 'lucide-react';
import { useStore } from '../store';
import { Modal } from './bits';

export default function AboutModal() {
  const { api } = useStore();
  return (
    <Modal title="About iLumos" subtitle="Claim Review Intelligence — conceptual prototype" onClose={api.closeModal} testid="about-modal">
      <div className="space-y-4 text-[13px] leading-relaxed text-ink">
        <div className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 items-center justify-center rounded-md bg-navy-900 text-white" aria-hidden="true">
            <Scale size={17} />
          </span>
          <div>
            <p className="font-semibold">iLumos</p>
            <p className="text-[11px] uppercase tracking-[0.12em] text-steel">Claim Review Intelligence</p>
          </div>
        </div>
        <p>iLumos is a conceptual prototype for Lumenci's claim-chart refinement workflow. This demonstration uses fictional Acme Thermostat data.</p>
        <div>
          <p className="font-medium">The prototype demonstrates:</p>
          <ul className="mt-1.5 space-y-1">
            {['Evidence-aware refinement', 'Human-in-the-loop review', 'Cross-element reasoning impact', 'Supervisor provenance'].map((x) => (
              <li key={x} className="flex items-start gap-2">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-brand" aria-hidden="true" /> {x}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2.5 text-[12px] text-steel">
          <p>AI responses and document processing are deterministic prototype simulations.</p>
          <p className="mt-1">The product does not provide legal advice or legal conclusions.</p>
          <p className="mt-1">Uploaded materials are local to this prototype session.</p>
        </div>
      </div>
    </Modal>
  );
}
