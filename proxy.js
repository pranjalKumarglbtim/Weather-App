const http = require('http');
const https = require('https');

const PROXY_PORT = 3333;
const API_KEY = '835566cab665b00aece32763b4d922b0';

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parts = req.url.split('?');
  const path = parts[0];
  const query = parts[1];
  
  let targetUrl;
  if (path === '/weather') {
    targetUrl = `https://api.openweathermap.org/data/2.5/weather?${query || ''}&appid=${API_KEY}`;
  } else if (path === '/forecast') {
    targetUrl = `https://api.openweathermap.org/data/2.5/forecast?${query || ''}&appid=${API_KEY}`;
  } else {
    res.writeHead(404);
    res.end('{"error":"Not found"}');
    return;
  }
  
  https.get(targetUrl, (apiRes) => {
    res.writeHead(apiRes.statusCode);
    apiRes.pipe(res);
  }).on('error', (e) => {
    res.writeHead(500);
    res.end('{"error":"Proxy failed"}');
  });
});

server.listen(PROXY_PORT, () => {
  console.log('Proxy running on port 3333');
});