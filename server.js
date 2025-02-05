const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.static('public'));

app.get('/', (req, res) => res.redirect('/about'));
app.get('/about', (req, res) => res.sendFile(path.join(__dirname, 'views/about.html')));

app.listen(PORT, () => {
    console.log(`Express http server listening on port ${PORT}`);
});
