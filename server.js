// server.js
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const apiRoutes = require('./api');

// Utilisation des endpoints API sous le préfixe /api
app.use('/api', apiRoutes);

// Servir tous les fichiers statiques depuis la racine
app.use(express.static(__dirname));

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
