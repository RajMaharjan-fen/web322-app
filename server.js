/*********************************************************************************
WEB322 – Assignment 02

I declare that this assignment is my own work.

Name: Raj Maharjan
Student ID: 162680235
Date: FEB 5,2025
Replit Web App URL: https://a2673d62-a909-4f67-98ae-168a927cbe2c-00-3fx40qplv98o1.spock.repl.co/
GitHub Repository URL: https://github.com/RajMaharjan-fen/web322-app
********************************************************************************/

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


