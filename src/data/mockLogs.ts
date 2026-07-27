import { HttpRequestLog } from '../types';

export const initialHttpLogs: HttpRequestLog[] = [
  {
    id: 'req-101',
    timestamp: '2026-07-27 00:14:10',
    method: 'GET',
    url: 'https://api.mobileapp.internal/v1/auth/session',
    host: 'api.mobileapp.internal',
    path: '/v1/auth/session',
    status: 200,
    statusText: 'OK',
    contentType: 'application/json',
    responseTimeMs: 42,
    sizeBytes: 618,
    requestHeaders: [
      { key: 'Host', value: 'api.mobileapp.internal' },
      { key: 'User-Agent', value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1' },
      { key: 'Accept', value: 'application/json' },
      { key: 'X-App-Version', value: '3.4.1-mobile' },
      { key: 'Authorization', value: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyXzk5ODg3NyIsIm5hbWUiOiJBbGV4IE1vcmdhbiIsImlhdCI6MTcyMjA0MjQwMCwiZXhwIjoxNzIyOTA2NDAwLCJpc3MiOiJhdXRoLm1vYmlsZWFwcC5pbnRlcm5hbCJ9.dF9zS21fRmV4X3BsZXNfU2lnbmF0dXJl' },
    ],
    requestBody: '',
    responseHeaders: [
      { key: 'HTTP/1.1', value: '200 OK' },
      { key: 'Content-Type', value: 'application/json; charset=utf-8' },
      { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate' },
      { key: 'Set-Cookie', value: 'session_id=s_98712398a1f; Secure; HttpOnly; SameSite=Lax' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
    ],
    responseBody: JSON.stringify(
      {
        status: 'active',
        userId: 'user_998877',
        role: 'mobile_user',
        permissions: ['read:profile', 'write:orders', 'mobile:biometrics'],
        sessionExpiresIn: 86400,
      },
      null,
      2
    ),
  },
  {
    id: 'req-102',
    timestamp: '2026-07-27 00:14:15',
    method: 'POST',
    url: 'https://api.mobileapp.internal/v1/user/checkout',
    host: 'api.mobileapp.internal',
    path: '/v1/user/checkout',
    status: 400,
    statusText: 'Bad Request',
    contentType: 'application/json',
    responseTimeMs: 115,
    sizeBytes: 342,
    requestHeaders: [
      { key: 'Host', value: 'api.mobileapp.internal' },
      { key: 'Content-Type', value: 'application/json' },
      { key: 'User-Agent', value: 'Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36' },
      { key: 'X-CSRF-Token', value: 'c_88a91b2c3d4e5f' },
    ],
    requestBody: JSON.stringify(
      {
        cartId: 'cart_5512',
        paymentMethodId: 'pm_card_visa',
        amount: 89.99,
        currency: 'USD',
        couponCode: "SUMMER2026' OR 1=1--",
      },
      null,
      2
    ),
    responseHeaders: [
      { key: 'HTTP/1.1', value: '400 Bad Request' },
      { key: 'Content-Type', value: 'application/json' },
      { key: 'X-Powered-By', value: 'Express' },
    ],
    responseBody: JSON.stringify(
      {
        error: 'Invalid parameter',
        code: 'PARAM_VALIDATION_FAILED',
        message: 'couponCode contains unauthorized special characters',
        details: { field: 'couponCode', input: "SUMMER2026' OR 1=1--" },
      },
      null,
      2
    ),
  },
  {
    id: 'req-103',
    timestamp: '2026-07-27 00:14:22',
    method: 'GET',
    url: 'https://api.mobileapp.internal/v1/catalog/items?category=electronics&limit=10',
    host: 'api.mobileapp.internal',
    path: '/v1/catalog/items',
    status: 200,
    statusText: 'OK',
    contentType: 'application/json',
    responseTimeMs: 28,
    sizeBytes: 1280,
    requestHeaders: [
      { key: 'Host', value: 'api.mobileapp.internal' },
      { key: 'User-Agent', value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5_1 like Mac OS X)' },
      { key: 'Accept', value: 'application/json' },
    ],
    requestBody: '',
    responseHeaders: [
      { key: 'HTTP/1.1', value: '200 OK' },
      { key: 'Content-Type', value: 'application/json' },
      { key: 'Access-Control-Allow-Origin', value: '*' },
    ],
    responseBody: JSON.stringify(
      {
        page: 1,
        total: 2,
        items: [
          { id: 'prod_01', name: 'Ultra-Fast Wireless Mobile Power Bank', price: 49.99, inStock: true },
          { id: 'prod_02', name: 'Noise-Canceling Wireless Earbuds', price: 129.99, inStock: true },
        ],
      },
      null,
      2
    ),
  },
  {
    id: 'req-104',
    timestamp: '2026-07-27 00:14:35',
    method: 'PUT',
    url: 'https://api.mobileapp.internal/v1/user/profile',
    host: 'api.mobileapp.internal',
    path: '/v1/user/profile',
    status: 200,
    statusText: 'OK',
    contentType: 'application/json',
    responseTimeMs: 85,
    sizeBytes: 410,
    requestHeaders: [
      { key: 'Host', value: 'api.mobileapp.internal' },
      { key: 'Content-Type', value: 'application/json' },
      { key: 'User-Agent', value: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5_1 like Mac OS X)' },
    ],
    requestBody: JSON.stringify(
      {
        displayName: 'Alex Morgan',
        email: 'alex.morgan@example.com',
        bio: 'Mobile Dev & Cyber Security Researcher',
      },
      null,
      2
    ),
    responseHeaders: [
      { key: 'HTTP/1.1', value: '200 OK' },
      { key: 'Content-Type', value: 'application/json' },
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
    ],
    responseBody: JSON.stringify(
      {
        success: true,
        updatedAt: '2026-07-27T00:14:35Z',
        profile: {
          displayName: 'Alex Morgan',
          email: 'alex.morgan@example.com',
          bio: 'Mobile Dev & Cyber Security Researcher',
        },
      },
      null,
      2
    ),
  },
];
