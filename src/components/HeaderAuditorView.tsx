import React, { useState } from 'react';
import { auditSecurityHeaders } from '../utils/security';
import { ShieldAlert, ShieldCheck, AlertTriangle, RefreshCw, CheckCircle, XCircle } from 'lucide-react';

export const HeaderAuditorView: React.FC = () => {
  const [headerText, setHeaderText] = useState<string>(
    `HTTP/1.1 200 OK\nContent-Type: application/json; charset=utf-8\nCache-Control: no-store, no-cache, must-revalidate\nSet-Cookie: session_id=s_98712398a1f; Secure; HttpOnly; SameSite=Lax\nX-Frame-Options: DENY\nX-Content-Type-Options: nosniff`
  );

  const parsedHeaders = headerText
    .split('\n')
    .map((line) => {
      const idx = line.indexOf(':');
      if (idx === -1) return null;
      return { key: line.substring(0, idx).trim(), value: line.substring(idx + 1).trim() };
    })
    .filter(Boolean) as { key: string; value: string }[];

  const auditResults = auditSecurityHeaders(parsedHeaders);

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-slate-950 text-slate-200 font-mono text-xs overflow-y-auto p-4 space-y-4">
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
        <span className="font-bold text-amber-400 uppercase flex items-center gap-1.5 mb-2">
          <ShieldAlert className="w-4 h-4" /> Raw Mobile HTTP Response Headers
        </span>
        <textarea
          value={headerText}
          onChange={(e) => setHeaderText(e.target.value)}
          rows={6}
          placeholder="Paste HTTP response headers..."
          className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded p-2.5 focus:outline-none focus:border-amber-500 leading-relaxed font-mono"
        />
      </div>

      {/* Audit Checklist Cards */}
      <div className="space-y-3">
        <span className="font-bold text-slate-200 uppercase text-xs">Security Headers Compliance Audit</span>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {auditResults.map((check, idx) => {
            return (
              <div
                key={idx}
                className={`p-3.5 rounded-lg border bg-slate-900 ${
                  check.status === 'pass'
                    ? 'border-emerald-800/60'
                    : check.status === 'warn'
                    ? 'border-amber-800/60'
                    : 'border-rose-800/60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {check.status === 'pass' ? (
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                    ) : check.status === 'warn' ? (
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                    ) : (
                      <XCircle className="w-4 h-4 text-rose-400" />
                    )}
                    <span className="font-bold text-slate-100">{check.headerName}</span>
                  </div>

                  <span
                    className={`px-2 py-0.5 text-[10px] uppercase font-bold rounded ${
                      check.status === 'pass'
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : check.status === 'warn'
                        ? 'bg-amber-950 text-amber-400 border border-amber-800'
                        : 'bg-rose-950 text-rose-400 border border-rose-800'
                    }`}
                  >
                    {check.status}
                  </span>
                </div>

                <p className="text-slate-400 text-[11px] mb-2">{check.description}</p>

                <div className="bg-slate-950 p-2 rounded border border-slate-800 space-y-1">
                  <div>
                    <span className="text-slate-500">Current:</span>{' '}
                    <span className={check.currentValue ? 'text-slate-200' : 'text-slate-600 italic'}>
                      {check.currentValue || 'Missing'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500">Recommended:</span>{' '}
                    <span className="text-amber-300">{check.recommendedValue}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
