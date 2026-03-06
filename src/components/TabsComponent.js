import React from 'react';
import HeaderTab from './HeaderTabComponent';
import ParamsTab from './ParamsTabComponent';
import NotesTab from './NotesTab';

export default function TabsComponent({ activeTab, setActiveTab, onParamChange }) {
  const tabs = [
    {
      id: 'home',
      label: 'Home',
      panel: (
        <p className="text-slate-600">
          Welcome! Use the tabs to configure requests or jot notes.
        </p>
      ),
    },
    { id: 'params', label: 'Query Params', panel: <ParamsTab onParamChange={onParamChange} /> },
    { id: 'headers', label: 'Headers', panel: <HeaderTab /> },
    { id: 'notes', label: 'Notes', panel: <NotesTab /> },
  ];

  const active = tabs.find((t) => t.id === activeTab) ?? tabs[0];

  return (
    <div className="w-full">
      {/* Tab list */}
      <div role="tablist" aria-label="Request configuration" className="flex flex-wrap gap-2">
        {tabs.map((t) => {
          const selected = active.id === t.id;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`panel-${t.id}`}
              id={`tab-${t.id}`}
              onClick={() => setActiveTab(t.id)}
              className={[
                'px-4 py-2 rounded-lg font-semibold transition-colors ring-1',
                selected
                  ? 'bg-violet-600 text-white ring-violet-600'
                  : 'bg-violet-100 text-violet-800 hover:bg-violet-200 ring-violet-200',
              ].join(' ')}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      {/* All panels mounted; only active one is visible */}
      {tabs.map((t) => (
        <div
          key={t.id}
          role="tabpanel"
          id={`panel-${t.id}`}
          aria-labelledby={`tab-${t.id}`}
          hidden={active.id !== t.id}
          className={`mt-3 rounded-xl border border-slate-200 p-3${active.id !== t.id ? ' hidden' : ''}`}
        >
          {t.id === 'home' ? (
            t.panel
          ) : (
            <div>
              <h2 className="text-lg font-semibold text-violet-700 mb-3">
                {t.label}
              </h2>
              {t.panel}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
