//Install express server
const express = require('express');
const path = require('path');

const app = express();
const distPath = path.join(__dirname, 'dist', 'AppPalma');
const baseHref = process.env.BASE_HREF || '/';
const mountPath = baseHref === '/' ? '/' : `/${baseHref.replace(/^\/+|\/+$/g, '')}`;

// Serve only the static files form the dist directory
if (mountPath === '/') {
  app.use(express.static(distPath));

  app.get('/*', function(_, res) {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  app.use(mountPath, express.static(distPath));

  app.get('/', function(_, res) {
    res.redirect(`${mountPath}/`);
  });

  app.get(`${mountPath}/*`, function(_, res) {
    res.sendFile(path.join(distPath, 'index.html'));
  });

  app.get('/*', function(_, res) {
    res.redirect(`${mountPath}/`);
  });
}

// Start the app by listening on the default Heroku port
app.listen(process.env.PORT || 8080);
