import React, { useEffect, useState } from 'react';
import { useStore } from '../store';
import Header from './Header';
import LeftPanel from './LeftPanel';
import ClaimChart from './ClaimChart';
import Investigation from './Investigation';

const TABS = [
  { id: 'chart', label: 'Claim Chart' },
  { id: 'element', label: 'Investigation' },
  { id: 'case', label: 'Case & Documents' },
];

export default function Workspace() {
  const { state } = useStore();
  const [tab, setTab] = useState('chart');

  useEffect(() => {
    if (state.selectedElement && window.innerWidth < 1280) setTab('element');
  }, [state.selectedElement]);

  return (
    <div className="flex min-h-screen flex-col" data-testid="analyst-workspace">
      <Header mode="analyst" />
      <div className="border-b border-slate-200 bg-white px-4 py-2 xl:hidden">
        <div className="flex gap-1" role="tablist" aria-label="Workspace sections">
          {TABS.map((t) => (
            <button
              key={t.id}
              data-testid={`mobile-tab-${t.id}`}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 rounded-md px-3 py-2 text-xs font-medium transition-colors ${
                tab === t.id ? 'bg-navy-900 text-white' : 'bg-slate-100 text-steel hover:bg-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <main className="mx-auto grid w-full max-w-[1700px] flex-1 grid-cols-1 gap-4 px-4 py-4 xl:grid-cols-[280px_minmax(0,1fr)_430px]">
        <div className={tab === 'case' ? 'block' : 'hidden xl:block'}><LeftPanel /></div>
        <div className={tab === 'chart' ? 'block min-w-0' : 'hidden min-w-0 xl:block'}><ClaimChart /></div>
        <div className={tab === 'element' ? 'block min-w-0' : 'hidden min-w-0 xl:block'}><Investigation /></div>
      </main>
    </div>
  );
}
