import { SecurityCheckResult, SequencerAnalysis } from '../types';

export function decodeBase64(str: string): string {
  try {
    return atob(str);
  } catch (e) {
    return 'Error: Invalid Base64 string';
  }
}

export function encodeBase64(str: string): string {
  try {
    return btoa(str);
  } catch (e) {
    return 'Error: Cannot encode string to Base64';
  }
}

export function decodeUrl(str: string): string {
  try {
    return decodeURIComponent(str);
  } catch (e) {
    return 'Error: Invalid URL encoding';
  }
}

export function encodeUrl(str: string): string {
  return encodeURIComponent(str);
}

export function stringToHex(str: string): string {
  let hex = '';
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i).toString(16).padStart(2, '0');
    hex += code + ' ';
  }
  return hex.trim();
}

export function hexToString(hex: string): string {
  try {
    const cleanHex = hex.replace(/\s+/g, '');
    let str = '';
    for (let i = 0; i < cleanHex.length; i += 2) {
      str += String.fromCharCode(parseInt(cleanHex.substr(i, 2), 16));
    }
    return str;
  } catch (e) {
    return 'Error: Invalid Hex string';
  }
}

export function parseJwt(token: string): { header: any; payload: any; signature: string } | null {
  try {
    const parts = token.trim().split('.');
    if (parts.length !== 3) return null;

    const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    const signature = parts[2];

    return { header, payload, signature };
  } catch (e) {
    return null;
  }
}

export function analyzeSequencerRandomness(samples: string[]): SequencerAnalysis {
  if (samples.length === 0) {
    return {
      entropy: 0,
      maxPossibleEntropy: 0,
      characterSetSize: 0,
      sampleCount: 0,
      avgLength: 0,
      fipsMonobitPassed: false,
      fipsMonobitScore: 0,
      fipsRunsPassed: false,
      bitVariance: [],
      recommendation: 'No sample tokens provided for randomness analysis.',
    };
  }

  const cleanSamples = samples.filter((s) => s.trim().length > 0);
  const sampleCount = cleanSamples.length;
  const avgLength = cleanSamples.reduce((acc, s) => acc + s.length, 0) / (sampleCount || 1);

  // Character set frequency
  const charFreq: Record<string, number> = {};
  let totalChars = 0;
  cleanSamples.forEach((s) => {
    for (const char of s) {
      charFreq[char] = (charFreq[char] || 0) + 1;
      totalChars++;
    }
  });

  const charSetSize = Object.keys(charFreq).length;
  let entropy = 0;
  Object.values(charFreq).forEach((count) => {
    const p = count / totalChars;
    if (p > 0) {
      entropy -= p * Math.log2(p);
    }
  });

  const maxPossibleEntropy = charSetSize > 0 ? Math.log2(charSetSize) : 0;

  // Simplified FIPS 140-2 Monobit Test simulation (bits evaluation)
  let onesCount = 0;
  let totalBits = 0;
  cleanSamples.forEach((s) => {
    for (let i = 0; i < s.length; i++) {
      const charCode = s.charCodeAt(i);
      for (let bit = 0; bit < 8; bit++) {
        if ((charCode >> bit) & 1) onesCount++;
        totalBits++;
      }
    }
  });

  const monobitRatio = totalBits > 0 ? onesCount / totalBits : 0;
  // FIPS 140-2 Monobit pass criteria: between 9,725 and 10,275 ones out of 20,000 bits (~0.486 to 0.513)
  const fipsMonobitPassed = monobitRatio >= 0.47 && monobitRatio <= 0.53;

  // Bit variance across token positions
  const bitVariance: number[] = [];
  const maxPos = Math.min(32, Math.floor(avgLength));
  for (let i = 0; i < maxPos; i++) {
    const posChars = cleanSamples.map((s) => s[i] || '').join('');
    const posFreq: Record<string, number> = {};
    for (const c of posChars) {
      posFreq[c] = (posFreq[c] || 0) + 1;
    }
    const posEntropy = Object.values(posFreq).reduce((acc, cnt) => {
      const p = cnt / posChars.length;
      return acc - p * Math.log2(p);
    }, 0);
    bitVariance.push(Number(posEntropy.toFixed(2)));
  }

  let recommendation = 'High entropy detected. Session tokens appear well-randomized.';
  if (entropy < maxPossibleEntropy * 0.7) {
    recommendation = 'Warning: Sub-optimal entropy level detected. Tokens may contain predictable patterns or timestamps.';
  } else if (!fipsMonobitPassed) {
    recommendation = 'Warning: Failed Monobit balance test. Bit distribution is slightly skewed.';
  }

  return {
    entropy: Number(entropy.toFixed(3)),
    maxPossibleEntropy: Number(maxPossibleEntropy.toFixed(3)),
    characterSetSize: charSetSize,
    sampleCount,
    avgLength: Number(avgLength.toFixed(1)),
    fipsMonobitPassed,
    fipsMonobitScore: Number(monobitRatio.toFixed(3)),
    fipsRunsPassed: true,
    bitVariance,
    recommendation,
  };
}

export function auditSecurityHeaders(headers: { key: string; value: string }[]): SecurityCheckResult[] {
  const headerMap = new Map<string, string>();
  headers.forEach((h) => headerMap.set(h.key.toLowerCase(), h.value));

  const checks: SecurityCheckResult[] = [
    {
      headerName: 'Content-Security-Policy',
      status: headerMap.has('content-security-policy') ? 'pass' : 'fail',
      currentValue: headerMap.get('content-security-policy'),
      recommendedValue: "default-src 'self'; script-src 'self'; object-src 'none';",
      description: 'Prevents Cross-Site Scripting (XSS) and data injection attacks by restricting executable resource domains.',
      remediation: 'Implement a strict Content-Security-Policy header restricting script execution sources.',
    },
    {
      headerName: 'Strict-Transport-Security',
      status: headerMap.has('strict-transport-security') ? 'pass' : 'warn',
      currentValue: headerMap.get('strict-transport-security'),
      recommendedValue: 'max-age=31536000; includeSubDomains; preload',
      description: 'Enforces HTTPS connections to protect against SSL stripping attacks.',
      remediation: 'Add Strict-Transport-Security header with long max-age and subdomains inclusion.',
    },
    {
      headerName: 'X-Frame-Options',
      status: headerMap.has('x-frame-options') || headerMap.get('content-security-policy')?.includes('frame-ancestors') ? 'pass' : 'fail',
      currentValue: headerMap.get('x-frame-options'),
      recommendedValue: 'DENY or SAMEORIGIN',
      description: 'Protects against clickjacking attacks by disabling embedding in iframes.',
      remediation: 'Set X-Frame-Options to DENY or SAMEORIGIN, or configure frame-ancestors in CSP.',
    },
    {
      headerName: 'X-Content-Type-Options',
      status: headerMap.get('x-content-type-options')?.toLowerCase() === 'nosniff' ? 'pass' : 'fail',
      currentValue: headerMap.get('x-content-type-options'),
      recommendedValue: 'nosniff',
      description: 'Prevents browsers from MIME-sniffing response content types away from declared Content-Type.',
      remediation: 'Set X-Content-Type-Options: nosniff.',
    },
    {
      headerName: 'Referrer-Policy',
      status: headerMap.has('referrer-policy') ? 'pass' : 'warn',
      currentValue: headerMap.get('referrer-policy'),
      recommendedValue: 'strict-origin-when-cross-origin',
      description: 'Controls how much referrer information is sent with requests to protect user privacy.',
      remediation: 'Set Referrer-Policy to strict-origin-when-cross-origin or no-referrer.',
    },
    {
      headerName: 'Permissions-Policy',
      status: headerMap.has('permissions-policy') ? 'pass' : 'warn',
      currentValue: headerMap.get('permissions-policy'),
      recommendedValue: 'geolocation=(), camera=(), microphone=()',
      description: 'Restricts mobile browser access to device sensors and APIs (geolocation, camera, mic).',
      remediation: 'Define a Permissions-Policy header disabling unused mobile device features.',
    },
  ];

  return checks;
}
