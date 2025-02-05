const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;


app.use(express.static('public'));

app.get('/', (req, res) => res.redirect('/about'));
app.get('/about', (req, res) => res.sendFile(path.join(__dirname, 'views/about.html')));




const storeService = require('./store-service');

app.get('/shop', (req, res) => {
    storeService.getPublishedItems()
        .then(items => res.json(items))
        .catch(err => res.status(404).json({ message: err }));
});

app.get('/items', (req, res) => {
    storeService.getAllItems()
        .then(items => res.json(items))
        .catch(err => res.status(404).json({ message: err }));
});

app.get('/categories', (req, res) => {
    storeService.getCategories()
        .then(categories => res.json(categories))
        .catch(err => res.status(404).json({ message: err }));
});

app.use((req, res) => {
    res.status(404).send("Page Not Found");
});

storeService.initialize()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch(err => {
        console.log("Error initializing store service:", err);
    });


