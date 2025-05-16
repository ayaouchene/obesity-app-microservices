const express = require('express');
   const { createProxyMiddleware } = require('http-proxy-middleware');

   const app = express();

   // Proxy pour auth-service
   app.use(
     '/api/auth',
     createProxyMiddleware({
       target: 'http://auth-service:5000',
       changeOrigin: true,
     })
   );

   // Proxy pour users (nouveau)
   app.use(
     '/api/users',
     createProxyMiddleware({
       target: 'http://auth-service:5000',
       changeOrigin: true,
     })
   );

   // Proxy pour chat-service
   app.use(
     '/api/chat',
     createProxyMiddleware({
       target: 'http://chat-service:5002',
       changeOrigin: true,
     })
   );

   // Proxy pour appointment-service
   app.use(
     '/api/appointments',
     createProxyMiddleware({
       target: 'http://appointment-service:5001',
       changeOrigin: true,
     })
   );
   app.use(
     '/api/assessments',
     createProxyMiddleware({
       target: 'http://appointment-service:5001',
       changeOrigin: true,
     })
   );
    app.use(
  '/api/chat',
  createProxyMiddleware({
    target: 'http://chat-service:5002',
    changeOrigin: true,
    pathRewrite: { '^/api/chat': '/api/chat' },
    ws: true, 
  })
);

   const PORT = process.env.PORT || 3000;
   app.listen(PORT, () => {
     console.log(`🌐 Gateway API running on port ${PORT}`);
   });