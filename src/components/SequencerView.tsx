import React, { useState } from 'react';
import { analyzeSequencerRandomness } from '../utils/security';
import { Binary, ShieldCheck, AlertTriangle, RefreshCw, BarChart2 } from 'lucide-react';

export const SequencerView: React.FC = () => {
  const [tokensInput, setTokensInput] = useState<string>(
    `s_98712398a1f\ns_98712398b2e\ns_98712398c3d\ns_98712398d4c\ns_98712398e5b\ns_98712398f6a\ns_9871239907f\ns_9871239918e`
  );

  const samples = tokensInput.split('\n').filter((s) => s.trim().length > 0);
  const analysis = analyzeSequencerRandomness(samples);

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-slate-950 text-slate-200 font-mono text-xs overflow-y-auto p-4 space-y-4">
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-amber-400 uppercase flex items-center gap-1.5">
            <Binary className="w-4 h-4" /> Session Token Batch Samples (One per line)
          </span>
          <span className="text-slate-400 text-[11px]">{samples.length} Samples Captured</span>
        </div>
        <textarea
          value={tokensInput}
          onChange={(e) => setTokensInput(e.target.value)}
          rows={5}
          placeholder="Paste multiple mobile cookies, bearer tokens, or CSRF tokens..."
          className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded p-2.5 focus:outline-none focus:border-amber-500 leading-relaxed font-mono"
        />
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
          <div className="text-slate-400 text-[11px] uppercase mb-1">Shannon Entropy</div>
          <div className="text-xl font-bold text-amber-400">
            {analysis.entropy} <span className="text-slate-500 text-xs">/ {analysis.maxPossibleEntropy} bits</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
          <div className="text-slate-400 text-[11px] uppercase mb-1">FIPS 140-2 Monobit Balance</div>
          <div className={`text-xl font-bold ${analysis.fipsMonobitPassed ? 'text-emerald-400' : 'text-rose-400'}`}>
            {analysis.fipsMonobitPassed ? 'PASSED' : 'FAILED'} ({analysis.fipsMonobitScore})
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
          <div className="text-slate-400 text-[11px] uppercase mb-1">Avg Token Length</div>
          <div className="text-xl font-bold text-cyan-400">{analysis.avgLength} chars</div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
          <div className="text-slate-400 text-[11px] uppercase mb-1">Unique Charset Size</div>
          <div className="text-xl font-bold text-purple-400">{analysis.characterSetSize} symbols</div>
        </div>
      </div>

      {/* Bit Variance Chart */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="font-bold text-slate-200 uppercase flex items-center gap-1.5">
            <BarChart2 className="w-4 h-4 text-amber-400" /> Bit Positional Entropy Variance
          </span>
          <span className="text-slate-400 text-[11px]">Position 0 to {analysis.bitVariance.length - 1}</span>
        </div>

        <div className="flex items-end gap-1.5 h-32 pt-4 pb-1 border-b border-slate-800 px-2 overflow-x-auto">
          {analysis.bitVariance.map((val, idx) => {
            const heightPercent = Math.min(100, Math.max(10, (val / (analysis.maxPossibleEntropy || 1)) * 100));
            return (
              <div key={idx} className="flex-1 min-w-[12px] flex flex-col items-center gap-1">
                <div
                  style={{ height: `${heightPercent}%` }}
                  className={`w-full rounded-t transition-all ${
                    val < 1.0 ? 'bg-rose-500' : val < 2.0 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  title={`Pos ${idx}: ${val} bits`}
                />
                <span className="text-[9px] text-slate-500">{idx}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recommendation */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex items-center gap-3">
        <ShieldCheck className="w-6 h-6 text-amber-400 flex-shrink-0" />
        <div>
          <div className="font-bold text-slate-200">Security Assessment Recommendation</div>
          <div className="text-slate-400 text-[11px]">{analysis.recommendation}</div>
        </div>
      </div>
    </div>
  );
};
