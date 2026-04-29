// Shim to start the ES module server entrypoint when hosts invoke `node index.js`.
(async () => {
  try {
    await import('./server/src/server.js');
  } catch (err) {
    console.error('Failed to start server from index.js shim:', err);
    process.exit(1);
  }
})();
