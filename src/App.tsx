import React, { useState } from 'react';
import { ModuleTab, HttpRequestLog, RepeaterTab, InterceptQueueItem } from './types';
import { initialHttpLogs } from './data/mockLogs';
import { Navbar } from './components/Navbar';
import { HistoryLogView } from './components/HistoryLogView';
import { SiteMapView } from './components/SiteMapView';
import { InterceptView } from './components/InterceptView';
import { RequestRepeater } from './components/RequestRepeater';
import { IntruderFuzzer } from './components/IntruderFuzzer';
import { DecoderJwtView } from './components/DecoderJwtView';
import { SequencerView } from './components/SequencerView';
import { HeaderAuditorView } from './components/HeaderAuditorView';
import { RulesMatchReplaceView } from './components/RulesMatchReplaceView';
import { MobileProxyGuide } from './components/MobileProxyGuide';

export default function App() {
  const [activeTab, setActiveTab] = useState<ModuleTab>('history');
  const [interceptEnabled, setInterceptEnabled] = useState(false);
  const [logs, setLogs] = useState<HttpRequestLog[]>(initialHttpLogs);
  const [selectedLog, setSelectedLog] = useState<HttpRequestLog | null>(initialHttpLogs[0] || null);

  const [interceptQueue, setInterceptQueue] = useState<InterceptQueueItem[]>([
    {
      id: 'ic-101',
      timestamp: '00:15:02',
      method: 'POST',
      url: 'https://api.mobileapp.internal/v1/auth/login',
      headers: [
        { key: 'Host', value: 'api.mobileapp.internal' },
        { key: 'User-Agent', value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5_1 like Mac OS X)' },
        { key: 'Content-Type', value: 'application/json' },
      ],
      body: JSON.stringify({ username: 'alex_m', authMode: 'biometric_passkey' }, null, 2),
    },
  ]);

  // Repeater State
  const [repeaterTabs, setRepeaterTabs] = useState<RepeaterTab[]>([
    {
      id: 'tab-1',
      title: 'Session Check',
      method: initialHttpLogs[0].method,
      url: initialHttpLogs[0].url,
      headers: initialHttpLogs[0].requestHeaders,
      body: initialHttpLogs[0].requestBody,
      response: {
        status: initialHttpLogs[0].status,
        statusText: initialHttpLogs[0].statusText,
        timeMs: initialHttpLogs[0].responseTimeMs,
        sizeBytes: initialHttpLogs[0].sizeBytes,
        headers: initialHttpLogs[0].responseHeaders,
        body: initialHttpLogs[0].responseBody,
      },
    },
    {
      id: 'tab-2',
      title: 'Checkout Test',
      method: initialHttpLogs[1].method,
      url: initialHttpLogs[1].url,
      headers: initialHttpLogs[1].requestHeaders,
      body: initialHttpLogs[1].requestBody,
      response: {
        status: initialHttpLogs[1].status,
        statusText: initialHttpLogs[1].statusText,
        timeMs: initialHttpLogs[1].responseTimeMs,
        sizeBytes: initialHttpLogs[1].sizeBytes,
        headers: initialHttpLogs[1].responseHeaders,
        body: initialHttpLogs[1].responseBody,
      },
    },
  ]);

  const [intruderTargetLog, setIntruderTargetLog] = useState<HttpRequestLog | null>(null);

  const addNewLog = (newLog: HttpRequestLog) => {
    setLogs((prev) => [newLog, ...prev]);
  };

  const sendToRepeater = (log: HttpRequestLog) => {
    const newId = `tab-${Date.now()}`;
    const newTab: RepeaterTab = {
      id: newId,
      title: `${log.method} ${log.path.substring(0, 10)}...`,
      method: log.method,
      url: log.url,
      headers: log.requestHeaders,
      body: log.requestBody,
      response: {
        status: log.status,
        statusText: log.statusText,
        timeMs: log.responseTimeMs,
        sizeBytes: log.sizeBytes,
        headers: log.responseHeaders,
        body: log.responseBody,
      },
    };

    setRepeaterTabs((prev) => [...prev, newTab]);
    setActiveTab('repeater');
  };

  const sendToIntruder = (log: HttpRequestLog) => {
    setIntruderTargetLog(log);
    setActiveTab('intruder');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        interceptEnabled={interceptEnabled}
        setInterceptEnabled={setInterceptEnabled}
        interceptCount={interceptEnabled ? 1 : 0}
      />

      <main className="flex-1 overflow-hidden">
        {activeTab === 'history' && (
          <HistoryLogView
            logs={logs}
            selectedLog={selectedLog}
            setSelectedLog={setSelectedLog}
            sendToRepeater={sendToRepeater}
            sendToIntruder={sendToIntruder}
            addNewLog={addNewLog}
          />
        )}

        {activeTab === 'sitemap' && (
          <SiteMapView logs={logs} onSelectLog={setSelectedLog} sendToRepeater={sendToRepeater} />
        )}

        {activeTab === 'intercept' && (
          <InterceptView
            interceptQueue={interceptQueue}
            setInterceptQueue={setInterceptQueue}
            addNewLog={addNewLog}
          />
        )}

        {activeTab === 'repeater' && (
          <RequestRepeater repeaterTabs={repeaterTabs} setRepeaterTabs={setRepeaterTabs} />
        )}

        {activeTab === 'intruder' && <IntruderFuzzer initialLog={intruderTargetLog} />}

        {activeTab === 'decoder' && <DecoderJwtView />}

        {activeTab === 'sequencer' && <SequencerView />}

        {activeTab === 'auditor' && <HeaderAuditorView />}

        {activeTab === 'rules' && <RulesMatchReplaceView />}

        {activeTab === 'mobile-guide' && <MobileProxyGuide />}
      </main>
    </div>
  );
}
