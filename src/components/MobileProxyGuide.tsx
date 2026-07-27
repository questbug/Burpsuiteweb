import React, { useState } from 'react';
import { Smartphone, Shield, Wifi, QrCode, Download, ExternalLink, CheckCircle2 } from 'lucide-react';

export const MobileProxyGuide: React.FC = () => {
  const [activePlatform, setActivePlatform] = useState<'ios' | 'android'>('ios');

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-slate-950 text-slate-200 font-mono text-xs overflow-y-auto p-4 space-y-4">
      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-900/80 border border-slate-800 rounded-lg p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-lg text-amber-400">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 uppercase">Mobile Device Proxy Configuration</h2>
            <p className="text-slate-400 text-[11px]">
              Configure mobile devices (iOS / Android) to route HTTP/S traffic through Web Security Studio for inspection.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActivePlatform('ios')}
            className={`px-3 py-1.5 rounded font-bold transition-colors ${
              activePlatform === 'ios'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            iOS Setup Guide
          </button>
          <button
            onClick={() => setActivePlatform('android')}
            className={`px-3 py-1.5 rounded font-bold transition-colors ${
              activePlatform === 'android'
                ? 'bg-amber-500 text-slate-950'
                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Android Setup Guide
          </button>
        </div>
      </div>

      {/* Guide Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-400 uppercase">
            <Wifi className="w-4 h-4" /> 1. Wi-Fi Proxy Setup
          </div>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            {activePlatform === 'ios'
              ? 'Go to Settings -> Wi-Fi -> Tap (i) on connected Wi-Fi -> Configure Proxy -> Manual. Set Server Host to your workstation local IP and Port to 3000.'
              : 'Go to Settings -> Network & Internet -> Wi-Fi -> Tap gear icon on connected network -> Edit -> Advanced -> Proxy -> Manual. Set Host to workstation IP and Port 3000.'}
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-400 uppercase">
            <Download className="w-4 h-4" /> 2. Install Root CA
          </div>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            Open Mobile Safari / Chrome and navigate to <code className="text-amber-300">http://proxy.local/cert</code>.
            Download and install the custom Root CA profile onto your mobile device.
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-400 uppercase">
            <Shield className="w-4 h-4" /> 3. Trust Certificate
          </div>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            {activePlatform === 'ios'
              ? 'Go to Settings -> General -> About -> Certificate Trust Settings. Enable Full Trust for "WebSecurityStudio Root CA".'
              : 'Go to Settings -> Security -> Encryption & Credentials -> Install a Certificate -> CA Certificate. Select downloaded cert file.'}
          </p>
        </div>
      </div>

      {/* Verification Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <div>
            <div className="font-bold text-slate-200">Proxy Engine Ready</div>
            <div className="text-slate-400 text-[11px]">
              Once configured, all HTTP requests originating from mobile web applications will populate in the History Log.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
