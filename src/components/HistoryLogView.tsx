import React, { useState } from 'react';
import { HttpRequestLog } from '../types';
import { Search, Filter, Play, RefreshCw, Send, Plus, PauseCircle, CheckCircle, ArrowUpRight } from 'lucide-react';

interface HistoryLogViewProps {
  logs: HttpRequestLog[];
  selectedLog: HttpRequestLog | null;
  setSelectedLog: (log: HttpRequestLog) => void;
  sendToRepeater: (log: HttpRequestLog) => void;
  sendToIntruder: (log: HttpRequestLog) => void;
  addNewLog: (log: HttpRequestLog) => void;
}

export const HistoryLogView: React.FC<HistoryLogViewProps> = ({
  logs,
  selectedLog,
  setSelectedLog,
  sendToRepeater,
  sendToIntruder,
  addNewLog,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState('ALL');
  const [activeSubTab, setActiveSubTab] = useState<'request' | 'response' | 'parsed'>('request');

  // Custom Quick Request simulator form
  const [quickUrl, setQuickUrl] = useState('https://api.mobileapp.internal/v1/user/profile');
  const [quickMethod, setQuickMethod] = useState('GET');
  const [isSending, setIsSending] = useState(false);

  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.host.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.requestBody.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMethod = methodFilter === 'ALL' || log.method === methodFilter;
    return matchesSearch && matchesMethod;
  });

  const handleExecuteQuickRequest = async () => {
    setIsSending(true);
    const startTime = Date.now();
    try {
      const res = await fetch('/api/proxy/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: quickUrl,
          method: quickMethod,
          headers: [
            { key: 'User-Agent', value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5_1 like Mac OS X) Mobile Security Studio/1.0' },
            { key: 'Accept', value: 'application/json' },
          ],
        }),
      });

      const data = await res.json();
      const timeMs = Date.now() - startTime;

      const urlObj = new URL(quickUrl);

      const newEntry: HttpRequestLog = {
        id: `req-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        method: quickMethod,
        url: quickUrl,
        host: urlObj.hostname,
        path: urlObj.pathname + urlObj.search,
        status: data.status || 200,
        statusText: data.statusText || 'OK',
        contentType: data.headers?.find((h: any) => h.key.toLowerCase() === 'content-type')?.value || 'application/json',
        responseTimeMs: timeMs,
        sizeBytes: data.sizeBytes || (data.body ? data.body.length : 120),
        requestHeaders: [
          { key: 'Host', value: urlObj.hostname },
          { key: 'User-Agent', value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5_1) WebSecurityStudio/1.0' },
          { key: 'Accept', value: 'application/json' },
        ],
        requestBody: '',
        responseHeaders: data.headers || [{ key: 'Content-Type', value: 'application/json' }],
        responseBody: data.body || JSON.stringify({ message: 'Request completed successfully' }, null, 2),
      };

      addNewLog(newEntry);
      setSelectedLog(newEntry);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-slate-950 text-slate-200">
      {/* Top Filter & Execution Bar */}
      <div className="p-3 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[280px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search HTTP logs, paths, parameters, or payloads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-slate-100 text-xs rounded-md pl-9 pr-3 py-2 focus:outline-none focus:border-amber-500 font-mono"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <Filter className="w-4 h-4 text-slate-400 ml-1" />
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-md px-2.5 py-2 focus:outline-none focus:border-amber-500 font-mono"
            >
              <option value="ALL">All Methods</option>
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
            </select>
          </div>
        </div>

        {/* Quick Send Simulator */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 border border-slate-800 rounded-md">
          <select
            value={quickMethod}
            onChange={(e) => setQuickMethod(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-amber-400 text-xs font-bold font-mono rounded px-2 py-1 focus:outline-none"
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
          </select>
          <input
            type="text"
            value={quickUrl}
            onChange={(e) => setQuickUrl(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono rounded px-2 py-1 w-64 focus:outline-none focus:border-amber-500"
          />
          <button
            onClick={handleExecuteQuickRequest}
            disabled={isSending}
            className="flex items-center gap-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs px-3 py-1 rounded transition-colors"
          >
            {isSending ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-current" />}
            <span>Fetch</span>
          </button>
        </div>
      </div>

      {/* Main Split Pane: Log Table on Top, Detail Inspector Below */}
      <div className="flex-1 grid grid-rows-2 overflow-hidden">
        {/* Table View */}
        <div className="overflow-auto border-b border-slate-800">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-900/90 text-slate-400 sticky top-0 uppercase font-mono tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-2 px-3 font-medium">#</th>
                <th className="py-2 px-3 font-medium">Time</th>
                <th className="py-2 px-3 font-medium">Method</th>
                <th className="py-2 px-3 font-medium">Host</th>
                <th className="py-2 px-3 font-medium">Path</th>
                <th className="py-2 px-3 font-medium">Status</th>
                <th className="py-2 px-3 font-medium">Type</th>
                <th className="py-2 px-3 font-medium">Latency</th>
                <th className="py-2 px-3 font-medium">Size</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredLogs.map((log, idx) => {
                const isSelected = selectedLog?.id === log.id;
                const statusColor =
                  log.status >= 200 && log.status < 300
                    ? 'text-emerald-400'
                    : log.status >= 400
                    ? 'text-rose-400'
                    : 'text-amber-400';

                return (
                  <tr
                    key={log.id}
                    onClick={() => setSelectedLog(log)}
                    className={`cursor-pointer hover:bg-slate-800/70 transition-colors ${
                      isSelected ? 'bg-slate-800/90 border-l-2 border-amber-500' : ''
                    }`}
                  >
                    <td className="py-2 px-3 text-slate-500">{idx + 1}</td>
                    <td className="py-2 px-3 text-slate-400 whitespace-nowrap">{log.timestamp.split(' ')[1]}</td>
                    <td className="py-2 px-3 font-bold">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[10px] ${
                          log.method === 'GET'
                            ? 'bg-blue-950 text-blue-400 border border-blue-800'
                            : log.method === 'POST'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}
                      >
                        {log.method}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-300 truncate max-w-[150px]">{log.host}</td>
                    <td className="py-2 px-3 text-slate-200 truncate max-w-[280px]">{log.path}</td>
                    <td className={`py-2 px-3 font-semibold ${statusColor}`}>
                      {log.status} {log.statusText}
                    </td>
                    <td className="py-2 px-3 text-slate-400 truncate max-w-[120px]">{log.contentType}</td>
                    <td className="py-2 px-3 text-slate-400">{log.responseTimeMs} ms</td>
                    <td className="py-2 px-3 text-slate-400">{log.sizeBytes} B</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Selected Log Inspector Panel */}
        {selectedLog ? (
          <div className="flex flex-col bg-slate-900 border-t border-slate-800 overflow-hidden">
            {/* Inspector Header Controls */}
            <div className="p-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 border border-amber-500/20 rounded">
                  {selectedLog.method}
                </span>
                <span className="text-xs font-mono text-slate-200 truncate max-w-md">{selectedLog.url}</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => sendToRepeater(selectedLog)}
                  className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-medium px-2.5 py-1 rounded border border-slate-700 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send to Repeater</span>
                </button>
                <button
                  onClick={() => sendToIntruder(selectedLog)}
                  className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 text-xs font-medium px-2.5 py-1 rounded border border-slate-700 transition-colors"
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>Send to Intruder</span>
                </button>
              </div>
            </div>

            {/* Sub Tabs: Request vs Response */}
            <div className="flex border-b border-slate-800 bg-slate-900/80 px-3">
              <button
                onClick={() => setActiveSubTab('request')}
                className={`px-3 py-1.5 text-xs font-mono border-b-2 transition-colors ${
                  activeSubTab === 'request'
                    ? 'border-amber-500 text-amber-400 font-bold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Raw Request
              </button>
              <button
                onClick={() => setActiveSubTab('response')}
                className={`px-3 py-1.5 text-xs font-mono border-b-2 transition-colors ${
                  activeSubTab === 'response'
                    ? 'border-amber-500 text-amber-400 font-bold'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Raw Response
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-auto p-3 font-mono text-xs bg-slate-950 leading-relaxed text-slate-300">
              {activeSubTab === 'request' ? (
                <div className="space-y-2">
                  <div className="text-emerald-400 font-bold">
                    {selectedLog.method} {selectedLog.path} HTTP/1.1
                  </div>
                  {selectedLog.requestHeaders.map((h, i) => (
                    <div key={i}>
                      <span className="text-slate-500">{h.key}:</span>{' '}
                      <span className="text-slate-200">{h.value}</span>
                    </div>
                  ))}
                  {selectedLog.requestBody && (
                    <div className="mt-4 pt-3 border-t border-slate-800 text-amber-200/90 whitespace-pre-wrap">
                      {selectedLog.requestBody}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-emerald-400 font-bold">
                    HTTP/1.1 {selectedLog.status} {selectedLog.statusText}
                  </div>
                  {selectedLog.responseHeaders.map((h, i) => (
                    <div key={i}>
                      <span className="text-slate-500">{h.key}:</span>{' '}
                      <span className="text-slate-200">{h.value}</span>
                    </div>
                  ))}
                  {selectedLog.responseBody && (
                    <div className="mt-4 pt-3 border-t border-slate-800 text-cyan-200/90 whitespace-pre-wrap">
                      {selectedLog.responseBody}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center bg-slate-900 text-slate-500 text-xs font-mono">
            Select an HTTP log entry above to inspect raw headers and body
          </div>
        )}
      </div>
    </div>
  );
};
