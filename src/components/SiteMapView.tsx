import React from 'react';
import { SiteMapNode, HttpRequestLog } from '../types';
import { Network, Folder, FileCode, ArrowRight, Send } from 'lucide-react';

interface SiteMapViewProps {
  logs: HttpRequestLog[];
  onSelectLog: (log: HttpRequestLog) => void;
  sendToRepeater: (log: HttpRequestLog) => void;
}

export const SiteMapView: React.FC<SiteMapViewProps> = ({ logs, onSelectLog, sendToRepeater }) => {
  // Build site map hierarchy from logs
  const siteMap = React.useMemo(() => {
    const map = new Map<string, Map<string, { methods: Set<string>; logs: HttpRequestLog[] }>>();

    logs.forEach((log) => {
      if (!map.has(log.host)) {
        map.set(log.host, new Map());
      }
      const hostMap = map.get(log.host)!;

      const pathKey = log.path || '/';
      if (!hostMap.has(pathKey)) {
        hostMap.set(pathKey, { methods: new Set(), logs: [] });
      }
      const entry = hostMap.get(pathKey)!;
      entry.methods.add(log.method);
      entry.logs.push(log);
    });

    const result: SiteMapNode[] = [];
    map.forEach((pathsMap, host) => {
      const paths: { path: string; methods: string[]; logIds: string[] }[] = [];
      pathsMap.forEach((val, path) => {
        paths.push({
          path,
          methods: Array.from(val.methods),
          logIds: val.logs.map((l) => l.id),
        });
      });
      result.push({ host, paths });
    });

    return result;
  }, [logs]);

  const [selectedHost, setSelectedHost] = React.useState<string>(siteMap[0]?.host || '');
  const [selectedPath, setSelectedPath] = React.useState<string>('');

  const currentHostNode = siteMap.find((s) => s.host === selectedHost) || siteMap[0];
  const matchingLogs = React.useMemo(() => {
    if (!currentHostNode) return [];
    if (!selectedPath) {
      return logs.filter((l) => l.host === currentHostNode.host);
    }
    return logs.filter((l) => l.host === currentHostNode.host && l.path === selectedPath);
  }, [logs, currentHostNode, selectedPath]);

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-slate-950 text-slate-200 font-mono text-xs">
      <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Network className="w-4 h-4 text-amber-400" />
          <h2 className="font-bold text-slate-100 uppercase">Target Site Map & Endpoint Directory</h2>
        </div>
        <span className="text-slate-400 text-[11px]">{siteMap.length} Unique Target Hosts Discovered</span>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-800 overflow-hidden">
        {/* Host & Path Hierarchy Tree */}
        <div className="p-3 bg-slate-950 overflow-y-auto space-y-3">
          <span className="text-slate-400 font-bold uppercase text-[11px] block border-b border-slate-800 pb-1">
            Target Host Nodes
          </span>

          {siteMap.map((node) => {
            const isHostSelected = node.host === currentHostNode?.host;
            return (
              <div key={node.host} className="space-y-1">
                <button
                  onClick={() => {
                    setSelectedHost(node.host);
                    setSelectedPath('');
                  }}
                  className={`w-full flex items-center gap-2 text-left px-2.5 py-1.5 rounded transition-colors ${
                    isHostSelected
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 font-bold'
                      : 'text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <Folder className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                  <span className="truncate">{node.host}</span>
                  <span className="ml-auto text-[10px] text-slate-500">({node.paths.length})</span>
                </button>

                {isHostSelected && (
                  <div className="pl-4 space-y-1 border-l border-slate-800 my-1">
                    {node.paths.map((p) => {
                      const isPathSelected = selectedPath === p.path;
                      return (
                        <button
                          key={p.path}
                          onClick={() => setSelectedPath(p.path)}
                          className={`w-full flex items-center gap-2 text-left px-2 py-1 rounded transition-colors ${
                            isPathSelected
                              ? 'bg-slate-800 text-cyan-300 font-bold border-l-2 border-cyan-400'
                              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                          }`}
                        >
                          <FileCode className="w-3 h-3 text-slate-500 flex-shrink-0" />
                          <span className="truncate flex-1">{p.path}</span>
                          <span className="text-[9px] bg-slate-900 border border-slate-800 px-1 rounded text-amber-400">
                            {p.methods.join(', ')}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Selected Endpoint History Logs */}
        <div className="col-span-2 flex flex-col bg-slate-900 overflow-hidden">
          <div className="p-2.5 bg-slate-950 border-b border-slate-800 flex items-center justify-between font-bold text-slate-400">
            <span>
              Endpoints for: <strong className="text-amber-400">{currentHostNode?.host}</strong>
              {selectedPath ? ` (${selectedPath})` : ' (All Endpoints)'}
            </span>
            <span>{matchingLogs.length} Requests</span>
          </div>

          <div className="flex-1 overflow-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-950/80 text-slate-400 sticky top-0 uppercase border-b border-slate-800">
                <tr>
                  <th className="py-2 px-3 font-medium">Method</th>
                  <th className="py-2 px-3 font-medium">Path</th>
                  <th className="py-2 px-3 font-medium">Status</th>
                  <th className="py-2 px-3 font-medium">Latency</th>
                  <th className="py-2 px-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {matchingLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/80 transition-colors">
                    <td className="py-2 px-3 font-bold text-amber-400">{log.method}</td>
                    <td className="py-2 px-3 text-slate-200 truncate max-w-xs">{log.path}</td>
                    <td className="py-2 px-3">
                      <span
                        className={`px-1.5 py-0.5 rounded ${
                          log.status >= 200 && log.status < 300
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-rose-950 text-rose-400 border border-rose-800'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td className="py-2 px-3 text-slate-400">{log.responseTimeMs} ms</td>
                    <td className="py-2 px-3">
                      <button
                        onClick={() => sendToRepeater(log)}
                        className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-amber-400 text-[10px] px-2 py-0.5 rounded border border-slate-700"
                      >
                        <Send className="w-3 h-3" /> Repeater
                      </button>
                    </td>
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
