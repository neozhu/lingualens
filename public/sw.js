// Empty service worker to prevent 404 errors
// Browsers automatically request this file to check for PWA capabilities

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', () => {
  self.clients.claim();
});
