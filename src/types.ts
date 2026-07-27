export type ModuleTab = 'history' | 'sitemap' | 'intercept' | 'repeater' | 'intruder' | 'decoder' | 'sequencer' | 'auditor' | 'rules' | 'mobile-guide';

export interface HttpHeader {
  key: string;
  value: string;
}

export interface HttpRequestLog {
  id: string;
  timestamp: string;
  method: string;
  url: string;
  host: string;
  path: string;
  status: number;
  statusText: string;
  contentType: string;
  responseTimeMs: number;
  sizeBytes: number;
  requestHeaders: HttpHeader[];
  requestBody: string;
  responseHeaders: HttpHeader[];
  responseBody: string;
  isIntercepted?: boolean;
}

export interface InterceptQueueItem {
  id: string;
  timestamp: string;
  method: string;
  url: string;
  headers: HttpHeader[];
  body: string;
}

export interface MatchReplaceRule {
  id: string;
  name: string;
  enabled: boolean;
  type: 'request_header' | 'request_body' | 'response_header';
  match: string;
  replace: string;
}

export interface SiteMapNode {
  host: string;
  paths: {
    path: string;
    methods: string[];
    logIds: string[];
  }[];
}

export interface RepeaterTab {
  id: string;
  title: string;
  method: string;
  url: string;
  headers: HttpHeader[];
  body: string;
  response?: {
    status: number;
    statusText: string;
    timeMs: number;
    sizeBytes: number;
    headers: HttpHeader[];
    body: string;
  };
}

export type IntruderMode = 'sniper' | 'battering_ram' | 'pitchfork' | 'cluster_bomb';

export interface IntruderPayloadPosition {
  start: number;
  end: number;
  name: string;
}

export interface IntruderResult {
  id: number;
  payloads: string[];
  status: number;
  statusText: string;
  timeMs: number;
  lengthBytes: number;
  matchedPattern?: string;
}

export interface JwtHeader {
  alg: string;
  typ: string;
  [key: string]: any;
}

export interface JwtPayload {
  sub?: string;
  name?: string;
  iat?: number;
  exp?: number;
  iss?: string;
  [key: string]: any;
}

export interface SequencerAnalysis {
  entropy: number;
  maxPossibleEntropy: number;
  characterSetSize: number;
  sampleCount: number;
  avgLength: number;
  fipsMonobitPassed: boolean;
  fipsMonobitScore: number;
  fipsRunsPassed: boolean;
  bitVariance: number[];
  recommendation: string;
}

export interface SecurityCheckResult {
  headerName: string;
  status: 'pass' | 'fail' | 'warn';
  currentValue?: string;
  recommendedValue: string;
  description: string;
  remediation: string;
}
