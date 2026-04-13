const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

const MIME = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.txt': 'text/plain',
    '.xml': 'application/xml',
};

// Clean URL routing: /services → services.html, / → index.html
function resolveFile(urlPath) {
    if (urlPath === '/') return path.join(__dirname, 'index.html');

    // Try exact file first
    const exact = path.join(__dirname, urlPath);
    if (fs.existsSync(exact) && fs.statSync(exact).isFile()) return exact;

    // Try with .html extension (clean URLs)
    const withHtml = path.join(__dirname, urlPath + '.html');
    if (fs.existsSync(withHtml)) return withHtml;

    // Try index.html in directory
    const indexInDir = path.join(__dirname, urlPath, 'index.html');
    if (fs.existsSync(indexInDir)) return indexInDir;

    return null;
}

const server = http.createServer((req, res) => {
    // HTTPS redirect — Railway terminates SSL at edge, forwards x-forwarded-proto
    if (req.headers['x-forwarded-proto'] === 'http') {
        const host = req.headers.host || 'flowstate.help';
        res.writeHead(301, { 'Location': `https://${host}${req.url}` });
        res.end();
        return;
    }

    const urlPath = req.url.split('?')[0].split('#')[0];

    // Security: prevent directory traversal
    if (urlPath.includes('..')) {
        res.writeHead(403);
        res.end('Forbidden');
        return;
    }

    const filePath = resolveFile(urlPath);

    if (!filePath) {
        // 404 — serve index.html for SPA-like behavior
        res.writeHead(404, { 'Content-Type': 'text/html' });
        res.end('<h1>404 — Not Found</h1><p><a href="/">Back to Flowstate</a></p>');
        return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME[ext] || 'application/octet-stream';

    // Cache static assets for 1 day, HTML for 1 hour
    const cacheControl = ext === '.html'
        ? 'public, max-age=3600'
        : 'public, max-age=86400';

    fs.readFile(filePath, (err, data) => {
        if (err) {
            res.writeHead(500);
            res.end('Internal Server Error');
            return;
        }

        res.writeHead(200, {
            'Content-Type': contentType,
            'Cache-Control': cacheControl,
            'X-Content-Type-Options': 'nosniff',
        });
        res.end(data);
    });
});

server.listen(PORT, () => {
    console.log(`Flowstate site running on port ${PORT}`);
});
