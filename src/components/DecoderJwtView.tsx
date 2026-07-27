import React, { useState } from 'react';
import {
  decodeBase64,
  encodeBase64,
  decodeUrl,
  encodeUrl,
  stringToHex,
  hexToString,
  parseJwt,
} from '../utils/security';
import { FileCode2, ArrowRightLeft, ShieldAlert, KeyRound, Copy, Check } from 'lucide-react';

export const DecoderJwtView: React.FC = () => {
  const [inputText, setInputText] = useState(
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyXzk5ODg3NyIsIm5hbWUiOiJBbGV4IE1vcmdhbiIsImlhdCI6MTcyMjA0MjQwMCwiZXhwIjoxNzIyOTA2NDAwLCJpc3MiOiJhdXRoLm1vYmlsZWFwcC5pbnRlcm5hbCJ9.dF9zS21fRmV4X3BsZXNfU2lnbmF0dXJl'
  );
  const [copied, setCopied] = useState(false);

  const jwtParsed = parseJwt(inputText);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-slate-950 text-slate-200 font-mono text-xs overflow-y-auto p-4 space-y-4">
      {/* Input Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-amber-400 uppercase flex items-center gap-1.5">
            <FileCode2 className="w-4 h-4" /> Raw Input / Encoded Token String
          </span>
          <button
            onClick={() => handleCopy(inputText)}
            className="flex items-center gap-1 text-slate-400 hover:text-slate-200 text-[11px]"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          rows={4}
          placeholder="Paste URL-encoded string, Base64, Hex, or JWT token here..."
          className="w-full bg-slate-950 border border-slate-800 text-slate-100 rounded p-2.5 focus:outline-none focus:border-amber-500 leading-relaxed font-mono"
        />
      </div>

      {/* Real-time Decoded Conversions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* URL Decode */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 flex flex-col">
          <span className="text-slate-400 font-bold mb-1.5 uppercase text-[11px]">URL Decode</span>
          <div className="flex-1 bg-slate-950 p-2.5 rounded border border-slate-800 text-cyan-300 break-all select-all">
            {decodeUrl(inputText)}
          </div>
        </div>

        {/* Base64 Decode */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 flex flex-col">
          <span className="text-slate-400 font-bold mb-1.5 uppercase text-[11px]">Base64 Decode</span>
          <div className="flex-1 bg-slate-950 p-2.5 rounded border border-slate-800 text-emerald-300 break-all select-all">
            {decodeBase64(inputText)}
          </div>
        </div>

        {/* Hex Conversion */}
        <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 flex flex-col">
          <span className="text-slate-400 font-bold mb-1.5 uppercase text-[11px]">String To Hex</span>
          <div className="flex-1 bg-slate-950 p-2.5 rounded border border-slate-800 text-amber-300 break-all font-mono select-all">
            {stringToHex(inputText)}
          </div>
        </div>
      </div>

      {/* JWT Token Structure Parser */}
      <div className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-3">
        <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
          <KeyRound className="w-4 h-4 text-amber-400" />
          <h3 className="font-bold text-slate-100 uppercase">JWT Structure Inspector</h3>
        </div>

        {jwtParsed ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* JWT Header */}
            <div className="bg-slate-950 border border-slate-800 rounded p-3">
              <span className="text-rose-400 font-bold mb-2 block uppercase border-b border-slate-800 pb-1">
                Header (Algorithm & Token Type)
              </span>
              <pre className="text-rose-300 whitespace-pre-wrap">{JSON.stringify(jwtParsed.header, null, 2)}</pre>
            </div>

            {/* JWT Payload */}
            <div className="bg-slate-950 border border-slate-800 rounded p-3">
              <span className="text-purple-400 font-bold mb-2 block uppercase border-b border-slate-800 pb-1">
                Payload (Claims & Expiration)
              </span>
              <pre className="text-purple-300 whitespace-pre-wrap">{JSON.stringify(jwtParsed.payload, null, 2)}</pre>
            </div>
          </div>
        ) : (
          <div className="text-slate-500 py-4 text-center">
            Input string is not a 3-part JWT token. Enter a valid JWT token above to inspect claims.
          </div>
        )}
      </div>
    </div>
  );
};
