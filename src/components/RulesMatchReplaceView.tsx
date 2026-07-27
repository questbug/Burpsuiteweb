import React, { useState } from 'react';
import { MatchReplaceRule } from '../types';
import { Sliders, Plus, Trash2, CheckCircle2, Shield } from 'lucide-react';

export const RulesMatchReplaceView: React.FC = () => {
  const [rules, setRules] = useState<MatchReplaceRule[]>([
    {
      id: 'rule-1',
      name: 'Mobile User-Agent Override (iOS 17.5)',
      enabled: true,
      type: 'request_header',
      match: 'User-Agent: .*',
      replace: 'User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 17_5_1 like Mac OS X) WebSecurityStudio/1.0',
    },
    {
      id: 'rule-2',
      name: 'Inject X-Forwarded-For Internal IP',
      enabled: true,
      type: 'request_header',
      match: 'X-Forwarded-For: .*',
      replace: 'X-Forwarded-For: 127.0.0.1',
    },
    {
      id: 'rule-3',
      name: 'Strip Strict CSP Headers in Proxy Responses',
      enabled: false,
      type: 'response_header',
      match: 'Content-Security-Policy: .*',
      replace: "Content-Security-Policy: default-src * 'unsafe-inline' 'unsafe-eval'",
    },
  ]);

  const toggleRule = (id: string) => {
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)));
  };

  const removeRule = (id: string) => {
    setRules((prev) => prev.filter((r) => r.id !== id));
  };

  const addRule = () => {
    const newRule: MatchReplaceRule = {
      id: `rule-${Date.now()}`,
      name: 'New Custom Match & Replace Rule',
      enabled: true,
      type: 'request_header',
      match: 'X-Custom-Match',
      replace: 'X-Custom-Replace',
    };
    setRules([...rules, newRule]);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-slate-950 text-slate-200 font-mono text-xs overflow-y-auto p-4 space-y-4">
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sliders className="w-5 h-5 text-amber-400" />
          <div>
            <h2 className="font-bold text-slate-100 uppercase">Match & Replace Middleware Rules Engine</h2>
            <p className="text-slate-400 text-[11px]">
              Automatically alter mobile HTTP request & response headers/payloads in real-time on the proxy layer.
            </p>
          </div>
        </div>

        <button
          onClick={addRule}
          className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-3 py-1.5 rounded transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Rule
        </button>
      </div>

      <div className="space-y-3">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className={`p-3.5 rounded-lg border bg-slate-900 transition-colors ${
              rule.enabled ? 'border-amber-500/40' : 'border-slate-800 opacity-60'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={rule.enabled}
                  onChange={() => toggleRule(rule.id)}
                  className="w-4 h-4 accent-amber-500 cursor-pointer"
                />
                <input
                  type="text"
                  value={rule.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setRules((prev) => prev.map((r) => (r.id === rule.id ? { ...r, name } : r)));
                  }}
                  className="bg-slate-950 border border-slate-800 font-bold text-slate-100 rounded px-2 py-1 focus:outline-none focus:border-amber-500 min-w-[280px]"
                />
                <span className="text-[10px] bg-slate-950 border border-slate-800 px-2 py-0.5 rounded text-amber-400 uppercase">
                  {rule.type.replace('_', ' ')}
                </span>
              </div>

              <button onClick={() => removeRule(rule.id)} className="text-slate-500 hover:text-rose-400 p-1">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              <div>
                <label className="text-slate-500 text-[10px] uppercase font-bold block mb-1">Match Pattern (Regex / String)</label>
                <input
                  type="text"
                  value={rule.match}
                  onChange={(e) => {
                    const match = e.target.value;
                    setRules((prev) => prev.map((r) => (r.id === rule.id ? { ...r, match } : r)));
                  }}
                  className="w-full bg-slate-950 border border-slate-800 text-rose-300 font-mono text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-slate-500 text-[10px] uppercase font-bold block mb-1">Replacement String</label>
                <input
                  type="text"
                  value={rule.replace}
                  onChange={(e) => {
                    const replace = e.target.value;
                    setRules((prev) => prev.map((r) => (r.id === rule.id ? { ...r, replace } : r)));
                  }}
                  className="w-full bg-slate-950 border border-slate-800 text-emerald-300 font-mono text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
