import React, { useState } from 'react';
import { IntruderMode, IntruderResult, HttpRequestLog } from '../types';
import { Play, Pause, RefreshCw, Cpu, Layers, Sparkles, Filter, CheckCircle2 } from 'lucide-react';

interface IntruderFuzzerProps {
  initialLog?: HttpRequestLog | null;
}

export const IntruderFuzzer: React.FC<IntruderFuzzerProps> = ({ initialLog }) => {
  const [attackMode, setAttackMode] = useState<IntruderMode>('sniper');
  const [targetUrl, setTargetUrl] = useState(
    initialLog?.url || 'https://api.mobileapp.internal/v1/user/checkout'
  );
  const [method, setMethod] = useState(initialLog?.method || 'POST');
  const [rawPayload, setRawPayload] = useState(
    initialLog?.requestBody ||
      JSON.stringify(
        {
          cartId: 'cart_5512',
          paymentMethodId: 'pm_card_visa',
          couponCode: '§SUMMER2026§',
        },
        null,
        2
      )
  );

  const [payloadList, setPayloadList] = useState<string>(
    `SUMMER2026\nSUMMER50\nTEST10\nADMIN2026\nPROMO99\n100OFF\nDISCOUNT15`
  );

  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<IntruderResult[]>([]);

  const handleStartAttack = async () => {
    setIsRunning(true);
    setResults([]);
    setProgress(0);

    const payloads = payloadList
      .split('\n')
      .map((p) => p.trim())
      .filter(Boolean);

    const total = payloads.length;

    for (let i = 0; i < total; i++) {
      const currentPayload = payloads[i];

      // Substitute target variable §...§ or placeholder
      let processedBody = rawPayload;
      if (processedBody.includes('§')) {
        processedBody = processedBody.replace(/§[^§]*§/, currentPayload);
      } else {
        processedBody = processedBody + `\n// Fuzz payload: ${currentPayload}`;
      }

      const startTime = Date.now();
      try {
        const res = await fetch('/api/proxy/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: targetUrl,
            method,
            headers: [
              { key: 'Content-Type', value: 'application/json' },
              { key: 'User-Agent', value: 'MobileSecurityStudio-Fuzzer/1.0' },
            ],
            body: processedBody,
          }),
        });

        const data = await res.json();
        const timeMs = Date.now() - startTime;

        const newResult: IntruderResult = {
          id: i + 1,
          payloads: [currentPayload],
          status: data.status || 200,
          statusText: data.statusText || 'OK',
          timeMs,
          lengthBytes: data.sizeBytes || (data.body ? data.body.length : 120),
          matchedPattern: data.status === 200 ? 'SUCCESS' : 'VALIDATION_ERR',
        };

        setResults((prev) => [...prev, newResult]);
      } catch (e) {
        setResults((prev) => [
          ...prev,
          {
            id: i + 1,
            payloads: [currentPayload],
            status: 500,
            statusText: 'Proxy Error',
            timeMs: Date.now() - startTime,
            lengthBytes: 0,
          },
        ]);
      }

      setProgress(Math.round(((i + 1) / total) * 100));
      await new Promise((r) => setTimeout(r, 120)); // simulated thread pacing
    }

    setIsRunning(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-slate-950 text-slate-200 font-mono text-xs">
      {/* Top Attack Control Panel */}
      <div className="p-3 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded border border-slate-800">
            <span className="text-slate-400 font-bold px-2">Mode:</span>
            {(['sniper', 'battering_ram', 'pitchfork', 'cluster_bomb'] as IntruderMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setAttackMode(mode)}
                className={`px-2.5 py-1 rounded capitalize font-medium transition-colors ${
                  attackMode === mode
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {mode.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleStartAttack}
          disabled={isRunning}
          className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold text-xs px-4 py-2 rounded shadow transition-all duration-150"
        >
          {isRunning ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 fill-current" />}
          <span>{isRunning ? `Running (${progress}%)` : 'Start Attack Batch'}</span>
        </button>
      </div>

      {/* Main Split Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-800 overflow-hidden">
        {/* Left: Configuration & Payloads */}
        <div className="p-3 flex flex-col h-full bg-slate-950 overflow-y-auto space-y-3">
          <div>
            <label className="text-slate-400 font-bold uppercase mb-1 block">Target Request Endpoint</label>
            <div className="flex gap-2">
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-amber-400 font-bold rounded px-2 py-1.5 focus:outline-none"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
              </select>
              <input
                type="text"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 text-slate-200 rounded px-3 py-1.5 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-1">
              <label className="text-slate-400 font-bold uppercase">Payload Positions (Wrap variables in §)</label>
              <span className="text-slate-500 text-[11px]">Example: "code": "§INPUT§"</span>
            </div>
            <textarea
              value={rawPayload}
              onChange={(e) => setRawPayload(e.target.value)}
              className="flex-1 min-h-[140px] bg-slate-900 border border-slate-800 text-amber-200 rounded p-2.5 focus:outline-none focus:border-amber-500 leading-relaxed resize-none"
            />
          </div>

          <div>
            <label className="text-slate-400 font-bold uppercase mb-1 block">Payload Dictionary (One per line)</label>
            <textarea
              value={payloadList}
              onChange={(e) => setPayloadList(e.target.value)}
              rows={5}
              className="w-full bg-slate-900 border border-slate-800 text-cyan-200 rounded p-2.5 focus:outline-none focus:border-amber-500 leading-relaxed font-mono"
            />
          </div>
        </div>

        {/* Right: Results Table */}
        <div className="flex flex-col h-full bg-slate-900 overflow-hidden">
          <div className="p-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between font-bold text-slate-400 uppercase">
            <span>Fuzzing Batch Output</span>
            <span>Total: {results.length}</span>
          </div>

          <div className="flex-1 overflow-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-950/80 text-slate-400 sticky top-0 uppercase border-b border-slate-800">
                <tr>
                  <th className="py-2 px-3 font-medium">#</th>
                  <th className="py-2 px-3 font-medium">Payload</th>
                  <th className="py-2 px-3 font-medium">Status</th>
                  <th className="py-2 px-3 font-medium">Latency</th>
                  <th className="py-2 px-3 font-medium">Length</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {results.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-800/80 transition-colors">
                    <td className="py-2 px-3 text-slate-500">{res.id}</td>
                    <td className="py-2 px-3 font-bold text-amber-400">{res.payloads.join(', ')}</td>
                    <td className="py-2 px-3">
                      <span
                        className={`px-1.5 py-0.5 rounded ${
                          res.status >= 200 && res.status < 300
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-rose-950 text-rose-400 border border-rose-800'
                        }`}
                      >
                        {res.status}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-300">{res.timeMs} ms</td>
                    <td className="py-2 px-3 text-slate-300">{res.lengthBytes} B</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
