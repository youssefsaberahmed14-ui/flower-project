const express = require('express');
const http = require('http');
const app = express();
app.use(express.static(process.cwd()));
app.get('/api/products', (req, res) => res.json({ ok: true }));
const server = app.listen(3002, () => {
  http.get('http://localhost:3002/api/products', (res) => {
    console.log('status', res.statusCode);
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
      console.log('body', body);
      server.close();
    });
  }).on('error', (err) => {
    console.error('error', err.message);
    server.close();
  });
});