import React, { useState } from 'react';
import { RepeaterTab, HttpHeader } from '../types';
import { Play, Plus, Trash2, Send, Repeat, Smartphone, Columns, Code2, Sparkles, RefreshCw } from 'lucide-react';

interface RequestRepeaterProps {
  repeaterTabs: RepeaterTab[];
  setRepeaterTabs: React.Dispatch<React.SetStateAction<RepeaterTab[]>>;
}

export const RequestRepeater: React.FC<RequestRepeaterProps> = ({ repeaterTabs, setRepeaterTabs }) => {
  const [activeTabId, setActiveTabId] = useState<string>(repeaterTabs[0]?.id || 'tab-1');
  const [activeViewMode, setActiveViewMode] = useState<'editor' | 'diff'>('editor');
  const [diffTabId, setDiffTabId] = useState<string>(repeaterTabs[1]?.id || repeaterTabs[0]?.id || 'tab-1');
  const [isExecuting, setIsExecuting] = useState(false);

  const activeTab = repeaterTabs.find((t) => t.id === activeTabId) || repeaterTabs[0];

  const mobileUAPresets = [
    { label: 'iPhone Safari (iOS 17.5)', value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1' },
    { label: 'Android Chrome (Pixel 8)', value: 'Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36' },
    { label: 'iPad Air Safari', value: 'Mozilla/5.0 (iPad; CPU OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1' },
    { label: 'Custom App WebView Client', value: 'MobileSecurityStudio/3.4.1 (iOS 17.5; Device=iPhone15,2; Build=21F79)' },
  ];

  const handleUpdateTab = (updates: Partial<RepeaterTab>) => {
    setRepeaterTabs((prev) => prev.map((t) => (t.id === activeTab.id ? { ...t, ...updates } : t)));
  };

  const handleHeaderChange = (index: number, key: string, value: string) => {
    const updatedHeaders = [...activeTab.headers];
    updatedHeaders[index] = { key, value };
    handleUpdateTab({ headers: updatedHeaders });
  };

  const handleAddHeader = () => {
    handleUpdateTab({ headers: [...activeTab.headers, { key: '', value: '' }] });
  };

  const handleRemoveHeader = (index: number) => {
    const updatedHeaders = activeTab.headers.filter((_, i) => i !== index);
    handleUpdateTab({ headers: updatedHeaders });
  };

  const handleCreateNewTab = () => {
    const newId = `tab-${Date.now()}`;
    const newTab: RepeaterTab = {
      id: newId,
      title: `Tab ${repeaterTabs.length + 1}`,
      method: 'GET',
      url: 'https://api.mobileapp.internal/v1/auth/session',
      headers: [
        { key: 'Host', value: 'api.mobileapp.internal' },
        { key: 'User-Agent', value: mobileUAPresets[0].value },
        { key: 'Accept', value: 'application/json' },
      ],
      body: '',
    };
    setRepeaterTabs([...repeaterTabs, newTab]);
    setActiveTabId(newId);
  };

  const handleCloseTab = (idToClose: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (repeaterTabs.length <= 1) return;
    const remaining = repeaterTabs.filter((t) => t.id !== idToClose);
    setRepeaterTabs(remaining);
    if (activeTabId === idToClose) {
      setActiveTabId(remaining[0].id);
    }
  };

  const handleSendRequest = async () => {
    setIsExecuting(true);
    const startTime = Date.now();
    try {
      const res = await fetch('/api/proxy/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: activeTab.url,
          method: activeTab.method,
          headers: activeTab.headers,
          body: activeTab.body,
        }),
      });

      const data = await res.json();
      const timeMs = Date.now() - startTime;

      handleUpdateTab({
        response: {
          status: data.status || 200,
          statusText: data.statusText || 'OK',
          timeMs,
          sizeBytes: data.sizeBytes || (data.body ? data.body.length : 150),
          headers: data.headers || [{ key: 'Content-Type', value: 'application/json' }],
          body: data.body || JSON.stringify({ message: 'Response received' }, null, 2),
        },
      });
    } catch (e: any) {
      handleUpdateTab({
        response: {
          status: 500,
          statusText: 'Internal Error',
          timeMs: Date.now() - startTime,
          sizeBytes: 80,
          headers: [{ key: 'Content-Type', value: 'text/plain' }],
          body: `Error proxying request: ${e.message}`,
        },
      });
    } finally {
      setIsExecuting(false);
    }
  };

  const diffTab = repeaterTabs.find((t) => t.id === diffTabId) || repeaterTabs[0];

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-slate-950 text-slate-200">
      {/* Top Repeater Bar & Tabs */}
      <div className="bg-slate-900 border-b border-slate-800 px-3 pt-2 flex items-center justify-between">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          {repeaterTabs.map((tab) => {
            const isActive = tab.id === activeTabId;
            return (
              <div
                key={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-mono rounded-t cursor-pointer transition-colors ${
                  isActive
                    ? 'bg-slate-950 text-amber-400 border-t-2 border-amber-500 font-bold'
                    : 'bg-slate-900/60 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <span>{tab.title}</span>
                {repeaterTabs.length > 1 && (
                  <button
                    onClick={(e) => handleCloseTab(tab.id, e)}
                    className="hover:text-rose-400 text-slate-500 rounded p-0.5"
                  >
                    ×
                  </button>
                )}
              </div>
            );
          })}
          <button
            onClick={handleCreateNewTab}
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-amber-400 rounded transition-colors"
            title="New Repeater Tab"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 mb-1">
          <button
            onClick={() => setActiveViewMode('editor')}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded font-medium transition-colors ${
              activeViewMode === 'editor' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Request Builder</span>
          </button>
          <button
            onClick={() => setActiveViewMode('diff')}
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded font-medium transition-colors ${
              activeViewMode === 'diff' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Response Comparer (Diff)</span>
          </button>
        </div>
      </div>

      {activeViewMode === 'editor' ? (
        /* Standard Request / Response Editor */
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-slate-800 overflow-hidden">
          {/* Left Panel: Request Builder */}
          <div className="flex flex-col h-full bg-slate-950 p-3 overflow-y-auto">
            {/* Request Target & Send Bar */}
            <div className="flex items-center gap-2 mb-3">
              <select
                value={activeTab.method}
                onChange={(e) => handleUpdateTab({ method: e.target.value })}
                className="bg-slate-900 border border-slate-700 text-amber-400 font-mono font-bold text-xs rounded px-2.5 py-2 focus:outline-none focus:border-amber-500"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
                <option value="PATCH">PATCH</option>
                <option value="OPTIONS">OPTIONS</option>
              </select>

              <input
                type="text"
                value={activeTab.url}
                onChange={(e) => handleUpdateTab({ url: e.target.value })}
                className="flex-1 bg-slate-900 border border-slate-700 text-slate-100 font-mono text-xs rounded px-3 py-2 focus:outline-none focus:border-amber-500"
              />

              <button
                onClick={handleSendRequest}
                disabled={isExecuting}
                className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-bold text-xs px-4 py-2 rounded shadow transition-all duration-150"
              >
                {isExecuting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4 fill-current" />}
                <span>Send</span>
              </button>
            </div>

            {/* Mobile User-Agent Preset Selector */}
            <div className="mb-3 bg-slate-900 p-2 border border-slate-800 rounded-md">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-400 mb-1">
                <span className="flex items-center gap-1 text-slate-300">
                  <Smartphone className="w-3.5 h-3.5 text-amber-400" />
                  Mobile User-Agent Preset
                </span>
              </div>
              <select
                onChange={(e) => {
                  const val = e.target.value;
                  if (!val) return;
                  const newHeaders = activeTab.headers.map((h) =>
                    h.key.toLowerCase() === 'user-agent' ? { key: 'User-Agent', value: val } : h
                  );
                  if (!newHeaders.some((h) => h.key.toLowerCase() === 'user-agent')) {
                    newHeaders.push({ key: 'User-Agent', value: val });
                  }
                  handleUpdateTab({ headers: newHeaders });
                }}
                className="w-full bg-slate-950 border border-slate-700 text-slate-300 text-xs rounded px-2 py-1.5 font-mono focus:outline-none"
              >
                <option value="">Select Mobile Preset...</option>
                {mobileUAPresets.map((p, i) => (
                  <option key={i} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Headers Editor Table */}
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-mono font-bold text-slate-400 uppercase">Headers ({activeTab.headers.length})</span>
                <button
                  onClick={handleAddHeader}
                  className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-mono"
                >
                  <Plus className="w-3 h-3" /> Add Header
                </button>
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {activeTab.headers.map((h, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Header Name"
                      value={h.key}
                      onChange={(e) => handleHeaderChange(i, e.target.value, h.value)}
                      className="w-1/3 bg-slate-900 border border-slate-800 text-slate-200 text-xs font-mono rounded px-2 py-1 focus:outline-none focus:border-amber-500"
                    />
                    <input
                      type="text"
                      placeholder="Header Value"
                      value={h.value}
                      onChange={(e) => handleHeaderChange(i, h.key, e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-800 text-slate-200 text-xs font-mono rounded px-2 py-1 focus:outline-none focus:border-amber-500"
                    />
                    <button
                      onClick={() => handleRemoveHeader(i)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Request Body Textarea */}
            <div className="flex-1 flex flex-col">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase mb-1">Request Payload Body</span>
              <textarea
                value={activeTab.body}
                onChange={(e) => handleUpdateTab({ body: e.target.value })}
                placeholder="JSON, URL-encoded string, or raw payload body..."
                className="flex-1 min-h-[160px] bg-slate-900 border border-slate-800 text-amber-100 font-mono text-xs rounded p-2.5 focus:outline-none focus:border-amber-500 leading-relaxed resize-none"
              />
            </div>
          </div>

          {/* Right Panel: Response Inspector */}
          <div className="flex flex-col h-full bg-slate-900 p-3 overflow-hidden">
            {activeTab.response ? (
              <div className="flex flex-col h-full">
                {/* Status Metrics Bar */}
                <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-md mb-3 flex items-center justify-between font-mono text-xs">
                  <div className="flex items-center gap-3">
                    <span
                      className={`font-bold px-2 py-0.5 rounded ${
                        activeTab.response.status >= 200 && activeTab.response.status < 300
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}
                    >
                      {activeTab.response.status} {activeTab.response.statusText}
                    </span>
                    <span className="text-slate-400">Latency: <strong className="text-slate-200">{activeTab.response.timeMs} ms</strong></span>
                    <span className="text-slate-400">Size: <strong className="text-slate-200">{activeTab.response.sizeBytes} B</strong></span>
                  </div>
                </div>

                {/* Response Body */}
                <div className="flex-1 bg-slate-950 border border-slate-800 rounded-md p-3 overflow-auto font-mono text-xs leading-relaxed text-cyan-200">
                  <div className="text-slate-500 mb-2">// Response Headers</div>
                  {activeTab.response.headers.map((h, i) => (
                    <div key={i} className="text-slate-400">
                      <span className="text-slate-500">{h.key}:</span> {h.value}
                    </div>
                  ))}
                  <div className="border-t border-slate-800 my-3" />
                  <div className="text-slate-500 mb-2">// Response Body</div>
                  <pre className="whitespace-pre-wrap">{activeTab.response.body}</pre>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 font-mono text-xs">
                <Repeat className="w-8 h-8 mb-2 opacity-40 text-amber-500" />
                <span>Click "Send" to execute the request via proxy</span>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Response Comparer / Diff View */
        <div className="flex-1 flex flex-col p-4 bg-slate-950 overflow-auto font-mono text-xs">
          <div className="mb-4 bg-slate-900 p-3 border border-slate-800 rounded-md flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-slate-300 font-bold">Compare Tab:</span>
              <span className="text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 font-bold">
                {activeTab.title} ({activeTab.url})
              </span>
              <span className="text-slate-500">VS</span>
              <select
                value={diffTabId}
                onChange={(e) => setDiffTabId(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-slate-200 rounded px-2.5 py-1"
              >
                {repeaterTabs.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title} ({t.url})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 flex-1">
            {/* Left Response */}
            <div className="bg-slate-900 border border-slate-800 rounded-md p-3 overflow-auto">
              <div className="text-amber-400 font-bold mb-2 pb-2 border-b border-slate-800">
                [A] {activeTab.title} Response
              </div>
              <pre className="whitespace-pre-wrap text-cyan-200">
                {activeTab.response?.body || 'No response captured for Tab A yet.'}
              </pre>
            </div>

            {/* Right Response */}
            <div className="bg-slate-900 border border-slate-800 rounded-md p-3 overflow-auto">
              <div className="text-sky-400 font-bold mb-2 pb-2 border-b border-slate-800">
                [B] {diffTab.title} Response
              </div>
              <pre className="whitespace-pre-wrap text-emerald-200">
                {diffTab.response?.body || 'No response captured for Tab B yet.'}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
