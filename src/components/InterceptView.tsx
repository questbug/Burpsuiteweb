import React, { useState } from 'react';
import { InterceptQueueItem, HttpHeader, HttpRequestLog } from '../types';
import { PauseCircle, PlayCircle, Forward, Trash2, Send, ShieldAlert, Check } from 'lucide-react';

interface InterceptViewProps {
  interceptQueue: InterceptQueueItem[];
  setInterceptQueue: React.Dispatch<React.SetStateAction<InterceptQueueItem[]>>;
  addNewLog: (log: HttpRequestLog) => void;
}

export const InterceptView: React.FC<InterceptViewProps> = ({
  interceptQueue,
  setInterceptQueue,
  addNewLog,
}) => {
  const [activeItem, setActiveItem] = useState<InterceptQueueItem | null>(
    interceptQueue[0] || null
  );

  const currentItem = interceptQueue.find((i) => i.id === activeItem?.id) || interceptQueue[0];

  const handleUpdateItem = (updates: Partial<InterceptQueueItem>) => {
    if (!currentItem) return;
    setInterceptQueue((prev) =>
      prev.map((item) => (item.id === currentItem.id ? { ...item, ...updates } : item))
    );
  };

  const handleForward = async () => {
    if (!currentItem) return;

    // Send request via server proxy
    const startTime = Date.now();
    try {
      const res = await fetch('/api/proxy/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: currentItem.url,
          method: currentItem.method,
          headers: currentItem.headers,
          body: currentItem.body,
        }),
      });

      const data = await res.json();
      const timeMs = Date.now() - startTime;
      const urlObj = new URL(currentItem.url);

      const logEntry: HttpRequestLog = {
        id: `req-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        method: currentItem.method,
        url: currentItem.url,
        host: urlObj.hostname,
        path: urlObj.pathname + urlObj.search,
        status: data.status || 200,
        statusText: data.statusText || 'OK',
        contentType: data.headers?.find((h: any) => h.key.toLowerCase() === 'content-type')?.value || 'application/json',
        responseTimeMs: timeMs,
        sizeBytes: data.sizeBytes || (data.body ? data.body.length : 100),
        requestHeaders: currentItem.headers,
        requestBody: currentItem.body,
        responseHeaders: data.headers || [{ key: 'Content-Type', value: 'application/json' }],
        responseBody: data.body || '',
      };

      addNewLog(logEntry);
    } catch (e) {
      console.error(e);
    }

    // Remove from intercept queue
    const nextQueue = interceptQueue.filter((i) => i.id !== currentItem.id);
    setInterceptQueue(nextQueue);
    setActiveItem(nextQueue[0] || null);
  };

  const handleDrop = () => {
    if (!currentItem) return;
    const nextQueue = interceptQueue.filter((i) => i.id !== currentItem.id);
    setInterceptQueue(nextQueue);
    setActiveItem(nextQueue[0] || null);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-slate-950 text-slate-200 font-mono text-xs">
      <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PauseCircle className="w-5 h-5 text-amber-400 animate-pulse" />
          <h2 className="font-bold text-slate-100 uppercase">Live Intercept Queue ({interceptQueue.length} Held)</h2>
        </div>

        {currentItem && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleDrop}
              className="flex items-center gap-1.5 bg-rose-950 hover:bg-rose-900 text-rose-300 font-bold px-3 py-1.5 rounded border border-rose-800 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> Drop Request
            </button>
            <button
              onClick={handleForward}
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-4 py-1.5 rounded shadow transition-colors"
            >
              <Forward className="w-3.5 h-3.5 fill-current" /> Forward Request
            </button>
          </div>
        )}
      </div>

      {currentItem ? (
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-800 overflow-hidden">
          {/* Queue List */}
          <div className="p-3 bg-slate-950 overflow-y-auto space-y-2">
            <span className="text-slate-400 font-bold uppercase text-[11px] block border-b border-slate-800 pb-1">
              Held Requests Queue
            </span>
            {interceptQueue.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveItem(item)}
                className={`w-full text-left p-2.5 rounded border transition-colors ${
                  item.id === currentItem.id
                    ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                    : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center justify-between font-bold mb-1">
                  <span className="text-amber-400">{item.method}</span>
                  <span className="text-slate-500 text-[10px]">{item.timestamp}</span>
                </div>
                <div className="text-slate-300 truncate">{item.url}</div>
              </button>
            ))}
          </div>

          {/* Raw Editable Intercept Inspector */}
          <div className="col-span-2 flex flex-col p-3 bg-slate-900 overflow-y-auto space-y-3">
            <div className="flex items-center gap-2">
              <select
                value={currentItem.method}
                onChange={(e) => handleUpdateItem({ method: e.target.value })}
                className="bg-slate-950 border border-slate-700 text-amber-400 font-bold rounded px-2 py-1.5 focus:outline-none"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
              </select>
              <input
                type="text"
                value={currentItem.url}
                onChange={(e) => handleUpdateItem({ url: e.target.value })}
                className="flex-1 bg-slate-950 border border-slate-700 text-slate-200 rounded px-3 py-1.5 font-mono focus:outline-none"
              />
            </div>

            <div className="flex-1 flex flex-col">
              <label className="text-slate-400 font-bold uppercase mb-1">Modify Intercepted Payload Body</label>
              <textarea
                value={currentItem.body}
                onChange={(e) => handleUpdateItem({ body: e.target.value })}
                className="flex-1 min-h-[220px] bg-slate-950 border border-slate-800 text-amber-200 font-mono text-xs rounded p-3 focus:outline-none focus:border-amber-500 leading-relaxed resize-none"
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-slate-500 font-mono text-xs">
          <PauseCircle className="w-8 h-8 mb-2 opacity-40 text-amber-500" />
          <span>Intercept Queue is empty. No requests currently paused.</span>
        </div>
      )}
    </div>
  );
};
