import React from 'react';
import { ModuleTab } from '../types';
import { Shield, History, Repeat, Cpu, FileCode2, Binary, Smartphone, CheckCircle, PauseCircle, PlayCircle, Network, Sliders, Hand } from 'lucide-react';

interface NavbarProps {
  activeTab: ModuleTab;
  setActiveTab: (tab: ModuleTab) => void;
  interceptEnabled: boolean;
  setInterceptEnabled: React.Dispatch<React.SetStateAction<boolean>>;
  interceptCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  interceptEnabled,
  setInterceptEnabled,
  interceptCount,
}) => {
  const tabs: { id: ModuleTab; label: string; icon: React.ReactNode }[] = [
    { id: 'history', label: 'HTTP History Log', icon: <History className="w-4 h-4" /> },
    { id: 'sitemap', label: 'Target Site Map', icon: <Network className="w-4 h-4" /> },
    { id: 'intercept', label: 'Live Intercept', icon: <Hand className="w-4 h-4" /> },
    { id: 'repeater', label: 'Repeater & Diff', icon: <Repeat className="w-4 h-4" /> },
    { id: 'intruder', label: 'Intruder / Fuzzer', icon: <Cpu className="w-4 h-4" /> },
    { id: 'decoder', label: 'Decoder & JWT', icon: <FileCode2 className="w-4 h-4" /> },
    { id: 'sequencer', label: 'Token Sequencer', icon: <Binary className="w-4 h-4" /> },
    { id: 'auditor', label: 'Header Auditor', icon: <Shield className="w-4 h-4" /> },
    { id: 'rules', label: 'Match & Replace', icon: <Sliders className="w-4 h-4" /> },
    { id: 'mobile-guide', label: 'Mobile Proxy Guide', icon: <Smartphone className="w-4 h-4" /> },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 px-4 py-3 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Logo & Title */}
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-amber-500 to-orange-600 p-2 rounded-lg text-slate-950 font-bold shadow-inner">
            <Shield className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white">Web Security Studio</h1>
              <span className="text-xs bg-amber-500/20 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded font-mono font-semibold">
                Mobile Web Pro
              </span>
            </div>
            <p className="text-xs text-slate-400">Enterprise HTTP Inspection & API Testing Suite</p>
          </div>
        </div>

        {/* Interception Toggle Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setInterceptEnabled(!interceptEnabled)}
            className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-md border transition-all duration-150 ${
              interceptEnabled
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/40 hover:bg-amber-500/20 shadow-sm'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
            }`}
          >
            {interceptEnabled ? (
              <>
                <PauseCircle className="w-4 h-4 text-amber-400 animate-pulse" />
                <span>Intercept: ON ({interceptCount} held)</span>
              </>
            ) : (
              <>
                <PlayCircle className="w-4 h-4 text-slate-400" />
                <span>Intercept: OFF</span>
              </>
            )}
          </button>

          <div className="hidden lg:flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/50 px-2.5 py-1 rounded">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Root CA Ready</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="max-w-7xl mx-auto mt-3 pt-2 border-t border-slate-800/80 flex items-center gap-1 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-t-md transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-slate-800 text-amber-400 border-b-2 border-amber-500 font-semibold'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
